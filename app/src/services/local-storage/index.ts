import { AsyncStorageStatic } from '@react-native-community/async-storage'

import { LocalStorageAPI } from './types'

export interface Props {
    storageAPI: AsyncStorageStatic
}

export class LocalStorageService implements LocalStorageAPI {
    private storageAPI: AsyncStorageStatic

    constructor({ storageAPI }: Props) {
        this.storageAPI = storageAPI
    }

    async get(keyName: string) {
        const value = await this.storageAPI.getItem(keyName)
        return value || null
    }

    async set(keyName: string, value: string) {
        return this.storageAPI.setItem(keyName, value)
    }
}
