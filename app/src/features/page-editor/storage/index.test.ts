import expect from 'expect'
import { normalizeUrl } from '@worldbrain/memex-url-utils'

import { makeStorageTestFactory } from 'src/index.tests'
import * as data from './index.test.data'
import { Note } from '../types'

const it = makeStorageTestFactory()

function testNoteEquality(a: Note, b: Note) {
    expect(a.url).toBe(b.url)
    expect(a.pageUrl).toBe(b.pageUrl)
    expect(a.pageTitle).toBe(b.pageTitle)

    if (a.body) {
        expect(a.body).toBe(b.body)
    }

    if (a.comment) {
        expect(a.comment).toBe(b.comment)
    }
}

describe('page editor StorageModule', () => {
    it('should be able to derive annotation URLs from page URLs', async ({
        storage: {
            modules: { pageEditor },
        },
    }) => {
        for (const note of data.notes) {
            // Timestamp gets appended to URL ID; here we just grab it from test datum's URL
            const urlTimestamp = +note.url.split('#')[1]

            const url = pageEditor['createAnnotationUrl']({
                pageUrl: note.pageUrl,
                timestamp: urlTimestamp,
            })
            expect(url).toEqual(
                normalizeUrl(note.url, {
                    stripHash: false,
                    removeTrailingSlash: false,
                }),
            )
        }
    })

    it('should be able to create new notes', async ({
        storage: {
            modules: { pageEditor },
        },
    }) => {
        for (const note of data.notes) {
            // Timestamp gets appended to URL ID; here we just grab it from test datum's URL
            const urlTimestamp = +note.url.split('#')[1]

            await pageEditor.createNote(note, urlTimestamp)
            const foundNote = await pageEditor.findNote(note)
            testNoteEquality(foundNote!, note)
        }
    })

    it('should be able to star notes', async ({
        storage: {
            modules: { pageEditor },
        },
    }) => {
        for (const note of data.notes) {
            // Timestamp gets appended to URL ID; here we just grab it from test datum's URL
            const urlTimestamp = +note.url.split('#')[1]

            await pageEditor.createNote(note, urlTimestamp)
            expect(await pageEditor.findNote(note)).toEqual(
                expect.objectContaining({ isStarred: false }),
            )
            await pageEditor.starNote(note)
            expect(await pageEditor.findNote(note)).toEqual(
                expect.objectContaining({ isStarred: true }),
            )
            await pageEditor.unstarNote(note)
            expect(await pageEditor.findNote(note)).toEqual(
                expect.objectContaining({ isStarred: false }),
            )
        }
    })
})
