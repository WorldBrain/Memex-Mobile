import { makeStorageTestFactory } from 'src/index.tests'
import Logic, { State, Event, Props } from './logic'
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

async function setup(
    context: TestDevice,
    opts?: {
        skipTestData?: boolean
        props?: Pick<Props, 'onEntryPress'>
    },
) {
    if (!opts?.skipTestData) {
        await insertTestData(context)
    }

    const logic = new Logic({
        storage: context.storage,
        services: context.services,
        ...opts?.props,
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
            [...testEntries].reverse(),
        )
    })

    it('should be able to add new list entries, adding them in order of latest first', async (context) => {
        let lastPressedEntryName: string | null = null
        const { element } = await setup(context, {
            skipTestData: true,
            props: {
                onEntryPress: async (entry) => {
                    lastPressedEntryName = entry.name
                },
            },
        })

        const namesToEntries = (names: string[]) =>
            names.map((name) => ({
                id: expect.any(Number),
                isChecked: true,
                name,
            }))
        await element.init()

        expect(normalizedStateToArray(element.state.entries)).toEqual([])
        expect(lastPressedEntryName).toEqual(null)

        await element.processEvent('suggestEntries', {
            text: testEntries[0].name,
        })
        await element.processEvent('addEntry', null)
        expect(lastPressedEntryName).toEqual(testEntries[0].name)
        expect(element.state.inputText).toEqual('')
        expect(normalizedStateToArray(element.state.entries)).toEqual(
            namesToEntries([testEntries[0].name]),
        )

        await element.processEvent('suggestEntries', {
            text: testEntries[1].name,
        })
        await element.processEvent('addEntry', null)
        expect(lastPressedEntryName).toEqual(testEntries[1].name)
        expect(element.state.inputText).toEqual('')
        expect(normalizedStateToArray(element.state.entries)).toEqual(
            namesToEntries([testEntries[1].name, testEntries[0].name]),
        )

        await element.processEvent('suggestEntries', {
            text: testEntries[2].name,
        })
        await element.processEvent('addEntry', null)
        expect(lastPressedEntryName).toEqual(testEntries[2].name)
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
        let lastPressedEntryId: number | null = null
        const { element } = await setup(context, {
            props: {
                onEntryPress: async (entry) => {
                    lastPressedEntryId = entry.id
                },
            },
        })

        await element.init()

        expect(normalizedStateToArray(element.state.entries)).toEqual(
            [...testEntries].reverse(),
        )
        expect(element.state.entries.byId[0].isChecked).toBe(false)
        expect(lastPressedEntryId).toBe(null)

        await element.processEvent('toggleEntryChecked', {
            id: testEntries[0].id,
        })
        expect(element.state.entries.byId[0].isChecked).toBe(true)
        expect(lastPressedEntryId).toBe(testEntries[0].id)

        await element.processEvent('toggleEntryChecked', {
            id: testEntries[0].id,
        })
        expect(element.state.entries.byId[0].isChecked).toBe(false)
        expect(lastPressedEntryId).toBe(testEntries[0].id)

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
        expect(lastPressedEntryId).toBe(element.state.entries.allIds[0])
    })

    it('should be able to suggest entries', async (context) => {
        const { element } = await setup(context)

        await element.init()

        expect(element.state.inputText).toEqual('')
        expect(element.state.searchState).toEqual('pristine')
        expect(normalizedStateToArray(element.state.entries)).toEqual(
            [...testEntries].reverse(),
        )

        const suggestP = element.processEvent('suggestEntries', {
            text: 'test',
        })
        expect(element.state.searchState).toEqual('running')
        await suggestP
        expect(element.state.inputText).toEqual('test')
        expect(element.state.searchState).toEqual('done')
        expect(normalizedStateToArray(element.state.entries)).toEqual(
            testEntries,
        )

        await element.processEvent('suggestEntries', { text: 'testB' })
        expect(element.state.inputText).toEqual('testB')
        expect(normalizedStateToArray(element.state.entries)).toEqual([
            testEntries[1],
        ])

        await element.processEvent('suggestEntries', { text: 'testC' })
        expect(element.state.inputText).toEqual('testC')
        expect(normalizedStateToArray(element.state.entries)).toEqual([
            testEntries[2],
        ])

        await element.processEvent('suggestEntries', { text: '' })
        expect(element.state.inputText).toEqual('')
        expect(normalizedStateToArray(element.state.entries)).toEqual(
            [...testEntries].reverse(),
        )
    })
})
