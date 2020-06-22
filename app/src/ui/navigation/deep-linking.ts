import { NavigationProps } from '../types'
import { NAV_PARAMS } from './constants'
import { ReaderNavigationParams } from 'src/features/reader/ui/screens/reader/types'

export function handleDeepLink(args: { link: string } & NavigationProps) {
    const route = args.link.replace(/.*?:\/\//g, '')
    const matchResult = route.match(/\/([^\/]+)\/?$/)

    if (!matchResult) {
        throw new Error(
            `Cannot extract route params from deep link: ${args.link}`,
        )
    }

    // TODO: allow multiple params to be sent
    const param = matchResult[1]
    const [routeName] = route.split('/')
    console.log('DEEP LINK ROUTE:', routeName)
    console.log('DEEP LINK PARAM:', param)

    const { navigate } = args.navigation

    switch (routeName) {
        case 'reader':
            navigate('Reader', {
                [NAV_PARAMS.READER]: {
                    url: param,
                } as ReaderNavigationParams,
            })
            break
        default:
    }
}
