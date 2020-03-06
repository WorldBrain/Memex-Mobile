import React from 'react'
import { View, FlatList, ListRenderItem, Text } from 'react-native'

import { NavigationScreen } from 'src/ui/types'
import Logic, { Props, State, Event } from './logic'
import MetaPicker from '../../components/picker'
import MetaPickerEntry from '../../components/picker-entry'
import MetaPickerEmptyRow from '../../components/picker-entry-empty'
import SuggestInput from '../../components/suggest-input'
import * as selectors from './selectors'
import { MetaTypeShape } from 'src/features/meta-picker/types'
import { getMetaTypeName } from 'src/features/meta-picker/utils'
import LoadingBalls from 'src/ui/components/loading-balls'
import styles from './styles'

export interface MetaPickerScreenProps extends Props {
    ref?: (metaPicker: MetaPickerScreen) => void
}

export default class MetaPickerScreen extends NavigationScreen<
    MetaPickerScreenProps,
    State,
    Event
> {
    static defaultProps: Partial<Props> = {
        onEntryPress: async (item: MetaTypeShape) => undefined,
    }

    constructor(props: MetaPickerScreenProps) {
        super(props, { logic: new Logic(props) })

        if (props.ref) {
            props.ref(this)
        }
    }

    private get initEntries(): string[] {
        if (this.props.singleSelect) {
            return this.props.initEntry ? [this.props.initEntry] : []
        }

        return this.props.initEntries ?? []
    }

    private get suggestInputPlaceholder(): string {
        if (this.props.suggestInputPlaceholder) {
            return this.props.suggestInputPlaceholder
        }

        return `Search & Add ${getMetaTypeName(this.props.type)}`
    }

    private initHandleEntryPress = ({
        canAdd,
        ...item
    }: MetaTypeShape) => async () => {
        await this.props.onEntryPress(item)

        if (canAdd) {
            await this.processEvent('addEntry', {
                entry: item,
                selected: this.initEntries,
            })
        } else {
            await this.processEvent('toggleEntryChecked', {
                name: item.name,
                selected: this.initEntries,
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
            selected: this.initEntries,
        })
    }

    render() {
        return (
            <MetaPicker className={this.props.className}>
                {this.state.loadState === 'running' ? (
                    <View style={styles.loadingBallContainer}>
                        <LoadingBalls style={styles.loadingBalls} />
                    </View>
                ) : (
                    <View style={styles.resultContainer}>
                        <View style={styles.searchContainer}>
                            <SuggestInput
                                onChange={this.handleInputText}
                                value={selectors.inputText(this.state)}
                                placeholder={this.suggestInputPlaceholder}
                            />
                        </View>
                        <View style={styles.listContainer}>
                            <FlatList
                                renderItem={this.renderPickerEntry}
                                data={selectors.pickerEntries(
                                    this.state,
                                    this.props,
                                )}
                                keyExtractor={(item, index) => index.toString()}
                                ListEmptyComponent={
                                    <MetaPickerEmptyRow
                                        type={this.props.type}
                                    />
                                }
                            />
                        </View>
                    </View>
                )}
            </MetaPicker>
        )
    }
}
