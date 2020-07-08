import expect from 'expect'

import Logic, { State, Event } from './logic'
import { makeStorageTestFactory } from 'src/index.tests'
import { FakeStatefulUIElement } from 'src/ui/index.tests'
import { LocalStorageService } from 'src/services/local-storage/index'
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
                localStorage: new LocalStorageService({
                    settingsStorage: new MockSettingsStorage(),
                }),
                sync: {
                    ...options.services.sync,
                    continuousSync: {
                        ...options.services.sync.continuousSync,
                        forceIncrementalSync: async () => {
                            if (options.syncError && options.syncError()) {
                                options.services.sync.continuousSync.events.emit(
                                    'syncFinished',
                                    {
                                        hasChanges: false,
                                        error: new Error(options.syncError()),
                                    },
                                )
                            } else {
                                options.services.sync.continuousSync.events.emit(
                                    'syncFinished',
                                    { hasChanges: true },
                                )
                                return options.services.sync.continuousSync.forceIncrementalSync()
                            }
                        },
                    },
                },
                errorTracker: { track: () => undefined },
            } as any,
            navigation: new FakeNavigation() as any,
        })
        const initialState = logic.getInitialState()
        const element = new FakeStatefulUIElement<State, Event>(logic)

        return { logic, initialState, element }
    }

    it('should show error view if sync error encountered', async context => {
        const errMsg = 'this is a test'

        const { element } = await setup({
            ...context,
            syncError: () => errMsg,
        })

        expect(element.state.syncErrorMessage).toBeUndefined()
        await element.processEvent('syncNow', null)
        expect(element.state.syncErrorMessage).toEqual(errMsg)
    })

    it('should clear error message state if retry sync is succesfull', async context => {
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

    it('should update error message state if retry sync is unssuccesfull', async context => {
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
