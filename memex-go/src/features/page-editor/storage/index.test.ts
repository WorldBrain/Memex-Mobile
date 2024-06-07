import expect from 'expect'
import { normalizeUrl } from '@worldbrain/memex-common/lib/url-utils/normalize'

import { makeStorageTestFactory } from 'src/index.tests'
import * as data from './index.test.data'
import { Note } from '../types'
import { AnnotationPrivacyLevels } from '@worldbrain/memex-common/lib/annotations/types'

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
            modules: { pageEditor, overview },
            manager,
        },
    }) => {
        for (const page of data.pages) {
            await overview.createPage(page)
        }

        for (const noteData of data.notes) {
            if (!noteData.comment?.length) {
                continue
            }

            expect(
                await manager
                    .collection('annotationPrivacyLevels')
                    .findOneObject({ annotation: noteData.url }),
            ).toEqual(null)

            const { annotationUrl } = await pageEditor.createNote(noteData)
            const foundNote = await pageEditor.findNote({ url: annotationUrl })
            testNoteEquality(foundNote!, { ...noteData, url: annotationUrl })

            expect(
                await manager
                    .collection('annotationPrivacyLevels')
                    .findOneObject({ annotation: annotationUrl }),
            ).toEqual({
                id: expect.any(Number),
                annotation: annotationUrl,
                createdWhen: expect.any(Date),
                privacyLevel: AnnotationPrivacyLevels.PRIVATE,
            })
        }
    })

    it('should be able to create new annotations', async ({
        storage: {
            modules: { pageEditor, overview },
            manager,
        },
    }) => {
        for (const page of data.pages) {
            await overview.createPage(page)
        }

        for (const noteData of data.notes) {
            if (!noteData.body?.length) {
                continue
            }

            expect(
                await manager
                    .collection('annotationPrivacyLevels')
                    .findOneObject({ annotation: noteData.url }),
            ).toEqual(null)

            const { annotationUrl } = await pageEditor.createAnnotation(
                noteData as any,
            )
            const foundNote = await pageEditor.findNote({ url: annotationUrl })
            testNoteEquality(foundNote!, { ...noteData, url: annotationUrl })

            expect(
                await manager
                    .collection('annotationPrivacyLevels')
                    .findOneObject({ annotation: annotationUrl }),
            ).toEqual({
                id: expect.any(Number),
                annotation: annotationUrl,
                createdWhen: expect.any(Date),
                privacyLevel: AnnotationPrivacyLevels.PRIVATE,
            })
        }
    })

    it('should be able to find only annotations (with bodies)', async ({
        storage: {
            modules: { pageEditor, overview },
        },
    }) => {
        for (const page of data.pages) {
            await overview.createPage(page)
        }

        for (const note of data.notes) {
            await pageEditor.createAnnotation(note as any)
        }

        const annotations = await pageEditor.findAnnotations({
            url: 'https://test.com',
        })
        expect(annotations.length).toBe(2)
        expect(annotations.map((a) => a.body)).toEqual([
            data.notes[0].body,
            data.notes[1].body,
        ])
    })

    it('should be able to delete all notes for a page', async ({
        storage: {
            modules: { pageEditor, overview },
        },
    }) => {
        for (const page of data.pages) {
            await overview.createPage(page)
        }

        for (const noteData of data.notes) {
            await pageEditor.createNote(noteData)
        }

        const before = await pageEditor.findNotesByPage({
            url: 'https://test.com',
        })
        expect(before.length).toBe(3)

        await pageEditor.deleteNotesForPage({ url: 'https://test.com' })

        const after = await pageEditor.findNotesByPage({
            url: 'https://test.com',
        })
        expect(after.length).toBe(0)
    })

    // it('should be able to star notes', async ({
    //     storage: {
    //         modules: { pageEditor, overview },
    //     },
    // }) => {
    //     for (const page of data.pages) {
    //         await overview.createPage(page)
    //     }

    //     for (const note of data.notes) {
    //         // Timestamp gets appended to URL ID; here we just grab it from test datum's URL
    //         const urlTimestamp = +note.url.split('#')[1]

    //         await pageEditor.createNote(note, urlTimestamp)
    //         expect(await pageEditor.findNote(note)).toEqual(
    //             expect.objectContaining({ isStarred: false }),
    //         )
    //         await pageEditor.starNote(note)
    //         expect(await pageEditor.findNote(note)).toEqual(
    //             expect.objectContaining({ isStarred: true }),
    //         )
    //         await pageEditor.unstarNote(note)
    //         expect(await pageEditor.findNote(note)).toEqual(
    //             expect.objectContaining({ isStarred: false }),
    //         )
    //     }
    // })
})
