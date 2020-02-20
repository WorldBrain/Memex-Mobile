import StorageManager from '@worldbrain/storex'

import { UIDependencies } from 'src/ui/types'

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
