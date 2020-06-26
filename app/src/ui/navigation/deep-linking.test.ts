import { deriveParams, DeepLinkParams } from './deep-linking'

describe('Deep linking tests', () => {
    it('should be able to derive desired params from reader links', () => {
        interface TestCase {
            link: string
            expectedParams: DeepLinkParams
        }

        const testCases: TestCase[] = [
            {
                link: 'memexgo://reader/test.com',
                expectedParams: { routeName: 'reader', routeParam: 'test.com' },
            },
            {
                link: 'memexgo://reader/test.com/route',
                expectedParams: {
                    routeName: 'reader',
                    routeParam: 'test.com/route',
                },
            },
            {
                link: 'memexgo://reader/test.com/route?param1=ok&param2=ok',
                expectedParams: {
                    routeName: 'reader',
                    routeParam: 'test.com/route?param1=ok&param2=ok',
                },
            },
            {
                link: 'memexgo://reader/test.com/@route#',
                expectedParams: {
                    routeName: 'reader',
                    routeParam: 'test.com/@route#',
                },
            },
            {
                link: 'memexgo://reader/test.com/route_(test)',
                expectedParams: {
                    routeName: 'reader',
                    routeParam: 'test.com/route_(test)',
                },
            },
            {
                link: 'memexgo://reader/test.com/route+test',
                expectedParams: {
                    routeName: 'reader',
                    routeParam: 'test.com/route+test',
                },
            },
            {
                link:
                    'memexgo://reader/en.wikipedia.org/wiki/Theater_District,_Manhattan',
                expectedParams: {
                    routeName: 'reader',
                    routeParam:
                        'en.wikipedia.org/wiki/Theater_District,_Manhattan',
                },
            },
            {
                link: 'memexgo://reader/test.com/route/',
                expectedParams: {
                    routeName: 'reader',
                    routeParam: 'test.com/route/',
                },
            },
            {
                link:
                    'memexgo://reader/worldbrain-werwer.sdf.sdf.wer.wr.sdf.io/test',
                expectedParams: {
                    routeName: 'reader',
                    routeParam: 'worldbrain-werwer.sdf.sdf.wer.wr.sdf.io/test',
                },
            },
        ]

        for (const { link, expectedParams } of testCases) {
            expect([link, deriveParams(link)]).toEqual([link, expectedParams])
        }
    })
})
