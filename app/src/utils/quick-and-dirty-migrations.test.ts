import {
    runMigrations,
    Migrations,
    migrations,
} from './quick-and-dirty-migrations'
import { MockSettingsStorage } from 'src/features/settings/storage/mock-storage'
import { LocalStorageService } from 'src/services/local-storage'
import { makeStorageTestFactory } from 'src/index.tests'
import { createStorage, setStorageMiddleware } from 'src/storage'

describe('Quick and dirty migration setup tests', () => {
    const MIGRATION_A_NAME = 'test-a'
    const MIGRATION_B_NAME = 'test-b'

    const dummyMigrations: Migrations = {
        [MIGRATION_A_NAME]: async () => {},
        [MIGRATION_B_NAME]: async () => {},
    }

    function setupTest() {
        const localStorage = new LocalStorageService({
            settingsStorage: new MockSettingsStorage(),
        })

        return { localStorage }
    }

    it('should only run migrations once', async () => {
        const { localStorage } = setupTest()

        const deps = {
            services: { localStorage },
            storage: { manager: {} },
        } as any

        expect(await localStorage.get(MIGRATION_A_NAME)).toBeNull()
        expect(await localStorage.get(MIGRATION_B_NAME)).toBeNull()

        await runMigrations(deps, dummyMigrations)

        const valueA = await localStorage.get(MIGRATION_A_NAME)
        const valueB = await localStorage.get(MIGRATION_B_NAME)

        expect(valueA).toEqual(expect.any(Number))
        expect(valueB).toEqual(expect.any(Number))

        await runMigrations(deps, dummyMigrations)

        expect(await localStorage.get(MIGRATION_A_NAME)).toEqual(valueA)
        expect(await localStorage.get(MIGRATION_B_NAME)).toEqual(valueB)
    })
})

describe('Quick and dirty migrations tests', () => {
    let connIterator = 0

    async function setupTest() {
        const storage = await createStorage({
            typeORMConnectionOpts: {
                type: 'sqlite',
                database: ':memory:',
                name: `connection-${connIterator++}`,
            },
        })

        return { db: storage.manager }
    }

    const time = Date.now()
    const baseEntry = {
        collection: 'testColl',
        operation: 'create',
        deviceId: 'test',
        value: {},
    }

    const dummyEntries = [
        {
            ...baseEntry,
            createdOn: time - 1,
            needsIntegration: false,
            sharedOn: null,
            pk: 0,
        },
        {
            ...baseEntry,
            createdOn: time - 2,
            needsIntegration: false,
            sharedOn: 123,
            pk: 1,
        },
        {
            ...baseEntry,
            createdOn: time - 3,
            needsIntegration: true,
            sharedOn: null,
            pk: 2,
        },
        {
            ...baseEntry,
            createdOn: time - 4,
            needsIntegration: true,
            sharedOn: 999,
            pk: 3,
        },
    ]

    it('should be able to correctly set newly indexed sync fields', async () => {
        const { db } = await setupTest()

        for (const entry of dummyEntries) {
            await db.collection('clientSyncLogEntry').createObject(entry)
        }

        await migrations['fill-out-empty-sync-log-fields']({ db })

        expect(
            await db.collection('clientSyncLogEntry').findAllObjects({}),
        ).toEqual([
            {
                ...baseEntry,
                createdOn: time - 1,
                needsIntegration: 0,
                sharedOn: 0,
                pk: 0,
            },
            {
                ...baseEntry,
                createdOn: time - 2,
                needsIntegration: 0,
                sharedOn: 123,
                pk: 1,
            },
            {
                ...baseEntry,
                createdOn: time - 3,
                needsIntegration: 1,
                sharedOn: 0,
                pk: 2,
            },
            {
                ...baseEntry,
                createdOn: time - 4,
                needsIntegration: 1,
                sharedOn: 999,
                pk: 3,
            },
        ])
    })
})
