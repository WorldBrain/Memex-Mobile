import Logic, { State, Event, Props } from './logic'
import { FakeStatefulUIElement } from 'src/ui/index.tests'
import { FakeNavigation } from 'src/tests/navigation'
import { NAV_PARAMS } from 'src/ui/navigation/constants'

describe('note editor UI logic tests', () => {
    function setup(deps: Partial<Props>, navParams: any = {}) {
        const navigation = new FakeNavigation({
            [NAV_PARAMS.NOTE_EDITOR]: navParams,
        })
        const logic = new Logic({
            ...(deps as Props),
            navigation: navigation as any,
        })
        const element = new FakeStatefulUIElement<State, Event>(logic)

        return { element, navigation }
    }

    it('should be able to update note text value', async () => {
        const { element } = setup({})

        const testText = 'test'

        expect(element.state.noteText).toEqual('')
        await element.processEvent('changeNoteText', { value: testText })
        expect(element.state.noteText).toEqual(testText)
        await element.processEvent('changeNoteText', {
            value: testText + testText,
        })
        expect(element.state.noteText).toEqual(testText + testText)
    })

    it('should be able to set highlighted text lines', async () => {
        const { element } = setup({})

        expect(element.state.highlightTextLines).toEqual(undefined)
        await element.processEvent('setHighlightTextLines', { lines: 10 })
        expect(element.state.highlightTextLines).toEqual(10)
    })

    it('should be able to set "show more" state', async () => {
        const { element } = setup({})

        expect(element.state.showAllText).toBe(false)
        await element.processEvent('setShowAllText', { show: true })
        expect(element.state.showAllText).toBe(true)
        await element.processEvent('setShowAllText', { show: false })
        expect(element.state.showAllText).toBe(false)
    })

    it('should be able to save a new note', async () => {
        const testText = 'test'
        const testUrl = 'test.com'

        let storedNote: any
        const { element, navigation } = setup(
            {
                storage: {
                    modules: {
                        pageEditor: {
                            createNote: (note: any) => (storedNote = note),
                        },
                    } as any,
                },
            },
            { mode: 'create', pageUrl: testUrl },
        )

        expect(navigation.popRequests()).toEqual([])
        expect(storedNote).toBeUndefined()
        await element.processEvent('changeNoteText', { value: testText })
        await element.processEvent('saveNote', {})
        expect(navigation.popRequests()).toEqual([
            {
                type: 'navigate',
                target: 'PageEditor',
                params: {
                    [NAV_PARAMS.PAGE_EDITOR]: {
                        mode: 'notes',
                        pageUrl: testUrl,
                        selectedList: undefined,
                    },
                },
            },
        ])
        expect(storedNote).toEqual({
            pageUrl: testUrl,
            comment: testText,
            pageTitle: '',
        })
    })

    it('should be able to edit an existing note', async () => {
        const testText = 'test'
        const testUrl = 'test.com'
        const testNoteUrl = testUrl + '/#23423'

        let storedNote: any
        const { element, navigation } = setup(
            {
                storage: {
                    modules: {
                        pageEditor: {
                            updateNoteText: (note: any) => (storedNote = note),
                        },
                    } as any,
                },
            },
            { mode: 'update', noteUrl: testNoteUrl, pageUrl: testUrl },
        )

        expect(navigation.popRequests()).toEqual([])
        expect(storedNote).toBeUndefined()
        await element.processEvent('changeNoteText', { value: testText })
        await element.processEvent('saveNote', {})
        expect(navigation.popRequests()).toEqual([
            {
                type: 'navigate',
                target: 'PageEditor',
                params: {
                    [NAV_PARAMS.PAGE_EDITOR]: {
                        mode: 'notes',
                        pageUrl: testUrl,
                        selectedList: undefined,
                    },
                },
            },
        ])
        expect(storedNote).toEqual({
            url: testNoteUrl,
            text: testText,
        })
    })
})
