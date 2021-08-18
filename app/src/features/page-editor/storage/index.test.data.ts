import { Note } from '../types'
import { Page } from 'src/features/overview/types'

export const pages: Omit<Page, 'domain' | 'hostname' | 'pageUrl'>[] = [
    {
        url: 'test.com',
        fullUrl: 'https://test.com',
        text: '',
        fullTitle: 'test page',
    },
    {
        url: 'test.com/page1',
        fullUrl: 'https://test.com/page1',
        text: '',
        fullTitle: 'test page 1',
    },
    {
        url: 'info.test.com/page1',
        fullUrl: 'https://info.test.com/page1',
        text: '',
        fullTitle: 'test page 1 info',
    },
]

export const notes: Note[] = [
    {
        url: 'test.com/#111',
        pageUrl: 'test.com',
        pageTitle: pages[0].fullTitle,
        body: 'this is some highlighted text from the page',
        selector: {},
    },
    {
        url: 'test.com/#112',
        pageUrl: 'test.com',
        pageTitle: pages[0].fullTitle,
        body:
            'this is some other highlighted text from the page with different terms',
        selector: {},
        comment: 'this is a comment written by a user',
    },
    {
        url: 'test.com/#113',
        pageUrl: 'test.com',
        pageTitle: pages[0].fullTitle,
        comment: 'this is a different comment written by a user',
    },
    {
        url: 'test.com/page1/#111',
        pageUrl: 'test.com/page1',
        pageTitle: pages[1].fullTitle,
        comment: 'writing tests is important',
    },
    {
        url: 'test.com/page1/#112',
        pageUrl: 'test.com/page1',
        pageTitle: pages[1].fullTitle,
        body: 'test page lorem ipsum',
    },
    {
        url: 'info.test.com/page1/#112',
        pageUrl: 'info.test.com/page1',
        pageTitle: pages[2].fullTitle,
        comment: 'no highlights on this page',
    },
]
