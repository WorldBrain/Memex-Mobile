import React from 'react'
import { View, FlatList, ListRenderItem } from 'react-native'

import { NavigationScreen } from 'src/ui/types'
import Logic, { Props, State, Event } from './logic'
import MetaPicker from '../../components/meta-picker'
import MetaPickerEntry from '../../components/meta-picker-entry'
import MetaPickerEmptyRow from '../../components/meta-picker-empty'
import SearchAddInput from '../../components/search-add-input'
import * as selectors from './selectors'
import { MetaTypeShape, MetaTypeName } from 'src/features/meta-picker/types'
import LoadingBalls from 'src/ui/components/loading-balls'
import styles from './styles'

export default class MetaPickerScreen extends NavigationScreen<
    Props,
    State,
    Event
> {
    static defaultProps: Partial<Props> = {
        onEntryPress: (item: MetaTypeShape) => undefined,
    }

    constructor(props: Props) {
        super(props, { logic: new Logic(props) })
    }

    private get metaTypeName(): MetaTypeName {
        return this.props.type === 'collections' ? 'Collections' : 'Tags'
    }

    private initHandleEntryPress = ({
        canAdd,
        ...item
    }: MetaTypeShape) => async () => {
        this.props.onEntryPress(item)

        if (canAdd) {
            await this.processEvent('addEntry', {
                entry: item,
                selected: this.props.initEntries,
            })
        } else {
            await this.processEvent('toggleEntryChecked', {
                name: item.name,
                selected: this.props.initEntries,
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

    private handleInputText = (text: string) => {
        this.processEvent('suggestEntries', {
            text,
            selected: this.props.initEntries,
        })
    }

    render() {
        return (
            <MetaPicker>
                <SearchAddInput
                    type={this.metaTypeName}
                    value={selectors.inputText(this.state)}
                    onChange={this.handleInputText}
                />
                {this.props.isSyncLoading ||
                this.state.loadState === 'running' ? (
                    <View style={styles.loadingBallContainer}>
                        <LoadingBalls style={styles.loadingBalls} />
                    </View>
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
