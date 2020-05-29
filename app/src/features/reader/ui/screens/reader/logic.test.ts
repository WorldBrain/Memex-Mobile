import Logic, { State, Event, Props } from './logic'
import { FakeStatefulUIElement } from 'src/ui/index.tests'
import { makeStorageTestFactory } from 'src/index.tests'
import { FakeNavigation } from 'src/tests/navigation'

const TEST_URL_1 = 'https://getmemex.com'

describe('reader screen UI logic tests', () => {
    const it = makeStorageTestFactory()

    function setup(
        options: Omit<Props, 'navigation'> & { navigation: FakeNavigation },
    ) {
        const logic = new Logic({
            ...options,
            navigation: {
                ...options.navigation,
                getParam: () => TEST_URL_1,
            } as any,
        })
        const element = new FakeStatefulUIElement<State, Event>(logic)

        return { element, logic }
    }

    it('should be able to toggle text selection state', async dependencies => {
        const { element } = setup(dependencies)

        expect(element.state.isTextSelected).toBe(false)
        await element.processEvent('toggleTextSelection', null)
        expect(element.state.isTextSelected).toBe(true)
        await element.processEvent('toggleTextSelection', null)
        expect(element.state.isTextSelected).toBe(false)
    })
})
