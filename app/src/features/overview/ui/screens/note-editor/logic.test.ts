import Logic, { State, Event, Props } from './logic'
import { makeStorageTestFactory } from 'src/index.tests'
import { FakeStatefulUIElement } from 'src/ui/index.tests'
import { FakeNavigation, FakeRoute } from 'src/tests/navigation'
import { MainNavigatorParamList } from 'src/ui/navigation/types'
import { TestDevice } from 'src/types.tests'
import { AnnotationPrivacyLevels } from '@worldbrain/memex-common/lib/annotations/types'

function setup(
    deps: TestDevice,
    navParams: MainNavigatorParamList['NoteEditor'] = {
        mode: 'create',
        pageUrl: 'test.com',
    },
) {
    const navigation = new FakeNavigation({ navParams })
    const logic = new Logic({
        ...deps,
        navigation: navigation as any,
        route: new FakeRoute(navParams) as any,
    })
    const element = new FakeStatefulUIElement<State, Event>(logic)

    return { element, navigation }
}

describe('note editor UI logic tests', () => {
    const it = makeStorageTestFactory()

    it('should be able to update note text value', async (context) => {
        const { element } = setup(context)

        const testText = 'test'

        expect(element.state.noteText).toEqual('')
        await element.processEvent('changeNoteText', { value: testText })
        expect(element.state.noteText).toEqual(testText)
        await element.processEvent('changeNoteText', {
            value: testText + testText,
        })
        expect(element.state.noteText).toEqual(testText + testText)
    })

    it('should be able to set highlighted text lines', async (context) => {
        const { element } = setup(context)

        expect(element.state.highlightTextLines).toEqual(undefined)
        await element.processEvent('setHighlightTextLines', { lines: 10 })
        expect(element.state.highlightTextLines).toEqual(10)
    })

    it('should be able to set "show more" state', async (context) => {
        const { element } = setup(context)

        expect(element.state.showAllText).toBe(false)
        await element.processEvent('setShowAllText', { show: true })
        expect(element.state.showAllText).toBe(true)
        await element.processEvent('setShowAllText', { show: false })
        expect(element.state.showAllText).toBe(false)
    })

    it('should be able to save a new note, with non-default privacy level set', async (context) => {
        const testText = 'test'
        const testUrl = 'test.com'

        const { element, navigation } = setup(context, {
            mode: 'create',
            pageUrl: testUrl,
        })

        expect(navigation.popRequests()).toEqual([])

        expect(
            await context.storage.manager
                .collection('annotations')
                .findAllObjects({}),
        ).toEqual([])
        expect(
            await context.storage.manager
                .collection('annotationPrivacyLevels')
                .findAllObjects({}),
        ).toEqual([])

        await element.processEvent('changeNoteText', { value: testText })
        expect(element.state.privacyLevel).toEqual(
            AnnotationPrivacyLevels.PRIVATE,
        )
        await element.processEvent('setPrivacyLevel', {
            value: AnnotationPrivacyLevels.SHARED_PROTECTED,
        })
        expect(element.state.privacyLevel).toEqual(
            AnnotationPrivacyLevels.SHARED_PROTECTED,
        )
        await element.processEvent('saveNote', null)

        expect(
            await context.storage.manager
                .collection('annotations')
                .findAllObjects({}),
        ).toEqual([
            expect.objectContaining({ comment: testText, pageUrl: testUrl }),
        ])
        expect(
            await context.storage.manager
                .collection('annotationPrivacyLevels')
                .findAllObjects({}),
        ).toEqual([
            expect.objectContaining({
                privacyLevel: AnnotationPrivacyLevels.SHARED_PROTECTED,
            }),
        ])

        expect(navigation.popRequests()).toEqual([{ type: 'goBack' }])
    })

    it('should be able to save a new note, if highlight anchor absent', async (context) => {
        const testText = 'test'
        const testUrl = 'test.com'
        const testNoteUrl = 'test.com/#123'

        context.storage.modules.pageEditor.createNote = async (note) => {
            storedNote = note
            return { annotationUrl: testNoteUrl }
        }
        let storedNote: any
        const { element, navigation } = setup(context, {
            mode: 'create',
            pageUrl: testUrl,
        })

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

    it('should be able to save a new anot, if highlight anchor provided', async (context) => {
        const testText = 'test'
        const testUrl = 'test.com'
        const testNoteUrl = 'test.com/#123'
        const testAnchor = { quote: testText } as any

        let storedAnnotation: any

        context.storage.modules.pageEditor.createAnnotation = async (note) => {
            storedAnnotation = note
            return { annotationUrl: testNoteUrl }
        }

        const { element, navigation } = setup(context, {
            mode: 'create',
            pageUrl: testUrl,
            anchor: testAnchor,
            highlightText: testText,
        })

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

    it('should be able to save a new annot with spaces, if set', async (context) => {
        const testText = 'test'
        const testUrl = 'test.com'
        const testNoteUrl = 'test.com/#123'
        const testAnchor = { quote: testText } as any
        const testListIdA = 123
        const testListIdB = 124

        let storedAnnotation: any
        let listsToSetForAnnot:
            | { annotationUrl: string; listIds: number[] }
            | undefined

        context.storage.modules.pageEditor.createAnnotation = async (annot) => {
            storedAnnotation = annot
            return { annotationUrl: testNoteUrl }
        }
        context.storage.modules.metaPicker.setAnnotationLists = async (
            args,
        ) => {
            listsToSetForAnnot = args
        }

        const { element, navigation } = setup(context, {
            mode: 'create',
            pageUrl: testUrl,
            anchor: testAnchor,
            highlightText: testText,
        })

        expect(navigation.popRequests()).toEqual([])
        expect(storedAnnotation).toBeUndefined()
        expect(listsToSetForAnnot).toBeUndefined()

        await element.processEvent('selectSpacePickerEntry', {
            entry: { id: testListIdA, isChecked: false, name: 'test a' },
        })
        await element.processEvent('selectSpacePickerEntry', {
            entry: { id: testListIdB, isChecked: false, name: 'test b' },
        })
        await element.processEvent('saveNote', null)

        expect(navigation.popRequests()).toEqual([{ type: 'goBack' }])
        expect(storedAnnotation).toEqual({
            pageUrl: testUrl,
            selector: testAnchor,
            body: testText,
            pageTitle: '',
            comment: '',
        })
        expect(listsToSetForAnnot).toEqual({
            annotationUrl: testNoteUrl,
            listIds: [testListIdA, testListIdB],
        })
    })

    it('should be able to edit an existing note', async (context) => {
        const testTextA = 'test'
        const testTextB = 'test updated'
        const testUrl = 'test.com'

        const {
            annotationUrl,
        } = await context.storage.modules.pageEditor.createNote({
            pageTitle: 'test title',
            comment: testTextA,
            pageUrl: testUrl,
        })

        const { element, navigation } = setup(context, {
            mode: 'update',
            noteUrl: annotationUrl,
            spaces: [],
        })

        expect(navigation.popRequests()).toEqual([])
        expect(
            await context.storage.manager
                .collection('annotations')
                .findOneObject({ url: annotationUrl }),
        ).toEqual(
            expect.objectContaining({
                url: annotationUrl,
                comment: testTextA,
            }),
        )
        expect(
            await context.storage.manager
                .collection('annotationPrivacyLevels')
                .findOneObject({ annotation: annotationUrl }),
        ).toEqual(
            expect.objectContaining({
                annotation: annotationUrl,
                privacyLevel: AnnotationPrivacyLevels.PRIVATE,
            }),
        )

        await element.processEvent('changeNoteText', { value: testTextB })
        await element.processEvent('setPrivacyLevel', {
            value: AnnotationPrivacyLevels.SHARED,
        })
        await element.processEvent('saveNote', null)

        expect(navigation.popRequests()).toEqual([{ type: 'goBack' }])
        expect(
            await context.storage.manager
                .collection('annotations')
                .findOneObject({ url: annotationUrl }),
        ).toEqual(
            expect.objectContaining({
                url: annotationUrl,
                comment: testTextB,
            }),
        )
        expect(
            await context.storage.manager
                .collection('annotationPrivacyLevels')
                .findOneObject({ annotation: annotationUrl }),
        ).toEqual(
            expect.objectContaining({
                annotation: annotationUrl,
                privacyLevel: AnnotationPrivacyLevels.SHARED,
            }),
        )
    })

    it('should nav back to set previous route', async (context) => {
        const testTitle = 'test'
        const testUrl = 'test.com'

        const { element: elA, navigation: navA } = setup(context, {
            mode: 'create',
            pageUrl: testUrl,
        })

        await elA.processEvent('goBack', null)

        expect(navA.popRequests()).toEqual([{ type: 'goBack' }])

        const { element: elB, navigation: navB } = setup(context, {
            mode: 'create',
            pageUrl: testUrl,
            pageTitle: testTitle,
        })

        await elB.processEvent('goBack', null)
        expect(navB.popRequests()).toEqual([{ type: 'goBack' }])
    })

    it('should be able to add and remove spaces in edit mode', async (context) => {
        const testUrl = 'test.com'
        const testNoteUrl = testUrl + '/#23423'
        const testListA = { id: 123, name: 'test a' }
        const testListB = { id: 124, name: 'test b' }

        let lastCreatedListEntry:
            | { listId: number; annotationUrl: string }
            | undefined
        let lastDeletedListEntry:
            | { listId: number; annotationUrl: string }
            | undefined

        context.storage.modules.metaPicker.createAnnotListEntry = async (
            entry,
        ) => {
            lastCreatedListEntry = entry
        }
        context.storage.modules.metaPicker.deleteAnnotEntryFromList = async (
            entry,
        ) => {
            lastDeletedListEntry = entry
        }

        const { element } = setup(context as any, {
            mode: 'update',
            noteUrl: testNoteUrl,
            spaces: [testListB],
        })

        expect(lastCreatedListEntry).toEqual(undefined)
        expect(lastDeletedListEntry).toEqual(undefined)
        expect(element.state.spacesToAdd).toEqual([testListB])

        await element.processEvent('selectSpacePickerEntry', {
            entry: { ...testListA, isChecked: false },
        })
        expect(lastCreatedListEntry).toEqual({
            listId: testListA.id,
            annotationUrl: testNoteUrl,
        })
        expect(lastDeletedListEntry).toEqual(undefined)
        expect(element.state.spacesToAdd).toEqual([testListB, testListA])

        await element.processEvent('selectSpacePickerEntry', {
            entry: { ...testListA, isChecked: true },
        })
        expect(lastCreatedListEntry).toEqual({
            listId: testListA.id,
            annotationUrl: testNoteUrl,
        })
        expect(lastDeletedListEntry).toEqual({
            listId: testListA.id,
            annotationUrl: testNoteUrl,
        })
        expect(element.state.spacesToAdd).toEqual([testListB])

        await element.processEvent('selectSpacePickerEntry', {
            entry: { ...testListB, isChecked: true },
        })
        expect(lastCreatedListEntry).toEqual({
            listId: testListA.id,
            annotationUrl: testNoteUrl,
        })
        expect(lastDeletedListEntry).toEqual({
            listId: testListB.id,
            annotationUrl: testNoteUrl,
        })
        expect(element.state.spacesToAdd).toEqual([])
    })

    it('should be able to add and remove spaces in create mode', async (context) => {
        const testUrl = 'test.com'
        const testListA = { id: 123, name: 'test a' }
        const testListB = { id: 124, name: 'test b' }

        let lastCreatedListEntry:
            | { listId: number; annotationUrl: string }
            | undefined
        let lastDeletedListEntry:
            | { listId: number; annotationUrl: string }
            | undefined

        context.storage.modules.metaPicker.createAnnotListEntry = async (
            entry,
        ) => {
            lastCreatedListEntry = entry
        }
        context.storage.modules.metaPicker.deleteAnnotEntryFromList = async (
            entry,
        ) => {
            lastDeletedListEntry = entry
        }

        const { element } = setup(context as any, {
            mode: 'create',
            pageUrl: testUrl,
        })

        expect(lastCreatedListEntry).toEqual(undefined)
        expect(lastDeletedListEntry).toEqual(undefined)
        expect(element.state.spacesToAdd).toEqual([])

        await element.processEvent('selectSpacePickerEntry', {
            entry: { ...testListA, isChecked: false },
        })
        expect(lastCreatedListEntry).toEqual(undefined)
        expect(lastDeletedListEntry).toEqual(undefined)
        expect(element.state.spacesToAdd).toEqual([testListA])

        await element.processEvent('selectSpacePickerEntry', {
            entry: { ...testListB, isChecked: false },
        })
        expect(lastCreatedListEntry).toEqual(undefined)
        expect(lastDeletedListEntry).toEqual(undefined)
        expect(element.state.spacesToAdd).toEqual([testListA, testListB])

        await element.processEvent('selectSpacePickerEntry', {
            entry: { ...testListA, isChecked: true },
        })
        expect(lastCreatedListEntry).toEqual(undefined)
        expect(lastDeletedListEntry).toEqual(undefined)
        expect(element.state.spacesToAdd).toEqual([testListB])

        await element.processEvent('selectSpacePickerEntry', {
            entry: { ...testListB, isChecked: true },
        })
        expect(lastCreatedListEntry).toEqual(undefined)
        expect(lastDeletedListEntry).toEqual(undefined)
        expect(element.state.spacesToAdd).toEqual([])
    })
})
