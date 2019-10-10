const wrtc = require('wrtc')
const MockAsyncStorage = require('mock-async-storage').default
import StorageManager from '@worldbrain/storex'
import { registerModuleMapCollections } from '@worldbrain/storex-pattern-modules'
import { SharedSyncLogStorage } from '@worldbrain/storex-sync/lib/shared-sync-log/storex'
import { DexieStorageBackend } from '@worldbrain/storex-backend-dexie'
import inMemory from '@worldbrain/storex-backend-dexie/lib/in-memory'
import { MemorySignalTransportManager } from 'simple-signalling/lib/memory'
import { createStorage, setStorageMiddleware } from 'src/storage'
import { Storage } from 'src/storage/types'
import { createServices } from './services'
import { Services } from './services/types'
import { MemoryAuthService } from './services/auth/memory'
import { LocalStorageService } from './services/local-storage'

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
    type TestFunction = (context: TestContext) => Promise<void>
    interface TestContext {
        storage: Storage
    }

    function factory(description: string, test?: TestFunction): void {
        if (!test) {
            it.todo(description)
            return
        }

        it(description, async function(this: any) {
            const storage = await createStorage({
                typeORMConnectionOpts: {
                    type: 'sqlite',
                    database: ':memory:',
                    name: `connection-${connIterator++}`,
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
            it.todo(description)
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

                const auth = new MemoryAuthService()
                const localStorage = new LocalStorageService({
                    storageAPI: new MockAsyncStorage(),
                })
                const services = await createServices({
                    auth,
                    storage,
                    signalTransportFactory,
                    sharedSyncLog,
                    localStorage,
                })
                await setStorageMiddleware({
                    services,
                    storage,
                })
                services.sync.initialSync.wrtc = wrtc

                const device = { storage, services, auth }
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
