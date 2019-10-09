import mapValues from 'lodash/mapValues'
import { Page } from 'src/features/overview/types'
import { makeMultiDeviceTestFactory } from 'src/index.tests'
import { Storage } from 'src/storage/types'

const DATA: {
    pages: Omit<Page, 'domain' | 'hostname'>[]
    visitTimestamps: number[]
    tags: string[]
    lists: string[]
} = {
    pages: [
        {
            url: 'test.com',
            fullUrl: 'https://www.test.com',
            fullTitle: 'This is a test page',
            text:
                'Hey there this is some test text with lots of test terms included.',
        },
    ],
    visitTimestamps: [1563255000000],
    tags: ['testA', 'testB', 'testC', 'testD'],
    lists: ['testA', 'testB', 'testC', 'testD'],
}

describe('SyncService', () => {
    const it = makeMultiDeviceTestFactory()

    async function insertTestData(device: { storage: Storage }) {
        await device.storage.modules.overview.createPage(DATA.pages[0])
        for (const tag of DATA.tags) {
            await device.storage.modules.metaPicker.createTag({
                name: tag,
                url: DATA.pages[0].url,
            })
        }
        await device.storage.modules.overview.starPage(DATA.pages[0])

        const listIds: Array<number> = []
        for (const list of DATA.lists) {
            const {
                object,
            } = await device.storage.modules.metaPicker.createList({
                name: list,
            })
            listIds.push(object.id)
        }

        await device.storage.modules.metaPicker.createPageListEntry({
            pageUrl: DATA.pages[0].url,
            listId: listIds[0],
        })
    }

    it('should be able to do an initial sync', async ({ createDevice }) => {
        const devices = [await createDevice(), await createDevice()]

        await insertTestData(devices[0])

        const {
            initialMessage,
        } = await devices[0].services.sync.initialSync.requestInitialSync()
        await devices[1].services.sync.initialSync.answerInitialSync({
            initialMessage,
        })

        await Promise.all(
            devices.map(device =>
                device.services.sync.initialSync.waitForInitialSync(),
            ),
        )

        const storedData: { [collection: string]: any[] } = {}
        for (const collectionName of Object.keys(
            devices[1].storage.manager.registry.collections,
        )) {
            storedData[
                collectionName
            ] = await devices[1].storage.manager
                .collection(collectionName)
                .findObjects({})
        }
        expect(storedData).toEqual({
            pages: [
                {
                    ...DATA.pages[0],
                    domain: 'test.com',
                    hostname: 'test.com',
                },
            ],
            visits: [],
            bookmarks: [{ url: 'test.com', time: expect.any(Number) }],
            favIcons: [],
            tags: [
                { url: 'test.com', name: 'testA' },
                { url: 'test.com', name: 'testB' },
                { url: 'test.com', name: 'testC' },
                { url: 'test.com', name: 'testD' },
            ],
            customLists: [
                {
                    id: expect.any(Number),
                    name: 'testA',
                    isDeletable: false,
                    isNestable: false,
                    createdAt: expect.any(Date),
                },
                {
                    id: expect.any(Number),
                    name: 'testB',
                    isDeletable: false,
                    isNestable: false,
                    createdAt: expect.any(Date),
                },
                {
                    id: expect.any(Number),
                    name: 'testC',
                    isDeletable: false,
                    isNestable: false,
                    createdAt: expect.any(Date),
                },
                {
                    id: expect.any(Number),
                    name: 'testD',
                    isDeletable: false,
                    isNestable: false,
                    createdAt: expect.any(Date),
                },
            ],
            pageListEntries: [
                {
                    listId: expect.any(Number),
                    pageUrl: 'test.com',
                    fullUrl: 'test.com',
                    createdAt: expect.any(Date),
                },
            ],
            annotations: [],
            annotBookmarks: [],
            annotListEntries: [],
        })
    })
})
