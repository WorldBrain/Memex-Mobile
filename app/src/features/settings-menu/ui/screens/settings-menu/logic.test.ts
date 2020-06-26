import expect from 'expect'

import Logic, { State, Event } from './logic'
import { makeStorageTestFactory } from 'src/index.tests'
import { FakeStatefulUIElement } from 'src/ui/index.tests'
import { LocalStorageService } from 'src/services/local-storage/index'
import { MockSettingsStorage } from 'src/features/settings/storage/mock-storage'
import { FakeNavigation } from 'src/tests/navigation'

describe('settings menu UI logic tests', () => {
    const it = makeStorageTestFactory()

    async function setup(options: {
        forceIncrementalSync?: () => Promise<void>
    }) {
        const logic = new Logic({
            services: {
                localStorage: new LocalStorageService({
                    settingsStorage: new MockSettingsStorage(),
                }),
                sync: {
                    continuousSync: {
                        forceIncrementalSync: options.forceIncrementalSync
                            ? options.forceIncrementalSync
                            : () => Promise.resolve(),
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
            forceIncrementalSync: () => Promise.reject(new Error(errMsg)),
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
            forceIncrementalSync: () =>
                shouldFail
                    ? Promise.reject(new Error(errMsg))
                    : Promise.resolve(),
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
            forceIncrementalSync: () => Promise.reject(new Error(errMsg)),
        })

        expect(element.state.syncErrorMessage).toBeUndefined()
        await element.processEvent('syncNow', null)
        expect(element.state.syncErrorMessage).toEqual(errMsg)

        errMsg = 'this is another test'
        await element.processEvent('syncNow', null)
        expect(element.state.syncErrorMessage).toEqual(errMsg)
    })
})
