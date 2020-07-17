import StorageManager from '@worldbrain/storex'

import { UIDependencies } from 'src/ui/types'
import { ClientSyncLogEntry } from '@worldbrain/storex-sync/lib/client-sync-log/types'

export interface MigrationProps {
    db: StorageManager
}

export interface Migrations {
    [storageKey: string]: (props: MigrationProps) => Promise<void>
}

export const migrations: Migrations = {
    'remove-empty-url': async ({ db }) => {
        await db.collection('tags').deleteObjects({ url: '' })
        await db.collection('visits').deleteObjects({ url: '' })
        await db.collection('annotations').deleteObjects({ pageUrl: '' })
        await db.collection('pageListEntries').deleteObjects({ pageUrl: '' })
    },
    'fill-out-empty-sync-log-fields': async ({ db }) => {
        const limit = 100
        let iterations = 0
        let exhausted = false

        // Go through the collection in chunks of `limit`, updating each record in each chunk
        do {
            const entries: ClientSyncLogEntry[] = await db
                .collection('clientSyncLogEntry')
                .findObjects({}, { limit, skip: iterations * limit })

            for (const entry of entries) {
                await db.collection('clientSyncLogEntry').updateOneObject(
                    {
                        deviceId: entry.deviceId,
                        createdOn: entry.createdOn,
                    },
                    {
                        sharedOn: entry.sharedOn ?? 0,
                        needsIntegration: entry.needsIntegration ? 1 : 0,
                    },
                )
            }

            exhausted = entries.length < limit
            iterations++
        } while (!exhausted)
    },
}

export const runMigrations = async (
    { storage, services }: UIDependencies,
    toRun = migrations,
) => {
    for (const [storageKey, migration] of Object.entries(toRun)) {
        const value = await services.localStorage.get<number | undefined>(
            storageKey,
        )

        if (value) {
            continue
        }

        await migration({ db: storage.manager })
        await services.localStorage.set(storageKey, Date.now())
    }
}
