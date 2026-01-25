import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import FilterButton from './FilterButton'

type FilterRowProps = {
    major: string
    semester: string
    majorOptions: string[]
    semesterOptions: string[]
    onMajorChange: (major: string) => void
    onSemesterChange: (semester: string) => void
}

export default function FilterRow({
    major,
    semester,
    majorOptions,
    semesterOptions,
    onMajorChange,
    onSemesterChange,
}: FilterRowProps) {
    return (
        <View style={styles.container}>
            {/* Major Filter Section */}
            <View style={styles.filterSection}>
                <Text style={styles.sectionLabel}>Ngành:</Text>
                <View style={styles.buttonRow}>
                    {majorOptions.map(option => (
                        <FilterButton
                            key={option}
                            label={option === 'ALL' ? 'Tất cả' : option}
                            value={option}
                            isActive={major === option}
                            onPress={onMajorChange}
                        />
                    ))}
                </View>
            </View>

            {/* Semester Filter Section */}
            <View style={styles.filterSection}>
                <Text style={styles.sectionLabel}>Học kỳ:</Text>
                <View style={styles.buttonRow}>
                    {semesterOptions.map(option => (
                        <FilterButton
                            key={option}
                            label={option === 'ALL' ? 'Tất cả' : option}
                            value={option}
                            isActive={semester === option}
                            onPress={onSemesterChange}
                        />
                    ))}
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    filterSection: {
        marginBottom: 12,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
    },
    buttonRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
})