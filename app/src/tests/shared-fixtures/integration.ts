import { Page } from 'src/features/overview/types'
import { Storage } from 'src/storage/types'
import { getStorageContents } from '@worldbrain/memex-common/lib/storage/utils'

export const INTEGRATION_TEST_DATA: {
    pages: Omit<Page, 'domain' | 'hostname' | 'pageUrl'>[]
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
        {
            url: 'test.com/1',
            fullUrl: 'https://www.test.com/1',
            fullTitle: 'This is another test page',
            text:
                'Hey there this is some test text with lots of test terms included.',
        },
        {
            url: 'test.com/2',
            fullUrl: 'https://www.test.com/2',
            fullTitle: 'This is test page 2',
            text:
                'Hey there this is some test text with lots of test terms included.',
        },
        {
            url: 'test.com/3',
            fullUrl: 'https://www.test.com/3',
            fullTitle: 'This is a test page 3',
            text:
                'Hey there this is some test text with lots of test terms included.',
        },
        {
            url: 'test.com/4',
            fullUrl: 'https://www.test.com/4',
            fullTitle: 'This is a test page 4',
            text:
                'Hey there this is some test text with lots of test terms included.',
        },
    ],
    visitTimestamps: [1563255000000],
    tags: ['testA', 'testB', 'testC', 'testD'],
    lists: ['testA', 'testB', 'testC', 'testD'],
}

export async function insertIntegrationTestData(options: { storage: Storage }) {
    await options.storage.modules.overview.createPage(
        INTEGRATION_TEST_DATA.pages[0],
    )
    for (const tag of INTEGRATION_TEST_DATA.tags) {
        await options.storage.modules.metaPicker.createTag({
            name: tag,
            url: INTEGRATION_TEST_DATA.pages[0].url,
        })
    }
    await options.storage.modules.overview.starPage(
        INTEGRATION_TEST_DATA.pages[0],
    )

    const listIds: Array<number> = []
    for (const list of INTEGRATION_TEST_DATA.lists) {
        const { object } = await options.storage.modules.metaPicker.createList({
            name: list,
        })
        listIds.push(object.id)
    }

    await options.storage.modules.metaPicker.createPageListEntry({
        pageUrl: INTEGRATION_TEST_DATA.pages[0].url,
        listId: listIds[0],
    })
}

export async function checkIntegrationTestData(options: { storage: Storage }) {
    const storedData = await getStorageContents(options.storage.manager, {
        exclude: new Set(['clientSyncLogEntry', 'syncDeviceInfo', 'settings']),
    })
    expect(storedData).toEqual({
        pages: [
            {
                ...INTEGRATION_TEST_DATA.pages[0],
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
}
