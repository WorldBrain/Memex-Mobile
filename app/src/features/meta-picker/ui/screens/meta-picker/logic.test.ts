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
        props?: Pick<Props, 'onEntryPress' | 'filterMode'>
    },
) {
    if (!opts?.skipTestData) {
        await insertTestData(context)
    }

    const logic = new Logic({
        storage: context.storage,
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
        const { element, logic } = await setup(context)

        expect(element.state.loadState).toEqual('pristine')
        expect(normalizedStateToArray(element.state.entries)).toEqual([])
        expect(normalizedStateToArray(logic['_defaultEntries'])).toEqual([])
        await element.init()
        expect(element.state.loadState).toEqual('done')
        expect(normalizedStateToArray(element.state.entries)).toEqual(
            [...testEntries].reverse(),
        )
        expect(normalizedStateToArray(logic['_defaultEntries'])).toEqual(
            [...testEntries].reverse(),
        )
    })

    it('should be able to add new list entries, adding them in order of latest first', async (context) => {
        let lastPressedEntryName: string | null = null
        const { element, logic } = await setup(context, {
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
        expect(normalizedStateToArray(logic['_defaultEntries'])).toEqual([])

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
        expect(normalizedStateToArray(logic['_defaultEntries'])).toEqual(
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
        expect(normalizedStateToArray(logic['_defaultEntries'])).toEqual(
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
        expect(normalizedStateToArray(logic['_defaultEntries'])).toEqual(
            namesToEntries([
                testEntries[2].name,
                testEntries[1].name,
                testEntries[0].name,
            ]),
        )
    })

    it('should validate and reject on bad space name add attempts', async (context) => {
        const { element, logic } = await setup(context, { skipTestData: true })

        const namesToEntries = (names: string[]) =>
            names.map((name) => ({
                id: expect.any(Number),
                isChecked: true,
                name,
            }))
        await element.init()

        expect(normalizedStateToArray(element.state.entries)).toEqual([])
        expect(normalizedStateToArray(logic['_defaultEntries'])).toEqual([])

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
        expect(normalizedStateToArray(logic['_defaultEntries'])).toEqual(
            namesToEntries([testEntries[2].name]),
        )

        element.processMutation({
            inputText: { $set: testEntries[2].name },
        })
        expect(element.processEvent('addEntry', null)).rejects.toThrowError(
            `Cannot add new list with invalid name: ${NON_UNIQ_SPACE_NAME_ERR_MSG}`,
        )
    })

    it('show throw error on add new entry attempt when in filter mode', async (context) => {
        const { element, logic } = await setup(context, {
            skipTestData: true,
            props: { filterMode: true },
        })
        await element.init()

        expect(normalizedStateToArray(element.state.entries)).toEqual([])
        expect(normalizedStateToArray(logic['_defaultEntries'])).toEqual([])

        element.processMutation({
            inputText: { $set: 'test space' },
        })
        expect(element.processEvent('addEntry', null)).rejects.toThrowError(
            `Cannot add new entries in SpacePicker filter mode`,
        )

        expect(normalizedStateToArray(element.state.entries)).toEqual([])
        expect(normalizedStateToArray(logic['_defaultEntries'])).toEqual([])
    })

    it('should be able to toggle checked entries', async (context) => {
        let lastPressedEntry: SpacePickerEntry | null = null
        const { element, logic } = await setup(context, {
            props: {
                onEntryPress: async (entry) => {
                    lastPressedEntry = entry
                },
            },
        })

        await element.init()

        expect(normalizedStateToArray(element.state.entries)).toEqual(
            [...testEntries].reverse(),
        )
        expect(element.state.entries.byId[0].isChecked).toBe(false)
        expect(normalizedStateToArray(logic['_defaultEntries'])).toEqual(
            [...testEntries].reverse(),
        )
        expect(logic['_defaultEntries'].byId[0].isChecked).toBe(false)
        expect(lastPressedEntry).toEqual(null)

        await element.processEvent('toggleEntryChecked', {
            id: testEntries[0].id,
        })
        expect(element.state.entries.byId[0].isChecked).toBe(true)
        expect(logic['_defaultEntries'].byId[0].isChecked).toBe(true)
        expect(lastPressedEntry).toEqual(testEntries[0])

        await element.processEvent('toggleEntryChecked', {
            id: testEntries[0].id,
        })
        expect(element.state.entries.byId[0].isChecked).toBe(false)
        expect(logic['_defaultEntries'].byId[0].isChecked).toBe(false)
        // NOTE: the `isChecked` prop should reflect what it was set to when the entry was pressed
        expect(lastPressedEntry).toEqual({ ...testEntries[0], isChecked: true })

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
        expect(
            logic['_defaultEntries'].byId[element.state.entries.allIds[0]],
        ).toEqual({
            id: expect.any(Number),
            isChecked: true,
            name: newEntry,
        })
        expect(lastPressedEntry).toEqual({
            name: newEntry,
            id: expect.any(Number),
            isChecked: false,
        })

        await element.processEvent('toggleEntryChecked', {
            id: element.state.entries.allIds[0],
        })
        expect(
            element.state.entries.byId[element.state.entries.allIds[0]],
        ).toEqual({
            id: expect.any(Number),
            isChecked: false,
            name: newEntry,
        })
        expect(
            logic['_defaultEntries'].byId[element.state.entries.allIds[0]],
        ).toEqual({
            id: expect.any(Number),
            isChecked: false,
            name: newEntry,
        })
        expect(lastPressedEntry).toEqual({
            ...element.state.entries.byId[element.state.entries.allIds[0]],
            isChecked: true,
        })
    })

    it('should be able to suggest entries', async (context) => {
        const { element, logic } = await setup(context)

        await element.init()

        const dummyEntry: SpacePickerEntry = {
            id: expect.any(Number),
            name: 'dummy A',
            isChecked: false,
        }

        await context.storage.modules.metaPicker.createList(
            { name: dummyEntry.name },
            { skipSuggestionCache: true },
        )

        expect(element.state.inputText).toEqual('')
        expect(element.state.searchState).toEqual('pristine')
        expect(normalizedStateToArray(element.state.entries)).toEqual(
            [...testEntries].reverse(),
        )
        expect(normalizedStateToArray(logic['_defaultEntries'])).toEqual(
            [...testEntries].reverse(),
        )

        const suggestP = element.processEvent('suggestEntries', {
            text: 'est',
        })
        expect(element.state.searchState).toEqual('running')
        await suggestP
        expect(element.state.inputText).toEqual('est')
        expect(element.state.searchState).toEqual('done')
        expect(normalizedStateToArray(element.state.entries)).toEqual(
            testEntries,
        )
        expect(normalizedStateToArray(logic['_defaultEntries'])).toEqual(
            [...testEntries].reverse(),
        )
        await element.processEvent('suggestEntries', { text: 'testB' })
        expect(element.state.inputText).toEqual('testB')
        expect(normalizedStateToArray(element.state.entries)).toEqual([
            testEntries[1],
        ])
        expect(normalizedStateToArray(logic['_defaultEntries'])).toEqual(
            [...testEntries].reverse(),
        )

        await element.processEvent('suggestEntries', { text: 'stC' })
        expect(element.state.inputText).toEqual('stC')
        expect(normalizedStateToArray(element.state.entries)).toEqual([
            testEntries[2],
        ])
        expect(normalizedStateToArray(logic['_defaultEntries'])).toEqual(
            [...testEntries].reverse(),
        )

        // Get an entry showing up that wasn't in the initial suggestions. It should be added to `defaultEntries` after showing up
        await element.processEvent('suggestEntries', { text: 'ummy' })
        expect(element.state.inputText).toEqual('ummy')
        expect(normalizedStateToArray(element.state.entries)).toEqual([
            dummyEntry,
        ])
        expect(normalizedStateToArray(logic['_defaultEntries'])).toEqual([
            ...[...testEntries].reverse(),
            dummyEntry,
        ])

        await element.processEvent('suggestEntries', { text: '' })
        expect(element.state.inputText).toEqual('')
        expect(normalizedStateToArray(element.state.entries)).toEqual([
            ...[...testEntries].reverse(),
            dummyEntry,
        ])
        expect(normalizedStateToArray(logic['_defaultEntries'])).toEqual([
            ...[...testEntries].reverse(),
            dummyEntry,
        ])
    })
})
