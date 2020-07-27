const wrtc = require('wrtc')
import StorageManager from '@worldbrain/storex'
import { registerModuleMapCollections } from '@worldbrain/storex-pattern-modules'
import { SharedSyncLogStorage } from '@worldbrain/storex-sync/lib/shared-sync-log/storex'
import { DexieStorageBackend } from '@worldbrain/storex-backend-dexie'
import { normalizeUrl } from '@worldbrain/memex-url-utils'
import inMemory from '@worldbrain/storex-backend-dexie/lib/in-memory'
import { MemoryAuthService } from '@worldbrain/memex-common/lib/authentication/memory'
import { MemorySignalTransportManager } from 'simple-signalling/lib/memory'
import { createStorage, setStorageMiddleware } from 'src/storage'
import { Storage } from 'src/storage/types'
import { createServices } from './services'
import { Services } from './services/types'
import { LocalStorageService } from './services/local-storage'
import { MockSentry } from './services/error-tracking/index.tests'
import { ErrorTrackingService } from './services/error-tracking'
import { FakeNavigation } from './tests/navigation'
import { MockSettingsStorage } from './features/settings/storage/mock-storage'
import { MockKeychainPackage } from './services/keychain/mock-keychain-package'
import { registerSingleDeviceSyncTests } from './services/sync/index.tests'
import { StorageOperationEvent } from '@worldbrain/storex-middleware-change-watcher/lib/types'

export interface TestDevice {
    storage: Storage
    services: Services
    navigation: FakeNavigation
    auth: MemoryAuthService
}
export type MultiDeviceTestFunction = (
    context: MultiDeviceTestContext,
) => Promise<void>
export interface MultiDeviceTestContext {
    createDevice: TestDeviceFactory
}
export type TestDeviceFactory = (options?: {
    debugSql?: boolean
    extraPostChangeWatcher?: (
        context: StorageOperationEvent<'post'>,
    ) => void | Promise<void>
}) => Promise<TestDevice>

export interface SingleDeviceTestOptions {
    debugSql?: boolean
    mark?: boolean
}
export type SingleDeviceTestFunction = (device: TestDevice) => Promise<void>
export type SingleDeviceTestFactory = ((
    description: string,
    test?: SingleDeviceTestFunction,
) => void) &
    ((
        description: string,
        options: SingleDeviceTestOptions,
        test: SingleDeviceTestFunction,
    ) => void)

/*
 * Multiple tests throw errors running on the same TypeORM connection. So give each test a different
 *  connection name.
 * Manually calling `this.connection.close()` in the TypeORM backend after the test is run
 *  does not seem to help.
 */
let connIterator = 0

export function makeStorageTestFactory() {
    const factory: SingleDeviceTestFactory = (
        description: string,
        testOrOptions?: SingleDeviceTestOptions | SingleDeviceTestFunction,
        maybeTest?: SingleDeviceTestFunction,
    ) => {
        const test =
            typeof testOrOptions === 'function' ? testOrOptions : maybeTest
        const options =
            typeof testOrOptions !== 'function' ? testOrOptions || {} : {}

        if (!test) {
            ;(it as any).todo(description)
            return
        }

        describe(description, () => {
            it(
                maybeMarkTestDescription(
                    'should work on a single device',
                    options?.mark,
                ),
                async function(this: any) {
                    const storage = await createStorage({
                        typeORMConnectionOpts: {
                            type: 'sqlite',
                            database: ':memory:',
                            name: `connection-${connIterator++}`,
                            logging: options.debugSql,
                        },
                    })

                    const signalTransportFactory = lazyMemorySignalTransportFactory()
                    const sharedSyncLog = await createMemorySharedSyncLog()

                    const navigation = new FakeNavigation()
                    const auth = new MemoryAuthService()
                    const localStorage = new LocalStorageService({
                        settingsStorage: new MockSettingsStorage(),
                    })
                    const errorTracker = new ErrorTrackingService(
                        new MockSentry() as any,
                        { dsn: 'test.com' },
                    )
                    const services = await createServices({
                        devicePlatform: 'integration-tests',
                        storage,
                        normalizeUrl,
                        signalTransportFactory,
                        sharedSyncLog,
                        localStorage,
                        errorTracker,
                        disableSyncEncryption: true,
                        keychain: new MockKeychainPackage(),
                        firebase: {} as any,
                        auth,
                    })
                    await setStorageMiddleware({
                        services,
                        storage,
                    })
                    services.sync.initialSync.wrtc = wrtc

                    try {
                        await test.call(this, {
                            storage,
                            services,
                            navigation,
                            auth,
                        })
                    } finally {
                    }
                },
            )

            registerSingleDeviceSyncTests(test, { mark: options?.mark })
        })
    }

    return factory
}

export function makeMultiDeviceTestFactory() {
    function factory(
        description: string,
        test?: MultiDeviceTestFunction,
    ): void {
        if (!test) {
            ;(it as any).todo(description)
            return
        }

        it(description, async function(this: any) {
            const signalTransportFactory = lazyMemorySignalTransportFactory()
            const createdDevices: Array<{
                storage: Storage
                services: Services
            }> = []
            const sharedSyncLog = await createMemorySharedSyncLog()

            const createDevice: TestDeviceFactory = async options => {
                const storage = await createStorage({
                    typeORMConnectionOpts: {
                        type: 'sqlite',
                        database: ':memory:',
                        name: `connection-${connIterator++}`,
                        logging: !!(options && options.debugSql),
                    },
                })

                const navigation = new FakeNavigation()
                const auth = new MemoryAuthService()
                const localStorage = new LocalStorageService({
                    settingsStorage: new MockSettingsStorage(),
                })
                const errorTracker = new ErrorTrackingService(
                    new MockSentry() as any,
                    { dsn: 'test.com' },
                )
                const services = await createServices({
                    devicePlatform: 'integration-tests',
                    auth,
                    storage,
                    signalTransportFactory,
                    sharedSyncLog,
                    localStorage,
                    errorTracker,
                    disableSyncEncryption: true,
                    keychain: new MockKeychainPackage(),
                })
                await setStorageMiddleware({
                    services,
                    storage,
                    extraPostChangeWatcher: options?.extraPostChangeWatcher,
                })
                services.sync.initialSync.wrtc = wrtc

                const device = { storage, services, auth, navigation }
                createdDevices.push(device)
                return device
            }

            try {
                await test.call(this as any, { createDevice })
            } finally {
            }
        })
    }

    return factory
}

export function lazyMemorySignalTransportFactory() {
    let manager: MemorySignalTransportManager
    return () => {
        if (!manager) {
            manager = new MemorySignalTransportManager()
        }

        return manager.createTransport()
    }
}

export async function createMemorySharedSyncLog() {
    const sharedStorageManager = new StorageManager({
        backend: new DexieStorageBackend({
            dbName: 'shared',
            idbImplementation: inMemory(),
        }),
    })
    const sharedSyncLog = new SharedSyncLogStorage({
        storageManager: sharedStorageManager,
        autoPkType: 'int',
    })
    registerModuleMapCollections(sharedStorageManager.registry, {
        sharedSyncLog,
    })
    await sharedStorageManager.finishInitialization()
    return sharedSyncLog
}

export function maybeMarkTestDescription(
    description: string,
    mark: boolean | undefined,
) {
    return mark ? description + '!!!' : description
}
