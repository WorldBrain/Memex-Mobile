export interface Login {
    username: string
    password: string
}

export interface KeychainAPI {
    getLogin(): Promise<Login | null>
    setLogin(login: Login): Promise<void>
    resetLogin(): Promise<void>
}
