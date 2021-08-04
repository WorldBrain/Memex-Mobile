import expect from 'expect'

import { storageKeys } from '../../../../../../app.json'
import Logic, { State, Event } from './logic'
import { makeStorageTestFactory } from 'src/index.tests'
import { FakeStatefulUIElement } from 'src/ui/index.tests'
import { StorageService } from 'src/services/settings-storage/index'
import { MockSettingsStorage } from 'src/features/settings/storage/mock-storage'
import { FakeNavigation } from 'src/tests/navigation'
import { Services } from 'src/services/types'
import { Storage } from 'src/storage/types'

describe('settings menu UI logic tests', () => {
    const it = makeStorageTestFactory()

    async function setup(options: {
        services: Services
        storage: Storage
        syncError?: () => string | undefined
    }) {
        const logic = new Logic({
            services: {
                ...options.services,
                localStorage:
                    options.services.localStorage ??
                    new StorageService({
                        settingsStorage: new MockSettingsStorage(),
                    }),
                errorTracker: { track: () => undefined } as any,
                cloudSync: {
                    runContinuousSync: async () => {
                        const syncError = options.syncError?.()
                        if (syncError != null) {
                            throw new Error(syncError)
                        }
                        return { totalChanges: 0 }
                    },
                    runInitialSync: async () => {},
                },
            },
            navigation: new FakeNavigation() as any,
            route: { key: 'SettingsMenu', name: 'SettingsMenu' },
        })
        const initialState = logic.getInitialState()
        const element = new FakeStatefulUIElement<State, Event>(logic)

        return { logic, initialState, element }
    }

    it('should init with correct logged in state + ', async (context) => {
        const localStorage = new StorageService({
            settingsStorage: new MockSettingsStorage(),
        })
        await localStorage.set(storageKeys.syncKey, true)

        const { element: element1 } = await setup({
            ...context,
            services: {
                ...context.services,
                localStorage,
                auth: { getCurrentUser: async () => null } as any,
            },
        })

        expect(element1.state.isSynced).toBe(false)
        expect(element1.state.isLoggedIn).toBe(false)
        await element1.init()
        expect(element1.state.isLoggedIn).toBe(false)
        expect(element1.state.isSynced).toBe(true)

        await localStorage.set(storageKeys.syncKey, false)
        const { element: element2 } = await setup({
            ...context,
            services: {
                ...context.services,
                localStorage,
                auth: {
                    getCurrentUser: async () => ({ displayName: 'jon' } as any),
                },
            },
        })

        expect(element2.state.isLoggedIn).toBe(false)
        expect(element1.state.isLoggedIn).toBe(false)
        await element2.init()
        expect(element2.state.isLoggedIn).toBe(true)
        expect(element1.state.isLoggedIn).toBe(false)
    })

    it('should be able to log out ', async (context) => {
        const { element } = await setup({
            ...context,
            services: {
                ...context.services,
                auth: {
                    signOut: () => undefined,
                    getCurrentUser: async () => ({ displayName: 'jon' } as any),
                },
            },
        })

        expect(element.state.isLoggedIn).toBe(false)
        await element.init()
        expect(element.state.isLoggedIn).toBe(true)

        await element.processEvent('logout')
        expect(element.state.isLoggedIn).toBe(false)
    })

    it('should show error view if sync error encountered', async (context) => {
        const errMsg = 'this is a test'

        const { element } = await setup({
            ...context,
            syncError: () => errMsg,
        })

        expect(element.state.syncErrorMessage).toBeUndefined()
        await element.processEvent('syncNow', null)
        expect(element.state.syncErrorMessage).toEqual(errMsg)
    })

    it('should clear error message state if retry sync is succesfull', async (context) => {
        const errMsg = 'this is a test'
        let shouldFail = true

        const { element } = await setup({
            ...context,
            syncError: () => (shouldFail ? errMsg : undefined),
        })

        expect(element.state.syncErrorMessage).toBeUndefined()
        await element.processEvent('syncNow', null)
        expect(element.state.syncErrorMessage).toEqual(errMsg)

        shouldFail = false
        await element.processEvent('syncNow', null)
        expect(element.state.syncErrorMessage).toBeUndefined()
    })

    it('should update error message state if retry sync is unssuccesfull', async (context) => {
        let errMsg = 'this is a test'

        const { element } = await setup({
            ...context,
            syncError: () => errMsg,
        })

        expect(element.state.syncErrorMessage).toBeUndefined()
        await element.processEvent('syncNow', null)
        expect(element.state.syncErrorMessage).toEqual(errMsg)

        errMsg = 'this is another test'
        await element.processEvent('syncNow', null)
        expect(element.state.syncErrorMessage).toEqual(errMsg)
    })
})
