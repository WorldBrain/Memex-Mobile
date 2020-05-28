import { Readability, JSDOMParser } from 'readability-node'
import { XMLSerializer, DOMParser } from 'xmldom-silent'
import UrlParser from 'url-parse'

import {
    ReadabilityServiceAPI,
    ReadabilityArticle,
    ReadabilityURL,
} from './types'

/*
Implementation inspired by `react-native-webview-readability` package:
https://github.com/poptocrack/react-native-webview-readability
*/

const createCleanHtmlString = (args: {
    css?: string
    title: string
    body: string
}) => `
    <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            ${args.css ? `<style>${args.css}</style>` : ''}
        </head>
        <body>
            <h1>${args.title}</h1>
            ${args.body}
        </body>
    </html>
`

export interface Props {
    urlParser?: (url: string) => UrlParser
}

export class ReadabilityService implements ReadabilityServiceAPI {
    constructor(private props: Props) {
        props.urlParser =
            props.urlParser ?? ((url: string) => new UrlParser(url))
    }

    private deriveUrlDescriptor(url: string): ReadabilityURL {
        const parsed = this.props.urlParser!(url)

        if (!parsed?.host?.length) {
            throw new Error('Failed attempt to parse URL: ' + url)
        }

        return {
            spec: parsed.href,
            host: parsed.host,
            scheme: parsed.protocol.slice(0, -1),
            prePath: `${parsed.protocol}//${parsed.host}`,
            pathBase: `${parsed.protocol}//${
                parsed.host
            }${parsed.pathname.substring(
                0,
                parsed.pathname.lastIndexOf('/') + 1,
            )}`,
        }
    }

    private convertHtmlToXhtml(html: string): string {
        const xhtmlDocument = new DOMParser({
            errorHandler: (level: string, msg: string) => {
                if (level === 'error') {
                    throw new Error('Unable to convert HTML to XHTML: ' + msg)
                }
            },
        }).parseFromString(html, 'text/html')

        return new XMLSerializer().serializeToString(xhtmlDocument)
    }

    private constructDocumentFromHtml(html: string): Document {
        const domParser = new JSDOMParser()
        const doc = domParser.parse(html.trim())

        if (domParser.errorState) {
            throw new Error(
                'Failed attempt at constructing Document from HTML: ' +
                    domParser.errorState,
            )
        }

        return doc
    }

    private async fetchPageHtml(url: string): Promise<string> {
        const response = await fetch(url)
        return response.text()
    }

    private async parseDocument(
        urlParts: ReadabilityURL,
        doc: Document,
    ): Promise<ReadabilityArticle> {
        return new Readability(urlParts, doc).parse()
    }

    async fetchAndCleanHtml({ url }: { url: string }): Promise<string> {
        const urlDesc = this.deriveUrlDescriptor(url)
        const html = await this.fetchPageHtml(url)
        const xhtml = this.convertHtmlToXhtml(html)
        const doc = this.constructDocumentFromHtml(xhtml)
        const article = await this.parseDocument(urlDesc, doc)

        return createCleanHtmlString({
            body: article.content,
            title: article.title,
        })
    }
}
