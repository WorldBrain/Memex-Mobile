import expect from 'expect'

import { makeStorageTestFactory } from 'src/index.tests'
import { SettingsStorage } from '.'

const it = makeStorageTestFactory()

describe('SyncSettingsStorage', () => {
    it('should work', async ({
        storage: {
            modules: { syncSettings },
        },
    }) => runTests(syncSettings))
})

describe('LocalSettingsStorage', () => {
    it(
        'should work',
        { skipSyncTests: true },
        async ({
            storage: {
                modules: { localSettings },
            },
        }) => runTests(localSettings),
    )
})

async function runTests(settings: SettingsStorage) {
    expect(await settings.getSetting({ key: 'foo' })).toEqual(null)

    await settings.setSetting({ key: 'foo', value: 'spam' })
    expect(await settings.getSetting({ key: 'foo' })).toEqual('spam')

    await settings.setSetting({ key: 'foo', value: 'eggs' })
    expect(await settings.getSetting({ key: 'foo' })).toEqual('eggs')

    await settings.setSetting({ key: 'foo-2', value: 'spam-2' })
    expect(await settings.getSetting({ key: 'foo' })).toEqual('eggs')
    expect(await settings.getSetting({ key: 'foo-2' })).toEqual('spam-2')

    await settings.clearSetting({ key: 'foo' })
    expect(await settings.getSetting({ key: 'foo' })).toEqual(null)
}
