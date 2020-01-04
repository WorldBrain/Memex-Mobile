import { ServiceStarter } from './types'

export const setupBackgroundSync: ServiceStarter = async ({ services }) => {
    services.backgroundProcess.scheduleProcess(async () => {
        await services.sync.continuousSync.maybeDoIncrementalSync()

        // TODO: figure out whether the DB was written to (still don't understand how important this is)
        return { newData: true }
    })
}

export const setupFirebaseAuth: ServiceStarter = async ({ services }) => {
    const storedLogin = await services.keychain.getLogin()

    if (storedLogin != null) {
        console.log('SIGNING INTO FIREBASE:', storedLogin)
        await services.auth.loginWithToken(storedLogin.password)
        console.log('...DONE')
    }
}
