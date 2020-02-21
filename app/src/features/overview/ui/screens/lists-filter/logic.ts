import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from 'ui-logic-core'
import { MetaTypeShape } from '@worldbrain/memex-storage/lib/mobile-app/features/meta-picker/types'

import { NavigationProps, UITaskState, UIStorageModules } from 'src/ui/types'
import { loadInitial, executeUITask } from 'src/ui/utils'
import { UICollection } from 'src/features/overview/types'
import { Spec } from 'immutability-helper'

export interface Props extends NavigationProps {
    storage: UIStorageModules<'metaPicker' | 'pageEditor'>
    onEntryPressed?: (entry: MetaTypeShape, index: number) => Promise<void>
}

export interface State {
    inputValue: string
    loadState: UITaskState
    entries: MetaTypeShape[]
    selectedEntryName?: string
}

export type Event = UIEvent<{
    toggleEntryChecked: { item: MetaTypeShape; index: number }
    setInputValue: { value: string }
}>

export default class Logic extends UILogic<State, Event> {
    constructor(private props: Props) {
        super()
    }

    getInitialState(): State {
        return {
            entries: [],
            inputValue: '',
            loadState: 'pristine',
        }
    }

    async init() {
        const selectedListName = this.props.navigation.getParam('selected')

        await loadInitial<State>(this, async () => {
            const { metaPicker } = this.props.storage.modules

            let lists = await metaPicker.findListSuggestions({})

            if (selectedListName) {
                lists = lists.map(list => ({
                    ...list,
                    isChecked: list.name === selectedListName,
                }))
            }

            const mutation: Spec<State, never> = { entries: { $set: lists } }

            if (selectedListName) {
                mutation.selectedEntryName = { $set: selectedListName }
            }

            this.emitMutation(mutation)
        })
    }

    async toggleEntryChecked({
        previousState,
        event: { index, item },
    }: IncomingUIEvent<State, Event, 'toggleEntryChecked'>) {
        const setUnchecked = (entry: MetaTypeShape): MetaTypeShape => ({
            ...entry,
            isChecked: false,
        })

        const mutation: Spec<State, never> = {
            entries: {
                $set: [
                    ...previousState.entries.slice(0, index).map(setUnchecked),
                    { ...item, isChecked: !item.isChecked },
                    ...previousState.entries.slice(index + 1).map(setUnchecked),
                ],
            },
        }

        if (!item.isChecked) {
            mutation.selectedEntryName = { $set: item.name }
        }

        this.emitMutation(mutation)

        if (this.props.onEntryPressed) {
            return this.props.onEntryPressed(item, index)
        }
    }

    async setInputValue({
        event: { value },
        previousState,
    }: IncomingUIEvent<State, Event, 'setInputValue'>) {
        const selected = previousState.selectedEntryName

        await executeUITask<State, 'loadState', void>(
            this,
            'loadState',
            async () => {
                this.emitMutation({ inputValue: { $set: value } })

                return this.suggestNewEntries(value, selected)
            },
        )
    }

    private async suggestNewEntries(text: string, selected?: string) {
        const { metaPicker } = this.props.storage.modules

        const results = await metaPicker.suggest({
            collection: 'customLists',
            query: { name: text },
        })

        this.emitMutation({
            entries: {
                $set: results.map(res => ({
                    ...res,
                    isChecked: res.name === selected,
                })),
            },
        })
    }
}
