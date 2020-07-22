import { storageKeys } from '../../../../../../app.json'
import Logic, { State, Event, Props } from './logic'
import { FakeStatefulUIElement } from 'src/ui/index.tests'
import { makeStorageTestFactory } from 'src/index.tests'
import { Storage } from 'src/storage/types'
import { FakeNavigation } from 'src/tests/navigation'
import {
    insertIntegrationTestData,
    INTEGRATION_TEST_DATA,
} from 'src/tests/shared-fixtures/integration'
import { UIPage } from 'src/features/overview/types'
import { Page } from '@worldbrain/memex-storage/lib/mobile-app/features/overview/types'
import { MOBILE_LIST_NAME } from '@worldbrain/memex-storage/lib/mobile-app/features/meta-picker/constants'

const UI_PAGE_1: UIPage = {
    fullUrl: 'https://www.test.com',
    url: 'test.com',
    pageUrl: 'test.com',
    notes: [],
    domain: 'test.com',
    titleText: 'This is a test page',
    date: 'a few seconds ago',
    isStarred: false,
    tags: [],
    lists: [],
}
const UI_PAGE_2: UIPage = {
    fullUrl: 'https://www.test.com.me',
    url: 'test.com.me',
    pageUrl: 'test.com.me',
    notes: [],
    domain: 'test.com.me',
    titleText: 'This is a test page bla',
    date: 'a few seconds ago',
    isStarred: false,
    tags: [],
    lists: [],
}

