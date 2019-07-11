import { State } from './logic'
import { UICollection } from 'src/features/overview/types'

export const selected = (state: State): string => state.selectedCollection
export const collections = (state: State) => state.collections
export const collectionsList = (state: State): UICollection[] => [
    ...collections(state),
]
