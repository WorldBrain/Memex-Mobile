import Logic, { State, Event, Props } from './logic'
import { FakeStatefulUIElement } from 'src/ui/index.tests'

const testEntries = [
    { name: 'testA', isChecked: false },
    { name: 'testB', isChecked: false },
    { name: 'testC', isChecked: true },
    { name: 'testD', isChecked: false },
]

const DEFAULT_DEPS: Partial<Props> = {
    initSelectedEntries: [],
    url: 'test.com',
}

describe('meta picker UI logic tests', () => {
    function setup(deps: Partial<Props>) {
        const logic = new Logic({
            ...deps,
            services: {
                syncStorage: {
                    get: () => undefined,
                    set: () => undefined,
                } as any,
            },
        } as Props)
        const element = new FakeStatefulUIElement<State, Event>(logic)
        const state = logic.getInitialState()

        return { element, state }
    }

    it('should be able to load init tag entries', async () => {
        const findTagSuggestions = async (args: { url: string }) => testEntries
        const { element } = setup({
            ...DEFAULT_DEPS,
            type: 'tags',
            storage: { modules: { metaPicker: { findTagSuggestions } as any } },
        })

        expect(element.state.loadState).toEqual('pristine')
        expect([...element.state.entries.values()]).toEqual([])
        await element.init()
        expect(element.state.loadState).toEqual('done')
        expect([...element.state.entries.values()]).toEqual(testEntries)
    })

    it('should be able to load init list entries', async () => {
        const findListSuggestions = async (args: { url: string }) => testEntries
        const { element } = setup({
            ...DEFAULT_DEPS,
            type: 'collections',
            storage: {
                modules: { metaPicker: { findListSuggestions } as any },
            },
        })

        expect(element.state.loadState).toEqual('pristine')
        expect([...element.state.entries.values()]).toEqual([])
        await element.init()
        expect(element.state.loadState).toEqual('done')
        expect([...element.state.entries.values()]).toEqual(testEntries)
    })

    it('should be able to add new checked entries, adding them in order of latest first', async () => {
        const { element } = setup({
            ...DEFAULT_DEPS,
            type: 'collections',
            storage: {
                modules: {
                    metaPicker: { findListSuggestions: () => [] } as any,
                },
            },
        })

        const testEntryA = { name: 'testA', isChecked: true }
        const testEntryB = { name: 'testB', isChecked: true }
        const testEntryC = { name: 'testC', isChecked: true }

        expect([...element.state.entries.values()]).toEqual([])

        await element.processEvent('addEntry', {
            entry: testEntryA,
            selected: [],
        })
        expect([...element.state.entries.values()]).toEqual([testEntryA])

        await element.processEvent('addEntry', {
            entry: testEntryB,
            selected: [testEntryA.name],
        })
        expect([...element.state.entries.values()]).toEqual([
            testEntryB,
            testEntryA,
        ])

        await element.processEvent('addEntry', {
            entry: testEntryC,
            selected: [testEntryB.name, testEntryA.name],
        })
        expect([...element.state.entries.values()]).toEqual([
            testEntryC,
            testEntryB,
            testEntryA,
        ])
    })

    it('should be able to toggle checked entries', async () => {
        const findListSuggestions = async (args: { url: string }) => testEntries
        let suggestValue = [testEntries[2]]

        const { element } = setup({
            ...DEFAULT_DEPS,
            type: 'collections',
            storage: {
                modules: {
                    metaPicker: {
                        findListSuggestions,
                        suggest: async () => suggestValue,
                    } as any,
                },
            },
        })

        await element.init()

        expect(element.state.entries.size).toBe(4)
        await element.processEvent('suggestEntries', {
            text: 'test',
            selected: [testEntries[2].name],
        })
        expect(element.state.entries.size).toBe(1)
        expect([...element.state.entries.values()]).toEqual([testEntries[2]])

        suggestValue = [testEntries[0], testEntries[1]]

        await element.processEvent('suggestEntries', {
            text: 'test',
            selected: [testEntries[2].name],
        })
        expect(element.state.entries.size).toBe(2)
        expect([...element.state.entries.values()]).toEqual([
            testEntries[0],
            testEntries[1],
        ])
    })
})
