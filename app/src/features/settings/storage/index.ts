import {
    StorageModule,
    StorageModuleConfig,
    StorageModuleConstructorArgs,
} from '@worldbrain/storex-pattern-modules'
import { SettableSettings } from '../types'

export interface Props extends StorageModuleConstructorArgs {
    collectionName: 'settings' | 'localSettings'
    collectionVersion: Date
}

export class SettingsStorage extends StorageModule implements SettableSettings {
    static SYNC_SETTINGS_COLL_NAME: Props['collectionName'] = 'settings'
    static LOCAL_SETTINGS_COLL_NAME: Props['collectionName'] = 'localSettings'

    constructor(private props: Props) {
        super(props)
    }

    getConfig(): StorageModuleConfig {
        return {
            collections: {
                [this.props.collectionName]: {
                    version: this.props.collectionVersion,
                    fields: {
                        key: { type: 'string' },
                        value: { type: 'json', optional: true },
                    },
                    indices: [{ field: 'key', pk: true }],
                },
            },
            operations: {
                getSetting: {
                    operation: 'findObject',
                    collection: this.props.collectionName,
                    args: { key: '$key:string' },
                },
                createSetting: {
                    operation: 'createObject',
                    collection: this.props.collectionName,
                    args: { key: '$key:string', value: '$value:any' },
                },
                updateSetting: {
                    operation: 'updateObject',
                    collection: this.props.collectionName,
                    args: [{ key: '$key:string' }, { value: '$value:any' }],
                },
                deleteSetting: {
                    operation: 'deleteObjects',
                    collection: this.props.collectionName,
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
