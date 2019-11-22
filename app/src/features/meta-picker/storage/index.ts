import {
    StorageModule,
    StorageModuleConfig,
} from '@worldbrain/storex-pattern-modules'
import { mapCollectionVersions } from '@worldbrain/storex-pattern-modules/lib/utils'
import {
    COLLECTION_DEFINITIONS as TAG_COLL_DEFINITIONS,
    COLLECTION_NAMES as TAG_COLL_NAMES,
} from '@worldbrain/memex-storage/lib/tags/constants'
import {
    COLLECTION_DEFINITIONS as LIST_COLL_DEFINITIONS,
    COLLECTION_NAMES as LIST_COLL_NAMES,
} from '@worldbrain/memex-storage/lib/lists/constants'

import { STORAGE_VERSIONS } from 'src/storage/constants'
import { Tag, List, ListEntry, MetaTypeShape } from '../types'

export class MetaPickerStorage extends StorageModule {
    static TAG_COLL = TAG_COLL_NAMES.tag
    static LIST_COLL = LIST_COLL_NAMES.list
    static LIST_ENTRY_COLL = LIST_COLL_NAMES.listEntry
    static DEF_SUGGESTION_LIMIT = 7
    /** This exists to mimic behavior implemented in memex WebExt; Storex auto-PK were not used for whatever reason. */
    static generateListId = () => Date.now()

    getConfig = (): StorageModuleConfig => ({
        collections: mapCollectionVersions({
            collectionDefinitions: {
                ...TAG_COLL_DEFINITIONS,
                ...LIST_COLL_DEFINITIONS,
            },
            mappings: [
                {
                    moduleVersion: new Date('2019-09-13'),
                    applicationVersion: STORAGE_VERSIONS[0].version,
                },
            ],
        }),
        operations: {
            createList: {
                operation: 'createObject',
                collection: MetaPickerStorage.LIST_COLL,
            },
            createListEntry: {
                operation: 'createObject',
                collection: MetaPickerStorage.LIST_ENTRY_COLL,
            },
            createTag: {
                operation: 'createObject',
                collection: MetaPickerStorage.TAG_COLL,
            },
            findListsByNames: {
                operation: 'findObjects',
                collection: MetaPickerStorage.LIST_COLL,
                args: {
                    name: { $in: '$names:string[]' },
                },
            },
            findListsByIds: {
                operation: 'findObjects',
                collection: MetaPickerStorage.LIST_COLL,
                args: {
                    id: { $in: '$listIds:number[]' },
                },
            },
            findListSuggestions: {
                operation: 'findObjects',
                collection: MetaPickerStorage.LIST_COLL,
                args: [{}, { limit: '$limit:int' }],
            },
            findTagSuggestions: {
                operation: 'findObjects',
                collection: MetaPickerStorage.TAG_COLL,
                args: [{}, { limit: '$limit:int' }],
            },
            findTagsByPage: {
                operation: 'findObjects',
                collection: MetaPickerStorage.TAG_COLL,
                args: {
                    url: '$url:string',
                },
            },
            findTagsByName: {
                operation: 'findObjects',
                collection: MetaPickerStorage.TAG_COLL,
                args: {
                    name: '$name:string',
                },
            },
            findEntriesByPage: {
                operation: 'findObjects',
                collection: MetaPickerStorage.LIST_ENTRY_COLL,
                args: {
                    pageUrl: '$url:string',
                },
            },
            findEntriesByList: {
                operation: 'findObjects',
                collection: MetaPickerStorage.LIST_ENTRY_COLL,
                args: {
                    listId: '$listId:number',
                },
            },
            deleteList: {
                operation: 'deleteObject',
                collection: MetaPickerStorage.LIST_COLL,
                args: {
                    id: '$listId:number',
                },
            },
            deletePageFromList: {
                operation: 'deleteObjects',
                collection: MetaPickerStorage.LIST_ENTRY_COLL,
                args: {
                    listId: '$listId:number',
                    pageUrl: '$url:string',
                },
            },
            deleteEntriesForList: {
                operation: 'deleteObjects',
                collection: MetaPickerStorage.LIST_ENTRY_COLL,
                args: {
                    listId: '$listId:number',
                },
            },
            deleteEntriesForPage: {
                operation: 'deleteObjects',
                collection: MetaPickerStorage.LIST_ENTRY_COLL,
                args: {
                    pageUrl: '$url:string',
                },
            },
            deleteTag: {
                operation: 'deleteObjects',
                collection: MetaPickerStorage.TAG_COLL,
                args: {
                    name: '$name:string',
                    url: '$url:string',
                },
            },
            deleteTagsByPage: {
                operation: 'deleteObjects',
                collection: MetaPickerStorage.TAG_COLL,
                args: {
                    url: '$url:string',
                },
            },
        },
    })

    createTag(tag: Tag) {
        return this.operation('createTag', tag)
    }

    createList(
        list: Omit<List, 'id' | 'createdAt'>,
    ): Promise<{ object: { id: number } }> {
        return this.operation('createList', {
            id: MetaPickerStorage.generateListId(),
            createdAt: new Date(),
            ...list,
        })
    }

