import {
    StorageModule,
    StorageModuleConfig,
} from '@worldbrain/storex-pattern-modules'

export class OverviewStorage extends StorageModule {
    static PAGE_COLL = 'pages'
    static VISIT_COLL = 'visits'
    static BOOKMARK_COLL = 'bookmarks'

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
                    screenshot: { type: 'media' },
                    lang: { type: 'string' },
                    canonicalUrl: { type: 'url' },
                    description: { type: 'text' },
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
                    time: { type: 'timestamp' },
                    duration: { type: 'int' },
                    scrollMaxPerc: { type: 'float' },
                    scrollMaxPx: { type: 'float' },
                    scrollPerc: { type: 'float' },
                    scrollPx: { type: 'float' },
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
                    time: { type: 'timestamp' },
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
}
