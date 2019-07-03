import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'

import styles from './menu.styles'
import { ResultType } from '../../types'
import ResultSwitch from './result-type-switch'

export interface Props {
    selected: ResultType
    showCollectionsView: boolean
    setResultType: (type: ResultType) => void
    toggleCollectionsView: () => void
    toggleMenuView: () => void
}

const Menu: React.StatelessComponent<Props> = props => (
    <View
        style={[
            styles.mainContainer,
            props.showCollectionsView ? null : styles.mainContainerBtm,
        ]}
    >
        <View style={styles.topContainer}>
            <TouchableOpacity onPress={props.toggleCollectionsView}>
                <Text style={styles.collectionsText}>All Collections</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={props.toggleMenuView}>
                <Text>Menu</Text>
            </TouchableOpacity>
        </View>
        {!props.showCollectionsView && (
            <View style={styles.bottomContainer}>
                <ResultSwitch type="pages" {...props}>
                    Pages
                </ResultSwitch>
                <ResultSwitch type="notes" {...props}>
                    Notes
                </ResultSwitch>
            </View>
        )}
    </View>
)

export default Menu
