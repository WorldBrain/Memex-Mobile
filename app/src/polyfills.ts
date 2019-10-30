const textEncoding = require('text-encoder-lite')
;(global as any).TextEncoder = textEncoding.TextEncoderLite
;(global as any).TextDecoder = textEncoding.TextDecoderLite

export default {} // we have to export something to shut up TypeScript
