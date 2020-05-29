import { Readability, JSDOMParser } from 'readability-node'
import { XMLSerializer, DOMParser } from 'xmldom-silent'
import UrlParser from 'url-parse'

import { createHtmlStringFromTemplate } from './create-html-from-template'
import { inPageJS } from './in-page-js'
import { inPageCSS } from './in-page-css'
import {
    ReadabilityServiceAPI,
    ReadabilityArticle,
    ReadabilityURL,
} from './types'

/*
Implementation inspired by `react-native-webview-readability` package:
https://github.com/poptocrack/react-native-webview-readability
*/

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

    async fetchAndParse({ url }: { url: string }): Promise<ReadabilityArticle> {
        const urlDesc = this.deriveUrlDescriptor(url)
        const html = await this.fetchPageHtml(url)
        const xhtml = this.convertHtmlToXhtml(html)
        const doc = this.constructDocumentFromHtml(xhtml)

        return this.parseDocument(urlDesc, doc)
    }

    async fetchAndCleanHtml(args: { url: string }): Promise<string> {
        const article = await this.fetchAndParse(args)
        return this.applyHtmlTemplateToArticle({ article })
    }

    applyHtmlTemplateToArticle(args: {
        article: ReadabilityArticle
        js?: string
        css?: string
    }): string {
        return createHtmlStringFromTemplate({
            body: args.article.content,
            title: args.article.title,
            css: args.css ?? inPageCSS,
            js: args.js ?? inPageJS,
            ...args,
        })
    }
}
