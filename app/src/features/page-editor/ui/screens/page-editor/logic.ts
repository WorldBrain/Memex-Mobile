import { Alert } from 'react-native'
import {
    UILogic,
    UIEvent,
    IncomingUIEvent,
    UIMutation,
    UIEventHandler,
} from 'ui-logic-core'

import type {
    UIPageWithNotes as _Page,
    UINote as Note,
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

type Page = Omit<_Page, 'notes'> & { noteIds: string[] }

export interface State {
    page: Omit<Page, 'notes'> & { noteIds: string[] }
    mode: EditorMode
    previousMode: EditorMode | null
    annotationUrlToEdit: string | null
    loadState: UITaskState
    listData: { [listId: string]: List }
    noteData: { [noteId: string]: Note }
}

export type Event = UIEvent<{
    setAnnotationToEdit: { annotationUrl: string }
    toggleNotePress: { url: string }
    removeEntry: { listId: number }
    createEntry: { listId: number }
    confirmNoteDelete: { url: string }
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
            annotationUrlToEdit: null,
            page: {} as any,
            listData: {},
            noteData: {},
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
            noteData: {
                $set: notes.reduce(
                    (acc, note) => ({
                        ...acc,
                        [note.url]: {
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
                                note.lastEdited?.getTime() !==
                                note.createdWhen!.getTime(),
                            date: timeFromNow(
                                note.lastEdited ?? note.createdWhen!,
                            ),
                        },
                    }),
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
            noteIds: notes.map((note) => note.url),
        }
    }

    setAnnotationToEdit: EventHandler<'setAnnotationToEdit'> = async ({
        event,
        previousState,
    }) => {
        this.emitMutation({
            mode: { $set: 'annotation-spaces' },
            previousMode: { $set: previousState.mode },
            annotationUrlToEdit: { $set: event.annotationUrl },
        })
    }

    toggleNotePress(
        incoming: IncomingUIEvent<State, Event, 'toggleNotePress'>,
    ): UIMutation<State> {
        return {
            noteData: {
                [incoming.event.url]: { isNotePressed: (prev) => !prev },
            },
        }
    }

    removeEntry: EventHandler<'removeEntry'> = async ({
        event: { listId },
        previousState,
    }) => {
        const { metaPicker } = this.props.storage.modules

        if (
            previousState.mode === 'annotation-spaces' &&
            previousState.annotationUrlToEdit != null
        ) {
            this.emitMutation({
                noteData: {
                    [previousState.annotationUrlToEdit]: {
                        listIds: (ids) => ids.filter((id) => id != listId),
                    },
                },
            })
            await metaPicker.deleteAnnotEntryFromList({
                annotationUrl: previousState.annotationUrlToEdit,
                listId,
            })
        } else {
            this.emitMutation({
                page: {
                    listIds: (ids) => ids.filter((id) => id != listId),
                },
            })
            await metaPicker.deletePageEntryFromList({
                url: previousState.page.url,
                listId,
            })
        }
    }

    createEntry: EventHandler<'createEntry'> = async ({
        event: { listId },
        previousState,
    }) => {
        const { metaPicker } = this.props.storage.modules

        if (
            previousState.mode === 'annotation-spaces' &&
            previousState.annotationUrlToEdit != null
        ) {
            this.emitMutation({
                noteData: {
                    [previousState.annotationUrlToEdit]: {
                        listIds: { $unshift: [listId] },
                    },
                },
            })
            await metaPicker.createAnnotListEntry({
                annotationUrl: previousState.annotationUrlToEdit,
                listId,
            })
        } else {
            this.emitMutation({ page: { listIds: { $unshift: [listId] } } })
            await metaPicker.createPageListEntry({
                fullPageUrl: previousState.page.url,
                listId,
            })
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
            noteData: { $unset: [url] },
            page: { noteIds: (ids) => ids.filter((id) => id !== url) },
        })

        const { pageEditor } = this.props.storage.modules

        await pageEditor.deleteNoteByUrl({ url })
    }

    goBack({ previousState }: IncomingUIEvent<State, Event, 'goBack'>) {
        if (previousState.previousMode != null) {
            this.emitMutation({
                mode: { $set: previousState.previousMode },
                annotationUrlToEdit: { $set: null },
                previousMode: { $set: null },
            })
            return
        }
        this.props.route.params.updatePage({
            ...previousState.page,
            notes: previousState.page.noteIds.map(
                (noteId) => previousState.noteData[noteId],
            ),
        })
        this.props.navigation.goBack()
    }
}
