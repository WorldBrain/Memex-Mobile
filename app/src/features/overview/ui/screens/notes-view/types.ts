import { PageWithNotes, Note } from 'src/features/overview/types'

export interface Page extends Omit<PageWithNotes, 'notes'> {
    isOpen?: boolean
    notes: Map<string, Note>
}

export interface NotesSection {
    title: string
    data: PageWithNotes[]
}

export type Pages = Map<string, Page>
export type ResultSections = Map<string, Pages>