describe('dashboard screen UI logic tests', () => {
    const it = makeStorageTestFactory()

    async function setup(
        options: Omit<Props, 'navigation'> & { navigation: FakeNavigation },
    ) {
        await options.services.localStorage.set(storageKeys.syncKey, true)

        const logic = new Logic({
            ...options,
            navigation: options.navigation as any,
        })
        const element = new FakeStatefulUIElement<State, Event>(logic)

        return { element, logic }
    }

    async function createRecentlyVisitedPage(
        page: Omit<Page, 'domain' | 'hostname'>,
        dependencies: { storage: Storage },
    ) {
        await dependencies.storage.modules.overview.createPage(page)
        await addToMobileList(page.url, dependencies)
    }

    async function addToMobileList(
        pageUrl: string,
        dependencies: { storage: Storage },
    ) {
        const mobileListId = await dependencies.storage.modules.metaPicker.createMobileListIfAbsent()
        await dependencies.storage.modules.metaPicker.createPageListEntry({
            listId: mobileListId,
            pageUrl,
        })
    }

    it('should load correctly without any saved pages', async dependencies => {
        const { element } = await setup(dependencies)

        await element.init()
        expect(element.state).toEqual(
            expect.objectContaining({
                syncState: expect.any(String),
                shouldShowSyncRibbon: false,
                loadState: 'done',
                reloadState: 'pristine',
                loadMoreState: 'pristine',
                selectedListName: MOBILE_LIST_NAME,
                couldHaveMore: false,
                actionState: 'pristine',
                actionFinishedAt: 0,
                pages: new Map(),
            }),
        )
    })

    it('should load correctly with saved pages', async dependencies => {
        const { element } = await setup(dependencies)

        await insertIntegrationTestData(dependencies)
        await addToMobileList(INTEGRATION_TEST_DATA.pages[0].url, dependencies)

        await element.init()
        expect(element.state).toEqual(
            expect.objectContaining({
                syncState: expect.any(String),
                shouldShowSyncRibbon: false,
                loadState: 'done',
                reloadState: 'pristine',
                loadMoreState: 'pristine',
                couldHaveMore: false,
                actionState: 'pristine',
                actionFinishedAt: 0,
                selectedListName: MOBILE_LIST_NAME,
                pages: new Map([
                    [
                        'test.com',
                        {
                            ...UI_PAGE_1,
                            isStarred: true,
                            tags: INTEGRATION_TEST_DATA.tags,
                            lists: [INTEGRATION_TEST_DATA.lists[0]],
                        },
                    ],
                ]),
            }),
        )
    })

    it('should paginate correctly', async dependencies => {
        const { storage } = dependencies
        const { element } = await setup({ ...dependencies, pageSize: 1 })

        await storage.modules.overview.createPage(
            INTEGRATION_TEST_DATA.pages[0],
        )
        await storage.modules.overview.createPage({
            url: INTEGRATION_TEST_DATA.pages[0].url + '.me',
            fullUrl: 'https://www.test.com.me',
            fullTitle: 'This is a test page bla',
            text:
                'Hey there this is some test text with lots of test terms included bla.',
        })

        const mobileListId = await storage.modules.metaPicker.createMobileListIfAbsent()
        await storage.modules.metaPicker.createPageListEntry({
            listId: mobileListId,
            pageUrl: INTEGRATION_TEST_DATA.pages[0].url,
        })
        await storage.modules.metaPicker.createPageListEntry({
            listId: mobileListId,
            pageUrl: INTEGRATION_TEST_DATA.pages[0].url + '.me',
        })

        await element.init()
        expect(element.state).toEqual(
            expect.objectContaining({
                syncState: expect.any(String),
                shouldShowSyncRibbon: false,
                loadState: 'done',
                reloadState: 'pristine',
                loadMoreState: 'pristine',
                couldHaveMore: true,
                actionState: 'pristine',
                actionFinishedAt: 0,
                pages: new Map([['test.com.me', UI_PAGE_2]]),
                selectedListName: MOBILE_LIST_NAME,
            }),
        )

        await element.processEvent('loadMore', {})
        expect(element.state).toEqual(
            expect.objectContaining({
                syncState: expect.any(String),
                shouldShowSyncRibbon: false,
                loadState: 'done',
                reloadState: 'pristine',
                loadMoreState: 'done',
                couldHaveMore: true,
                actionState: 'pristine',
                actionFinishedAt: 0,
                selectedListName: MOBILE_LIST_NAME,
                pages: new Map([
                    ['test.com.me', UI_PAGE_2],
                    ['test.com', UI_PAGE_1],
                ]),
            }),
        )

        await element.processEvent('loadMore', {})
        expect(element.state).toEqual(
            expect.objectContaining({
                syncState: expect.any(String),
                shouldShowSyncRibbon: false,
                loadState: 'done',
                reloadState: 'pristine',
                loadMoreState: 'done',
                couldHaveMore: false,
                actionState: 'pristine',
                actionFinishedAt: 0,
                selectedListName: MOBILE_LIST_NAME,
                pages: new Map([
                    ['test.com.me', UI_PAGE_2],
                    ['test.com', UI_PAGE_1],
                ]),
            }),
        )

        await element.processEvent('reload', {})
        expect(element.state).toEqual(
            expect.objectContaining({
                syncState: expect.any(String),
                shouldShowSyncRibbon: false,
                loadState: 'done',
                reloadState: 'done',
                loadMoreState: 'done',
                couldHaveMore: true,
                actionState: 'pristine',
                actionFinishedAt: 0,
                selectedListName: MOBILE_LIST_NAME,
                pages: new Map([['test.com.me', UI_PAGE_2]]),
            }),
        )
    })

    it('should be able to delete pages', async dependencies => {
        const { storage } = dependencies
        const { element } = await setup(dependencies)

        await createRecentlyVisitedPage(INTEGRATION_TEST_DATA.pages[0], {
            storage,
        })

        await element.init()
        expect(element.state.pages).toEqual(new Map([['test.com', UI_PAGE_1]]))

        const url = INTEGRATION_TEST_DATA.pages[0].url
        await element.processEvent('deletePage', {
            url,
        })
        expect(element.state).toEqual(
            expect.objectContaining({
                syncState: expect.any(String),
                shouldShowSyncRibbon: false,
                loadState: 'done',
                reloadState: 'pristine',
                loadMoreState: 'pristine',
                couldHaveMore: false,
                action: 'delete',
                actionState: 'done',
                actionFinishedAt: expect.any(Number),
                selectedListName: MOBILE_LIST_NAME,
                pages: new Map([]),
            }),
        )
        expect(element.state.actionFinishedAt).toBeGreaterThan(
            Date.now() - 5000,
        )
        expect(
            await storage.manager.collection('pages').findObjects({}),
        ).toEqual([])

        const { element: secondElement } = await setup(dependencies)
        await secondElement.init()
        expect(secondElement.state.pages).toEqual(new Map([]))
    })

    it('should be able to star + unstar pages', async dependencies => {
        const { storage } = dependencies
        const { element } = await setup(dependencies)

        const { url } = INTEGRATION_TEST_DATA.pages[0]
        await createRecentlyVisitedPage(INTEGRATION_TEST_DATA.pages[0], {
            storage,
        })

        await element.init()
        const pageA = element.state.pages.get(url)!
        expect(pageA.isStarred).toBeFalsy()

        await element.processEvent('togglePageStar', {
            url,
        })
        const pageB = element.state.pages.get(url)!
        expect(pageB.isStarred).toBe(true)
        expect(await storage.modules.overview.isPageStarred({ url })).toBe(true)

        await element.processEvent('togglePageStar', {
            url,
        })
        const pageC = element.state.pages.get(url)!
        expect(await storage.modules.overview.isPageStarred({ url })).toBe(
            false,
        )
        expect(pageC.isStarred).toBe(false)
    })

    it('reload should be able to trigger sync ', async dependencies => {
        const { element } = await setup(dependencies)

        expect(element.state.syncState).toEqual('pristine')
        await element.processEvent('reload', {})
        expect(element.state.syncState).toEqual('pristine')
        await element.processEvent('reload', { triggerSync: true })
        expect(element.state.syncState).not.toEqual('pristine')
    })

    it('should be able to switch look up of latest collection entries, bookmarks, or visits, depending on set filter', async dependencies => {
        const {
            storage: {
                modules: { overview },
            },
        } = dependencies
        const { element } = await setup(dependencies)

        for (const page of INTEGRATION_TEST_DATA.pages) {
            await overview.createPage(page)
        }

        await addToMobileList(INTEGRATION_TEST_DATA.pages[0].url, dependencies)
        await addToMobileList(INTEGRATION_TEST_DATA.pages[3].url, dependencies)

        await overview.starPage({ url: INTEGRATION_TEST_DATA.pages[1].url })
        await overview.visitPage({ url: INTEGRATION_TEST_DATA.pages[1].url })
        await overview.visitPage({ url: INTEGRATION_TEST_DATA.pages[4].url })

        const logic = element.logic as Logic

        element.processMutation({ filterType: { $set: 'bookmarks' } })
        expect(
            await logic['choosePageEntryLoader'](element.state)(element.state),
        ).toEqual([
            { url: INTEGRATION_TEST_DATA.pages[1].url, date: expect.any(Date) },
        ])

        element.processMutation({ filterType: { $set: 'visits' } })
        expect(
            await logic['choosePageEntryLoader'](element.state)(element.state),
        ).toEqual([
            { url: INTEGRATION_TEST_DATA.pages[4].url, date: expect.any(Date) },
            { url: INTEGRATION_TEST_DATA.pages[1].url, date: expect.any(Date) },
        ])

        element.processMutation({ filterType: { $set: 'collection' } })
        expect(
            await logic['choosePageEntryLoader'](element.state)(element.state),
        ).toEqual([
            { url: INTEGRATION_TEST_DATA.pages[3].url, date: expect.any(Date) },
            { url: INTEGRATION_TEST_DATA.pages[0].url, date: expect.any(Date) },
        ])
    })
})
