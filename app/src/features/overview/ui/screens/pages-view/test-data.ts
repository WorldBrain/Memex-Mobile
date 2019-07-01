import { State } from './logic'

export default (): State => ({
    pages: [
        {
            pageUrl: 'https://test.com',
            titleText: 'This is a test site',
            date: '5 mins ago',
        },
        {
            pageUrl: 'https://test.com/route1',
            titleText: 'This is a test site - route 1',
            date: '15 mins ago',
        },
        {
            pageUrl: 'https://test.com/route2',
            titleText: 'This is a test site - route 2',
            date: 'Today 14:56',
        },
        {
            pageUrl: 'https://test.com/route3',
            titleText: 'This is a test site - route 3',
            date: '5 mins ago',
        },
        {
            pageUrl: 'https://test.com/route4',
            titleText: 'This is a test site - route 4',
            date: '5 mins ago',
        },
        {
            pageUrl: 'https://test.com/route5',
            titleText: 'This is a test site - route 5',
            date: '5 mins ago',
        },
        {
            pageUrl: 'https://test.com/route6',
            titleText: 'This is a test site - route 6',
            date: '5 mins ago',
        },
    ]
})
