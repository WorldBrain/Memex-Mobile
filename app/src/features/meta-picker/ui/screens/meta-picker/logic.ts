import { UILogic, UIEvent, UIEventHandler } from 'ui-logic-core'

import type { UIServices, UITaskState, UIStorageModules } from 'src/ui/types'
import type { SpacePickerEntry } from 'src/features/meta-picker/types'
import { loadInitial, executeUITask } from 'src/ui/utils'
import {
    NormalizedState,
    initNormalizedState,
    normalizedStateToArray,
} from '@worldbrain/memex-common/lib/common-ui/utils/normalized-state'
import { validateSpaceName } from '@worldbrain/memex-common/lib/utils/space-name-validation'

export interface State {
    entries: NormalizedState<SpacePickerEntry>
    inputText: string
    loadState: UITaskState
}

export type Event = UIEvent<{
    toggleEntryChecked: { id: number }
    suggestEntries: { text: string }
    addEntry: null
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
    private _defaultEntries = initNormalizedState<SpacePickerEntry>()

    constructor(private props: Props) {
        super()
    }

    private set defaultEntries(entries: NormalizedState<SpacePickerEntry>) {
        this._defaultEntries = {
            allIds: [...entries.allIds],
            byId: { ...entries.byId },
        }
    }

    private get defaultEntries(): NormalizedState<SpacePickerEntry> {
        return this._defaultEntries
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
        this.defaultEntries = entries

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
                    seedData: normalizedStateToArray(this.defaultEntries),
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

    addEntry: EventHandler<'addEntry'> = async ({ event, previousState }) => {
        const { metaPicker } = this.props.storage.modules

        const validationResult = validateSpaceName(
            previousState.inputText,
            normalizedStateToArray(this.defaultEntries),
        )

        if (!validationResult.valid) {
            throw new Error(
                `Cannot add new list with invalid name: ${validationResult.reason}`,
            )
        }

        const name = previousState.inputText.trim()
        const { object: newList } = await metaPicker.createList({ name })
        const newEntry: SpacePickerEntry = {
            name,
            id: newList.id,
            isChecked: true,
        }

        this.defaultEntries.allIds.unshift(newEntry.id)
        this.defaultEntries.byId[newEntry.id] = { ...newEntry }
        this.emitMutation({
            inputText: { $set: '' },
            entries: {
                allIds: { $unshift: [newList.id] },
                byId: {
                    [newList.id]: {
                        $set: { ...newEntry },
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

        this.defaultEntries.byId[event.id].isChecked = !entry.isChecked
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
