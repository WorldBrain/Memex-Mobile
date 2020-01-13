import expect from 'expect'

import Logic from './logic'
import { MetaType } from 'src/features/meta-picker/types'
import { makeStorageTestFactory } from 'src/index.tests'
import { Storage } from 'src/storage/types'
import { FakeStatefulUIElement } from 'src/ui/index.tests'

import * as DATA from './logic.test.data'

describe('share modal UI logic tests', () => {
    const it = makeStorageTestFactory()

    async function setup(options: {
        storage: Storage
        getSharedText?: () => string
        getSharedUrl?: () => string
    }) {
        const logic = new Logic({
            services: {
                shareExt: ({
                    getSharedText: options.getSharedText
                        ? options.getSharedText
                        : () => 'test page',
                    getSharedUrl: options.getSharedUrl
                        ? options.getSharedUrl
                        : () => 'http://test.com',
                } as any) as any,
                sync: {
                    continuousSync: {
                        forceIncrementalSync: () => Promise.resolve(),
                    },
                },
            } as any,
            storage: options.storage,
        })
        const initialState = logic.getInitialState()
        const element = new FakeStatefulUIElement(logic)

        return { logic, initialState, element }
    }

    it('should load correctly without a URL', async context => {
        const { element } = await setup({
            ...context,
            getSharedUrl: () => {
                throw new Error()
            },
        })
        await element.init()
        try {
            expect(element.state).toEqual({
                loadState: 'done',
                saveState: 'pristine',
                syncState: 'pristine',
                collectionsToAdd: [],
                isModalShown: true,
                isUnsupportedApplication: true,
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
        const pageUrl = DATA.PAGE_URL_1
        const { element } = await setup({
            ...context,
            getSharedUrl: () => pageUrl,
        })
        await element.init()
        try {
            expect(element.state).toEqual({
                loadState: 'done',
                saveState: 'pristine',
                syncState: 'pristine',
                collectionsToAdd: [],
                isUnsupportedApplication: false,
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
        const pageUrl = DATA.PAGE_URL_1
        await context.storage.modules.overview.starPage({
            url: pageUrl,
            time: Date.now(),
        })
        const { element } = await setup({
            ...context,
            getSharedUrl: () => pageUrl,
        })
        await element.init()
        try {
            expect(element.state).toEqual({
                loadState: 'done',
                saveState: 'pristine',
                syncState: 'pristine',
                collectionsToAdd: [],
                isUnsupportedApplication: false,
                isModalShown: true,
                isStarred: true,
                noteText: '',
                pageUrl,
                statusText: '',
                tagsToAdd: [],
            })
        } finally {
            await element.cleanup()
        }
    })

    it('should correctly load tags', async context => {
        const pageUrl = DATA.PAGE_URL_1
        await context.storage.modules.metaPicker.createTag({
            url: pageUrl,
            name: 'tagA',
        })
        await context.storage.modules.metaPicker.createTag({
            url: pageUrl,
            name: 'tagB',
        })
        const { element } = await setup({
            ...context,
            getSharedUrl: () => pageUrl,
        })
        await element.init()
        try {
            expect(element.state).toEqual({
                loadState: 'done',
                saveState: 'pristine',
                syncState: 'pristine',
                collectionsToAdd: [],
                isUnsupportedApplication: false,
                isModalShown: true,
                isStarred: false,
                noteText: '',
                pageUrl,
                statusText: '',
                tagsToAdd: ['tagA', 'tagB'],
            })
        } finally {
            await element.cleanup()
        }
    })

    it('should correctly associated lists', async context => {
        const pageUrl = DATA.PAGE_URL_1
        const {
            object: { id: listId },
        } = await context.storage.modules.metaPicker.createList({
            name: 'My list',
        })
        await context.storage.modules.metaPicker.createPageListEntry({
            pageUrl,
            listId,
        })
        const { element } = await setup({
            ...context,
            getSharedUrl: () => pageUrl,
        })
        await element.init()
        try {
            expect(element.state).toEqual({
                loadState: 'done',
                saveState: 'pristine',
                syncState: 'pristine',
                collectionsToAdd: ['My list'],
                isUnsupportedApplication: false,
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

    it('should be able to set page url', async (context: {
        storage: Storage
    }) => {
        const { logic, initialState: state } = await setup(context)
        const testUrl = DATA.PAGE_URL_1

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

        logic['syncRunning'] = Promise.resolve()

        let previousState = state

        for (const type of types) {
            let newState: typeof state

            logic.events.on('mutation', (mutation: any) => {
                newState = logic.withMutation(state, mutation)

                // If final mutation
                if (mutation.syncState.$set === 'done') {
                    expect(previousState.syncState).not.toBe('done')
                    expect(newState.syncState).toBe('done')

                    expect(previousState.metaViewShown).not.toBe(type)
                    expect(newState.metaViewShown).toBe(type)
                }

                previousState = newState
            })

            await logic.setMetaViewType({
                event: { type },
                previousState,
            })
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

    it('should be able to store a page', async context => {
        const { logic, initialState: state } = await setup(context)
        const TEST_DATA = new DATA.TestData({
            url: DATA.PAGE_URL_1,
            normalizedUrl: DATA.PAGE_URL_1_NORM,
        })

        await logic['storePage']({ ...state, pageUrl: DATA.PAGE_URL_1 })

        expect(
            await context.storage.manager.collection('pages').findObjects({}),
        ).toEqual([TEST_DATA.PAGE])
    })

    it('should be able to store a page with a note', async context => {
        const { logic, initialState: state } = await setup(context)
        const TEST_DATA = new DATA.TestData({
            url: DATA.PAGE_URL_1,
            normalizedUrl: DATA.PAGE_URL_1_NORM,
            noteText: DATA.NOTE_1_TEXT,
        })

        await logic['storePage'](
            {
                ...state,
                pageUrl: DATA.PAGE_URL_1,
                noteText: DATA.NOTE_1_TEXT,
            },
            DATA.NOTE_TIMESTAMP,
        )

        expect(
            await context.storage.manager.collection('pages').findObjects({}),
        ).toEqual([TEST_DATA.PAGE])

        expect(
            await context.storage.manager
                .collection('annotations')
                .findObjects({}),
        ).toEqual([TEST_DATA.NOTE])
    })

    it('should be able to store a page with a note on a URL with hash fragment', async context => {
        const { logic, initialState: state } = await setup(context)
        const TEST_DATA = new DATA.TestData({
            url: DATA.PAGE_URL_2,
            domain: DATA.PAGE_URL_1_NORM,
            hostname: DATA.PAGE_URL_1_NORM,
            normalizedUrl: DATA.PAGE_URL_2_NORM,
            noteText: DATA.NOTE_1_TEXT,
        })

        await logic['storePage'](
            {
                ...state,
                pageUrl: DATA.PAGE_URL_2,
                noteText: DATA.NOTE_1_TEXT,
            },
            DATA.NOTE_TIMESTAMP,
        )

        expect(
            await context.storage.manager.collection('pages').findObjects({}),
        ).toEqual([TEST_DATA.PAGE])

        expect(
            await context.storage.manager
                .collection('annotations')
                .findObjects({}),
        ).toEqual([TEST_DATA.NOTE])
    })
})
