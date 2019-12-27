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
                        key: { type: 'string' },
                        value: { type: 'json', optional: true },
                    },
                    indices: [{ field: ['key'], pk: true }],
                },
            },
            operations: {
                getSetting: {
                    operation: 'findObject',
                    collection: SettingsStorage.SETTINGS_COLL_NAME,
                    args: { key: '$key:string' },
                },
                createSetting: {
                    operation: 'createObject',
                    collection: SettingsStorage.SETTINGS_COLL_NAME,
                    args: { key: '$key:string', value: '$value:any' },
                },
                updateSetting: {
                    operation: 'updateObject',
                    collection: SettingsStorage.SETTINGS_COLL_NAME,
                    args: [{ key: '$key:string' }, { value: '$value:any' }],
                },
                deleteSetting: {
                    operation: 'deleteObjects',
                    collection: SettingsStorage.SETTINGS_COLL_NAME,
                    args: { key: '$key:string' },
                },
            },
        }
    }

    async setSetting(args: { key: string; value: any }): Promise<void> {
        const existing = await this.operation('getSetting', { key: args.key })

        if (!existing) {
            return this.operation('createSetting', args)
        } else {
            return this.operation('updateSetting', args)
        }
    }

    async getSetting<T = any>(args: { key: string }): Promise<T | null> {
        const existing = await this.operation('getSetting', args)

        if (!existing) {
            return null
        }

        return existing.value as T
    }

    async clearSetting(args: { key: string }): Promise<void> {
        await this.operation('deleteSetting', args)
    }
}
