import { storageKeys } from '../../../../../../app.json'
import OnboardingScreenLogic, { Event, State } from './logic'
import { makeStorageTestFactory } from 'src/index.tests'
import type { TestDevice } from 'src/types.tests'
import { TestLogicContainer } from 'src/tests/ui-logic'

const it = makeStorageTestFactory()

describe('onboarding UI logic tests', () => {
    function setup(context: TestDevice) {
        const logic = new OnboardingScreenLogic({
            ...context,
            navigation: context.navigation as any,
        })
        const logicContainer = new TestLogicContainer<State, Event>(logic)

        return { logicContainer }
    }

    it(
        'should do the whole onboarding flow correctly for a new user',
        { skipSyncTests: true },
        async (context) => {
            const { logicContainer } = setup(context)
            const {
                navigation,
                services: { localStorage },
            } = context

            await localStorage.set(storageKeys.showOnboarding, true)

            await logicContainer.processEvent('init', undefined)
            expect(await localStorage.get(storageKeys.syncKey)).toBeFalsy()

            expect(logicContainer.state).toEqual({
                isExistingUser: false,
                onboardingStage: 0,
            })

            await logicContainer.processEvent('goToNextStage', null)
            expect(logicContainer.state).toEqual({
                isExistingUser: false,
                onboardingStage: 1,
            })
            await logicContainer.processEvent('goToNextStage', null)
            expect(logicContainer.state).toEqual({
                isExistingUser: false,
                onboardingStage: 2,
            })

            expect(await localStorage.get(storageKeys.showOnboarding)).toEqual(
                true,
            )
            await logicContainer.processEvent('goToNextStage', null)
            expect(await localStorage.get(storageKeys.showOnboarding)).toEqual(
                false,
            )
            expect(navigation.popRequests()).toEqual([
                { type: 'navigate', target: 'CloudSync' },
            ])
        },
    )

    it(
        'should do the whole onboarding flow correctly for an existing user',
        { skipSyncTests: true },
        async (context) => {
            const { logicContainer } = setup(context)
            const {
                navigation,
                services: { localStorage },
            } = context

            // Set the sync key so that onboarding detects an existing user
            await localStorage.set(storageKeys.syncKey, true)
            await logicContainer.processEvent('init', undefined)
            expect(await localStorage.get(storageKeys.syncKey)).toBe(true)

            expect(logicContainer.state).toEqual({
                isExistingUser: true,
                onboardingStage: 0,
            })

            await logicContainer.processEvent('goToNextStage', null)
            expect(logicContainer.state).toEqual({
                isExistingUser: true,
                onboardingStage: 1,
            })

            expect(await localStorage.get(storageKeys.showOnboarding)).toEqual(
                null,
            )
            await logicContainer.processEvent('goToNextStage', null)
            expect(navigation.popRequests()).toEqual([
                { type: 'navigate', target: 'CloudSync' },
            ])
            expect(await localStorage.get(storageKeys.showOnboarding)).toEqual(
                false,
            )
        },
    )
})
