import Logic from './logic'
import { UICollection } from 'src/features/overview/types'

const testCollections: UICollection[] = [
    { id: 0, name: 'testA' },
    { id: 1, name: 'testB' },
    { id: 2, name: 'testC' },
]

describe('collections view UI logic tests', () => {
    function setup() {
        const logic = new Logic()
        const state = logic.getInitialState()

        return { logic, state }
    }

    it('should be able to set collections', () => {
        const { logic, state } = setup()

        const newState = logic.withMutation(
            state,
            logic.setCollections({
                event: { collections: new Set(testCollections) },
                previousState: state,
            }),
        )

        expect([...state.collections]).not.toEqual(
            expect.arrayContaining(testCollections),
        )
        expect([...newState.collections]).toEqual(
            expect.arrayContaining(testCollections),
        )
    })

    it('should be able to select collections', () => {
        const { logic, state } = setup()

        const newStateA = logic.withMutation(
            state,
            logic.setCollections({
                event: { collections: new Set(testCollections) },
                previousState: state,
            }),
        )

        const newStateB = logic.withMutation(
            state,
            logic.selectCollection({
                event: { name: testCollections[0].name },
                previousState: newStateA,
            }),
        )

        expect([...newStateA.collections]).toEqual(
            expect.arrayContaining(testCollections),
        )
        expect(newStateA.selectedCollection).not.toEqual(
            testCollections[0].name,
        )
        expect(newStateB.selectedCollection).toEqual(testCollections[0].name)
    })
})
