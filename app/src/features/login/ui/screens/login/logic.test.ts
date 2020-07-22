import expect from 'expect'

import Logic, { State, Event } from './logic'
import { makeStorageTestFactory } from 'src/index.tests'
import { FakeNavigation } from 'src/tests/navigation'
import { Services } from 'src/services/types'
import { FakeStatefulUIElement } from 'src/ui/index.tests'

describe('login UI logic tests', () => {
    const it = makeStorageTestFactory()

    function setup(options: { services: Services }) {
        const logic = new Logic({
            navigation: new FakeNavigation() as any,
            services: options.services,
        })
        const element = new FakeStatefulUIElement<State, Event>(logic)

        return { logic, element }
    }

    it('should be able to change email input value', async context => {
        const { element } = setup(context)
        const testEmail = 'test@test.com'

        expect(element.state.emailInputValue).toEqual('')

        for (let i = 0; i < testEmail.length; i++) {
            const emailSlice = testEmail.slice(0, i)
            element.processEvent('changeEmailInput', { value: emailSlice })
            expect(element.state.emailInputValue).toEqual(emailSlice)
        }
    })

    it('should be able to change password input value', async context => {
        const { element } = setup(context)
        const testPassword = 'test1234'

        expect(element.state.passwordInputValue).toEqual('')

        for (let i = 0; i < testPassword.length; i++) {
            const passwordSlice = testPassword.slice(0, i)
            element.processEvent('changePasswordInput', {
                value: passwordSlice,
            })
            expect(element.state.passwordInputValue).toEqual(passwordSlice)
        }
    })
})
