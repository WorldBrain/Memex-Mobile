import React from 'react'
import { FlatList, ListRenderItem } from 'react-native'

import {
    NavigationScreen,
    NavigationProps,
    UIStorageModules,
} from 'src/ui/types'
import Logic, { State, Event } from './logic'
import MetaPicker from '../../components/meta-picker'
import MetaPickerEntry from '../../components/meta-picker-entry'
import MetaPickerEmptyRow from '../../components/meta-picker-empty'
import SearchAddInput from '../../components/search-add-input'
import * as selectors from './selectors'
import {
    MetaType,
    MetaTypeShape,
    MetaTypeName,
} from 'src/features/meta-picker/types'
import LoadingBalls from 'src/ui/components/loading-balls'

interface Props extends NavigationProps {
    storage: UIStorageModules<'metaPicker'>
    url: string
    type: MetaType
    isSyncLoading: boolean
    initEntries: string[]
    onEntryPress: (item: MetaTypeShape) => void
}

export default class MetaPickerScreen extends NavigationScreen<
    Props,
    State,
    Event
> {
    static defaultProps: Partial<Props> = {
        onEntryPress: (item: MetaTypeShape) => undefined,
    }

    constructor(props: Props) {
        super(props, { logic: new Logic() })
    }

    componentDidMount() {
        this.fetchInitEntries()
    }

    private mergeThenSetEntries(entries: MetaTypeShape[]): void {
        this.processEvent('setEntries', {
            entries: entries.map(entry => {
                const currentEntry = this.state.entries.get(entry.name)
                const isChecked =
                    (currentEntry && currentEntry.isChecked) ||
                    entry.isChecked ||
                    this.props.initEntries.includes(entry.name)

                return {
                    name: entry.name,
                    isChecked,
                }
            }),
        })
    }

    private async fetchInitEntries() {
        const { metaPicker } = this.props.storage.modules
        let entries: MetaTypeShape[]
        this.processEvent('setIsLoading', { value: true })

        if (this.props.type === 'collections') {
            entries = await metaPicker.findListSuggestions({
                url: this.props.url,
            })
        } else {
            entries = await metaPicker.findTagSuggestions({
                url: this.props.url,
            })
        }

        // Add any entries passed from parent
        entries = [
            ...entries,
            ...this.props.initEntries.map(name => ({ name, isChecked: true })),
        ]

        this.mergeThenSetEntries(entries)
        this.processEvent('setIsLoading', { value: false })
    }

    private get metaTypeName(): MetaTypeName {
        return this.props.type === 'collections' ? 'Collections' : 'Tags'
    }

    private initHandleEntryPress = ({
        canAdd,
        ...item
    }: MetaTypeShape) => () => {
        this.props.onEntryPress(item)

        if (canAdd) {
            this.processEvent('addEntry', { entry: item })
        } else {
            this.processEvent('toggleEntryChecked', {
                name: item.name,
            })
        }
    }

    private renderPickerEntry: ListRenderItem<MetaTypeShape> = ({
        item,
        index,
    }) => (
        <MetaPickerEntry
            key={index}
            text={item.name}
            canAdd={item.canAdd}
            isChecked={item.isChecked}
            onPress={this.initHandleEntryPress(item)}
            showTextBackground={this.props.type === 'tags'}
        />
    )

    private handleInputText = async (text: string) => {
        const { metaPicker } = this.props.storage.modules

        const collection =
            this.props.type === 'collections' ? 'customLists' : 'tags'

        this.processEvent('setInputText', { text })
        this.processEvent('setIsLoading', { value: true })

        const entries = await metaPicker.suggest(this.props.url, {
            collection,
            query: { name: text },
        })

        this.processEvent('setIsLoading', { value: false })
        this.mergeThenSetEntries(entries)
    }

    render() {
        return (
            <MetaPicker>
                <SearchAddInput
                    type={this.metaTypeName}
                    value={selectors.inputText(this.state)}
                    onChange={this.handleInputText}
                />
                {this.props.isSyncLoading || this.state.isLoading ? (
                    <LoadingBall />
                ) : (
                    <FlatList
                        renderItem={this.renderPickerEntry}
                        data={selectors.pickerEntries(this.state)}
                        keyExtractor={(item, index) => index.toString()}
                        ListEmptyComponent={
                            <MetaPickerEmptyRow type={this.props.type} />
                        }
                    />
                )}
            </MetaPicker>
        )
    }
}
