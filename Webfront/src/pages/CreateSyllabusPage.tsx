import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, FolderOpen, MessageSquare, Search, GitCompare, Bell, User,
  Plus, ArrowLeft, Send, Upload, FileText, Sparkles
} from 'lucide-react';
import NotificationMenu from '../components/NotificationMenu';
import { useToast } from '../hooks/useToast';
import Toast from '../components/Toast';
import AILoadingOverlay from '../components/AILoadingOverlay';
import { 
  getCourses, 
  getPrograms, 
  createSyllabus, uploadPdfForOCR, getAITaskStatus
} from '../services/api';
import axiosClient from '../api/axiosClient';

interface CLOItem {
  id: string;
  code: string;
  description: string;
  bloomLevel: string;
}

interface PLOMapping {
  ploCode: string;
  weight: number;
}

interface Assessment {
  name: string;
  weight: number;
  criteria: string;
}

interface SessionPlan {
  weekNo: number;
  topic: string;
  teachingMethod: string;
}

interface Material {
  title: string;
  author: string;
  type: string;
}

const CreateSyllabusPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toasts, removeToast, success, error, info } = useToast();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  
  // Basic Info
  const [courseId, setCourseId] = useState<number>(0);
  const [programId, setProgramId] = useState<number>(0);
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [availablePrograms, setAvailablePrograms] = useState<any[]>([]);
  const [academicYear, setAcademicYear] = useState('');
  const [semester, setSemester] = useState('');
  
  // CLO/PLO
  const [clos, setClos] = useState<CLOItem[]>([
    { id: '1', code: 'CLO1', description: '', bloomLevel: 'Remember' }
  ]);
  const [ploMappings, setPloMappings] = useState<{ [cloId: string]: PLOMapping[] }>({
    '1': [{ ploCode: 'PLO1', weight: 0 }]
  });
  
  // Assessment
  const [assessments, setAssessments] = useState<Assessment[]>([
    { name: '', weight: 0, criteria: '' }
  ]);
  
  // Session Plan
  const [sessionPlans, setSessionPlans] = useState<SessionPlan[]>([
    { weekNo: 1, topic: '', teachingMethod: '' }
  ]);
  
  // Materials
  const [materials, setMaterials] = useState<Material[]>([
    { title: '', author: '', type: 'TEXTBOOK' }
  ]);
  
  // PDF Upload
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [aiResult, setAiResult] = useState<string>('');
  const [showAIResult, setShowAIResult] = useState(false);
  
  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load courses and programs on mount
  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [courses, programs] = await Promise.all([
          getCourses(),
          getPrograms()
        ]);
        setAvailableCourses(courses);
        setAvailablePrograms(programs);
        if (programs.length > 0) {
          setProgramId(programs[0].programId);
        }
      } catch (error) {
        console.error('Error loading courses/programs:', error);
      }
    };
    loadData();
  }, []);

  // CLO Functions
  const addCLO = () => {
    const newId = (clos.length + 1).toString();
    setClos([...clos, { 
      id: newId, 
      code: `CLO${clos.length + 1}`, 
      description: '', 
      bloomLevel: 'Remember' 
    }]);
    setPloMappings({
      ...ploMappings,
      [newId]: [{ ploCode: 'PLO1', weight: 0 }]
    });
  };

  const removeCLO = (id: string) => {
    setClos(clos.filter(clo => clo.id !== id));
    const newMappings = { ...ploMappings };
    delete newMappings[id];
    setPloMappings(newMappings);
  };

  const updateCLO = (id: string, field: keyof CLOItem, value: string) => {
    setClos(clos.map(clo => 
      clo.id === id ? { ...clo, [field]: value } : clo
    ));
  };

  // PLO Mapping Functions
  const addPLOMapping = (cloId: string) => {
    setPloMappings({
      ...ploMappings,
      [cloId]: [...(ploMappings[cloId] || []), { ploCode: 'PLO1', weight: 0 }]
    });
  };

  const removePLOMapping = (cloId: string, index: number) => {
    setPloMappings({
      ...ploMappings,
      [cloId]: ploMappings[cloId].filter((_, i) => i !== index)
    });
  };

  const updatePLOMapping = (cloId: string, index: number, field: keyof PLOMapping, value: string | number) => {
    setPloMappings({
      ...ploMappings,
      [cloId]: ploMappings[cloId].map((plo, i) => 
        i === index ? { ...plo, [field]: value } : plo
      )
    });
  };

  // Assessment Functions
  const addAssessment = () => {
    setAssessments([...assessments, { name: '', weight: 0, criteria: '' }]);
  };

  const removeAssessment = (index: number) => {
    setAssessments(assessments.filter((_, i) => i !== index));
  };

  const updateAssessment = (index: number, field: keyof Assessment, value: string | number) => {
    setAssessments(assessments.map((assessment, i) => 
      i === index ? { ...assessment, [field]: value } : assessment
    ));
  };

  // Session Plan Functions
  const addSessionPlan = () => {
    setSessionPlans([...sessionPlans, { 
      weekNo: sessionPlans.length + 1, 
      topic: '', 
      teachingMethod: '' 
    }]);
  };

  const removeSessionPlan = (index: number) => {
    setSessionPlans(sessionPlans.filter((_, i) => i !== index));
  };

  const updateSessionPlan = (index: number, field: keyof SessionPlan, value: string | number) => {
    setSessionPlans(sessionPlans.map((plan, i) => 
      i === index ? { ...plan, [field]: value } : plan
    ));
  };

  // Material Functions
  const addMaterial = () => {
    setMaterials([...materials, { title: '', author: '', type: 'TEXTBOOK' }]);
  };

  const removeMaterial = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const updateMaterial = (index: number, field: keyof Material, value: string) => {
    setMaterials(materials.map((material, i) => 
      i === index ? { ...material, [field]: value } : material
    ));
  };

  // PDF Upload
  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        setPdfFile(file);
        setUploadStatus('success');
        info(`File đã được chọn: ${file.name}`);
      } else {
        setUploadStatus('error');
        error('Vui lòng chọn file PDF');
      }
    }
  };

