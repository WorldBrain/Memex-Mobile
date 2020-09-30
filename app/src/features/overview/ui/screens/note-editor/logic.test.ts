import Logic, { State, Event, Props } from './logic'
import { FakeStatefulUIElement } from 'src/ui/index.tests'
import { FakeNavigation, FakeRoute } from 'src/tests/navigation'

interface NoteEditorNavigationParams {}

describe('note editor UI logic tests', () => {
    function setup(
        deps: Partial<Props>,
        navParams: Partial<NoteEditorNavigationParams> = {},
    ) {
        const navigation = new FakeNavigation({ navParams })
        const logic = new Logic({
            ...(deps as Props),
            navigation: navigation as any,
            route: new FakeRoute(navParams) as any,
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

    it('should be able to save a new note, if highlight anchor absent', async () => {
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
        await element.processEvent('saveNote', null)
        expect(navigation.popRequests()).toEqual([{ type: 'goBack' }])
        expect(storedNote).toEqual({
            pageUrl: testUrl,
            comment: testText,
            pageTitle: '',
        })
    })

    it('should be able to save a new anott, if highlight anchor provided', async () => {
        const testText = 'test'
        const testUrl = 'test.com'
        const testAnchor = { quote: testText } as any

        let storedAnnotation: any
        const { element, navigation } = setup(
            {
                storage: {
                    modules: {
                        pageEditor: {
                            createAnnotation: (annot: any) =>
                                (storedAnnotation = annot),
                        },
                    } as any,
                },
            },
            {
                mode: 'create',
                pageUrl: testUrl,
                anchor: testAnchor,
                highlightText: testText,
            },
        )

        expect(navigation.popRequests()).toEqual([])
        expect(storedAnnotation).toBeUndefined()
        await element.processEvent('saveNote', null)
        expect(navigation.popRequests()).toEqual([{ type: 'goBack' }])
        expect(storedAnnotation).toEqual({
            pageUrl: testUrl,
            selector: testAnchor,
            body: testText,
            pageTitle: '',
            comment: '',
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
        await element.processEvent('saveNote', null)
        expect(navigation.popRequests()).toEqual([{ type: 'goBack' }])
        expect(storedNote).toEqual({
            url: testNoteUrl,
            text: testText,
        })
    })

    it('should nav back to set previous route', async () => {
        const testTitle = 'test'
        const testUrl = 'test.com'

        let storedNote: any
        const { element: elA, navigation: navA } = setup(
            {
                storage: {
                    modules: {
                        pageEditor: {
                            createNote: (note: any) => (storedNote = note),
                        },
                    } as any,
                },
            },
            { mode: 'create', pageUrl: testUrl, previousRoute: 'PageEditor' },
        )

        await elA.processEvent('goBack', null)

        expect(navA.popRequests()).toEqual([{ type: 'goBack' }])

        const { element: elB, navigation: navB } = setup(
            {
                storage: {
                    modules: {
                        pageEditor: {
                            createNote: (note: any) => (storedNote = note),
                        },
                    } as any,
                },
            },
            {
                mode: 'create',
                pageUrl: testUrl,
                previousRoute: 'Reader',
                pageTitle: testTitle,
            },
        )

        await elB.processEvent('goBack', null)
        expect(navB.popRequests()).toEqual([{ type: 'goBack' }])
    })
})
