import {
    StorageModule,
    StorageModuleConfig,
    StorageModuleConstructorArgs,
} from '@worldbrain/storex-pattern-modules'

import { Page, Visit } from '../types'
import { URLNormalizer } from 'src/utils/normalize-url/types'
import { URLPartsDeriver } from 'src/utils/derive-url-parts/types'

export interface Props extends StorageModuleConstructorArgs {
    normalizeUrls: URLNormalizer
    deriveUrlParts: URLPartsDeriver
}

export interface PageOpArgs {
    url: string
}

export class OverviewStorage extends StorageModule {
    static PAGE_COLL = 'pages'
    static VISIT_COLL = 'visits'
    static BOOKMARK_COLL = 'bookmarks'

    private normalizeUrl: URLNormalizer
    private deriveUrlParts: URLPartsDeriver

    constructor({ normalizeUrls, deriveUrlParts, ...args }: Props) {
        super(args)

        this.normalizeUrl = normalizeUrls
        this.deriveUrlParts = deriveUrlParts
    }

    getConfig = (): StorageModuleConfig => ({
        collections: {
            [OverviewStorage.PAGE_COLL]: {
                version: new Date('2019-07-09'),
                fields: {
                    url: { type: 'string' },
                    fullUrl: { type: 'text' },
                    fullTitle: { type: 'text' },
                    text: { type: 'text' },
                    domain: { type: 'string' },
                    hostname: { type: 'string' },
                    screenshot: { type: 'string', optional: true },
                    lang: { type: 'string', optional: true },
                    canonicalUrl: { type: 'url', optional: true },
                    description: { type: 'text', optional: true },
                },
                indices: [
                    { field: 'url', pk: true },
                    { field: 'text', fullTextIndexName: 'terms' },
                    { field: 'fullTitle', fullTextIndexName: 'titleTerms' },
                    { field: 'fullUrl', fullTextIndexName: 'urlTerms' },
                    { field: 'domain' },
                    { field: 'hostname' },
                ],
            },
            [OverviewStorage.VISIT_COLL]: {
                version: new Date('2019-07-09'),
                fields: {
                    url: { type: 'string' },
                    // TODO: This type differs from corresponding Memex ext type (not supported in react native)
                    time: { type: 'datetime' },
                    duration: { type: 'int', optional: true },
                    scrollMaxPerc: { type: 'float', optional: true },
                    scrollMaxPx: { type: 'float', optional: true },
                    scrollPerc: { type: 'float', optional: true },
                    scrollPx: { type: 'float', optional: true },
                },
                indices: [
                    { field: ['time', 'url'], pk: true },
                    { field: 'url' },
                ],
            },
            [OverviewStorage.BOOKMARK_COLL]: {
                version: new Date('2019-07-09'),
                fields: {
                    url: { type: 'string' },
                    // TODO: This type differs from corresponding Memex ext type (not supported in react native)
                    time: { type: 'datetime' },
                },
                indices: [{ field: 'url', pk: true }, { field: 'time' }],
            },
        },
        operations: {
            createPage: {
                operation: 'createObject',
                collection: OverviewStorage.PAGE_COLL,
            },
            deletePage: {
                operation: 'deleteObject',
                collection: OverviewStorage.PAGE_COLL,
                args: {
                    url: '$url:string',
                },
            },
            findPage: {
                operation: 'findObject',
                collection: OverviewStorage.PAGE_COLL,
                args: {
                    url: '$url:string',
                },
            },
            findBookmark: {
                operation: 'findObject',
                collection: OverviewStorage.BOOKMARK_COLL,
                args: {
                    url: '$url:string',
                },
            },
            starPage: {
                operation: 'createObject',
                collection: OverviewStorage.BOOKMARK_COLL,
            },
            unstarPage: {
                operation: 'deleteObject',
                collection: OverviewStorage.BOOKMARK_COLL,
                args: {
                    url: '$url:string',
                },
            },
            createVisit: {
                operation: 'createObject',
                collection: OverviewStorage.VISIT_COLL,
            },
            findVisitsForPage: {
                operation: 'findObjects',
                collection: OverviewStorage.VISIT_COLL,
                args: {
                    url: '$url:string',
                },
            },
            deleteVisitsForPage: {
                operation: 'deleteObjects',
                collection: OverviewStorage.VISIT_COLL,
                args: {
                    url: '$url:string',
                },
            },
        },
    })

    async findPage({ url }: PageOpArgs): Promise<Page | null> {
        const page = await this.operation('findPage', { url })
        if (!page) {
            return null
        }
        const isStarred = await this.operation('findBookmark', { url })
        return { ...page, isStarred: !!isStarred }
    }

    createPage(inputPage: Omit<Page, 'domain' | 'hostname'>) {
        const { domain, hostname } = this.deriveUrlParts(inputPage.url)

        const page: Page = {
            ...inputPage,
            url: this.normalizeUrl(inputPage.url),
            domain,
            hostname,
        }

        return this.operation('createPage', page)
    }

    async deletePage({ url }: PageOpArgs): Promise<void> {
        // TODO: can we do this in a transaction?
        await this.operation('deleteVisitsForPage', { url })
        await this.operation('unstarPage', { url })
        await this.operation('deletePage', { url })
    }
    starPage({ url, time = Date.now() }: PageOpArgs & { time?: number }) {
        return this.operation('starPage', { url, time })
    }

    unstarPage({ url }: PageOpArgs) {
        return this.operation('unstarPage', { url })
    }

    visitPage({ url, time = Date.now() }: PageOpArgs & { time?: number }) {
        return this.operation('createVisit', { url, time })
    }

    findPageVisits({ url }: PageOpArgs): Promise<Visit[]> {
        return this.operation('findVisitsForPage', { url })
    }
}
