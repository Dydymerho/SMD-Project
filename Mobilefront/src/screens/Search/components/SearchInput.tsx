import React from 'react'
import { View, TextInput, StyleSheet } from 'react-native'

type Props = {
    value: string
    onChange: (text: string) => void
}

export default function SearchInput({ value, onChange }: Props) {
    return (
        <View style={styles.container}>
            <TextInput
                placeholder="Tìm theo tên hoặc mã môn"
                value={value}
                onChangeText={onChange}
                style={styles.input}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 12,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        height: 44,
        paddingHorizontal: 14,
        fontSize: 15,
    },
})
