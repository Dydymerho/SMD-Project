import React from 'react'
import { View, TextInput, StyleSheet } from 'react-native'

type Props = {
    value: string
    onChangeText: (text: string) => void
    placeholder?: string  // Thêm prop optional
}

export default function SearchInput({
    value,
    onChangeText,
    placeholder = "Tìm theo tên hoặc mã môn" // Giá trị mặc định
}: Props) {
    return (
        <View style={styles.container}>
            <TextInput
                placeholder={placeholder}  // Sử dụng prop
                value={value}
                onChangeText={onChangeText}
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