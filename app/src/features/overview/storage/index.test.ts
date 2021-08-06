import expect from 'expect'
import { extractUrlParts } from '@worldbrain/memex-url-utils'

import { makeStorageTestFactory } from 'src/index.tests'
import * as data from './index.test.data'
import { Page } from '../types'

const it = makeStorageTestFactory()

function testPageEquality(
    dbPage: Page,
    testPage: Omit<Page, 'domain' | 'hostname'>,
) {
    expect(dbPage.url).toBe(testPage.url)
    expect(dbPage.text).toBe(testPage.text)
    expect(dbPage.fullUrl).toBe(testPage.fullUrl)
    expect(dbPage.fullTitle).toBe(testPage.fullTitle)

    const urlParts = extractUrlParts(testPage.url)
    expect(dbPage.domain).toBe(urlParts.domain)
    expect(dbPage.hostname).toBe(urlParts.hostname)
}

describe.skip('overview StorageModule', () => {
    it('should be able to create new pages', async ({
        storage: {
            modules: { overview },
        },
    }) => {
        for (const page of data.pages) {
            await overview.createPage(page)
            const foundPage = await overview.findPage(page)
            expect(foundPage).not.toBeNull()
            testPageEquality(foundPage!, page)
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

    it('should be able to update page title', async ({
        storage: {
            modules: { overview },
        },
    }) => {
        const testTitle = 'This is a new title'

        for (const page of data.pages) {
            await overview.createPage(page)
            expect(await overview.findPage(page)).toEqual(
                expect.objectContaining({ fullTitle: page.fullTitle }),
            )
            await overview.updatePageTitle({ url: page.url, title: testTitle })
            expect(await overview.findPage(page)).toEqual(
                expect.objectContaining({ fullTitle: testTitle }),
            )
            await overview.updatePageTitle({
                url: page.url,
                title: page.fullTitle,
            })
            expect(await overview.findPage(page)).toEqual(
                expect.objectContaining({ fullTitle: page.fullTitle }),
            )
        }
    })

    it('should be able to set page star state', async ({
        storage: {
            modules: { overview },
        },
    }) => {
        for (const page of data.pages) {
            await overview.createPage(page)
            expect(await overview.findPage(page)).toEqual(
                expect.objectContaining({ isStarred: false }),
            )
            await overview.setPageStar({ url: page.url, isStarred: true })
            expect(await overview.findPage(page)).toEqual(
                expect.objectContaining({ isStarred: true }),
            )
            await overview.setPageStar({ url: page.url, isStarred: false })
            expect(await overview.findPage(page)).toEqual(
                expect.objectContaining({ isStarred: false }),
            )
        }
    })

    it('should be able to determine page starred status', async ({
        storage: {
            modules: { overview },
        },
    }) => {
        for (const page of data.pages) {
            await overview.createPage(page)
            await overview.setPageStar({ url: page.url, isStarred: true })
            expect(await overview.isPageStarred(page)).toBe(true)
            await overview.setPageStar({ url: page.url, isStarred: false })
            expect(await overview.isPageStarred(page)).toBe(false)
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
                data.visitTimestamps.map((time) => ({ time, url: page.url })),
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
            const foundPage = await overview.findPage(page)
            expect(foundPage).not.toBeNull()
            testPageEquality(foundPage!, page)

            await overview.starPage(page)
            for (const time of data.visitTimestamps) {
                await overview.visitPage({ url: page.url, time })
            }
            expect(await overview.findPageVisits(page)).toEqual(
                data.visitTimestamps.map((time) => ({ time, url: page.url })),
            )

            await overview.deletePage(page)
            expect(await overview.findPage(page)).toBeNull()
            expect(await overview.findPageVisits(page)).toEqual([])
        }
    })

    it('should be able to find latest bookmarks', async ({
        storage: {
            modules: { overview },
        },
    }) => {
        for (const page of data.pages) {
            await overview.createPage(page)
        }

        await overview.setPageStar({ url: data.pages[0].url, isStarred: true })
        await overview.setPageStar({ url: data.pages[2].url, isStarred: true })

        expect(
            await overview.findLatestBookmarks({ limit: 10, skip: 0 }),
        ).toEqual([
            { url: data.pages[2].url, time: expect.any(Number) },
            { url: data.pages[0].url, time: expect.any(Number) },
        ])

        await overview.setPageStar({ url: data.pages[1].url, isStarred: true })

        expect(
            await overview.findLatestBookmarks({ limit: 10, skip: 0 }),
        ).toEqual([
            { url: data.pages[1].url, time: expect.any(Number) },
            { url: data.pages[2].url, time: expect.any(Number) },
            { url: data.pages[0].url, time: expect.any(Number) },
        ])

        expect(
            await overview.findLatestBookmarks({ limit: 10, skip: 1 }),
        ).toEqual([
            { url: data.pages[2].url, time: expect.any(Number) },
            { url: data.pages[0].url, time: expect.any(Number) },
        ])

        expect(
            await overview.findLatestBookmarks({ limit: 10, skip: 2 }),
        ).toEqual([{ url: data.pages[0].url, time: expect.any(Number) }])

        expect(
            await overview.findLatestBookmarks({ limit: 1, skip: 0 }),
        ).toEqual([{ url: data.pages[1].url, time: expect.any(Number) }])

        expect(
            await overview.findLatestBookmarks({ limit: 1, skip: 1 }),
        ).toEqual([{ url: data.pages[2].url, time: expect.any(Number) }])

        expect(
            await overview.findLatestBookmarks({ limit: 1, skip: 2 }),
        ).toEqual([{ url: data.pages[0].url, time: expect.any(Number) }])

        expect(
            await overview.findLatestBookmarks({ limit: 1, skip: 3 }),
        ).toEqual([])
    })

    it('should be able to find latest visits for each page', async ({
        storage: {
            modules: { overview },
        },
    }) => {
        for (const page of data.pages) {
            await overview.createPage(page)
        }

        const times = [
            Date.now() - 1000,
            Date.now() - 900,
            Date.now() - 800,
            Date.now() - 700,
            Date.now() - 600,
        ]

        await overview.visitPage({ url: data.pages[0].url, time: times[0] })
        await overview.visitPage({ url: data.pages[0].url, time: times[2] })
        await overview.visitPage({ url: data.pages[2].url, time: times[1] })

        expect(
            await overview.findLatestVisitsByPage({ limit: 10, skip: 0 }),
        ).toEqual([
            { url: data.pages[0].url, time: times[2] },
            { url: data.pages[2].url, time: times[1] },
        ])

        await overview.visitPage({ url: data.pages[1].url, time: times[3] })
        await overview.visitPage({ url: data.pages[1].url, time: times[0] })
        await overview.visitPage({ url: data.pages[1].url, time: times[1] })

        expect(
            await overview.findLatestVisitsByPage({ limit: 10, skip: 0 }),
        ).toEqual([
            { url: data.pages[1].url, time: times[3] },
            { url: data.pages[0].url, time: times[2] },
            { url: data.pages[2].url, time: times[1] },
        ])

        expect(
            await overview.findLatestVisitsByPage({ limit: 10, skip: 1 }),
        ).toEqual([
            { url: data.pages[0].url, time: times[2] },
            { url: data.pages[2].url, time: times[1] },
        ])

        expect(
            await overview.findLatestVisitsByPage({ limit: 10, skip: 2 }),
        ).toEqual([{ url: data.pages[2].url, time: times[1] }])

        expect(
            await overview.findLatestVisitsByPage({ limit: 10, skip: 3 }),
        ).toEqual([])

        expect(
            await overview.findLatestVisitsByPage({ limit: 2, skip: 0 }),
        ).toEqual([
            { url: data.pages[1].url, time: times[3] },
            { url: data.pages[0].url, time: times[2] },
        ])

        expect(
            await overview.findLatestVisitsByPage({ limit: 2, skip: 1 }),
        ).toEqual([
            { url: data.pages[0].url, time: times[2] },
            { url: data.pages[2].url, time: times[1] },
        ])
    })
})
