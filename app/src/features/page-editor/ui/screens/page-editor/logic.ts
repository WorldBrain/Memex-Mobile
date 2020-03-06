import { Alert } from 'react-native'
import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from 'ui-logic-core'

import { UIPageWithNotes as Page, UINote } from 'src/features/overview/types'
import { EditorMode } from 'src/features/page-editor/types'
import { NavigationProps, UIStorageModules, UITaskState } from 'src/ui/types'
import { loadInitial } from 'src/ui/utils'
import { timeFromNow } from 'src/utils/time-helpers'

export interface State {
    loadState: UITaskState
    page: Page
    mode: EditorMode
}

export type Event = UIEvent<{
    toggleNotePress: { url: string }
    removeEntry: { name: string }
    createEntry: { name: string }
    confirmNoteDelete: { url: string }
    saveNote: { text: string }
}>

export interface Props extends NavigationProps {
    storage: UIStorageModules<'metaPicker' | 'pageEditor' | 'overview'>
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
            const mode = this.props.navigation.getParam('mode', 'tags')
            const pageUrl = this.props.navigation.getParam('pageUrl')
            const page = await this.loadPageData(pageUrl)

            this.emitMutation({ page: { $set: page }, mode: { $set: mode } })
        })
    }

    private async loadPageData(url: string): Promise<Page> {
        const { overview, pageEditor, metaPicker } = this.props.storage.modules
        const storedPage = await overview.findPage({ url })

        if (!storedPage) {
            throw new Error('No page found in DB for given route.')
        }

        const notes = await pageEditor.findNotes({ url })

        const noteTags = new Map<string, string[]>()

        for (const note of notes) {
            const tags = await metaPicker.findTagsByPage({ url: note.url })
            noteTags.set(
                note.url,
                tags.map(t => t.name),
            )
        }

        return {
            ...storedPage,
            titleText: storedPage.fullTitle,
            date: 'a minute ago',
            tags: [],
            lists: [],
            pageUrl: storedPage.url,
            // TODO: unify this map fn with the identical one in DashboardLogic
            notes: notes.map<UINote>(note => ({
                domain: storedPage.domain,
                fullUrl: url,
                url: note.url,
                isStarred: note.isStarred,
                commentText: note.comment || undefined,
                noteText: note.body,
                isNotePressed: false,
                tags: noteTags.get(note.url)!,
                isEdited:
                    note.lastEdited &&
                    note.lastEdited.getTime() !== note.createdWhen!.getTime(),
                date: note.lastEdited
                    ? timeFromNow(note.lastEdited)
                    : timeFromNow(note.createdWhen!),
            })),
        } as Page
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
                    },
                ],
            }),
        }
    }
}
