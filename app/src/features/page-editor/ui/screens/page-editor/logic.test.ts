import Logic, { Props, State, Event } from './logic'
import { TestLogicContainer } from 'src/tests/ui-logic'
import { FakeNavigation, FakeRoute } from 'src/tests/navigation'
import { makeStorageTestFactory, TestDevice } from 'src/index.tests'
import { FakeStatefulUIElement } from 'src/ui/index.tests'
import * as DATA from './logic.test.data'
import { MockSettingsStorage } from 'src/features/settings/storage/mock-storage'
import { StorageService } from 'src/services/settings-storage'

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

        expect(element.state.page).toEqual({})
        await element.init()
        expect(element.state.page).toEqual(
            expect.objectContaining({
                titleText: DATA.PAGE_1.fullTitle,
                listIds: [],
                pageUrl: DATA.PAGE_1.url,
                isStarred: true,
                notes: [
                    expect.objectContaining({
                        url: DATA.NOTE_1.url,
                        domain: DATA.PAGE_1.domain,
                        isStarred: false,
                        commentText: DATA.NOTE_1.comment,
                    }),
                ],
            }),
        )
    })

    it('should be able to set save notes', async (context) => {
        const { logicContainer } = setup(context)

        logicContainer.logic.emitMutation({
            page: { $set: testPage as any },
        })
        expect(logicContainer.state.page.notes.length).toBe(0)

        await logicContainer.processEvent('saveNote', { text: testText })

        expect(logicContainer.state.page.notes.length).toBe(1)
        const note =
            logicContainer.state.page.notes[
                logicContainer.state.page.notes.length - 1
            ]
        expect(note.commentText).toEqual(testText)
    })

    it('should be able to toggle note being pressed', async (context) => {
        const { logicContainer } = setup(context)

        logicContainer.logic.emitMutation({
            page: { $set: testPage as any },
        })
        expect(logicContainer.state.page.notes.length).toBe(0)

        await logicContainer.processEvent('saveNote', { text: testText })

        expect(logicContainer.state.page.notes[0].isNotePressed).toBe(undefined)
        const { url } = logicContainer.state.page.notes[0]

        await logicContainer.processEvent('toggleNotePress', { url })

        expect(logicContainer.state.page.notes[0].isNotePressed).toBe(true)

        await logicContainer.processEvent('toggleNotePress', { url })

        expect(logicContainer.state.page.notes[0].isNotePressed).toBe(false)
    })

    it('should be able to add/remove pages to/from a list', async (context) => {
        let createListEntryValue: any
        let deleteListEntryValue: any
        const testLists = ['a', 'b', 'c']
        const settingsStorage = new MockSettingsStorage()

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
            services: {
                ...context.services,
                localStorage: new StorageService({ settingsStorage }),
                syncStorage: new StorageService({ settingsStorage }),
            },
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

        const tmpCache = []
        for (const listId of testListIds) {
            await logicContainer.processEvent('createEntry', { listId })
            expect(createListEntryValue).toEqual({
                fullPageUrl: testPage.url,
                listId,
            })
            tmpCache.unshift(listId)

            // TODO: fix cache
            // expect(
            //     settingsStorage.settings['@MemexApp_list-suggestions-cache'],
            // ).toEqual(tmpCache)
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

        const TEST_NOTE_TEXT_1 = 'test 1'
        const TEST_LIST_1 = 'test 1'
        const { object } = await context.storage.modules.metaPicker.createList({
            name: TEST_LIST_1,
        })
        const TEST_LIST_1_ID = object.id

        logicContainer.logic.emitMutation({
            page: { $set: testPage as any },
            mode: { $set: 'notes' },
        })
        expect(logicContainer.state.page.notes.length).toBe(0)

        await logicContainer.processEvent('saveNote', {
            text: TEST_NOTE_TEXT_1,
        })

        logicContainer.logic.emitMutation({ mode: { $set: 'collections' } })
        await logicContainer.processEvent('createEntry', {
            listId: TEST_LIST_1_ID,
        })

        expect(updatedPage).toBeUndefined()
        await logicContainer.processEvent('goBack', null)
        expect(updatedPage).toEqual(
            expect.objectContaining({
                listIds: [TEST_LIST_1_ID],
                notes: [
                    expect.objectContaining({ commentText: TEST_NOTE_TEXT_1 }),
                ],
            }),
        )
    })
})
