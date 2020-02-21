import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from 'ui-logic-core'

import { UIPageWithNotes as Page } from 'src/features/overview/types'
import { EditorMode } from 'src/features/page-editor/types'
import { NavigationProps, UIStorageModules, UITaskState } from 'src/ui/types'
import { loadInitial } from 'src/ui/utils'

export interface State {
    loadState: UITaskState
    page: Page
    mode: EditorMode
}

export type Event = UIEvent<{
    toggleNotePress: { url: string }
    setEditorMode: { mode: EditorMode }
    setInputText: { text: string }
    removeEntry: { name: string }
    createEntry: { name: string }
    deleteNote: { url: string }
    saveNote: { text: string }
    setPage: { page: Page }
}>

export interface Props extends NavigationProps {
    storage: UIStorageModules<'metaPicker' | 'pageEditor'>
}

export default class Logic extends UILogic<State, Event> {
    constructor(private props: Props) {
        super()
    }

    getInitialState(): State {
        return {
            loadState: 'pristine',
            mode: 'tags',
            page: {} as any,
        }
    }

    async init(incoming: IncomingUIEvent<State, Event, 'init'>) {
        await loadInitial<State>(this, async () => {
            const page = this.props.navigation.getParam('page', {})
            const mode = this.props.navigation.getParam('mode', 'tags')
            this.emitMutation({ page: { $set: page }, mode: { $set: mode } })
        })
    }

    toggleNotePress(
        incoming: IncomingUIEvent<State, Event, 'toggleNotePress'>,
    ): UIMutation<State> {
        return {
            page: state => {
                const noteIndex = state.notes.findIndex(
                    note => note.url === incoming.event.url,
                )

                return {
                    ...state,
                    notes: [
                        ...state.notes.slice(0, noteIndex),
                        {
                            ...state.notes[noteIndex],
                            isNotePressed: !state.notes[noteIndex]
                                .isNotePressed,
                        },
                        ...state.notes.slice(noteIndex + 1),
                    ],
                }
            },
        }
    }

    async removeEntry({
        event: { name },
        previousState,
    }: IncomingUIEvent<State, Event, 'removeEntry'>) {
        const { metaPicker } = this.props.storage.modules
        const url = previousState.page.url

        if (previousState.mode === 'tags') {
            this.emitMutation({
                page: state => {
                    const i = state.tags.indexOf(name)

                    const tags = [
                        ...state.tags.slice(0, i),
                        ...state.tags.slice(i + 1),
                    ]

                    return { ...state, tags }
                },
            })
            await metaPicker.deleteTag({ url, name })
        } else {
            this.emitMutation({
                page: state => {
                    const i = state.lists.indexOf(name)

                    const lists = [
                        ...state.lists.slice(0, i),
                        ...state.lists.slice(i + 1),
                    ]

                    return { ...state, lists }
                },
            })
            await metaPicker.deletePageEntryByName({ url, name })
        }
    }

    async createEntry({
        event: { name },
        previousState,
    }: IncomingUIEvent<State, Event, 'createEntry'>) {
        const { metaPicker } = this.props.storage.modules
        const url = previousState.page.url

        if (previousState.mode === 'tags') {
            this.emitMutation({
                page: state => ({
                    ...state,
                    tags: [...state.tags, name],
                }),
            })
            await metaPicker.createTag({ url, name })
        } else {
            this.emitMutation({
                page: state => ({
                    ...state,
                    lists: [...state.lists, name],
                }),
            })
            const lists = await metaPicker.findListsByNames({ names: [name] })

            let listId
            if (!lists.length) {
                const { object } = await metaPicker.createList({ name })
                listId = object.id
            } else {
                listId = lists[0].id
            }

            await metaPicker.createPageListEntry({ pageUrl: url, listId })
        }
    }

    async deleteNote({
        event: { url },
        previousState,
    }: IncomingUIEvent<State, Event, 'deleteNote'>) {
        this.emitMutation({
            page: state => {
                const noteIndex = state.notes.findIndex(
                    note => note.url === url,
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

        try {
            await pageEditor.deleteNoteByUrl({ url })
        } catch (error) {
            this.emitMutation({ page: { $set: previousState.page } })
        }
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
                    },
                ],
            }),
        }
    }
}
