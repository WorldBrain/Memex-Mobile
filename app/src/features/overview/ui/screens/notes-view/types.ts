import { UIPageWithNotes, UINote } from 'src/features/overview/types'

export interface Page extends Omit<UIPageWithNotes, 'notes'> {
    isOpen?: boolean
    notes: Map<string, UINote>
}

export interface NotesSection {
    title: string
    data: UIPageWithNotes[]
}

export type Pages = Map<string, Page>
export type ResultSections = Map<string, Pages>
