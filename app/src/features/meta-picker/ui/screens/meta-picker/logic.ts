import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from 'ui-logic-core'

import { UITaskState, UIStorageModules, NavigationProps } from 'src/ui/types'
import { loadInitial, executeUITask } from 'src/ui/utils'
import { MetaTypeShape, MetaType } from 'src/features/meta-picker/types'
import { Spec } from 'immutability-helper'

export interface State {
    inputText: string
    entries: Map<string, MetaTypeShape>
    loadState: UITaskState
}

export type Event = UIEvent<{
    toggleEntryChecked: { name: string }
    setEntries: { entries: MetaTypeShape[] }
    suggestEntries: { text: string; selected: string[] }
    addEntry: { entry: MetaTypeShape; selected: string[] }
}>

export interface Props extends NavigationProps {
    onEntryPress: (item: MetaTypeShape) => void
    storage: UIStorageModules<'metaPicker'>
    isSyncLoading: boolean
    initEntries: string[]
    type: MetaType
    url: string
}

export default class Logic extends UILogic<State, Event> {
    constructor(private props: Props) {
        super()
    }

    getInitialState(): State {
        return { loadState: 'pristine', entries: new Map(), inputText: '' }
    }

    async init(incoming: IncomingUIEvent<State, Event, 'init'>) {
        await loadInitial<State>(this, async () => {
            await this.loadInitEntries(this.props.initEntries)
        })
    }

    private async loadInitEntries(selected: string[]) {
        const { metaPicker } = this.props.storage.modules

        const results =
            this.props.type === 'tags'
                ? await metaPicker.findTagSuggestions({
                      url: this.props.url,
                  })
                : await metaPicker.findListSuggestions({
                      url: this.props.url,
                  })
        const entries = new Map<string, MetaTypeShape>()

        selected.forEach(name => {
            entries.set(name, { name, isChecked: true })
        })

        results.forEach(res => {
            if (!selected.includes(res.name)) {
                entries.set(res.name, res)
            }
        })

        this.emitMutation({
            entries: {
                $set: entries,
            },
            inputText: { $set: '' },
        })
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

    async suggestNewEntries(text: string, selected: string[]) {
        const { metaPicker } = this.props.storage.modules
        const collection =
            this.props.type === 'collections' ? 'customLists' : 'tags'

        const results = await metaPicker.suggest(this.props.url, {
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

    toggleEntryChecked({
        event: { name },
    }: IncomingUIEvent<State, Event, 'toggleEntryChecked'>): UIMutation<State> {
        return {
            entries: state => {
                const oldEntry = state.get(name)!
                return state.set(name, {
                    ...oldEntry,
                    isChecked: !oldEntry.isChecked,
                })
            },
        }
    }
}
