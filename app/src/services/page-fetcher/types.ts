export interface PageDocument extends Document {
    title: string
}

export interface PageFetcherAPI {
    fetchPageHTML(url: string): Promise<string>
    fetchPageDOM(url: string): Promise<PageDocument>
}
