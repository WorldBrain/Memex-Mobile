import { KeychainPackageAPI, Login } from './types'

export class MockKeychainPackage implements KeychainPackageAPI {
    login: Login | null = null

    async getGenericPassword(opts: any) {
        if (this.login == null) {
            return false
        }

        return { ...this.login, service: '' }
    }

    async setGenericPassword(username: string, password: string) {
        if (this.login != null) {
            return false
        }

        this.login = { username, password }
        return true
    }

    async resetGenericPassword() {
        if (this.login == null) {
            return false
        }

        this.login = null
        return true
    }
}
