import { State } from './logic'
import { UIPage } from 'src/features/overview/types'

export const pages = (state: State) => state.pages
export const results = (state: State): UIPage[] => [...pages(state).values()]
