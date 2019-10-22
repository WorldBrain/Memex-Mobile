import expect from 'expect'
import Logic from './logic'
import { MetaType } from 'src/features/meta-picker/types'
import { makeStorageTestFactory } from 'src/index.tests'
import { Storage } from 'src/storage/types'
import { ShareExtService } from 'src/services/share-ext'
import { FakeStatefulUIElement } from 'src/ui/index.tests'

describe('share modal UI logic tests', () => {
    const it = makeStorageTestFactory()

    async function setup(options: { storage: Storage; shareText?: string }) {
        const logic = new Logic({
            services: {
                shareExt: ({
                    getShareText: async () => options.shareText,
                } as Partial<ShareExtService>) as any,
            } as any,
            storage: options.storage,
        })
        const initialState = logic.getInitialState()
        const element = new FakeStatefulUIElement(logic)

        return { logic, initialState, element }
    }

    it('should load correctly without a URL', async context => {
        const { element } = await setup(context)
        await element.init()
        try {
            expect(element.state).toEqual({
                loadState: 'done',
                saveState: 'pristine',
                syncState: 'pristine',
                collectionsToAdd: [],
                isModalShown: false,
                isStarred: false,
                noteText: '',
                pageUrl: '',
                statusText: '',
                tagsToAdd: [],
            })
        } finally {
            await element.cleanup()
        }
    })

    it('should load correctly with a URL, but no stored page', async context => {
        const pageUrl = 'http://bla.com'
        const { element } = await setup({ ...context, shareText: pageUrl })
        await element.init()
        try {
            expect(element.state).toEqual({
                loadState: 'done',
                saveState: 'pristine',
                syncState: 'pristine',
                collectionsToAdd: [],
                isModalShown: true,
                isStarred: false,
                noteText: '',
                pageUrl,
                statusText: '',
                tagsToAdd: [],
            })
        } finally {
            await element.cleanup()
        }
    })

    it('should correctly load page starred', async context => {
        const pageUrl = 'http://bla.com'
        await context.storage.modules.overview.starPage({
            url: pageUrl,
            time: Date.now(),
        })
        const { element } = await setup({ ...context, shareText: pageUrl })
        await element.init()
        try {
            expect(element.state).toEqual({
                loadState: 'done',
                saveState: 'pristine',
                syncState: 'pristine',
                collectionsToAdd: [],
                isModalShown: true,
                isStarred: true,
                noteText: '',
                pageUrl: 'http://bla.com',
                statusText: '',
                tagsToAdd: [],
            })
        } finally {
            await element.cleanup()
        }
    })

    it('should correctly load tags', async context => {
        const pageUrl = 'http://bla.com'
        await context.storage.modules.metaPicker.createTag({
            url: pageUrl,
            name: 'tagA',
        })
        await context.storage.modules.metaPicker.createTag({
            url: pageUrl,
            name: 'tagB',
        })
        const { element } = await setup({ ...context, shareText: pageUrl })
        await element.init()
        try {
            expect(element.state).toEqual({
                loadState: 'done',
                saveState: 'pristine',
                syncState: 'pristine',
                collectionsToAdd: [],
                isModalShown: true,
                isStarred: false,
                noteText: '',
                pageUrl: 'http://bla.com',
                statusText: '',
                tagsToAdd: ['tagA', 'tagB'],
            })
        } finally {
            await element.cleanup()
        }
    })

    it('should correctly associated lists', async context => {
        const pageUrl = 'http://bla.com'
        const {
            object: { id: listId },
        } = await context.storage.modules.metaPicker.createList({
            name: 'My list',
        })
        await context.storage.modules.metaPicker.createPageListEntry({
            pageUrl,
            listId,
        })
        const { element } = await setup({ ...context, shareText: pageUrl })
        await element.init()
        try {
            expect(element.state).toEqual({
                loadState: 'done',
                saveState: 'pristine',
                syncState: 'pristine',
                collectionsToAdd: ['My list'],
                isModalShown: true,
                isStarred: false,
                noteText: '',
                pageUrl: 'http://bla.com',
                statusText: '',
                tagsToAdd: [],
            })
        } finally {
            await element.cleanup()
        }
    })

    it('should be able to set page url', async (context: {
        storage: Storage
    }) => {
        const { logic, initialState: state } = await setup(context)
        const testUrl = 'http://www.google.com'

        expect(state.pageUrl).not.toEqual(testUrl)
        const newState = logic.withMutation(
            state,
            logic.setPageUrl({
                event: { url: testUrl },
                previousState: state,
            }),
        )

        expect(newState.pageUrl).toEqual(testUrl)
    })

    it('should be able to set note text', async (context: {
        storage: Storage
    }) => {
        const { logic, initialState: state } = await setup(context)
        const testText = 'test'
        expect(state.noteText).not.toEqual(testText)
        const newState = logic.withMutation(
            state,
            logic.setNoteText({
                event: { value: testText },
                previousState: state,
            }),
        )

        expect(newState.noteText).toEqual(testText)
    })

    it('should be able to show modal', async (context: {
        storage: Storage
    }) => {
        const { logic, initialState: state } = await setup(context)

        const newStateA = logic.withMutation(
            state,
            logic.setModalVisible({
                event: { shown: true },
                previousState: state,
            }),
        )
        expect(newStateA.isModalShown).toBe(true)

        const newStateB = logic.withMutation(
            state,
            logic.setModalVisible({
                event: { shown: false },
                previousState: newStateA,
            }),
        )
        expect(newStateB.isModalShown).toBe(false)
    })

    it('should be able to set meta view type', async (context: {
        storage: Storage
    }) => {
        const { logic, initialState: state } = await setup(context)
        const types: MetaType[] = ['tags', 'collections']
        let previousState = state

        for (const t of types) {
            const newState = logic.withMutation(
                state,
                logic.setMetaViewType({
                    event: { type: t },
                    previousState,
                }),
            )

            expect(previousState.metaViewShown).not.toBe(t)
            expect(newState.metaViewShown).toBe(t)
            previousState = newState
        }
    })

    it('should be able to star pages', async (context: {
        storage: Storage
    }) => {
        const { logic, initialState: state } = await setup(context)

        expect(state.isStarred).toBe(false)
        const newState = logic.withMutation(
            state,
            logic.setPageStar({
                event: { value: true },
                previousState: state,
            }),
        )

        expect(newState.isStarred).toBe(true)
    })

    it('should be able to set tags to add', async (context: {
        storage: Storage
    }) => {
        const { logic, initialState: state } = await setup(context)
        const testTags = ['a', 'b', 'c']

        expect(state.tagsToAdd.length).toBe(0)
        const nextStateA = logic.withMutation(
            state,
            logic.setTagsToAdd({
                event: { values: testTags },
                previousState: state,
            }),
        )

        expect(nextStateA.tagsToAdd.length).toBe(testTags.length)
        expect(nextStateA.tagsToAdd).toEqual(testTags)
    })

    it('should be able to set lists to add', async (context: {
        storage: Storage
    }) => {
        const { logic, initialState: state } = await setup(context)
        const testLists = ['a', 'b', 'c']

        expect(state.collectionsToAdd.length).toBe(0)
        const nextStateA = logic.withMutation(
            state,
            logic.setCollectionsToAdd({
                event: { values: testLists },
                previousState: state,
            }),
        )

        expect(nextStateA.collectionsToAdd.length).toBe(testLists.length)
        expect(nextStateA.collectionsToAdd).toEqual(testLists)
    })

    it('should be able to toggle tags to add/remove', async (context: {
        storage: Storage
    }) => {
        const { logic, initialState: state } = await setup(context)
        const testTag = 'test tag'

        expect(state.tagsToAdd.length).toBe(0)
        const nextStateA = logic.withMutation(
            state,
            logic.toggleTag({ event: { name: testTag }, previousState: state }),
        )

        expect(nextStateA.tagsToAdd.length).toBe(1)
        expect(nextStateA.tagsToAdd[0]).toEqual(testTag)

        const nextStateB = logic.withMutation(
            nextStateA,
            logic.toggleTag({
                event: { name: testTag },
                previousState: nextStateA,
            }),
        )
        expect(nextStateB.tagsToAdd.length).toBe(0)
    })

    it('should be able to toggle collections to add/remove', async (context: {
        storage: Storage
    }) => {
        const { logic, initialState: state } = await setup(context)
        const testCollection = 'test coll'

        expect(state.collectionsToAdd.length).toBe(0)
        const nextStateA = logic.withMutation(
            state,
            logic.toggleCollection({
                event: { name: testCollection },
                previousState: state,
            }),
        )

        expect(nextStateA.collectionsToAdd.length).toBe(1)
        expect(nextStateA.collectionsToAdd[0]).toEqual(testCollection)

        const nextStateB = logic.withMutation(
            nextStateA,
            logic.toggleCollection({
                event: { name: testCollection },
                previousState: nextStateA,
            }),
        )
        expect(nextStateB.collectionsToAdd.length).toBe(0)
    })
})
