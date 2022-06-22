import { makeStorageTestFactory } from 'src/index.tests'
import Logic, { State, Event } from './logic'
import { FakeStatefulUIElement } from 'src/ui/index.tests'
import type { SpacePickerEntry } from 'src/features/meta-picker/types'
import type { TestDevice } from 'src/types.tests'
import { normalizedStateToArray } from '@worldbrain/memex-common/lib/common-ui/utils/normalized-state'
import {
    EMPTY_SPACE_NAME_ERR_MSG,
    BAD_CHAR_SPACE_NAME_ERR_MSG,
    NON_UNIQ_SPACE_NAME_ERR_MSG,
} from '@worldbrain/memex-common/lib/utils/space-name-validation'

const testEntries: SpacePickerEntry[] = [
    { id: 0, name: 'testA', isChecked: false },
    { id: 1, name: 'testB', isChecked: false },
    { id: 2, name: 'testC', isChecked: false },
    { id: 3, name: 'testD', isChecked: false },
]

async function setup(context: TestDevice, opts?: { skipTestData?: boolean }) {
    if (!opts?.skipTestData) {
        await insertTestData(context)
    }

    const logic = new Logic({
        storage: context.storage,
        services: context.services,
    })
    const element = new FakeStatefulUIElement<State, Event>(logic)

    return { element, logic }
}

async function insertTestData({ storage }: TestDevice, entries = testEntries) {
    for (const entry of entries) {
        await storage.modules.metaPicker.createList({
            name: entry.name,
            __id: entry.id,
        })
    }
}

describe('meta picker UI logic tests', () => {
    const it = makeStorageTestFactory()

    it('should be able to load init list entries', async (context) => {
        const { element } = await setup(context)

        expect(element.state.loadState).toEqual('pristine')
        expect(normalizedStateToArray(element.state.entries)).toEqual([])
        await element.init()
        expect(element.state.loadState).toEqual('done')
        expect(normalizedStateToArray(element.state.entries)).toEqual(
            testEntries,
        )
    })

    it('should be able to add new list entries, adding them in order of latest first', async (context) => {
        const { element } = await setup(context, { skipTestData: true })

        const namesToEntries = (names: string[]) =>
            names.map((name) => ({
                id: expect.any(Number),
                isChecked: true,
                name,
            }))
        await element.init()

        expect(normalizedStateToArray(element.state.entries)).toEqual([])

        element.processMutation({
            inputText: { $set: testEntries[0].name },
        })
        await element.processEvent('addEntry', null)
        expect(element.state.inputText).toEqual('')
        expect(normalizedStateToArray(element.state.entries)).toEqual(
            namesToEntries([testEntries[0].name]),
        )

        element.processMutation({
            inputText: { $set: testEntries[1].name },
        })
        await element.processEvent('addEntry', null)
        expect(element.state.inputText).toEqual('')
        expect(normalizedStateToArray(element.state.entries)).toEqual(
            namesToEntries([testEntries[1].name, testEntries[0].name]),
        )

        element.processMutation({
            inputText: { $set: testEntries[2].name },
        })
        await element.processEvent('addEntry', null)
        expect(element.state.inputText).toEqual('')
        expect(normalizedStateToArray(element.state.entries)).toEqual(
            namesToEntries([
                testEntries[2].name,
                testEntries[1].name,
                testEntries[0].name,
            ]),
        )
    })

    it('should validate and reject on bad space name add attempts', async (context) => {
        const { element } = await setup(context, { skipTestData: true })

        const namesToEntries = (names: string[]) =>
            names.map((name) => ({
                id: expect.any(Number),
                isChecked: true,
                name,
            }))
        await element.init()

        expect(normalizedStateToArray(element.state.entries)).toEqual([])

        element.processMutation({
            inputText: { $set: '    ' },
        })
        expect(element.processEvent('addEntry', null)).rejects.toThrowError(
            `Cannot add new list with invalid name: ${EMPTY_SPACE_NAME_ERR_MSG}`,
        )

        element.processMutation({
            inputText: { $set: 'test [ ( {' },
        })
        expect(element.processEvent('addEntry', null)).rejects.toThrowError(
            `Cannot add new list with invalid name: ${BAD_CHAR_SPACE_NAME_ERR_MSG}`,
        )

        element.processMutation({
            inputText: { $set: testEntries[2].name },
        })
        await element.processEvent('addEntry', null)
        expect(normalizedStateToArray(element.state.entries)).toEqual(
            namesToEntries([testEntries[2].name]),
        )
        element.processMutation({
            inputText: { $set: testEntries[2].name },
        })
        expect(element.processEvent('addEntry', null)).rejects.toThrowError(
            `Cannot add new list with invalid name: ${NON_UNIQ_SPACE_NAME_ERR_MSG}`,
        )
    })

    it('should be able to toggle checked entries', async (context) => {
        const { element } = await setup(context)

        await element.init()

        expect(normalizedStateToArray(element.state.entries)).toEqual(
            testEntries,
        )
        expect(element.state.entries.byId[0].isChecked).toBe(false)

        await element.processEvent('toggleEntryChecked', {
            id: testEntries[0].id,
        })
        expect(element.state.entries.byId[0].isChecked).toBe(true)

        await element.processEvent('toggleEntryChecked', {
            id: testEntries[0].id,
        })
        expect(element.state.entries.byId[0].isChecked).toBe(false)

        const newEntry = 'testA____'
        element.processMutation({ inputText: { $set: newEntry } })
        await element.processEvent('addEntry', null)
        expect(
            element.state.entries.byId[element.state.entries.allIds[0]],
        ).toEqual({
            id: expect.any(Number),
            isChecked: true,
            name: newEntry,
        })

        await element.processEvent('toggleEntryChecked', {
            id: element.state.entries.allIds[0] as number,
        })
        expect(
            element.state.entries.byId[element.state.entries.allIds[0]],
        ).toEqual({
            id: expect.any(Number),
            isChecked: false,
            name: newEntry,
        })
    })
})
