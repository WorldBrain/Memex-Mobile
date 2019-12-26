import {
    StorageModule,
    StorageModuleConfig,
} from '@worldbrain/storex-pattern-modules'
import { SettableSettings } from '../types'

export class SettingsStorage extends StorageModule implements SettableSettings {
    static SETTINGS_COLL_NAME = 'settings'

    getConfig(): StorageModuleConfig {
        return {
            collections: {
                [SettingsStorage.SETTINGS_COLL_NAME]: {
                    version: new Date('2019-12-16'),
                    fields: {
                        settings: { type: 'json' },
                    },
                },
            },
            operations: {
                getSettings: {
                    operation: 'findObject',
                    collection: SettingsStorage.SETTINGS_COLL_NAME,
                    args: {},
                },
                setSettings: {
                    operation: 'updateObject',
                    collection: SettingsStorage.SETTINGS_COLL_NAME,
                    args: [{ id: '$id:pk' }, { settings: '$settings:any' }],
                },
                createSettings: {
                    operation: 'createObject',
                    collection: SettingsStorage.SETTINGS_COLL_NAME,
                },
            },
        }
    }

    async setSetting(args: { key: string; value: any }): Promise<void> {
        const newPair = { [args.key]: args.value }

        const existing = await this.operation('getSettings', {})

        if (!existing) {
            return this.operation('createSettings', { settings: newPair })
        }

        return this.operation('setSettings', {
            id: existing.id,
            settings: { ...existing.settings, ...newPair },
        })
    }

    async getSetting<T = any>(args: { key: string }): Promise<T | null> {
        const existing = await this.operation('getSettings', {})

        if (!existing) {
            return null
        }

        return existing.settings[args.key] as T
    }

    async clearSetting(args: { key: string }): Promise<void> {
        const existing = await this.operation('getSettings', {})

        if (!existing) {
            return
        }

        const { [args.key]: toRemove, ...remainingSettings } = existing.settings

        return this.operation('setSettings', {
            id: existing.id,
            settings: { ...remainingSettings },
        })
    }
}
