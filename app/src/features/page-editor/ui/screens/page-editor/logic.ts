import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from 'ui-logic-core'

import { UIPageWithNotes as Page } from 'src/features/overview/types'
import { EditorMode } from 'src/features/page-editor/types'
import { NavigationProps, UIStorageModules, UITaskState } from 'src/ui/types'
import { loadInitial } from 'src/ui/utils'
import { Spec } from 'immutability-helper'

export interface State {
    loadState: UITaskState
    showNoteAdder: boolean
    noteAdderInput: string
    page: Page
    mode: EditorMode
}

export type Event = UIEvent<{
    setShowNoteAdder: { show: boolean }
    setEditorMode: { mode: EditorMode }
    setInputText: { text: string }
    removeEntry: { name: string }
    createEntry: { name: string }
    saveNote: { text: string }
    setPage: { page: Page }
}>

export interface Props extends NavigationProps {
    storage: UIStorageModules<'metaPicker'>
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
            noteAdderInput: '',
            showNoteAdder: false,
        }
    }

    async init(incoming: IncomingUIEvent<State, Event, 'init'>) {
        await loadInitial<State>(this, async () => {
            const page = this.props.navigation.getParam('page', {})
            const mode = this.props.navigation.getParam('mode', 'tags')
            this.emitMutation({ page: { $set: page }, mode: { $set: mode } })
        })
    }

    setShowNoteAdder(
        incoming: IncomingUIEvent<State, Event, 'setShowNoteAdder'>,
    ): UIMutation<State> {
        return { showNoteAdder: { $set: incoming.event.show } }
    }

    setInputText(
        incoming: IncomingUIEvent<State, Event, 'setInputText'>,
    ): UIMutation<State> {
        return { noteAdderInput: { $set: incoming.event.text } }
    }

    async removeEntry({
        event: { name },
        previousState,
    }: IncomingUIEvent<State, Event, 'removeEntry'>) {
        const { metaPicker } = this.props.storage.modules
        const url = previousState.page.url

        const mutation: Spec<State, never> = {}

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
