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
})
