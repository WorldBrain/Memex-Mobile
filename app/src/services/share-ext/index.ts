import { Platform, Linking } from 'react-native'
import ShareExtension from 'react-native-share-extension'

import type { URLNormalizer } from '@worldbrain/memex-common/lib/url-utils/normalize/types'

import { ShareAPI } from './types'
import { READER_URL, DEEP_LINK_SCHEME } from 'src/ui/navigation/deep-linking'

export interface Props {
    shareAPI?: ShareAPI
    normalizeUrl: URLNormalizer
}

export class ShareExtService {
    private shareAPI: ShareAPI
    private normalizeUrl: URLNormalizer

    constructor({ shareAPI = ShareExtension, normalizeUrl }: Props) {
        this.shareAPI = shareAPI
        this.normalizeUrl = normalizeUrl
    }

    async getSharedUrl(): Promise<string> {
        const text = await this.getSharedText()

        if (!text.startsWith('http')) {
            throw new Error('URL not received')
        }

        return text
    }

    async getSharedText(): Promise<string> {
        const { value } = await this.shareAPI.data()

        if (!value || !value.length) {
            throw new Error('No shared text received')
        }

        return value
    }

    close = () => this.shareAPI.close()

    openAppLink(url: string) {
        const link = DEEP_LINK_SCHEME + url
        if (Platform.OS === 'ios') {
            this.shareAPI.openURL(link)
        } else {
            Linking.openURL(link)
        }
    }
}
