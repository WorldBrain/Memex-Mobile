import { storageKeys } from '../../../../../../app.json'
import OnboardingScreenLogic, { Event, State } from './logic'
import { makeStorageTestFactory } from 'src/index.tests'
import type { TestDevice } from 'src/types.tests'
import { TestLogicContainer } from 'src/tests/ui-logic'

const it = makeStorageTestFactory()

describe('onboarding UI logic tests', () => {
    function setup(context: TestDevice, opts?: { redoOnboarding?: boolean }) {
        const logic = new OnboardingScreenLogic({
            ...context,
            navigation: context.navigation as any,
            route: {
                ...context.route,
                params: opts?.redoOnboarding
                    ? { redoOnboarding: true }
                    : undefined,
            },
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

            // Onboarding key should be `true` from initial migration code
            await localStorage.set(storageKeys.showOnboarding, true)

            await logicContainer.processEvent('init', undefined)

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
        'should do the whole onboarding flow correctly for an existing user, updating to the cloud update',
        { skipSyncTests: true },
        async (context) => {
            const { logicContainer } = setup(context)
            const {
                navigation,
                services: { localStorage },
            } = context

            // Onboarding key should be `true` from initial migration code
            await localStorage.set(storageKeys.showOnboarding, true)
            // Set the sync key so that onboarding detects an existing user
            await localStorage.set(storageKeys.syncKey, true)

            await logicContainer.processEvent('init', undefined)

            expect(logicContainer.state).toEqual({
                isExistingUser: true,
                onboardingStage: 0,
            })

            await logicContainer.processEvent('goToNextStage', null)
            expect(logicContainer.state).toEqual({
                isExistingUser: true,
                onboardingStage: 1,
            })

            await logicContainer.processEvent('goToNextStage', null)
            expect(navigation.popRequests()).toEqual([
                { type: 'navigate', target: 'CloudSync' },
            ])
            expect(await localStorage.get(storageKeys.showOnboarding)).toEqual(
                false,
            )
        },
    )

    it(
        'should do the whole onboarding flow correctly for an existing user, redoing onboarding via settings menu',
        { skipSyncTests: true },
        async (context) => {
            const { logicContainer } = setup(context, { redoOnboarding: true })
            const {
                navigation,
                services: { localStorage },
            } = context

            // Onboarding key should be `false` from last time onboarding
            await localStorage.set(storageKeys.showOnboarding, false)
            await localStorage.set(storageKeys.syncKey, true)

            await logicContainer.processEvent('init', undefined)

            expect(logicContainer.state).toEqual({
                isExistingUser: true,
                onboardingStage: 0,
            })

            await logicContainer.processEvent('goToNextStage', null)
            expect(logicContainer.state).toEqual({
                isExistingUser: true,
                onboardingStage: 1,
            })

            await logicContainer.processEvent('goToNextStage', null)
            expect(navigation.popRequests()).toEqual([
                { type: 'navigate', target: 'Dashboard' },
            ])
            expect(await localStorage.get(storageKeys.showOnboarding)).toEqual(
                false,
            )
        },
    )

    it(
        'should nav user straight to login, with nextRoute set to dashboard, if somehow got logged out of app + doing fresh app start',
        { skipSyncTests: true },
        async (context) => {
            const { logicContainer } = setup(context) // NOTE: `redoOnboarding` arg not set here
            const {
                navigation,
                services: { localStorage },
            } = context

            // Onboarding key should be `false` from last time onboarding
            await localStorage.set(storageKeys.showOnboarding, false)
            await localStorage.set(storageKeys.syncKey, true)

            await logicContainer.processEvent('init', undefined)
            expect(navigation.popRequests()).toEqual([
                {
                    type: 'navigate',
                    target: 'Login',
                    params: { nextRoute: 'Dashboard' },
                },
            ])
        },
    )
})
