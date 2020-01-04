import expect from 'expect'

import { KeychainService } from '.'
import { MockKeychainPackage } from './mock-keychain-package'
import { Login } from './types'

describe('Keychain service tests', () => {
    const testLoginA: Login = { username: 'test', password: 'test1234' }

    async function setupTest() {
        const service = new KeychainService({
            keychain: new MockKeychainPackage(),
        })

        return { service }
    }

    it('should be able to set and get a login', async () => {
        const { service } = await setupTest()

        expect(await service.getLogin()).toBeNull()

        await service.setLogin(testLoginA)
        expect(await service.getLogin()).toEqual(testLoginA)
    })

    it('should be able to reset a set login', async () => {
        const { service } = await setupTest()

        await service.setLogin(testLoginA)
        expect(await service.getLogin()).toEqual(testLoginA)

        await service.resetLogin()
        expect(await service.getLogin()).toBeNull()
    })
})
