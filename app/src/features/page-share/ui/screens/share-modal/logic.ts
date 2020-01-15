import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from 'ui-logic-core'
import { SyncReturnValue } from '@worldbrain/storex-sync'

import { MetaType, MetaTypeShape } from 'src/features/meta-picker/types'
import { UITaskState, UIServices, UIStorageModules } from 'src/ui/types'
import { loadInitial, executeUITask } from 'src/ui/utils'

export interface State {
    loadState: UITaskState
    saveState: UITaskState
    syncState: UITaskState
    pageUrl: string
    statusText: string
    noteText: string
    tagsToAdd: string[]
    collectionsToAdd: string[]
    isStarred: boolean
    isModalShown: boolean
    isUnsupportedApplication: boolean
    metaViewShown?: MetaType
}
export type Event = UIEvent<{
    save: {}

    metaPickerEntryPress: { entry: MetaTypeShape }
    setMetaViewType: { type?: MetaType }
    setModalVisible: { shown: boolean }
    togglePageStar: {}
    setNoteText: { value: string }

    toggleTag: { name: string }
    toggleCollection: { name: string }
    setPageUrl: { url: string }
    setPageStar: { value: boolean }
    setStatusText: { value: string }
    setTagsToAdd: { values: string[] }
    setCollectionsToAdd: { values: string[] }
}>

export interface LogicDependencies {
    services: UIServices<'sync' | 'shareExt'>
    storage: UIStorageModules<'overview' | 'metaPicker' | 'pageEditor'>
}

export default class Logic extends UILogic<State, Event> {
    private syncRunning!: Promise<void | SyncReturnValue>

    constructor(private dependencies: LogicDependencies) {
        super()
    }

    getInitialState(): State {
        return {
            isUnsupportedApplication: true,
            loadState: 'pristine',
            saveState: 'pristine',
            syncState: 'pristine',
            pageUrl: '',
            isModalShown: true,
            isStarred: false,
            tagsToAdd: [],
            collectionsToAdd: [],
            noteText: '',
            statusText: '',
        }
    }

    private handleSyncError = (err: Error) => {
        console.log('SYNC ERROR:', err.message)
    }

    async init() {
        this.syncRunning = this.dependencies.services.sync.continuousSync.forceIncrementalSync()

        this.syncRunning.catch(this.handleSyncError)

        await loadInitial(this, async () => {
            let mutation: UIMutation<State> = {}
            let url: string

            try {
                url = await this.dependencies.services.shareExt.getSharedUrl()
            } catch (err) {
                this.emitMutation({
                    ...mutation,
                    isUnsupportedApplication: { $set: true },
                })
                return
            }

            mutation = {
                ...mutation,
                pageUrl: { $set: url },
            }

            const { overview, metaPicker } = this.dependencies.storage.modules
            const isStarred = await overview.isPageStarred({ url })
            const tags = await metaPicker.findTagsByPage({ url })
            const collections = await metaPicker.findListsByPage({ url })

            mutation = {
                ...mutation,
                isStarred: { $set: isStarred },
                tagsToAdd: { $set: tags.map(tag => tag.name) },
                collectionsToAdd: { $set: collections.map(c => c.name) },
            }

            this.emitMutation(mutation)
        })
    }

    setPageUrl(
        incoming: IncomingUIEvent<State, Event, 'setPageUrl'>,
    ): UIMutation<State> {
        return { pageUrl: { $set: incoming.event.url } }
    }

    setStatusText(
        incoming: IncomingUIEvent<State, Event, 'setStatusText'>,
    ): UIMutation<State> {
        return { statusText: { $set: incoming.event.value } }
    }

    setModalVisible(
        incoming: IncomingUIEvent<State, Event, 'setModalVisible'>,
    ): UIMutation<State> {
        return { isModalShown: { $set: incoming.event.shown } }
    }

    setNoteText(
        incoming: IncomingUIEvent<State, Event, 'setNoteText'>,
    ): UIMutation<State> {
        return { noteText: { $set: incoming.event.value } }
    }

