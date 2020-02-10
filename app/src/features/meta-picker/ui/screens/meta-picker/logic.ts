import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from 'ui-logic-core'

import { UITaskState, UIStorageModules, NavigationProps } from 'src/ui/types'
import { loadInitial, executeUITask } from 'src/ui/utils'
import { MetaTypeShape, MetaType } from 'src/features/meta-picker/types'

export interface State {
    inputText: string
    entries: Map<string, MetaTypeShape>
    loadState: UITaskState
}

export type Event = UIEvent<{
    suggestEntries: { text: string; selected: string[] }
    addEntry: { entry: MetaTypeShape }
    setEntries: { entries: MetaTypeShape[] }
    toggleEntryChecked: { name: string }
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
            await this.loadInitEntries()
        })
    }

    private async loadInitEntries() {
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

        this.props.initEntries.forEach(name => {
            entries.set(name, { name, isChecked: true })
        })

        results.forEach(res => {
            if (!this.props.initEntries.includes(res.name)) {
                entries.set(res.name, res)
            }
        })

        this.emitMutation({
            entries: {
                $set: entries,
            },
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

                await this.suggestNewEntries(text, selected)
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
        const entries = results
            .filter(res => !selected.includes(res.name))
            .map(res => [res.name, { ...res, isChecked: false }]) as [
            string,
            MetaTypeShape,
        ][]

        const selectedEntries: [string, MetaTypeShape][] = selected.map(
            name => [
                name,
                {
                    name,
                    isChecked: true,
                },
            ],
        )

        this.emitMutation({
            entries: {
                $set: new Map([...selectedEntries, ...entries]),
            },
        })
    }

    addEntry(
        incoming: IncomingUIEvent<State, Event, 'addEntry'>,
    ): UIMutation<State> {
        const { entry } = incoming.event

        return {
            inputText: { $set: '' },
            entries: state =>
                state.set(entry.name, {
                    name: entry.name,
                    isChecked: true,
                }),
        }
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
