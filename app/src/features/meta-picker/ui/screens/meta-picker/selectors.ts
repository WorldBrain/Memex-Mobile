import { MetaTypeShape } from 'src/features/meta-picker/types'
import { Props, State } from './logic'

export const entries = (state: State): Map<string, MetaTypeShape> =>
    state.entries
export const inputText = (state: State): string => state.inputText

export const pickerEntries = (state: State, props: Props): MetaTypeShape[] => {
    let mainEntries = [...entries(state).values()]

    // Pre-pend "Add new:" row if user input is something new
    if (
        state.inputText.length &&
        !state.entries.has(state.inputText) &&
        !props.singleSelect
    ) {
        mainEntries = [
            { canAdd: true, name: state.inputText, isChecked: false },
            ...mainEntries,
        ]
    }

    return mainEntries
}
