export interface ReadabilityServiceAPI {
    fetchAndCleanHtml(args: { url: string }): Promise<string>
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
