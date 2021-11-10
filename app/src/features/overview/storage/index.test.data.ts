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

export const locators = [
    {
        location: pages[0].url,
        locationType: ContentLocatorType.Remote,
        locationScheme: LocationSchemeType.NormalizedUrlV1,
        normalizedUrl: pages[0].url,
        originalLocation: pages[0].url,
        format: ContentLocatorFormat.HTML,
        lastVisited: 1635927733923,
        primary: true,
        valid: true,
        version: 0,
    },
    {
        location: pages[1].url,
        locationType: ContentLocatorType.Remote,
        locationScheme: LocationSchemeType.NormalizedUrlV1,
        normalizedUrl: pages[1].url,
        originalLocation: pages[1].url,
        format: ContentLocatorFormat.HTML,
        lastVisited: 1635927733925,
        primary: true,
        valid: true,
        version: 0,
    },
    {
        location: pages[2].url,
        locationType: ContentLocatorType.Remote,
        locationScheme: LocationSchemeType.NormalizedUrlV1,
        normalizedUrl: pages[2].url,
        originalLocation: pages[2].url,
        format: ContentLocatorFormat.HTML,
        lastVisited: 1635927733928,
        primary: true,
        valid: true,
        version: 0,
    },
]

export const visitTimestamps = [1563255000000, 1563255000005, 1563255000015]
