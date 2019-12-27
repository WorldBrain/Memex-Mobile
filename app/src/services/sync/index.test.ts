import {
    makeMultiDeviceTestFactory,
    MultiDeviceTestDevice,
} from 'src/index.tests'
import {
    insertIntegrationTestData,
    checkIntegrationTestData,
} from 'src/tests/shared-fixtures/integration'
import { TEST_USER } from '@worldbrain/memex-common/lib/authentication/dev'

async function doInitialSync(params: {
    source: MultiDeviceTestDevice
    target: MultiDeviceTestDevice
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

describe('SyncService', () => {
    const it = makeMultiDeviceTestFactory()

    it('should be able to do an initial sync', async ({ createDevice }) => {
        const devices = [await createDevice(), await createDevice()]

        devices[0].auth.setUser(TEST_USER)

        await insertIntegrationTestData(devices[0])
        await doInitialSync({
            source: devices[0],
            target: devices[1],
        })
        await checkIntegrationTestData(devices[1])
    })

    it('should be able to do an incremental sync', async ({ createDevice }) => {
        const devices = [
            await createDevice({ debugSql: false }),
            await createDevice({ debugSql: false }),
        ]

        devices[0].auth.setUser(TEST_USER)

        await doInitialSync({
            source: devices[0],
            target: devices[1],
        })

        await insertIntegrationTestData(devices[0])
        await devices[0].services.sync.continuousSync.doIncrementalSync()

        await devices[1].services.sync.continuousSync.forceIncrementalSync()
        await checkIntegrationTestData(devices[1])
    })

    it('should include extra info with incremental sync batches', async ({
        createDevice,
    }) => {
        const devices = [await createDevice(), await createDevice()]

        devices[0].auth.setUser(TEST_USER)

        await doInitialSync({
            source: devices[0],
            target: devices[1],
        })

        const sentExtraInfo: any[] = []
        const firstContinuousSync = devices[0].services.sync.continuousSync
        const origGetOptions = firstContinuousSync.getSyncOptions.bind(
            firstContinuousSync,
        )
        firstContinuousSync.getSyncOptions = async () => {
            const options = await origGetOptions()
            sentExtraInfo.push(options.extraSentInfo)
            return options
        }

        await insertIntegrationTestData(devices[0])
        await devices[0].services.sync.continuousSync.forceIncrementalSync()

        expect(sentExtraInfo).toEqual([
            {
                pt: 'app',
                pv: expect.stringMatching(/[\d+]\.[\d+]\.[\d+]/),
                sv: expect.any(Number),
            },
        ])
    })

    it('should generate and transfer a device name during initial sync', async ({
        createDevice,
    }) => {
        const devices = [await createDevice(), await createDevice()]

        devices[0].auth.setUser(TEST_USER)

        await doInitialSync({
            source: devices[0],
            target: devices[1],
        })
    })
})
