import { ReadablePageData } from './types'

export type WithoutTimestamps = Omit<
    ReadablePageData,
    'createdWhen' | 'lastEdited'
>

export const READABLE_1: WithoutTimestamps = {
    url: 'test.com',
    content: 'Some test content',
    title: 'Test',
    length: 1,
    dir: 'ltr',
    strategy: 'seanmcgary/readability',
}

export const READABLE_2: WithoutTimestamps = {
    url: 'test.com/route',
    content: 'More test content',
    title: 'Test',
    length: 1,
    dir: 'rtl',
    strategy: 'seanmcgary/readability',
}

export const READABLE_3: WithoutTimestamps = {
    url: 'getmemex.com/get',
    content: 'Memex memex memex',
    title: 'Test',
    length: 1,
    dir: 'ltr',
    strategy: 'seanmcgary/readability',
}
