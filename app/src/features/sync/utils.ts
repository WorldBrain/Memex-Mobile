import { UIServices } from 'src/ui/types'
import { storageKeys } from '../../../app.json'

export const shouldAutoSync = async ({
    localStorage,
}: UIServices<'localStorage'>): Promise<boolean> => {
    const syncEnabled = await isSyncEnabled({ localStorage })

    if (!syncEnabled) {
        return false
    }

    const shouldSkipSync = await localStorage.get(storageKeys.skipAutoSync)

    if (shouldSkipSync) {
        await localStorage.clear(storageKeys.skipAutoSync)
        return false
    }

    return true
}

export const isSyncEnabled = async ({
    localStorage,
}: UIServices<'localStorage'>): Promise<boolean> => {
    const syncEnabled = await localStorage.get(storageKeys.syncKey)

    if (!syncEnabled) {
        return false
    }

    return true
}
