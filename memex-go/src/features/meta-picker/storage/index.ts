import {
    StorageModule,
    StorageModuleConfig,
    StorageModuleConstructorArgs,
} from '@worldbrain/storex-pattern-modules'
import type { OperationBatch } from '@worldbrain/storex'
import {
    COLLECTION_DEFINITIONS as TAG_COLL_DEFINITIONS,
    COLLECTION_NAMES as TAG_COLL_NAMES,
} from '@worldbrain/memex-common/lib/storage/modules/tags/constants'
import {
    COLLECTION_DEFINITIONS as LIST_COLL_DEFINITIONS,
    COLLECTION_NAMES as LIST_COLL_NAMES,
    SPECIAL_LIST_NAMES,
    SPECIAL_LIST_IDS,
} from '@worldbrain/memex-common/lib/storage/modules/lists/constants'
import {
    COLLECTION_DEFINITIONS as ANNOT_COLL_DEFINITIONS,
    COLLECTION_NAMES as ANNOT_COLL_NAMES,
} from '@worldbrain/memex-common/lib/storage/modules/annotations/constants'
import {
    SuggestArgs,
    SuggestPlugin,
} from '@worldbrain/memex-common/lib/storage/modules/mobile-app/plugins/suggest'
import type {
    List,
    ListEntry,
    AnnotListEntry,
    SpacePickerEntry,
    Tag,
} from '../types'
import { updateSuggestionsCache } from '@worldbrain/memex-common/lib/utils/suggestions-cache'
import type { CustomListTree } from '@worldbrain/memex-common/lib/types/core-data-types/client'
import { ROOT_NODE_PARENT_ID } from '@worldbrain/memex-common/lib/content-sharing/tree-utils'
import {
    buildMaterializedPath,
    extractMaterializedPathIds,
} from '@worldbrain/memex-common/lib/content-sharing/utils'
import { TypeORMStorageBackend } from '@worldbrain/storex-backend-typeorm'
import { deleteListTreeAndAllAssociatedData } from '@worldbrain/memex-common/lib/content-sharing/storage/delete-tree'
import { moveTree } from '@worldbrain/memex-common/lib/content-sharing/storage/move-tree'
import {
    insertOrderedItemBeforeIndex,
    pushOrderedItem,
} from '@worldbrain/memex-common/lib/utils/item-ordering'
import type { URLNormalizer } from '@worldbrain/memex-common/lib/url-utils/normalize/types'

const cleanListTree = (listTree: CustomListTree) => ({
    ...listTree,
    parentListId:
        listTree.parentListId === ROOT_NODE_PARENT_ID
            ? null
            : listTree.parentListId,
})

export class MetaPickerStorage extends StorageModule {
    static TAG_COLL = TAG_COLL_NAMES.tag
    static LIST_COLL = LIST_COLL_NAMES.list
    static LIST_ENTRY_COLL = LIST_COLL_NAMES.listEntry
    static LIST_DESCRIPTION_COLL = LIST_COLL_NAMES.listDescription

    static DEF_SUGGESTION_LIMIT = 25
    static DEF_TAG_LIMIT = 1000

    /** This exists to mimic behavior implemented in memex WebExt; Storex auto-PK were not used for whatever reason. */
    static generateListId = () => Date.now()

    constructor(
        private options: StorageModuleConstructorArgs & {
            normalizeUrl: URLNormalizer
            getSpaceSuggestionsCache: () => Promise<number[]>
            setSpaceSuggestionsCache: (spaceIds: number[]) => Promise<void>
            getSpaceRemoteIds: (
                spaceIds: number[],
            ) => Promise<{ [spaceId: number]: string }>
        },
    ) {
        super(options)
    }

