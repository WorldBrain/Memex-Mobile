export interface PageFetcherAPI {
    fetchPageHTML(url: string): Promise<string>
    fetchPageDOM(url: string): Promise<Document>
}
