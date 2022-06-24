import { Alert } from 'react-native'
import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from 'ui-logic-core'

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

export interface State {
    loadState: UITaskState
    page: Page
    mode: EditorMode
}

export type Event = UIEvent<{
    toggleNotePress: { url: string }
    removeEntry: { listId: number }
    createEntry: { listId: number }
    confirmNoteDelete: { url: string }
    saveNote: { text: string }
    focusFromNavigation: MainNavigatorParamList['PageEditor']
    goBack: null
}>

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
            page: {} as any,
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
        const lists = await metaPicker.findListsByPage({ url })

        return {
            ...storedPage,
            titleText: storedPage.fullTitle,
            date: 'a minute ago',
            tags: [],
            listIds: lists.map((l) => l.id),
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
                isEdited:
                    note.lastEdited?.getTime() !== note.createdWhen!.getTime(),
                date: timeFromNow(note.lastEdited ?? note.createdWhen!),
            })),
        }
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
                        tags: [],
                    },
                ],
            }),
        }
    }

    goBack({ previousState }: IncomingUIEvent<State, Event, 'goBack'>) {
        this.props.route.params.updatePage(previousState.page)
        this.props.navigation.goBack()
    }
}