    createPageListEntry(entry: { pageUrl: string; listId: number }) {
        return this.operation('createListEntry', {
            createdAt: new Date(),
            fullUrl: entry.pageUrl,
            ...entry,
        })
    }

    findTagsByPage({ url }: { url: string }): Promise<Tag[]> {
        return this.operation('findTagsByPage', { url })
    }

    findTagsByName({ name }: { name: string }): Promise<Tag[]> {
        return this.operation('findTagsByName', { name })
    }

    findListsByNames({ names }: { names: string[] }): Promise<List[]> {
        return this.operation('findListsByNames', { names })
    }

    findPageListEntriesByPage({ url }: { url: string }): Promise<ListEntry[]> {
        return this.operation('findEntriesByPage', { url })
    }

    async findListsByPage({ url }: { url: string }): Promise<List[]> {
        const entries = await this.findPageListEntriesByPage({ url })
        const listIds = [...new Set(entries.map(e => e.listId))]

        return this.operation('findListsByIds', { listIds })
    }

    async findListSuggestions({
        limit = MetaPickerStorage.DEF_SUGGESTION_LIMIT,
        url,
    }: {
        limit?: number
        url: string
    }): Promise<MetaTypeShape[]> {
        const entries = await this.findPageListEntriesByPage({ url })

        const entryListIds = new Set(entries.map(e => e.listId))

        const lists: List[] = await this.operation('findListSuggestions', {
            limit,
        })

        return lists.map(list => ({
            name: list.name,
            isChecked: entryListIds.has(list.id),
        }))
    }

    async findTagSuggestions({
        limit = MetaPickerStorage.DEF_SUGGESTION_LIMIT,
        url,
    }: {
        limit?: number
        url: string
    }): Promise<MetaTypeShape[]> {
        const tags: Tag[] = await this.operation('findTagSuggestions', {
            limit,
        })

        return tags.map(tag => ({ name: tag.name, isChecked: tag.url === url }))
    }

    findPageListEntriesByList({
        listId,
    }: {
        listId: number
    }): Promise<ListEntry[]> {
        return this.operation('findEntriesByList', { listId })
    }

    /**
     * Should go through input `tags` and ensure only these tags exist for a given page.
     */
    async setPageTags({ tags, url }: { tags: string[]; url: string }) {
        const existingTags = await this.findTagsByPage({ url })

        // Find any existing tags that are not in input list
        const inputTagsSet = new Set(tags)
        const toRemove = existingTags
            .map(tag => tag.name)
            .filter(name => !inputTagsSet.has(name))

        // Find any input tags that are not existing
        const existingTagsSet = new Set(existingTags.map(t => t.name))
        const toAdd = tags.filter(name => !existingTagsSet.has(name))

        for (const name of toAdd) {
            await this.createTag({ name, url })
        }

        for (const name of toRemove) {
            await this.deleteTag({ name, url })
        }
    }

    /**
     * Should go through input `lists`, make sure any new lists exist, then ensure entries for
     * only these lists exist for a given page.
     */
    async setPageLists({ lists, url }: { lists: string[]; url: string }) {
        const existingLists = await this.findListsByNames({ names: lists })
        const existingListsSet = new Set(existingLists.map(list => list.name))

        // Create any missing lists
        const newListIds: number[] = []
        const missingLists = lists.filter(list => !existingListsSet.has(list))
        for (const name of missingLists) {
            const result = await this.createList({ name })
            newListIds.push(result.object.id)
        }

        const existingEntries = await this.findPageListEntriesByPage({ url })

        // Find any existing entries that are not in input lists
        const inputListIds = [
            ...newListIds,
            ...existingLists.map(list => list.id),
        ]
        const inputListIdsSet = new Set(inputListIds)
        const toRemove = existingEntries
            .map(entry => entry.listId)
            .filter(id => !inputListIdsSet.has(id))

        // Find any input entries that are not existing
        const existingEntryIdSet = new Set(
            existingEntries.map(entry => entry.listId),
        )
        const toAdd = inputListIds.filter(id => !existingEntryIdSet.has(id))

        for (const listId of toAdd) {
            await this.createPageListEntry({ listId, pageUrl: url })
        }

        for (const listId of toRemove) {
            await this.deletePageEntryFromList({ listId, url })
        }
    }

    async deleteList({ listId }: { listId: number }) {
        await this.deletePageListEntriesByList({ listId })
        await this.operation('deleteList', { listId })
    }

    deletePageListEntriesByList({ listId }: { listId: number }) {
        return this.operation('deleteEntriesForList', { listId })
    }

    deletePageEntryFromList(entry: { listId: number; url: string }) {
        return this.operation('deletePageFromList', entry)
    }

    deleteTag(tag: Tag) {
        return this.operation('deleteTag', tag)
    }

    deleteTagsByPage({ url }: { url: string }) {
        return this.operation('deleteTagsByPage', { url })
    }
}
