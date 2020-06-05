// Special import: `babel-plugin-inline-import` will replace this with the text
import contentScript from 'dist/content_script_reader.js.txt'

import { ResourceLoaderService } from 'src/services/resource-loader'
import { CONTENT_SCRIPT_PATH } from '../ui/screens/reader/constants'

export type ContentScriptLoader = (
    resourceLoader: ResourceLoaderService,
    contentScriptPath?: string,
) => void

/*
  Handle loading the content-script JS as a string different in dev vs prod.

  - prod: The import at the top of this file is replaced by the string by babel at compile time
        This has a flaw that doesn't make it appropriate for dev, caching the file so changes won't
        be immediately reflected in the running app. See: https://github.com/feats/babel-plugin-inline-import#caveats

  - dev: The ResourceLoaderService serializes the script at runtime
        This assumes the dev environment where we have the source code available. This solution
        does not work in prod.
*/
export const loadContentScript: ContentScriptLoader = (
    resourceLoader: ResourceLoaderService,
    contentScriptPath = CONTENT_SCRIPT_PATH,
) => {
    if (__DEV__) {
        require('dist/content_script_reader.js.txt')
        return resourceLoader.loadResource(contentScriptPath)
    }

    return contentScript
}
