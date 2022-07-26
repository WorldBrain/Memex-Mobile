import {
    StorageModule,
    StorageModuleConfig,
    StorageModuleConstructorArgs,
} from '@worldbrain/storex-pattern-modules'
import type { URLNormalizer } from '@worldbrain/memex-url-utils'
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

export class MetaPickerStorage extends StorageModule {
    static TAG_COLL = TAG_COLL_NAMES.tag
    static LIST_COLL = LIST_COLL_NAMES.list
    static LIST_ENTRY_COLL = LIST_COLL_NAMES.listEntry

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

        if (!includeRemoteIds || list == null) {
            return list
        }

        const remoteIds = await this.options.getSpaceRemoteIds([id])
        return { ...list, remoteId: remoteIds[id] }
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

    async createInboxListEntry(args: { fullPageUrl: string }) {
        await this.createInboxListIfAbsent({})

        await this.createPageListEntry({
            fullPageUrl: args.fullPageUrl,
            listId: SPECIAL_LIST_IDS.INBOX,
        })
    }
}
