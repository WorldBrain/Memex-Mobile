import {
    getGenericPassword,
    setGenericPassword,
    resetGenericPassword,
} from 'react-native-keychain'

export interface Login {
    username: string
    password: string
}

export interface KeychainAPI {
    resetLogin(): Promise<boolean>
    setLogin(args: Login): Promise<boolean>
    getLogin(): Promise<Login | null>
}

export interface KeychainPackageAPI {
    getGenericPassword: typeof getGenericPassword
    setGenericPassword: typeof setGenericPassword
    resetGenericPassword: typeof resetGenericPassword
}
