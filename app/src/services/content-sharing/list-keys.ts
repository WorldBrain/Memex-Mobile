import AbstractListKeysService from '@worldbrain/memex-common/lib/content-sharing/service/list-keys'
import { getListShareUrl } from '@worldbrain/memex-common/lib/content-sharing/utils'
import type { SharedListReference } from '@worldbrain/memex-common/lib/content-sharing/types'

export default class ListKeysService extends AbstractListKeysService {
    protected getKeyLink(params: {
        listReference: SharedListReference
        keyString?: string
    }): string {
        const link = getListShareUrl({
            remoteListId: params.listReference.id as string,
        })

        return params.keyString ? `${link}?key=${params.keyString}` : link
    }

    hasCurrentKey = () => {
        throw new Error('TODO: Implement me')
    }

    processCurrentKey = async () => {
        throw new Error('TODO: Implement me')
    }
}
