import { Alert } from 'react-native'

import { UIServices, MainNavProps } from 'src/ui/types'
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

export const handleSyncError = (
    error: Error,
    opts: { services: UIServices<'errorTracker'> } & MainNavProps<
        'Dashboard' | 'SettingsMenu'
    >,
): { errorHandled: boolean } => {
    if (
        error.message.startsWith(`Could not find collection definition for '`)
    ) {
        Alert.alert(
            'Please update your app',
            'Sync is being attempted with a future version of the Memex extension.',
        )
        return { errorHandled: true }
    }

    if (error.message === 'Cannot Sync without authenticated user') {
        opts.navigation.navigate('Login')
        return { errorHandled: true }
    }

    opts.services.errorTracker.track(error)
    return { errorHandled: false }
}
