package com.smd.core.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

@Document(indexName = "syllabus")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SyllabusDocument {
    @Id
    private Long id;

    @Field(type = FieldType.Text, analyzer = "standard")
    private String subjectCode;

    @Field(type = FieldType.Text, analyzer = "standard")
    private String subjectName;

    @Field(type = FieldType.Text, analyzer = "standard")
    private String description;
}
