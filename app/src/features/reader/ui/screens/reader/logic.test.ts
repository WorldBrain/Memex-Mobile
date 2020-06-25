import Logic, { State, Event, Props } from './logic'
import { FakeStatefulUIElement } from 'src/ui/index.tests'
import { makeStorageTestFactory } from 'src/index.tests'
import { FakeNavigation } from 'src/tests/navigation'
import { NAV_PARAMS } from 'src/ui/navigation/constants'
import { Anchor } from 'src/content-script/types'

const TEST_URL_1 = 'getmemex.com'
const TEST_TITLE_1 = 'test'
const TEST_ANCHOR_1: Anchor = {
    quote: 'this is a test',
    descriptor: { content: 'test', strategy: 'test' },
}

describe('reader screen UI logic tests', () => {
    const it = makeStorageTestFactory()

    function setup(
        options: Omit<Props, 'navigation'> & { navigation: FakeNavigation },
    ) {
        const logic = new Logic({
            ...options,
            navigation: {
                ...options.navigation,
                getParam: () => ({ url: TEST_URL_1, title: TEST_TITLE_1 }),
            } as any,
        })
        const element = new FakeStatefulUIElement<State, Event>(logic)

        return { element, logic, ...options }
    }

    it('should be able to change text selection state', async dependencies => {
        const { element } = setup(dependencies)

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

    it('should be able to toggle bookmark state', async dependencies => {
        const { element } = setup(dependencies)
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

    it('should be able to set reader error message', async dependencies => {
        const { element } = setup(dependencies)

        const TEST_MSG_1 = 'This is a test error'

        expect(element.state.errorMessage).toBeUndefined()
        element.processEvent('setErrorMessage', { message: TEST_MSG_1 })
        expect(element.state.errorMessage).toEqual(TEST_MSG_1)
        element.processEvent('setErrorMessage', {})
        expect(element.state.errorMessage).toEqual('An error happened')
    })

    it('should be able to create a highlight from a text selection', async dependencies => {
        const { element } = setup(dependencies)
        const { pageEditor } = dependencies.storage.modules

        expect(await pageEditor.findNotes({ url: TEST_URL_1 })).toEqual([])
        expect(element.state.hasNotes).toBe(false)
        expect(element.state.highlights).toEqual([])

        await element.processEvent('createHighlight', { anchor: TEST_ANCHOR_1 })

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

    it('should be able to signal intent to create an annot from a text selection', async dependencies => {
        const { element, navigation } = setup(dependencies)

        await element.processEvent('createAnnotation', {
            anchor: TEST_ANCHOR_1,
        })

        expect(navigation.popRequests()).toEqual([
            {
                type: 'navigate',
                target: 'NoteEditor',
                params: {
                    [NAV_PARAMS.NOTE_EDITOR]: {
                        mode: 'create',
                        highlightText: TEST_ANCHOR_1.quote,
                        anchor: TEST_ANCHOR_1,
                        previousRoute: 'Reader',
                        pageTitle: TEST_TITLE_1,
                        pageUrl: Logic.formUrl(TEST_URL_1),
                        readerScrollPercent: 0,
                    },
                },
            },
        ])
    })

    it('should be able to click-to-edit highlights', async dependencies => {
        const { element, navigation } = setup(dependencies)
        const { pageEditor } = dependencies.storage.modules

        const testNote = {
            pageTitle: 'test title',
            pageUrl: 'test.com',
            comment: 'test comment',
            body: 'test highlight',
            selector: {},
        }

        const { object } = await pageEditor.createNote(testNote)

        await element.processEvent('editHighlight', {
            highlightUrl: object.url,
        })

        expect(navigation.popRequests()).toEqual([
            {
                type: 'navigate',
                target: 'NoteEditor',
                params: {
                    [NAV_PARAMS.NOTE_EDITOR]: {
                        mode: 'update',
                        noteUrl: object.url,
                        highlightText: testNote.body,
                        noteText: testNote.comment,
                        anchor: testNote.selector,
                        previousRoute: 'Reader',
                        pageTitle: TEST_TITLE_1,
                        pageUrl: Logic.formUrl(TEST_URL_1),
                        readerScrollPercent: 0,
                    },
                },
            },
        ])
    })

    it('should be able to set reader scroll state', dependencies => {
        const { element } = setup(dependencies)

        const step = 1

        for (let percent = step; percent < 1; percent += step) {
            expect(element.state.readerScrollPercent).toEqual(percent - step)
            element.processEvent('setReaderScrollPercent', { percent })
            expect(element.state.readerScrollPercent).toEqual(percent)
        }
    })

    it('should be able to nav back to overview', async dependencies => {
        const { element, navigation } = setup(dependencies)

        expect(navigation.popRequests()).toEqual([])
        element.processEvent('goBack', null)
        expect(navigation.popRequests()).toEqual([
            {
                type: 'navigate',
                target: 'Overview',
            },
        ])
    })

    it('should be able to nav to page editor with state', async dependencies => {
        const { element, navigation } = setup(dependencies)

        expect(navigation.popRequests()).toEqual([])

        const readerScrollPercent = 0.3
        const navRequests: any[] = []

        // Change default reader scroll state to see if it appears in nav params
        element.processEvent('setReaderScrollPercent', {
            percent: readerScrollPercent,
        })

        for (const mode of ['collections', 'notes', 'tags'] as any[]) {
            element.processEvent('goToPageEditor', { mode })

            navRequests.push({
                type: 'navigate',
                target: 'PageEditor',
                params: {
                    [NAV_PARAMS.PAGE_EDITOR]: {
                        mode,
                        previousRoute: 'Reader',
                        readerScrollPercent,
                        pageUrl: Logic.formUrl(TEST_URL_1),
                    },
                },
            })
        }

        expect(navigation.popRequests()).toEqual(navRequests)
    })
})
