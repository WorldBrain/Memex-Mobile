import expect from 'expect'

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
    it('should be able to create new notes', async ({
        storage: {
            modules: { pageEditor },
        },
    }) => {
        for (const note of data.notes) {
            await pageEditor.createNote(note)
            testNoteEquality(await pageEditor.findNote(note), note)
        }
    })

    it('should be able to star notes', async ({
        storage: {
            modules: { pageEditor },
        },
    }) => {
        for (const note of data.notes) {
            await pageEditor.createNote(note)
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
