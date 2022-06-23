import React from 'react'
import { View, FlatList } from 'react-native'

import { StatefulUIElement } from 'src/ui/types'
import Logic, { Props, State, Event } from './logic'
import MetaPicker from '../../components/picker'
import MetaPickerEntry from '../../components/picker-entry'
import MetaPickerEmptyRow from '../../components/picker-entry-empty'
import SuggestInput from '../../components/suggest-input'
import type { SpacePickerEntry } from 'src/features/meta-picker/types'
import LoadingBalls from 'src/ui/components/loading-balls'
import styles from './styles'
import styled from 'styled-components/native'
import { normalizedStateToArray } from '@worldbrain/memex-common/lib/common-ui/utils/normalized-state'
import { validateSpaceName } from '@worldbrain/memex-common/lib/utils/space-name-validation'
import { NEW_ENTRY_ID } from './constants'

export interface MetaPickerScreenProps extends Props {
    className?: string
    ref?: (metaPicker: MetaPickerScreen) => void
}

export default class MetaPickerScreen extends StatefulUIElement<
    MetaPickerScreenProps,
    State,
    Event
> {
    private flatlistRef: React.RefObject<FlatList<SpacePickerEntry>>

    constructor(props: MetaPickerScreenProps) {
        super(props, new Logic(props))

        if (props.ref) {
            props.ref(this)
        }

        this.flatlistRef = React.createRef()
    }

    private get entries(): SpacePickerEntry[] {
        const inputText = this.state.inputText.trim()
        const entries = normalizedStateToArray(this.state.entries)
        const validationResult = validateSpaceName(inputText, entries)

        if (validationResult.valid) {
            return [
                {
                    id: NEW_ENTRY_ID,
                    name: this.state.inputText,
                    isChecked: false,
                },
                ...entries,
            ]
        }

        return entries
    }

    private scrollToTop = () => {
        this.flatlistRef?.current?.scrollToOffset({ animated: true, offset: 0 })
    }

    private initHandleEntryPress = (item: SpacePickerEntry) => async () => {
        if (item.id === NEW_ENTRY_ID) {
            await this.processEvent('addEntry', null)
        } else {
            await this.processEvent('toggleEntryChecked', { id: item.id })
        }

        setTimeout(() => {
            this.scrollToTop()
        }, 300)
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
                                    value={this.state.inputText}
                                    placeholder={
                                        this.props.suggestInputPlaceholder ??
                                        'Search & Add Spaces'
                                    }
                                    onChange={(text) =>
                                        this.processEvent('suggestEntries', {
                                            text,
                                        })
                                    }
                                />
                            </SearchContainer>
                            <View style={styles.listContainer}>
                                {this.state.searchState === 'running' ? (
                                    <LoadingBalls />
                                ) : (
                                    <FlatList
                                        ref={this.flatlistRef}
                                        data={this.entries}
                                        renderItem={({ item }) => (
                                            <MetaPickerEntry
                                                {...item}
                                                key={item.id}
                                                canAdd={
                                                    item.id === NEW_ENTRY_ID
                                                }
                                                onPress={this.initHandleEntryPress(
                                                    item,
                                                )}
                                            />
                                        )}
                                        keyExtractor={(item, index) =>
                                            index.toString()
                                        }
                                        showsVerticalScrollIndicator={false}
                                        keyboardShouldPersistTaps="always"
                                        ListEmptyComponent={
                                            <MetaPickerEmptyRow
                                                hasSearchInput={
                                                    this.state.inputText
                                                        .length > 0
                                                }
                                            />
                                        }
                                        ListFooterComponent={<EmptyItem />}
                                    />
                                )}
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
