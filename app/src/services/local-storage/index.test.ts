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

        const testStr = 'this is a test'
        const testObj = { testStr }

        expect(await storage.get('testA')).toEqual(null)
        await storage.set('testA', testStr)
        expect(await storage.get('testA')).toEqual(testStr)

        expect(await storage.get('testB')).toEqual(null)
        await storage.set('testB', JSON.stringify(testObj))
        const testObjSerialized = await storage.get('testB')
        expect(typeof testObjSerialized).toEqual('string')
        expect(JSON.parse(testObjSerialized as string)).toEqual(
            expect.objectContaining(testObj),
        )
    })
})
