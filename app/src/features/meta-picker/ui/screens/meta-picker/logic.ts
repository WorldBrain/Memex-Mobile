import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from 'ui-logic-core'

import { MetaTypeShape } from 'src/features/meta-picker/types'

export interface State {
    inputText: string
    entries: Map<string, MetaTypeShape>
    isLoading: boolean
}

export type Event = UIEvent<{
    addEntry: { entry: MetaTypeShape }
    setEntries: { entries: MetaTypeShape[] }
    setIsLoading: { value: boolean }
    setInputText: { text: string }
    toggleEntryChecked: { name: string }
}>

export default class Logic extends UILogic<State, Event> {
    getInitialState(): State {
        return { isLoading: false, entries: new Map(), inputText: '' }
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

    setIsLoading(
        incoming: IncomingUIEvent<State, Event, 'setIsLoading'>,
    ): UIMutation<State> {
        return { isLoading: { $set: incoming.event.value } }
    }

    setInputText(
        incoming: IncomingUIEvent<State, Event, 'setInputText'>,
    ): UIMutation<State> {
        return { inputText: { $set: incoming.event.text } }
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
