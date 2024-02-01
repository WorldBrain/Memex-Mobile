import 'react-native-gesture-handler'
import { Platform } from 'react-native'
import * as Sentry from '@sentry/react-native'
import { normalizeUrl } from '@worldbrain/memex-url-utils'
import FirebasePersonalCloudBackend from '@worldbrain/memex-common/lib/personal-cloud/backend/firebase'
import type {
    PersonalCloudDeviceId,
    PersonalCloudService,
} from '@worldbrain/memex-common/lib/personal-cloud/backend/types'
import { authChangesGeneratorFactory } from '@worldbrain/memex-common/lib/authentication/utils'
import { getCurrentSchemaVersion } from '@worldbrain/memex-common/lib/storage/utils'
import { firebaseService } from '@worldbrain/memex-common/lib/firebase-backend/services/client'
import {
    PersonalDeviceType,
    PersonalDeviceOs,
    PersonalDeviceProduct,
} from '@worldbrain/memex-common/lib/personal-cloud/storage/types'

import './polyfills'
import { sentryDsn, storageKeys } from '../app.json'
import {
    getFirebase,
    connectToEmulator,
    reactNativeFBToAuthFBDeps,
    reactNativeFBToCloudBackendFBDeps,
} from 'src/firebase'
import {
    createStorage,
    setStorageMiddleware,
    createServerStorage,
} from './storage'
import { createServices } from './services'
import { setupFirebaseAuth } from './services/setup'
import { UI } from './ui'
import { ErrorTrackingService } from './services/error-tracking'
import { MemexGoAuthService } from './services/auth'
import { MockSentry } from './services/error-tracking/index.tests'
import { KeychainPackage } from './services/keychain/keychain'
import { migrateSettings } from 'src/utils/migrate-settings-for-cloud'
import { createSelfTests } from 'src/tests/self-tests'
// import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake'
import type { UIDependencies } from './ui/types'
import { initFirestoreSyncTriggerListener } from '@worldbrain/memex-common/lib/personal-cloud/backend/utils'
import { deviceIdCreatorFactory } from '@worldbrain/memex-common/lib/personal-cloud/storage/device-id'

if (!process.nextTick) {
    process.nextTick = setImmediate
}

// NOTE: There seems to be some serialization difference when calling FB functions via React Native FB,
//   resulting in Date objects turning into the empty object `{}` when sent as function params. This gets around that.
//   Servers-side there's already catches for string-serialized Dates like this.
const serializeDateForFBFunction = (date?: Date): any => {
    if (!date?.toISOString || typeof date === 'string') {
        return date
    }
    return date.toISOString()
}

export async function main() {
    const ui = new UI()

    const sentry = __DEV__ ? (new MockSentry() as any) : Sentry
    const errorTrackingService = new ErrorTrackingService(sentry, {
        dsn: sentryDsn,
    })

    if (process.env['USE_FIREBASE_EMULATOR']) {
        await connectToEmulator()
    }
    const firebase = getFirebase()
    const generateServerId = (collectionName: string) =>
        getFirebase().firestore().collection(collectionName).doc().id

    let personalCloudBackend: FirebasePersonalCloudBackend

    const authService = new MemexGoAuthService({
        firebase: reactNativeFBToAuthFBDeps(firebase),
    })
    authService.setupOnChangedListener((user) =>
        errorTrackingService.setUser(user),
    )

    const serverStorage = await createServerStorage(firebase)

    const createDeviceId = deviceIdCreatorFactory({
        serverStorage: {
            personalCloud: serverStorage.modules.personalCloud,
        },
        personalDeviceInfo: {
            os:
                Platform.OS === 'android'
                    ? PersonalDeviceOs.Android
                    : PersonalDeviceOs.IOS,
            type: PersonalDeviceType.Mobile,
            product: PersonalDeviceProduct.MobileApp,
        },
    })
    const getDeviceId = () =>
        storage.modules.localSettings.getSetting<PersonalCloudDeviceId>({
            key: storageKeys.deviceId,
        })

    const authChangesGenerator = authChangesGeneratorFactory({
        authService,
        createDeviceId,
        getDeviceId,
        setDeviceId: (value) =>
            storage.modules.localSettings.setSetting({
                key: storageKeys.deviceId,
                value,
            }),
    })

    const storage = await createStorage({
        authService,
        createDeviceId,
        uploadClientUpdates: async (updates) => {
            await personalCloudBackend?.pushUpdates(
                updates.map((update) => ({
                    ...update,
                    schemaVersion: serializeDateForFBFunction(
                        update.schemaVersion,
                    ),
                })),
            )
        },
        typeORMConnectionOpts: {
            type: 'react-native',
            location: 'Shared',
            database: 'memex',
        },
    })

    personalCloudBackend = new FirebasePersonalCloudBackend({
        personalCloudService: firebaseService<PersonalCloudService>(
            'personalCloud',
            async (name, ...args) => {
                const callable = firebase.functions().httpsCallable(name)
                const result = await callable(...args)
                return result.data
            },
        ),
        serverStorageManager: serverStorage.manager,
        getCurrentSchemaVersion: () =>
            serializeDateForFBFunction(
                getCurrentSchemaVersion(storage.manager),
            ),
        authChanges: authChangesGenerator,
        getDeviceId,
        getLastUpdateProcessedTime: () =>
            storage.modules.localSettings.getSetting({
                key: storageKeys.syncLastProcessedTime,
            }),
        getLastCollectionDataProcessedTime: () =>
            storage.modules.localSettings.getSetting({
                key: storageKeys.retroSyncLastProcessedTime,
            }),
        getClientDeviceType: () => PersonalDeviceType.Mobile,
        firebase: reactNativeFBToCloudBackendFBDeps(firebase),
        setupSyncTriggerListener: initFirestoreSyncTriggerListener(
            firebase as any,
        ),
    })

    const services = await createServices({
        keychain: new KeychainPackage({ server: 'worldbrain.io' }),
        keepAwakeLib: {
            // activate: activateKeepAwake,
            // deactivate: deactivateKeepAwake,
            activate: () => null,
            deactivate: () => null,
        },
        auth: authService,
        normalizeUrl,
        errorTracker: errorTrackingService,
        firebase,
        storage,
        serverStorage,
        personalCloudBackend,
        generateServerId,
    })

    const dependencies: UIDependencies = { storage, services }

    await storage.modules.personalCloud.setup()
    await setStorageMiddleware(dependencies)
    // NOTE: This never worked as expected on both platforms and on Android it was the cause of this bug where the
    //  app would crash after ~10 mins because of a Java Double->String casting error.
    // await setupBackgroundSync(dependencies)
    await setupFirebaseAuth(dependencies)
    await migrateSettings(services)

    ui.initialize({ dependencies })
    const selfTests = createSelfTests({
        services,
        storageManager: storage.manager,
        storageModules: storage.modules,
        getServerStorageManager: async () => serverStorage.manager,
    })

    Object.assign(globalThis, {
        ...dependencies,
        selfTests,
    })
}
