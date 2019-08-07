import expect from 'expect'

import { makeStorageTestFactory } from 'src/index.tests'
import * as data from './index.test.data'
import { Page } from '../types'

const it = makeStorageTestFactory()

function testPageEquality(a: Page, b: Page) {
    expect(a.url).toBe(b.url)
    expect(a.text).toBe(b.text)
    expect(a.domain).toBe(b.domain)
    expect(a.fullUrl).toBe(b.fullUrl)
    expect(a.hostname).toBe(b.hostname)
    expect(a.fullTitle).toBe(b.fullTitle)
}

describe('overview StorageModule', () => {
    it('should be able to create new pages', async ({
        storage: {
            modules: { overview },
        },
    }) => {
        for (const page of data.pages) {
            await overview.createPage(page)
            testPageEquality(await overview.findPage(page), page)
        }
    })

    it('should be able to star pages', async ({
        storage: {
            modules: { overview },
        },
    }) => {
        for (const page of data.pages) {
            await overview.createPage(page)
            expect(await overview.findPage(page)).toEqual(
                expect.objectContaining({ isStarred: false }),
            )
            await overview.starPage(page)
            expect(await overview.findPage(page)).toEqual(
                expect.objectContaining({ isStarred: true }),
            )
            await overview.unstarPage(page)
            expect(await overview.findPage(page)).toEqual(
                expect.objectContaining({ isStarred: false }),
            )
        }
    })

    it('should be able to visit pages', async ({
        storage: {
            modules: { overview },
        },
    }) => {
        for (const page of data.pages) {
            await overview.createPage(page)
            for (const time of data.visitTimestamps) {
                await overview.visitPage({ url: page.url, time })
            }
            expect(await overview.findPageVisits(page)).toEqual(
                data.visitTimestamps.map(time => ({ time, url: page.url })),
            )
        }
    })

    it('should be able to delete pages + associated data', async ({
        storage: {
            modules: { overview },
        },
    }) => {
        for (const page of data.pages) {
            await overview.createPage(page)
            testPageEquality(await overview.findPage(page), page)

            await overview.starPage(page)
            for (const time of data.visitTimestamps) {
                await overview.visitPage({ url: page.url, time })
            }
            expect(await overview.findPageVisits(page)).toEqual(
                data.visitTimestamps.map(time => ({ time, url: page.url })),
            )

            await overview.deletePage(page)
            expect(await overview.findPage(page)).toBeNull()
            expect(await overview.findPageVisits(page)).toEqual([])
        }
    })
})
