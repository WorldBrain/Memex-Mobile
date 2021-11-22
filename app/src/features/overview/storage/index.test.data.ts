import { Page } from '../types'
import {
    ContentLocatorType,
    LocationSchemeType,
    ContentLocatorFormat,
} from '@worldbrain/memex-common/lib/personal-cloud/storage/types'

export const pages: Omit<Page, 'domain' | 'hostname' | 'pageUrl'>[] = [
    {
        url: 'test.com',
        fullUrl: 'https://www.test.com',
        fullTitle: 'This is a test page',
        text:
            'Hey there this is some test text with lots of test terms included.',
    },
    {
        url: 'test.com/page1',
        fullUrl: 'https://www.test.com/page1',
        fullTitle: 'This is yet another test page',
        text:
            'Hey there this is some more test text with some new and different test terms included.',
    },
    {
        url: 'info.test.com/page1',
        fullUrl: 'https://info.test.com/page1',
        fullTitle: 'This is another test page but on a different subdomain',
        text:
            'Hey there this is some more test text from this page on a different subdomain.',
    },
    {
        url: 'memex.cloud/ct/test1.pdf',
        fullUrl: 'https://memex.cloud/ct/test1.pdf',
        fullTitle: 'This is a test PDF page',
        text:
            'Hey there this is some more test text with some new and different test terms included.',
    },
    {
        url: 'memex.cloud/ct/test2.pdf',
        fullUrl: 'https://memex.cloud/ct/test2.pdf',
        fullTitle: 'This is another test PDF page',
        text:
            'Hey there this is some more test text with some new and different test terms included.',
    },
]

export const visitTimestamps = [1563255000000, 1563255000005, 1563255000015]
