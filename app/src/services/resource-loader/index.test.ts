import { ResourceLoaderService, Props } from '.'

describe('resource loader service tests', () => {
    function setup(args: Partial<Props> = {}) {
        const service = new ResourceLoaderService({
            externalFileLoadingFn: async file => 'test',
            requireFn: path => path,
            supportedFileExts: ['test'],
            ...args,
        })

        return { service }
    }

    it('should be able to detect unsupported file types', async () => {
        const { service } = setup({ supportedFileExts: ['txt'] })

        for (const path of ['test.js', 'test.ts', 'test.pl']) {
            expect(service.loadResource(path)).rejects.toThrowError()
        }
    })

    it('should be able to process supported file type', async () => {
        const identity = (f: any) => f
        const { service } = setup({
            supportedFileExts: ['txt'],
            requireFn: identity,
            externalFileLoadingFn: identity,
        })

        expect(await service.loadResource('test.txt')).toEqual('test.txt')
    })
})
