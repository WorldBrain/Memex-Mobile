import type { State } from './types'
import { areArrayContentsEqual } from 'src/utils/are-arrays-the-same'
import Device from 'react-native-device-detection'
import { Dimensions } from 'react-native'

export const initValues: Pick<State, 'isStarred' | 'spacesToAdd'> = {
    isStarred: false,
    spacesToAdd: [],
}

export function isInputDirty({
    noteText,
    isStarred,
    spacesToAdd,
}: State): boolean {
    return (
        noteText.trim().length > 0 ||
        isStarred !== initValues.isStarred ||
        !areArrayContentsEqual(spacesToAdd, initValues.spacesToAdd)
    )
}

export type DeviceDetails = {
    pixelDensity: number
    width: number
    height: number
    heightWithoutNavigationBar: number
    isIos: boolean
    isAndroid: boolean
    isPhone: boolean
    isTablet: boolean
    isIphoneX: boolean
    deviceOrientation: 'landscape' | 'portrait'
}

export function getDeviceDetails(): DeviceDetails {
    const windowDimensions = Dimensions.get('window')

    const deviceOrientation =
        windowDimensions.width > windowDimensions.height
            ? 'landscape'
            : 'portrait'

    return {
        pixelDensity: Device.pixelDensity,
        width: Device.width,
        height: Device.height,
        heightWithoutNavigationBar: windowDimensions.height,
        isIos: Device.isIos,
        isAndroid: Device.isAndroid,
        isPhone: Device.isPhone,
        isTablet: Device.isTablet,
        isIphoneX: Device.isIphoneX,
        deviceOrientation: deviceOrientation,
    }
}