    setPageStar(
        incoming: IncomingUIEvent<State, Event, 'setPageStar'>,
    ): UIMutation<State> {
        return { isStarred: { $set: incoming.event.value } }
    }

    setTagsToAdd(
        incoming: IncomingUIEvent<State, Event, 'setTagsToAdd'>,
    ): UIMutation<State> {
        return { tagsToAdd: { $set: incoming.event.values } }
    }

    setCollectionsToAdd(
        incoming: IncomingUIEvent<State, Event, 'setCollectionsToAdd'>,
    ): UIMutation<State> {
        return { collectionsToAdd: { $set: incoming.event.values } }
    }

    toggleTag(
        incoming: IncomingUIEvent<State, Event, 'toggleTag'>,
    ): UIMutation<State> {
        return {
            tagsToAdd: state => {
                const index = state.indexOf(incoming.event.name)

                if (index !== -1) {
                    return [...state.slice(0, index), ...state.slice(index + 1)]
                }

                return [...state, incoming.event.name]
            },
        }
    }

    toggleCollection(
        incoming: IncomingUIEvent<State, Event, 'toggleCollection'>,
    ): UIMutation<State> {
        return {
            collectionsToAdd: state => {
                const index = state.indexOf(incoming.event.name)

                if (index !== -1) {
                    return [...state.slice(0, index), ...state.slice(index + 1)]
                }

                return [...state, incoming.event.name]
            },
        }
    }

    togglePageStar(
        incoming: IncomingUIEvent<State, Event, 'togglePageStar'>,
    ): UIMutation<State> {
        return {
            isStarred: { $set: !incoming.previousState.isStarred },
        }
    }

    async save(incoming: IncomingUIEvent<State, Event, 'save'>) {
        return executeUITask(this, 'saveState', async () => {
            await this.storePage(incoming.previousState)
            try {
                await this.syncRunning
                await this.dependencies.services.sync.continuousSync.forceIncrementalSync()
            } catch (error) {
                this.handleSyncError(error)
            } finally {
                this.emitMutation(
                    this.setModalVisible({
                        event: { shown: false },
                        previousState: incoming.previousState,
                    }),
                )
            }
        })
    }

    async setMetaViewType(
        incoming: IncomingUIEvent<State, Event, 'setMetaViewType'>,
    ) {
        return executeUITask(this, 'syncState', async () => {
            this.emitMutation({ metaViewShown: { $set: incoming.event.type } })

            await this.syncRunning
        })
    }

    metaPickerEntryPress(
        incoming: IncomingUIEvent<State, Event, 'metaPickerEntryPress'>,
    ) {
        const { entry } = incoming.event
        const event = {
            event: { name: entry.name },
            previousState: incoming.previousState,
        }

        const mutation =
            incoming.previousState.metaViewShown === 'tags'
                ? this.toggleTag(event)
                : this.toggleCollection(event)

        this.emitMutation(mutation)
    }

    private async storePage(state: State, customTimestamp?: number) {
        const {
            overview,
            metaPicker,
            pageEditor,
        } = this.dependencies.storage.modules

        await overview.createPage({
            url: state.pageUrl,
            fullUrl: state.pageUrl,
            text: '',
            fullTitle: '',
        })
        await overview.visitPage({ url: state.pageUrl })
        await overview.setPageStar({
            url: state.pageUrl,
            isStarred: state.isStarred,
        })

        await metaPicker.setPageLists({
            url: state.pageUrl,
            lists: state.collectionsToAdd,
        })
        await metaPicker.setPageTags({
            url: state.pageUrl,
            tags: state.tagsToAdd,
        })

        if (state.noteText.trim().length > 0) {
            await pageEditor.createNote(
                {
                    comment: state.noteText.trim(),
                    pageUrl: state.pageUrl,
                    pageTitle: '',
                },
                customTimestamp,
            )
        }
    }
}
