import { ReadablePageData } from './types'

type WithoutTimestamps = Omit<ReadablePageData, 'createdWhen' | 'lastEdited'>

export const READABLE_1: WithoutTimestamps = {
    url: 'test.com',
    fullUrl: 'https://test.com',
    title: 'Test title',
    content: 'Some test content',
    length: 1,
    dir: 'ltr',
    strategy: 'seanmcgary/readability',
}

export const READABLE_2: WithoutTimestamps = {
    url: 'test.com/route',
    fullUrl: 'https://test.com/route',
    title: 'Test title 2',
    content: 'More test content',
    length: 1,
    dir: 'rtl',
    strategy: 'seanmcgary/readability',
}

export const READABLE_3: WithoutTimestamps = {
    url: 'getmemex.com/get',
    fullUrl: 'https://getmemex.com/get',
    title: 'Memex',
    content: 'Memex memex memex',
    length: 1,
    dir: 'ltr',
    strategy: 'seanmcgary/readability',
}
