import expect from 'expect'

import { storageKeys } from '../../../../../../app.json'
import Logic, { State, Event } from './logic'
import { makeStorageTestFactory } from 'src/index.tests'
import { FakeStatefulUIElement } from 'src/ui/index.tests'
import type { TestDevice } from 'src/types.tests'
import { TEST_USER } from '@worldbrain/memex-common/lib/authentication/dev'

const TEST_USER_2_EMAIL = 'another-user@test.com'

describe('login UI logic tests', () => {
    const it = makeStorageTestFactory()

    function setup(context: TestDevice) {
        const logic = new Logic({
            ...context,
            navigation: context.navigation as any,
        })
        const element = new FakeStatefulUIElement<State, Event>(logic)

        return { logic, element }
    }

    it(
        'should be able to toggle login/signup mode',
        { skipSyncTests: true },
        async (context) => {
            const { element } = setup(context)

            expect(element.state.mode).toEqual('login')
            await element.processEvent('toggleMode', null)
            expect(element.state.mode).toEqual('signup')
            await element.processEvent('toggleMode', null)
            expect(element.state.mode).toEqual('login')
            await element.processEvent('toggleMode', null)
            expect(element.state.mode).toEqual('signup')
        },
    )

    it(
        'should be able to change email input value',
        { skipSyncTests: true },
        async (context) => {
            const { element } = setup(context)
            const testEmail = TEST_USER.email!

            expect(element.state.emailInputValue).toEqual('')

            for (let i = 0; i < testEmail.length; i++) {
                const emailSlice = testEmail.slice(0, i)
                element.processEvent('changeEmailInput', { value: emailSlice })
                expect(element.state.emailInputValue).toEqual(emailSlice)
            }
        },
    )

    it(
        'should be able to change password input value',
        { skipSyncTests: true },
        async (context) => {
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
        },
    )

    it(
        'should nav back to prev route on submit success, if route param not specified',
        { skipSyncTests: true },
        async (context) => {
            const { localStorage } = context.services
            const { element } = setup(context)

            expect(context.navigation.popRequests()).toEqual([])
            expect(await localStorage.get(storageKeys.mostRecentUser)).toEqual(
                null,
            )

            element.processEvent('changeEmailInput', {
                value: TEST_USER.email!,
            })
            element.processEvent('changePasswordInput', { value: 'password' })

            expect(element.state.loginState).toEqual('pristine')
            const submitP = element.processEvent('submitLogin', null)
            expect(element.state.loginState).toEqual('running')
            await submitP
            expect(element.state.loginState).toEqual('done')

            expect(await localStorage.get(storageKeys.mostRecentUser)).toEqual(
                TEST_USER,
            )
            expect(context.navigation.popRequests()).toEqual([
                { type: 'goBack' },
            ])
        },
    )

    it(
        'should nav to particular route on submit success, if route param specified',
        { skipSyncTests: true },
        async (context) => {
            const nextRoute = 'CloudSync'
            const { localStorage } = context.services
            const { element } = setup({
                ...context,
                route: { ...context.route, params: { nextRoute } },
            })

            expect(context.navigation.popRequests()).toEqual([])
            expect(await localStorage.get(storageKeys.mostRecentUser)).toEqual(
                null,
            )

            element.processEvent('changeEmailInput', {
                value: TEST_USER.email!,
            })
            element.processEvent('changePasswordInput', { value: 'password' })

            expect(element.state.loginState).toEqual('pristine')
            const submitP = element.processEvent('submitLogin', null)
            expect(element.state.loginState).toEqual('running')
            await submitP
            expect(element.state.loginState).toEqual('done')

            expect(await localStorage.get(storageKeys.mostRecentUser)).toEqual(
                TEST_USER,
            )
            expect(context.navigation.popRequests()).toEqual([
                { type: 'navigate', target: nextRoute },
            ])
        },
    )

    it(
        'should sign up new account instead of login if mode switched to sign-up form',
        { skipSyncTests: true },
        async (context) => {
            const { localStorage, auth } = context.services

            let newAccount = null
            auth.signupWithEmailAndPassword = async (
                email: string,
                password: string,
            ) => {
                newAccount = { email, password }
            }

            const { element } = setup({
                ...context,
                services: {
                    ...context.services,
                    auth,
                },
            })

            expect(context.navigation.popRequests()).toEqual([])
            expect(await localStorage.get(storageKeys.mostRecentUser)).toEqual(
                null,
            )

            expect(element.state.mode).toEqual('login')
            element.processEvent('toggleMode', null)
            expect(element.state.mode).toEqual('signup')
            element.processEvent('changeEmailInput', {
                value: TEST_USER.email!,
            })
            element.processEvent('changePasswordInput', { value: 'password' })

            expect(element.state.loginState).toEqual('pristine')
            const submitP = element.processEvent('submitLogin', null)
            expect(element.state.loginState).toEqual('running')
            await submitP
            expect(element.state.loginState).toEqual('done')

            expect(newAccount).toEqual({
                email: TEST_USER.email,
                password: 'password',
            })
            expect(await localStorage.get(storageKeys.mostRecentUser)).toEqual(
                TEST_USER,
            )
            expect(context.navigation.popRequests()).toEqual([
                { type: 'goBack' },
            ])
        },
    )

    it(
        'should set error state and not navigate on submit failure',
        { skipSyncTests: true },
        async (context) => {
            const { element } = setup(context)

            expect(context.navigation.popRequests()).toEqual([])

            element.processEvent('changeEmailInput', {
                value: TEST_USER.email!,
            })
            // NOTE: any password that isn't `password` will fail here
            element.processEvent('changePasswordInput', { value: 'badpw' })

            expect(element.state.loginState).toEqual('pristine')
            const submitP = element.processEvent('submitLogin', null)
            expect(element.state.loginState).toEqual('running')
            await submitP
            expect(element.state.loginState).toEqual('error')

            expect(context.navigation.popRequests()).toEqual([])
        },
    )

    it(
        'on log in of different user to prev logged-in user, should nav to cloud sync with route param set to clear DB',
        { skipSyncTests: true },
        async (context) => {
            const { localStorage } = context.services
            const { element } = setup(context)

            expect(context.navigation.popRequests()).toEqual([])
            expect(await localStorage.get(storageKeys.mostRecentUser)).toEqual(
                null,
            )

            element.processEvent('changeEmailInput', {
                value: TEST_USER.email!,
            })
            element.processEvent('changePasswordInput', { value: 'password' })

            expect(element.state.loginState).toEqual('pristine')
            const submitP = element.processEvent('submitLogin', null)
            expect(element.state.loginState).toEqual('running')
            await submitP
            expect(element.state.loginState).toEqual('done')

            expect(await localStorage.get(storageKeys.mostRecentUser)).toEqual(
                TEST_USER,
            )

            await element.processEvent('changeEmailInput', {
                value: TEST_USER_2_EMAIL,
            })
            await element.processEvent('submitLogin', null)

            expect(await localStorage.get(storageKeys.mostRecentUser)).toEqual({
                ...TEST_USER,
                email: TEST_USER_2_EMAIL,
                id: TEST_USER_2_EMAIL,
            })
            expect(context.navigation.popRequests()).toEqual([
                { type: 'goBack' },
                {
                    type: 'navigate',
                    target: 'CloudSync',
                    params: { shouldWipeDBFirst: true },
                },
            ])
        },
    )
})
