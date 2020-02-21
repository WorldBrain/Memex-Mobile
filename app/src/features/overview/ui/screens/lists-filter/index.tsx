import React from 'react'
import {
    View,
    FlatList,
    ListRenderItem,
    GestureResponderEvent,
} from 'react-native'

import { NavigationScreen } from 'src/ui/types'
import Logic, { Props, State, Event } from './logic'
import styles from './styles'
import CollectionEntry from '../../components/collection-entry'
import { UICollection } from 'src/features/overview/types'
import Navigation from '../../components/navigation'
import * as selectors from './selectors'
import Button from 'src/ui/components/memex-btn'
import MetaPicker from 'src/features/meta-picker/ui/components/meta-picker'
import MetaPickerEntry from 'src/features/meta-picker/ui/components/meta-picker-entry'
import LoadingBalls from 'src/ui/components/loading-balls'
import SearchInput from 'src/features/meta-picker/ui/components/search-add-input'
import { MetaTypeShape, MetaTypeName } from 'src/features/meta-picker/types'

export default class ListsFilter extends NavigationScreen<Props, State, Event> {
    constructor(props: Props) {
        super(props, { logic: new Logic(props) })
    }

    private initHandleEntryPress = (
        item: MetaTypeShape,
        index: number,
    ) => async () => {
        this.processEvent('toggleEntryChecked', { item, index })
    }

    private handleInputChange = (value: string) =>
        this.processEvent('setInputValue', { value })

    private renderPickerEntry: ListRenderItem<MetaTypeShape> = ({
        item,
        index,
    }) => (
        <MetaPickerEntry
            key={index}
            text={item.name}
            isChecked={item.isChecked}
            onPress={this.initHandleEntryPress(item, index)}
        />
    )

    render() {
        return (
            <>
                <Navigation
                    titleText="Collections"
                    renderLeftIcon={() => (
                        <Button
                            title="Back"
                            empty
                            onPress={() =>
                                this.props.navigation.navigate('Overview')
                            }
                        />
                    )}
                />
                <MetaPicker>
                    <SearchInput
                        placeholder="Search Collections"
                        onChange={this.handleInputChange}
                        value={this.state.inputValue}
                    />
                    {this.state.loadState === 'running' ? (
                        <View style={styles.loadingBallContainer}>
                            <LoadingBalls style={styles.loadingBalls} />
                        </View>
                    ) : (
                        <FlatList
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={this.renderPickerEntry}
                            data={this.state.entries}
                        />
                    )}
                </MetaPicker>
            </>
        )
    }
}
