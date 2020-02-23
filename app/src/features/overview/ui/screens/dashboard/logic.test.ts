import Logic, { State, Event, LogicDependencies } from './logic'
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
    fullUrl: 'https://www.test.com.bla',
    url: 'test.com.bla',
    pageUrl: 'test.com.bla',
    notes: [],
    domain: 'test.com.bla',
    titleText: 'This is a test page bla',
    date: 'a few seconds ago',
    isStarred: false,
    tags: [],
    lists: [],
}

describe('dashboard screen UI logic tests', () => {
    const it = makeStorageTestFactory()

    function setup(options: LogicDependencies) {
        const logic = new Logic({
            ...options,
            navigation: new FakeNavigation(),
        })
        const element = new FakeStatefulUIElement<State, Event>(logic)

        return { element }
    }

    async function createRecentlyVisitedPage(
        page: Omit<Page, 'domain' | 'hostname'>,
        { storage }: { storage: Storage },
    ) {
        await storage.modules.overview.createPage(page)
        await addToMobileList(page.url, { storage })
    }

    async function addToMobileList(
        pageUrl: string,
        { storage }: { storage: Storage },
    ) {
        const mobileListId = await storage.modules.metaPicker.createMobileListIfAbsent()
        await storage.modules.metaPicker.createPageListEntry({
            listId: mobileListId,
            pageUrl,
        })
    }

    it('should load correctly without any saved pages', async ({ storage }) => {
        const { element } = setup({ storage })

        await element.init()
        expect(element.state).toEqual({
            loadState: 'done',
            reloadState: 'pristine',
            loadMoreState: 'pristine',
            selectedListName: MOBILE_LIST_NAME,
            couldHaveMore: false,
            actionState: 'pristine',
            actionFinishedAt: 0,
            pages: new Map(),
        })
    })

    it('should load correctly with saved pages', async ({ storage }) => {
        const { element } = setup({ storage })

        await insertIntegrationTestData({ storage })
        await addToMobileList(INTEGRATION_TEST_DATA.pages[0].url, { storage })

        await element.init()
        expect(element.state).toEqual({
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
        })
    })

    it('should paginate correctly', async ({ storage }) => {
        const { element } = setup({ storage, pageSize: 1 })

        await storage.modules.overview.createPage(
            INTEGRATION_TEST_DATA.pages[0],
        )
        await storage.modules.overview.createPage({
            url: INTEGRATION_TEST_DATA.pages[0].url + '.bla',
            fullUrl: 'https://www.test.com.bla',
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
            pageUrl: INTEGRATION_TEST_DATA.pages[0].url + '.bla',
        })

        await element.init()
        expect(element.state).toEqual({
            loadState: 'done',
            reloadState: 'pristine',
            loadMoreState: 'pristine',
            couldHaveMore: true,
            actionState: 'pristine',
            actionFinishedAt: 0,
            pages: new Map([['test.com.bla', UI_PAGE_2]]),
            selectedListName: MOBILE_LIST_NAME,
        })

        await element.processEvent('loadMore', {})
        expect(element.state).toEqual({
            loadState: 'done',
            reloadState: 'pristine',
            loadMoreState: 'done',
            couldHaveMore: true,
            actionState: 'pristine',
            actionFinishedAt: 0,
            selectedListName: MOBILE_LIST_NAME,
            pages: new Map([
                ['test.com.bla', UI_PAGE_2],
                ['test.com', UI_PAGE_1],
            ]),
        })

        await element.processEvent('loadMore', {})
        expect(element.state).toEqual({
            loadState: 'done',
            reloadState: 'pristine',
            loadMoreState: 'done',
            couldHaveMore: false,
            actionState: 'pristine',
            actionFinishedAt: 0,
            selectedListName: MOBILE_LIST_NAME,
            pages: new Map([
                ['test.com.bla', UI_PAGE_2],
                ['test.com', UI_PAGE_1],
            ]),
        })

        await element.processEvent('reload', {})
        expect(element.state).toEqual({
            loadState: 'done',
            reloadState: 'done',
            loadMoreState: 'done',
            couldHaveMore: false,
            actionState: 'pristine',
            actionFinishedAt: 0,
            selectedListName: MOBILE_LIST_NAME,
            pages: new Map([
                ['test.com.bla', UI_PAGE_2],
                ['test.com', UI_PAGE_1],
            ]),
        })
    })

    it('should be able to delete pages', async ({ storage }) => {
        const { element } = setup({ storage })

        await createRecentlyVisitedPage(INTEGRATION_TEST_DATA.pages[0], {
            storage,
        })

        await element.init()
        expect(element.state.pages).toEqual(new Map([['test.com', UI_PAGE_1]]))

        const url = INTEGRATION_TEST_DATA.pages[0].url
        await element.processEvent('deletePage', {
            url,
        })
        expect(element.state).toEqual({
            loadState: 'done',
            reloadState: 'pristine',
            loadMoreState: 'pristine',
            couldHaveMore: false,
            action: 'delete',
            actionState: 'done',
            actionFinishedAt: expect.any(Number),
            selectedListName: MOBILE_LIST_NAME,
            pages: new Map([]),
        })
        expect(element.state.actionFinishedAt).toBeGreaterThan(
            Date.now() - 5000,
        )
        expect(
            await storage.manager.collection('pages').findObjects({}),
        ).toEqual([])

        const { element: secondElement } = setup({ storage })
        await secondElement.init()
        expect(secondElement.state.pages).toEqual(new Map([]))
    })

    it('should be able to star + unstar pages', async ({ storage }) => {
        const { element } = setup({ storage })

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
})
