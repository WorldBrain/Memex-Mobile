export interface ReadabilityServiceAPI {
    fetchAndCleanHtml(args: { url: string }): Promise<string>
    fetchAndParse(args: { url: string }): Promise<ReadabilityArticle>
    applyHtmlTemplateToArticle(args: { article: ReadabilityArticle }): string
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
