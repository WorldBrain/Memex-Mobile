import React from 'react'
import { View, FlatList, ListRenderItem } from 'react-native'

import { StatefulUIElement } from 'src/ui/types'
import Logic, { Props, State, Event } from './logic'
import MetaPicker from '../../components/picker'
import MetaPickerEntry from '../../components/picker-entry'
import MetaPickerEmptyRow from '../../components/picker-entry-empty'
import SuggestInput from '../../components/suggest-input'
import * as selectors from './selectors'
import type { MetaTypeShape } from 'src/features/meta-picker/types'
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

    private flatlistRef: React.RefObject<FlatList<MetaTypeShape>>

    constructor(props: MetaPickerScreenProps) {
        super(props, new Logic(props))

        if (props.ref) {
            props.ref(this)
        }

        this.flatlistRef = React.createRef()
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

        return `Search & Add Spaces`
    }

    private ScrollTop = () => {
        this.flatlistRef?.current?.scrollToOffset({ animated: true, offset: 0 })
    }

    private initHandleEntryPress =
        ({ canAdd, ...item }: MetaTypeShape) =>
        async () => {
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

            setTimeout(() => {
                this.ScrollTop()
            }, 300)
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
                                    ref={this.flatlistRef}
                                    keyboardShouldPersistTaps="always"
                                    renderItem={this.renderPickerEntry}
                                    data={selectors.pickerEntries(
                                        this.state,
                                        this.props,
                                    )}
                                    keyExtractor={(item, index) =>
                                        index.toString()
                                    }
                                    showsVerticalScrollIndicator={false}
                                    ListEmptyComponent={
                                        <MetaPickerEmptyRow
                                            hasSearchInput={
                                                this.state.inputText.length > 0
                                            }
                                        />
                                    }
                                    ListFooterComponent={<EmptyItem />}
                                />
                            </View>
                        </InnerContainer>
                    </ResultsContainer>
                )}
            </MetaPicker>
        )
    }
}

const EmptyItem = styled.View`
    height: 200px;
`

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
