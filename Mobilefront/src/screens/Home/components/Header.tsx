import React from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation, NavigationProp } from '@react-navigation/native'


type HeaderProps = {
    title: string
    showRightIcon?: boolean
    onRightPress?: () => void
}                    

export default function Header({
    title,
    showRightIcon = false,
    onRightPress,
}: HeaderProps) {
    const insets = useSafeAreaInsets()
    const navigation = useNavigation<NavigationProp<any>>()
    const canGoBack = navigation.canGoBack()
    return (
        <View
            style={[
                styles.container,
                { paddingTop: insets.top + 12 },
            ]}
        >
            {/* LEFT */}
            <View style={styles.side}>
                {canGoBack ? (
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        hitSlop={10}
                    >
                        <Text style={styles.backIcon}>←</Text>
                    </TouchableOpacity>
                ) : (
                    <View />
                )}
            </View>

            {/* CENTER */}
            <View style={styles.center}>
                <Text
                    style={styles.title}
                    numberOfLines={1}
                >
                    {title}
                </Text>
            </View>

            {/* RIGHT */}
            <View style={styles.side}>
                {showRightIcon ? (
                    <TouchableOpacity
                        onPress={onRightPress}
                        hitSlop={10}
                    >
                        <Text style={styles.rightIcon}>🔔</Text>
                    </TouchableOpacity>
                ) : (
                    <View />
                )}
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        backgroundColor: '#2D5BFF',
        paddingHorizontal: 16,
        paddingBottom: 14,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomLeftRadius: 18,
        borderBottomRightRadius: 18,
    },

    side: {
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },

    center: {
        flex: 1,
        alignItems: 'center',
    },

    title: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },

    backIcon: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: '700',
    },

    rightIcon: {
        color: '#FFFFFF',
        fontSize: 18,
    },
})

