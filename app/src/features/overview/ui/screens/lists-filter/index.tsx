import React from 'react'
import { TouchableOpacity, Image } from 'react-native'

import { NavigationScreen } from 'src/ui/types'
import Logic, { Props, State, Event } from './logic'
import Navigation from '../../components/navigation'
import MetaPicker from 'src/features/meta-picker/ui/screens/meta-picker'
import { MetaTypeShape } from 'src/features/meta-picker/types'
import navigationStyles from 'src/features/overview/ui/components/navigation.styles'
import { MOBILE_LIST_NAME } from '@worldbrain/memex-storage/lib/mobile-app/features/meta-picker/constants'
import styles from './styles'

export default class ListsFilter extends NavigationScreen<Props, State, Event> {
    private selectedEntryName?: string

    constructor(props: Props) {
        super(props, { logic: new Logic(props) })

        this.selectedEntryName = this.props.navigation.getParam('selectedList')
    }

    private handleEntryPress = async (item: MetaTypeShape) => {
        this.props.navigation.navigate('Overview', {
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
                            onPress={() =>
                                this.props.navigation.navigate('Overview', {
                                    selectedList: this.selectedEntryName,
                                })
                            }
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
                    onEntryPress={this.handleEntryPress}
                    suggestInputPlaceholder="Search Collections"
                    className={styles.filterContainer}
                    singleSelect
                    type="collections"
                    initEntry={
                        this.selectedEntryName === MOBILE_LIST_NAME
                            ? undefined
                            : this.selectedEntryName
                    }
                />
            </>
        )
    }
}
