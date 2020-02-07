import Logic, { State, Event, LogicDependencies } from './logic'
import initTestData from './test-data'
import { FakeStatefulUIElement } from 'src/ui/index.tests'
import { makeStorageTestFactory } from 'src/index.tests'
import { Storage } from 'src/storage/types'
import {
    insertIntegrationTestData,
    INTEGRATION_TEST_DATA,
} from 'src/tests/shared-fixtures/integration'
import { UIPage } from 'src/features/overview/types'

const { pages } = initTestData()
const testPages = [...pages.values()]
const testPageUrls = testPages.map(p => p.url)

describe('pages view UI logic tests', () => {
    const it = makeStorageTestFactory()

    function setup(options: LogicDependencies) {
        const logic = new Logic(options)
        const element = new FakeStatefulUIElement<State, Event>(logic)

        return { element }
    }

    it('should load correctly without any saved pages', async ({ storage }) => {
        const { element } = setup({ storage })

        await element.init()
        expect(element.state).toEqual({
            loadState: 'done',
            loadMoreState: 'pristine',
            couldHaveMore: false,
            deletingState: 'pristine',
            deletingFinishedAt: 0,
            pages: new Map(),
        })
    })

    it('should load correctly with saved pages', async ({ storage }) => {
        const { element } = setup({ storage })

        await insertIntegrationTestData({ storage })
        const mobileListId = await storage.modules.metaPicker.createMobileListIfAbsent()
        await storage.modules.metaPicker.createPageListEntry({
            listId: mobileListId,
            pageUrl: INTEGRATION_TEST_DATA.pages[0].url,
        })

        await element.init()
        expect(element.state).toEqual({
            loadState: 'done',
            loadMoreState: 'pristine',
            couldHaveMore: false,
            deletingState: 'pristine',
            deletingFinishedAt: 0,
            pages: new Map([
                [
                    'test.com',
                    {
                        url: 'test.com',
                        pageUrl: 'test.com',
                        titleText: 'This is a test page',
                        date: 'a few seconds ago',
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
        const firstEntry: UIPage = {
            url: 'test.com.bla',
            pageUrl: 'test.com.bla',
            titleText: 'This is a test page bla',
            date: 'a few seconds ago',
        }
        expect(element.state).toEqual({
            loadState: 'done',
            loadMoreState: 'pristine',
            couldHaveMore: true,
            deletingState: 'pristine',
            deletingFinishedAt: 0,
            pages: new Map([['test.com.bla', firstEntry]]),
        })

        await element.processEvent('loadMore', {})
        const secondEntry: UIPage = {
            url: 'test.com',
            pageUrl: 'test.com',
            titleText: 'This is a test page',
            date: 'a few seconds ago',
        }
        expect(element.state).toEqual({
            loadState: 'done',
            loadMoreState: 'done',
            couldHaveMore: true,
            deletingState: 'pristine',
            deletingFinishedAt: 0,
            pages: new Map([
                ['test.com.bla', firstEntry],
                ['test.com', secondEntry],
            ]),
        })

        await element.processEvent('loadMore', {})
        expect(element.state).toEqual({
            loadState: 'done',
            loadMoreState: 'done',
            couldHaveMore: false,
            deletingState: 'pristine',
            deletingFinishedAt: 0,
            pages: new Map([
                ['test.com.bla', firstEntry],
                ['test.com', secondEntry],
            ]),
        })
    })

    it('should be able to delete pages', async ({ storage }) => {
        const { element } = setup({ storage })

        await insertIntegrationTestData({ storage })
        await element.init()

        const url = INTEGRATION_TEST_DATA.pages[0].url
        await element.processEvent('deletePage', {
            url,
        })
        expect(element.state).toEqual({
            loadState: 'done',
            loadMoreState: 'pristine',
            couldHaveMore: false,
            deletingState: 'done',
            deletingFinishedAt: expect.any(Number),
            pages: new Map([]),
        })
        expect(element.state.deletingFinishedAt).toBeGreaterThan(
            Date.now() - 5000,
        )
        expect(
            await storage.manager.collection('pages').findObjects({}),
        ).toEqual([])
    })

    it('should be able to star + unstar pages', async ({ storage }) => {
        const { element } = setup({ storage })

        const url = testPageUrls[0]
        await element.processEvent('setPages', {
            pages: testPages,
        })
        const pageA = element.state.pages.get(url)!
        expect(pageA.isStarred).toBeFalsy()

        await element.processEvent('togglePageStar', {
            url,
        })
        const pageB = element.state.pages.get(url)!
        expect(pageB.isStarred).toBeTruthy()

        await element.processEvent('togglePageStar', {
            url,
        })
        const pageC = element.state.pages.get(url)!
        expect(pageC.isStarred).toBeFalsy()
    })
})
