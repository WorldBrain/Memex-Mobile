import expect from 'expect'

import { storageKeys } from '../../../../app.json'
import { makeStorageTestFactory } from 'src/index.tests'
import * as data from './index.test.data'
import * as pageData from 'src/features/overview/storage/index.test.data'
import { notes as noteData } from 'src/features/page-editor/storage/index.test.data'
import {
    SPECIAL_LIST_NAMES,
    SPECIAL_LIST_IDS,
} from '@worldbrain/memex-common/lib/storage/modules/lists/constants'

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
        expect(pageTags.map((tag) => tag.name)).toEqual(
            expect.arrayContaining(data.tags),
        )

        for (const name of data.tags) {
            const tags = await metaPicker.findTagsByName({ name })
            expect(tags.length).toBe(1)
            expect(data.tags).toContain(tags[0].name)
        }
    })

    it('should be able to create new lists, adding them to the suggestions cache', async ({
        storage: {
            modules: { metaPicker, localSettings },
        },
    }) => {
        expect(
            await localSettings.getSetting({
                key: storageKeys.spaceSuggestionsCache,
            }),
        ).toEqual(null)

        let listIds: number[] = []
        for (const name of data.lists) {
            const { object } = await metaPicker.createList({ name })
            listIds.push(object.id)
        }

        expect(
            await localSettings.getSetting({
                key: storageKeys.spaceSuggestionsCache,
            }),
        ).toEqual([...listIds].reverse())

        const lists = await metaPicker.findListsByNames({ names: data.lists })
        expect(lists.length).toBe(data.lists.length)
        expect(lists.map((l) => l.name)).toEqual(
            expect.arrayContaining(data.lists),
        )
    })

    it(
        'should be able to create page list entries, adding the lists to the suggestions cache',
        { skipSyncTests: true },
        async ({
            storage: {
                modules: { metaPicker, overview, localSettings },
            },
        }) => {
            const listIds: number[] = []

            expect(
                await localSettings.getSetting({
                    key: storageKeys.spaceSuggestionsCache,
                }),
            ).toEqual(null)

            for (const name of data.lists) {
                const { object } = await metaPicker.createList({ name })
                listIds.push(object.id)
            }

            expect(
                await localSettings.getSetting({
                    key: storageKeys.spaceSuggestionsCache,
                }),
            ).toEqual([...listIds].reverse())

            expect(listIds.length).toBe(data.lists.length)

            // For each test page, create entries in all lists
            for (const page of pageData.pages) {
                await overview.createPage(page)

                for (const listId of [...listIds].reverse()) {
                    await metaPicker.createPageListEntry({
                        fullPageUrl: page.fullUrl,
                        listId,
                    })
                }

                // Also pages to the special lists, to assert they don't get added to the cache
                await metaPicker.createPageListEntry({
                    fullPageUrl: page.fullUrl,
                    listId: SPECIAL_LIST_IDS.INBOX,
                })
                await metaPicker.createPageListEntry({
                    fullPageUrl: page.fullUrl,
                    listId: SPECIAL_LIST_IDS.MOBILE,
                })
            }

            expect(
                await localSettings.getSetting({
                    key: storageKeys.spaceSuggestionsCache,
                }),
            ).toEqual(listIds)

            for (const listId of listIds) {
                const entries = await metaPicker.findPageListEntriesByList({
                    listId,
                })
                expect(entries.map((e) => e.pageUrl).sort()).toEqual(
                    pageData.pages.map((p) => p.url).sort(),
                )
            }

            for (const page of pageData.pages) {
                const entries = await metaPicker.findPageListEntriesByPage({
                    url: page.url,
                })
                expect(entries.map((e) => +e.listId).sort()).toEqual([
                    ...listIds.sort(),
                    SPECIAL_LIST_IDS.INBOX,
                    SPECIAL_LIST_IDS.MOBILE,
                ])
            }
        },
    )

    it(
        'should be able to create annotation list entries, adding the lists to the suggestions cache',
        { skipSyncTests: true },
        async ({
            storage: {
                modules: { metaPicker, pageEditor, localSettings },
            },
        }) => {
            const listIds: number[] = []

            expect(
                await localSettings.getSetting({
                    key: storageKeys.spaceSuggestionsCache,
                }),
            ).toEqual(null)

            for (const name of data.lists) {
                const { object } = await metaPicker.createList({ name })
                listIds.push(object.id)
            }

            expect(
                await localSettings.getSetting({
                    key: storageKeys.spaceSuggestionsCache,
                }),
            ).toEqual([...listIds].reverse())

            expect(listIds.length).toBe(data.lists.length)

            // For each test page, create entries in all lists
            for (const note of noteData) {
                await pageEditor.createNote(note)

                for (const listId of [...listIds].reverse()) {
                    await metaPicker.createAnnotListEntry({
                        annotationUrl: note.url,
                        listId,
                    })
                }
            }

            expect(
                await localSettings.getSetting({
                    key: storageKeys.spaceSuggestionsCache,
                }),
            ).toEqual(listIds)

            for (const listId of listIds) {
                const entries = await metaPicker.findAnnotListEntriesByList({
                    listId,
                })
                expect(entries.map((e) => e.url).sort()).toEqual(
                    noteData.map((p) => p.url).sort(),
                )
            }

            for (const note of noteData) {
                const entries = await metaPicker.findAnnotListEntriesByAnnot({
                    annotationUrl: note.url,
                })
                expect(entries.map((e) => +e.listId).sort()).toEqual(
                    listIds.sort(),
                )
            }
        },
    )

    it('should be able to delete lists + associated entries', async ({
        storage: {
            modules: { metaPicker, overview, pageEditor, localSettings },
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
                    fullPageUrl: page.fullUrl,
                    listId,
                })
            }
        }

        // For each test page, create entries in all lists
        for (const note of noteData) {
            await pageEditor.createNote(note)

            for (const listId of listIds) {
                await metaPicker.createAnnotListEntry({
                    annotationUrl: note.url,
                    listId,
                })
            }
        }

        expect(await metaPicker.findListsByIds({ ids: listIds })).toEqual(
            listIds.map((id, i) =>
                expect.objectContaining({ id, name: data.lists[i] }),
            ),
        )

        for (const listId of listIds) {
            expect(
                await metaPicker.findPageListEntriesByList({
                    listId,
                }),
            ).toEqual(
                expect.arrayContaining(
                    pageData.pages.map((p) =>
                        expect.objectContaining({ listId, pageUrl: p.url }),
                    ),
                ),
            )
            expect(
                await metaPicker.findAnnotListEntriesByList({
                    listId,
                }),
            ).toEqual(
                expect.arrayContaining(
                    noteData.map((a) =>
                        expect.objectContaining({ listId, url: a.url }),
                    ),
                ),
            )
        }

        expect(
            await localSettings.getSetting({
                key: storageKeys.spaceSuggestionsCache,
            }),
        ).toEqual([...listIds].reverse())

        for (const listId of listIds) {
            await metaPicker.deleteList({ listId })
        }

        expect(await metaPicker.findListsByIds({ ids: listIds })).toEqual([])

        for (const listId of listIds) {
            expect(
                await metaPicker.findPageListEntriesByList({
                    listId,
                }),
            ).toEqual([])
            expect(
                await metaPicker.findAnnotListEntriesByList({
                    listId,
                }),
            ).toEqual([])
        }

        expect(
            await localSettings.getSetting({
                key: storageKeys.spaceSuggestionsCache,
            }),
        ).toEqual([])
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
                    fullPageUrl: page.fullUrl,
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

    it('should be able to delete annot list entries', async ({
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
                    fullPageUrl: page.fullUrl,
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

        await metaPicker.deleteTagsByPage({ url: page.url })
        expect(await metaPicker.findTagsByPage({ url: page.url })).toEqual([])
    })

    it('should be able to get tag suggestions', async ({
        storage: {
            modules: { metaPicker, overview },
        },
    }) => {
        await overview.createPage(pageData.pages[0])
        await overview.createPage(pageData.pages[1])

        await metaPicker.createTag({
            name: data.tags[0],
            url: pageData.pages[0].url,
        })
        await metaPicker.createTag({
            name: data.tags[1],
            url: pageData.pages[0].url,
        })
        await metaPicker.createTag({
            name: data.tags[2],
            url: pageData.pages[1].url,
        })
        await metaPicker.createTag({
            name: data.tags[3],
            url: pageData.pages[1].url,
        })

        const tagSuggestions = await metaPicker.findTagSuggestions({
            url: pageData.pages[0].url,
        })
        expect(tagSuggestions.length).toBe(4)
        expect(tagSuggestions.map((s) => s.name)).toEqual(
            expect.arrayContaining(data.tags),
        )
        expect(
            tagSuggestions.filter((s) => s.isChecked).map((s) => s.name),
        ).toEqual(expect.arrayContaining([data.tags[0], data.tags[1]]))
        expect(
            tagSuggestions.filter((s) => !s.isChecked).map((s) => s.name),
        ).toEqual(expect.arrayContaining([data.tags[2], data.tags[3]]))
    })

    it('should be able to get most recently added pages from a list', async ({
        storage: {
            modules: { metaPicker, overview },
        },
    }) => {
        await overview.createPage(pageData.pages[0])
        await overview.createPage(pageData.pages[1])
        await overview.createPage(pageData.pages[2])

        const listIds: number[] = []

        for (const name of data.lists) {
            const { object } = await metaPicker.createList({ name })
            listIds.push(object.id)
        }

        expect(listIds.length).toBe(data.lists.length)

        for (const idx of [2, 0, 1]) {
            await metaPicker.createPageListEntry({
                fullPageUrl: pageData.pages[idx].fullUrl,
                listId: listIds[0],
            })
        }

        expect(
            await metaPicker.findRecentListEntries(listIds[0], {
                skip: 0,
                limit: 1,
            }),
        ).toEqual([expect.objectContaining({ pageUrl: pageData.pages[1].url })])
        expect(
            await metaPicker.findRecentListEntries(listIds[0], {
                skip: 1,
                limit: 1,
            }),
        ).toEqual([expect.objectContaining({ pageUrl: pageData.pages[0].url })])
        expect(
            await metaPicker.findRecentListEntries(listIds[0], {
                skip: 1,
                limit: 2,
            }),
        ).toEqual([
            expect.objectContaining({ pageUrl: pageData.pages[0].url }),
            expect.objectContaining({ pageUrl: pageData.pages[2].url }),
        ])
    })

    it('should be able to get list suggestions', async ({
        storage: {
            modules: { metaPicker, overview },
        },
    }) => {
        await overview.createPage(pageData.pages[0])
        await overview.createPage(pageData.pages[1])

        const listIds: number[] = []

        for (const name of data.lists) {
            const { object } = await metaPicker.createList({ name })
            listIds.push(object.id)
        }

        expect(listIds.length).toBe(data.lists.length)

        await metaPicker.createPageListEntry({
            fullPageUrl: pageData.pages[0].fullUrl,
            listId: listIds[0],
        })
        await metaPicker.createPageListEntry({
            fullPageUrl: pageData.pages[0].fullUrl,
            listId: listIds[1],
        })
        await metaPicker.createPageListEntry({
            fullPageUrl: pageData.pages[1].fullUrl,
            listId: listIds[2],
        })
        await metaPicker.createPageListEntry({
            fullPageUrl: pageData.pages[1].fullUrl,
            listId: listIds[3],
        })

        const listSuggestions = await metaPicker.findListSuggestions({})
        expect(listSuggestions.length).toBe(4)
        expect(listSuggestions.map((s) => s.name)).toEqual(
            expect.arrayContaining(data.lists),
        )
    })

    it('should be able to get list suggestions, setting cache if empty', async ({
        storage: {
            modules: { metaPicker, overview, localSettings },
        },
    }) => {
        await overview.createPage(pageData.pages[0])
        await overview.createPage(pageData.pages[1])
        await metaPicker.createInboxListIfAbsent({})
        await metaPicker.createMobileListIfAbsent({})

        const listIds: number[] = []

        for (const name of data.lists) {
            const { object } = await metaPicker.createList({ name })
            listIds.push(object.id)
        }

        expect(listIds.length).toBe(data.lists.length)

        await metaPicker.createPageListEntry({
            fullPageUrl: pageData.pages[0].fullUrl,
            listId: listIds[0],
        })
        await metaPicker.createPageListEntry({
            fullPageUrl: pageData.pages[0].fullUrl,
            listId: listIds[1],
        })
        await metaPicker.createPageListEntry({
            fullPageUrl: pageData.pages[1].fullUrl,
            listId: listIds[2],
        })
        await metaPicker.createPageListEntry({
            fullPageUrl: pageData.pages[1].fullUrl,
            listId: listIds[3],
        })

        await localSettings.clearSetting({
            key: storageKeys.spaceSuggestionsCache,
        })

        expect(
            await localSettings.getSetting({
                key: storageKeys.spaceSuggestionsCache,
            }),
        ).toEqual(null)

        const listSuggestions = await metaPicker.findListSuggestions({})

        expect(listSuggestions.length).toBe(4)
        expect(listSuggestions.map((s) => s.name)).toEqual(
            expect.arrayContaining(data.lists),
        )
        expect(
            await localSettings.getSetting({
                key: storageKeys.spaceSuggestionsCache,
            }),
        ).toEqual(listSuggestions.map((s) => s.id))
    })

    it('should be able to set a page to only given tags (delete existing, add missing)', async ({
        storage: {
            modules: { metaPicker, overview },
        },
    }) => {
        await overview.createPage(pageData.pages[0])

        await metaPicker.createTag({
            name: data.tags[0],
            url: pageData.pages[0].url,
        })
        await metaPicker.createTag({
            name: data.tags[1],
            url: pageData.pages[0].url,
        })

        const pageTagsBefore = await metaPicker.findTagsByPage({
            url: pageData.pages[0].url,
        })
        expect(pageTagsBefore.map((t) => t.name)).toEqual(
            expect.arrayContaining([data.tags[0], data.tags[1]]),
        )

        await metaPicker.setPageTags({
            tags: [data.tags[1], data.tags[2]],
            url: pageData.pages[0].url,
        })

        // Original added tags should now be different
        const pageTagsAfter = await metaPicker.findTagsByPage({
            url: pageData.pages[0].url,
        })
        expect(pageTagsAfter.map((t) => t.name)).not.toEqual(
            expect.arrayContaining([data.tags[0], data.tags[1]]),
        )
        expect(pageTagsAfter.map((t) => t.name)).toEqual(
            expect.arrayContaining([data.tags[1], data.tags[2]]),
        )
    })

    it('should be able to set a page to only given lists (delete existing, add missing)', async ({
        storage: {
            modules: { metaPicker, overview },
        },
    }) => {
        await overview.createPage(pageData.pages[0])

        const listIds: number[] = []

        for (const name of data.lists) {
            const { object } = await metaPicker.createList({ name })
            listIds.push(object.id)
        }

        expect(listIds.length).toBe(data.lists.length)

        await metaPicker.createPageListEntry({
            fullPageUrl: pageData.pages[0].fullUrl,
            listId: listIds[0],
        })
        await metaPicker.createPageListEntry({
            fullPageUrl: pageData.pages[0].fullUrl,
            listId: listIds[1],
        })

        const pageEntriesBefore = await metaPicker.findPageListEntriesByPage({
            url: pageData.pages[0].url,
        })
        expect(pageEntriesBefore.map((e) => e.listId)).toEqual(
            expect.arrayContaining([listIds[0], listIds[1]]),
        )

        await metaPicker.setPageLists({
            listIds: [listIds[1], listIds[2]],
            fullPageUrl: pageData.pages[0].fullUrl,
        })

        const pageEntriesAfter = await metaPicker.findPageListEntriesByPage({
            url: pageData.pages[0].url,
        })
        expect(pageEntriesAfter.map((e) => e.listId)).not.toEqual(
            expect.arrayContaining([listIds[0], listIds[1]]),
        )
        expect(pageEntriesAfter.map((e) => e.listId)).toEqual(
            expect.arrayContaining([listIds[1], listIds[2]]),
        )
    })

    it('should be able to set an annotation to only given lists (delete existing, add missing)', async ({
        storage: {
            modules: { metaPicker, overview, pageEditor },
        },
    }) => {
        await overview.createPage(pageData.pages[0])
        await pageEditor.createNote(noteData[0])

        const listIds: number[] = []

        for (const name of data.lists) {
            const { object } = await metaPicker.createList({ name })
            listIds.push(object.id)
        }

        expect(listIds.length).toBe(data.lists.length)

        await metaPicker.createAnnotListEntry({
            annotationUrl: noteData[0].url,
            listId: listIds[0],
        })
        await metaPicker.createAnnotListEntry({
            annotationUrl: noteData[0].url,
            listId: listIds[1],
        })

        const annotEntriesBefore = await metaPicker.findAnnotListEntriesByAnnot(
            {
                annotationUrl: noteData[0].url,
            },
        )
        expect(annotEntriesBefore.map((e) => e.listId)).toEqual(
            expect.arrayContaining([listIds[0], listIds[1]]),
        )

        await metaPicker.setAnnotationLists({
            listIds: [listIds[1], listIds[2]],
            annotationUrl: noteData[0].url,
        })

        const annotEntriesAfter = await metaPicker.findAnnotListEntriesByAnnot({
            annotationUrl: noteData[0].url,
        })
        expect(annotEntriesAfter.map((e) => e.listId)).not.toEqual(
            expect.arrayContaining([listIds[0], listIds[1]]),
        )
        expect(annotEntriesAfter.map((e) => e.listId)).toEqual(
            expect.arrayContaining([listIds[1], listIds[2]]),
        )
    })

    it('should be able to add Inbox list entries', async ({
        storage: {
            manager,
            modules: { metaPicker, overview },
        },
    }) => {
        await overview.createPage(pageData.pages[0])
        await overview.createPage(pageData.pages[1])

        expect(
            await manager.collection('customLists').findAllObjects({}),
        ).toEqual([])
        expect(
            await manager.collection('pageListEntries').findAllObjects({}),
        ).toEqual([])

        await metaPicker.createInboxListEntry({
            fullPageUrl: pageData.pages[0].fullUrl,
        })

        expect(
            await manager.collection('customLists').findAllObjects({}),
        ).toEqual([
            expect.objectContaining({
                id: SPECIAL_LIST_IDS.INBOX,
                name: SPECIAL_LIST_NAMES.INBOX,
            }),
        ])
        expect(
            await manager.collection('pageListEntries').findAllObjects({}),
        ).toEqual([
            expect.objectContaining({
                fullUrl: pageData.pages[0].fullUrl,
                pageUrl: pageData.pages[0].url,
                listId: SPECIAL_LIST_IDS.INBOX,
            }),
        ])

        await metaPicker.createInboxListEntry({
            fullPageUrl: pageData.pages[1].fullUrl,
        })

        expect(
            await manager.collection('customLists').findAllObjects({}),
        ).toEqual([
            expect.objectContaining({
                id: SPECIAL_LIST_IDS.INBOX,
                name: SPECIAL_LIST_NAMES.INBOX,
            }),
        ])
        expect(
            await manager.collection('pageListEntries').findAllObjects({}),
        ).toEqual([
            expect.objectContaining({
                fullUrl: pageData.pages[0].fullUrl,
                pageUrl: pageData.pages[0].url,
                listId: SPECIAL_LIST_IDS.INBOX,
            }),
            expect.objectContaining({
                fullUrl: pageData.pages[1].fullUrl,
                pageUrl: pageData.pages[1].url,
                listId: SPECIAL_LIST_IDS.INBOX,
            }),
        ])
    })

    it('should be able to add Mobile list entries', async ({
        storage: {
            manager,
            modules: { metaPicker, overview },
        },
    }) => {
        await overview.createPage(pageData.pages[0])
        await overview.createPage(pageData.pages[1])

        expect(
            await manager.collection('customLists').findAllObjects({}),
        ).toEqual([])
        expect(
            await manager.collection('pageListEntries').findAllObjects({}),
        ).toEqual([])

        await metaPicker.createMobileListEntry({
            fullPageUrl: pageData.pages[0].fullUrl,
        })

        expect(
            await manager.collection('customLists').findAllObjects({}),
        ).toEqual([
            expect.objectContaining({
                id: SPECIAL_LIST_IDS.MOBILE,
                name: SPECIAL_LIST_NAMES.MOBILE,
            }),
        ])
        expect(
            await manager.collection('pageListEntries').findAllObjects({}),
        ).toEqual([
            expect.objectContaining({
                fullUrl: pageData.pages[0].fullUrl,
                pageUrl: pageData.pages[0].url,
            }),
        ])

        await metaPicker.createMobileListEntry({
            fullPageUrl: pageData.pages[1].fullUrl,
        })

        expect(
            await manager.collection('customLists').findAllObjects({}),
        ).toEqual([
            expect.objectContaining({
                id: SPECIAL_LIST_IDS.MOBILE,
                name: SPECIAL_LIST_NAMES.MOBILE,
            }),
        ])
        expect(
            await manager.collection('pageListEntries').findAllObjects({}),
        ).toEqual([
            expect.objectContaining({
                fullUrl: pageData.pages[0].fullUrl,
                pageUrl: pageData.pages[0].url,
            }),
            expect.objectContaining({
                fullUrl: pageData.pages[1].fullUrl,
                pageUrl: pageData.pages[1].url,
            }),
        ])
    })

    it('should migrate dynamic mobile list to static list upon first discovery on adding a new page entry', async ({
        storage: {
            manager,
            modules: { metaPicker, overview },
        },
    }) => {
        await overview.createPage(pageData.pages[0])
        await overview.createPage(pageData.pages[1])
        await overview.createPage(pageData.pages[2])

        const dynamicId = 1234
        await metaPicker.operation('createList', {
            id: dynamicId,
            name: SPECIAL_LIST_NAMES.MOBILE,
            searchableName: SPECIAL_LIST_NAMES.MOBILE,
            isDeletable: false,
            isNestable: false,
            createdAt: new Date(),
        })

        for (const page of [pageData.pages[0], pageData.pages[1]]) {
            await metaPicker.operation('createListEntry', {
                listId: dynamicId,
                createdAt: new Date(),
                pageUrl: page.url,
                fullUrl: page.fullUrl,
            })
        }

        expect(
            await manager.collection('customLists').findAllObjects({}),
        ).toEqual([
            expect.objectContaining({
                id: dynamicId,
                name: SPECIAL_LIST_NAMES.MOBILE,
            }),
        ])
        expect(
            await manager.collection('pageListEntries').findAllObjects({}),
        ).toEqual([
            expect.objectContaining({
                listId: dynamicId,
                pageUrl: pageData.pages[0].url,
            }),
            expect.objectContaining({
                listId: dynamicId,
                pageUrl: pageData.pages[1].url,
            }),
        ])

        await metaPicker.createMobileListEntry({
            fullPageUrl: pageData.pages[2].fullUrl,
        })

        expect(
            await manager.collection('customLists').findAllObjects({}),
        ).toEqual([
            expect.objectContaining({
                id: SPECIAL_LIST_IDS.MOBILE,
                name: SPECIAL_LIST_NAMES.MOBILE,
            }),
        ])
        expect(
            await manager.collection('pageListEntries').findAllObjects({}),
        ).toEqual([
            expect.objectContaining({
                listId: SPECIAL_LIST_IDS.MOBILE,
                pageUrl: pageData.pages[0].url,
            }),
            expect.objectContaining({
                listId: SPECIAL_LIST_IDS.MOBILE,
                pageUrl: pageData.pages[1].url,
            }),
            expect.objectContaining({
                listId: SPECIAL_LIST_IDS.MOBILE,
                pageUrl: pageData.pages[2].url,
            }),
        ])

        await metaPicker.createMobileListEntry({
            fullPageUrl: pageData.pages[2].fullUrl,
        })

        // These are the same checks as above
        expect(
            await manager.collection('customLists').findAllObjects({}),
        ).toEqual([
            expect.objectContaining({
                id: SPECIAL_LIST_IDS.MOBILE,
                name: SPECIAL_LIST_NAMES.MOBILE,
            }),
        ])
        expect(
            await manager.collection('pageListEntries').findAllObjects({}),
        ).toEqual([
            expect.objectContaining({
                listId: SPECIAL_LIST_IDS.MOBILE,
                pageUrl: pageData.pages[0].url,
            }),
            expect.objectContaining({
                listId: SPECIAL_LIST_IDS.MOBILE,
                pageUrl: pageData.pages[1].url,
            }),
            expect.objectContaining({
                listId: SPECIAL_LIST_IDS.MOBILE,
                pageUrl: pageData.pages[2].url,
            }),
        ])
    })
})
