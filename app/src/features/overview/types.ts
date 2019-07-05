import { NativeSyntheticEvent, NativeTouchEvent } from 'react-native'

export type NativeTouchEventHandler = (
    ev: NativeSyntheticEvent<NativeTouchEvent>,
) => void
export type ResultType = 'pages' | 'notes'

export interface Collection {
    id: number
    name: string
}

export interface Result {
    url: string
    date: string
    isStarred?: boolean
}

export interface Page extends Result {
    pageUrl: string
    favIcon?: string
    titleText: string
}

export interface PageWithNotes extends Page {
    notes: Note[]
}

export interface Note extends Result {
    noteText?: string
    commentText?: string
}
