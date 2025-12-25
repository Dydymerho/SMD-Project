import React, { useMemo, useState } from 'react'
import { View, FlatList, Text } from 'react-native'

import SearchInput from './components/SearchInput'
import FilterRow from './components/FilterRow'
import CourseItem from './components/CourseItem'

import { styles } from './Searchstyles'
import { Course } from './types'

const MOCK_DATA: Course[] = [
    {
        id: '1',
        code: 'SE101',
        name: 'Software Engineering',
        major: 'CNTT',
        semester: 'HK1',
        year: 2025,
        published: true,
    },
    {
        id: '2',
        code: 'SE201',
        name: 'Advanced SE',
        major: 'CNTT',
        semester: 'HK2',
        year: 2025,
        published: true,
    },
]

export default function SearchScreen() {
    const [keyword, setKeyword] = useState('')
    const [major, setMajor] = useState('ALL')
    const [semester, setSemester] = useState('ALL')

    const filteredCourses = useMemo(() => {
        return MOCK_DATA.filter(course => {
            const matchKeyword =
                course.code.toLowerCase().includes(keyword.toLowerCase()) ||
                course.name.toLowerCase().includes(keyword.toLowerCase())

            const matchMajor =
                major === 'ALL' || course.major === major

            const matchSemester =
                semester === 'ALL' || course.semester === semester

            return matchKeyword && matchMajor && matchSemester
        })
    }, [keyword, major, semester])

    return (
        <View style={styles.container}>
            <SearchInput
                value={keyword}
                onChange={setKeyword}
            />

            <FilterRow
                major={major}
                semester={semester}
                onMajorChange={() =>
                    setMajor(prev => (prev === 'CNTT' ? 'ALL' : 'CNTT'))
                }
                onSemesterChange={() =>
                    setSemester(prev => (prev === 'HK1' ? 'ALL' : 'HK1'))
                }
            />

            <FlatList
                data={filteredCourses}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <CourseItem course={item} />
                )}
                ListEmptyComponent={
                    <Text style={styles.empty}>
                        Không tìm thấy môn học
                    </Text>
                }
            />
        </View>
    )
}
