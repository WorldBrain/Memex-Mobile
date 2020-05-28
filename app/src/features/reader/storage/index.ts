import {
    StorageModule,
    StorageModuleConfig,
    StorageModuleConstructorArgs,
} from '@worldbrain/storex-pattern-modules'
import {
    COLLECTION_DEFINITIONS,
    COLLECTION_NAMES,
} from '@worldbrain/memex-storage/lib/reader/constants'

export interface Props extends StorageModuleConstructorArgs {}

export class ReaderStorage extends StorageModule {
    static READER_COLL = COLLECTION_NAMES.readable

    getConfig = (): StorageModuleConfig => ({
        collections: { ...COLLECTION_DEFINITIONS },
    })
}
