import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AppHeader({ title }: { title: string }) {
    return (
        <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        backgroundColor: '#2563eb',
        paddingTop: 40,
        paddingBottom: 16,
        alignItems: 'center',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    title: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
    },
});
