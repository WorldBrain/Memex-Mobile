import {
    StorageModule,
    StorageModuleConfig,
    StorageModuleConstructorArgs,
} from '@worldbrain/storex-pattern-modules'
import {
    COLLECTION_DEFINITIONS,
    COLLECTION_NAMES,
} from '@worldbrain/memex-common/lib/storage/modules/followed-lists/constants'

export interface Props extends StorageModuleConstructorArgs {}

export class FollowedListStorage extends StorageModule {
    constructor(private deps: Props) {
        super(deps)
    }

    getConfig(): StorageModuleConfig {
        return {
            collections: COLLECTION_DEFINITIONS,
            operations: {},
        }
    }
}
