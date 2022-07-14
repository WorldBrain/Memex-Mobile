import { storageKeys } from '../../app.json'
import { Services } from 'src/services/types'
import { migrations } from './quick-and-dirty-migrations'

/*
 The cloud work included separating sync from local settings. Prior to this, we only had
 one storex collection containing settings: `settings`. Now we sync the old `settings` with
 the cloud and have a new `localSettings` collection for stuff that's specific to an app on a
 single device.

 This migrates any existing settings from `syncStorage` (which uses the existing collection) to `localStorage`.
*/
export async function migrateSettings({
    syncStorage,
    localStorage,
}: Pick<Services, 'localStorage' | 'syncStorage'>) {
    const migrationAlreadyRun = await localStorage.get<boolean>(
        storageKeys.cloudSettingsMigrationRun,
    )
    if (migrationAlreadyRun) {
        return
    }

    // Move to local settings
    const syncFlag = await syncStorage.get(storageKeys.initSyncFlag)
    if (syncFlag != null) {
        await syncStorage.clear(storageKeys.initSyncFlag)
        await localStorage.set(storageKeys.initSyncFlag, syncFlag)
    }

    // No longer used settings - qnd migrations + old sync
    for (const settingKey of [
        ...Object.keys(migrations),
        storageKeys.skipAutoSync,
    ]) {
        await syncStorage.clear(settingKey)
    }

    // This moves to local settings
    await syncStorage.clear(storageKeys.showOnboarding)

    // Set to true to force onboarding on first load of cloud update
    await localStorage.set(storageKeys.showOnboarding, true)

    // Set flag to ensure this migration doesn't run again
    await localStorage.set(storageKeys.cloudSettingsMigrationRun, true)
}
