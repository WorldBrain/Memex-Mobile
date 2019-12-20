import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from 'ui-logic-core'

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
    constructor(private dependencies: LogicDependencies) {
        super()
    }

    getInitialState(): State {
        return {
            isUnsupportedApplication: false,
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

    async init() {
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

    setMetaViewType(
        incoming: IncomingUIEvent<State, Event, 'setMetaViewType'>,
    ): UIMutation<State> {
        return { metaViewShown: { $set: incoming.event.type } }
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
            await executeUITask(this, 'syncState', async () => {
                return this.dependencies.services.sync.continuousSync.forceIncrementalSync()
            })
            this.emitMutation(
                this.setModalVisible({
                    event: { shown: false },
                    previousState: incoming.previousState,
                }),
            )
        })
    }

    metaPickerEntryPress(
        incoming: IncomingUIEvent<State, Event, 'metaPickerEntryPress'>,
    ) {
        const { entry } = incoming.event
        if (incoming.previousState.metaViewShown === 'tags') {
            this.emitMutation(
                this.toggleTag({
                    event: { name: entry.name },
                    previousState: incoming.previousState,
                }),
            )
        } else {
            this.emitMutation(
                this.toggleCollection({
                    event: { name: entry.name },
                    previousState: incoming.previousState,
                }),
            )
        }
    }

    private async storePage(state: State) {
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
            await pageEditor.createNote({
                comment: state.noteText.trim(),
                pageUrl: state.pageUrl,
                pageTitle: '',
            })
        }
    }
}
