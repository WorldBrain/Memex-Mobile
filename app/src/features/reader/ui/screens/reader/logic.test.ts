import Logic, { State, Event } from './logic'
import { FakeStatefulUIElement } from 'src/ui/index.tests'
import { makeStorageTestFactory } from 'src/index.tests'
import type { TestDevice } from 'src/types.tests'
import { FakeRoute } from 'src/tests/navigation'
import { Anchor, Highlight } from 'src/content-script/types'

const TEST_FULL_URL_1 = 'https://getmemex.com'
const TEST_URL_1 = 'getmemex.com'
const TEST_TITLE_1 = 'test'
const TEST_ANCHOR_1: Anchor = {
    quote: 'this is a test',
    descriptor: { content: 'test', strategy: 'test' },
}

describe('reader screen UI logic tests', () => {
    const it = makeStorageTestFactory()

    async function setup(options: TestDevice) {
        const logic = new Logic({
            ...options,
            loadContentScript: async () => '',
            navigation: options.navigation as any,
            route: new FakeRoute({
                url: TEST_URL_1,
                title: TEST_TITLE_1,
            }) as any,
        })
        const element = new FakeStatefulUIElement<State, Event>(logic)

        // Ensure a page exists in the DB already for this fake route
        await options.storage.modules.overview.createPage({
            fullUrl: TEST_FULL_URL_1,
            url: TEST_URL_1,
            fullTitle: TEST_TITLE_1,
            text: '',
        })

        return { element, logic, ...options }
    }

    it('should be able to change text selection state', async (dependencies) => {
        const { element } = await setup(dependencies)

        const testTextA = 'some text'
        const testTextB = 'some more text'

        expect(element.state.selectedText).toBeUndefined()
        await element.processEvent('setTextSelection', { text: testTextA })
        expect(element.state.selectedText).toEqual(testTextA)
        await element.processEvent('setTextSelection', { text: testTextB })
        expect(element.state.selectedText).toEqual(testTextB)
        await element.processEvent('setTextSelection', { text: '' })
        expect(element.state.selectedText).toBeUndefined()
    })

    it('should be able to toggle bookmark state', async (dependencies) => {
        const { element } = await setup(dependencies)
        const { overview } = dependencies.storage.modules

        expect(element.state.isBookmarked).toBe(false)
        expect(await overview.isPageStarred({ url: TEST_URL_1 })).toBe(false)

        await element.processEvent('toggleBookmark', null)
        expect(element.state.isBookmarked).toBe(true)
        expect(await overview.isPageStarred({ url: TEST_URL_1 })).toBe(true)

        await element.processEvent('toggleBookmark', null)
        expect(element.state.isBookmarked).toBe(false)
        expect(await overview.isPageStarred({ url: TEST_URL_1 })).toBe(false)
    })

    it('should be able to set reader error', async (dependencies) => {
        const { element } = await setup(dependencies)

        const TEST_MSG_1 = 'This is a test error'
        const dummyError = new Error(TEST_MSG_1)

        expect(element.state.error).toBeUndefined()
        element.processEvent('setError', { error: dummyError })
        expect(element.state.error).toEqual(dummyError)
        expect(element.state.error!.message).toEqual(TEST_MSG_1)
        element.processEvent('setError', { error: undefined })
        expect(element.state.error).toBeUndefined()
    })

    it('should be able to report reader error', async (dependencies) => {
        const {
            element,
            services: { errorTracker },
        } = await setup(dependencies)

        const TEST_MSG_1 = 'This is a test error'
        const dummyError = new Error(TEST_MSG_1)

        expect(element.state.error).toBeUndefined()
        element.processEvent('setError', { error: dummyError })
        expect(element.state.error).toEqual(dummyError)
        expect(element.state.error!.message).toEqual(TEST_MSG_1)
        element.processEvent('reportError', null)

        expect((errorTracker['api'] as any).captured).toEqual([dummyError])
    })

    it('should be able to create a highlight from a text selection', async (dependencies) => {
        const { element } = await setup(dependencies)
        const { pageEditor } = dependencies.storage.modules

        let renderedHighlight: Highlight | null = null
        const mockRenderHighlight = (h: Highlight) => {
            renderedHighlight = h
        }

        expect(await pageEditor.findNotes({ url: TEST_URL_1 })).toEqual([])
        expect(element.state.hasNotes).toBe(false)
        expect(element.state.highlights).toEqual([])

        expect(renderedHighlight).toBeNull()
        await element.processEvent('createHighlight', {
            anchor: TEST_ANCHOR_1,
            renderHighlight: mockRenderHighlight,
        })

        expect(renderedHighlight).toEqual({
            anchor: TEST_ANCHOR_1,
            url: expect.any(String),
        })
        expect(await pageEditor.findNotes({ url: TEST_URL_1 })).toEqual([
            expect.objectContaining({
                pageUrl: TEST_URL_1,
                pageTitle: TEST_TITLE_1,
                selector: TEST_ANCHOR_1,
                body: TEST_ANCHOR_1.quote,
            }),
        ])
        expect(element.state.hasNotes).toBe(true)
        expect(element.state.highlights).toEqual([
            expect.objectContaining({
                anchor: TEST_ANCHOR_1,
            }),
        ])
    })

    it('should be able to create an annotation from a text selection', async (dependencies) => {
        const { element, navigation } = await setup(dependencies)
        const { pageEditor } = dependencies.storage.modules

        let renderedHighlight: Highlight | null = null
        const mockRenderHighlight = (h: Highlight) => {
            renderedHighlight = h
        }

        await element.processEvent('createAnnotation', {
            anchor: TEST_ANCHOR_1,
            renderHighlight: mockRenderHighlight,
        })

        expect(renderedHighlight).toEqual({
            anchor: TEST_ANCHOR_1,
            url: expect.any(String),
        })
        expect(await pageEditor.findNotes({ url: TEST_URL_1 })).toEqual([
            expect.objectContaining({
                pageUrl: TEST_URL_1,
                pageTitle: TEST_TITLE_1,
                selector: TEST_ANCHOR_1,
                body: TEST_ANCHOR_1.quote,
            }),
        ])
        expect(element.state.hasNotes).toBe(true)
        expect(element.state.highlights).toEqual([
            expect.objectContaining({
                anchor: TEST_ANCHOR_1,
            }),
        ])
        expect(navigation.popRequests()).toEqual([
            {
                type: 'navigate',
                target: 'NoteEditor',
                params: {
                    mode: 'update',
                    highlightText: TEST_ANCHOR_1.quote,
                    anchor: TEST_ANCHOR_1,
                    pageUrl: Logic.formUrl(TEST_URL_1),
                    noteUrl: renderedHighlight!.url,
                },
            },
        ])
    })

    it('should be able to click-to-edit highlights', async (dependencies) => {
        const { element, navigation } = await setup(dependencies)
        const { pageEditor, overview } = dependencies.storage.modules

        const testNote = {
            pageTitle: 'test title',
            pageUrl: 'test.com',
            comment: 'test comment',
            body: 'test highlight',
            selector: {},
        }

        await overview.createPage({
            url: testNote.pageUrl,
            fullUrl: 'https://' + testNote.pageUrl,
            fullTitle: testNote.pageTitle,
            text: '',
        })

        const { object } = await pageEditor.createAnnotation(testNote)

        await element.processEvent('editHighlight', {
            highlightUrl: object.url,
        })

        expect(navigation.popRequests()).toEqual([
            {
                type: 'navigate',
                target: 'NoteEditor',
                params: {
                    mode: 'update',
                    noteUrl: object.url,
                    highlightText: testNote.body,
                    noteText: testNote.comment,
                    anchor: testNote.selector,
                    pageTitle: TEST_TITLE_1,
                    pageUrl: Logic.formUrl(TEST_URL_1),
                },
            },
        ])
    })

    it('should be able to nav back to overview', async (dependencies) => {
        const { element, navigation } = await setup(dependencies)

        expect(navigation.popRequests()).toEqual([])
        element.processEvent('goBack', null)
        expect(navigation.popRequests()).toEqual([{ type: 'goBack' }])
    })
})
