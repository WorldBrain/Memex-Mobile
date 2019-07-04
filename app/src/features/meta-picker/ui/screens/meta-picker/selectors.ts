import { MetaTypeShape } from 'src/features/meta-picker/types'
import { State } from './logic'

export const entries = (state: State): Map<string, MetaTypeShape> =>
    state.entries
export const inputText = (state: State): string => state.inputText

export const pickerEntries = (state: State): MetaTypeShape[] => [
    ...entries(state).values(),
]
