globalThis.process.version = '1.1.1'

import 'react-native-gesture-handler'
import { Platform } from 'react-native'
import firebase from '@react-native-firebase/app'
import '@react-native-firebase/auth'
import '@react-native-firebase/functions'
import * as Sentry from '@sentry/react-native'
import { normalizeUrl } from '@worldbrain/memex-url-utils'
import { MemexSyncDevicePlatform } from '@worldbrain/memex-common/lib/sync/types'
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
import { sentryDsn } from '../app.json'
import {
    createStorage,
    setStorageMiddleware,
    createServerStorage,
} from './storage'
import { createCoreServices } from './services'
import {
    setupBackgroundSync,
    setupFirebaseAuth,
    setupContinuousSync,
} from './services/setup'
import { UI } from './ui'
import { createFirebaseSignalTransport } from './services/sync/signalling'
import { StorageService } from './services/settings-storage'
import { ErrorTrackingService } from './services/error-tracking'
import SyncService from './services/sync'
import { MockSentry } from './services/error-tracking/index.tests'
import { KeychainPackage } from './services/keychain/keychain'
import { runMigrations } from 'src/utils/quick-and-dirty-migrations'
import { Services } from './services/types'
import { createSelfTests } from 'src/tests/self-tests'

if (!process.nextTick) {
    process.nextTick = setImmediate
}

export async function main() {
    const ui = new UI()

    const sentry = __DEV__ ? (new MockSentry() as any) : Sentry
    const errorTracker = new ErrorTrackingService(sentry, { dsn: sentryDsn })

    if (process.env['USE_FIREBASE_EMULATOR']) {
        console.log('DEBUG: attempting connect to Firebase emulator')
        const emulatorAddress = '10.0.2.2' // TODO: this address works on Android emulators - need to differentiate for iOS + real devices
        const getEmulatorAddress = (args: {
            port: number
            noProtocol?: boolean
        }) =>
            args.noProtocol
                ? `${emulatorAddress}:${args.port}`
                : `http://${emulatorAddress}:${args.port}`

        await firebase.firestore().settings({
            host: getEmulatorAddress({ port: 8080, noProtocol: true }),
            ssl: false,
            ignoreUndefinedProperties: true,
        })
        firebase.database().useEmulator(emulatorAddress, 9000)
        firebase.auth().useEmulator(getEmulatorAddress({ port: 9099 }))
        firebase
            .functions()
            .useFunctionsEmulator(getEmulatorAddress({ port: 5001 }))
    }

    const coreServices = await createCoreServices({
        keychain: new KeychainPackage({ server: 'worldbrain.io' }),
        normalizeUrl,
        errorTracker,
        firebase,
    })
    const serverStorage = await createServerStorage()
    const storage = await createStorage({
        services: coreServices,
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
                getCurrentSchemaVersion: () =>
                    getCurrentSchemaVersion(storageManager),
                userChanges: () => authChanges(services.auth),
                getUserChangesReference: async () => {
                    const currentUser = await services.auth.getCurrentUser()
                    if (!currentUser) {
                        return null
                    }
                    const firestore = firebase.firestore()
                    return firestore
                        .collection('personalDataChange')
                        .doc(currentUser.id)
                        .collection('objects') as any
                },
                getLastUpdateSeenTime: () =>
                    localSettings.getSetting({ key: 'lastSeenUpdateTime' }),
                setLastUpdateSeenTime: (value) =>
                    localSettings.setSetting({
                        key: 'lastSeenUpdateTime',
                        value,
                    }),
                getDeviceId,
            }),
        createDeviceId: async (userId) => {
            const device = await serverStorage.modules.personalCloud.createDeviceInfo(
                {
                    device: {
                        os: PersonalDeviceOs.IOS,
                        type: PersonalDeviceType.Mobile,
                        product: PersonalDeviceProduct.MobileApp,
                    },
                    userId,
                },
            )
            return device.id
        },
    })

    const localStorage = new StorageService({
        settingsStorage: storage.modules.localSettings,
    })

    const syncStorage = new StorageService({
        settingsStorage: storage.modules.syncSettings,
    })

    const syncService = new SyncService({
        devicePlatform: Platform.OS as MemexSyncDevicePlatform,
        signalTransportFactory: createFirebaseSignalTransport,
        storageManager: storage.manager,
        clientSyncLog: storage.modules.clientSyncLog,
        syncInfoStorage: storage.modules.syncInfo,
        getSharedSyncLog: async () => serverStorage.modules.sharedSyncLog,
        errorTracker,
        localStorage,
        auth: coreServices.auth,
    })

    const services: Services = {
        ...coreServices,
        sync: syncService,
        localStorage,
        syncStorage,
    }

    const dependencies = { storage, services }

    await setStorageMiddleware(dependencies)
    await setupBackgroundSync(dependencies)
    await setupFirebaseAuth(dependencies)
    await setupContinuousSync(dependencies)

    await storage.modules.personalCloud.setup()

    await runMigrations(dependencies)

    ui.initialize({ dependencies })
    const selfTests = createSelfTests({
        storageManager: storage.manager,
        storageModules: storage.modules,
        services,
        getServerStorageManager: async () => serverStorage.manager,
    })
    await localStorage.set('@MemexApp_sync-key', true)
    // await selfTests.cloudReceive()
    Object.assign(globalThis, {
        ...dependencies,
        selfTests,
    })
}
