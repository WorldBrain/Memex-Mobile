import { NativeSyntheticEvent, NativeTouchEvent } from 'react-native'

export type NativeTouchEventHandler = (
    ev: NativeSyntheticEvent<NativeTouchEvent>,
) => void
export type ResultType = 'pages' | 'notes'

export interface Collection {
    id: number
    name: string
}

export interface Page {
    url: string
    pageUrl: string
    titleText: string
    favIcon?: string
    date: string
}

export interface PageWithNotes extends Page {
    notes: Note[]
}

export interface Note {
    url: string
    noteText?: string
    commentText?: string
    date: string
}
