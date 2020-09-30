import React from 'react'
import { TouchableOpacity, Image } from 'react-native'

import { StatefulUIElement } from 'src/ui/types'
import Logic, { Props, State, Event } from './logic'
import Navigation from '../../components/navigation'
import MetaPicker from 'src/features/meta-picker/ui/screens/meta-picker'
import { MetaTypeShape } from 'src/features/meta-picker/types'
import navigationStyles from 'src/features/overview/ui/components/navigation.styles'
import { MOBILE_LIST_NAME } from '@worldbrain/memex-storage/lib/mobile-app/features/meta-picker/constants'
import styles from './styles'

export default class ListsFilter extends StatefulUIElement<
    Props,
    State,
    Event
> {
    static MAGIC_VISITS_FILTER = 'All History'
    static MAGIC_BMS_FILTER = 'All Bookmarks'

    private selectedEntryName?: string

    constructor(props: Props) {
        super(props, new Logic(props))

        this.selectedEntryName = this.props.route.params.selectedList
    }

    private get magicFilters(): string[] {
        return [ListsFilter.MAGIC_VISITS_FILTER, ListsFilter.MAGIC_BMS_FILTER]
    }

    private handleEntryPress = async (item: MetaTypeShape) => {
        this.props.navigation.navigate('Dashboard', {
            selectedList: item.isChecked ? MOBILE_LIST_NAME : item.name,
        })
    }

    render() {
        return (
            <>
                <Navigation
                    titleText="Collections"
                    renderLeftIcon={() => (
                        <TouchableOpacity
                            onPress={this.props.navigation.goBack}
                            style={navigationStyles.btnContainer}
                        >
                            <Image
                                style={navigationStyles.backIcon}
                                resizeMode="contain"
                                source={require('src/ui/img/arrow-back.png')}
                            />
                        </TouchableOpacity>
                    )}
                />
                <MetaPicker
                    {...this.props}
                    extraEntries={this.magicFilters}
                    onEntryPress={this.handleEntryPress}
                    suggestInputPlaceholder="Search Collections"
                    className={styles.filterContainer}
                    singleSelect
                    type="collections"
                    initSelectedEntry={
                        this.selectedEntryName === MOBILE_LIST_NAME
                            ? undefined
                            : this.selectedEntryName
                    }
                />
            </>
        )
    }
}
