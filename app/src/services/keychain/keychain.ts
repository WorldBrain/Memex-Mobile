import {
    getInternetCredentials,
    setInternetCredentials,
    resetInternetCredentials,
} from 'react-native-keychain'

import { appGroup, appIdPrefix } from '../../../app.json'
import { KeychainAPI, Login } from './types'

export interface Props {
    server: string
    accessGroup?: string
}

export class KeychainPackage implements KeychainAPI {
    constructor(private props: Props) {
        this.props.accessGroup =
            this.props.accessGroup || `${appIdPrefix}.${appGroup}`
    }

    async getLogin() {
        const login = await getInternetCredentials(this.props.server)

        if (login === false) {
            return null
        }

        return { username: login.username, password: login.password }
    }

    async setLogin({ username, password }: Login) {
        return setInternetCredentials(this.props.server, username, password, {
            accessGroup: this.props.accessGroup,
        })
    }

    async resetLogin() {
        return resetInternetCredentials(this.props.server)
    }
}
