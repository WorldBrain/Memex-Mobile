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
    const {
        initialMessage,
    } = await params.source.services.sync.initialSync.requestInitialSync()
    await params.target.services.sync.initialSync.answerInitialSync({
        initialMessage,
    })
    await Promise.all(
        [params.source, params.target].map(device =>
            device.services.sync.initialSync.waitForInitialSync(),
        ),
    )
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
                expect(firstDeviceStorageContents).toEqual(
                    secondDeviceStorageContents,
                )
            },
        )
    })
}

async function incrementalSyncAndCheck(devices: [TestDevice, TestDevice]) {
    const firstDeviceStorageContents = await getStorageContents(
        devices[0].storage.manager,
        {
            exclude: new Set(['clientSyncLogEntry', 'syncDeviceInfo']),
        },
    )
    await devices[0].services.sync.continuousSync.forceIncrementalSync()
    await devices[1].services.sync.continuousSync.forceIncrementalSync()
    const secondDeviceStorageContents = await getStorageContents(
        devices[1].storage.manager,
        {
            exclude: new Set(['clientSyncLogEntry', 'syncDeviceInfo']),
        },
    )
    expect(firstDeviceStorageContents).toEqual(secondDeviceStorageContents)
}
