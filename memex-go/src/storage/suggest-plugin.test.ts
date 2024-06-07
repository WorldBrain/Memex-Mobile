import StorageManager from '@worldbrain/storex'
import { TypeORMStorageBackend } from '@worldbrain/storex-backend-typeorm'

import { SuggestPlugin } from '@worldbrain/memex-common/lib/storage/modules/mobile-app/plugins/suggest'

let storageBackendsCreated = 0

const NAMES = [
    'Jon',
    'Vincent',
    'Oli',
    'Via',
    'Jocko',
    'Van',
    'Dog',
    'Mun',
    'James',
    'Edward',
]

async function setupTest() {
    const plugin = new SuggestPlugin()
    const backend = new TypeORMStorageBackend({
        connectionOptions: {
            type: 'sqlite',
            database: ':memory:',
            name: `connection-${++storageBackendsCreated}`,
        },
    })

    const storageManager = new StorageManager({ backend })
    storageManager.registry.registerCollection('people', {
        version: new Date(),
        fields: { name: { type: 'string' } },
        indices: [{ field: 'name' }],
    })
    await storageManager.finishInitialization()
    await storageManager.backend.migrate()
    plugin.install(backend)

    // Insert data
    for (const name of NAMES) {
        await plugin['backend'].createObject('people', { name })
    }

    return { plugin }
}

describe('suggest plugin tests', () => {
    it('should be able to suggest based on matches on the beginning of string indices', async () => {
        const { plugin } = await setupTest()

        const resultsA = await plugin.suggest({
            collection: 'people',
            query: { name: 'V' },
        })
        const resultsB = await plugin.suggest({
            collection: 'people',
            query: { name: 'Va' },
        })
        const resultsC = await plugin.suggest({
            collection: 'people',
            query: { name: 'Jo' },
        })

        expect(resultsA.map((result) => result.name)).toEqual([
            'Vincent',
            'Via',
            'Van',
        ])
        expect(resultsB.map((result) => result.name)).toEqual(['Van'])
        expect(resultsC.map((result) => result.name)).toEqual(['Jon', 'Jocko'])
    })
})
