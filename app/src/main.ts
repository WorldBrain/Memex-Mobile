import 'react-native-gesture-handler'
import { Platform } from 'react-native'
import * as Sentry from '@sentry/react-native'
import { normalizeUrl } from '@worldbrain/memex-url-utils'
import FirestorePersonalCloudBackend from '@worldbrain/memex-common/lib/personal-cloud/backend/firestore'
import type { PersonalCloudService } from '@worldbrain/memex-common/lib/personal-cloud/backend/types'
import { authChanges } from '@worldbrain/memex-common/lib/authentication/utils'
import { getCurrentSchemaVersion } from '@worldbrain/memex-common/lib/storage/utils'
import { firebaseService } from '@worldbrain/memex-common/lib/firebase-backend/services/client'
import {
    PersonalDeviceType,
    PersonalDeviceOs,
    PersonalDeviceProduct,
} from '@worldbrain/memex-common/lib/personal-cloud/storage/types'

import './polyfills'
import { sentryDsn, storageKeys } from '../app.json'
import { getFirebase, connectToEmulator } from 'src/firebase'
import {
    createStorage,
    setStorageMiddleware,
    createServerStorage,
} from './storage'
import { createServices } from './services'
import { setupBackgroundSync, setupFirebaseAuth } from './services/setup'
import { UI } from './ui'
import { ErrorTrackingService } from './services/error-tracking'
import { MemexGoAuthService } from './services/auth'
import { MockSentry } from './services/error-tracking/index.tests'
import { KeychainPackage } from './services/keychain/keychain'
import { migrateSettings } from 'src/utils/migrate-settings-for-cloud'
import { createSelfTests } from 'src/tests/self-tests'
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake'
import type { UIDependencies } from './ui/types'

if (!process.nextTick) {
    process.nextTick = setImmediate
}

console.disableYellowBox = true

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

    let personalCloudBackend: FirestorePersonalCloudBackend

    const authService = new MemexGoAuthService(firebase as any)
    const serverStorage = await createServerStorage(firebase)
    const storage = await createStorage({
        authService,
        uploadClientUpdates: async (updates) => {
            await personalCloudBackend?.pushUpdates(updates)
        },
        typeORMConnectionOpts: {
            type: 'react-native',
            location: 'Shared',
            database: 'memex',
        },
        createDeviceId: async (userId) => {
            const device = await serverStorage.modules.personalCloud.createDeviceInfo(
                {
                    device: {
                        os:
                            Platform.OS === 'android'
                                ? PersonalDeviceOs.Android
                                : PersonalDeviceOs.IOS,
                        type: PersonalDeviceType.Mobile,
                        product: PersonalDeviceProduct.MobileApp,
                    },
                    userId,
                },
            )
            return device.id
        },
    })

    personalCloudBackend = new FirestorePersonalCloudBackend({
        personalCloudService: firebaseService<PersonalCloudService>(
            'personalCloud',
            async (name, ...args) => {
                const callable = firebase.functions().httpsCallable(name)
                const result = await callable(...args)
                return result.data
            },
        ),
        getServerStorageManager: async () => serverStorage.manager,
        getCurrentSchemaVersion: () => getCurrentSchemaVersion(storage.manager),
        userChanges: () => authChanges(authService),
        getUserChangesReference: async () => {
            const currentUser = await authService.getCurrentUser()
            if (!currentUser) {
                return null
            }
            const firestore = firebase.firestore()
            return firestore
                .collection('personalDataChange')
                .doc(currentUser.id)
                .collection('objects') as any
        },
        getLastUpdateProcessedTime: () =>
            storage.modules.localSettings.getSetting({
                key: storageKeys.syncLastProcessedTime,
            }),
        getLastCollectionDataProcessedTime: () =>
            storage.modules.localSettings.getSetting({
                key: storageKeys.retroSyncLastProcessedTime,
            }),
        getClientDeviceType: () => PersonalDeviceType.Mobile,
        getDeviceId: () =>
            storage.modules.localSettings.getSetting({
                key: storageKeys.deviceId,
            })!,
        getFirebase: () => firebase as any,
    })

    const services = await createServices({
        keychain: new KeychainPackage({ server: 'worldbrain.io' }),
        keepAwakeLib: {
            activate: activateKeepAwake,
            deactivate: deactivateKeepAwake,
        },
        auth: authService,
        normalizeUrl,
        errorTracker: errorTrackingService,
        firebase,
        storage,
        personalCloudBackend,
        generateServerId,
        contentSharingServerStorage: serverStorage.modules.contentSharing,
    })

    const dependencies: UIDependencies = { storage, services }

    await storage.modules.personalCloud.setup()
    await setStorageMiddleware(dependencies)
    await setupBackgroundSync(dependencies)
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
