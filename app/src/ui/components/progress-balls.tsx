import React from 'react'
import { View } from 'react-native'
import styled from 'styled-components/native'

import styles from './progress-balls.styles'

export interface Props {
    count?: number
    selectedIndex?: number
}

const ProgressBalls: React.StatelessComponent<Props> = ({
    count = 3,
    selectedIndex,
}) => (
    <View style={styles.container}>
        {[...Array(count)].map((_, i) => (
            <Ball
                key={i}
                selectedIndex={selectedIndex}
                isSelected={i === selectedIndex}
            />
        ))}
    </View>
)

const Ball = styled.View<{
    isSelected: boolean
}>`
    height: 20px;
    width: 20px;
    border-radius: 30px;
    background: ${(props) =>
        props.isSelected
            ? props.theme.colors.prime1 + '70'
            : props.theme.colors.greyScale2};
`

export default ProgressBalls
