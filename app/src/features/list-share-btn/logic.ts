import { UILogic, UIEvent, UIEventHandler } from 'ui-logic-core'
import { Share, Platform } from 'react-native'
import type { UIServices, UITaskState, UIStorageModules } from 'src/ui/types'
import { loadInitial, executeUITask } from 'src/ui/utils'
import { SharedListRoleID } from '@worldbrain/memex-common/lib/content-sharing/types'

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
                links,
            } = await this.deps.services.listKeys.getExistingKeyLinksForList({
                listReference: {
                    id: remoteListId,
                    type: 'shared-list-reference',
                },
            })

            this.emitMutation({
                commenterLink: {
                    $set:
                        links.find(
                            (l) => l.roleID === SharedListRoleID.Commenter,
                        )?.link ?? null,
                },
                contributorLink: {
                    $set:
                        links.find(
                            (l) => l.roleID === SharedListRoleID.ReadWrite,
                        )?.link ?? null,
                },
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

    shareList: EventHandler<'shareList'> = async ({ previousState }) => {
        const { listSharing, listKeys } = this.deps.services
        let remoteListId = previousState.remoteListId

        await executeUITask<State, 'listShareState'>(
            this,
            'listShareState',
            async () => {
                if (remoteListId == null) {
                    const shareResult = await listSharing.shareList({
                        localListId: this.deps.localListId,
                    })
                    remoteListId = shareResult.remoteListId
                }

                const [commenterLink, contributorLink] = await Promise.all(
                    [
                        SharedListRoleID.Commenter,
                        SharedListRoleID.ReadWrite,
                    ].map((roleID) =>
                        listKeys.generateKeyLink({
                            key: { roleID },
                            listReference: {
                                id: remoteListId!,
                                type: 'shared-list-reference',
                            },
                        }),
                    ),
                )

                this.emitMutation({
                    remoteListId: { $set: remoteListId },
                    commenterLink: { $set: commenterLink.link },
                    contributorLink: { $set: contributorLink.link },
                })
            },
        )
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

    pressBtn: EventHandler<'pressBtn'> = async ({ event, previousState }) => {
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
                                  await this.processUIEvent('shareList', {
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
