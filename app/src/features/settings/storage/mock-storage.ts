import { SettableSettings } from '../types'

export class MockSettingsStorage implements SettableSettings {
    settings: any = {}

    async setSetting(args: { key: string; value: any }) {
        this.settings[args.key] = args.value
    }

    async getSetting(args: { key: string }) {
        return this.settings[args.key]
    }

    async clearSetting(args: { key: string }) {
        this.settings[args.key] = undefined
    }
}
