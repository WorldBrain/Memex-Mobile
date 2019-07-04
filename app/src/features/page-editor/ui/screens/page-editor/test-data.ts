import { State } from './logic'

export default (): State => ({
    mode: 'tags',
    page: {
        date: '5 mins ago',
        pageUrl: 'https://test.com',
        url: 'https://test.com',
        titleText: 'This is a test page',
    },
})
