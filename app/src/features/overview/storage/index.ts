import {
    StorageModule,
    StorageModuleConfig,
} from '@worldbrain/storex-pattern-modules'

export class OverviewStorage extends StorageModule {
    static PAGE_COLL = 'pages'

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
        },
    })
}
