import { Alert } from 'react-native'

import { UIServices, MainNavProps, ShareNavProps } from 'src/ui/types'
import { storageKeys } from '../../../app.json'

export const isSyncEnabled = async ({
    localStorage,
}: UIServices<'localStorage'>): Promise<boolean> => {
    const syncEnabled = await localStorage.get<boolean>(
        storageKeys.initSyncFlag,
    )

    return Boolean(syncEnabled)
}

type SyncErrorNavProps =
    | MainNavProps<'Dashboard' | 'SettingsMenu'>
    | ShareNavProps<'Reader'>

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
