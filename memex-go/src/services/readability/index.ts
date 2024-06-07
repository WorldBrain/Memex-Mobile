import { Readability } from 'readability-node'
import UrlParser from 'url-parse'

import {
    ReadabilityServiceAPI,
    ReadabilityArticle,
    ReadabilityURL,
} from './types'
import { PageFetcherAPI } from '../page-fetcher/types'

/*
Implementation inspired by `react-native-webview-readability` package:
https://github.com/poptocrack/react-native-webview-readability
*/

export interface Props {
    urlParser?: (url: string) => UrlParser
    pageFetcher: PageFetcherAPI
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

    private async parseDocument(
        urlParts: ReadabilityURL,
        doc: Document,
    ): Promise<ReadabilityArticle> {
        return new Readability(urlParts, doc).parse()
    }

    async fetchAndParse({ url }: { url: string }): Promise<ReadabilityArticle> {
        const urlDesc = this.deriveUrlDescriptor(url)
        const doc = await this.props.pageFetcher.fetchPageDOM(url)

        return this.parseDocument(urlDesc, doc)
    }
}
