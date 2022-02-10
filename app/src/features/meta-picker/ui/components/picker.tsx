import React from 'react'
import { View } from 'react-native'

import styles from './picker.styles'
import styled from 'styled-components/native'

export interface Props {
    className?: string
}

const MetaPicker: React.StatelessComponent<Props> = (props) => (
    <Container style={[styles.container, props.className]}>
        {props.children}
    </Container>
)

const Container = styled.View`
    margin: 10px;
`

export default MetaPicker
