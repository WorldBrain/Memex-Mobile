import { appGroup } from '../../app.json'
import { ServiceStarter } from './types'

export const setupBackgroundSync: ServiceStarter = async ({ services }) => {
    services.backgroundProcess.scheduleProcess(async () => {
        const { token } = await services.auth.getCurrentToken()

        if (token) {
            await services.keychain.setLogin({
                username: appGroup,
                password: token,
            })
        }

        await services.sync.continuousSync.maybeDoIncrementalSync()

        // TODO: figure out whether the DB was written to (still don't understand how important this is)
        return { newData: true }
    })
}

export const setupFirebaseAuth: ServiceStarter = async ({ services }) => {
    if (await services.auth.getCurrentUser()) {
        return
    }

    const storedLogin = await services.keychain.getLogin()

    if (storedLogin != null) {
        await services.auth.loginWithToken(storedLogin.password)
    }
}
