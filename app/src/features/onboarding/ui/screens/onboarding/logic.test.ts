import { storageKeys } from '../../../../../../app.json'
import { LocalStorageService } from 'src/services/local-storage'
import OnboardingScreenLogic, { Event, State } from './logic'
import { TestLogicContainer } from 'src/tests/ui-logic'
import { FakeNavigation } from 'src/tests/navigation'
import { MockSettingsStorage } from 'src/features/settings/storage/mock-storage'

describe('onboarding UI logic tests', () => {
    function setup() {
        const navigation = new FakeNavigation()
        const localStorage = new LocalStorageService({
            settingsStorage: new MockSettingsStorage(),
        })
        const logic = new OnboardingScreenLogic({
            navigation: navigation as any,
            services: {
                localStorage,
            },
            route: {} as any,
        })
        const logicContainer = new TestLogicContainer<State, Event>(logic)

        return { logicContainer, localStorage, navigation }
    }

    it('should do the whole onboarding flow correctly for a new user', async () => {
        const { logicContainer, localStorage, navigation } = setup()

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

        expect(await localStorage.get(storageKeys.showOnboarding)).toEqual(null)
        await logicContainer.processEvent('goToNextStage', null)
        expect(navigation.popRequests()).toEqual([
            { type: 'navigate', target: 'Sync' },
        ])
        expect(await localStorage.get(storageKeys.showOnboarding)).toEqual(
            false,
        )
    })

    it('should do the whole onboarding flow correctly for an existing user', async () => {
        const { logicContainer, localStorage, navigation } = setup()

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

        expect(await localStorage.get(storageKeys.showOnboarding)).toEqual(null)
        await logicContainer.processEvent('goToNextStage', null)
        expect(navigation.popRequests()).toEqual([
            { type: 'navigate', target: 'Sync' },
        ])
        expect(await localStorage.get(storageKeys.showOnboarding)).toEqual(
            false,
        )
    })
})
