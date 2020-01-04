import { KeychainAPI, Login } from './types'

export class MockKeychainPackage implements KeychainAPI {
    login: Login | null = null

    async getLogin() {
        if (this.login == null) {
            return null
        }

        return { ...this.login }
    }

    async setLogin({ username, password }: Login) {
        this.login = { username, password }
    }

    async resetLogin() {
        this.login = null
    }
}
