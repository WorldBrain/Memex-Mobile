import Logic from './logic'
import initTestData from './test-data'

const { pages } = initTestData()
const testPages = [...pages.values()]
const testPageUrls = testPages.map(p => p.url)

describe('pages view UI logic tests', () => {
    function setup() {
        const logic = new Logic()
        const state = logic.getInitialState()

        return { logic, state }
    }

    it('should be able to set pages', () => {
        const { logic, state } = setup()

        // TODO: Test that init state is empty (once that's set up; currently sets init state to test data)
        const newStateA = logic.withMutation(
            state,
            logic.setPages({
                event: { pages: testPages },
                previousState: state,
            }),
        )

        expect(newStateA.pages.size).toBe(testPages.length)
        expect([...newStateA.pages.keys()]).toEqual(
            expect.arrayContaining(testPageUrls),
        )
    })

    it('should be able to delete pages', () => {
        const { logic, state } = setup()

        const url = testPageUrls[0]

        const newStateA = logic.withMutation(
            state,
            logic.setPages({
                event: { pages: testPages },
                previousState: state,
            }),
        )
        expect(newStateA.pages.get(url)).toBeDefined()
        expect(newStateA.pages.size).toBe(testPages.length)

        const newStateB = logic.withMutation(
            state,
            logic.deletePage({ event: { url }, previousState: newStateA }),
        )
        expect(newStateB.pages.get(url)).not.toBeDefined()
        expect(newStateB.pages.size).toBe(testPages.length - 1)
    })

    it('should be able to star + unstar pages', () => {
        const { logic, state } = setup()

        const url = testPageUrls[0]
        const newStateA = logic.withMutation(
            state,
            logic.setPages({
                event: { pages: testPages },
                previousState: state,
            }),
        )
        const pageA = newStateA.pages.get(url)!
        expect(pageA.isStarred).toBeFalsy()

        const newStateB = logic.withMutation(
            state,
            logic.togglePageStar({ event: { url }, previousState: newStateA }),
        )
        const pageB = newStateB.pages.get(url)!
        expect(pageB.isStarred).toBeTruthy()

        const newStateC = logic.withMutation(
            state,
            logic.togglePageStar({ event: { url }, previousState: newStateB }),
        )
        const pageC = newStateC.pages.get(url)!
        expect(pageC.isStarred).toBeFalsy()
    })
})
