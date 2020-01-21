import { KeychainAPI, Login } from './types'

export interface Props {
    keychain: KeychainAPI
}

export class KeychainService implements KeychainAPI {
    constructor(private props: Props) {}

    async setLogin(login: Login) {
        return this.props.keychain.setLogin(login)
    }

    async getLogin() {
        return this.props.keychain.getLogin()
    }

    async resetLogin() {
        return this.props.keychain.resetLogin()
    }
}
