import { VALID_TAG_PATTERN } from '@worldbrain/memex-common/lib/storage/constants'

import { MetaTypeShape } from 'src/features/meta-picker/types'
import { Props, State } from './logic'

export const entries = (state: State): Map<string, MetaTypeShape> =>
    state.entries
export const inputText = (state: State): string => state.inputText

export const pickerEntries = (state: State, props: Props): MetaTypeShape[] => {
    let mainEntries = [...entries(state).values()]
    const name = state.inputText

    // Pre-pend "Add new:" row if user input is something new and valid
    if (
        name.length &&
        !state.entries.has(name) &&
        !props.singleSelect &&
        VALID_TAG_PATTERN.test(name)
    ) {
        mainEntries = [{ canAdd: true, name, isChecked: false }, ...mainEntries]
    }

    return mainEntries
}