    getConfig = (): StorageModuleConfig => ({
        collections: {
            ...TAG_COLL_DEFINITIONS,
            ...LIST_COLL_DEFINITIONS,
            [ANNOT_COLL_NAMES.listEntry]:
                ANNOT_COLL_DEFINITIONS[ANNOT_COLL_NAMES.listEntry],
        },
        operations: {
            createList: {
                operation: 'createObject',
                collection: MetaPickerStorage.LIST_COLL,
            },
            createListEntry: {
                operation: 'createObject',
                collection: MetaPickerStorage.LIST_ENTRY_COLL,
            },
            createAnnotListEntry: {
                operation: 'createObject',
                collection: ANNOT_COLL_NAMES.listEntry,
            },
            createTag: {
                operation: 'createObject',
                collection: MetaPickerStorage.TAG_COLL,
            },
            findListByName: {
                operation: 'findObject',
                collection: MetaPickerStorage.LIST_COLL,
                args: {
                    name: '$name:string',
                },
            },
            findListsByNames: {
                operation: 'findObjects',
                collection: MetaPickerStorage.LIST_COLL,
                args: {
                    name: { $in: '$names:string[]' },
                },
            },
            findListById: {
                operation: 'findObject',
                collection: MetaPickerStorage.LIST_COLL,
                args: {
                    id: '$listId:number',
                },
            },
            findListDescriptionById: {
                operation: 'findObject',
                collection: MetaPickerStorage.LIST_DESCRIPTION_COLL,
                args: {
                    listId: '$listId:number',
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
                args: [{ url: '$url:string' }, { limit: '$limit:int' }],
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
            findPageListEntriesByUrls: {
                operation: 'findObjects',
                collection: MetaPickerStorage.LIST_ENTRY_COLL,
                args: {
                    listId: '$listId:number',
                    pageUrl: { $in: '$urls:string' },
                },
            },
            findRecentEntriesByList: {
                operation: 'findObjects',
                collection: MetaPickerStorage.LIST_ENTRY_COLL,
                args: [
                    { listId: '$listId:number' },
                    {
                        order: [['createdAt', 'desc']],
                        limit: '$limit:number',
                        skip: '$skip:number',
                    },
                ],
            },
            findEntriesByAnnot: {
                operation: 'findObjects',
                collection: ANNOT_COLL_NAMES.listEntry,
                args: {
                    url: '$url:string',
                },
            },
            findEntriesByAnnots: {
                operation: 'findObjects',
                collection: ANNOT_COLL_NAMES.listEntry,
                args: {
                    url: { $in: '$annotationUrls:string[]' },
                },
            },
            findAnnotEntry: {
                operation: 'findObject',
                collection: ANNOT_COLL_NAMES.listEntry,
                args: {
                    url: '$url:string',
                    listId: '$listId:number',
                },
            },
            findAnnotEntriesByList: {
                operation: 'findObjects',
                collection: ANNOT_COLL_NAMES.listEntry,
                args: {
                    listId: '$listId:number',
                },
            },
            findListTreesByParentListId: {
                collection: LIST_COLL_NAMES.listTrees,
                operation: 'findObjects',
                args: { parentListId: '$parentListId:int' },
            },
            findListTreeByListId: {
                collection: LIST_COLL_NAMES.listTrees,
                operation: 'findObject',
                args: { listId: '$listId:int' },
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
            deleteAnnotFromList: {
                operation: 'deleteObjects',
                collection: ANNOT_COLL_NAMES.listEntry,
                args: {
                    listId: '$listId:number',
                    url: '$url:string',
                },
            },
            deleteAnnotEntriesForList: {
                operation: 'deleteObjects',
                collection: ANNOT_COLL_NAMES.listEntry,
                args: {
                    listId: '$listId:number',
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
            [SuggestPlugin.SUGGEST_OP_ID]: {
                operation: SuggestPlugin.SUGGEST_OP_ID,
                args: {
                    query: '$query:string',
                    collection: '$collection:string',
                    limit: '$limit:number',
                },
            },
        },
    })

    createTag(tag: Tag) {
        return this.operation('createTag', {
            ...tag,
            url: this.options.normalizeUrl(tag.url),
        })
    }

    async updateListSuggestionsCache(args: {
        added?: number
        removed?: number
    }) {
        return updateSuggestionsCache({
            ...args,
            getCache: this.options.getSpaceSuggestionsCache,
            setCache: this.options.setSpaceSuggestionsCache,
            suggestionLimit: MetaPickerStorage.DEF_SUGGESTION_LIMIT,
        })
    }

    async createList(
        list: Omit<List, 'id' | 'createdAt'> & {
            __id?: number
            __createdAt?: Date
        },
        opts?: {
            skipSuggestionCache?: boolean
        },
    ): Promise<{ object: { id: number } }> {
        const result = await this.operation('createList', {
            id: list.__id ?? MetaPickerStorage.generateListId(),
            createdAt: list.__createdAt ?? new Date(),
            ...list,
            searchableName: list.name,
        })

        if (!opts?.skipSuggestionCache) {
            await this.updateListSuggestionsCache({ added: result.object.id })
        }

        return result
    }

    async createAnnotListEntry(entry: {
        annotationUrl: string
        listId: number
        createdAt?: Date
    }): Promise<void> {
        await this.operation('createAnnotListEntry', {
            createdAt: entry.createdAt ?? new Date(),
            listId: entry.listId,
            url: entry.annotationUrl,
        })

        if (
            ![SPECIAL_LIST_IDS.INBOX, SPECIAL_LIST_IDS.MOBILE].includes(
                entry.listId,
            )
        ) {
            await this.updateListSuggestionsCache({ added: entry.listId })
        }
    }

    async ensureAnnotationInList(entry: {
        annotationUrl: string
        listId: number
    }): Promise<void> {
        const existing = await this.operation('findAnnotEntry', {
            url: entry.annotationUrl,
            listId: entry.listId,
        })
        if (existing == null) {
            await this.operation('createAnnotListEntry', {
                createdAt: new Date(),
                listId: entry.listId,
                url: entry.annotationUrl,
            })
        }
    }

    async createPageListEntry(entry: {
        fullPageUrl: string
        listId: number
    }): Promise<void> {
        await this.operation('createListEntry', {
            createdAt: new Date(),
            listId: entry.listId,
            pageUrl: this.options.normalizeUrl(entry.fullPageUrl),
            fullUrl: entry.fullPageUrl,
        })

        if (
            ![SPECIAL_LIST_IDS.INBOX, SPECIAL_LIST_IDS.MOBILE].includes(
                entry.listId,
            )
        ) {
            await this.updateListSuggestionsCache({ added: entry.listId })
        }
    }

    findRecentListEntries(
        listId: number,
        options: { skip: number; limit: number },
    ) {
        return this.operation('findRecentEntriesByList', {
            listId,
            ...options,
        })
    }

    findTagsByPage({
        url,
        limit = MetaPickerStorage.DEF_TAG_LIMIT,
    }: {
        url: string
        limit?: number
    }): Promise<Tag[]> {
        url = this.options.normalizeUrl(url)
        return this.operation('findTagsByPage', { url, limit })
    }

    findTagsByAnnotation({ url }: { url: string }): Promise<Tag[]> {
        return this.operation('findTagsByPage', { url })
    }

    findTagsByName({ name }: { name: string }): Promise<Tag[]> {
        return this.operation('findTagsByName', { name })
    }

    async findListById({
        id,
        includeRemoteIds,
    }: {
        id: number
        includeRemoteIds?: boolean
    }): Promise<List | null> {
        const list: List | null =
            (await this.operation('findListById', { listId: id })) ?? null

        const listDescription =
            (await this.operation('findListDescriptionById', {
                listId: id,
            })) ?? null

        if (!includeRemoteIds || list == null) {
            return list
        }

        const remoteIds = await this.options.getSpaceRemoteIds([id])
        return {
            ...list,
            remoteId: remoteIds[id],
            description: listDescription?.description ?? undefined,
        }
    }

    async findListsByIds({
        ids,
        includeRemoteIds,
    }: {
        ids: number[]
        includeRemoteIds?: boolean
    }): Promise<List[]> {
        const lists: List[] = await this.operation('findListsByIds', {
            listIds: ids,
        })
        if (!includeRemoteIds) {
            return lists
        }

        const remoteIds = await this.options.getSpaceRemoteIds(ids)
        return lists.map((l) => ({ ...l, remoteId: remoteIds[l.id] }))
    }

    findListByName({ name }: { name: string }): Promise<List | null> {
        return this.operation('findListByName', { name }) ?? null
    }

    findListsByNames({ names }: { names: string[] }): Promise<List[]> {
        return this.operation('findListsByNames', { names })
    }

    findPageListEntriesByPage({ url }: { url: string }): Promise<ListEntry[]> {
        return this.operation('findEntriesByPage', { url })
    }

    async findAnnotListEntriesByAnnots({
        annotationUrls,
    }: {
        annotationUrls: string[]
    }): Promise<{ [annotationUrl: string]: AnnotListEntry[] }> {
        const result = annotationUrls.reduce<{
            [annotationUrl: string]: AnnotListEntry[]
        }>((acc, url) => ({ ...acc, [url]: [] }), {})

        const annotListEntries: AnnotListEntry[] = await this.operation(
            'findEntriesByAnnots',
            { annotationUrls },
        )

        for (const entry of annotListEntries) {
            result[entry.url].push(entry)
        }

        return result
    }

    async findAnnotListIdsByAnnots({
        annotationUrls,
    }: {
        annotationUrls: string[]
    }): Promise<{ [annotationUrl: string]: number[] }> {
        const entriesByAnnots = await this.findAnnotListEntriesByAnnots({
            annotationUrls,
        })
        const result = annotationUrls.reduce<{
            [annotationUrl: string]: number[]
        }>((acc, url) => ({ ...acc, [url]: [] }), {})

        for (const url in entriesByAnnots) {
            result[url] = entriesByAnnots[url].map((entry) => entry.listId)
        }

        return result
    }

    findAnnotListEntriesByAnnot({
        annotationUrl,
    }: {
        annotationUrl: string
    }): Promise<AnnotListEntry[]> {
        return this.operation('findEntriesByAnnot', { url: annotationUrl })
    }

    async findListsByPage({
        url,
        extraListIds,
        includeRemoteIds,
    }: {
        url: string
        extraListIds?: number[]
        includeRemoteIds?: boolean
    }): Promise<List[]> {
        const listIds = await this.findListIdsByPage({ url })
        if (extraListIds) {
            listIds.push(...extraListIds)
        }
        const storedLists = await this.findListsByIds({
            ids: listIds,
            includeRemoteIds,
        })
        return this.filterOutSpecialLists(storedLists)
    }

    async findListIdsByPage({ url }: { url: string }): Promise<number[]> {
        url = this.options.normalizeUrl(url)
        const entries = await this.findPageListEntriesByPage({ url })
        const listIdsSet = new Set(entries.map((e) => e.listId))

        return this.filterOutSpecialLists(
            [...listIdsSet].map((id) => ({ id })),
        ).map((list) => list.id)
    }

    private filterOutSpecialLists = <T extends { id: number }>(
        lists: T[],
    ): T[] =>
        lists.filter(
            (list) =>
                list.id !== SPECIAL_LIST_IDS.MOBILE &&
                list.id !== SPECIAL_LIST_IDS.INBOX,
        )

    async findListSuggestions({
        includeSpecialLists,
        limit = MetaPickerStorage.DEF_SUGGESTION_LIMIT,
    }: {
        limit?: number
        includeSpecialLists?: boolean
    }): Promise<SpacePickerEntry[]> {
        const spaceToPickerEntry = (space: List): SpacePickerEntry => ({
            id: space.id,
            name: space.name,
            isChecked: false,
            remoteId: space.remoteId,
        })

        // Try to use the cache first
        const suggestionIds = await this.options.getSpaceSuggestionsCache()
        if (suggestionIds?.length) {
            const spaces = await this.findListsByIds({
                ids: suggestionIds,
                includeRemoteIds: true,
            })

            if (includeSpecialLists) {
                spaces.unshift({
                    id: SPECIAL_LIST_IDS.MOBILE,
                    name: SPECIAL_LIST_NAMES.MOBILE,
                    createdAt: new Date(),
                })
                spaces.unshift({
                    id: SPECIAL_LIST_IDS.INBOX,
                    name: SPECIAL_LIST_NAMES.INBOX,
                    createdAt: new Date(),
                })
            }

            return spaces
                .sort(
                    (a, b) =>
                        suggestionIds.indexOf(a.id) -
                        suggestionIds.indexOf(b.id),
                )
                .map(spaceToPickerEntry)
        }

        const lists: List[] = await this.operation('findListSuggestions', {
            limit,
        })

        const suggestions = lists.map(spaceToPickerEntry)
        const filteredSuggestions = this.filterOutSpecialLists(suggestions)

        // Set cache for next time
        await this.options.setSpaceSuggestionsCache(
            filteredSuggestions.map((s) => s.id),
        )

        return includeSpecialLists ? suggestions : filteredSuggestions
    }

    async findTagSuggestions({
        limit = MetaPickerStorage.DEF_SUGGESTION_LIMIT,
        url,
    }: {
        limit?: number
        url: string
    }): Promise<SpacePickerEntry[]> {
        const tags: Tag[] = await this.operation('findTagSuggestions', {
            limit,
        })

        return tags.map((tag) => ({
            id: -1,
            name: tag.name,
            isChecked: tag.url === url,
        }))
    }

    async suggestLists(
        suggestArgs: Omit<SuggestArgs, 'collection'> & {
            includeSpecialLists?: boolean
        },
    ): Promise<SpacePickerEntry[]> {
        const suggested: List[] = await this.operation(
            SuggestPlugin.SUGGEST_OP_ID,
            { ...suggestArgs, collection: MetaPickerStorage.LIST_COLL },
        )

        const suggestions: SpacePickerEntry[] = suggested.map((entry) => ({
            id: entry.id,
            name: entry.name,
            isChecked: false,
        }))

        if (suggestArgs.includeSpecialLists) {
            return suggestions
        }
        return this.filterOutSpecialLists(suggestions)
    }

    findPageListEntriesByList({
        listId,
    }: {
        listId: number
    }): Promise<ListEntry[]> {
        return this.operation('findEntriesByList', { listId })
    }

    async fetchListPageEntriesByUrls({
        listId,
        normalizedPageUrls,
    }: {
        listId: number
        normalizedPageUrls: string[]
    }): Promise<ListEntry[]> {
        const pageListEntries: ListEntry[] = await this.operation(
            'findPageListEntriesByUrls',
            { urls: normalizedPageUrls, listId },
        )
        return pageListEntries
    }

    findAnnotListEntriesByList({
        listId,
    }: {
        listId: number
    }): Promise<AnnotListEntry[]> {
        return this.operation('findAnnotEntriesByList', { listId })
    }

    /**
     * Should go through input `tags` and ensure only these tags exist for a given page.
     */
    async setPageTags({ tags, url }: { tags: string[]; url: string }) {
        url = this.options.normalizeUrl(url)

        const existingTags = await this.findTagsByPage({ url })

        // Find any existing tags that are not in input list
        const inputTagsSet = new Set(tags)
        const toRemove = existingTags
            .map((tag) => tag.name)
            .filter((name) => !inputTagsSet.has(name))

        // Find any input tags that are not existing
        const existingTagsSet = new Set(existingTags.map((t) => t.name))
        const toAdd = tags.filter((name) => !existingTagsSet.has(name))

        for (const name of toAdd) {
            await this.createTag({ name, url })
        }

        for (const name of toRemove) {
            await this.deleteTag({ name, url })
        }
    }

    /**
     * Should go through input `listIds`, then ensure entries for only these lists exist for a given page.
     */
    async setPageLists({
        listIds,
        fullPageUrl,
    }: {
        listIds: number[]
        fullPageUrl: string
    }) {
        const normalizedPageUrl = this.options.normalizeUrl(fullPageUrl)

        const existingEntries = await this.findPageListEntriesByPage({
            url: normalizedPageUrl,
        })
        const existingEntryListIds = new Set(
            existingEntries.map((e) => e.listId),
        )
        const toAdd = listIds.filter(
            (listId) => !existingEntryListIds.has(listId),
        )

        for (const listId of toAdd) {
            await this.createPageListEntry({ listId, fullPageUrl })
        }

        // Find any existing entries that are not in input lists
        const toRemove = existingEntries
            .map((entry) => entry.listId)
            .filter((id) => !listIds.includes(id))

        for (const listId of toRemove) {
            await this.deletePageEntryFromList({
                listId,
                url: normalizedPageUrl,
            })
        }
    }

    /**
     * Should go through input `listIds`, then ensure entries for only these lists exist for a given annotation.
     */
    async setAnnotationLists({
        listIds,
        annotationUrl,
    }: {
        listIds: number[]
        annotationUrl: string
    }) {
        const existingEntries = await this.findAnnotListEntriesByAnnot({
            annotationUrl,
        })
        const existingEntryListIds = new Set(
            existingEntries.map((e) => e.listId),
        )
        const toAdd = listIds.filter(
            (listId) => !existingEntryListIds.has(listId),
        )

        for (const listId of toAdd) {
            await this.createAnnotListEntry({ listId, annotationUrl })
        }

        // Find any existing entries that are not in input lists
        const toRemove = existingEntries
            .map((entry) => entry.listId)
            .filter((id) => !listIds.includes(id))

        for (const listId of toRemove) {
            await this.deleteAnnotEntryFromList({ listId, annotationUrl })
        }
    }

    async deleteList({ listId }: { listId: number }) {
        await this.deletePageListEntriesByList({ listId })
        await this.deleteAnnotListEntriesByList({ listId })
        await this.operation('deleteList', { listId })
        await this.updateListSuggestionsCache({ removed: listId })
    }

    async deleteAnnotListEntriesByList({
        listId,
    }: {
        listId: number
    }): Promise<void> {
        await this.operation('deleteAnnotEntriesForList', { listId })
    }

    async deletePageListEntriesByList({
        listId,
    }: {
        listId: number
    }): Promise<void> {
        await this.operation('deleteEntriesForList', { listId })
    }

    async deleteAnnotEntryFromList(entry: {
        listId: number
        annotationUrl: string
    }): Promise<void> {
        await this.operation('deleteAnnotFromList', {
            listId: entry.listId,
            url: entry.annotationUrl,
        })
    }

    async deletePageEntryFromList(entry: {
        listId: number
        url: string
    }): Promise<void> {
        await this.operation('deletePageFromList', {
            listId: entry.listId,
            url: entry.url,
        })
    }

    deleteTag(tag: Tag) {
        return this.operation('deleteTag', {
            ...tag,
            url: this.options.normalizeUrl(tag.url),
        })
    }

    deleteTagsByPage({ url }: { url: string }) {
        return this.operation('deleteTagsByPage', {
            url: this.options.normalizeUrl(url),
        })
    }

    async createMobileListIfAbsent({
        createdAt = new Date(),
    }: {
        createdAt?: Date
    }): Promise<void> {
        const staticMobileList: List | null = await this.operation(
            'findListById',
            {
                listId: SPECIAL_LIST_IDS.MOBILE,
            },
        )

        if (staticMobileList != null) {
            return
        }

        // The following code exists to update any dynamically created mobile list + entries to the static one - should only ever run once
        const dynamicMobileList: List | null = await this.operation(
            'findListByName',
            {
                name: SPECIAL_LIST_NAMES.MOBILE,
            },
        )

        await this.operation('createList', {
            id: SPECIAL_LIST_IDS.MOBILE,
            name: SPECIAL_LIST_NAMES.MOBILE,
            searchableName: SPECIAL_LIST_NAMES.MOBILE,
            isDeletable: false,
            isNestable: false,
            createdAt,
        })

        if (dynamicMobileList != null) {
            const dynamicEntries = await this.operation('findEntriesByList', {
                listId: dynamicMobileList.id,
            })
            for (const entry of dynamicEntries) {
                await this.operation('createListEntry', {
                    ...entry,
                    listId: SPECIAL_LIST_IDS.MOBILE,
                })
            }
            await this.operation('deleteEntriesForList', {
                listId: dynamicMobileList.id,
            })
            await this.operation('deleteList', { listId: dynamicMobileList.id })
        }
    }

    async createMobileListEntry(args: { fullPageUrl: string }) {
        await this.createMobileListIfAbsent({})

        await this.createPageListEntry({
            fullPageUrl: args.fullPageUrl,
            listId: SPECIAL_LIST_IDS.MOBILE,
        })
    }

    async createInboxListIfAbsent({
        createdAt = new Date(),
    }: {
        createdAt?: Date
    }): Promise<void> {
        const foundInboxList: List | null = await this.operation(
            'findListById',
            {
                listId: SPECIAL_LIST_IDS.INBOX,
            },
        )
        if (!foundInboxList) {
            await this.operation('createList', {
                id: SPECIAL_LIST_IDS.INBOX,
                name: SPECIAL_LIST_NAMES.INBOX,
                searchableName: SPECIAL_LIST_NAMES.INBOX,
                isDeletable: false,
                isNestable: false,
                createdAt,
            })
        }
    }

    async getTreeDataForList(params: {
        localListId: number
    }): Promise<CustomListTree | null> {
        const currentNode: CustomListTree = await this.operation(
            'findListTreeByListId',
            { listId: params.localListId },
        )
        return currentNode ? cleanListTree(currentNode) : null
    }

    async createInboxListEntry(args: { fullPageUrl: string }) {
        await this.createInboxListIfAbsent({})

        await this.createPageListEntry({
            fullPageUrl: args.fullPageUrl,
            listId: SPECIAL_LIST_IDS.INBOX,
        })
    }

    async getTreesByParent(params: {
        parentListId: number
    }): Promise<CustomListTree[]> {
        const listTrees: CustomListTree[] = await this.operation(
            'findListTreesByParentListId',
            { parentListId: params.parentListId },
        )
        // TODO: Maybe order them
        return listTrees.map(cleanListTree)
    }

    async createListTree(params: {
        localListId: number
        parentListId?: number | null
        pathIds?: number[]
        now?: number
        order?: number
        isLink?: boolean
        skipSyncEntry?: boolean
        shouldInsertAsFirstSibling?: boolean
    }): Promise<CustomListTree> {
        const existingList = await this.findListById({ id: params.localListId })
        if (!existingList) {
            throw new Error(
                `List does not exist to create list tree data for: ${params}`,
            )
        }
        const parentListId = params.parentListId ?? ROOT_NODE_PARENT_ID

        let order: number
        if (params.order != null) {
            order = params.order
        } else {
            // Look up all sibling nodes to determine order of this one
            const siblingNodes: CustomListTree[] = await this.operation(
                'findListTreesByParentListId',
                {
                    parentListId,
                },
            )
            const items = siblingNodes.map((node) => ({
                id: node.id,
                key: node.order,
            }))
            order =
                params.shouldInsertAsFirstSibling && items.length > 0
                    ? insertOrderedItemBeforeIndex(items, '', 0).create.key
                    : pushOrderedItem(items, '').create.key
        }

        const now = params.now ?? Date.now()
        const listTree: Omit<CustomListTree, 'id'> = {
            parentListId,
            listId: params.isLink ? null : params.localListId,
            linkTarget: params.isLink ? params.localListId : null,
            path: params.pathIds?.length
                ? buildMaterializedPath(...params.pathIds)
                : null,
            order,
            createdWhen: now,
            updatedWhen: now,
        }

        const opExecuter = params.skipSyncEntry
            ? this.options.storageManager.backend
            : this.options.storageManager

        const { object } = await opExecuter.operation(
            'createObject',
            'customListTrees',
            listTree,
        )
        return { ...listTree, id: object.id }
    }

    async getAllNodesInTreeByList(params: {
        rootLocalListId: number
    }): Promise<CustomListTree[]> {
        const listTree = await this.getTreeDataForList({
            localListId: params.rootLocalListId,
        })
        if (!listTree) {
            throw new Error('Could not find root data of tree to traverse')
        }
        // Link nodes are always leaves
        if (listTree.linkTarget != null) {
            return [listTree]
        }

        const materializedPath = buildMaterializedPath(
            ...extractMaterializedPathIds(listTree.path ?? '', 'number'),
            listTree.listId!,
        )
        const storageBackend = this.options.storageManager
            .backend as TypeORMStorageBackend

        const listTrees: CustomListTree[] = await storageBackend.findObjectsLike(
            LIST_COLL_NAMES.listTrees,
            'path',
            `%${materializedPath}`,
        )
        listTrees.push(listTree) // Ensure root tree is included
        // TODO: Maybe sort each level of siblings
        return listTrees
    }

    async performDeleteListAndAllAssociatedData(params: {
        localListId: number
    }): Promise<void> {
        await deleteListTreeAndAllAssociatedData({
            storageManager: this.options.storageManager,
            getAllNodesInTree: async () => {
                const listTrees = await this.getAllNodesInTreeByList({
                    rootLocalListId: params.localListId,
                })
                const remoteListIds = await this.options.getSpaceRemoteIds(
                    listTrees
                        .filter((tree) => tree.listId != null)
                        .map((tree) => tree.listId!),
                )
                return listTrees.map((tree) => ({
                    ...tree,
                    remoteListId: remoteListIds[tree.listId!] ?? null,
                }))
            },
        })
    }

    async updateListTreeParent(params: {
        localListId: number
        newParentListId: number | null
        now?: number
    }): Promise<void> {
        const updatedWhen = params.now ?? Date.now()

        const batch: OperationBatch = []
        await moveTree<CustomListTree>({
            nodeId: params.localListId,
            newParentNodeId: params.newParentListId,
            selectNodeId: (node) => node.listId ?? node.linkTarget!,
            selectNodeParentId: (node) => node.parentListId,
            retrieveNode: (localListId) =>
                this.getTreeDataForList({
                    localListId: localListId as number,
                }),
            createNode: (localListId, parentNode) =>
                this.createListTree({
                    localListId: localListId as number,
                    parentListId: parentNode?.listId,
                    pathIds:
                        parentNode != null
                            ? [
                                  ...(extractMaterializedPathIds(
                                      parentNode.path,
                                      'number',
                                  ) as number[]),
                                  parentNode.listId!,
                              ]
                            : undefined,
                    now: params.now,
                    skipSyncEntry: true,
                    shouldInsertAsFirstSibling: true,
                }),
            getChildrenOfNode: (node) =>
                this.getTreesByParent({
                    parentListId: node.listId!,
                }),
            isNodeALeaf: (node) => node.linkTarget != null,
            updateNodesParent: (node, parentNode) => {
                node.parentListId = parentNode?.listId ?? ROOT_NODE_PARENT_ID
                node.path =
                    parentNode != null
                        ? buildMaterializedPath(
                              ...extractMaterializedPathIds(
                                  parentNode.path ?? '',
                                  'number',
                              ),
                              parentNode.listId!,
                          )
                        : null

                batch.push({
                    collection: LIST_COLL_NAMES.listTrees,
                    operation: 'updateObjects',
                    where: { id: node.id },
                    updates: {
                        path: node.path,
                        parentListId: node.parentListId,
                        updatedWhen,
                    },
                })
            },
            assertSuitableParent: (node) => {
                if (node?.linkTarget != null) {
                    throw new Error(
                        'Cannot move a list tree node to be a child of a link target node',
                    )
                }
            },
        })

        // Note we're running this on the storage backend so that it skips storex middleware and doesn't get synced (tree updates handled in a special way for sync)
        await this.options.storageManager.backend.executeBatch(batch)
    }
}
