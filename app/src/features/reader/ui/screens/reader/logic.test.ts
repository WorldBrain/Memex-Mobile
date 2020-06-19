import Logic, { State, Event, Props } from './logic'
import { FakeStatefulUIElement } from 'src/ui/index.tests'
import { makeStorageTestFactory } from 'src/index.tests'
import { FakeNavigation } from 'src/tests/navigation'
import { NAV_PARAMS } from 'src/ui/navigation/constants'

const TEST_URL_1 = 'getmemex.com'
const TEST_TITLE_1 = 'test'

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
                    },
                },
            },
        ])
    })
})
