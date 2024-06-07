import { NativeScrollEvent } from 'react-native'

export function isAtBottom(
    { contentOffset, contentSize, layoutMeasurement }: NativeScrollEvent,
    bottomOffset = 0,
): boolean {
    return (
        layoutMeasurement.height + contentOffset.y >=
        contentSize.height - bottomOffset
    )
}

export function isAtTop(
    { contentOffset }: NativeScrollEvent,
    topOffset = 0,
): boolean {
    return contentOffset.y <= topOffset
}
