import { StorageAPI } from './types'
import { SettableSettings } from 'src/features/settings/types'

export interface Props {
    settingsStorage: SettableSettings
}

export class StorageService implements StorageAPI {
    constructor(private props: Props) {}

    async get<T = any>(key: string) {
        const storedValue = await this.props.settingsStorage.getSetting<T>({
            key,
        })

        if (storedValue == null) {
            return null
        }

        return storedValue
    }

    async set<T = any>(key: string, value: T) {
        return this.props.settingsStorage.setSetting({ key, value })
    }

    async clear(key: string) {
        return this.props.settingsStorage.clearSetting({ key })
    }
}
