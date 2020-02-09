import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from 'ui-logic-core'

import { UITaskState, UIStorageModules } from 'src/ui/types'
import { loadInitial, executeUITask } from 'src/ui/utils'
import { MetaTypeShape, MetaType } from 'src/features/meta-picker/types'
import delay from 'src/utils/delay'

export interface State {
    inputText: string
    entries: Map<string, MetaTypeShape>
    loadState: UITaskState
}

export type Event = UIEvent<{
    suggestEntries: { text: string }
    addEntry: { entry: MetaTypeShape }
    setEntries: { entries: MetaTypeShape[] }
    toggleEntryChecked: { name: string }
}>

export interface LogicDependencies {
    initEntries: string[]
    storage: UIStorageModules<'metaPicker'>
    type: MetaType
    url: string
}

export default class Logic extends UILogic<State, Event> {
    private suggestRunning?: Promise<void>

    constructor(private dependencies: LogicDependencies) {
        super()
    }

    getInitialState(): State {
        return { loadState: 'pristine', entries: new Map(), inputText: '' }
    }

    async init(incoming: IncomingUIEvent<State, Event, 'init'>) {
        await loadInitial<State>(this, async () => {
            await this.loadInitEntries(incoming.previousState)
        })
    }

    private async loadInitEntries(prevState: State) {
        const { metaPicker } = this.dependencies.storage.modules

        const results =
            this.dependencies.type === 'tags'
                ? await metaPicker.findTagSuggestions({
                      url: this.dependencies.url,
                  })
                : await metaPicker.findListSuggestions({
                      url: this.dependencies.url,
                  })

        const entries = [
            ...results.map(res => [res.name, res]),
            ...this.dependencies.initEntries.map(name => [
                name,
                { name, isChecked: true },
            ]),
        ] as [string, MetaTypeShape][]

        this.emitMutation({
            entries: {
                $set: new Map(this.mergeExistingEntries(prevState, entries)),
            },
        })
    }

    private mergeExistingEntries(
        prevState: State,
        newEntries: [string, MetaTypeShape][],
    ): [string, MetaTypeShape][] {
        return newEntries.map(([name, result]) => {
            const currentEntry = prevState.entries.get(name)
            const isChecked =
                (currentEntry && currentEntry.isChecked) ||
                result.isChecked ||
                this.dependencies.initEntries.includes(name)

            return [name, { name, isChecked }]
        })
    }

    async suggestEntries({
        event: { text },
        previousState,
    }: IncomingUIEvent<State, Event, 'suggestEntries'>) {
        await executeUITask<State, 'loadState', void>(
            this,
            'loadState',
            async () => {
                this.emitMutation({ inputText: { $set: text } })

                if (this.suggestRunning) {
                    await this.suggestRunning
                    this.suggestRunning = undefined
                }

                this.suggestRunning = this.suggestNewEntries(
                    previousState,
                    text,
                )
            },
        )
    }

    async suggestNewEntries(prevState: State, text: string) {
        const { metaPicker } = this.dependencies.storage.modules
        const collection =
            this.dependencies.type === 'collections' ? 'customLists' : 'tags'

        const results = await metaPicker.suggest(this.dependencies.url, {
            collection,
            query: { name: text },
        })
        const entries = results.map(res => [res.name, res]) as [
            string,
            MetaTypeShape,
        ][]

        this.emitMutation({
            entries: {
                $set: new Map(this.mergeExistingEntries(prevState, entries)),
            },
        })
    }

    setEntries(
        incoming: IncomingUIEvent<State, Event, 'setEntries'>,
    ): UIMutation<State> {
        const entries = new Map<string, MetaTypeShape>()
        incoming.event.entries.forEach(entry => entries.set(entry.name, entry))

        return { entries: { $set: entries } }
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
