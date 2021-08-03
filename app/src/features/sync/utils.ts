import { Alert } from 'react-native'

import { UIServices, MainNavProps, ShareNavProps } from 'src/ui/types'
import { storageKeys } from '../../../app.json'

export const shouldAutoSync = async ({
    localStorage,
    syncStorage,
}: UIServices<'localStorage' | 'syncStorage'>): Promise<boolean> => {
    const syncEnabled = await isSyncEnabled({ localStorage, syncStorage })

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
    syncStorage,
}: UIServices<'localStorage' | 'syncStorage'>): Promise<boolean> => {
    const syncEnabledLocal = await localStorage.get(storageKeys.syncKey)
    const syncEnabledSync = await syncStorage.get(storageKeys.syncKey)

    return syncEnabledSync || syncEnabledLocal
}

type SyncErrorNavProps =
    | MainNavProps<'Dashboard' | 'SettingsMenu'>
    | ShareNavProps<'ShareModal'>

export const handleSyncError = (
    error: Error,
    opts: {
        services: UIServices<'errorTracker'>
        handleAppUpdateNeeded?: (title: string, subtitle: string) => void
    } & SyncErrorNavProps,
): { errorHandled: boolean } => {
    const handleAppUpdateNeeded = opts.handleAppUpdateNeeded ?? Alert.alert

    if (
        error.message.startsWith(
            `Could not find collection definition for '`,
        ) ||
        /^No entity column "\w+" was found\.$/.test(error.message)
    ) {
        handleAppUpdateNeeded(
            'Please update your app',
            'Sync is being attempted with a future version of the Memex extension.',
        )
        return { errorHandled: true }
    }

    if (error.message === 'Cannot Sync without authenticated user') {
        ;(opts.navigation as MainNavProps<'Login'>['navigation']).navigate(
            'Login',
        )
        return { errorHandled: true }
    }

    opts.services.errorTracker.track(error)
    return { errorHandled: false }
}
