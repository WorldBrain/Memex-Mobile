import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from 'ui-logic-core'

import { MetaTypeShape } from 'src/features/meta-picker/types'
import initState from './test-data'

export interface State {
    inputText: string
    entries: Map<string, MetaTypeShape>
}

export type Event = UIEvent<{
    setInputText: { text: string }
    toggleEntryChecked: { name: string }
}>

export default class Logic extends UILogic<State, Event> {
    getInitialState(): State {
        return initState()
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
                const oldEntry = state.get(name)
                return state.set(name, {
                    ...oldEntry,
                    isChecked: !oldEntry.isChecked,
                })
            },
        }
    }
}
