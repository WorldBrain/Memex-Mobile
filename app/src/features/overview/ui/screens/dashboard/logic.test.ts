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
import { Page } from '@worldbrain/memex-common/lib/storage/modules/mobile-app/features/overview/types'
import { SPECIAL_LIST_NAMES } from '@worldbrain/memex-common/lib/storage/modules/lists/constants'
import ListsFilter from '../lists-filter'

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
    type: 'page',
}
const UI_PAGE_2: UIPage = {
    fullUrl: 'https://www.test.com/1',
    url: 'test.com/1',
    pageUrl: 'test.com/1',
    notes: [],
    domain: 'test.com',
    titleText: 'This is another test page',
    date: 'a few seconds ago',
    isStarred: false,
    tags: [],
    lists: [],
    type: 'page',
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
        await dependencies.storage.modules.metaPicker.createMobileListEntry({
            fullPageUrl: page.fullUrl,
        })
    }

    it(
        'should nav away to onboarding if local storage key set',
        { skipSyncTests: true },
        async (dependencies) => {
            const { element, logic } = await setup(dependencies)
            await dependencies.services.localStorage.set(
                storageKeys.showOnboarding,
                true,
            )

            await element.init()
            expect(element.state).toEqual(logic.getInitialState())

            expect(dependencies.navigation.popRequests()).toEqual([
                { type: 'navigate', target: 'Onboarding' },
            ])
        },
    )

    it('should load correctly without any saved pages', async (dependencies) => {
        const { element } = await setup(dependencies)

        await element.init()
        expect(element.state).toEqual(
            expect.objectContaining({
                syncState: expect.any(String),
                shouldShowSyncRibbon: false,
                loadState: 'done',
                reloadState: 'pristine',
                loadMoreState: 'pristine',
                selectedListName: SPECIAL_LIST_NAMES.MOBILE,
                couldHaveMore: false,
                actionState: 'pristine',
                actionFinishedAt: 0,
                pages: new Map(),
            }),
        )
    })

    it('should load correctly with saved pages', async (dependencies) => {
        const { element } = await setup(dependencies)

        await insertIntegrationTestData(dependencies)
        await dependencies.storage.modules.metaPicker.createMobileListEntry({
            fullPageUrl: INTEGRATION_TEST_DATA.pages[0].fullUrl,
        })

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
                selectedListName: SPECIAL_LIST_NAMES.MOBILE,
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

    it('should paginate correctly', async (dependencies) => {
        const { storage } = dependencies
        const { element } = await setup({ ...dependencies, pageSize: 1 })

        await storage.modules.overview.createPage(
            INTEGRATION_TEST_DATA.pages[0],
        )
        await storage.modules.overview.createPage(
            INTEGRATION_TEST_DATA.pages[1],
        )
        await storage.modules.metaPicker.createMobileListEntry({
            fullPageUrl: INTEGRATION_TEST_DATA.pages[0].fullUrl,
        })
        await storage.modules.metaPicker.createMobileListEntry({
            fullPageUrl: INTEGRATION_TEST_DATA.pages[1].fullUrl,
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
                pages: new Map([[UI_PAGE_2.url, UI_PAGE_2]]),
                selectedListName: SPECIAL_LIST_NAMES.MOBILE,
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
                selectedListName: SPECIAL_LIST_NAMES.MOBILE,
                pages: new Map([
                    [UI_PAGE_2.url, UI_PAGE_2],
                    [UI_PAGE_1.url, UI_PAGE_1],
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
                selectedListName: SPECIAL_LIST_NAMES.MOBILE,
                pages: new Map([
                    [UI_PAGE_2.url, UI_PAGE_2],
                    [UI_PAGE_1.url, UI_PAGE_1],
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
                selectedListName: SPECIAL_LIST_NAMES.MOBILE,
                pages: new Map([[UI_PAGE_2.url, UI_PAGE_2]]),
            }),
        )
    })

    it('should be able to delete pages', async (dependencies) => {
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
                selectedListName: SPECIAL_LIST_NAMES.MOBILE,
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

    it('should be able to star + unstar pages', async (dependencies) => {
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

    it('reload should be able to trigger sync ', async (dependencies) => {
        const { element } = await setup(dependencies)

        expect(element.state.syncState).toEqual('pristine')
        await element.processEvent('reload', {})
        expect(element.state.syncState).toEqual('pristine')
        await element.processEvent('reload', { triggerSync: true })
        expect(element.state.syncState).not.toEqual('pristine')
    })

    it('should be able to switch look up of latest collection entries, bookmarks, or visits, depending on set filter', async (dependencies) => {
        const {
            storage: {
                modules: { overview },
            },
        } = dependencies
        const { element } = await setup(dependencies)

        for (const page of INTEGRATION_TEST_DATA.pages) {
            await overview.createPage(page)
        }

        await dependencies.storage.modules.metaPicker.createMobileListEntry({
            fullPageUrl: INTEGRATION_TEST_DATA.pages[0].fullUrl,
        })
        await dependencies.storage.modules.metaPicker.createMobileListEntry({
            fullPageUrl: INTEGRATION_TEST_DATA.pages[3].fullUrl,
        })

        await overview.starPage({ url: INTEGRATION_TEST_DATA.pages[1].url })
        await overview.visitPage({ url: INTEGRATION_TEST_DATA.pages[1].url })
        await overview.visitPage({ url: INTEGRATION_TEST_DATA.pages[4].url })

        const logic = element.logic as Logic

        element.processMutation({
            selectedListName: { $set: ListsFilter.MAGIC_BMS_FILTER },
        })
        expect(
            await logic['choosePageEntryLoader'](element.state)(element.state),
        ).toEqual([
            { url: INTEGRATION_TEST_DATA.pages[1].url, date: expect.any(Date) },
        ])

        element.processMutation({
            selectedListName: { $set: ListsFilter.MAGIC_VISITS_FILTER },
        })
        expect(
            await logic['choosePageEntryLoader'](element.state)(element.state),
        ).toEqual([
            { url: INTEGRATION_TEST_DATA.pages[4].url, date: expect.any(Date) },
            { url: INTEGRATION_TEST_DATA.pages[1].url, date: expect.any(Date) },
        ])

        element.processMutation({
            selectedListName: { $set: SPECIAL_LIST_NAMES.MOBILE },
        })
        expect(
            await logic['choosePageEntryLoader'](element.state)(element.state),
        ).toEqual([
            { url: INTEGRATION_TEST_DATA.pages[3].url, date: expect.any(Date) },
            { url: INTEGRATION_TEST_DATA.pages[0].url, date: expect.any(Date) },
        ])
    })

    it("should be able to update an already tracked page's lists, tags, and notes", async (dependencies) => {
        const { storage } = dependencies
        const { element } = await setup({ ...dependencies, pageSize: 1 })

        await storage.modules.overview.createPage(
            INTEGRATION_TEST_DATA.pages[0],
        )
        await storage.modules.overview.createPage(
            INTEGRATION_TEST_DATA.pages[1],
        )

        await storage.modules.metaPicker.createMobileListEntry({
            fullPageUrl: INTEGRATION_TEST_DATA.pages[0].fullUrl,
        })
        await storage.modules.metaPicker.createMobileListEntry({
            fullPageUrl: INTEGRATION_TEST_DATA.pages[1].fullUrl,
        })

        await element.init()
        expect(element.state.pages).toEqual(
            new Map([[UI_PAGE_2.url, UI_PAGE_2]]),
        )

        await element.processEvent('loadMore', {})
        expect(element.state.pages).toEqual(
            new Map([
                [UI_PAGE_2.url, UI_PAGE_2],
                [UI_PAGE_1.url, UI_PAGE_1],
            ]),
        )

        await element.processEvent('updatePage', {
            page: {
                ...UI_PAGE_2,
                lists: ['test'],
            },
        })

        expect(element.state.pages).toEqual(
            new Map([
                [UI_PAGE_2.url, { ...UI_PAGE_2, lists: ['test'] }],
                [UI_PAGE_1.url, UI_PAGE_1],
            ]),
        )

        await element.processEvent('updatePage', {
            page: {
                ...UI_PAGE_2,
                tags: ['test'],
            },
        })

        expect(element.state.pages).toEqual(
            new Map([
                [UI_PAGE_2.url, { ...UI_PAGE_2, tags: ['test'] }],
                [UI_PAGE_1.url, UI_PAGE_1],
            ]),
        )

        await element.processEvent('updatePage', {
            page: {
                ...UI_PAGE_2,
                notes: [{ url: 'TESTNOTE' } as any],
            },
        })

        expect(element.state.pages).toEqual(
            new Map([
                [
                    UI_PAGE_2.url,
                    { ...UI_PAGE_2, notes: [{ url: 'TESTNOTE' } as any] },
                ],
                [UI_PAGE_1.url, UI_PAGE_1],
            ]),
        )

        await element.processEvent('updatePage', {
            page: {
                ...UI_PAGE_2,
                lists: ['test'],
                tags: ['test'],
                notes: [{ url: 'TESTNOTE' } as any],
            },
        })

        expect(element.state.pages).toEqual(
            new Map([
                [
                    UI_PAGE_2.url,
                    {
                        ...UI_PAGE_2,
                        lists: ['test'],
                        tags: ['test'],
                        notes: [{ url: 'TESTNOTE' } as any],
                    },
                ],
                [UI_PAGE_1.url, UI_PAGE_1],
            ]),
        )
    })
})
