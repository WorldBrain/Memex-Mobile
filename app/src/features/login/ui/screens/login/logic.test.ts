import expect from 'expect'

import Logic, { State, Event } from './logic'
import { makeStorageTestFactory } from 'src/index.tests'
import { FakeNavigation } from 'src/tests/navigation'
import { Services } from 'src/services/types'
import { FakeStatefulUIElement } from 'src/ui/index.tests'

describe('login UI logic tests', () => {
    const it = makeStorageTestFactory()

    function setup(options: { services: Services; previousRoute?: string }) {
        const navigation = new FakeNavigation()

        const logic = new Logic({
            navigation: navigation as any,
            services: options.services,
            previousRoute: (options.previousRoute as any) ?? 'Overview',
        })
        const element = new FakeStatefulUIElement<State, Event>(logic)

        return { logic, element, navigation }
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

    it('should nav back to prev route on cancel', async context => {
        const previousRoute = 'testRoute'
        const { element, navigation } = setup({ ...context, previousRoute })

        expect(navigation.popRequests()).toEqual([])

        element.processEvent('cancelLogin', null)

        expect(navigation.popRequests()).toEqual([
            { type: 'navigate', target: previousRoute },
        ])
    })

    it('should nav back to prev route on submit success', async context => {
        const previousRoute = 'testRoute'
        const { element, navigation } = setup({ ...context, previousRoute })

        expect(navigation.popRequests()).toEqual([])

        element.processEvent('changeEmailInput', { value: 'test@test.com' })
        element.processEvent('changePasswordInput', { value: 'password' })

        expect(element.state.loginState).toEqual('pristine')
        const submitP = element.processEvent('submitLogin', null)
        expect(element.state.loginState).toEqual('running')
        await submitP
        expect(element.state.loginState).toEqual('done')

        expect(navigation.popRequests()).toEqual([
            { type: 'navigate', target: previousRoute },
        ])
    })

    it('should set error state and not navigate on submit failure', async context => {
        const previousRoute = 'testRoute'
        const { element, navigation } = setup({ ...context, previousRoute })

        expect(navigation.popRequests()).toEqual([])

        element.processEvent('changeEmailInput', { value: 'test@test.com' })
        // NOTE: any password that isn't `password` will fail here
        element.processEvent('changePasswordInput', { value: 'badpw' })

        expect(element.state.loginState).toEqual('pristine')
        const submitP = element.processEvent('submitLogin', null)
        expect(element.state.loginState).toEqual('running')
        await submitP
        expect(element.state.loginState).toEqual('error')

        expect(navigation.popRequests()).toEqual([])
    })
})
