import { normalizeUrl } from '@worldbrain/memex-url-utils'
import { MemoryAuthService } from '@worldbrain/memex-common/lib/authentication/memory'
import { TEST_USER } from '@worldbrain/memex-common/lib/authentication/dev'
import { getStorageContents } from '@worldbrain/memex-common/lib/storage/utils'
import { getCurrentSchemaVersion } from '@worldbrain/memex-common/lib/storage/utils'
import {
    PersonalCloudHub,
    StorexPersonalCloudBackend,
} from '@worldbrain/memex-common/lib/personal-cloud/backend/storex'
import {
    PersonalDeviceType,
    PersonalDeviceOs,
    PersonalDeviceProduct,
    PersonalDeviceBrowser,
} from '@worldbrain/memex-common/lib/personal-cloud/storage/types'
import type { ConnectionOptions } from 'typeorm'

import {
    createStorage,
    setStorageMiddleware,
    createServerStorage,
} from 'src/storage'
import { createServices } from './services'
import type { ServerStorage } from 'src/storage/types'
import { MockSentry } from './services/error-tracking/index.tests'
import { ErrorTrackingService } from './services/error-tracking'
import { FakeNavigation, FakeRoute } from './tests/navigation'
import { MockKeychainPackage } from './services/keychain/mock-keychain-package'
import type {
    SingleDeviceTestFactory,
    SingleDeviceTestOptions,
    SingleDeviceTestFunction,
    MultiDeviceTestFunction,
    TestDeviceFactory,
    StorageContents,
    TestDevice,
} from './types.tests'
import type { RouteProp } from '@react-navigation/native'

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
                    const device = await initCreateTestDevice({})({
                        deviceInfo: {
                            type: PersonalDeviceType.Mobile,
                            os: PersonalDeviceOs.IOS,
                            product: PersonalDeviceProduct.MobileApp,
                        },
                        backend: 'typeorm',
                    })

                    try {
                        await test.call(this, device)
                    } finally {
                    }
                },
            )

            if (!options?.skipSyncTests) {
                registerSingleDeviceSyncTests(test, { mark: options?.mark })
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
        const serverStorageP = createServerStorage()

        it(description, async function (this: any) {
            const createDevice = initCreateTestDevice({
                getServerStorage: () => serverStorageP,
            })

            try {
                await test.call(this as any, { createDevice })
            } finally {
            }
        })
    }

    return factory
}

export function registerSingleDeviceSyncTests(
    test: SingleDeviceTestFunction,
    options: { mark: boolean | undefined },
) {
    const it = makeMultiDeviceTestFactory()

    describe('Sync tests', () => {
        it(
            maybeMarkTestDescription(
                'should result in the same end storage state after a sync',
                options.mark,
            ),
            async ({ createDevice }) => {
                const devices = await Promise.all([
                    createDevice({
                        deviceInfo: {
                            type: PersonalDeviceType.Mobile,
                            os: PersonalDeviceOs.IOS,
                            product: PersonalDeviceProduct.MobileApp,
                        },
                    }),
                    createDevice({
                        deviceInfo: {
                            type: PersonalDeviceType.DesktopBrowser,
                            os: PersonalDeviceOs.MacOS,
                            browser: PersonalDeviceBrowser.Chrome,
                            product: PersonalDeviceProduct.Extension,
                        },
                    }),
                ])

                await test(devices[0])
                await syncAndCheck(devices)
            },
        )

        it(
            maybeMarkTestDescription(
                'should result in the same storage state after a sync at every change',
                options.mark,
            ),
            async ({ createDevice }) => {
                const devices = await Promise.all([
                    createDevice({
                        deviceInfo: {
                            type: PersonalDeviceType.Mobile,
                            os: PersonalDeviceOs.IOS,
                            product: PersonalDeviceProduct.MobileApp,
                        },
                        extraPostChangeWatcher: async () => {
                            await syncAndCheck(devices)
                        },
                    }),
                    createDevice({
                        deviceInfo: {
                            type: PersonalDeviceType.DesktopBrowser,
                            os: PersonalDeviceOs.MacOS,
                            browser: PersonalDeviceBrowser.Chrome,
                            product: PersonalDeviceProduct.Extension,
                        },
                    }),
                ])

                await test(devices[0])
            },
        )
    })
}

const initCreateTestDevice = ({
    getServerStorage = createServerStorage,
}: {
    getServerStorage?: () => Promise<ServerStorage>
}): TestDeviceFactory => async (options) => {
    const serverStorage = await getServerStorage()
    const typeORMConnectionOpts: ConnectionOptions | undefined =
        options.backend === 'dexie'
            ? undefined
            : {
                  type: 'sqlite',
                  database: ':memory:',
                  name: `connection-${connIterator++}`,
                  logging: !!(options && options.debugSql),
              }

    const route = new FakeRoute()
    const navigation = new FakeNavigation()
    const cloudHub = new PersonalCloudHub()
    const authService = new MemoryAuthService()
    const errorTracker = new ErrorTrackingService(new MockSentry() as any, {
        dsn: 'test.com',
    })

    let now = 555
    const getNow = () => now++
    const getUserId = async () => {
        const user = await authService.getCurrentUser()
        return user?.id ?? null
    }

    const storage = await createStorage({
        typeORMConnectionOpts,
        authService,
        createPersonalCloudBackend: (storageManager, modules, getDeviceId) =>
            new StorexPersonalCloudBackend({
                storageManager: serverStorage.manager,
                clientSchemaVersion: getCurrentSchemaVersion(storageManager),
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
                    device: options.deviceInfo,
                },
            )
            return device.id
        },
    })

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
        extraPostChangeWatcher: options.extraPostChangeWatcher,
    })

    return {
        storage,
        services,
        auth: authService,
        navigation,
        route: route as RouteProp<any, any>,
    }
}

const delTextFields = ({
    pages = [],
    customLists = [],
    ...storageContents
}: StorageContents): StorageContents => ({
    ...storageContents,
    pages: pages.map(({ text, ...page }) => page),
    customLists: customLists.map(({ searchableName, ...list }) => list),
})

async function syncAndCheck(devices: [TestDevice, TestDevice]) {
    const firstDeviceStorageContents = await getStorageContents(
        devices[0].storage.manager,
        {
            exclude: new Set(['localSettings', 'personalCloudAction']),
        },
    )

    await devices[0].services.cloudSync.sync()
    await devices[1].services.cloudSync.sync()

    const secondDeviceStorageContents = await getStorageContents(
        devices[1].storage.manager,
        {
            exclude: new Set(['localSettings', 'personalCloudAction']),
        },
    )

    expect(delTextFields(firstDeviceStorageContents)).toEqual(
        delTextFields(secondDeviceStorageContents),
    )
}

function maybeMarkTestDescription(
    description: string,
    mark: boolean | undefined,
) {
    return mark ? description + '!!!' : description
}
