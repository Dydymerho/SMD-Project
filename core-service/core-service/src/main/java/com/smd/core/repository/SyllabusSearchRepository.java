package com.smd.core.repository;

import com.smd.core.document.SyllabusDocument;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SyllabusSearchRepository extends ElasticsearchRepository<SyllabusDocument, Long> {
    
    // Tìm kiếm giáo trình mà Tên hoặc Mã hoặc Mô tả chứa từ khóa
    List<SyllabusDocument> findBySubjectNameContainingOrSubjectCodeContainingOrFullTextContaining(
            String name, String code, String fullText
    );
}