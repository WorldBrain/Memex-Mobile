import {
    StorageModule,
    StorageModuleConfig,
    StorageModuleConstructorArgs,
} from '@worldbrain/storex-pattern-modules'
import {
    COLLECTION_DEFINITIONS,
    COLLECTION_NAMES,
} from '@worldbrain/memex-common/lib/storage/modules/reader/constants'
import type { URLNormalizer } from '@worldbrain/memex-common/lib/url-utils/normalize/types'

import { ReadablePageData } from './types'

export interface Props extends StorageModuleConstructorArgs {
    normalizeUrl: URLNormalizer
}

export class ReaderStorage extends StorageModule {
    static READER_COLL = COLLECTION_NAMES.readablePage

    constructor(private props: Props) {
        super(props)
    }

    getConfig = (): StorageModuleConfig => ({
        collections: { ...COLLECTION_DEFINITIONS },
        operations: {
            createReadable: {
                operation: 'createObject',
                collection: ReaderStorage.READER_COLL,
            },
            findReadableByUrl: {
                operation: 'findObject',
                collection: ReaderStorage.READER_COLL,
                args: {
                    url: '$url:string',
                },
            },
            deleteReadable: {
                operation: 'deleteObject',
                collection: ReaderStorage.READER_COLL,
                args: {
                    url: '$url:string',
                },
            },
        },
    })

    getReadablePage = async (url: string): Promise<ReadablePageData | null> => {
        const normalizedUrl = this.props.normalizeUrl(url)
        return this.operation('findReadableByUrl', { url: normalizedUrl })
    }

    readablePageExists = async (url: string): Promise<boolean> => {
        const existingPage = await this.getReadablePage(url)
        return !!existingPage
    }

    createReadablePage = async (data: ReadablePageData): Promise<void> => {
        const normalizedUrl = this.props.normalizeUrl(data.url)

        await this.operation('createReadable', {
            ...data,
            url: normalizedUrl,
            dir: data.dir ?? 'ltr',
            lastEdited: data.lastEdited ?? data.createdWhen,
        })
    }

    createReadablePageIfNotExists = async (
        data: ReadablePageData,
    ): Promise<void> => {
        const exists = await this.readablePageExists(data.url)

        if (!exists) {
            return this.createReadablePage(data)
        }
    }

    deleteReadablePage = async (url: string): Promise<void> => {
        return this.operation('deleteReadable', { url })
    }
}
