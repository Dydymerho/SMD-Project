import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Course } from '../Types'

type Props = {
    course: Course
}

export default function CourseItem({ course }: Props) {
    return (
        <View style={styles.card}>
            <Text style={styles.code}>📘 {course.code}</Text>
            <Text style={styles.name}>{course.name}</Text>

            <View style={styles.metaRow}>
                <Text style={styles.meta}>
                    {course.published ? 'Published' : 'Draft'}
                </Text>
                <Text style={styles.meta}>{course.year}</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        padding: 14,
        borderRadius: 14,
        marginBottom: 12,
    },
    code: {
        fontSize: 15,
        fontWeight: '700',
    },
    name: {
        marginTop: 4,
        color: '#374151',
    },
    metaRow: {
        marginTop: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    meta: {
        fontSize: 12,
        color: '#6B7280',
    },
})
