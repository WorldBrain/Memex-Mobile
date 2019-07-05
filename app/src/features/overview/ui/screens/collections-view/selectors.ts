import { State } from './logic'
import { Collection } from 'src/features/overview/types'

export const selected = (state: State): string => state.selectedCollection
export const collections = (state: State) => state.collections
export const collectionsList = (state: State): Collection[] => [
    ...collections(state),
]
