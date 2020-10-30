import { SyncPostReceiveProcessor } from '@worldbrain/storex-sync'
import { COLLECTION_NAMES as PAGES_COLLECTION_NAMES } from '@worldbrain/memex-storage/lib/pages/constants'

export const postReceiveProcessor: SyncPostReceiveProcessor = async ({
    entry,
}) => {
    if (
        entry.data.collection === PAGES_COLLECTION_NAMES.page &&
        ['create', 'modify'].includes(entry.data.operation) &&
        entry.data.field == null &&
        entry.data.value.fullUrl == null
    ) {
        return {
            entry: {
                ...entry,
                data: {
                    ...entry.data,
                    value: {
                        ...entry.data.value,
                        fullUrl: entry.data.value.url,
                    },
                },
            },
        }
    }

    return { entry }
}
