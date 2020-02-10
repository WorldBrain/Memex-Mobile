import Logic, { State, Event, Props } from './logic'
import { FakeStatefulUIElement } from 'src/ui/index.tests'

const testEntries = [
    { name: 'testA', isChecked: false },
    { name: 'testB', isChecked: false },
    { name: 'testC', isChecked: true },
    { name: 'testD', isChecked: false },
]

const DEFAULT_DEPS: Partial<Props> = {
    initEntries: [],
    url: 'test.com',
}

describe('meta picker UI logic tests', () => {
    function setup(deps: Partial<Props>) {
        const logic = new Logic(deps as Props)
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

    // it('should be able to set entries', () => {
    //     const { logic, state } = setup()
    //     expect(state.entries.size).toBe(0)

    //     const entries = new Map()
    //     testEntries.forEach(e => entries.set(e.name, e))

    //     const nextStateA = logic.withMutation(
    //         state,
    //         logic.setEntries({
    //             event: { entries: testEntries },
    //             previousState: state,
    //         }),
    //     )

    //     expect(nextStateA.entries.size).toBe(testEntries.length)
    //     expect([...nextStateA.entries.keys()]).toEqual(
    //         expect.arrayContaining(testEntries.map(e => e.name)),
    //     )
    //     expect([...nextStateA.entries.values()]).toEqual(
    //         expect.arrayContaining(testEntries),
    //     )
    // })

    // it('should be able to add new checked entries', () => {
    //     const { logic, state } = setup()
    //     expect(state.entries.size).toBe(0)
    //     const testEntry = 'test entry'

    //     const nextStateA = logic.withMutation(
    //         state,
    //         logic.addEntry({
    //             event: { entry: { isChecked: false, name: testEntry } },
    //             previousState: state,
    //         }),
    //     )

    //     expect(nextStateA.entries.size).toBe(1)
    //     expect([...nextStateA.entries.keys()]).toEqual(
    //         expect.arrayContaining([testEntry]),
    //     )
    //     expect([...nextStateA.entries.values()]).toEqual(
    //         expect.arrayContaining([{ isChecked: true, name: testEntry }]),
    //     )
    // })

    // it('should be able to toggle checked entries', () => {
    //     const { logic, state } = setup()
    //     expect(state.entries.size).toBe(0)

    //     const entries = new Map()
    //     testEntries.forEach(e => entries.set(e.name, e))

    //     const nextStateA = logic.withMutation(
    //         state,
    //         logic.setEntries({
    //             event: { entries: testEntries },
    //             previousState: state,
    //         }),
    //     )

    //     expect(nextStateA.entries.size).toBe(testEntries.length)
    //     const testEntry = [...nextStateA.entries.values()][0]

    //     const toggleState = () =>
    //         logic.withMutation(
    //             nextStateA,
    //             logic.toggleEntryChecked({
    //                 event: { name: testEntry.name },
    //                 previousState: nextStateA,
    //             }),
    //         )

    //     // First toggle - flipped state
    //     expect(toggleState().entries.get(testEntry.name)).toMatchObject({
    //         ...testEntry,
    //         isChecked: !testEntry.isChecked,
    //     })

    //     // Second toggle - back to original state
    //     expect(toggleState().entries.get(testEntry.name)).toMatchObject(
    //         testEntry,
    //     )
    // })

    // it('should be able to set loading state', () => {
    //     const { logic, state } = setup()
    //     expect(state.isLoading).toBe(false)

    //     const nextStateA = logic.withMutation(
    //         state,
    //         logic.setIsLoading({
    //             event: { value: true },
    //             previousState: state,
    //         }),
    //     )

    //     expect(nextStateA.isLoading).toBe(true)

    //     const nextStateB = logic.withMutation(
    //         state,
    //         logic.setIsLoading({
    //             event: { value: false },
    //             previousState: nextStateA,
    //         }),
    //     )

    //     expect(nextStateB.isLoading).toBe(false)
    // })
})
