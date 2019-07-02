import { PageWithNotes } from "src/features/overview/types";

export interface Page extends PageWithNotes {
    isOpen?: boolean
}

export interface NotesSection {
    title: string
    data: Page[]
}
