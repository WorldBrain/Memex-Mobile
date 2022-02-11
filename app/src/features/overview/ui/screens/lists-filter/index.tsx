import React from 'react'
import { TouchableOpacity, Image } from 'react-native'

import { StatefulUIElement } from 'src/ui/types'
import Logic, { Props, State, Event } from './logic'
import Navigation from '../../components/navigation'
import MetaPicker from 'src/features/meta-picker/ui/screens/meta-picker'
import { MetaTypeShape } from 'src/features/meta-picker/types'
import navigationStyles from 'src/features/overview/ui/components/navigation.styles'
import { SPECIAL_LIST_NAMES } from '@worldbrain/memex-common/lib/storage/modules/lists/constants'
import styles from './styles'
import * as icons from 'src/ui/components/icons/icons-list'
import styled from 'styled-components/native'

export default class ListsFilter extends StatefulUIElement<
    Props,
    State,
    Event
> {
    static MAGIC_VISITS_FILTER = 'All Saved'
    static MAGIC_BMS_FILTER = 'All Bookmarks'

    private selectedEntryName?: string

    constructor(props: Props) {
        super(props, new Logic(props))

        this.selectedEntryName = this.props.route.params.selectedList
    }

    private get magicFilters(): string[] {
        return [ListsFilter.MAGIC_VISITS_FILTER]
    }

    private handleEntryPress = async (item: MetaTypeShape) => {
        this.props.navigation.navigate('Dashboard', {
            selectedList: item.isChecked
                ? SPECIAL_LIST_NAMES.MOBILE
                : item.name,
        })
    }

    render() {
        return (
            <Container>
                <Navigation
                    titleText="Select a Space"
                    leftIcon={icons.BackArrow}
                    leftBtnPress={this.props.navigation.goBack}
                    leftIconSize={'30px'}
                    leftIconStrokeWidth={'5px'}
                />
                <MetaPickerContainer>
                    <MetaPicker
                        {...this.props}
                        extraEntries={this.magicFilters}
                        onEntryPress={this.handleEntryPress}
                        suggestInputPlaceholder="Search Spaces"
                        singleSelect
                        type="collections"
                        initSelectedEntry={
                            this.selectedEntryName === SPECIAL_LIST_NAMES.MOBILE
                                ? undefined
                                : this.selectedEntryName
                        }
                    />
                </MetaPickerContainer>
            </Container>
        )
    }
}

const Container = styled.SafeAreaView`
    position: absolute;
    width: 100%;
    flex: 1;
    max-height: 100%;
    height: 100%;
    display: flex;
    align-items: center;
`

const MetaPickerContainer = styled.View`
    max-width: 500px;
    justify-content: center;
    display: flex;
    width: 100%;
    height: 100%;
`
