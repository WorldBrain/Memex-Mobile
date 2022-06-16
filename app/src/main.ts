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

if (!process.nextTick) {
    process.nextTick = setImmediate
}

// console.disableYellowBox = true

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

    const authService = new MemexGoAuthService(firebase as any)
    const serverStorage = await createServerStorage('firebase')
    const storage = await createStorage({
        authService,
        errorTrackingService,
        typeORMConnectionOpts: {
            type: 'react-native',
            location: 'Shared',
            database: 'memex',
        },
        createPersonalCloudBackend: (
            storageManager,
            { localSettings },
            getDeviceId,
        ) =>
            new FirestorePersonalCloudBackend({
                personalCloudService: firebaseService<PersonalCloudService>(
                    'personalCloud',
                    async (name, ...args) => {
                        const callable = firebase
                            .functions()
                            .httpsCallable(name)
                        const result = await callable(...args)
                        return result.data
                    },
                ),
                getServerStorageManager: async () => serverStorage.manager,
                getCurrentSchemaVersion: () =>
                    getCurrentSchemaVersion(storageManager),
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
                    localSettings.getSetting({
                        key: storageKeys.lastSeenUpdateTime,
                    }),
                getClientDeviceType: () => PersonalDeviceType.Mobile,
                getDeviceId,
                getFirebase: () => firebase as any,
            }),
        createDeviceId: async (userId) => {
            const device =
                await serverStorage.modules.personalCloud.createDeviceInfo({
                    device: {
                        os:
                            Platform.OS === 'android'
                                ? PersonalDeviceOs.Android
                                : PersonalDeviceOs.IOS,
                        type: PersonalDeviceType.Mobile,
                        product: PersonalDeviceProduct.MobileApp,
                        browser: 'NULL', // TODO: Remove this once staging is updated
                    },
                    userId,
                })
            return device.id
        },
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
    })

    const dependencies = { storage, services }

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
