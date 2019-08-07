import { Note } from '../types'

export const notes: Note[] = [
    {
        url: 'https://test.com/#111',
        pageUrl: 'test.com',
        pageTitle: 'This is a test page',
        body: 'this is some highlighted text from the page',
    },
    {
        url: 'https://test.com/#112',
        pageUrl: 'test.com',
        pageTitle: 'This is a test page',
        body:
            'this is some other highlighted text from the page with different terms',
        comment: 'this is a comment written by a user',
    },
    {
        url: 'https://test.com/#113',
        pageUrl: 'test.com',
        pageTitle: 'This is a test page',
        comment: 'this is a different comment written by a user',
    },
    {
        url: 'https://test.com/page1#111',
        pageUrl: 'test.com/page1',
        pageTitle: 'This is yet another test page',
        comment: 'writing tests is important',
    },
    {
        url: 'https://test.com/page1#112',
        pageUrl: 'test.com/page1',
        pageTitle: 'This is yet another test page',
        body: 'test page lorem ipsum',
    },
    {
        url: 'https://info.test.com/page1#112',
        pageUrl: 'info.test.com/page1',
        pageTitle: 'This is another test page but on a different subdomain',
        comment: 'no highlights on this page',
    },
]
