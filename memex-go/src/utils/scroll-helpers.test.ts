import { NativeScrollEvent, NativeScrollSize } from 'react-native'

import * as scrollHelpers from './scroll-helpers'
import { VERTICAL_DATA, VerticalScrollState } from './scroll-helpers.test.data'

function setup(args: VerticalScrollState): { event: NativeScrollEvent } {
    return {
        event: {
            contentOffset: { y: args.offset, x: 100 },
            contentSize: { height: args.contentSize, width: 100 },
            layoutMeasurement: { height: args.layoutSize, width: 100 },
        } as NativeScrollEvent,
    }
}

describe('Scroll helpers', () => {
    it('should detect scrolling to the top of different sized views', () => {
        for (const { isAtBottom, isAtTop, ...scrollState } of VERTICAL_DATA) {
            const { event } = setup(scrollState)

            expect(scrollHelpers.isAtTop(event)).toEqual(isAtTop)
        }
    })

    it('should detect scrolling to the bottom of different sized views', () => {
        for (const { isAtBottom, isAtTop, ...scrollState } of VERTICAL_DATA) {
            const { event } = setup(scrollState)

            expect(scrollHelpers.isAtBottom(event)).toEqual(isAtBottom)
        }
    })
})
