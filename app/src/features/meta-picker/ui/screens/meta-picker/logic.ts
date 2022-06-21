import { UILogic, UIEvent, UIEventHandler } from 'ui-logic-core'

import type { UIServices, UITaskState, UIStorageModules } from 'src/ui/types'
import type { SpacePickerEntry } from 'src/features/meta-picker/types'
import { loadInitial, executeUITask } from 'src/ui/utils'
import {
    NormalizedState,
    initNormalizedState,
    normalizedStateToArray,
} from '@worldbrain/memex-common/lib/common-ui/utils/normalized-state'

export interface State {
    entries: NormalizedState<SpacePickerEntry>
    inputText: string
    loadState: UITaskState
}

export type Event = UIEvent<{
    toggleEntryChecked: { id: number }
    suggestEntries: { text: string }
    addEntry: { name: string }
    reload: null
}>

export interface Props {
    storage: UIStorageModules<'metaPicker'>
    services: UIServices<'syncStorage'>
    suggestInputPlaceholder?: string
    initSelectedEntries?: number[]
    extraEntries?: SpacePickerEntry[]
    singleSelect?: boolean
}

type EventHandler<EventName extends keyof Event> = UIEventHandler<
    State,
    Event,
    EventName
>

export default class Logic extends UILogic<State, Event> {
    private defaultEntries: SpacePickerEntry[] = []

    constructor(private props: Props) {
        super()
    }

    getInitialState(): State {
        return {
            inputText: '',
            loadState: 'pristine',
            entries: initNormalizedState(),
        }
    }

    init: EventHandler<'init'> = async () => {
        await loadInitial<State>(this, async () => {
            await this.loadInitEntries()
        })
    }

    private async loadInitEntries() {
        const loadedSuggestions = await this.loadSuggestions()

        const entries = initNormalizedState<SpacePickerEntry>({
            seedData: [
                ...(this.props.extraEntries ?? []),
                ...loadedSuggestions,
            ],
            getId: (entry) => entry.id,
        })

        this.props.initSelectedEntries?.forEach((id) => {
            entries.byId[id] = { ...entries.byId[id], isChecked: true }
        })

        // Remember these to be able to reset state to, post-search
        this.defaultEntries = normalizedStateToArray(entries)

        this.emitMutation({
            entries: { $set: entries },
            inputText: { $set: '' },
        })
    }

    reload: EventHandler<'reload'> = async ({}) => {
        await executeUITask<State, 'loadState', void>(
            this,
            'loadState',
            async () => {
                await this.loadInitEntries()
            },
        )
    }

    private resetEntries() {
        this.emitMutation({
            entries: {
                $set: initNormalizedState({
                    seedData: this.defaultEntries,
                    getId: (entry) => entry.id,
                }),
            },
        })
    }

    suggestEntries: EventHandler<'suggestEntries'> = async ({ event }) => {
        const { metaPicker } = this.props.storage.modules
        await executeUITask<State, 'loadState', void>(
            this,
            'loadState',
            async () => {
                this.emitMutation({ inputText: { $set: event.text } })

                if (!event.text.trim().length) {
                    return this.resetEntries()
                }

                const suggestions = await metaPicker.suggestLists({
                    query: { name: event.text },
                })

                this.emitMutation({
                    entries: {
                        $set: initNormalizedState({
                            seedData: suggestions,
                            getId: (entry) => entry.id,
                        }),
                    },
                })
            },
        )
    }

    addEntry: EventHandler<'addEntry'> = async ({ event }) => {
        const { metaPicker } = this.props.storage.modules

        const existing = await metaPicker.findListByName({ name: event.name })
        if (existing) {
            throw new Error('Cannot add new list with name already in use')
        }

        const { object: newList } = await metaPicker.createList({
            name: event.name,
        })

        this.emitMutation({
            entries: {
                allIds: { $unshift: [newList.id] },
                byId: {
                    [newList.id]: {
                        $set: {
                            id: newList.id,
                            name: event.name,
                            isChecked: true,
                        },
                    },
                },
            },
        })
    }

    toggleEntryChecked: EventHandler<'toggleEntryChecked'> = async ({
        event,
        previousState,
    }) => {
        const entry = previousState.entries.byId[event.id]

        if (!entry) {
            throw new Error(
                `Space entry not found to toggle for ID ${event.id}`,
            )
        }

        this.emitMutation({
            entries: {
                byId: {
                    [event.id]: {
                        isChecked: { $set: !entry.isChecked },
                    },
                },
            },
        })
    }

    private async loadSuggestions(): Promise<SpacePickerEntry[]> {
        const { metaPicker } = this.props.storage.modules
        const { syncStorage } = this.props.services

        const cache: number[] = [] // TODO: Set up new cache with IDs
        // (await syncStorage.get<number[]>(
        //     storageKeys.listSuggestionsCache,
        // )) ?? []

        // const suggestions: SpacePickerEntry[] = cache.map((id) => ({
        //     name,
        //     isChecked: false,
        // }))

        // if (suggestions.length >= limit) {
        //     return suggestions
        // }

        const entries = await metaPicker.findListSuggestions({
            // limit: limit - cache.length,
            limit: 10000,
        })

        return entries
    }
}
