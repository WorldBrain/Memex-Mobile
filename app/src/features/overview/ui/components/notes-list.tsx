import React from 'react'
import { FlatList, ListRenderItem, View, Text } from 'react-native'

import styles from './result-page-with-notes.styles'
import ResultNote from './result-note'
import { TouchEventHandler } from 'src/ui/types'
import { UINote, UIPage } from 'src/features/overview/types'
import * as icons from 'src/ui/components/icons/icons-list'
import styled from 'styled-components/native'
import Body, { Props as BodyProps } from './result-page-body'
import { Icon } from 'src/ui/components/icons/icon-mobile'

export interface Props {
    notes: UINote[]
    clearBackground?: boolean
    initNoteDelete: (note: UINote) => TouchEventHandler
    initNotePress: (note: UINote) => TouchEventHandler
    initNoteEdit: (note: UINote) => TouchEventHandler
    pageData?: UIPage
    onReaderPress?: TouchEventHandler
}

class NotesList extends React.PureComponent<Props> {
    private renderNote: ListRenderItem<UINote> = ({ item, index }) => (
        <ResultNote
            key={index}
            hideFooter
            onEditPress={this.props.initNoteEdit(item)}
            onNotePress={this.props.initNotePress(item)}
            onDeletePress={this.props.initNoteDelete(item)}
            clearBackground={this.props.clearBackground}
            {...item}
            isNotePressed={!!item.isNotePressed}
        />
    )

    private renderPageItem() {
        return (
            <PageResultCard onPress={this.props.onReaderPress}>
                <TopArea>
                    <Body
                        {...this.props.pageData}
                        date={this.props.pageData?.date}
                    />
                    <SpacesArea>
                        {this.props.pageData?.lists.map((entry) => (
                            <SpacePill>
                                <SpacePillText>{entry}</SpacePillText>
                            </SpacePill>
                        ))}
                    </SpacesArea>
                </TopArea>
            </PageResultCard>
        )
    }

    render() {
        return (
            <Container>
                {this.props.notes.length === 0 ? (
                    <NoResults>
                        <SectionCircle>
                            <Icon
                                icon={icons.Comment}
                                heightAndWidth={'30px'}
                                color="purple"
                                strokeWidth="3px"
                            />
                        </SectionCircle>
                        <NoResultsTitle>No Annotations</NoResultsTitle>
                        <NoResultsSubTitle style={styles.noResultsSubTitle}>
                            Add new annotations with the + icon
                        </NoResultsSubTitle>
                    </NoResults>
                ) : (
                    <ResultsContainer>
                        {this.renderPageItem()}
                        <FlatListContainer
                            renderItem={this.renderNote}
                            data={this.props.notes}
                            keyExtractor={(item, index) => index.toString()}
                            contentContainerStyle={styles.list}
                        />
                    </ResultsContainer>
                )}
            </Container>
        )
    }
}

export default NotesList

const SectionCircle = styled.View`
    background: ${(props) => props.theme.colors.backgroundHighlight};
    border-radius: 100px;
    height: 60px;
    width: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
`

const Container = styled.View`
    background: ${(props) => props.theme.colors.backgroundColor};
    width: 100%;
`

const NoResultsTitle = styled.Text`
    color: ${(props) => props.theme.colors.darkerText};
    font-size: 20px;
    font-weight: 800;
    text-align: center;
    margin-bottom: 10px;
    margin-top: 20px;
`

const NoResultsSubTitle = styled.Text`
    color: ${(props) => props.theme.colors.darkerText};
    font-size: 20px;
    font-weight: 400;
    text-align: center;
    margin-bottom: 10px;
`

const ResultsContainer = styled.View`
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
`

const NoResults = styled.View`
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding-top: 30px;
`

const ScrollContainer = styled.ScrollView`
    height: 50%;
    flex: 1;
    align-items: flex-end;
    display: flex;
`

const FlatListContainer = styled(FlatList)`
    display: flex;
    flex: 5;
    border-left-width: 4px;
    border-left-color: ${(props) => props.theme.colors.purple + '80'};
    padding-left: 10px;
    margin-left: 20px;
    margin-top: -10px;
    padding-top: 5px;
    width: 600px;
    max-width: 96%;
`

const PageResultCard = styled.TouchableOpacity`
    display: flex;
    flex-direction column;
    z-index: 1;
    width: 620px;
    max-width: 100%;
`

const ResultItem = styled.View`
    flex: 1;
    display: flex;
    flex-direction: column;
`

const TopArea = styled.View`
    padding: 15px;
    display: flex;
    flex-direction column;
    margin: 5px 10px;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    shadow-opacity: 0.5;
    shadow-radius: 5px;
    shadow-color: #e0e0e0;
    shadow-offset: 0px 2px;
    border-radius: 8px;
    background: white;
`

const Footer = styled.TouchableOpacity`
    border-top-color: ${(props) => props.theme.colors.lightgrey};
    border-top-width: 1px;
    height: 40px;
    align-items: center;
    display: flex;
    flex-direction: row;
    padding: 0 15px;
`

const SpacesArea = styled.View`
    display: flex;
    flex-direction: row;
    margin-top: 10px;
`

const SpacePill = styled.View`
    padding: 2px 7px;
    background: ${(props) => props.theme.colors.purple};
    align-items: center;
    display: flex;
    text-align-vertical: center;
    margin-right: 3px;
    border-radius: 3px;
`

const SpacePillText = styled.Text`
    color: white;
    display: flex;
    text-align-vertical: center;
`
