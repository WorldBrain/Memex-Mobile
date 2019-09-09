import React from 'react'
import { FlatList, ListRenderItem } from 'react-native'

import { NavigationScreen } from 'src/ui/types'
import Logic, { State, Event } from './logic'
import MetaPicker from '../../components/meta-picker'
import MetaPickerEntry from '../../components/meta-picker-entry'
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
    onEntryPress?: (item: MetaTypeShape) => void
}

export default class MetaPickerScreen extends NavigationScreen<
    Props,
    State,
    Event
> {
    static defaultProps: Partial<Props> = {
        onEntryPress: console.log,
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

        this.processEvent('setEntries', { entries })
        this.processEvent('setIsLoading', { value: false })
    }

    private get metaTypeName(): MetaTypeName {
        return this.props.type === 'collections' ? 'Collections' : 'Tags'
    }

    private initHandleEntryPress = (item: MetaTypeShape) => e => {
        this.props.onEntryPress(item)
        this.processEvent('toggleEntryChecked', {
            name: item.name,
        })
    }

    private renderPickerEntry: ListRenderItem<MetaTypeShape> = ({
        item,
        index,
    }) => (
        <MetaPickerEntry
            key={index}
            onPress={this.initHandleEntryPress(item)}
            text={item.name}
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
                />
            </MetaPicker>
        )
    }
}
