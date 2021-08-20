import expect from 'expect'

import { storageKeys } from '../../../../../app.json'
import Logic, { State, Event } from './logic'
import { makeStorageTestFactory } from 'src/index.tests'
import { FakeStatefulUIElement } from 'src/ui/index.tests'
import type { TestDevice } from 'src/types.tests'
import { FakeRoute } from 'src/tests/navigation'

describe('cloud sync UI logic tests', () => {
    const it = makeStorageTestFactory()

    function setup(context: TestDevice) {
        const logic = new Logic({
            ...context,
            navigation: context.navigation as any,
        })
        const element = new FakeStatefulUIElement<State, Event>(logic)

        return { logic, element }
    }

    it(
        'should trigger sync on init, setting sync key when done',
        { skipSyncTests: true },
        async (context) => {
            let isSynced = false
            context.services.cloudSync.sync = async () => {
                isSynced = true
                return { totalChanges: 1 }
            }
            const { element } = setup(context)
            const { localStorage } = context.services

            expect(await localStorage.get(storageKeys.syncKey)).toEqual(null)
            expect(isSynced).toBe(false)

            expect(element.state.syncState).toEqual('pristine')
            const syncP = element.init()
            expect(element.state.syncState).toEqual('running')

            await syncP

            expect(element.state.syncState).toEqual('done')
            expect(isSynced).toBe(true)

            expect(await localStorage.get(storageKeys.syncKey)).toEqual(true)
        },
    )

    it(
        'should set sync error state on sync failure',
        { skipSyncTests: true },
        async (context) => {
            const errMsg = 'error test'
            context.services.cloudSync.sync = async () => {
                throw new Error(errMsg)
            }
            const { element } = setup(context)

            expect(element.state.errorMessage).toEqual(null)
            expect(element.state.syncState).toEqual('pristine')

            const syncP = element.init()

            expect(element.state.syncState).toEqual('running')
            await syncP

            expect(element.state.errorMessage).toEqual(errMsg)
            expect(element.state.syncState).toEqual('error')
        },
    )

    it(
        'should wipe DB first if route param flag set',
        { skipSyncTests: true },
        async (context) => {
            let isDBWiped = false
            context.services.cloudSync.____wipeDBForSync = async () => {
                isDBWiped = true
            }
            context.route = new FakeRoute({ shouldWipeDBFirst: true }) as any
            const { element } = setup(context)

            expect(isDBWiped).toBe(false)
            await element.init()
            expect(isDBWiped).toBe(true)
        },
    )

    it(
        'should NOT wipe DB first if route param flag NOT set',
        { skipSyncTests: true },
        async (context) => {
            let isDBWiped = false
            context.services.cloudSync.____wipeDBForSync = async () => {
                isDBWiped = true
            }
            const { element } = setup(context)

            expect(isDBWiped).toBe(false)
            await element.init()
            expect(isDBWiped).toBe(false)
        },
    )
})
