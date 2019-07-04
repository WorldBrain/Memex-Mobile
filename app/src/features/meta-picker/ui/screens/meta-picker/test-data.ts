import { State } from './logic'

export default (): State => ({
    inputText: '',
    entries: new Map([
        ['test A', { name: 'test A', isChecked: true }],
        ['test B', { name: 'test B', isChecked: false }],
        ['test C', { name: 'test C', isChecked: false }],
        ['test D', { name: 'test D', isChecked: true }],
        ['test E', { name: 'test E', isChecked: false }],
        ['test F', { name: 'test F', isChecked: true }],
    ]),
})
