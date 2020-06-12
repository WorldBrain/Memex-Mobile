import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from 'ui-logic-core'

import { UITaskState, UIStorageModules, NavigationProps } from 'src/ui/types'
import { loadInitial, executeUITask } from 'src/ui/utils'
import { MetaTypeShape, MetaType } from 'src/features/meta-picker/types'

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
    storage: UIStorageModules<'metaPicker'>
    onEntryPress: (item: MetaTypeShape) => Promise<void>
    suggestInputPlaceholder?: string
    singleSelect?: boolean
    extraEntries?: string[]
    initEntries?: string[]
    initEntry?: string
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
            selectedEntryName: this.props.initEntry,
        }
    }

    async init(incoming: IncomingUIEvent<State, Event, 'init'>) {
        await loadInitial<State>(this, async () => {
            await this.loadInitEntries()
        })
    }

    private calculateSelectedEntries(): string[] {
        if (this.props.singleSelect) {
            return this.props.initEntry ? [this.props.initEntry] : []
        }
        return this.props.initEntries ?? []
    }

    private async loadInitEntries(selected?: string[]) {
        selected = selected ?? this.calculateSelectedEntries()

        const { metaPicker } = this.props.storage.modules

        const entries = new Map<string, MetaTypeShape>()
        const results =
            this.props.type === 'tags'
                ? await metaPicker.findTagSuggestions({
                      url: this.props.url,
                  })
                : await metaPicker.findListSuggestions({
                      url: this.props.url,
                  })

        this.props.extraEntries?.forEach(name => {
            entries.set(name, { name, isChecked: false })
        })

        results.forEach(res => {
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
