import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
    title: string;
};

export default function Header({ title }: Props) {
    const insets = useSafeAreaInsets();

    return (
        <View
            style={[
                styles.header,
                { paddingTop: insets.top + 12 },
            ]}
        >
            <Text style={styles.title}>{title}</Text>

            <View style={styles.icons}>
                <Text style={styles.icon}>🔔</Text>
                <Text style={styles.icon}>📩</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        backgroundColor: '#2D5BFF',
        paddingHorizontal: 20,
        paddingBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomLeftRadius: 18,
        borderBottomRightRadius: 18,
    },
    title: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    icons: {
        flexDirection: 'row',
        gap: 12,
    },
    icon: {
        fontSize: 18,
        color: '#fff',
    },
});
