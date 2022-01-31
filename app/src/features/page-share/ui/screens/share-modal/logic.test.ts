import expect from 'expect'

import { storageKeys } from '../../../../../../app.json'
import Logic, { State, Event } from './logic'
import { makeStorageTestFactory } from 'src/index.tests'
import type { TestDevice } from 'src/types.tests'
import type { Storage } from 'src/storage/types'
import { FakeStatefulUIElement } from 'src/ui/index.tests'

import * as DATA from './logic.test.data'
import type { List } from '@worldbrain/memex-common/lib/storage/modules/mobile-app/features/meta-picker/types'
import {
    SPECIAL_LIST_NAMES,
    SPECIAL_LIST_IDS,
} from '@worldbrain/memex-common/lib/storage/modules/lists/constants'

describe('share modal UI logic tests', () => {
    const it = makeStorageTestFactory()

    async function setup(
        options: TestDevice & {
            getPageTitle?: () => Promise<string>
            getSharedText?: () => string
            getSharedUrl?: () => string
            syncError?: () => string | undefined
        },
    ) {
        await options.services.localStorage.set(storageKeys.syncKey, true)
        const pageFetcher = options.getPageTitle
            ? ({ fetchPageTitle: options.getPageTitle } as any)
            : options.services.pageFetcher
        const trackedErrors: Error[] = []

        const logic = new Logic({
            ...options,
            navigation: options.navigation as any,
            route: options.route as any,
            services: {
                ...options.services,
                shareExt: ({
                    getSharedText: options.getSharedText
                        ? options.getSharedText
                        : () => 'test page',
                    getSharedUrl: options.getSharedUrl
                        ? options.getSharedUrl
                        : () => 'http://test.com',
                } as any) as any,
                pageFetcher,
                errorTracker: {
                    track: (err: Error) => {
                        trackedErrors.push(err)
                    },
                } as any,
                cloudSync: {
                    sync: async () => {
                        const errMsg = options.syncError?.()
                        if (errMsg) {
                            throw new Error(errMsg)
                        }
                        return { totalChanges: 0 }
                    },
                    ____wipeDBForSync: async () => undefined,
                },
            },
        })
        const initialState = logic.getInitialState()
        const element = new FakeStatefulUIElement<State, Event>(logic)

        return { logic, initialState, element, trackedErrors }
    }

    it('should detect unsupported applications (no URL shared)', async (context) => {
        const { element } = await setup({
            ...context,
            getSharedUrl: () => {
                throw new Error()
            },
        })
        await element.init()
        try {
            expect(element.state).toEqual(
                expect.objectContaining({
                    pageUrl: '',
                    tagsToAdd: [],
                    collectionsToAdd: [],
                    isUnsupportedApplication: true,
                    isStarred: false,
                }),
            )
        } finally {
            await element.cleanup()
        }
    })

    it('should load correctly with a URL, but no stored page', async (context) => {
        const pageUrl = DATA.PAGE_URL_1
        const { element } = await setup({
            ...context,
            getSharedUrl: () => pageUrl,
        })
        await element.init()
        try {
            expect(element.state).toEqual(
                expect.objectContaining({
                    pageUrl,
                    tagsToAdd: [],
                    collectionsToAdd: [],
                    isUnsupportedApplication: false,
                    isStarred: false,
                }),
            )
        } finally {
            await element.cleanup()
        }
    })

    it('should start page title fetch+write on init, then wait for it on save', async (context) => {
        const fullPageUrl = DATA.PAGE_URL_1
        const normalizedPageUrl = DATA.PAGE_URL_1_NORM
        const testTitle = 'test title'

        const { element, logic, trackedErrors } = await setup({
            ...context,
            getSharedUrl: () => fullPageUrl,
            getPageTitle: async () => testTitle,
        })

        const lookupPage = () =>
            context.storage.manager
                .collection('pages')
                .findObject({ url: normalizedPageUrl })

        expect(await lookupPage()).toBe(null)
        expect(logic.pageTitleFetchRunning).toBe(null)
        await element.init()
        expect(await lookupPage()).toEqual(
            expect.objectContaining({
                url: normalizedPageUrl,
                fullUrl: fullPageUrl,
                text: '',
            }),
        )
        expect(logic.pageTitleFetchRunning).not.toBe(null)

        await element.processEvent('save', { isInputDirty: false })
        expect(trackedErrors).toEqual([])
        expect(await lookupPage()).toEqual(
            expect.objectContaining({
                url: normalizedPageUrl,
                fullUrl: fullPageUrl,
                fullTitle: testTitle,
                text: '',
            }),
        )
    })

    it('should start page title fetch+write on init, but write no title due to fetch error', async (context) => {
        const fullPageUrl = DATA.PAGE_URL_1
        const normalizedPageUrl = DATA.PAGE_URL_1_NORM
        const dummyError = new Error('test')

        const { element, logic, trackedErrors } = await setup({
            ...context,
            getSharedUrl: () => fullPageUrl,
            getPageTitle: async () => {
                throw dummyError
            },
        })

        const lookupPage = () =>
            context.storage.manager
                .collection('pages')
                .findObject({ url: normalizedPageUrl })

        expect(await lookupPage()).toBe(null)
        expect(logic.pageTitleFetchRunning).toBe(null)
        await element.init()
        expect(await lookupPage()).toEqual(
            expect.objectContaining({
                url: normalizedPageUrl,
                fullUrl: fullPageUrl,
                text: '',
            }),
        )
        expect(logic.pageTitleFetchRunning).not.toBe(null)

        await element.processEvent('save', { isInputDirty: false })
        expect(trackedErrors).toEqual([dummyError])
        expect(await lookupPage()).toEqual(
            expect.objectContaining({
                url: normalizedPageUrl,
                fullUrl: fullPageUrl,
                text: '',
            }),
        )
    })

    it('should not start page title fetch+write on init if title is already indexed', async (context) => {
        const fullPageUrl = DATA.PAGE_URL_1
        const normalizedPageUrl = DATA.PAGE_URL_1_NORM
        const testTitle = 'test title'

        const { element, logic, trackedErrors } = await setup({
            ...context,
            getSharedUrl: () => fullPageUrl,
            getPageTitle: async () => testTitle,
        })

        await context.storage.modules.overview.createPage({
            url: normalizedPageUrl,
            fullUrl: fullPageUrl,
            fullTitle: testTitle,
            text: '',
        })

        const lookupPage = () =>
            context.storage.manager
                .collection('pages')
                .findObject({ url: normalizedPageUrl })

        expect(await lookupPage()).toEqual(
            expect.objectContaining({
                url: normalizedPageUrl,
                fullUrl: fullPageUrl,
                fullTitle: testTitle,
                text: '',
            }),
        )

        expect(logic.pageTitleFetchRunning).toBe(null)
        await element.init()
        expect(logic.pageTitleFetchRunning).toBe(null)

        await element.processEvent('save', { isInputDirty: false })
        expect(logic.pageTitleFetchRunning).toBe(null)
        expect(trackedErrors).toEqual([])
        expect(await lookupPage()).toEqual(
            expect.objectContaining({
                url: normalizedPageUrl,
                fullUrl: fullPageUrl,
                fullTitle: testTitle,
                text: '',
            }),
        )
    })

    it('should set error message state if sync error encountered', async (context) => {
        const errMsg = 'this is a test'
        const pageUrl = DATA.PAGE_URL_1

        const { element } = await setup({
            ...context,
            getSharedUrl: () => pageUrl,
            syncError: () => errMsg,
        })

        expect(element.state.errorMessage).toBeUndefined()
        await element.init()
        expect(element.state.errorMessage).toEqual(errMsg)
    })

    it('should clear error message state if retry sync is succesfull', async (context) => {
        const errMsg = 'this is a test'
        const pageUrl = DATA.PAGE_URL_1
        let shouldFail = true

        const { element } = await setup({
            ...context,
            getSharedUrl: () => pageUrl,
            syncError: () => (shouldFail ? errMsg : undefined),
        })

        expect(element.state.errorMessage).toBeUndefined()
        await element.init()
        expect(element.state.errorMessage).toEqual(errMsg)

        shouldFail = false
        await element.processEvent('retrySync', null)
        expect(element.state.errorMessage).toBeUndefined()
    })

    it('should update error message state if retry sync is unsuccesfull', async (context) => {
        let errMsg = 'this is a test'
        const pageUrl = DATA.PAGE_URL_1

        const { element } = await setup({
            ...context,
            getSharedUrl: () => pageUrl,
            syncError: () => errMsg,
        })

        expect(element.state.errorMessage).toBeUndefined()
        await element.init()
        expect(element.state.errorMessage).toEqual(errMsg)

        errMsg = 'this is another test'
        await element.processEvent('retrySync', null)
        expect(element.state.errorMessage).toEqual(errMsg)
    })

    it('should correctly load page starred', async (context) => {
        const pageUrl = DATA.PAGE_URL_1
        await context.storage.modules.overview.createPage({
            url: pageUrl,
            fullUrl: pageUrl,
        } as any)
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
            expect(element.state).toEqual(
                expect.objectContaining({
                    pageUrl,
                    tagsToAdd: [],
                    collectionsToAdd: [],
                    isUnsupportedApplication: false,
                    isStarred: true,
                }),
            )
        } finally {
            await element.cleanup()
        }
    })

    it('should correctly load tags', async (context) => {
        const pageUrl = DATA.PAGE_URL_1
        await context.storage.modules.overview.createPage({
            url: pageUrl,
            fullUrl: pageUrl,
        } as any)
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
            expect(element.state).toEqual(
                expect.objectContaining({
                    pageUrl,
                    collectionsToAdd: [],
                    tagsToAdd: ['tagA', 'tagB'],
                    isUnsupportedApplication: false,
                    isStarred: false,
                }),
            )
        } finally {
            await element.cleanup()
        }
    })

    it('should correctly associate lists', async (context) => {
        const pageUrl = DATA.PAGE_URL_1
        await context.storage.modules.overview.createPage({
            url: pageUrl,
            fullUrl: pageUrl,
        } as any)
        const {
            object: { id: listId },
        } = await context.storage.modules.metaPicker.createList({
            name: 'My list',
        })
        await context.storage.modules.metaPicker.createPageListEntry({
            fullPageUrl: pageUrl,
            listId,
        })
        const { element } = await setup({
            ...context,
            getSharedUrl: () => pageUrl,
        })
        await element.init()
        try {
            expect(element.state).toEqual(
                expect.objectContaining({
                    pageUrl,
                    collectionsToAdd: ['My list'],
                    tagsToAdd: [],
                    isUnsupportedApplication: false,
                    isStarred: false,
                }),
            )
        } finally {
            await element.cleanup()
        }
    })

    it('should be able to undo a page save', async (context) => {
        const pageUrl = DATA.PAGE_URL_1
        const url = DATA.PAGE_URL_1_NORM
        const { element } = await setup({
            ...context,
            getSharedUrl: () => pageUrl,
        })

        await element.init()
        expect(element.state).toEqual(
            expect.objectContaining({
                isModalShown: true,
                showSavingPage: false,
            }),
        )

        expect(
            await context.storage.manager
                .collection('pages')
                .findObject({ url }),
        ).toBeTruthy()

        await element.processEvent('undoPageSave', null)

        expect(
            await context.storage.manager
                .collection('pages')
                .findObject({ url }),
        ).toBeFalsy()

        expect(element.state).toEqual(
            expect.objectContaining({
                isModalShown: false,
                showSavingPage: true,
            }),
        )
    })

    it('should be able to undo a page visit (for already indexed page)', async (context) => {
        const pageUrl = DATA.PAGE_URL_1
        const url = DATA.PAGE_URL_1_NORM
        const { element } = await setup({
            ...context,
            getSharedUrl: () => pageUrl,
        })

        await context.storage.modules.overview.createPage({
            url: pageUrl,
            fullUrl: pageUrl,
        } as any)

        expect(
            await context.storage.manager
                .collection('pages')
                .findObject({ url }),
        ).toBeTruthy()

        await element.init()

        expect(element.state).toEqual(
            expect.objectContaining({
                isModalShown: true,
                showSavingPage: false,
            }),
        )

        expect(
            await context.storage.manager
                .collection('visits')
                .findObjects({ url }),
        ).toEqual([
            expect.objectContaining({
                url,
            }),
        ])

        await element.processEvent('undoPageSave', null)

        expect(
            await context.storage.manager
                .collection('pages')
                .findObject({ url }),
        ).toBeTruthy()

        expect(
            await context.storage.manager
                .collection('visits')
                .findObjects({ url }),
        ).toEqual([])

        expect(element.state).toEqual(
            expect.objectContaining({
                isModalShown: false,
                showSavingPage: true,
            }),
        )
    })

    it('should be able to set page url', async (context) => {
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

    it('should be able to set note text', async (context) => {
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

    it('should be able to show modal', async (context) => {
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

    it('should be able to set meta view type', async (context) => {
        const { element } = await setup(context)

        expect(element.state.metaViewShown).toBeUndefined()
        expect(element.state.statusText).toEqual('')

        await element.processEvent('setMetaViewType', { type: 'tags' })
        expect(element.state.metaViewShown).toEqual('tags')
        expect(element.state.statusText).toEqual('Tags')

        await element.processEvent('setMetaViewType', { type: 'collections' })
        expect(element.state.metaViewShown).toEqual('collections')
        expect(element.state.statusText).toEqual('Collections')

        await element.processEvent('setMetaViewType', { type: undefined })
        expect(element.state.metaViewShown).toBeUndefined()
        expect(element.state.statusText).toEqual('')
    })

    it('should be able to star pages', async (context) => {
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

    it('should be able to set lists to add', async (context) => {
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

    it('should be able to toggle tags to add/remove', async (context) => {
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

    it('should be able to toggle collections to add/remove', async (context) => {
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

    it('should be able to store a page', async (context) => {
        const { logic, initialState: state } = await setup(context)
        const TEST_DATA = new DATA.TestData({
            url: DATA.PAGE_URL_1,
            title: DATA.PAGE_TITLE_1,
            normalizedUrl: DATA.PAGE_URL_1_NORM,
        })

        expect(
            await context.storage.manager
                .collection('customLists')
                .findObjects({}),
        ).toEqual([])

        await logic['storePage']({
            ...state,
            pageUrl: DATA.PAGE_URL_1,
            pageTitle: DATA.PAGE_TITLE_1,
        })

        expect(
            await context.storage.manager.collection('pages').findObjects({}),
        ).toEqual([TEST_DATA.PAGE])

        const lists: List[] = await context.storage.manager
            .collection('customLists')
            .findObjects({})
        expect(lists).toEqual([
            expect.objectContaining({
                name: SPECIAL_LIST_NAMES.INBOX,
                id: SPECIAL_LIST_IDS.INBOX,
                isDeletable: false,
                isNestable: false,
            }),
            expect.objectContaining({
                id: SPECIAL_LIST_IDS.MOBILE,
                name: SPECIAL_LIST_NAMES.MOBILE,
                isDeletable: false,
                isNestable: false,
            }),
        ])
        expect(
            await context.storage.manager
                .collection('pageListEntries')
                .findObjects({}),
        ).toEqual([
            expect.objectContaining({
                fullUrl: DATA.PAGE_URL_1,
                pageUrl: DATA.PAGE_URL_1_NORM,
                listId: SPECIAL_LIST_IDS.INBOX,
            }),
            expect.objectContaining({
                fullUrl: DATA.PAGE_URL_1,
                pageUrl: DATA.PAGE_URL_1_NORM,
                listId: lists[1].id,
            }),
        ])
    })

    it('should be able to store a page with a note', async (context) => {
        const { logic, initialState: state } = await setup(context)
        const TEST_DATA = new DATA.TestData({
            url: DATA.PAGE_URL_1,
            title: DATA.PAGE_TITLE_1,
            normalizedUrl: DATA.PAGE_URL_1_NORM,
            noteText: DATA.NOTE_1_TEXT,
        })

        await logic['storePage'](
            {
                ...state,
                pageTitle: DATA.PAGE_TITLE_1,
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

    it('should be able to store a page with a note on a URL with hash fragment', async (context) => {
        const { logic, initialState: state } = await setup(context)
        const TEST_DATA = new DATA.TestData({
            url: DATA.PAGE_URL_2,
            title: DATA.PAGE_TITLE_1,
            domain: DATA.PAGE_URL_1_NORM,
            hostname: DATA.PAGE_URL_1_NORM,
            normalizedUrl: DATA.PAGE_URL_2_NORM,
            noteText: DATA.NOTE_1_TEXT,
        })

        await logic['storePage'](
            {
                ...state,
                pageTitle: DATA.PAGE_TITLE_1,
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
