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
                'should result in the same end storage state after a continuous sync',
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
                const firstDeviceStorageContents = await getStorageContents(
                    devices[0].storage.manager,
                    {
                        exclude: new Set(['clientSyncLogEntry']),
                    },
                )
                await devices[0].services.sync.continuousSync.forceIncrementalSync()
                await devices[1].services.sync.continuousSync.forceIncrementalSync()
                const secondDeviceStorageContents = await getStorageContents(
                    devices[1].storage.manager,
                    {
                        exclude: new Set(['clientSyncLogEntry']),
                    },
                )
                expect(firstDeviceStorageContents).toEqual(
                    secondDeviceStorageContents,
                )
            },
        )
    })
}
