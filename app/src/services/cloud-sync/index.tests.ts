import { getStorageContents } from '@worldbrain/memex-common/lib/storage/utils'
import {
    SingleDeviceTestFunction,
    TestDevice,
    makeMultiDeviceTestFactory,
    maybeMarkTestDescription,
} from '../../index.tests'

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
                    createDevice(),
                    createDevice(),
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
                        extraPostChangeWatcher: async () => {
                            await syncAndCheck(devices)
                        },
                    }),
                    createDevice(),
                ])

                await test(devices[0])
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
