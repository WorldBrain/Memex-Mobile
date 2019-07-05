import { State } from './logic'
import { Page } from 'src/features/overview/types'

export const pages = (state: State) => state.pages
export const results = (state: State): Page[] => [...pages(state).values()]
