import React from 'react'
import { TouchableOpacity, Text, StyleSheet } from 'react-native'

type FilterButtonProps = {
    label: string
    value: string
    isActive: boolean
    onPress: (value: string) => void
}

export default function FilterButton({
    label,
    value,
    isActive,
    onPress
}: FilterButtonProps) {
    return (
        <TouchableOpacity
            style={[styles.button, isActive && styles.activeButton]}
            onPress={() => onPress(value)}
        >
            <Text style={[styles.text, isActive && styles.activeText]}>
                {label}
            </Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#F0F0F0',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    activeButton: {
        backgroundColor: '#007AFF',
    },
    text: {
        color: '#666',
        fontWeight: '500',
        fontSize: 14,
    },
    activeText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
})