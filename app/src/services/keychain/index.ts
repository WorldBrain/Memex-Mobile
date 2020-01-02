import { KeychainPackageAPI, KeychainAPI, Login } from './types'

export interface Props {
    keychain: KeychainPackageAPI
}

export class KeychainService implements KeychainAPI {
    constructor(private props: Props) {}

    async setLogin({ username, password }: Login) {
        return this.props.keychain.setGenericPassword(username, password)
    }

    async getLogin() {
        const result = await this.props.keychain.getGenericPassword()

        if (result === false) {
            return null
        }

        return { username: result.username, password: result.password }
    }

    async resetLogin() {
        return this.props.keychain.resetGenericPassword()
    }
}
