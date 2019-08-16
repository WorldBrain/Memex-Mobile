import { LocalStorageService } from '.'

class MemoryStorage {
    private mem: { [keyName: string]: string } = {}

    async getItem(key: string) {
        return this.mem[key]
    }

    async setItem(key: string, value: string) {
        this.mem[key] = value
    }
}

describe('local storage service tests', () => {
    function setup() {
        const storage = new LocalStorageService({
            storageAPI: new MemoryStorage() as any,
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
})
