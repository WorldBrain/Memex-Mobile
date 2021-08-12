// tslint:disable:no-console
import { appGroup, appIdPrefix } from '../../app.json'
import { ServiceStarter } from './types'

export const setupBackgroundSync: ServiceStarter<
    'cloudSync' | 'backgroundProcess'
> = async ({ services }) => {
    services.backgroundProcess.scheduleProcess(async () => {
        const { totalChanges } = await services.cloudSync.runContinuousSync()

        return { newData: totalChanges > 0 }
    })
}

export const setupFirebaseAuth: ServiceStarter<'auth'> = async ({
    services,
}) => {
    // iOS only: Set up Firebase to store auth state in shared iOS group space,
    //  allowing both the share ext + main app to share logged-in state automatically.
    await services.auth.useiOSAccessGroup(`${appIdPrefix}.${appGroup}`)

    if (await services.auth.getCurrentUser()) {
        console.log('FB: LOGGED IN')
        return
    }

    console.log('FB: NOT LOGGED IN')
}
