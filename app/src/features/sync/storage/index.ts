import { ClientSyncLogStorage } from '@worldbrain/storex-sync/lib/client-sync-log'
import { StorageModuleConfig } from '@worldbrain/storex-pattern-modules'
import { mapCollectionVersions } from '@worldbrain/storex-pattern-modules/lib/utils'
import { STORAGE_VERSIONS } from '../../../storage/constants'

export class MemexClientSyncLogStorage extends ClientSyncLogStorage {
    getConfig(): StorageModuleConfig {
        const config = super.getConfig()
        config.collections = mapCollectionVersions({
            collectionDefinitions: config.collections!,
            mappings: [
                {
                    moduleVersion: new Date('2019-02-05'),
                    applicationVersion: STORAGE_VERSIONS[0].version,
                },
            ],
        })
        return config
    }
}
