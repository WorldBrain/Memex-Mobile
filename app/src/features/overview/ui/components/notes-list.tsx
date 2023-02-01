import React from 'react'
import { FlatList, ListRenderItem } from 'react-native'

import styles from './result-page-with-notes.styles'
import ResultNote from './result-note'
import { TouchEventHandler } from 'src/ui/types'
import { UINote, UIPage } from 'src/features/overview/types'
import * as icons from 'src/ui/components/icons/icons-list'
import styled from 'styled-components/native'
import Body from './result-page-body'
import { Icon } from 'src/ui/components/icons/icon-mobile'
import SpacePill from 'src/ui/components/space-pill'
import type { List } from 'src/features/meta-picker/types'
import type { AnnotationPrivacyLevels } from '@worldbrain/memex-common/lib/annotations/types'
import type { ActionSheetServiceInterface } from 'src/services/action-sheet/types'

export interface Props {
    notes: UINote[]
    actionSheetService: ActionSheetServiceInterface
    pageData?: Omit<UIPage, 'notes'>
    clearBackground?: boolean
    listData: { [listId: string]: List }
    initNotePrivacyLevelSet: (
        note: UINote,
    ) => (level: AnnotationPrivacyLevels) => void
    initNoteAddSpaces: (note: UINote) => TouchEventHandler
    initNoteDelete: (note: UINote) => TouchEventHandler
    initNotePress: (note: UINote) => TouchEventHandler
    initNoteEdit: (note: UINote) => TouchEventHandler
}

class NotesList extends React.PureComponent<Props> {
    private renderNote: ListRenderItem<UINote> = ({ item }) => (
        <ResultNote
            hideFooter
            actionSheetService={this.props.actionSheetService}
            onEditPress={this.props.initNoteEdit(item)}
            onNotePress={this.props.initNotePress(item)}
            onDeletePress={this.props.initNoteDelete(item)}
            onAddSpacesPress={this.props.initNoteAddSpaces(item)}
            onPrivacyLevelSet={this.props.initNotePrivacyLevelSet(item)}
            clearBackground={this.props.clearBackground}
            {...item}
            privacyLevel={item.privacyLevel!}
            isNotePressed={!!item.isNotePressed}
            hasSharedLists={item.listIds.some(
                (listId) => this.props.listData[listId]?.remoteId != null,
            )}
            remoteId={item.remoteId}
            spaces={item.listIds.map(
                (listId, i) =>
                    this.props.listData[listId] ?? {
                        id: i,
                        name: 'Missing Space',
                    },
            )}
        />
    )

    private renderPageItem() {
        const { pageData, listData } = this.props
        return (
            <PageResultCard>
                <TopArea>
                    <Body {...pageData!} date={pageData?.date} />
                    <SpacesArea>
                        {pageData?.listIds.map((listId) => (
                            <SpacePill
                                key={listId}
                                name={listData[listId]?.name}
                                isShared={listData[listId]?.remoteId != null}
                            />
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
                            keyExtractor={(item) => item.url}
                            contentContainerStyle={styles.list}
                            ListFooterComponent={<EmptyItem />}
                            showsVerticalScrollIndicator={false}
                        />
                    </ResultsContainer>
                )}
            </Container>
        )
    }
}

export default NotesList

const EmptyItem = styled.View`
    height: 200px;
`

const SectionCircle = styled.View`
    background: ${(props) => props.theme.colors.greyScale2};
    border-radius: 100px;
    height: 60px;
    width: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
`

const Container = styled.View`
    background: ${(props) => props.theme.colors.black};
    width: 100%;
    margin-top: 10px;
    flex: 1;
`

const NoResultsTitle = styled.Text`
    color: ${(props) => props.theme.colors.greyScale6};
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
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    flex: 1;
`

const NoResults = styled.View`
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding-top: 30px;
`

const FlatListContainer = (styled(FlatList)`
    display: flex;
    border-left-width: 4px;
    border-left-color: ${(props) => props.theme.colors.purple + '80'};
    padding-left: 10px;
    margin-left: 10px;
    margin-top: -10px;
    padding-top: 5px;
    padding-right: 10px;
    width: 94%;
    max-width: 600px;
    flex: 1;
` as unknown) as typeof FlatList

const PageResultCard = styled.View`
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
