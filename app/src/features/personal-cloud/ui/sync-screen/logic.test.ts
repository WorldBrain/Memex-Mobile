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
import type { AppStateStatus, AppStateStatic } from 'react-native'
import { CloudSyncService } from 'src/services/cloud-sync'

describe('cloud sync UI logic tests', () => {
    const it = makeStorageTestFactory()

    function setup(context: TestDevice) {
        let appStateListener: (nextState: AppStateStatus) => Promise<void>
        const appStateEmitter = {
            emit: (nextState: AppStateStatus) => appStateListener?.(nextState),
        }
        const appState = {
            addEventListener: (
                type: string,
                listener: (nextState: AppStateStatus) => Promise<void>,
            ) => {
                appStateListener = listener
            },
            removeEventListener: (
                type: string,
                listener: (nextState: AppStateStatus) => Promise<void>,
            ) => {},
        } as AppStateStatic

        const logic = new Logic({
            ...context,
            navigation: context.navigation as any,
            appState,
        })
        const element = new FakeStatefulUIElement<State, Event>(logic)

        return { logic, element, appStateEmitter }
    }

    it(
        'should trigger sync on init, setting init+retro sync flags when done',
        { skipSyncTests: true },
        async (context) => {
            let initSyncDone = false
            let retroSyncDone = false
            context.services.cloudSync.retrospectiveSync = async () => {
                retroSyncDone = true
            }
            context.services.cloudSync.syncStream = async () => {
                initSyncDone = true
            }
            const { element } = setup(context)
            const { localStorage, keepAwake } = context.services

            expect(await localStorage.get(storageKeys.initSyncFlag)).toEqual(
                null,
            )
            expect(await localStorage.get(storageKeys.retroSyncFlag)).toEqual(
                null,
            )
            expect(initSyncDone).toBe(false)
            expect(retroSyncDone).toBe(false)

            expect(keepAwake.isActive).toBe(false)
            expect(element.state.syncState).toEqual('pristine')
            const syncP = element.init()
            expect(keepAwake.isActive).toBe(true)
            expect(element.state.syncState).toEqual('running')

            await syncP

            expect(keepAwake.isActive).toBe(false)
            expect(element.state.syncState).toEqual('done')
            expect(initSyncDone).toBe(true)
            expect(retroSyncDone).toBe(false)

            expect(await localStorage.get(storageKeys.initSyncFlag)).toEqual(
                true,
            )
            expect(await localStorage.get(storageKeys.retroSyncFlag)).toEqual(
                true,
            )
        },
    )

    it(
        'should trigger retrospective sync on init, if route flag set, setting retrospective sync flag when done, leaving init sync flag',
        { skipSyncTests: true },
        async (context) => {
            context.route = new FakeRoute({
                shouldRetrospectiveSync: true,
            }) as any
            let initSyncDone = false
            let retroSyncDone = false
            context.services.cloudSync.retrospectiveSync = async () => {
                retroSyncDone = true
            }
            context.services.cloudSync.syncStream = async () => {
                initSyncDone = true
            }
            const { element } = setup(context)
            const { localStorage, keepAwake } = context.services

            expect(await localStorage.get(storageKeys.initSyncFlag)).toEqual(
                null,
            )
            expect(initSyncDone).toBe(false)
            expect(retroSyncDone).toBe(false)

            expect(keepAwake.isActive).toBe(false)
            expect(element.state.syncState).toEqual('pristine')
            const syncP = element.init()
            expect(keepAwake.isActive).toBe(true)
            expect(element.state.syncState).toEqual('running')

            await syncP

            expect(keepAwake.isActive).toBe(false)
            expect(element.state.syncState).toEqual('done')
            expect(initSyncDone).toBe(false)
            expect(retroSyncDone).toBe(true)

            expect(await localStorage.get(storageKeys.initSyncFlag)).toEqual(
                null,
            )
            expect(await localStorage.get(storageKeys.retroSyncFlag)).toEqual(
                true,
            )
        },
    )

    it(
        'should set sync error state on sync failure',
        { skipSyncTests: true },
        async (context) => {
            const errMsg = 'error test'
            context.services.cloudSync.syncStream = async () => {
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
            context.services.cloudSync.syncStream = async () => {}
            context.route = new FakeRoute({ shouldWipeDBFirst: true }) as any
            const { element } = setup(context)
            await context.storage.modules.localSettings.setSetting({
                key: storageKeys.syncLastProcessedTime,
                value: 4352,
            })
            const cloudSyncService = context.services
                .cloudSync as CloudSyncService
            cloudSyncService['_modifyStats']({
                pendingDownloads: 10,
                totalDownloads: 10,
            })

            await insertTestData(context.storage.manager)
            await assertTestData(context.storage.manager, { exists: true })
            expect(
                await context.storage.modules.localSettings.getSetting({
                    key: storageKeys.syncLastProcessedTime,
                }),
            ).not.toEqual(0)
            expect(cloudSyncService['stats']).toEqual({
                pendingDownloads: 10,
                totalDownloads: 10,
            })

            await element.init()

            await assertTestData(context.storage.manager, { exists: false })
            expect(
                await context.storage.modules.localSettings.getSetting({
                    key: storageKeys.syncLastProcessedTime,
                }),
            ).toEqual(0)
            expect(cloudSyncService['stats']).toEqual({
                pendingDownloads: null,
                totalDownloads: null,
            })
        },
    )

    it(
        'should wipe DB first if route param flag set but NOT if sync invoked a second time',
        { skipSyncTests: true },
        async (context) => {
            context.services.cloudSync.syncStream = async () => {}
            let dbWipeCount = 0
            context.services.cloudSync.____wipeDBForSync = async () => {
                dbWipeCount += 1
            }

            context.route = new FakeRoute({ shouldWipeDBFirst: true }) as any
            const { element, logic, appStateEmitter } = setup(context)
            expect(dbWipeCount).toBe(0)

            await element.init()
            expect(dbWipeCount).toBe(1)

            // Re-trigger sync, as if user switched away then back to app
            logic['syncHasFinished'] = false
            await appStateEmitter.emit('active')
            expect(dbWipeCount).toBe(1)
        },
    )

    it(
        'should NOT wipe DB first if route param flag NOT set',
        { skipSyncTests: true },
        async (context) => {
            let isDBWiped = false
            context.services.cloudSync.syncStream = async () => {}
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

    it(
        'should interrupt and restart sync on app state change (app switching)',
        { skipSyncTests: true },
        async (context) => {
            let syncStartCount = 0
            let syncStopCount = 0
            let resolveP: () => void = () => {}

            context.services.cloudSync.syncStream = async () => {
                syncStartCount += 1
                await new Promise((resolve) => {
                    resolveP = resolve
                })
            }
            context.services.cloudSync.interruptSyncStream = async () => {
                syncStopCount += 1
            }

            const { element, logic, appStateEmitter } = setup(context)

            expect(syncStartCount).toBe(0)
            expect(syncStopCount).toBe(0)
            expect(logic['syncHasFinished']).toBe(false)

            element.init()

            expect(syncStartCount).toBe(1)
            expect(syncStopCount).toBe(0)
            expect(logic['syncHasFinished']).toBe(false)

            await appStateEmitter.emit('background')
            resolveP()

            expect(syncStartCount).toBe(1)
            expect(syncStopCount).toBe(1)
            expect(logic['syncHasFinished']).toBe(false)

            appStateEmitter.emit('active')

            expect(syncStartCount).toBe(2)
            expect(syncStopCount).toBe(1)
            expect(logic['syncHasFinished']).toBe(false)

            await appStateEmitter.emit('background')
            resolveP()

            expect(syncStartCount).toBe(2)
            expect(syncStopCount).toBe(2)
            expect(logic['syncHasFinished']).toBe(false)

            const finalP = appStateEmitter.emit('active')
            resolveP()
            await finalP

            expect(syncStartCount).toBe(3)
            expect(syncStopCount).toBe(2)
            expect(logic['syncHasFinished']).toBe(true)
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
