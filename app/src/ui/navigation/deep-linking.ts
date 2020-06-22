import { NavigationProps } from '../types'
import { NAV_PARAMS } from './constants'
import { ReaderNavigationParams } from 'src/features/reader/ui/screens/reader/types'

export interface DeepLinkParams {
    routeName: string
    routeParam: string
}

export function deriveParams(link: string): DeepLinkParams {
    const route = link.replace(/.*?:\/\//g, '')
    const matchResult = route.match(/\/([\w./?=&#@()+_\-,]+)\/?$/)

    if (!matchResult) {
        throw new Error(`Cannot extract route params from deep link: ${link}`)
    }

    // TODO: allow multiple params to be sent
    const routeParam = matchResult[1]
    const [routeName] = route.split('/')

    return { routeName, routeParam }
}

export function handleDeepLinkNav(args: { link: string } & NavigationProps) {
    const { routeName, routeParam } = deriveParams(args.link)

    console.log('DEEP LINK ROUTE:', routeName)
    console.log('DEEP LINK PARAM:', routeParam)

    const { navigate } = args.navigation

    switch (routeName) {
        case 'reader':
            navigate('Reader', {
                [NAV_PARAMS.READER]: {
                    url: routeParam,
                } as ReaderNavigationParams,
            })
            break
        default:
    }
}
