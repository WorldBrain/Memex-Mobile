import { State } from './logic'
import { NotesSection } from './types'

export const sections = (state: State) => state.sections
export const results = (state: State): NotesSection[] =>
    [...sections(state).entries()].map(([title, pages]) => ({
        title,
        data: [...pages.values()].map(page => ({
            ...page,
            notes: [...page.notes.values()],
        })),
    }))
