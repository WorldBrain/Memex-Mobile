import loadLocalResource from 'react-native-local-resource'

import { SUPPORTED_FILE_EXTS } from './constants'

export interface Props {
    externalFileLoadingFn?: (requiredFile: any) => Promise<string>
    supportedFileExts?: string[]
    requireFn?: (path: string) => any
}

export class ResourceLoaderService {
    constructor(private props: Props) {}

    private get supportedFileExts(): string[] {
        return this.props.supportedFileExts ?? SUPPORTED_FILE_EXTS
    }

    private get require() {
        return this.props.requireFn ?? require
    }

    private get loadResourceFile() {
        return this.props.externalFileLoadingFn ?? loadLocalResource
    }

    private isSupportedType(path: string): boolean {
        for (const ext of this.supportedFileExts) {
            if (path.endsWith(ext)) {
                return true
            }
        }

        return false
    }

    async loadResource(path: string): Promise<string> {
        if (!this.isSupportedType(path)) {
            throw new Error(
                'Unsupported file ext received - please update ResourceLoaderService + `resolver.assetExts` in metro.config.js to support',
            )
        }

        const file = this.require(path)
        return this.loadResourceFile(file)
    }
}
