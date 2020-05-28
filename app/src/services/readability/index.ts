import { Readability, JSDOMParser } from 'readability-node'
import UrlParser from 'url-parse'

import { ReadabilityAPI, ReadabilityArticle, ReadabilityURL } from './types'

/*
Implementation inspired by `react-native-webview-readability` package:
https://github.com/poptocrack/react-native-webview-readability
*/

export interface Props {
    urlParser?: (url: string) => UrlParser
}

export class ReadabilityService implements ReadabilityAPI {
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

    private constructDocFromHtml(html: string): Document {
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

    private async parse(
        urlParts: ReadabilityURL,
        doc: Document,
    ): Promise<ReadabilityArticle> {
        return new Readability(urlParts, doc).parse()
    }

    async fetchAndParse({ url }: { url: string }): Promise<ReadabilityArticle> {
        const html = await this.fetchPageHtml(url)

        const doc = this.constructDocFromHtml(html)
        const urlDesc = this.deriveUrlDescriptor(url)

        return this.parse(urlDesc, doc)
    }
}
