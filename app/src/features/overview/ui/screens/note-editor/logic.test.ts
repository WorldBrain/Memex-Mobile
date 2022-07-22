import Logic, { State, Event, Props } from './logic'
import { makeStorageTestFactory } from 'src/index.tests'
import { FakeStatefulUIElement } from 'src/ui/index.tests'
import { FakeNavigation, FakeRoute } from 'src/tests/navigation'
import { MainNavigatorParamList } from 'src/ui/navigation/types'
import { TestDevice } from 'src/types.tests'
import { AnnotationPrivacyLevels } from '@worldbrain/memex-common/lib/annotations/types'

const TEST_PAGE_A = {
    url: 'test.com',
    fullUrl: 'https://test.com',
    fullTitle: 'test title',
    text: 'some test text paragraph and',
}

const TEST_LISTS = [
    {
        id: 1,
        name: 'test a',
    },
    {
        id: 2,
        name: 'test b',
    },
]

async function insertTestData(deps: TestDevice) {
    await deps.storage.modules.overview.createPage(TEST_PAGE_A)
    for (const list of TEST_LISTS) {
        await deps.storage.modules.metaPicker.createList({
            __id: list.id,
            name: list.name,
        })
    }
}

async function setup(
    deps: TestDevice,
    navParams: Partial<MainNavigatorParamList['NoteEditor']> = {
        mode: 'create',
        pageUrl: TEST_PAGE_A.url,
        pageTitle: TEST_PAGE_A.fullTitle,
    },
    opts?: { skipTestData?: boolean },
) {
    const navigation = new FakeNavigation({ navParams })

    if (!opts?.skipTestData) {
        await insertTestData(deps)
    }

    const logic = new Logic({
        ...deps,
        navigation: navigation as any,
        route: new FakeRoute({
            pageUrl: TEST_PAGE_A.url,
            pageTitle: TEST_PAGE_A.fullTitle,
            ...navParams,
        }) as any,
    })
    const element = new FakeStatefulUIElement<State, Event>(logic)

    return { element, navigation }
}

