import expect from 'expect'

import { makeStorageTestFactory } from 'src/index.tests'
import * as DATA from './index.test.data'
import { ReaderStorage } from '.'

// TODO: Remove this code
//  - it's only here because there's some issue with the sync test setup code expecting the readable objects not to be there
async function __cleanupTestData(
    reader: ReaderStorage,
    readables: DATA.WithoutTimestamps[],
) {
    for (const { url } of readables) {
        await reader.deleteReadablePage(url)
    }
}

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

        await __cleanupTestData(reader, readables)
    })

    it('should be able to determine whether a readable page archives exists for a page already', async ({
        storage: {
            modules: { reader },
        },
    }) => {
        const createdWhen = new Date()
        const readables = [DATA.READABLE_1, DATA.READABLE_2, DATA.READABLE_3]

        for (const data of readables) {
            expect(await reader.readablePageExists(data.url)).toBe(false)
            await reader.createReadablePage({ ...data, createdWhen })
            expect(await reader.readablePageExists(data.url)).toBe(true)
        }

        await __cleanupTestData(reader, readables)
    })

    it("should be able to createa new readable page archives, if they don't exist for a page already", async ({
        storage: {
            modules: { reader },
        },
    }) => {
        const readables = [DATA.READABLE_1, DATA.READABLE_2, DATA.READABLE_3]

        // Do first round of creations with timestamp A
        const createdWhenA = new Date()
        for (const data of readables) {
            await reader.createReadablePageIfNotExists({
                ...data,
                createdWhen: createdWhenA,
            })
        }

        for (const data of readables) {
            expect(await reader.getReadablePage(data.url)).toEqual({
                ...data,
                createdWhen: createdWhenA,
                lastEdited: createdWhenA,
            })
        }

        // Do second round of creations with timestamp B
        const createdWhenB = new Date()
        for (const data of readables) {
            await reader.createReadablePageIfNotExists({
                ...data,
                createdWhen: createdWhenB,
            })
        }

        // All DB entries should _still_ be at timestamp A
        for (const data of readables) {
            expect(await reader.getReadablePage(data.url)).toEqual({
                ...data,
                createdWhen: createdWhenA,
                lastEdited: createdWhenA,
            })
        }

        await __cleanupTestData(reader, readables)
    })
})
