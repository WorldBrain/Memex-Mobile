import ShareExtension from 'react-native-share-extension'

import { ShareAPI } from './types'

export interface Props {
    shareAPI?: ShareAPI
}

export class ShareExtService {
    private shareAPI: ShareAPI

    constructor({ shareAPI = ShareExtension }: Props) {
        this.shareAPI = shareAPI
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
}
