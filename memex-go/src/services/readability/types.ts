export interface ReadabilityServiceAPI {
    fetchAndParse(args: { url: string }): Promise<ReadabilityArticle>
}

export interface ReadabilityArticle {
    uri: ReadabilityURL
    title: string
    byline: string
    dir: ContentDirection
    content: string
    length: number
    excerpt: string
}

export interface ReadabilityURL {
    spec: string
    host: string
    scheme: string
    prePath: string
    pathBase: string
}

export type ContentDirection = 'ltr' | 'rtl'
