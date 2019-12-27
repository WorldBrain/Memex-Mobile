import expect from 'expect'
import { normalizeUrl } from '@worldbrain/memex-url-utils'

import { makeStorageTestFactory } from 'src/index.tests'

const it = makeStorageTestFactory()

describe('SettingsStorage', () => {
    it('should work', async ({
        storage: {
            modules: { settings },
        },
    }) => {
        expect(await settings.getSetting({ key: 'foo' })).toEqual(null)

        await settings.setSetting({ key: 'foo', value: 'spam' })
        expect(await settings.getSetting({ key: 'foo' })).toEqual('spam')

        await settings.setSetting({ key: 'foo', value: 'eggs' })
        expect(await settings.getSetting({ key: 'foo' })).toEqual('eggs')

        await settings.clearSetting({ key: 'foo' })
        expect(await settings.getSetting({ key: 'foo' })).toEqual(null)
    })
})
