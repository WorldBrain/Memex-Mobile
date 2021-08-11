const wrtc = require('wrtc')
import StorageManager from '@worldbrain/storex'
import { registerModuleMapCollections } from '@worldbrain/storex-pattern-modules'
import { SharedSyncLogStorage } from '@worldbrain/storex-sync/lib/shared-sync-log/storex'
import { DexieStorageBackend } from '@worldbrain/storex-backend-dexie'
import { normalizeUrl } from '@worldbrain/memex-url-utils'
import inMemory from '@worldbrain/storex-backend-dexie/lib/in-memory'
import { MemoryAuthService } from '@worldbrain/memex-common/lib/authentication/memory'
import { MemorySignalTransportManager } from 'simple-signalling/lib/memory'
import {
    createStorage,
    setStorageMiddleware,
    createServerStorage,
} from 'src/storage'
import { Storage } from 'src/storage/types'
import { createServices } from './services'
import { Services } from './services/types'
import { MockSentry } from './services/error-tracking/index.tests'
import { ErrorTrackingService } from './services/error-tracking'
import { FakeNavigation, FakeRoute } from './tests/navigation'
import { MockKeychainPackage } from './services/keychain/mock-keychain-package'
import { registerSingleDeviceSyncTests } from './services/sync/index.tests'
import { StorageOperationEvent } from '@worldbrain/storex-middleware-change-watcher/lib/types'
import { RouteProp } from '@react-navigation/native'
import { ConnectionOptions } from 'typeorm'
import {
    PersonalCloudHub,
    StorexPersonalCloudBackend,
} from '@worldbrain/memex-common/lib/personal-cloud/backend/storex'
import { getCurrentSchemaVersion } from '@worldbrain/memex-common/lib/storage/utils'

export interface TestDevice {
    storage: Storage
    services: Services
    auth: MemoryAuthService
    navigation: FakeNavigation
    route: RouteProp<any, any>
}
export type MultiDeviceTestFunction = (
    context: MultiDeviceTestContext,
) => Promise<void>
export interface MultiDeviceTestContext {
    createDevice: TestDeviceFactory
}
export type TestDeviceFactory = (options?: {
    debugSql?: boolean
    backend?: 'dexie' | 'typeorm'
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
                async function (this: any) {
                    const route = new FakeRoute()
                    const navigation = new FakeNavigation()
                    const authService = new MemoryAuthService()
                    const cloudHub = new PersonalCloudHub()

                    let now = 555
                    const getNow = () => now++
                    const getUserId = async () => {
                        const user = await authService.getCurrentUser()
                        return user?.id ?? null
                    }
                    const errorTracker = new ErrorTrackingService(
                        new MockSentry() as any,
                        { dsn: 'test.com' },
                    )

                    await authService.loginWithEmailAndPassword(
                        'test@test.com',
                        'password',
                    )

                    const serverStorage = await createServerStorage()
                    const storage = await createStorage({
                        authService,
                        createPersonalCloudBackend: () =>
                            new StorexPersonalCloudBackend({
                                storageManager: serverStorage.manager,
                                clientSchemaVersion: getCurrentSchemaVersion(
                                    serverStorage.manager,
                                ),
                                getDeviceId: () => 'test-device-1',
                                view: cloudHub.getView(),
                                getUserId,
                                getNow,
                                useDownloadTranslationLayer: true,
                            }),
                        createDeviceId: async (userId) => 'test-device-1',
                        typeORMConnectionOpts: {
                            type: 'sqlite',
                            database: ':memory:',
                            name: `connection-${connIterator++}`,
                            logging: options.debugSql,
                        },
                    })

                    const services = await createServices({
                        normalizeUrl,
                        errorTracker,
                        keychain: new MockKeychainPackage(),
                        firebase: {} as any,
                        storageModules: storage.modules,
                        auth: authService,
                    })

                    await setStorageMiddleware({ storage })

                    try {
                        await test.call(this, {
                            storage,
                            services,
                            navigation,
                            route: route as any,
                            auth: authService,
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

        it(description, async function (this: any) {
            const createdDevices: Array<{
                storage: Storage
                services: Omit<Services, 'sync'>
            }> = []

            const createDevice: TestDeviceFactory = async (options) => {
                const typeORMConnectionOpts: ConnectionOptions | undefined =
                    options?.backend === 'dexie'
                        ? undefined
                        : {
                              type: 'sqlite',
                              database: ':memory:',
                              name: `connection-${connIterator++}`,
                              logging: !!(options && options.debugSql),
                          }
                const authService = new MemoryAuthService()
                const cloudHub = new PersonalCloudHub()

                let now = 555
                const getNow = () => now++
                const getUserId = async () => {
                    const user = await authService.getCurrentUser()
                    return user?.id ?? null
                }

                await authService.loginWithEmailAndPassword(
                    'test@test.com',
                    'password',
                )

                const serverStorage = await createServerStorage()
                const storage = await createStorage({
                    typeORMConnectionOpts,
                    authService,
                    createPersonalCloudBackend: () =>
                        new StorexPersonalCloudBackend({
                            storageManager: serverStorage.manager,
                            clientSchemaVersion: getCurrentSchemaVersion(
                                serverStorage.manager,
                            ),
                            getDeviceId: () => 'test-device-1',
                            view: cloudHub.getView(),
                            getUserId,
                            getNow,
                            useDownloadTranslationLayer: true,
                        }),
                    createDeviceId: async (userId) => 'test-device-1',
                })

                const route = new FakeRoute()
                const navigation = new FakeNavigation()

                const errorTracker = new ErrorTrackingService(
                    new MockSentry() as any,
                    { dsn: 'test.com' },
                )
                const services = await createServices({
                    auth: authService,
                    normalizeUrl,
                    errorTracker,
                    keychain: new MockKeychainPackage(),
                    storageModules: storage.modules,
                })

                await setStorageMiddleware({
                    storage,
                    extraPostChangeWatcher: options?.extraPostChangeWatcher,
                })

                const device = {
                    storage,
                    services,
                    auth: authService,
                    navigation,
                    route: route as any,
                }
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

export function maybeMarkTestDescription(
    description: string,
    mark: boolean | undefined,
) {
    return mark ? description + '!!!' : description
}
