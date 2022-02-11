import React from 'react'
import { View, FlatList, ListRenderItem, Text } from 'react-native'

import { StatefulUIElement } from 'src/ui/types'
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
import styled from 'styled-components/native'

export interface MetaPickerScreenProps extends Props {
    ref?: (metaPicker: MetaPickerScreen) => void
}

export default class MetaPickerScreen extends StatefulUIElement<
    MetaPickerScreenProps,
    State,
    Event
> {
    static defaultProps: Partial<Props> = {
        onEntryPress: async (item: MetaTypeShape) => undefined,
    }

    constructor(props: MetaPickerScreenProps) {
        super(props, new Logic(props))

        if (props.ref) {
            props.ref(this)
        }
    }

    private get initEntries(): string[] {
        if (this.props.singleSelect) {
            return this.props.initSelectedEntry
                ? [this.props.initSelectedEntry]
                : []
        }

        return this.props.initSelectedEntries ?? []
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
        console.log(this.props.children)
        return (
            <MetaPicker className={this.props.className}>
                {this.state.loadState === 'running' ? (
                    <LoadingBallsContainer>
                        <LoadingBalls />
                    </LoadingBallsContainer>
                ) : (
                    <ResultsContainer>
                        <InnerContainer>
                            <SearchContainer>
                                <SearchInputContainer
                                    onChange={this.handleInputText}
                                    value={selectors.inputText(this.state)}
                                    placeholder={this.suggestInputPlaceholder}
                                />
                            </SearchContainer>
                            <View style={styles.listContainer}>
                                <FlatList
                                    keyboardShouldPersistTaps="always"
                                    renderItem={this.renderPickerEntry}
                                    data={selectors.pickerEntries(
                                        this.state,
                                        this.props,
                                    )}
                                    keyExtractor={(item, index) =>
                                        index.toString()
                                    }
                                    ListEmptyComponent={
                                        <MetaPickerEmptyRow
                                            hasSearchInput={
                                                this.state.inputText.length > 0
                                            }
                                            type={this.props.type}
                                        />
                                    }
                                />
                            </View>
                        </InnerContainer>
                    </ResultsContainer>
                )}
            </MetaPicker>
        )
    }
}

const InnerContainer = styled.View`
    width: 600px;
    max-width: 100%;
`

const SearchInputContainer = styled(SuggestInput)`
    background: ${(props) => props.theme.colors.backgroundColorDarker};
    width: 100%;
`

const SearchContainer = styled.View`
    width: 100%;
    height: 50px;
`

const ResultsContainer = styled.View`
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: flex-start;
    width: 100%;
    flex: 1;
    max-height: 100%;
    height: 100%;
    display: flex;
    align-items: flex-start;
`

const LoadingBallsContainer = styled.View`
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
`
