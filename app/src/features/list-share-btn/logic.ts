import { UILogic, UIEvent, UIEventHandler } from 'ui-logic-core'
import { Share, Platform } from 'react-native'
import type { UIServices, UITaskState } from 'src/ui/types'
import { loadInitial, executeUITask } from 'src/ui/utils'
import { UIMutation } from '@worldbrain/memex-common/lib/main-ui/classes/logic'

export interface State {
    localListId: number
    remoteListId: string | null
    commenterLink: string | null
    contributorLink: string | null
    loadState: UITaskState
    listShareState: UITaskState
}

export type Event = UIEvent<{
    pressBtn: null
    shareList: null
    invokeCommenterLink: null
    invokeContributorLink: null
    resetListIds: { localListId: number; remoteListId: string | null }
}>

export interface Dependencies {
    localListId: number
    remoteListId?: string | null
    services: UIServices<'actionSheet' | 'listSharing' | 'listKeys'>
}

type EventHandler<EventName extends keyof Event> = UIEventHandler<
    State,
    Event,
    EventName
>

export default class Logic extends UILogic<State, Event> {
    constructor(private deps: Dependencies) {
        super()
    }

    getInitialState(): State {
        return {
            commenterLink: null,
            contributorLink: null,
            loadState: 'pristine',
            listShareState: 'pristine',
            localListId: this.deps.localListId,
            remoteListId: this.deps.remoteListId ?? null,
        }
    }

    init: EventHandler<'init'> = async ({ previousState }) => {
        await this.loadLinks(previousState.remoteListId)
    }

    private async loadLinks(remoteListId: string | null) {
        if (remoteListId == null) {
            this.emitMutation({
                commenterLink: { $set: null },
                contributorLink: { $set: null },
            })
            return
        }

        await loadInitial<State>(this, async () => {
            const {
                links: [commenterLink, contributorLink],
            } = await this.deps.services.listKeys.getExistingKeyLinksForList({
                listReference: {
                    id: remoteListId,
                    type: 'shared-list-reference',
                },
            })

            this.emitMutation({
                commenterLink: { $set: commenterLink?.link ?? null },
                contributorLink: { $set: contributorLink?.link ?? null },
            })
        })
    }

    resetListIds: EventHandler<'resetListIds'> = async ({ event }) => {
        await this.loadLinks(event.remoteListId)
        this.emitMutation({
            localListId: { $set: event.localListId },
            remoteListId: { $set: event.remoteListId },
        })
    }

    shareList: EventHandler<'shareList'> = async ({ event, previousState }) => {
        let nextState: State
        await executeUITask<State, 'listShareState'>(
            this,
            'listShareState',
            async () => {
                const {
                    links: [commenterLink, contributorLink],
                    remoteListId,
                } = await this.deps.services.listSharing.shareList({
                    localListId: previousState.localListId,
                })

                const mutation: UIMutation<State> = {
                    remoteListId: { $set: remoteListId },
                    commenterLink: { $set: commenterLink.link },
                    contributorLink: { $set: contributorLink.link },
                }
                this.emitMutation(mutation)
                nextState = this.withMutation(previousState, mutation)
            },
        )

        // Auto-display action sheet post-share
        await this.processUIEvent('pressBtn', {
            event,
            previousState: nextState!,
        })
    }

    private async shareLink(link: string | null, type: string) {
        if (link == null) {
            throw new Error(`${type} link doesn't exist to share`)
        }

        await Share.share({
            url: link,
            message: Platform.OS === 'ios' ? undefined : link,
        })
    }

    invokeCommenterLink: EventHandler<'invokeCommenterLink'> = async ({
        previousState,
    }) => {
        await this.shareLink(previousState.commenterLink, 'Commenter')
    }

    invokeContributorLink: EventHandler<'invokeContributorLink'> = async ({
        previousState,
    }) => {
        await this.shareLink(previousState.contributorLink, 'Contributor')
    }

    pressBtn: EventHandler<'pressBtn'> = async ({ previousState }) => {
        this.deps.services.actionSheet.show({
            hideOnSelection: true,
            title:
                previousState.remoteListId == null
                    ? 'Share Space'
                    : 'Share Space links',
            actions:
                previousState.remoteListId == null
                    ? [
                          {
                              key: 'create-invite-links',
                              title: 'Create invite links',
                              onPress: async () => {
                                  this.processUIEvent('shareList', {
                                      previousState,
                                      event: null,
                                  })
                              },
                          },
                      ]
                    : [
                          {
                              key: 'copy-commenter-link',
                              title: 'Share commenter link',
                              onPress: async () => {
                                  await this.processUIEvent(
                                      'invokeCommenterLink',
                                      { previousState, event: null },
                                  )
                              },
                          },
                          {
                              key: 'copy-contributor-link',
                              title: 'Share contributor link',
                              onPress: async () => {
                                  await this.processUIEvent(
                                      'invokeContributorLink',
                                      { previousState, event: null },
                                  )
                              },
                          },
                      ],
        })
    }
}
