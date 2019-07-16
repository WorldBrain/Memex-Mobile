import expect from 'expect'

import { makeTestFactory, forEachTestDoc } from 'src/index.tests'
import * as data from './index.test.data'
import { Note } from '../types'

const it = makeTestFactory()

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
        modules: { pageEditor },
    }) =>
        forEachTestDoc(data.notes, async note => {
            await pageEditor.createNote(note)
            testNoteEquality(await pageEditor.findNote(note), note)
        }))

    it('should be able to star notes', ({ modules: { pageEditor } }) =>
        forEachTestDoc(data.notes, async note => {
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
        }))
})
