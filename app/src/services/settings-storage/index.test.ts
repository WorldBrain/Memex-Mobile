import { StorageService } from '.'
import { MockSettingsStorage } from 'src/features/settings/storage/mock-storage'

describe('local storage service tests', () => {
    function setup() {
        const storage = new StorageService({
            settingsStorage: new MockSettingsStorage(),
        })
        return { storage }
    }

    it('should be able to store and retrieve string values', async () => {
        const { storage } = setup()

        const test = 'this is a test'

        expect(await storage.get('test')).toEqual(null)
        await storage.set('test', test)
        expect(await storage.get('test')).toEqual(test)
    })

    it('should be able to store and retrieve number values', async () => {
        const { storage } = setup()
        const test = 99

        expect(await storage.get('test')).toEqual(null)
        await storage.set('test', test)
        expect(await storage.get('test')).toBe(test)
    })

    it('should be able to store and retrieve boolean values', async () => {
        const { storage } = setup()
        const test = false

        expect(await storage.get('test')).toEqual(null)
        await storage.set('test', test)
        expect(await storage.get('test')).toBe(test)
    })

    it('should be able to store and retrieve object values', async () => {
        const { storage } = setup()

        const test = {
            testStr: 'this is a test',
            testNum: 99,
            testBool: false,
        }

        expect(await storage.get('test')).toEqual(null)
        await storage.set('test', test)
        expect(await storage.get('test')).toEqual(expect.objectContaining(test))
    })

    it('should be able to clear set values', async () => {
        const { storage } = setup()

        const test = 'this is a test'

        expect(await storage.get('test')).toEqual(null)
        await storage.set('test', test)
        expect(await storage.get('test')).toEqual(test)
        await storage.clear('test')
        expect(await storage.get('test')).toEqual(null)
    })
})
