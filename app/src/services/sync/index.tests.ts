import { getStorageContents } from '@worldbrain/memex-common/lib/storage/utils'
import { TEST_USER } from '@worldbrain/memex-common/lib/authentication/dev'
import {
    SingleDeviceTestFunction,
    TestDevice,
    makeMultiDeviceTestFactory,
    maybeMarkTestDescription,
} from '../../index.tests'

export async function doInitialSync(params: {
    source: TestDevice
    target: TestDevice
}) {
    await params.source.services.cloudSync.runInitialSync()
    await params.target.services.cloudSync.runInitialSync()
}

export async function doIncrementalSync(params: {
    source: TestDevice
    target: TestDevice
}) {
    await params.source.services.cloudSync.runContinuousSync()
    await params.target.services.cloudSync.runContinuousSync()
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
                devices[0].auth.setUser(TEST_USER)

                await doInitialSync({
                    source: devices[0],
                    target: devices[1],
                })

                await test(devices[0])
                await incrementalSyncAndCheck(devices)
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
                            await incrementalSyncAndCheck(devices)
                        },
                    }),
                    createDevice(),
                ])
                devices[0].auth.setUser(TEST_USER)

                await doInitialSync({
                    source: devices[0],
                    target: devices[1],
                })

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
                devices[0].auth.setUser(TEST_USER)

                await test(devices[0])
                const firstDeviceStorageContents = await getStorageContents(
                    devices[0].storage.manager,
                    {
                        exclude: new Set(['syncDeviceInfo']),
                    },
                )

                await doInitialSync({
                    source: devices[0],
                    target: devices[1],
                })

                const secondDeviceStorageContents = await getStorageContents(
                    devices[1].storage.manager,
                    {
                        exclude: new Set(['syncDeviceInfo']),
                    },
                )
                for (const page of firstDeviceStorageContents['pages'] || []) {
                    delete page.text
                }
                expect(firstDeviceStorageContents).toEqual(
                    secondDeviceStorageContents,
                )
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

async function incrementalSyncAndCheck(devices: [TestDevice, TestDevice]) {
    const firstDeviceStorageContents = await getStorageContents(
        devices[0].storage.manager,
        {
            exclude: new Set(['localSettings']),
        },
    )

    await doIncrementalSync({ source: devices[0], target: devices[1] })

    const secondDeviceStorageContents = await getStorageContents(
        devices[1].storage.manager,
        {
            exclude: new Set(['localSettings']),
        },
    )

    expect(delTextFields(firstDeviceStorageContents)).toEqual(
        delTextFields(secondDeviceStorageContents),
    )
}
