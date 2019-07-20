import expect from 'expect'

import { makeStorageTestFactory } from 'src/index.tests'
import * as data from './index.test.data'
import * as pageData from 'src/features/overview/storage/index.test.data'

const it = makeStorageTestFactory()

describe('meta picker StorageModule', () => {
    it('should be able to create new tags', async ({
        storage: {
            modules: { metaPicker, overview },
        },
    }) => {
        const page = pageData.pages[0]
        await overview.createPage(page)

        for (const name of data.tags) {
            await metaPicker.createTag({ name, url: page.url })
        }

        const pageTags = await metaPicker.findTagsByPage({ url: page.url })
        expect(pageTags.map(tag => tag.name)).toEqual(
            expect.arrayContaining(data.tags),
        )

        for (const name of data.tags) {
            const tags = await metaPicker.findTagsByName({ name })
            expect(tags.length).toBe(1)
            expect(data.tags).toContain(tags[0].name)
        }
    })

    it('should be able to create new lists', async ({
        storage: {
            modules: { metaPicker },
        },
    }) => {
        for (const name of data.lists) {
            await metaPicker.createList({ name })
            const lists = await metaPicker.findListsByName({ name })
            expect(lists.length).toBe(1)
            expect(data.lists).toContain(lists[0].name)
        }
    })

    it('should be able to create page list entries', async ({
        storage: {
            modules: { metaPicker, overview },
        },
    }) => {
        const listIds: number[] = []

        for (const name of data.lists) {
            const { object } = await metaPicker.createList({ name })
            listIds.push(object.id)
        }

        expect(listIds.length).toBe(data.lists.length)

        // For each test page, create entries in all lists
        for (const page of pageData.pages) {
            await overview.createPage(page)

            for (const listId of listIds) {
                await metaPicker.createPageListEntry({
                    fullUrl: page.fullUrl,
                    pageUrl: page.url,
                    listId,
                })
            }
        }

        for (const listId of listIds) {
            const entries = await metaPicker.findPageListEntriesByList({
                listId,
            })
            expect(entries.map(e => e.pageUrl).sort()).toEqual(
                pageData.pages.map(p => p.url).sort(),
            )
        }

        for (const page of pageData.pages) {
            const entries = await metaPicker.findPageListEntriesByPage({
                url: page.url,
            })
            expect(entries.map(e => +e.listId).sort()).toEqual(listIds.sort())
        }
    })

    it('should be able to delete lists + associated entries', async ({
        storage: {
            modules: { metaPicker, overview },
        },
    }) => {
        const listIds: number[] = []

        for (const name of data.lists) {
            const { object } = await metaPicker.createList({ name })
            listIds.push(object.id)
        }

        expect(listIds.length).toBe(data.lists.length)

        // For each test page, create entries in all lists
        for (const page of pageData.pages) {
            await overview.createPage(page)

            for (const listId of listIds) {
                await metaPicker.createPageListEntry({
                    fullUrl: page.fullUrl,
                    pageUrl: page.url,
                    listId,
                })
            }
        }

        for (const listId of listIds) {
            await metaPicker.deleteList({ listId })
            expect(
                await metaPicker.findPageListEntriesByList({
                    listId,
                }),
            ).toEqual([])
        }

        for (const page of pageData.pages) {
            expect(
                await metaPicker.findPageListEntriesByPage({
                    url: page.url,
                }),
            ).toEqual([])
        }
    })

    it('should be able to delete page list entries', async ({
        storage: {
            modules: { overview, metaPicker },
        },
    }) => {
        const listIds: number[] = []

        for (const name of data.lists) {
            const { object } = await metaPicker.createList({ name })
            listIds.push(object.id)
        }

        expect(listIds.length).toBe(data.lists.length)

        // For each test page, create entries in all lists
        for (const page of pageData.pages) {
            await overview.createPage(page)

            for (const listId of listIds) {
                await metaPicker.createPageListEntry({
                    fullUrl: page.fullUrl,
                    pageUrl: page.url,
                    listId,
                })
            }
        }

        // Test single delete
        const entry = { listId: listIds[0], url: pageData.pages[0].url }
        const beforeEntries = await metaPicker.findPageListEntriesByList(entry)
        await metaPicker.deletePageEntryFromList(entry)
        const afterEntries = await metaPicker.findPageListEntriesByList(entry)
        expect(beforeEntries.length).toBe(afterEntries.length + 1)

        // Test delete by entire list
        for (const listId of listIds) {
            await metaPicker.deletePageListEntriesByList({ listId })
            expect(
                await metaPicker.findPageListEntriesByList({ listId }),
            ).toEqual([])
        }
    })

    it('should be able to delete tags', async ({
        storage: {
            modules: { metaPicker, overview },
        },
    }) => {
        const page = pageData.pages[0]
        await overview.createPage(page)

        for (const name of data.tags) {
            await metaPicker.createTag({ name, url: page.url })
        }

        const before = await metaPicker.findTagsByPage({ url: page.url })
        await metaPicker.deleteTag({ url: page.url, name: data.tags[0] })
        const after = await metaPicker.findTagsByPage({ url: page.url })
        expect(before.length).toBe(after.length + 1)
        expect(after).not.toContain(data.tags[0])

        metaPicker.deleteTagsByPage({ url: page.url })
        expect(await metaPicker.findTagsByPage({ url: page.url })).toEqual([])
    })
})
