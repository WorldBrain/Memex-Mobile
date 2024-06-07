// import { DebugConsole } from './utils/debug-console'

const textEncoding = require('text-encoder-lite')
    // const originalConsole = console
;(global as any).TextEncoder = textEncoding.TextEncoderLite
;(global as any).TextDecoder = textEncoding.TextDecoderLite
;(global as any).navigator.userAgent = 'React Native'
// ;(global as any).console = new DebugConsole(originalConsole)

export default {} // we have to export something to shut up TypeScript
