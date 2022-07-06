import { NativeSyntheticEvent, NativeTouchEvent } from 'react-native'

export type ResultType = 'special' | 'pages' | 'notes'

export interface UICollection {
    id: number
    name: string
}

export interface UIResult {
    domain: string
    url: string
    date: string
    isStarred?: boolean
    fullUrl: string
}

export interface UIPage extends UIResult {
    notes: UINote[]
    pageUrl: string
    domain: string
    fullUrl: string
    favIcon?: string
    titleText: string
    isResultPressed?: boolean
    tags: string[]
    listIds: number[]
    type: 'pdf-local' | 'pdf-remote' | 'page'
}

export interface UIPageWithNotes extends UIPage {
    notes: UINote[]
}

export interface UINote extends UIResult {
    noteText?: string
    isEdited?: boolean
    commentText?: string
    isNotePressed?: boolean
    tags: string[]
    listIds: number[]
}

export interface Page {
    url: string
    text: string
    lang?: string
    pageUrl: string
    domain: string
    fullUrl: string
    hostname: string
    fullTitle: string
    screenshot?: string
    description?: string
    canonicalUrl?: string
    isStarred?: boolean
    type: 'pdf-local' | 'pdf-remote' | 'page'
}

export interface Visit {
    url: string
    time: number
    duration?: number
    scrollMaxPerc?: number
    scrollMaxPx?: number
    scrollPerc?: number
    scrollPx?: number
}

export interface Bookmark {
    url: string
    time: number
}
