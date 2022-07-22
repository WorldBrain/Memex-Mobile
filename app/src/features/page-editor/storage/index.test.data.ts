import { Note } from '../types'
import { Page } from 'src/features/overview/types'

export const pages: Omit<Page, 'domain' | 'hostname' | 'pageUrl'>[] = [
    {
        url: 'test.com',
        fullUrl: 'https://test.com',
        text: '',
        fullTitle: 'This is a test page',
        type: 'page',
    },
    {
        url: 'test.com/page1',
        fullUrl: 'https://test.com/page1',
        text: '',
        fullTitle: 'This is yet another test page',
        type: 'page',
    },
    {
        url: 'info.test.com/page1',
        fullUrl: 'https://info.test.com/page1',
        text: '',
        fullTitle: 'This is another test page but on a different subdomain',
        type: 'page',
    },
]

export const notes: Note[] = [
    {
        url: pages[0].url + '/#111',
        pageUrl: pages[0].url,
        pageTitle: pages[0].fullTitle,
        body: 'this is some highlighted text from the page',
        selector: {},
    },
    {
        url: pages[0].url + '/#112',
        pageUrl: pages[0].url,
        pageTitle: pages[0].fullTitle,
        body:
            'this is some other highlighted text from the page with different terms',
        selector: {},
        comment: 'this is a comment written by a user',
    },
    {
        url: pages[0].url + '/#113',
        pageUrl: pages[0].url,
        pageTitle: pages[0].fullTitle,
        comment: 'this is a different comment written by a user',
    },
    {
        url: pages[1].url + '/#111',
        pageUrl: pages[1].url,
        pageTitle: pages[1].fullTitle,
        comment: 'writing tests is important',
    },
    {
        url: pages[1].url + '/#112',
        pageUrl: pages[1].url,
        pageTitle: pages[1].fullTitle,
        body: 'test page lorem ipsum',
    },
    {
        url: pages[2].url + '/#112',
        pageUrl: pages[2].url,
        pageTitle: pages[2].fullTitle,
        comment: 'no highlights on this page',
    },
]
