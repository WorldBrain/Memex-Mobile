import { UILogic, UIEvent, IncomingUIEvent } from 'ui-logic-core'

import {
    UIServices,
    UITaskState,
    UIStorageModules,
    NavigationProps,
} from 'src/ui/types'
import { storageKeys } from '../../../../../../app.json'
import { loadInitial, executeUITask } from 'src/ui/utils'
import { MetaTypeShape, MetaType } from 'src/features/meta-picker/types'
import { INIT_SUGGESTIONS_LIMIT } from './constants'

export interface State {
    entries: Map<string, MetaTypeShape>
    inputText: string
    loadState: UITaskState
    selectedEntryName?: string
}

export type Event = UIEvent<{
    suggestEntries: { text: string; selected: string[] }
    addEntry: { entry: MetaTypeShape; selected: string[] }
    toggleEntryChecked: { name: string; selected: string[] }
    setEntries: { entries: MetaTypeShape[] }
    reload: { selected: string[] }
}>

export interface Props extends NavigationProps {
    onEntryPress: (item: MetaTypeShape) => Promise<void>
    storage: UIStorageModules<'metaPicker'>
    services: UIServices<'localStorage'>
    suggestInputPlaceholder?: string
    initSelectedEntries?: string[]
    initSelectedEntry?: string
    extraEntries?: string[]
    singleSelect?: boolean
    className?: string
    type: MetaType
    url: string
}

export default class Logic extends UILogic<State, Event> {
    constructor(private props: Props) {
        super()
    }

    getInitialState(): State {
        return {
            loadState: 'pristine',
            entries: new Map(),
            inputText: '',
            selectedEntryName: this.props.initSelectedEntry,
        }
    }

    async init(incoming: IncomingUIEvent<State, Event, 'init'>) {
        await loadInitial<State>(this, async () => {
            await this.loadInitEntries()
        })
    }

    private calculateSelectedEntries(): string[] {
        if (this.props.singleSelect) {
            return this.props.initSelectedEntry
                ? [this.props.initSelectedEntry]
                : []
        }
        return this.props.initSelectedEntries ?? []
    }

    private async loadSuggestions(
        limit = INIT_SUGGESTIONS_LIMIT,
    ): Promise<MetaTypeShape[]> {
        const { metaPicker } = this.props.storage.modules
        const { localStorage } = this.props.services

        const storageKey =
            this.props.type === 'tags'
                ? storageKeys.tagSuggestionsCache
                : storageKeys.listSuggestionsCache

        const cache = (await localStorage.get<string[]>(storageKey)) ?? []

        const suggestions: MetaTypeShape[] = cache.map(name => ({
            name,
            isChecked: false,
        }))

        if (suggestions.length >= limit) {
            return suggestions
        }

        const dbResults =
            this.props.type === 'tags'
                ? await metaPicker.findTagSuggestions({
                      limit: limit - cache.length,
                      url: this.props.url,
                  })
                : await metaPicker.findListSuggestions({
                      limit: limit - cache.length,
                      url: this.props.url,
                  })

        return [...dbResults, ...suggestions]
    }

    private async loadInitEntries(selected?: string[]) {
        const entries = new Map<string, MetaTypeShape>()
        selected = selected ?? this.calculateSelectedEntries()

        this.props.extraEntries?.forEach(name => {
            entries.set(name, { name, isChecked: false })
        })

        const loadedSuggestions = await this.loadSuggestions()
        loadedSuggestions.forEach(res => {
            entries.set(res.name, res)
        })

        selected.forEach(name => {
            entries.set(name, { name, isChecked: true })
        })

        this.emitMutation({
            entries: {
                $set: entries,
            },
            inputText: { $set: '' },
        })
    }

    async reload(incoming: IncomingUIEvent<State, Event, 'reload'>) {
        return executeUITask<State, 'loadState', void>(
            this,
            'loadState',
            async () => {
                await this.loadInitEntries(incoming.event.selected)
            },
        )
    }

    async suggestEntries({
        event: { text, selected },
    }: IncomingUIEvent<State, Event, 'suggestEntries'>) {
        await executeUITask<State, 'loadState', void>(
            this,
            'loadState',
            async () => {
                this.emitMutation({ inputText: { $set: text } })

                if (!text.trim().length) {
                    return this.loadInitEntries(selected)
                }

                return this.suggestNewEntries(text, selected)
            },
        )
    }

    private async suggestNewEntries(text: string, selected: string[]) {
        const { metaPicker } = this.props.storage.modules
        const collection =
            this.props.type === 'collections' ? 'customLists' : 'tags'

        const results = await metaPicker.suggest({
            collection,
            query: { name: text },
        })
        const entries = results.map(res => [
            res.name,
            { ...res, isChecked: selected.includes(res.name) },
        ]) as [string, MetaTypeShape][]

        this.emitMutation({
            entries: {
                $set: new Map(entries),
            },
        })
    }

    async addEntry(incoming: IncomingUIEvent<State, Event, 'addEntry'>) {
        const { entry, selected } = incoming.event

        return this.loadInitEntries([entry.name, ...selected])
    }

    async toggleEntryChecked({
        event: { name, selected },
        previousState,
    }: IncomingUIEvent<State, Event, 'toggleEntryChecked'>) {
        const entry = previousState.entries.get(name)!

        if (entry.isChecked) {
            const i = selected.indexOf(name)
            selected = [...selected.slice(0, i), ...selected.slice(i + 1)]
        } else {
            selected = [name, ...selected]
        }

        return this.loadInitEntries(selected)
    }
}