describe('note editor UI logic tests', () => {
    const it = makeStorageTestFactory()

    it('should be able to update note text value', async (context) => {
        const { element } = await setup(context)

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
        const { element } = await setup(context)

        expect(element.state.highlightTextLines).toEqual(undefined)
        await element.processEvent('setHighlightTextLines', { lines: 10 })
        expect(element.state.highlightTextLines).toEqual(10)
    })

    it('should be able to set "show more" state', async (context) => {
        const { element } = await setup(context)

        expect(element.state.showAllText).toBe(false)
        await element.processEvent('setShowAllText', { show: true })
        expect(element.state.showAllText).toBe(true)
        await element.processEvent('setShowAllText', { show: false })
        expect(element.state.showAllText).toBe(false)
    })

    it('should be able to save a new note, with non-default privacy level set', async (context) => {
        const testText = 'test'

        const { element, navigation } = await setup(context, { mode: 'create' })

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
            expect.objectContaining({
                comment: testText,
                pageUrl: TEST_PAGE_A.url,
            }),
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
        const testNoteUrl = TEST_PAGE_A.url + '/#123'

        context.storage.modules.pageEditor.createNote = async (note) => {
            storedNote = note
            return { annotationUrl: testNoteUrl }
        }
        let storedNote: any
        const { element, navigation } = await setup(context, {
            mode: 'create',
        })

        expect(navigation.popRequests()).toEqual([])
        expect(storedNote).toBeUndefined()
        await element.processEvent('changeNoteText', { value: testText })
        await element.processEvent('saveNote', null)
        expect(navigation.popRequests()).toEqual([{ type: 'goBack' }])
        expect(storedNote).toEqual({
            pageUrl: TEST_PAGE_A.url,
            comment: testText,
            pageTitle: TEST_PAGE_A.fullTitle,
        })
    })

    it('should be able to save a new anot, if highlight anchor provided', async (context) => {
        const testText = 'test'
        const testNoteUrl = TEST_PAGE_A.url + '/#123'
        const testAnchor = { quote: testText } as any

        let storedAnnotation: any

        context.storage.modules.pageEditor.createAnnotation = async (note) => {
            storedAnnotation = note
            return { annotationUrl: testNoteUrl }
        }

        const { element, navigation } = await setup(context, {
            mode: 'create',
            anchor: testAnchor,
            highlightText: testText,
        })

        expect(navigation.popRequests()).toEqual([])
        expect(storedAnnotation).toBeUndefined()
        await element.processEvent('saveNote', null)
        expect(navigation.popRequests()).toEqual([{ type: 'goBack' }])
        expect(storedAnnotation).toEqual({
            pageUrl: TEST_PAGE_A.url,
            selector: testAnchor,
            body: testText,
            pageTitle: TEST_PAGE_A.fullTitle,
            comment: '',
        })
    })

    it('should be able to save a new annot with spaces, if set', async (context) => {
        const testText = 'test'
        const testAnchor = { quote: testText } as any

        const { element, navigation } = await setup(context, {
            mode: 'create',
            anchor: testAnchor,
            highlightText: testText,
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
        expect(
            await context.storage.manager
                .collection('annotListEntries')
                .findAllObjects({}),
        ).toEqual([])

        await element.processEvent('selectSpacePickerEntry', {
            entry: { ...TEST_LISTS[0], isChecked: false },
        })
        await element.processEvent('selectSpacePickerEntry', {
            entry: { ...TEST_LISTS[1], isChecked: false },
        })
        await element.processEvent('changeNoteText', { value: testText })
        await element.processEvent('saveNote', null)

        expect(navigation.popRequests()).toEqual([{ type: 'goBack' }])
        const savedAnnots: any[] = await context.storage.manager
            .collection('annotations')
            .findAllObjects({})
        expect(savedAnnots).toEqual([
            expect.objectContaining({
                comment: testText,
                pageUrl: TEST_PAGE_A.url,
            }),
        ])
        expect(
            await context.storage.manager
                .collection('annotationPrivacyLevels')
                .findAllObjects({}),
        ).toEqual([
            expect.objectContaining({
                annotation: savedAnnots[0]?.url,
                privacyLevel: AnnotationPrivacyLevels.PRIVATE,
            }),
        ])
        expect(
            await context.storage.manager
                .collection('annotListEntries')
                .findAllObjects({}),
        ).toEqual([
            expect.objectContaining({
                url: savedAnnots[0]?.url,
                listId: TEST_LISTS[0].id,
            }),
            expect.objectContaining({
                url: savedAnnots[0]?.url,
                listId: TEST_LISTS[1].id,
            }),
        ])
    })

    it('should be able to edit an existing note', async (context) => {
        const testTextA = 'test'
        const testTextB = 'test updated'

        await insertTestData(context)
        const {
            annotationUrl,
        } = await context.storage.modules.pageEditor.createNote({
            pageTitle: TEST_PAGE_A.fullTitle,
            comment: testTextA,
            pageUrl: TEST_PAGE_A.url,
        })

        const { element, navigation } = await setup(
            context,
            {
                mode: 'update',
                noteUrl: annotationUrl,
                spaces: [],
            },
            { skipTestData: true },
        )

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

        const { element: elA, navigation: navA } = await setup(context, {
            mode: 'create',
            pageUrl: testUrl,
        })

        await elA.processEvent('goBack', null)

        expect(navA.popRequests()).toEqual([{ type: 'goBack' }])

        const { element: elB, navigation: navB } = await setup(context, {
            mode: 'create',
            pageUrl: testUrl,
            pageTitle: testTitle,
        })

        await elB.processEvent('goBack', null)
        expect(navB.popRequests()).toEqual([{ type: 'goBack' }])
    })

    it('should be able to add and remove spaces in edit mode', async (context) => {
        const testText = 'test'

        await insertTestData(context)
        const {
            annotationUrl,
        } = await context.storage.modules.pageEditor.createNote({
            pageTitle: 'test title',
            pageUrl: TEST_PAGE_A.url,
            comment: testText,
        })
        await context.services.annotationSharing.addAnnotationToLists({
            annotationUrl,
            listIds: [TEST_LISTS[1].id],
        })

        const { element } = await setup(
            context as any,
            {
                mode: 'update',
                noteUrl: annotationUrl,
                spaces: [TEST_LISTS[1]],
            },
            { skipTestData: true },
        )

        expect(element.state.spacesToAdd).toEqual([TEST_LISTS[1]])
        expect(
            await context.storage.manager
                .collection('annotListEntries')
                .findAllObjects({}),
        ).toEqual([
            expect.objectContaining({
                url: annotationUrl,
                listId: TEST_LISTS[1].id,
            }),
        ])
        await element.processEvent('selectSpacePickerEntry', {
            entry: { ...TEST_LISTS[0], isChecked: false },
        })

        expect(element.state.spacesToAdd).toEqual([
            TEST_LISTS[1],
            TEST_LISTS[0],
        ])
        expect(
            await context.storage.manager
                .collection('annotListEntries')
                .findAllObjects({}),
        ).toEqual([
            expect.objectContaining({
                url: annotationUrl,
                listId: TEST_LISTS[1].id,
            }),
            expect.objectContaining({
                url: annotationUrl,
                listId: TEST_LISTS[0].id,
            }),
        ])

        await element.processEvent('selectSpacePickerEntry', {
            entry: { ...TEST_LISTS[0], isChecked: true },
        })

        expect(element.state.spacesToAdd).toEqual([TEST_LISTS[1]])
        expect(
            await context.storage.manager
                .collection('annotListEntries')
                .findAllObjects({}),
        ).toEqual([
            expect.objectContaining({
                url: annotationUrl,
                listId: TEST_LISTS[1].id,
            }),
        ])

        await element.processEvent('selectSpacePickerEntry', {
            entry: { ...TEST_LISTS[1], isChecked: true },
        })

        expect(element.state.spacesToAdd).toEqual([])
        expect(
            await context.storage.manager
                .collection('annotListEntries')
                .findAllObjects({}),
        ).toEqual([])
    })

    it('should be able to add and remove spaces in create mode', async (context) => {
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

        const { element } = await setup(context as any, {
            mode: 'create',
        })

        expect(lastCreatedListEntry).toEqual(undefined)
        expect(lastDeletedListEntry).toEqual(undefined)
        expect(element.state.spacesToAdd).toEqual([])

        await element.processEvent('selectSpacePickerEntry', {
            entry: { ...TEST_LISTS[0], isChecked: false },
        })
        expect(lastCreatedListEntry).toEqual(undefined)
        expect(lastDeletedListEntry).toEqual(undefined)
        expect(element.state.spacesToAdd).toEqual([TEST_LISTS[0]])

        await element.processEvent('selectSpacePickerEntry', {
            entry: { ...TEST_LISTS[1], isChecked: false },
        })
        expect(lastCreatedListEntry).toEqual(undefined)
        expect(lastDeletedListEntry).toEqual(undefined)
        expect(element.state.spacesToAdd).toEqual([
            TEST_LISTS[0],
            TEST_LISTS[1],
        ])

        await element.processEvent('selectSpacePickerEntry', {
            entry: { ...TEST_LISTS[0], isChecked: true },
        })
        expect(lastCreatedListEntry).toEqual(undefined)
        expect(lastDeletedListEntry).toEqual(undefined)
        expect(element.state.spacesToAdd).toEqual([TEST_LISTS[1]])

        await element.processEvent('selectSpacePickerEntry', {
            entry: { ...TEST_LISTS[1], isChecked: true },
        })
        expect(lastCreatedListEntry).toEqual(undefined)
        expect(lastDeletedListEntry).toEqual(undefined)
        expect(element.state.spacesToAdd).toEqual([])
    })
})
