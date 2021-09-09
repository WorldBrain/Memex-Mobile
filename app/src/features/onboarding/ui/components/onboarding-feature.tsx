import React, { useState, useEffect } from 'react'
import { View, Text, Image, Dimensions, Platform } from 'react-native'
import { useDeviceOrientation } from '@react-native-community/hooks'

import styles from './onboarding-feature.styles'
import { or } from 'react-native-reanimated'

export interface Props {
    optional?: string
    headingText: string
    secondaryText: string
}

const { height, width } = Dimensions.get('window')
const aspectRatio = height / width

const OnboardingFeature = (props) => {
    const orientation = useDeviceOrientation()
    // const [orientation , setOrientation] = useState(true);

    // useEffect(() => {
    //     console.log("Effect Run");
    //     Dimensions.addEventListener('change', () => {
    //         setOrientation(orientationInfo.portrait ? true : false);
    //     })
    // })

    return Platform.OS === 'ios' ? (
        //Code For ios

        <View style={styles.mainContainer}>
            <View
                style={
                    aspectRatio > 1.6
                        ? styles.imgContainer
                        : {
                              flex: orientation.portrait == true ? 1 : 1,
                              width:
                                  orientation.portrait == true ? '40%' : '35%',
                              justifyContent: 'center',
                              alignItems: 'center',
                          }
                }
            >
                {props.children}
            </View>
            <View
                style={
                    aspectRatio > 1.6
                        ? styles.textContainer
                        : {
                              flex: orientation.portrait == true ? 1 : 1,
                              width:
                                  orientation.portrait == true ? '40%' : '35%',
                              alignItems: 'center',
                          }
                }
            >
                {props.optional && (
                    <Text
                        style={
                            aspectRatio > 1.6
                                ? styles.optional
                                : {
                                      position: 'relative',
                                      fontWeight: 'bold',
                                      color: 'green',
                                      textAlign: 'center',
                                      fontSize: 20,
                                      marginVertical: 10,
                                  }
                        }
                    >
                        {props.optional}
                    </Text>
                )}
                <Text
                    style={
                        aspectRatio > 1.6
                            ? styles.headingText
                            : {
                                  position: 'relative',
                                  fontWeight: 'bold',
                                  color: 'black',
                                  textAlign: 'center',
                                  fontSize:
                                      orientation.portrait == true ? 28 : 24,
                                  width: '100%',
                              }
                    }
                >
                    {props.headingText}
                </Text>
                <Text
                    style={
                        aspectRatio > 1.6
                            ? styles.secondaryText
                            : {
                                  position: 'relative',
                                  color: '#3A2F45',
                                  textAlign: 'center',
                                  fontSize:
                                      orientation.portrait == true ? 20 : 20,
                                  top: orientation.portrait == true ? 20 : 20,
                                  lineHeight:
                                      orientation.portrait == true ? 30 : 30,
                              }
                    }
                >
                    {props.secondaryText}
                </Text>
            </View>
        </View>
    ) : (
        //Code for Android

        <View style={styles.mainContainer}>
            <View style={styles.imgContainer}>{props.children}</View>
            <View style={styles.textContainer}>
                {props.optional && (
                    <Text style={styles.optional}>{props.optional}</Text>
                )}
                <Text style={styles.headingText}>{props.headingText}</Text>
                <Text style={styles.secondaryText}>{props.secondaryText}</Text>
            </View>
        </View>
    )
}

export default OnboardingFeature
