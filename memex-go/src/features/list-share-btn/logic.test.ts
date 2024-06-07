import { makeStorageTestFactory } from 'src/index.tests'
import Logic, { State, Event, Dependencies } from './logic'
import { FakeStatefulUIElement } from 'src/ui/index.tests'
import type { TestDevice } from 'src/types.tests'
import { ActionSheetShowOptions } from 'src/services/action-sheet/types'

const TEST_LIST_A = { id: 1, name: 'test list a' }
const TEST_LIST_B = {
    id: 2,
    name: 'test list b',
    remoteId: '',
    contributorLink: '',
    commenterLink: '',
}

async function setupTest(
    { storage, services }: TestDevice,
    params: Partial<Dependencies> & { skipTestData?: boolean },
) {
    if (!params.skipTestData) {
        await storage.modules.metaPicker.createList({
            __id: TEST_LIST_A.id,
            name: TEST_LIST_A.name,
        })
        await storage.modules.metaPicker.createList({
            __id: TEST_LIST_B.id,
            name: TEST_LIST_B.name,
        })
        const { remoteListId, links } = await services.listSharing.shareList({
            localListId: TEST_LIST_B.id,
        })
        TEST_LIST_B.remoteId = remoteListId
        TEST_LIST_B.commenterLink = links[0].link
        TEST_LIST_B.contributorLink = links[1].link
    }

    const logic = new Logic({
        services,
        localListId: TEST_LIST_A.id,
        ...params,
    })
    const element = new FakeStatefulUIElement<State, Event>(logic)

    return { element, logic }
}

describe('list share button UI logic tests', () => {
    const it = makeStorageTestFactory()

    it('should not load any links if list is not yet shared', async (context) => {
        const { element } = await setupTest(context, {})

        expect(element.state.loadState).toEqual('pristine')
        expect(element.state.commenterLink).toBeNull()
        expect(element.state.contributorLink).toBeNull()

        await element.init()

        expect(element.state.loadState).toEqual('pristine')
        expect(element.state.remoteListId).toBeNull()
        expect(element.state.commenterLink).toBeNull()
        expect(element.state.contributorLink).toBeNull()
    })

    it('should load links if list is already shared', async (context) => {
        const { element } = await setupTest(context, {
            localListId: TEST_LIST_B.id,
            remoteListId: TEST_LIST_B.remoteId,
        })

        expect(element.state.loadState).toEqual('pristine')
        expect(element.state.commenterLink).toBeNull()
        expect(element.state.contributorLink).toBeNull()

        await element.init()

        expect(element.state.loadState).toEqual('done')
        expect(element.state.commenterLink).toEqual(TEST_LIST_B.commenterLink)
        expect(element.state.contributorLink).toEqual(
            TEST_LIST_B.contributorLink,
        )
    })

    it('should be able to swap between lists, reloading any links', async (context) => {
        const { element } = await setupTest(context, {})

        expect(element.state.loadState).toEqual('pristine')
        expect(element.state.localListId).toEqual(TEST_LIST_A.id)
        expect(element.state.remoteListId).toBeNull()
        expect(element.state.commenterLink).toBeNull()
        expect(element.state.contributorLink).toBeNull()

        await element.init()

        expect(element.state.loadState).toEqual('pristine')
        expect(element.state.localListId).toEqual(TEST_LIST_A.id)
        expect(element.state.remoteListId).toBeNull()
        expect(element.state.commenterLink).toBeNull()
        expect(element.state.contributorLink).toBeNull()

        await element.processEvent('resetListIds', {
            localListId: TEST_LIST_B.id,
            remoteListId: TEST_LIST_B.remoteId,
        })

        expect(element.state.loadState).toEqual('done')
        expect(element.state.localListId).toEqual(TEST_LIST_B.id)
        expect(element.state.remoteListId).toEqual(TEST_LIST_B.remoteId)
        expect(element.state.commenterLink).toEqual(TEST_LIST_B.commenterLink)
        expect(element.state.contributorLink).toEqual(
            TEST_LIST_B.contributorLink,
        )

        await element.processEvent('resetListIds', {
            localListId: TEST_LIST_A.id,
            remoteListId: null,
        })

        expect(element.state.localListId).toEqual(TEST_LIST_A.id)
        expect(element.state.remoteListId).toBeNull()
        expect(element.state.commenterLink).toBeNull()
        expect(element.state.contributorLink).toBeNull()
    })

    it('should auto-show action sheet with share link options after sharing a list', async (context) => {
        let shownActionSheet: ActionSheetShowOptions | null = null
        const { element } = await setupTest(context, {
            services: {
                ...context.services,
                actionSheet: {
                    show: (opts) => {
                        shownActionSheet = opts
                    },
                    hide: () => {},
                },
            },
        })

        await element.init()

        expect(element.state.listShareState).toEqual('pristine')
        expect(element.state.localListId).toEqual(TEST_LIST_A.id)
        expect(element.state.remoteListId).toBeNull()
        expect(element.state.commenterLink).toBeNull()
        expect(element.state.contributorLink).toBeNull()
        expect(shownActionSheet).toBeNull()

        await element.processEvent('shareList', null)

        expect(element.state.listShareState).toEqual('done')
        expect(element.state.localListId).toEqual(TEST_LIST_A.id)
        expect(element.state.remoteListId).toEqual(expect.any(String))
        expect(element.state.commenterLink).toEqual(expect.any(String))
        expect(element.state.contributorLink).toEqual(expect.any(String))
        expect(shownActionSheet).toEqual({
            hideOnSelection: true,
            title: 'Share Space links',
            actions: [
                expect.objectContaining({ key: 'copy-commenter-link' }),
                expect.objectContaining({ key: 'copy-contributor-link' }),
            ],
        })
    })
})
