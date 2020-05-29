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

    it('should be able to change text selection state', async dependencies => {
        const { element } = setup(dependencies)

        const testTextA = 'some text'
        const testTextB = 'some more text'

        expect(element.state.selectedText).toBeUndefined()
        await element.processEvent('setTextSelection', { text: testTextA })
        expect(element.state.selectedText).toEqual(testTextA)
        await element.processEvent('setTextSelection', { text: testTextB })
        expect(element.state.selectedText).toEqual(testTextB)
        await element.processEvent('setTextSelection', { text: '' })
        expect(element.state.selectedText).toBeUndefined()
    })
})
