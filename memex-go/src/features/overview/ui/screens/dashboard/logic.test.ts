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
import {
    SPECIAL_LIST_NAMES,
    SPECIAL_LIST_IDS,
} from '@worldbrain/memex-common/lib/storage/modules/lists/constants'
import {
    ALL_SAVED_FILTER_ID,
    ALL_SAVED_FILTER_NAME,
} from '../dashboard/constants'
import { initNormalizedState } from '@worldbrain/memex-common/lib/common-ui/utils/normalized-state'

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
    listIds: [],
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
    listIds: [],
    type: 'page',
}

describe('dashboard screen UI logic tests', () => {
    const it = makeStorageTestFactory()

    async function setup(
        options: Omit<Props, 'navigation' | 'appState'> & {
            navigation: FakeNavigation
        },
    ) {
        await options.services.localStorage.set(storageKeys.initSyncFlag, true)
        await options.services.localStorage.set(storageKeys.retroSyncFlag, true)
        await options.storage.modules.metaPicker.createInboxListIfAbsent({})
        await options.storage.modules.metaPicker.createMobileListIfAbsent({})

        const logic = new Logic({
            ...options,
            navigation: options.navigation as any,
            appState: {
                addEventListener: () => {},
                removeEventListener: () => {},
            } as any,
        })
        const element = new FakeStatefulUIElement<State, Event>(logic)

        return { element, logic }
    }

    async function createRecentlyVisitedPage(
        page: Omit<Page, 'domain' | 'hostname' | 'pageUrl'>,
        dependencies: { storage: Storage },
    ) {
        await dependencies.storage.modules.overview.createPage(page)
        await dependencies.storage.modules.metaPicker.createMobileListEntry({
            fullPageUrl: page.fullUrl,
        })
        await dependencies.storage.modules.overview.visitPage({ url: page.url })
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

    it(
        'should nav away to do retrospective sync if not yet done (but init sync already done)',
        { skipSyncTests: true },
        async (dependencies) => {
            const { element } = await setup(dependencies)

            await dependencies.services.localStorage.set(
                storageKeys.retroSyncFlag,
                false,
            )
            await dependencies.services.localStorage.set(
                storageKeys.initSyncFlag,
                false,
            )
            await element.init()
            expect(dependencies.navigation.popRequests()).toEqual([]) // Init sync flag not yet set; shouldn't nav away

            await dependencies.services.localStorage.set(
                storageKeys.initSyncFlag,
                true,
            )
            await element.init()
            expect(dependencies.navigation.popRequests()).toEqual([
                {
                    type: 'navigate',
                    target: 'CloudSync',
                    params: { shouldRetrospectiveSync: true },
                },
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
                selectedListId: ALL_SAVED_FILTER_ID,
                couldHaveMore: false,
                actionState: 'pristine',
                actionFinishedAt: 0,
                pages: initNormalizedState(),
            }),
        )
    })

    it('should load correctly with saved pages', async (dependencies) => {
        const { element } = await setup(dependencies)

        await insertIntegrationTestData(dependencies)
        await dependencies.storage.modules.metaPicker.createMobileListEntry({
            fullPageUrl: INTEGRATION_TEST_DATA.pages[0].fullUrl,
        })
        await dependencies.storage.modules.overview.visitPage({
            url: INTEGRATION_TEST_DATA.pages[0].url,
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
                selectedListId: ALL_SAVED_FILTER_ID,
                pages: {
                    allIds: ['test.com'],
                    byId: {
                        ['test.com']: {
                            ...UI_PAGE_1,
                            isStarred: true,
                            tags: [],
                            listIds: [expect.any(Number)],
                        },
                    },
                },
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
        await storage.modules.overview.visitPage({
            url: INTEGRATION_TEST_DATA.pages[0].url,
        })
        await storage.modules.metaPicker.createMobileListEntry({
            fullPageUrl: INTEGRATION_TEST_DATA.pages[1].fullUrl,
        })
        await storage.modules.overview.visitPage({
            url: INTEGRATION_TEST_DATA.pages[1].url,
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
                selectedListId: ALL_SAVED_FILTER_ID,
                pages: {
                    allIds: [UI_PAGE_2.url],
                    byId: {
                        [UI_PAGE_2.url]: UI_PAGE_2,
                    },
                },
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
                selectedListId: ALL_SAVED_FILTER_ID,
                pages: {
                    allIds: [UI_PAGE_2.url, UI_PAGE_1.url],
                    byId: {
                        [UI_PAGE_2.url]: UI_PAGE_2,
                        [UI_PAGE_1.url]: UI_PAGE_1,
                    },
                },
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
                selectedListId: ALL_SAVED_FILTER_ID,
                pages: {
                    allIds: [UI_PAGE_2.url, UI_PAGE_1.url],
                    byId: {
                        [UI_PAGE_2.url]: UI_PAGE_2,
                        [UI_PAGE_1.url]: UI_PAGE_1,
                    },
                },
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
                selectedListId: ALL_SAVED_FILTER_ID,
                pages: {
                    allIds: [UI_PAGE_2.url],
                    byId: {
                        [UI_PAGE_2.url]: UI_PAGE_2,
                    },
                },
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
        expect(element.state.pages.byId).toEqual({ ['test.com']: UI_PAGE_1 })

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
                selectedListId: ALL_SAVED_FILTER_ID,
                pages: initNormalizedState(),
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
        expect(secondElement.state.pages.byId).toEqual({})
    })

    // it('should be able to star + unstar pages', async (dependencies) => {
    //     const { storage } = dependencies
    //     const { element } = await setup(dependencies)

    //     const { url } = INTEGRATION_TEST_DATA.pages[0]
    //     await createRecentlyVisitedPage(INTEGRATION_TEST_DATA.pages[0], {
    //         storage,
    //     })

    //     await element.init()
    //     const pageA = element.state.pages.byId[url]!
    //     expect(pageA.isStarred).toBeFalsy()

    //     await element.processEvent('togglePageStar', {
    //         url,
    //     })
    //     const pageB = element.state.pages.byId[url]!
    //     expect(pageB.isStarred).toBe(true)
    //     expect(await storage.modules.overview.isPageStarred({ url })).toBe(true)

    //     await element.processEvent('togglePageStar', {
    //         url,
    //     })
    //     const pageC = element.state.pages.byId[url]!
    //     expect(await storage.modules.overview.isPageStarred({ url })).toBe(
    //         false,
    //     )
    //     expect(pageC.isStarred).toBe(false)
    // })

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
                modules: { overview, metaPicker },
            },
        } = dependencies
        const { element } = await setup(dependencies)

        for (const page of INTEGRATION_TEST_DATA.pages) {
            await overview.createPage(page)
            await metaPicker.createInboxListEntry({ fullPageUrl: page.fullUrl })
        }

        await metaPicker.createMobileListEntry({
            fullPageUrl: INTEGRATION_TEST_DATA.pages[0].fullUrl,
        })
        await metaPicker.createMobileListEntry({
            fullPageUrl: INTEGRATION_TEST_DATA.pages[3].fullUrl,
        })

        await overview.starPage({ url: INTEGRATION_TEST_DATA.pages[1].url })
        await overview.visitPage({ url: INTEGRATION_TEST_DATA.pages[1].url })
        await overview.visitPage({ url: INTEGRATION_TEST_DATA.pages[4].url })

        const logic = element.logic as Logic

        element.processMutation({
            selectedListId: { $set: ALL_SAVED_FILTER_ID },
        })
        expect(
            await logic['choosePageEntryLoader'](element.state)(element.state),
        ).toEqual([
            { url: INTEGRATION_TEST_DATA.pages[4].url, date: expect.any(Date) },
            { url: INTEGRATION_TEST_DATA.pages[1].url, date: expect.any(Date) },
        ])

        element.processMutation({
            selectedListId: { $set: SPECIAL_LIST_IDS.MOBILE },
        })
        expect(
            await logic['choosePageEntryLoader'](element.state)(element.state),
        ).toEqual([
            { url: INTEGRATION_TEST_DATA.pages[3].url, date: expect.any(Date) },
            { url: INTEGRATION_TEST_DATA.pages[0].url, date: expect.any(Date) },
        ])

        element.processMutation({
            selectedListId: { $set: SPECIAL_LIST_IDS.INBOX },
        })
        expect(
            await logic['choosePageEntryLoader'](element.state)(element.state),
        ).toEqual([
            { url: INTEGRATION_TEST_DATA.pages[4].url, date: expect.any(Date) },
            { url: INTEGRATION_TEST_DATA.pages[3].url, date: expect.any(Date) },
            { url: INTEGRATION_TEST_DATA.pages[2].url, date: expect.any(Date) },
            { url: INTEGRATION_TEST_DATA.pages[1].url, date: expect.any(Date) },
            { url: INTEGRATION_TEST_DATA.pages[0].url, date: expect.any(Date) },
        ])
    })

    it("should be able to update an already tracked page's lists, and notes", async (dependencies) => {
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
        await storage.modules.overview.visitPage({
            url: INTEGRATION_TEST_DATA.pages[0].url,
        })
        await storage.modules.metaPicker.createMobileListEntry({
            fullPageUrl: INTEGRATION_TEST_DATA.pages[1].fullUrl,
        })
        await storage.modules.overview.visitPage({
            url: INTEGRATION_TEST_DATA.pages[1].url,
        })

        await element.init()
        expect(element.state.pages.byId).toEqual({
            [UI_PAGE_2.url]: UI_PAGE_2,
        })

        await element.processEvent('loadMore', {})
        expect(element.state.pages.byId).toEqual({
            [UI_PAGE_2.url]: UI_PAGE_2,
            [UI_PAGE_1.url]: UI_PAGE_1,
        })

        await element.processEvent('updatePage', {
            page: {
                ...UI_PAGE_2,
                listIds: [123],
            },
        })

        expect(element.state.pages.byId).toEqual({
            [UI_PAGE_2.url]: { ...UI_PAGE_2, listIds: [123] },
            [UI_PAGE_1.url]: UI_PAGE_1,
        })

        await element.processEvent('updatePage', {
            page: {
                ...UI_PAGE_2,
                notes: [{ url: 'TESTNOTE' } as any],
            },
        })

        expect(element.state.pages.byId).toEqual({
            [UI_PAGE_2.url]: {
                ...UI_PAGE_2,
                notes: [{ url: 'TESTNOTE' } as any],
            },
            [UI_PAGE_1.url]: UI_PAGE_1,
        })

        await element.processEvent('updatePage', {
            page: {
                ...UI_PAGE_2,
                listIds: [123],
                notes: [{ url: 'TESTNOTE' } as any],
            },
        })

        expect(element.state.pages.byId).toEqual({
            [UI_PAGE_2.url]: {
                ...UI_PAGE_2,
                listIds: [123],
                notes: [{ url: 'TESTNOTE' } as any],
            },
            [UI_PAGE_1.url]: UI_PAGE_1,
        })
    })
})
