// tslint:disable:no-console
import { appGroup, appIdPrefix } from '../../app.json'
import { ServiceStarter } from './types'

export const setupBackgroundSync: ServiceStarter = async ({ services }) => {
    services.backgroundProcess.scheduleProcess(async () => {
        await services.sync.continuousSync.maybeDoIncrementalSync()

        // TODO: figure out whether the DB was written to (still don't understand how important this is)
        return { newData: true }
    })
}

export const setupContinuousSync: ServiceStarter = async ({ services }) => {
    await services.sync.continuousSync.setup()

    services.sync.continuousSync.events.addListener(
        'syncFinished',
        ({ error }) => {
            if (error) {
                services.errorTracker.track(error)
            }
        },
    )
}

export const setupFirebaseAuth: ServiceStarter = async ({ services }) => {
    // iOS only: Set up Firebase to store auth state in shared iOS group space,
    //  allowing both the share ext + main app to share logged-in state automatically.
    await services.auth.useiOSAccessGroup(`${appIdPrefix}.${appGroup}`)

    if (await services.auth.getCurrentUser()) {
        console.log('FB: LOGGED IN')
        return
    }

    console.log('FB: NOT LOGGED IN')
}
