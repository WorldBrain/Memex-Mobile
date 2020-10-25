import Logic, { Props, State, Event } from './logic'
import { TestLogicContainer } from 'src/tests/ui-logic'
import { FakeNavigation, FakeRoute } from 'src/tests/navigation'
import { makeStorageTestFactory, TestDevice } from 'src/index.tests'
import { FakeStatefulUIElement } from 'src/ui/index.tests'
import * as DATA from './logic.test.data'
import { MockSettingsStorage } from 'src/features/settings/storage/mock-storage'
import { LocalStorageService } from 'src/services/local-storage'

const testText = 'this is a test'
const testPage = {
    date: '5 mins ago',
    pageUrl: 'https://test.com',
    url: 'https://test.com',
    titleText: 'This is a test page',
    notes: [],
    tags: [],
    lists: [],
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

        for (const name of DATA.TAGS_1) {
            await manager
                .collection('tags')
                .createObject({ name, url: DATA.PAGE_1.url })
        }

        for (const name of DATA.TAGS_2) {
            await manager
                .collection('tags')
                .createObject({ name, url: DATA.NOTE_1.url })
        }

        expect(element.state.page).toEqual({})
        await element.init()
        expect(element.state.page).toEqual(
            expect.objectContaining({
                titleText: DATA.PAGE_1.fullTitle,
                tags: DATA.TAGS_1,
                lists: [],
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

    it('should be able to add/remove tags to/from a page', async (context) => {
        let createTagValue: any
        let deleteTagValue: any
        const testTags = ['a', 'b', 'c']
        const settingsStorage = new MockSettingsStorage()

        const { logicContainer } = setup({
            ...context,
            storage: {
                ...context.storage,
                modules: {
                    ...context.storage.modules,
                    metaPicker: {
                        createTag: async (args: any) => (createTagValue = args),
                        deleteTag: async (args: any) => (deleteTagValue = args),
                    },
                },
            } as any,
            services: {
                ...context.services,
                localStorage: new LocalStorageService({
                    settingsStorage,
                }) as any,
            },
        })

        logicContainer.logic.emitMutation({
            page: { $set: testPage as any },
            mode: { $set: 'tags' },
        })

        expect(logicContainer.state.page.tags.length).toBe(0)

        const tmpCache = []
        for (const name of testTags) {
            await logicContainer.processEvent('createEntry', { name })
            expect(createTagValue).toEqual({ url: testPage.url, name })
            tmpCache.unshift(name)

            expect(
                settingsStorage.settings['@MemexApp_tag-suggestions-cache'],
            ).toEqual(tmpCache)
        }

        expect(logicContainer.state.page.tags.length).toBe(testTags.length)
        expect(logicContainer.state.page.tags).toEqual(testTags)

        for (const name of testTags) {
            await logicContainer.processEvent('removeEntry', { name })
            expect(deleteTagValue).toEqual({ url: testPage.url, name })
        }
        expect(logicContainer.state.page.tags.length).toBe(0)
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
                        deletePageEntryByName: async (args: any) =>
                            (deleteListEntryValue = args),
                        findListsByNames: async (args: any) => [{ id: 123 }],
                    },
                },
            } as any,
            services: {
                ...context.services,
                localStorage: new LocalStorageService({ settingsStorage }),
            },
        })

        logicContainer.logic.emitMutation({
            page: { $set: testPage as any },
            mode: { $set: 'collections' },
        })

        expect(logicContainer.state.page.lists.length).toBe(0)

        const tmpCache = []
        for (const name of testLists) {
            await logicContainer.processEvent('createEntry', { name })
            expect(createListEntryValue).toEqual({
                fullPageUrl: testPage.url,
                listId: expect.any(Number),
            })
            tmpCache.unshift(name)

            expect(
                settingsStorage.settings['@MemexApp_list-suggestions-cache'],
            ).toEqual(tmpCache)
        }

        expect(logicContainer.state.page.lists.length).toBe(testLists.length)
        expect(logicContainer.state.page.lists).toEqual(testLists)

        for (const name of testLists) {
            await logicContainer.processEvent('removeEntry', { name })
            expect(deleteListEntryValue).toEqual({ url: testPage.url, name })
        }
        expect(logicContainer.state.page.lists.length).toBe(0)
    })

    it('should be able to nav back, passing page state to update param', async (context) => {
        let updatedPage: any
        const mockUpdatePage = (page: any) => {
            updatedPage = page
        }

        const { logicContainer } = setup({
            ...context,
            route: new FakeRoute({
                fullPageUrl: DATA.PAGE_1.url,
                updatePage: mockUpdatePage,
            }) as any,
        })

        const TEST_NOTE_TEXT_1 = 'test 1'
        const TEST_TAG_1 = 'test 1'
        const TEST_LIST_1 = 'test 1'

        logicContainer.logic.emitMutation({
            page: { $set: testPage as any },
            mode: { $set: 'notes' },
        })
        expect(logicContainer.state.page.notes.length).toBe(0)

        await logicContainer.processEvent('saveNote', {
            text: TEST_NOTE_TEXT_1,
        })

        logicContainer.logic.emitMutation({ mode: { $set: 'tags' } })
        await logicContainer.processEvent('createEntry', { name: TEST_TAG_1 })

        logicContainer.logic.emitMutation({ mode: { $set: 'collections' } })
        await logicContainer.processEvent('createEntry', { name: TEST_LIST_1 })

        expect(updatedPage).toBeUndefined()
        await logicContainer.processEvent('goBack', null)
        expect(updatedPage).toEqual(
            expect.objectContaining({
                tags: [TEST_TAG_1],
                lists: [TEST_LIST_1],
                notes: [
                    expect.objectContaining({ commentText: TEST_NOTE_TEXT_1 }),
                ],
            }),
        )
    })
})
