import React, { useMemo, useState } from 'react'
import { View, FlatList, Text } from 'react-native'
import SearchInput from './components/SearchInput'
import FilterRow from './components/FilterRow'
import CourseItem from './components/CourseItem'
import { SUBJECTS } from '../../mock/Subject'
import { styles } from './Searchstyles'

export default function SearchScreen() {
    const [keyword, setKeyword] = useState('')
    const [major, setMajor] = useState('ALL')
    const [semester, setSemester] = useState('ALL')

    // Published courses only 
    const publishedSubjects = SUBJECTS.filter(subject => {
        return subject.published === true
    })

    const filteredCourses = useMemo(() => {
        return publishedSubjects.filter(course => {
            const matchKeyword =
                course.code.toLowerCase().includes(keyword.toLowerCase()) ||
                course.name.toLowerCase().includes(keyword.toLowerCase())

            const matchMajor =
                major === 'ALL' || course.major === major

            const matchSemester =
                semester === 'ALL' || course.semester === semester

            return matchKeyword && matchMajor && matchSemester
        })
    }, [keyword, major, semester, publishedSubjects])

    // Only major list 
    const uniqueMajors = Array.from(
        new Set(publishedSubjects.map(course => course.major))
    )

    // Only semester list
    const uniqueSemesters = Array.from(
        new Set(publishedSubjects.map(course => course.semester))
    )

    return (
        <View style={styles.container}>
            <SearchInput
                value={keyword}
                onChangeText={setKeyword}  // ✅ Đã sửa thành onChangeText
                placeholder="Tìm kiếm môn học..."
            />

            <FilterRow
                major={major}
                semester={semester}
                majorOptions={['ALL', ...uniqueMajors]}
                semesterOptions={['ALL', ...uniqueSemesters]}
                onMajorChange={setMajor}
                onSemesterChange={setSemester}
            />

            <FlatList
                data={filteredCourses}
                keyExtractor={item => item.code}
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