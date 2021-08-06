import expect from 'expect'

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

    it('should be able to toggle login/signup mode', async (context) => {
        const { element } = setup(context)

        expect(element.state.mode).toEqual('login')
        await element.processEvent('toggleMode', null)
        expect(element.state.mode).toEqual('signup')
        await element.processEvent('toggleMode', null)
        expect(element.state.mode).toEqual('login')
        await element.processEvent('toggleMode', null)
        expect(element.state.mode).toEqual('signup')
    })

    it('should be able to change email input value', async (context) => {
        const { element } = setup(context)
        const testEmail = 'test@test.com'

        expect(element.state.emailInputValue).toEqual('')

        for (let i = 0; i < testEmail.length; i++) {
            const emailSlice = testEmail.slice(0, i)
            element.processEvent('changeEmailInput', { value: emailSlice })
            expect(element.state.emailInputValue).toEqual(emailSlice)
        }
    })

    it('should be able to change password input value', async (context) => {
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

    it('should nav back to prev route on submit success, if route param not specified', async (context) => {
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

    it('should nav to particular route on submit success, if route param specified', async (context) => {
        const nextRoute = 'CloudSync'
        const { element } = setup({
            ...context,
            route: { ...context.route, params: { nextRoute } },
        })

        expect(context.navigation.popRequests()).toEqual([])

        element.processEvent('changeEmailInput', { value: 'test@test.com' })
        element.processEvent('changePasswordInput', { value: 'password' })

        expect(element.state.loginState).toEqual('pristine')
        const submitP = element.processEvent('submitLogin', null)
        expect(element.state.loginState).toEqual('running')
        await submitP
        expect(element.state.loginState).toEqual('done')

        expect(context.navigation.popRequests()).toEqual([
            { type: 'navigate', target: nextRoute },
        ])
    })

    it('should sign up new account instead of login if mode switched to sign-up form', async (context) => {
        let newAccount = null
        const { element } = setup({
            ...context,
            services: {
                ...context.services,
                auth: {
                    ...context.services.auth,
                    signupWithEmailAndPassword: async (
                        email: string,
                        password: string,
                    ) => {
                        newAccount = { email, password }
                    },
                } as any,
            },
        })

        expect(context.navigation.popRequests()).toEqual([])

        expect(element.state.mode).toEqual('login')
        element.processEvent('toggleMode', null)
        expect(element.state.mode).toEqual('signup')
        element.processEvent('changeEmailInput', { value: 'test@test.com' })
        element.processEvent('changePasswordInput', { value: 'password' })

        expect(element.state.loginState).toEqual('pristine')
        const submitP = element.processEvent('submitLogin', null)
        expect(element.state.loginState).toEqual('running')
        await submitP
        expect(element.state.loginState).toEqual('done')

        expect(context.navigation.popRequests()).toEqual([{ type: 'goBack' }])
    })

    it('should set error state and not navigate on submit failure', async (context) => {
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
