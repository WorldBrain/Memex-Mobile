import { JSDOMParser } from 'readability-node'
import { XMLSerializer, DOMParser } from 'xmldom-silent'

import { PageFetcherAPI, PageDocument } from './types'

export class PageFetcherService implements PageFetcherAPI {
    private xmlSerializer: XMLSerializer
    private xmlDomParser: DOMParser
    private jsDomParser: JSDOMParser

    constructor() {
        this.jsDomParser = new JSDOMParser()
        this.xmlSerializer = new XMLSerializer()
        this.xmlDomParser = new DOMParser({
            errorHandler: this.handleDOMParsingError,
        })
    }

    private handleDOMParsingError = (level: string, msg: string) => {
        if (level === 'error') {
            throw new Error('Unable to parse DOM from HTML string: ' + msg)
        }
    }

    private convertHtmlToXhtml(html: string): string {
        const xhtmlDocument = this.xmlDomParser.parseFromString(
            html,
            'text/html',
        )

        return this.xmlSerializer.serializeToString(xhtmlDocument)
    }

    private constructDocumentFromHtml(html: string): PageDocument {
        const doc = this.jsDomParser.parse(html.trim())

        if (this.jsDomParser.errorState) {
            throw new Error(
                'Failed attempt at constructing Document from HTML: ' +
                    this.jsDomParser.errorState,
            )
        }

        return doc
    }

    fetchPageHTML: PageFetcherAPI['fetchPageHTML'] = async (url) => {
        const response = await fetch(url)

        if (!response.ok) {
            throw new Error('fetch failed: ' + response.statusText)
        }

        return response.text()
    }

    fetchPageDOM: PageFetcherAPI['fetchPageDOM'] = async (url) => {
        const html = await this.fetchPageHTML(url)
        const xhtml = this.convertHtmlToXhtml(html)
        return this.constructDocumentFromHtml(xhtml)
    }
}
