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

    async get<T = any>(keyName: string) {
        const storedValue = await this.storageAPI.getItem(keyName)

        if (storedValue == null) {
            return null
        }

        let returnValue: T
        try {
            returnValue = JSON.parse(storedValue)
        } catch (err) {
            returnValue = storedValue as any
        }

        return returnValue
    }

    async set<T = any>(keyName: string, value: T) {
        const valueToStore = JSON.stringify(value)

        return this.storageAPI.setItem(keyName, valueToStore)
    }
}
