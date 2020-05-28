export interface ReadabilityServiceAPI {
    fetchAndCleanHtml(args: { url: string }): Promise<string>
    fetchAndParse(args: { url: string }): Promise<ReadabilityArticle>
}

export interface ReadabilityArticle {
    uri: ReadabilityURL
    title: string
    byline: string
    dir: string
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
