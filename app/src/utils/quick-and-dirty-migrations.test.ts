import { runMigrations, Migrations } from './quick-and-dirty-migrations'
import { MockSettingsStorage } from 'src/features/settings/storage/mock-storage'
import { LocalStorageService } from 'src/services/local-storage'

const MIGRATION_A_NAME = 'test-a'
const MIGRATION_B_NAME = 'test-b'

const migrations: Migrations = {
    [MIGRATION_A_NAME]: async () => {},
    [MIGRATION_B_NAME]: async () => {},
}

describe('Quick and dirty migration tests', () => {
    function setup() {
        const localStorage = new LocalStorageService({
            settingsStorage: new MockSettingsStorage(),
        })

        return { localStorage }
    }

    it('should only run migrations once', async () => {
        const { localStorage } = setup()

        const deps = {
            services: { localStorage },
            storage: { manager: {} },
        } as any

        expect(await localStorage.get(MIGRATION_A_NAME)).toBeNull()
        expect(await localStorage.get(MIGRATION_B_NAME)).toBeNull()

        await runMigrations(deps, migrations)

        const valueA = await localStorage.get(MIGRATION_A_NAME)
        const valueB = await localStorage.get(MIGRATION_B_NAME)

        expect(valueA).toEqual(expect.any(Number))
        expect(valueB).toEqual(expect.any(Number))

        await runMigrations(deps, migrations)

        expect(await localStorage.get(MIGRATION_A_NAME)).toEqual(valueA)
        expect(await localStorage.get(MIGRATION_B_NAME)).toEqual(valueB)
    })
})
