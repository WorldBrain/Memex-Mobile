import StorageManager from '@worldbrain/storex'

export async function getStorageContents(
    storageManager: StorageManager,
    options?: { exclude?: Set<string> },
) {
    const exclude = (options && options.exclude) || new Set()

    const storedData: { [collection: string]: any[] } = {}
    for (const collectionName of Object.keys(
        storageManager.registry.collections,
    )) {
        if (!exclude.has(collectionName)) {
            storedData[collectionName] = await storageManager
                .collection(collectionName)
                .findObjects({})
        }
    }
    return storedData
}
