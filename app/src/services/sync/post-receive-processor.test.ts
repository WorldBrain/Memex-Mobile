import { postReceiveProcessor } from './post-receive-processor'
import { SharedSyncLogEntry } from '@worldbrain/storex-sync/lib/shared-sync-log/types'

const faultyPage = {
    url: 'test.com',
    fullUrl: undefined,
    domain: 'test.com',
    hostname: 'test.com',
    text: '',
}

const entries: SharedSyncLogEntry<'deserialized-data'>[] = [
    {
        createdOn: 1,
        sharedOn: 10,
        deviceId: 1,
        userId: 1,
        data: {
            collection: 'pages',
            operation: 'create',
            pk: faultyPage.url,
            value: faultyPage,
            field: null,
        },
    },
    {
        createdOn: 2,
        sharedOn: 10,
        deviceId: 1,
        userId: 1,
        data: {
            collection: 'pages',
            operation: 'modify',
            pk: faultyPage.url,
            value: faultyPage,
            field: null,
        },
    },
]

describe('Sync post-receive processor tests', () => {
    it('should fill in page coll `fullUrl` field with `url` field data if missing', async () => {
        for (const entry of entries) {
            expect(await postReceiveProcessor({ entry })).toEqual({
                entry: {
                    ...entry,
                    data: {
                        ...entry.data,
                        value: { ...faultyPage, fullUrl: faultyPage.url },
                    },
                },
            })
        }
    })
})
