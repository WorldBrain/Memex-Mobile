import { DebugConsole } from './utils/debug-console'

const textEncoding = require('text-encoder-lite')
const originalConsole = console
    // const debugConsole = new DebugConsole(originalConsole)
;(global as any).TextEncoder = textEncoding.TextEncoderLite
;(global as any).TextDecoder = textEncoding.TextDecoderLite
;(global as any).navigator.userAgent = 'React Native'
// ;(global as any).console = debugConsole

export default {} // we have to export something to shut up TypeScript
