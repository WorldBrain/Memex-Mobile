import { State } from './logic'

export default (): State => ({
    selectedCollection: null,
    collections: [
        { id: 0, name: 'test collection A' },
        { id: 1, name: 'test collection B' },
        { id: 2, name: 'test collection C' },
        { id: 3, name: 'test collection D' },
        { id: 4, name: 'test collection E' },
        { id: 5, name: 'test collection F' },
    ],
})
