import expect from 'expect'

import { makeStorageTestFactory } from 'src/index.tests'
import * as DATA from './index.test.data'

const it = makeStorageTestFactory()

describe('reader StorageModule', () => {
    it('should be able to create new readable page archives', async ({
        storage: {
            modules: { reader },
        },
    }) => {
        const createdWhen = new Date()

        const readables = [DATA.READABLE_1, DATA.READABLE_2, DATA.READABLE_3]

        for (const data of readables) {
            await reader.createReadablePage({ ...data, createdWhen })
        }

        for (const data of readables) {
            expect(await reader.getReadablePage(data.url)).toEqual({
                ...data,
                createdWhen,
                lastEdited: createdWhen,
            })
        }
    })
})
