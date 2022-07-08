import Logic, { Props, State, Event } from './logic'
import { TestLogicContainer } from 'src/tests/ui-logic'
import { FakeNavigation, FakeRoute } from 'src/tests/navigation'
import { makeStorageTestFactory } from 'src/index.tests'
import { FakeStatefulUIElement } from 'src/ui/index.tests'
import * as DATA from './logic.test.data'
import { MockSettingsStorage } from 'src/features/settings/storage/mock-storage'
import { StorageService } from 'src/services/settings-storage'
import type { TestDevice } from 'src/types.tests'

const testText = 'this is a test'
const testPage = {
    date: '5 mins ago',
    pageUrl: DATA.PAGE_1.fullUrl,
    url: DATA.PAGE_1.fullUrl,
    titleText: 'This is a test page',
    notes: [],
    tags: [],
    listIds: [],
}

describe('page editor UI logic tests', () => {
    const it = makeStorageTestFactory()

    function setup({
        route = new FakeRoute({ pageUrl: DATA.PAGE_1.url }) as any,
        ...options
    }: TestDevice) {
        const logic = new Logic({
            ...options,
            navigation: new FakeNavigation({ pageUrl: DATA.PAGE_1.url }) as any,
            route,
        } as Props)
        const element = new FakeStatefulUIElement<State, Event>(logic)
        const logicContainer = new TestLogicContainer<State, Event>(logic)

        return { logic, logicContainer, element }
    }

    it('should be able to load init page data for display', async (context) => {
        const { element } = setup({
            ...context,
            route: new FakeRoute({ pageUrl: DATA.PAGE_1.url }) as any,
        })
        const { manager } = context.storage

        await manager.collection('pages').createObject(DATA.PAGE_1)
        await manager
            .collection('bookmarks')
            .createObject({ url: DATA.PAGE_1.url, time: Date.now() })
        await manager.collection('annotations').createObject({
            ...DATA.NOTE_1,
            createdWhen: new Date(),
            lastEdited: new Date(),
        })

        await context.storage.modules.metaPicker.createInboxListIfAbsent({})
        await context.storage.modules.metaPicker.createMobileListIfAbsent({})
        await context.storage.modules.metaPicker.createInboxListEntry({
            fullPageUrl: DATA.PAGE_1.fullUrl,
        })
        await context.storage.modules.metaPicker.createMobileListEntry({
            fullPageUrl: DATA.PAGE_1.fullUrl,
        })
        await context.storage.modules.metaPicker.createList({
            __id: 123,
            name: 'test a',
        })
        await context.storage.modules.metaPicker.createList({
            __id: 124,
            name: 'test b',
        })
        await manager.collection('pageListEntries').createObject({
            pageUrl: DATA.PAGE_1.url,
            fullUrl: DATA.PAGE_1.fullUrl,
            listId: 123,
            createdAt: new Date(),
        })
        await manager.collection('annotListEntries').createObject({
            url: DATA.NOTE_1.url,
            listId: 123,
            createdAt: new Date(),
        })
        await manager.collection('annotListEntries').createObject({
            url: DATA.NOTE_1.url,
            listId: 124,
            createdAt: new Date(),
        })

        expect(element.state.page).toEqual({})
        expect(element.state.listData).toEqual({})

        await element.init()

        expect(element.state.page).toEqual(
            expect.objectContaining({
                titleText: DATA.PAGE_1.fullTitle,
                listIds: [123],
                pageUrl: DATA.PAGE_1.url,
                isStarred: true,
                noteIds: [DATA.NOTE_1.url],
            }),
        )
        expect(element.state.noteData).toEqual({
            [DATA.NOTE_1.url]: expect.objectContaining({
                url: DATA.NOTE_1.url,
                domain: DATA.PAGE_1.domain,
                isStarred: false,
                commentText: DATA.NOTE_1.comment,
                listIds: [123, 124],
            }),
        })
        expect(element.state.listData).toEqual({
            [123]: expect.objectContaining({ name: 'test a' }),
            [124]: expect.objectContaining({ name: 'test b' }),
        })
    })

    // it('should be able to set save notes', async (context) => {
    //     const { logicContainer } = setup(context)

    //     logicContainer.logic.emitMutation({
    //         page: { $set: testPage as any },
    //     })
    //     expect(logicContainer.state.page.notes.length).toBe(0)

    //     await logicContainer.processEvent('saveNote', { text: testText })

    //     expect(logicContainer.state.page.notes.length).toBe(1)
    //     const note =
    //         logicContainer.state.page.notes[
    //             logicContainer.state.page.notes.length - 1
    //         ]
    //     expect(note.commentText).toEqual(testText)
    // })

    it('should be able to toggle note being pressed', async (context) => {
        const { logicContainer } = setup(context)
        const testNoteId = 'test.com/#1234'

        logicContainer.logic.emitMutation({
            page: { $set: { ...testPage, noteIds: [testNoteId] } as any },
            noteData: {
                $set: { [testNoteId]: { isNotePressed: false } as any },
            },
        })

        expect(logicContainer.state.noteData[testNoteId].isNotePressed).toBe(
            false,
        )
        await logicContainer.processEvent('toggleNotePress', {
            url: testNoteId,
        })
        expect(logicContainer.state.noteData[testNoteId].isNotePressed).toBe(
            true,
        )
        await logicContainer.processEvent('toggleNotePress', {
            url: testNoteId,
        })
        expect(logicContainer.state.noteData[testNoteId].isNotePressed).toBe(
            false,
        )
    })

    it('should be able to add/remove pages to/from a list', async (context) => {
        let createListEntryValue: any
        let deleteListEntryValue: any
        const testLists = ['a', 'b', 'c']

        const { logicContainer } = setup({
            ...context,
            storage: {
                ...context.storage,
                modules: {
                    ...context.storage.modules,
                    metaPicker: {
                        createPageListEntry: async (args: any) =>
                            (createListEntryValue = args),
                        deletePageEntryFromList: async (args: any) =>
                            (deleteListEntryValue = args),
                    },
                },
            } as any,
        })

        logicContainer.logic.emitMutation({
            page: { $set: testPage as any },
            mode: { $set: 'collections' },
        })

        expect(logicContainer.state.page.listIds.length).toBe(0)

        const testListIds = []
        for (const name of testLists) {
            const { object } =
                await context.storage.modules.metaPicker.createList({ name })
            testListIds.push(object.id)
        }

        for (const listId of testListIds) {
            await logicContainer.processEvent('createEntry', { listId })
            expect(createListEntryValue).toEqual({
                fullPageUrl: testPage.url,
                listId,
            })
        }

        expect(logicContainer.state.page.listIds.length).toBe(
            testListIds.length,
        )
        expect(logicContainer.state.page.listIds).toEqual(testListIds.reverse())

        for (const listId of testListIds) {
            await logicContainer.processEvent('removeEntry', { listId })
            expect(deleteListEntryValue).toEqual({ url: testPage.url, listId })
        }
        expect(logicContainer.state.page.listIds.length).toBe(0)
    })

    it('should be able to add/remove annotations to/from a list', async (context) => {
        let createListEntryValue: any
        let deleteListEntryValue: any
        const testLists = ['a', 'b', 'c']

        const { logicContainer } = setup({
            ...context,
            storage: {
                ...context.storage,
                modules: {
                    ...context.storage.modules,
                    metaPicker: {
                        createAnnotListEntry: async (args: any) =>
                            (createListEntryValue = args),
                        deleteAnnotEntryFromList: async (args: any) =>
                            (deleteListEntryValue = args),
                    },
                },
            } as any,
        })

        const TEST_NOTE_ID = 'test.com/#1234'

        logicContainer.logic.emitMutation({
            noteData: {
                $set: {
                    [TEST_NOTE_ID]: { url: TEST_NOTE_ID, listIds: [] } as any,
                },
            },
            page: { $set: { ...testPage, noteIds: [TEST_NOTE_ID] } as any },
            annotationUrlToEdit: { $set: TEST_NOTE_ID },
            mode: { $set: 'annotation-spaces' },
        })

        expect(logicContainer.state.noteData[TEST_NOTE_ID].listIds).toEqual([])

        const testListIds = []
        for (const name of testLists) {
            const { object } =
                await context.storage.modules.metaPicker.createList({ name })
            testListIds.push(object.id)
        }

        for (const listId of testListIds) {
            await logicContainer.processEvent('createEntry', { listId })
            expect(createListEntryValue).toEqual({
                annotationUrl: TEST_NOTE_ID,
                listId,
            })
        }

        expect(logicContainer.state.noteData[TEST_NOTE_ID].listIds).toEqual(
            [...testListIds].reverse(),
        )

        for (const listId of testListIds) {
            await logicContainer.processEvent('removeEntry', { listId })
            expect(deleteListEntryValue).toEqual({
                annotationUrl: TEST_NOTE_ID,
                listId,
            })
        }
        expect(logicContainer.state.noteData[TEST_NOTE_ID].listIds).toEqual([])
    })

    it('should be able to nav back, passing page state to update param', async (context) => {
        let updatedPage: any
        const mockUpdatePage = (page: any) => {
            updatedPage = page
        }

        const { logicContainer, logic } = setup({
            ...context,
            route: new FakeRoute({
                fullPageUrl: DATA.PAGE_1.url,
                updatePage: mockUpdatePage,
            }) as any,
        })

        await logic['props'].storage.modules.overview.createPage({
            ...DATA.PAGE_1,
            text: '',
        })

        const TEST_LIST_1 = 'test 1'
        const { object } = await context.storage.modules.metaPicker.createList({
            name: TEST_LIST_1,
        })
        const TEST_LIST_1_ID = object.id
        const TEST_NOTE_ID = 'test.com/#1234'

        logicContainer.logic.emitMutation({
            page: { $set: { ...testPage, noteIds: [TEST_NOTE_ID] } as any },
            noteData: {
                $set: { [TEST_NOTE_ID]: { url: TEST_NOTE_ID } as any },
            },
            mode: { $set: 'notes' },
        })
        expect(logicContainer.state.page.noteIds.length).toBe(1)

        logicContainer.logic.emitMutation({ mode: { $set: 'collections' } })
        await logicContainer.processEvent('createEntry', {
            listId: TEST_LIST_1_ID,
        })

        expect(updatedPage).toBeUndefined()
        await logicContainer.processEvent('goBack', null)
        expect(updatedPage).toEqual(
            expect.objectContaining({
                listIds: [TEST_LIST_1_ID],
                notes: [expect.objectContaining({ url: TEST_NOTE_ID })],
            }),
        )
    })

    it('should be able to "nav" back to prev editor mode, after switching to space picker mode', async (context) => {
        const { logicContainer, logic } = setup({
            ...context,
            route: new FakeRoute({
                fullPageUrl: DATA.PAGE_1.url,
                pageUrl: DATA.PAGE_1.url,
                mode: 'notes',
            }) as any,
        })

        await context.storage.modules.overview.createPage({
            ...DATA.PAGE_1,
            text: '',
        })
        const testAnnotationUrl = 'test.com/#1234'

        await logicContainer.processEvent('init', undefined)

        expect(logicContainer.state.mode).toEqual('notes')
        expect(logicContainer.state.previousMode).toEqual(null)
        expect(logicContainer.state.annotationUrlToEdit).toEqual(null)

        await logicContainer.processEvent('setAnnotationToEdit', {
            annotationUrl: testAnnotationUrl,
        })

        expect(logicContainer.state.mode).toEqual('annotation-spaces')
        expect(logicContainer.state.previousMode).toEqual('notes')
        expect(logicContainer.state.annotationUrlToEdit).toEqual(
            testAnnotationUrl,
        )

        await logicContainer.processEvent('goBack', null)

        expect(logicContainer.state.mode).toEqual('notes')
        expect(logicContainer.state.previousMode).toEqual(null)
        expect(logicContainer.state.annotationUrlToEdit).toEqual(null)
    })
})
