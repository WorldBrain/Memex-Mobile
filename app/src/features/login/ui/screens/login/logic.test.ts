import expect from 'expect'

import { storageKeys } from '../../../../../../app.json'
import Logic, { State, Event } from './logic'
import { makeStorageTestFactory, TestDevice } from 'src/index.tests'
import { FakeStatefulUIElement } from 'src/ui/index.tests'

describe('login UI logic tests', () => {
    const it = makeStorageTestFactory()

    function setup(options: TestDevice) {
        const logic = new Logic({
            navigation: options.navigation as any,
            route: options.route as any,
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

    it('should nav back to prev route and set skip sync flag on cancel', async context => {
        const { element } = setup(context)
        const { localStorage } = context.services

        expect(context.navigation.popRequests()).toEqual([])
        expect(await localStorage.get(storageKeys.skipAutoSync)).toBeFalsy()

        await element.processEvent('cancelLogin', null)

        expect(await localStorage.get(storageKeys.skipAutoSync)).toBe(true)
        expect(context.navigation.popRequests()).toEqual([{ type: 'goBack' }])
    })

    it('should nav back to prev route on submit success', async context => {
        const { element } = setup(context)

        expect(context.navigation.popRequests()).toEqual([])

        element.processEvent('changeEmailInput', { value: 'test@test.com' })
        element.processEvent('changePasswordInput', { value: 'password' })

        expect(element.state.loginState).toEqual('pristine')
        const submitP = element.processEvent('submitLogin', null)
        expect(element.state.loginState).toEqual('running')
        await submitP
        expect(element.state.loginState).toEqual('done')

        expect(context.navigation.popRequests()).toEqual([{ type: 'goBack' }])
    })

    it('should set error state and not navigate on submit failure', async context => {
        const { element } = setup(context)

        expect(context.navigation.popRequests()).toEqual([])

        element.processEvent('changeEmailInput', { value: 'test@test.com' })
        // NOTE: any password that isn't `password` will fail here
        element.processEvent('changePasswordInput', { value: 'badpw' })

        expect(element.state.loginState).toEqual('pristine')
        const submitP = element.processEvent('submitLogin', null)
        expect(element.state.loginState).toEqual('running')
        await submitP
        expect(element.state.loginState).toEqual('error')

        expect(context.navigation.popRequests()).toEqual([])
    })
})
