import { getStorageContents } from '@worldbrain/memex-common/lib/storage/utils'
import { TEST_USER } from '@worldbrain/memex-common/lib/authentication/dev'
import {
    SingleDeviceTestFunction,
    TestDevice,
    makeMultiDeviceTestFactory,
    maybeMarkTestDescription,
} from '../../index.tests'

const doInitialSync = async (source: TestDevice, target: TestDevice) => {
    await source.services.cloudSync.runInitialSync()
    await target.services.cloudSync.runInitialSync()
}

const doIncrementalSync = async (source: TestDevice, target: TestDevice) => {
    await source.services.cloudSync.runContinuousSync()
    await target.services.cloudSync.runContinuousSync()
}

export function registerSingleDeviceSyncTests(
    test: SingleDeviceTestFunction,
    options: { mark: boolean | undefined },
) {
    const it = makeMultiDeviceTestFactory()

    describe('Sync tests', () => {
        it(
            maybeMarkTestDescription(
                'should result in the same end storage state after a incremental sync',
                options.mark,
            ),
            async ({ createDevice }) => {
                const devices = await Promise.all([
                    createDevice(),
                    createDevice(),
                ])
                await devices[0].auth.setUser(TEST_USER)

                await doInitialSync(devices[0], devices[1])

                await test(devices[0])
                await syncAndCheck(devices, doIncrementalSync)
            },
        )

        it(
            maybeMarkTestDescription(
                'should result in the same storage state after an incremental sync at every change',
                options.mark,
            ),
            async ({ createDevice }) => {
                const devices = await Promise.all([
                    createDevice({
                        extraPostChangeWatcher: async () => {
                            await syncAndCheck(devices, doIncrementalSync)
                        },
                    }),
                    createDevice(),
                ])
                await devices[0].auth.setUser(TEST_USER)

                await doInitialSync(devices[0], devices[1])

                await test(devices[0])
            },
        )

        it(
            maybeMarkTestDescription(
                'should result in the same end storage state after an initial sync',
                options.mark,
            ),
            async ({ createDevice }) => {
                const devices = await Promise.all([
                    createDevice(),
                    createDevice(),
                ])
                await devices[0].auth.setUser(TEST_USER)
                await devices[1].auth.setUser(TEST_USER)

                await test(devices[0])
                await syncAndCheck(devices, doInitialSync)
            },
        )
    })
}

type StorageContents = { [collection: string]: any[] }

const delTextFields = ({
    pages = [],
    customLists = [],
    ...storageContents
}: StorageContents): StorageContents => ({
    ...storageContents,
    pages: pages.map(({ text, ...page }) => page),
    customLists: customLists.map(({ searchableName, ...list }) => list),
})

async function syncAndCheck(
    devices: [TestDevice, TestDevice],
    runSync: (source: TestDevice, target: TestDevice) => Promise<void>,
) {
    const firstDeviceStorageContents = await getStorageContents(
        devices[0].storage.manager,
        {
            exclude: new Set(['localSettings', 'personalCloudAction']),
        },
    )

    await runSync(devices[0], devices[1])

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
