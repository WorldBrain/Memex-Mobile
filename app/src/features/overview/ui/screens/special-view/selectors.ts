import { State } from './logic'
import { UIPage } from 'src/features/overview/types'

export const recentlySaved = (state: State) => state.pages
export const results = (state: State): UIPage[] => [
    ...recentlySaved(state).values(),
]
