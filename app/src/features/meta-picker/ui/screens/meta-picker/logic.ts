import { UILogic, UIEvent, UIEventHandler } from 'ui-logic-core'

import type { UITaskState, UIStorageModules } from 'src/ui/types'
import type { SpacePickerEntry } from 'src/features/meta-picker/types'
import { loadInitial, executeUITask } from 'src/ui/utils'
import {
    NormalizedState,
    initNormalizedState,
    cloneNormalizedState,
    normalizedStateToArray,
} from '@worldbrain/memex-common/lib/common-ui/utils/normalized-state'
import { validateSpaceName } from '@worldbrain/memex-common/lib/utils/space-name-validation'
import { INIT_SUGGESTIONS_LIMIT } from './constants'

export interface State {
    entries: NormalizedState<SpacePickerEntry, number>
    inputText: string
    loadState: UITaskState
    searchState: UITaskState
}

export type Event = UIEvent<{
    toggleEntryChecked: { id: number }
    suggestEntries: { text: string }
    addEntry: null
    reload: null
}>

export interface Props {
    storage: UIStorageModules<'metaPicker'>
    suggestInputPlaceholder?: string
    initSelectedEntries?: number[]
    extraEntries?: SpacePickerEntry[]
    filterMode?: boolean
    onEntryPress?: (item: SpacePickerEntry) => Promise<void>
}

type EventHandler<EventName extends keyof Event> = UIEventHandler<
    State,
    Event,
    EventName
>

export default class Logic extends UILogic<State, Event> {
    private _defaultEntries = initNormalizedState<SpacePickerEntry, number>()

    constructor(private props: Props) {
        super()
    }

    private set defaultEntries(
        entries: NormalizedState<SpacePickerEntry, number>,
    ) {
        this._defaultEntries = cloneNormalizedState(entries)
    }

    private get defaultEntries(): NormalizedState<SpacePickerEntry, number> {
        return this._defaultEntries
    }

    getInitialState(): State {
        return {
            inputText: '',
            loadState: 'pristine',
            searchState: 'pristine',
            entries: initNormalizedState(),
        }
    }

    init: EventHandler<'init'> = async () => {
        await loadInitial<State>(this, async () => {
            await this.loadInitEntries()
        })
    }

    private async loadInitEntries() {
        const loadedSuggestions = await this.props.storage.modules.metaPicker.findListSuggestions(
            {
                limit: INIT_SUGGESTIONS_LIMIT,
                includeSpecialLists: this.props.filterMode,
            },
        )

        const entries = initNormalizedState<SpacePickerEntry, number>({
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
            inputText: { $set: '' },
            entries: { $set: cloneNormalizedState(this.defaultEntries) },
        })
    }

    suggestEntries: EventHandler<'suggestEntries'> = async ({ event }) => {
        const { metaPicker } = this.props.storage.modules
        this.emitMutation({ inputText: { $set: event.text } })

        if (!event.text.trim().length) {
            this.resetEntries()
            return
        }

        await executeUITask<State, 'searchState', void>(
            this,
            'searchState',
            async () => {
                const suggestions = await metaPicker.suggestLists({
                    query: { name: event.text },
                    includeSpecialLists: this.props.filterMode,
                })

                // Ensure any new suggestions, not present in init query, get added to the default entries state (so they can be toggled and interacted withn)
                const nonTracked = suggestions.filter(
                    (s) => !this.defaultEntries.allIds.includes(s.id),
                )
                for (const suggestion of nonTracked) {
                    this.defaultEntries.allIds.push(suggestion.id)
                    this.defaultEntries.byId[suggestion.id] = { ...suggestion }
                }

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
        if (this.props.filterMode) {
            throw new Error('Cannot add new entries in SpacePicker filter mode')
        }

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
        const {
            object: newList,
        } = await this.props.storage.modules.metaPicker.createList({ name })
        const newEntry: SpacePickerEntry = {
            name,
            id: newList.id,
            isChecked: true,
        }

        this.defaultEntries.allIds.unshift(newEntry.id)
        this.defaultEntries.byId[newEntry.id] = { ...newEntry }
        this.resetEntries()
        await this.props.onEntryPress?.({ ...newEntry, isChecked: false })
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
        await this.props.onEntryPress?.(entry)
    }
}
