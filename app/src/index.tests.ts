import { normalizeUrl } from '@worldbrain/memex-url-utils'
import { MemoryAuthService } from '@worldbrain/memex-common/lib/authentication/memory'
import { TEST_USER } from '@worldbrain/memex-common/lib/authentication/dev'
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
import { registerSingleDeviceSyncTests } from './services/cloud-sync/index.tests'
import { StorageOperationEvent } from '@worldbrain/storex-middleware-change-watcher/lib/types'
import { RouteProp } from '@react-navigation/native'
import { ConnectionOptions } from 'typeorm'
import {
    PersonalCloudHub,
    StorexPersonalCloudBackend,
} from '@worldbrain/memex-common/lib/personal-cloud/backend/storex'
import { getCurrentSchemaVersion } from '@worldbrain/memex-common/lib/storage/utils'
import {
    PersonalDeviceType,
    PersonalDeviceOs,
    PersonalDeviceProduct,
} from '@worldbrain/memex-common/lib/personal-cloud/storage/types'

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

                    const serverStorage = await createServerStorage()
                    const storage = await createStorage({
                        authService,
                        createPersonalCloudBackend: (
                            storageManager,
                            modules,
                            getDeviceId,
                        ) =>
                            new StorexPersonalCloudBackend({
                                storageManager: serverStorage.manager,
                                clientSchemaVersion: getCurrentSchemaVersion(
                                    serverStorage.manager,
                                ),
                                view: cloudHub.getView(),
                                getDeviceId,
                                getUserId,
                                getNow,
                                useDownloadTranslationLayer: true,
                            }),
                        createDeviceId: async (userId) => {
                            const device = await serverStorage.modules.personalCloud.createDeviceInfo(
                                {
                                    userId,
                                    device: {
                                        type: PersonalDeviceType.Mobile,
                                        os: PersonalDeviceOs.IOS,
                                        product:
                                            PersonalDeviceProduct.MobileApp,
                                    },
                                },
                            )
                            return device.id
                        },
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

                    await authService.setUser(TEST_USER)
                    await storage.modules.personalCloud.setup()
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
        const serverStorageP = (async () => {
            return createServerStorage()
        })()

        it(description, async function (this: any) {
            const createdDevices: Array<{
                storage: Storage
                services: Services
            }> = []

            const serverStorage = await serverStorageP
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

                const storage = await createStorage({
                    typeORMConnectionOpts,
                    authService,
                    createPersonalCloudBackend: (
                        storageManager,
                        modules,
                        getDeviceId,
                    ) =>
                        new StorexPersonalCloudBackend({
                            storageManager: serverStorage.manager,
                            clientSchemaVersion: getCurrentSchemaVersion(
                                serverStorage.manager,
                            ),
                            view: cloudHub.getView(),
                            getDeviceId,
                            getUserId,
                            getNow,
                            useDownloadTranslationLayer: true,
                        }),
                    createDeviceId: async (userId) => {
                        const device = await serverStorage.modules.personalCloud.createDeviceInfo(
                            {
                                userId,
                                device: {
                                    type: PersonalDeviceType.Mobile,
                                    os: PersonalDeviceOs.IOS,
                                    product: PersonalDeviceProduct.MobileApp,
                                },
                            },
                        )
                        return device.id
                    },
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

                await authService.setUser(TEST_USER)
                await storage.modules.personalCloud.setup()
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
