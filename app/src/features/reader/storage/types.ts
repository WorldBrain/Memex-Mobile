import { ContentDirection } from 'src/services/readability/types'

export interface ReadablePageData {
    url: string
    content: string
    title: string
    length: number
    byline?: string
    dir: ContentDirection
    excerpt?: string
    createdWhen: Date
    lastEdited?: Date
    strategy: ReadabilityStrategy
}

export type ReadabilityStrategy = 'seanmcgary/readability'
