import {
    StorageModule,
    StorageModuleConfig,
} from '@worldbrain/storex-pattern-modules'

export class OverviewStorage extends StorageModule {
    static PAGE_COLL = 'page'

    getConfig = (): StorageModuleConfig => ({
        collections: {
            [OverviewStorage.PAGE_COLL]: {
                version: new Date('2019-07-09'),
                fields: {},
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