// AI Process PDF - Updated version
const handleAIProcess = async () => {
  if (!pdfFile) {
    error('Vui lòng chọn file PDF trước');
    return;
  }
  
  setIsAIProcessing(true);
  setAiResult('');
  setShowAIResult(false);
  info('Đang upload file PDF lên AI service...');
  
  try {
    // Step 1: Upload PDF to AI service
    const { task_id } = await uploadPdfForOCR(pdfFile);
    console.log('Task ID:', task_id);
    info(`Đã tạo task AI: ${task_id}`);
    
    // Step 2: Poll for result
    let attempts = 0;
    const maxAttempts = 60; // 60 attempts * 2 seconds = 2 minutes max
    
    const pollResult = async (): Promise<any> => {
      attempts++;
      
      if (attempts > maxAttempts) {
        throw new Error('Timeout: AI xử lý quá lâu');
      }
      
      const result = await getAITaskStatus(task_id);
      console.log('Poll attempt', attempts, ':', result);
      
      // Check task status
      if (result.status === 'completed') {
        return result;
      } else if (result.status === 'failed') {
        throw new Error(result.error || 'AI xử lý thất bại');
      } else {
        // Still processing, wait and retry
        info(`AI đang xử lý... (${attempts}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        return pollResult();
      }
    };
    
    const finalResult = await pollResult();
    
    // Display result in textbox
    setAiResult(JSON.stringify(finalResult, null, 2));
    setShowAIResult(true);
    success('✅ AI đã xử lý file PDF thành công!');
    
  } catch (err: any) {
    console.error('Error processing PDF with AI:', err);
    const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi xử lý PDF';
    error(`❌ ${errorMessage}`);
    setAiResult(`Error: ${errorMessage}`);
    setShowAIResult(true);
  } finally {
    setIsAIProcessing(false);
  }
};

  // Form Submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Validate
      if (!courseId || !academicYear) {
        error('Vui lòng chọn môn học và năm học');
        setIsSubmitting(false);
        return;
      }

      // Calculate total assessment weight
      const totalWeight = assessments.reduce((sum, a) => sum + Number(a.weight), 0);
      if (Math.abs(totalWeight - 100) > 0.01) {
        error(`Tổng trọng số đánh giá phải bằng 100% (hiện tại: ${totalWeight}%)`);
        setIsSubmitting(false);
        return;
      }

      // Step 1: Create Syllabus
      const syllabusData = {
        course: { courseId: courseId },
        lecturer: { userId: Number(user?.id) },
        ...(programId && { program: { programId: programId } }),
        academicYear,
        currentStatus: 'DRAFT'
      };

      console.log('Creating syllabus with payload:', syllabusData);
      const createdSyllabus = await createSyllabus(syllabusData);
      const syllabusId = (createdSyllabus as any)?.syllabusId || (createdSyllabus as any)?.id;

      if (!syllabusId) {
        throw new Error('Failed to get syllabus ID from response');
      }

      console.log('Created syllabus with ID:', syllabusId);

      // Step 2: Create CLOs
      const cloPromises = clos
        .filter(clo => clo.code && clo.description)
        .map(clo => 
          axiosClient.post('/clos', {
            syllabus: { syllabusId },
            cloCode: clo.code,
            cloDescription: clo.description
          })
        );
      
      if (cloPromises.length > 0) {
        await Promise.all(cloPromises);
        console.log(`Created ${cloPromises.length} CLOs`);
      }

      // Step 3: Create Assessments
      const assessmentPromises = assessments
        .filter(a => a.name)
        .map(assessment =>
          axiosClient.post('/assessments', {
            syllabus: { syllabusId },
            name: assessment.name,
            weightPercent: Number(assessment.weight),
            criteria: assessment.criteria || ''
          })
        );

      if (assessmentPromises.length > 0) {
        await Promise.all(assessmentPromises);
        console.log(`Created ${assessmentPromises.length} assessments`);
      }

      // Step 4: Create Session Plans
      const sessionPromises = sessionPlans
        .filter(s => s.topic)
        .map(session =>
          axiosClient.post('/session-plans', {
            syllabus: { syllabusId },
            weekNo: session.weekNo,
            topic: session.topic,
            teachingMethod: session.teachingMethod || ''
          })
        );

      if (sessionPromises.length > 0) {
        await Promise.all(sessionPromises);
        console.log(`Created ${sessionPromises.length} session plans`);
      }

      // Step 5: Create Materials
      const materialPromises = materials
        .filter(m => m.title)
        .map(material =>
          axiosClient.post('/materials', {
            syllabus: { syllabusId },
            title: material.title,
            author: material.author || '',
            materialType: material.type
          })
        );

      if (materialPromises.length > 0) {
        await Promise.all(materialPromises);
        console.log(`Created ${materialPromises.length} materials`);
      }

      success('✅ Tạo đề cương thành công!');
      navigate(`/syllabus/edit/${syllabusId}`);
      
    } catch (error: any) {
      console.error('Error creating syllabus:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      
      if (error.response?.status === 409) {
        const message = error.response?.data?.message || 'Đã tồn tại giáo trình cho môn học này trong năm học này';
        const existingSyllabusId = error.response?.data?.existingSyllabusId;
        
        if (existingSyllabusId && window.confirm(`${message}\n\nBạn có muốn chỉnh sửa giáo trình hiện có không?`)) {
          navigate(`/syllabus/edit/${existingSyllabusId}`);
        } else {
          error(`❌ ${message}`);
        }
      } else if (error.response?.data?.message) {
        error(`❌ ${error.response.data.message}`);
      } else {
        error('❌ Có lỗi xảy ra khi tạo đề cương');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="form-section">
            {/* AI Upload Banner */}
            <div className="ai-upload-banner">
              <div className="ai-upload-header">
                <Sparkles size={32} className="ai-icon" />
                <div className="ai-upload-title">
                  <h2>Tạo nhanh với AI</h2>
                  <p>Upload file PDF đề cương, AI sẽ tự động trích xuất và điền thông tin</p>
                </div>
              </div>
              
              <div className="ai-upload-content">
                <div className="upload-dropzone">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handlePdfUpload}
                    id="pdf-upload-ai"
                    className="file-input-hidden"
                  />
                  <label htmlFor="pdf-upload-ai" className="upload-dropzone-label">
                    {pdfFile ? (
                      <>
                        <FileText size={48} className="upload-icon-success" />
                        <div className="upload-file-info">
                          <div className="upload-file-name">{pdfFile.name}</div>
                          <div className="upload-file-size">
                            {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <Upload size={48} className="upload-icon" />
                        <div className="upload-text-main">Kéo thả file PDF vào đây</div>
                        <div className="upload-text-sub">hoặc click để chọn file</div>
                        <div className="upload-text-hint">Hỗ trợ file PDF, tối đa 10MB</div>
                      </>
                    )}
                  </label>
                </div>
                
                {pdfFile && (
                  <>
                    <button
                      type="button"
                      onClick={handleAIProcess}
                      disabled={isAIProcessing}
                      className="btn-ai-process"
                    >
                      <Sparkles size={20} />
                      {isAIProcessing ? 'AI đang xử lý...' : 'Xử lý bằng AI'}
                    </button>
                    
                    {/* AI Result Display */}
                    {showAIResult && (
                      <div className="ai-result-box">
                        <div className="ai-result-header">
                          <h4>Kết quả từ AI:</h4>
                        </div>
                        <textarea
                          className="ai-result-textarea"
                          value={aiResult}
                          readOnly
                          rows={15}
                          placeholder="Kết quả AI sẽ hiển thị ở đây..."
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
              
              <div className="ai-upload-divider">
                <span>HOẶC NHẬP THỦ CÔNG</span>
              </div>
            </div>

            {/* Manual Input Form */}
            <h2 style={{ marginTop: '30px' }}>Thông tin cơ bản</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label>Chọn môn học *</label>
                <select 
                  value={courseId} 
                  onChange={(e) => setCourseId(Number(e.target.value))}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                >
                  <option value={0}>-- Chọn môn học --</option>
                  {availableCourses.map((course) => (
                    <option key={course.courseId} value={course.courseId}>
                      {course.courseCode} - {course.courseName} ({course.credits} tín chỉ)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Chương trình học *</label>
                <select 
                  value={programId} 
                  onChange={(e) => setProgramId(Number(e.target.value))}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                >
                  <option value={0}>-- Chọn chương trình --</option>
                  {availablePrograms.map((program) => (
                    <option key={program.programId} value={program.programId}>
                      {program.programName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Năm học *</label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  placeholder="2024-2025"
                />
              </div>
              
              <div className="form-group">
                <label>Học kỳ</label>
                <select value={semester} onChange={(e) => setSemester(e.target.value)}>
                  <option value="">Chọn học kỳ</option>
                  <option value="HK1">Học kỳ 1</option>
                  <option value="HK2">Học kỳ 2</option>
                  <option value="HK3">Học kỳ hè</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="form-section">
            <h2>CLO (Course Learning Outcomes) và PLO Mapping</h2>
            
            {clos.map((clo, index) => (
              <div key={clo.id} className="clo-block">
                <div className="clo-header">
                  <h3>CLO {index + 1}</h3>
                  {clos.length > 1 && (
                    <button 
                      type="button"
                      onClick={() => removeCLO(clo.id)}
                      className="btn-remove"
                    >
                      ✕ Xóa
                    </button>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Mã CLO</label>
                    <input
                      type="text"
                      value={clo.code}
                      onChange={(e) => updateCLO(clo.id, 'code', e.target.value)}
                      placeholder="CLO1"
                    />
                  </div>
                  
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Bloom's Taxonomy Level</label>
                    <select
                      value={clo.bloomLevel}
                      onChange={(e) => updateCLO(clo.id, 'bloomLevel', e.target.value)}
                    >
                      <option value="Remember">Remember (Nhớ)</option>
                      <option value="Understand">Understand (Hiểu)</option>
                      <option value="Apply">Apply (Áp dụng)</option>
                      <option value="Analyze">Analyze (Phân tích)</option>
                      <option value="Evaluate">Evaluate (Đánh giá)</option>
                      <option value="Create">Create (Sáng tạo)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Mô tả CLO</label>
                  <textarea
                    value={clo.description}
                    onChange={(e) => updateCLO(clo.id, 'description', e.target.value)}
                    placeholder="Sau khi hoàn thành môn học, sinh viên có khả năng..."
                    rows={3}
                  />
                </div>

                <div className="plo-mappings">
                  <h4>PLO Mapping</h4>
                  {(ploMappings[clo.id] || []).map((plo, pIndex) => (
                    <div key={pIndex} className="plo-mapping-row">
                      <div className="form-group" style={{ flex: 2 }}>
                        <input
                          type="text"
                          value={plo.ploCode}
                          onChange={(e) => updatePLOMapping(clo.id, pIndex, 'ploCode', e.target.value)}
                          placeholder="PLO1"
                        />
                      </div>
                      <div className="form-group" style={{ flex: 1 }}>
                        <input
                          type="number"
                          value={plo.weight}
                          onChange={(e) => updatePLOMapping(clo.id, pIndex, 'weight', Number(e.target.value))}
                          placeholder="Trọng số (%)"
                          min="0"
                          max="100"
                        />
                      </div>
                      {(ploMappings[clo.id] || []).length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePLOMapping(clo.id, pIndex)}
                          className="btn-remove-small"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addPLOMapping(clo.id)}
                    className="btn-add-small"
                  >
                    + Thêm PLO
                  </button>
                </div>
              </div>
            ))}

            <button type="button" onClick={addCLO} className="btn-add">
              + Thêm CLO
            </button>
          </div>
        );

      case 3:
        return (
          <div className="form-section">
            <h2>Phương pháp đánh giá</h2>
            
            {assessments.map((assessment, index) => (
              <div key={index} className="assessment-block">
                <div className="form-row">
                  <div className="form-group" style={{ flex: 2 }}>
                    <label>Tên phương pháp đánh giá</label>
                    <input
                      type="text"
                      value={assessment.name}
                      onChange={(e) => updateAssessment(index, 'name', e.target.value)}
                      placeholder="VD: Bài kiểm tra giữa kỳ"
                    />
                  </div>
                  
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Trọng số (%)</label>
                    <input
                      type="number"
                      value={assessment.weight}
                      onChange={(e) => updateAssessment(index, 'weight', Number(e.target.value))}
                      placeholder="30"
                      min="0"
                      max="100"
                    />
                  </div>
                  
                  {assessments.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAssessment(index)}
                      className="btn-remove"
                      style={{ marginTop: '25px' }}
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="form-group">
                  <label>Tiêu chí đánh giá</label>
                  <textarea
                    value={assessment.criteria}
                    onChange={(e) => updateAssessment(index, 'criteria', e.target.value)}
                    placeholder="Mô tả chi tiết về tiêu chí đánh giá..."
                    rows={2}
                  />
                </div>
              </div>
            ))}

            <button type="button" onClick={addAssessment} className="btn-add">
              + Thêm phương pháp đánh giá
            </button>

            <div className="assessment-total">
              <strong>Tổng trọng số: </strong>
              <span className={assessments.reduce((sum, a) => sum + Number(a.weight), 0) === 100 ? 'valid' : 'invalid'}>
                {assessments.reduce((sum, a) => sum + Number(a.weight), 0)}%
              </span>
              {assessments.reduce((sum, a) => sum + Number(a.weight), 0) !== 100 && (
                <span className="error-msg"> (Phải bằng 100%)</span>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="form-section">
            <h2>Kế hoạch giảng dạy</h2>
            
            {sessionPlans.map((plan, index) => (
              <div key={index} className="session-block">
                <div className="form-row">
                  <div className="form-group" style={{ flex: 0.5 }}>
                    <label>Tuần</label>
                    <input
                      type="number"
                      value={plan.weekNo}
                      onChange={(e) => updateSessionPlan(index, 'weekNo', Number(e.target.value))}
                      min="1"
                    />
                  </div>
                  
                  <div className="form-group" style={{ flex: 2 }}>
                    <label>Chủ đề</label>
                    <input
                      type="text"
                      value={plan.topic}
                      onChange={(e) => updateSessionPlan(index, 'topic', e.target.value)}
                      placeholder="VD: Giới thiệu về lập trình"
                    />
                  </div>
                  
                  <div className="form-group" style={{ flex: 1.5 }}>
                    <label>Phương pháp giảng dạy</label>
                    <input
                      type="text"
                      value={plan.teachingMethod}
                      onChange={(e) => updateSessionPlan(index, 'teachingMethod', e.target.value)}
                      placeholder="VD: Lý thuyết + Thực hành"
                    />
                  </div>
                  
                  {sessionPlans.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSessionPlan(index)}
                      className="btn-remove"
                      style={{ marginTop: '25px' }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button type="button" onClick={addSessionPlan} className="btn-add">
              + Thêm tuần học
            </button>
          </div>
        );

      case 5:
        return (
          <div className="form-section">
            <h2>Tài liệu tham khảo</h2>
            
            {materials.map((material, index) => (
              <div key={index} className="material-block">
                <div className="form-row">
                  <div className="form-group" style={{ flex: 2 }}>
                    <label>Tên tài liệu</label>
                    <input
                      type="text"
                      value={material.title}
                      onChange={(e) => updateMaterial(index, 'title', e.target.value)}
                      placeholder="VD: Introduction to Programming"
                    />
                  </div>
                  
                  <div className="form-group" style={{ flex: 1.5 }}>
                    <label>Tác giả</label>
                    <input
                      type="text"
                      value={material.author}
                      onChange={(e) => updateMaterial(index, 'author', e.target.value)}
                      placeholder="VD: John Doe"
                    />
                  </div>
                  
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Loại tài liệu</label>
                    <select
                      value={material.type}
                      onChange={(e) => updateMaterial(index, 'type', e.target.value)}
                    >
                      <option value="TEXTBOOK">Sách giáo khoa</option>
                      <option value="REFERENCE_BOOK">Sách tham khảo</option>
                      <option value="JOURNAL">Tạp chí</option>
                      <option value="WEBSITE">Website</option>
                      <option value="VIDEO">Video</option>
                      <option value="OTHER">Khác</option>
                    </select>
                  </div>
                  
                  {materials.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMaterial(index)}
                      className="btn-remove"
                      style={{ marginTop: '25px' }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button type="button" onClick={addMaterial} className="btn-add">
              + Thêm tài liệu
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="dashboard-page">
      <AILoadingOverlay isVisible={isAIProcessing} message="AI đang xử lý file PDF..." />
      
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo"></div>
          <h2>SMD System</h2>
          <p>Giảng viên</p>
        </div>

        <nav className="sidebar-nav">
          <a 
            href="#" 
            className="nav-item" 
            onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}
          >
            <span className="icon"><Home size={20} /></span>
            Tổng quan
          </a>
          <a 
            href="#" 
            className="nav-item" 
            onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}
          >
            <span className="icon"><FolderOpen size={20} /></span>
            Giáo trình của tôi
          </a>
          <a 
            href="#" 
            className="nav-item active" 
          >
            <span className="icon"><Plus size={20} /></span>
            Tạo giáo trình mới
          </a>
          <a 
            href="#" 
            className="nav-item" 
            onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}
          >
            <span className="icon"><MessageSquare size={20} /></span>
            Cộng tác Review
          </a>
          <a 
            href="#" 
            className="nav-item" 
            onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}
          >
            <span className="icon"><Search size={20} /></span>
            Tra cứu & Theo dõi
          </a>
          <a 
            href="#" 
            className="nav-item" 
            onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}
          >
            <span className="icon"><GitCompare size={20} /></span>
            Quản lý nâng cao
          </a>
        </nav>

        <div className="sidebar-footer">
          <button onClick={logout} className="logout-btn">
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="page-header">
          <div className="header-left">
            <h1>Tạo giáo trình mới</h1>
            <p>Soạn thảo nội dung, đính kèm metadata (CLO, PLO, modules) và nộp HoD</p>
          </div>
          <div className="header-right">
            <div className="notification-wrapper">
              <div className="notification-icon" onClick={() => setIsNotificationOpen(!isNotificationOpen)}>
                <Bell size={24} />
                <span className="badge">5</span>
              </div>
              <NotificationMenu isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
            </div>
            <div className="user-menu">
              <span className="user-icon"><User size={24} /></span>
              <div className="user-info">
                <div className="user-name">{user?.name || 'Giảng viên'}</div>
                <div className="user-role">Lecturer</div>
              </div>
            </div>
          </div>
        </header>

        {/* Form Content */}
        <div className="content-section" style={{ margin: '20px 40px' }}>
          <div style={{ marginBottom: '20px' }}>
            <button onClick={() => navigate('/dashboard')} className="btn-back" style={{ 
              background: 'white', 
              border: '1px solid #ddd', 
              padding: '10px 20px', 
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease'
            }}>
              <ArrowLeft size={20} />
              Quay lại Dashboard
            </button>
          </div>

          <div className="stepper">
          {[
            { num: 1, label: 'Thông tin cơ bản' },
            { num: 2, label: 'CLO / PLO' },
            { num: 3, label: 'Đánh giá' },
            { num: 4, label: 'Kế hoạch' },
            { num: 5, label: 'Tài liệu' }
          ].map((step) => (
            <div
              key={step.num}
              className={`step ${currentStep === step.num ? 'active' : ''} ${currentStep > step.num ? 'completed' : ''}`}
              onClick={() => setCurrentStep(step.num)}
            >
              <div className="step-number">{step.num}</div>
              <div className="step-label">{step.label}</div>
            </div>
          ))}
        </div>

        <form className="syllabus-form" onSubmit={(e) => e.preventDefault()}>
          {renderStepContent()}

          <div className="form-actions">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="btn-secondary"
              >
                ← Quay lại
              </button>
            )}
            
            {currentStep < 5 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                className="btn-primary"
              >
                Tiếp theo →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="btn-submit"
                disabled={isSubmitting}
              >
                <Send size={18} style={{ marginRight: '8px' }} />
                {isSubmitting ? 'Đang xử lý...' : 'Submit đề cương'}
              </button>
            )}
          </div>
        </form>
        </div>
      </main>
      
      {/* Toast Notifications */}
      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default CreateSyllabusPage;