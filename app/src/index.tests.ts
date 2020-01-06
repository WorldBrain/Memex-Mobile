const wrtc = require('wrtc')
import StorageManager from '@worldbrain/storex'
import { registerModuleMapCollections } from '@worldbrain/storex-pattern-modules'
import { SharedSyncLogStorage } from '@worldbrain/storex-sync/lib/shared-sync-log/storex'
import { DexieStorageBackend } from '@worldbrain/storex-backend-dexie'
import inMemory from '@worldbrain/storex-backend-dexie/lib/in-memory'
import { MemoryAuthService } from '@worldbrain/memex-common/lib/authentication/memory'
import { MemorySignalTransportManager } from 'simple-signalling/lib/memory'
import { createStorage, setStorageMiddleware } from 'src/storage'
import { Storage } from 'src/storage/types'
import { createServices } from './services'
import { Services } from './services/types'
import { LocalStorageService } from './services/local-storage'
import { FakeNavigation } from './tests/navigation'
import { MockSettingsStorage } from './features/settings/storage/mock-storage'
import { MockKeychainPackage } from './services/keychain/mock-keychain-package'

export type MultiDeviceTestFunction = (
    context: MultiDeviceTestContext,
) => Promise<void>
export interface MultiDeviceTestContext {
    createDevice(options?: {
        debugSql?: boolean
    }): Promise<MultiDeviceTestDevice>
}
export interface MultiDeviceTestDevice {
    storage: Storage
    services: Services
    navigation: FakeNavigation
    auth: MemoryAuthService
}

/*
 * Multiple tests throw errors running on the same TypeORM connection. So give each test a different
 *  connection name.
 * Manually calling `this.connection.close()` in the TypeORM backend after the test is run
 *  does not seem to help.
 */
let connIterator = 0

export function makeStorageTestFactory() {
    interface TestOptions {
        debugSql?: boolean
    }
    type TestFunction = (context: TestContext) => Promise<void>
    interface TestContext {
        storage: Storage
    }

    function factory(description: string, test?: TestFunction): void
    function factory(
        description: string,
        options: TestOptions,
        test: TestFunction,
    ): void
    function factory(
        description: string,
        testOrOptions?: TestOptions | TestFunction,
        maybeTest?: TestFunction,
    ): void {
        const test =
            typeof testOrOptions === 'function' ? testOrOptions : maybeTest
        const options =
            typeof testOrOptions !== 'function' ? testOrOptions || {} : {}

        if (!test) {
            ;(it as any).todo(description)
            return
        }

        it(description, async function(this: any) {
            const storage = await createStorage({
                typeORMConnectionOpts: {
                    type: 'sqlite',
                    database: ':memory:',
                    name: `connection-${connIterator++}`,
                    logging: options.debugSql,
                },
            })

            try {
                await test.call(this, { storage })
            } finally {
            }
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

            const createDevice = async (options?: { debugSql?: boolean }) => {
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
                const services = await createServices({
                    devicePlatform: 'integration-tests',
                    auth,
                    storage,
                    signalTransportFactory,
                    sharedSyncLog,
                    localStorage,
                    disableSyncEncryption: true,
                    keychain: new MockKeychainPackage(),
                })
                await setStorageMiddleware({
                    services,
                    storage,
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
