import { Alert } from 'react-native'
import {
    UILogic,
    UIEvent,
    IncomingUIEvent,
    UIMutation,
    UIEventHandler,
} from 'ui-logic-core'

import type {
    UIPageWithNotes as Page,
    UINote,
} from 'src/features/overview/types'
import type { EditorMode } from 'src/features/page-editor/types'
import type {
    MainNavProps,
    UIStorageModules,
    UITaskState,
    UIServices,
} from 'src/ui/types'
import { loadInitial } from 'src/ui/utils'
import { timeFromNow } from 'src/utils/time-helpers'
import type { MainNavigatorParamList } from 'src/ui/navigation/types'
import type { List } from 'src/features/meta-picker/types'

export interface State {
    page: Page
    mode: EditorMode
    previousMode: EditorMode | null
    loadState: UITaskState
    listData: { [listId: string]: List }
}

export type Event = UIEvent<{
    setEditorMode: { mode: EditorMode }
    toggleNotePress: { url: string }
    removeEntry: { listId: number }
    createEntry: { listId: number }
    confirmNoteDelete: { url: string }
    saveNote: { text: string }
    focusFromNavigation: MainNavigatorParamList['PageEditor']
    goBack: null
}>

type EventHandler<EventName extends keyof Event> = UIEventHandler<
    State,
    Event,
    EventName
>

export interface Props extends MainNavProps<'PageEditor'> {
    services: UIServices<'syncStorage'>
    storage: UIStorageModules<'metaPicker' | 'pageEditor' | 'overview'>
}

export default class Logic extends UILogic<State, Event> {
    constructor(private props: Props) {
        super()
    }

    getInitialState(): State {
        return {
            loadState: 'pristine',
            mode: 'collections',
            previousMode: null,
            page: {} as any,
            listData: {},
        }
    }

    async init({ previousState }: IncomingUIEvent<State, Event, 'init'>) {
        const { params } = this.props.route
        await this.focusFromNavigation({ previousState, event: params })
    }

    async focusFromNavigation({
        event: params,
    }: IncomingUIEvent<State, Event, 'focusFromNavigation'>) {
        await loadInitial<State>(this, async () => {
            const page = await this.loadPageData(params.pageUrl)
            this.emitMutation({
                page: { $set: page },
                mode: { $set: params.mode ?? 'collections' },
            })
        })
    }

    private async loadPageData(url: string): Promise<Page> {
        const { overview, pageEditor, metaPicker } = this.props.storage.modules
        const storedPage = await overview.findPage({ url })

        if (!storedPage) {
            throw new Error('No page found in DB for given route.')
        }

        const notes = await pageEditor.findNotes({ url })
        const listIdsByNotes = await metaPicker.findAnnotListIdsByAnnots({
            annotationUrls: notes.map((note) => note.url),
        })

        const pageListIds = await metaPicker.findListIdsByPage({ url })
        const noteListIds = new Set(Object.values(listIdsByNotes).flat())
        const listData = await metaPicker.findListsByIds({
            ids: [...noteListIds, ...pageListIds],
        })

        this.emitMutation({
            listData: {
                $set: listData.reduce(
                    (acc, list) => ({ ...acc, [list.id]: list }),
                    {},
                ),
            },
        })

        return {
            ...storedPage,
            titleText: storedPage.fullTitle,
            date: 'a minute ago',
            tags: [],
            listIds: pageListIds,
            pageUrl: storedPage.url,
            // TODO: unify this map fn with the identical one in DashboardLogic
            notes: notes.map<UINote>((note) => ({
                domain: storedPage.domain,
                fullUrl: url,
                url: note.url,
                isStarred: note.isStarred,
                commentText: note.comment || undefined,
                noteText: note.body,
                isNotePressed: false,
                tags: [],
                listIds: listIdsByNotes[note.url],
                isEdited:
                    note.lastEdited?.getTime() !== note.createdWhen!.getTime(),
                date: timeFromNow(note.lastEdited ?? note.createdWhen!),
            })),
        }
    }

    setEditorMode: EventHandler<'setEditorMode'> = async ({
        event,
        previousState,
    }) => {
        this.emitMutation({
            mode: { $set: event.mode },
            previousMode: { $set: previousState.mode },
        })
    }

    toggleNotePress(
        incoming: IncomingUIEvent<State, Event, 'toggleNotePress'>,
    ): UIMutation<State> {
        return {
            page: (state) => {
                const noteIndex = state.notes.findIndex(
                    (note) => note.url === incoming.event.url,
                )

                return {
                    ...state,
                    notes: [
                        ...state.notes.slice(0, noteIndex),
                        {
                            ...state.notes[noteIndex],
                            isNotePressed:
                                !state.notes[noteIndex].isNotePressed,
                        },
                        ...state.notes.slice(noteIndex + 1),
                    ],
                }
            },
        }
    }

    async removeEntry({
        event: { listId },
        previousState,
    }: IncomingUIEvent<State, Event, 'removeEntry'>) {
        const { metaPicker } = this.props.storage.modules
        const url = previousState.page.url

        this.emitMutation({
            page: (state) => {
                const i = state.listIds.indexOf(listId)
                return {
                    ...state,
                    listIds: [
                        ...state.listIds.slice(0, i),
                        ...state.listIds.slice(i + 1),
                    ],
                }
            },
        })
        await metaPicker.deletePageEntryFromList({ url, listId })
    }

    async createEntry({
        event: { listId },
        previousState,
    }: IncomingUIEvent<State, Event, 'createEntry'>) {
        const { metaPicker } = this.props.storage.modules

        this.emitMutation({
            page: (state) => ({
                ...state,
                listIds: [listId, ...state.listIds],
            }),
        })

        await metaPicker.createPageListEntry({
            fullPageUrl: previousState.page.url,
            listId,
        })
    }

    async confirmNoteDelete({
        event: { url },
    }: IncomingUIEvent<State, Event, 'confirmNoteDelete'>) {
        Alert.alert('Delete Note?', `You cannot get this back`, [
            {
                text: 'Delete',
                onPress: () => this.deleteNote(url),
            },
            { text: 'Cancel' },
        ])
    }

    private async deleteNote(url: string) {
        this.emitMutation({
            page: (state) => {
                const noteIndex = state.notes.findIndex(
                    (note) => note.url === url,
                )

                return {
                    ...state,
                    notes: [
                        ...state.notes.slice(0, noteIndex),
                        ...state.notes.slice(noteIndex + 1),
                    ],
                }
            },
        })

        const { pageEditor } = this.props.storage.modules

        await pageEditor.deleteNoteByUrl({ url })
    }

    saveNote(
        incoming: IncomingUIEvent<State, Event, 'saveNote'>,
    ): UIMutation<State> {
        // TODO: Generate new URL, or get it from storage layer
        return {
            page: ({ notes = [], ...page }) => ({
                ...page,
                notes: [
                    ...notes,
                    {
                        url: page.url,
                        date: 'now',
                        commentText: incoming.event.text,
                        domain: page.domain,
                        fullUrl: page.fullUrl,
                        listIds: [],
                        tags: [],
                    },
                ],
            }),
        }
    }

    goBack({ previousState }: IncomingUIEvent<State, Event, 'goBack'>) {
        if (previousState.previousMode != null) {
            this.emitMutation({
                mode: { $set: previousState.previousMode },
                previousMode: { $set: null },
            })
            return
        }
        this.props.route.params.updatePage(previousState.page)
        this.props.navigation.goBack()
    }
}
