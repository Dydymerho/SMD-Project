import React from 'react'
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native'

type Props = {
    major: string
    semester: string
    onMajorChange: () => void
    onSemesterChange: () => void
}

export default function FilterRow({
    major,
    semester,
    onMajorChange,
    onSemesterChange,
}: Props) {
    return (
        <View style={styles.row}>
            <FilterButton
                label="Ngành"
                value={major}
                onPress={onMajorChange}
            />
            <FilterButton
                label="Học kỳ"
                value={semester}
                onPress={onSemesterChange}
            />
        </View>
    )
}

function FilterButton({
    label,
    value,
    onPress,
}: {
    label: string
    value: string
    onPress: () => void
}) {
    return (
        <TouchableOpacity style={styles.button} onPress={onPress}>
            <Text style={styles.text}>
                {label}: {value}
            </Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    button: {
        backgroundColor: '#E5EDFF',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
    },
    text: {
        color: '#1D4ED8',
        fontWeight: '600',
    },
})
