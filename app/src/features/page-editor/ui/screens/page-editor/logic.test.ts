import Logic, { Props, State, Event } from './logic'
import { TestLogicContainer } from 'src/tests/ui-logic'
import { FakeNavigation } from 'src/tests/navigation'
import { makeStorageTestFactory } from 'src/index.tests'
import { Storage } from 'src/storage/types'
import { FakeStatefulUIElement } from 'src/ui/index.tests'
import * as DATA from './logic.test.data'

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

    function setup(options: { storage: Storage }) {
        const logic = new Logic({
            storage: options.storage,
            navigation: new FakeNavigation({ pageUrl: DATA.PAGE_1.url }) as any,
        } as Props)
        const element = new FakeStatefulUIElement<State, Event>(logic)
        const logicContainer = new TestLogicContainer<State, Event>(logic)

        return { logic, logicContainer, element }
    }

    it('should be able to load init page data for display', async context => {
        const { element } = setup(context)
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

    it('should be able to set save notes', async context => {
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

    it('should be able to toggle note being pressed', async context => {
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

    it('should be able to add/remove tags to/from a page', async () => {
        let createTagValue: any
        let deleteTagValue: any
        const testTags = ['a', 'b', 'c']
        const { logicContainer } = setup({
            storage: {
                modules: {
                    metaPicker: {
                        createTag: async (args: any) => (createTagValue = args),
                        deleteTag: async (args: any) => (deleteTagValue = args),
                    },
                },
            } as any,
        })

        logicContainer.logic.emitMutation({
            page: { $set: testPage as any },
            mode: { $set: 'tags' },
        })

        expect(logicContainer.state.page.tags.length).toBe(0)
        for (const name of testTags) {
            await logicContainer.processEvent('createEntry', { name })
            expect(createTagValue).toEqual({ url: testPage.url, name })
        }
        expect(logicContainer.state.page.tags.length).toBe(testTags.length)
        expect(logicContainer.state.page.tags).toEqual(testTags)

        for (const name of testTags) {
            await logicContainer.processEvent('removeEntry', { name })
            expect(deleteTagValue).toEqual({ url: testPage.url, name })
        }
        expect(logicContainer.state.page.tags.length).toBe(0)
    })

    it('should be able to add/remove pages to/from a list', async () => {
        let createListEntryValue: any
        let deleteListEntryValue: any
        const testLists = ['a', 'b', 'c']
        const { logicContainer } = setup({
            storage: {
                modules: {
                    metaPicker: {
                        createPageListEntry: async (args: any) =>
                            (createListEntryValue = args),
                        deletePageEntryByName: async (args: any) =>
                            (deleteListEntryValue = args),
                        findListsByNames: async (args: any) => [{ id: 123 }],
                    },
                },
            } as any,
        })

        logicContainer.logic.emitMutation({
            page: { $set: testPage as any },
            mode: { $set: 'collections' },
        })

        expect(logicContainer.state.page.lists.length).toBe(0)
        for (const name of testLists) {
            await logicContainer.processEvent('createEntry', { name })
            expect(createListEntryValue).toEqual({
                pageUrl: testPage.url,
                listId: expect.any(Number),
            })
        }
        expect(logicContainer.state.page.lists.length).toBe(testLists.length)
        expect(logicContainer.state.page.lists).toEqual(testLists)

        for (const name of testLists) {
            await logicContainer.processEvent('removeEntry', { name })
            expect(deleteListEntryValue).toEqual({ url: testPage.url, name })
        }
        expect(logicContainer.state.page.lists.length).toBe(0)
    })
})
