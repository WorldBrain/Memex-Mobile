import React from 'react'
import { FlatList, ListRenderItem } from 'react-native'

import { NavigationScreen } from 'src/ui/types'
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

interface Props {
    url: string
    type: MetaType
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
            ...this.props.initEntries.map(name => ({ name, isChecked: true })),
            ...entries,
        ]

        this.processEvent('setEntries', { entries })
        this.processEvent('setIsLoading', { value: false })
    }

    private get metaTypeName(): MetaTypeName {
        return this.props.type === 'collections' ? 'Collections' : 'Tags'
    }

    private initHandleEntryPress = ({
        canAdd,
        ...item
    }: MetaTypeShape) => e => {
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
            onPress={this.initHandleEntryPress(item)}
            text={item.name}
            canAdd={item.canAdd}
            isChecked={item.isChecked}
        />
    )

    render() {
        return (
            <MetaPicker>
                <SearchAddInput
                    type={this.metaTypeName}
                    value={selectors.inputText(this.state)}
                    onChange={text =>
                        this.processEvent('setInputText', { text })
                    }
                />
                <FlatList
                    renderItem={this.renderPickerEntry}
                    data={selectors.pickerEntries(this.state)}
                    keyExtractor={(item, index) => index.toString()}
                    ListEmptyComponent={
                        <MetaPickerEmptyRow type={this.props.type} />
                    }
                />
            </MetaPicker>
        )
    }
}
