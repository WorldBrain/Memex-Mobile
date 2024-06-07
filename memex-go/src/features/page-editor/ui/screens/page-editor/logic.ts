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
import type { List, SpacePickerEntry } from 'src/features/meta-picker/types'
import type { AnnotationSharingState } from '@worldbrain/memex-common/lib/content-sharing/service/types'
import { AnnotationPrivacyLevels } from '@worldbrain/memex-common/lib/annotations/types'
import { areArrayContentsEqual } from 'src/utils/are-arrays-the-same'

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
    unselectEntry: { entry: SpacePickerEntry }
    selectEntry: { entry: SpacePickerEntry }
    confirmNoteDelete: { url: string }
    setAnnotationPrivacyLevel: {
        annotationUrl: string
        level: AnnotationPrivacyLevels
    }
    focusFromNavigation: MainNavigatorParamList['PageEditor']
    goBack: null
}>

type EventHandler<EventName extends keyof Event> = UIEventHandler<
    State,
    Event,
    EventName
>

export interface Props extends MainNavProps<'PageEditor'> {
    services: UIServices<'annotationSharing' | 'actionSheet'>
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
        const { annotationSharing } = this.props.services
        const storedPage = await overview.findPage({ url })

        if (!storedPage) {
            throw new Error('No page found in DB for given route.')
        }

        const notes = await pageEditor.findNotesByPage({
            url,
            withPrivacyLevels: true,
        })
        const annotationUrls = notes.map((note) => note.url)
        const annotationSharingStates = await annotationSharing.getAnnotationSharingStates(
            {
                annotationUrls,
            },
        )

        const getListIdsForSharingState = (
            state: AnnotationSharingState,
        ): number[] =>
            state == null
                ? []
                : [
                      ...new Set([
                          ...state.privateListIds,
                          ...state.sharedListIds,
                      ]),
                  ]

        const noteListIds = new Set<number>()
        for (const id of annotationUrls) {
            const listIds = getListIdsForSharingState(
                annotationSharingStates[id],
            )
            listIds.forEach((listId) => noteListIds.add(listId))
        }

