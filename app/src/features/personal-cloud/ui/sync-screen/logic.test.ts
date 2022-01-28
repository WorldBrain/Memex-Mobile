import expect from 'expect'

import { storageKeys } from '../../../../../app.json'
import Logic, { State, Event } from './logic'
import { makeStorageTestFactory } from 'src/index.tests'
import { FakeStatefulUIElement } from 'src/ui/index.tests'
import type { TestDevice } from 'src/types.tests'
import { FakeRoute } from 'src/tests/navigation'
import * as DATA from './logic.test.data'
import { USER_DATA_COLLECTIONS } from 'src/storage/utils'
import StorageManager from '@worldbrain/storex'

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
            const { localStorage, keepAwake } = context.services

            expect(await localStorage.get(storageKeys.syncKey)).toEqual(null)
            expect(isSynced).toBe(false)

            expect(keepAwake.isActive).toBe(false)
            expect(element.state.syncState).toEqual('pristine')
            const syncP = element.init()
            expect(keepAwake.isActive).toBe(true)
            expect(element.state.syncState).toEqual('running')

            await syncP

            expect(keepAwake.isActive).toBe(false)
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
            const { keepAwake } = context.services

            expect(keepAwake.isActive).toBe(false)
            expect(element.state.errorMessage).toEqual(null)
            expect(element.state.syncState).toEqual('pristine')

            const syncP = element.init()

            expect(keepAwake.isActive).toBe(true)
            expect(element.state.syncState).toEqual('running')
            await syncP

            expect(keepAwake.isActive).toBe(false)
            expect(element.state.errorMessage).toEqual(errMsg)
            expect(element.state.syncState).toEqual('error')
        },
    )

    it(
        'should wipe DB first if route param flag set',
        { skipSyncTests: true },
        async (context) => {
            context.route = new FakeRoute({ shouldWipeDBFirst: true }) as any
            const { element } = setup(context)
            await insertTestData(context.storage.manager)
            await assertTestData(context.storage.manager, { exists: true })

            await element.init()

            await assertTestData(context.storage.manager, { exists: false })
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
            await insertTestData(context.storage.manager)
            await assertTestData(context.storage.manager, { exists: true })

            expect(isDBWiped).toBe(false)
            await element.init()
            expect(isDBWiped).toBe(false)

            await assertTestData(context.storage.manager, { exists: true })
        },
    )
})

async function insertTestData(storageManager: StorageManager) {
    await storageManager.collection('pages').createObject(DATA.PAGE_1)

    await storageManager
        .collection('annotations')
        .createObject(DATA.ANNOTATION_1)

    for (const name of DATA.TAGS_1) {
        await storageManager
            .collection('tags')
            .createObject({ url: DATA.PAGE_1.url, name })
        await storageManager
            .collection('tags')
            .createObject({ url: DATA.ANNOTATION_1.url, name })
    }
}

async function assertTestData(
    storageManager: StorageManager,
    { exists }: { exists: boolean },
) {
    expect(await storageManager.collection('pages').findAllObjects({})).toEqual(
        !exists ? [] : [DATA.PAGE_1],
    )

    expect(
        await storageManager.collection('annotations').findAllObjects({}),
    ).toEqual(!exists ? [] : [DATA.ANNOTATION_1])

    expect(await storageManager.collection('tags').findAllObjects({})).toEqual(
        !exists
            ? []
            : expect.arrayContaining(
                  DATA.TAGS_1.flatMap((name) => [
                      { name, url: DATA.PAGE_1.url },
                      { name, url: DATA.ANNOTATION_1.url },
                  ]),
              ),
    )
}