        const pageListIds = await metaPicker.findListIdsByPage({ url })
        const listData = await metaPicker.findListsByIds({
            ids: [...noteListIds, ...pageListIds],
            includeRemoteIds: true,
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
                            privacyLevel: note.privacyLevel,
                            listIds: getListIdsForSharingState(
                                annotationSharingStates[note.url],
                            ),
                            remoteId:
                                annotationSharingStates[note.url]?.remoteId,
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

    unselectEntry: EventHandler<'unselectEntry'> = async ({
        event: { entry },
        previousState,
    }) => {
        const { metaPicker } = this.props.storage.modules
        const { annotationSharing } = this.props.services

        const removeListMutation = (ids: number[]) =>
            ids.filter((id) => id !== entry.id)

        if (
            previousState.mode === 'annotation-spaces' &&
            previousState.annotationUrlToEdit != null
        ) {
            this.emitMutation({
                noteData: {
                    [previousState.annotationUrlToEdit]: {
                        listIds: removeListMutation,
                    },
                },
            })
            const sharingState = await annotationSharing.removeAnnotationFromList(
                {
                    annotationUrl: previousState.annotationUrlToEdit,
                    listId: entry.id,
                },
            )

            // Update privacy level if it changed
            if (
                sharingState.privacyLevel !==
                previousState.noteData[previousState.annotationUrlToEdit]
                    .privacyLevel
            ) {
                this.emitMutation({
                    noteData: {
                        [previousState.annotationUrlToEdit]: {
                            privacyLevel: { $set: sharingState.privacyLevel },
                            remoteId: { $set: sharingState.remoteId },
                        },
                    },
                })
            }
        } else {
            const mutation: UIMutation<State> = {
                page: { listIds: removeListMutation },
                noteData: {},
            }

            // If list is shared, remove from public annots
            if (entry.remoteId != null) {
                const publicNoteIds = Object.values(previousState.noteData)
                    .filter(
                        (note) =>
                            note.url !== previousState.annotationUrlToEdit &&
                            [
                                AnnotationPrivacyLevels.SHARED,
                                AnnotationPrivacyLevels.SHARED_PROTECTED,
                            ].includes(note.privacyLevel!),
                    )
                    .map((note) => note.url)
                publicNoteIds.forEach((noteId) => {
                    ;(mutation.noteData as any)[noteId] = {
                        listIds: removeListMutation,
                    }
                })
            }

            this.emitMutation(mutation)

            await metaPicker.deletePageEntryFromList({
                url: previousState.page.url,
                listId: entry.id,
            })
        }
    }

    selectEntry: EventHandler<'selectEntry'> = async ({
        event: { entry },
        previousState,
    }) => {
        const { metaPicker } = this.props.storage.modules
        const { annotationSharing } = this.props.services

        // Add data to lists state if list not-yet-tracked
        if (previousState.listData[entry.id] == null) {
            this.emitMutation({
                listData: {
                    [entry.id]: {
                        $set: {
                            id: entry.id,
                            name: entry.name,
                            remoteId: entry.remoteId,
                            createdAt: new Date(), // TODO: This isn't used. Prob needs to be cleaned up from types here
                        },
                    },
                },
            })
        }

        const addListIfMissingMutation = (ids: number[]) =>
            ids.includes(entry.id) ? ids : [entry.id, ...ids]

        if (
            previousState.mode === 'annotation-spaces' &&
            previousState.annotationUrlToEdit != null
        ) {
            const mutation: UIMutation<State> = {
                noteData: {
                    [previousState.annotationUrlToEdit]: {
                        listIds: { $unshift: [entry.id] },
                    },
                },
            }

            // If list is shared, add to parent page + other public annots
            if (entry.remoteId != null) {
                mutation.page = { listIds: addListIfMissingMutation }
                const publicNoteIds = Object.values(previousState.noteData)
                    .filter(
                        (note) =>
                            note.url !== previousState.annotationUrlToEdit &&
                            [
                                AnnotationPrivacyLevels.SHARED,
                                AnnotationPrivacyLevels.SHARED_PROTECTED,
                            ].includes(note.privacyLevel!),
                    )
                    .map((note) => note.url)
                publicNoteIds.forEach((noteId) => {
                    ;(mutation.noteData as any)[noteId] = {
                        listIds: addListIfMissingMutation,
                    }
                })
            }

            this.emitMutation(mutation)

            const sharingState = await annotationSharing.addAnnotationToLists({
                annotationUrl: previousState.annotationUrlToEdit,
                listIds: [entry.id],
                protectAnnotation: true,
            })

            // Update privacy level if it changed
            if (
                sharingState.privacyLevel !==
                previousState.noteData[previousState.annotationUrlToEdit]
                    .privacyLevel
            ) {
                this.emitMutation({
                    noteData: {
                        [previousState.annotationUrlToEdit]: {
                            privacyLevel: { $set: sharingState.privacyLevel },
                            remoteId: { $set: sharingState.remoteId },
                        },
                    },
                })
            }
        } else {
            const mutation: UIMutation<State> = {
                page: { listIds: { $unshift: [entry.id] } },
                noteData: {},
            }

            // If list is shared, add to public annots
            if (entry.remoteId != null) {
                const publicNoteIds = Object.values(previousState.noteData)
                    .filter((note) =>
                        [
                            AnnotationPrivacyLevels.SHARED,
                            AnnotationPrivacyLevels.SHARED_PROTECTED,
                        ].includes(note.privacyLevel!),
                    )
                    .map((note) => note.url)
                publicNoteIds.forEach((noteId) => {
                    ;(mutation.noteData as any)[noteId] = {
                        listIds: addListIfMissingMutation,
                    }
                })
            }

            this.emitMutation(mutation)
            await metaPicker.createPageListEntry({
                fullPageUrl: previousState.page.url,
                listId: entry.id,
            })
        }
    }

    setAnnotationPrivacyLevel: EventHandler<
        'setAnnotationPrivacyLevel'
    > = async ({ event, previousState }) => {
        this.emitMutation({
            noteData: {
                [event.annotationUrl]: {
                    privacyLevel: { $set: event.level },
                },
            },
        })

        const sharingState = await this.props.services.annotationSharing.setAnnotationPrivacyLevel(
            {
                annotationUrl: event.annotationUrl,
                privacyLevel: event.level,
                keepListsIfUnsharing: true,
            },
        )
        const incomingListIds = [
            ...sharingState.privateListIds,
            ...sharingState.sharedListIds,
        ]

        this.emitMutation({
            noteData: {
                [event.annotationUrl]: {
                    remoteId: { $set: sharingState.remoteId },
                    listIds: (listIds) =>
                        !areArrayContentsEqual(
                            previousState.noteData[event.annotationUrl].listIds,
                            incomingListIds,
                        )
                            ? incomingListIds
                            : listIds,
                },
            },
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
