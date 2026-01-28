import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, FolderOpen, MessageSquare, Search, GitCompare, Bell, User,
  Plus, ArrowLeft, Save, Send
} from 'lucide-react';
import NotificationMenu from '../components/NotificationMenu';
import Toast, { useToast } from '../components/Toast';
import { getSyllabusDetailForReview } from '../services/workflowService';
import './CreateSyllabusPage.css';
import './dashboard/DashboardPage.css';
import { getSyllabusById, updateSyllabus } from '../services/api';

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

const EditSyllabusPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, logout } = useAuth();
  const { toasts, removeToast, success, error, info } = useToast();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Basic Info
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [credits, setCredits] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [semester, setSemester] = useState('');
  const [courseObjectives, setCourseObjectives] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  
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
  
  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load existing syllabus data
  useEffect(() => {
    if (id) {
      loadSyllabusData(id);
    }
  }, [id]);

  const loadSyllabusData = async (syllabusId: string) => {
    try {
      const data = await getSyllabusDetailForReview(parseInt(syllabusId));
      
      if (data) {
        // Set basic info
        setCourseCode(data.courseCode || '');
        setCourseName(data.courseName || '');
        setCredits(data.credits?.toString() || '');
        setAcademicYear(data.academicYear || '');
        setCourseObjectives(''); // Not available in API response
        setCourseDescription(data.description || '');
        
        // Set CLOs - normalize from multiple possible sources
        const loadedClos = data.clos && Array.isArray(data.clos) && data.clos.length > 0
          ? data.clos.map((clo: any, index: number) => ({
              id: clo.id?.toString() || (index + 1).toString(),
              code: clo.code || clo.cloCode || `CLO${index + 1}`,
              description: clo.description || clo.cloDescription || '',
              bloomLevel: clo.bloomLevel || 'Remember'
            }))
          : [{ id: '1', code: 'CLO1', description: '', bloomLevel: 'Remember' }];
        
        setClos(loadedClos);
        
        // Initialize PLO mappings if they exist
        const mappings: { [cloId: string]: PLOMapping[] } = {};
        loadedClos.forEach((clo: any) => {
          mappings[clo.id] = clo.ploMappings && Array.isArray(clo.ploMappings)
            ? clo.ploMappings
            : [{ ploCode: 'PLO1', weight: 0 }];
        });
        setPloMappings(mappings);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading syllabus:', error);
      // Fallback to empty form if API fails
      setClos([{ id: '1', code: 'CLO1', description: '', bloomLevel: 'Remember' }]);
      setPloMappings({ '1': [{ ploCode: 'PLO1', weight: 0 }] });
      setLoading(false);
    }
  };

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
        setUploadStatus('File đã được chọn: ' + file.name);
      } else {
        setUploadStatus('Vui lòng chọn file PDF');
      }
    }
  };

  // Form Submission
  const handleUpdate = async () => {
    setIsSubmitting(true);
    
    try {
      // Validate
      if (!courseCode || !courseName || !credits || !academicYear) {
        error('Vui lòng điền đầy đủ thông tin cơ bản');
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

      // Prepare syllabus data
      const syllabusData = {
        course: {
          courseCode,
          courseName,
          credits: Number(credits)
        },
        academicYear,
        semester,
        courseObjectives,
        courseDescription,
        clos: clos.map(clo => ({
          cloCode: clo.code,
          cloDescription: clo.description,
          bloomLevel: clo.bloomLevel,
          ploMappings: ploMappings[clo.id] || []
        })),
        assessments: assessments.filter(a => a.name),
        sessionPlans: sessionPlans.filter(s => s.topic),
        materials: materials.filter(m => m.title)
      };

      console.log('Updating syllabus:', syllabusData);

      await updateSyllabus(Number(id), syllabusData);

      // TODO: Upload PDF if backend supports
      // if (pdfFile) {
      //   const formData = new FormData();
      //   formData.append('file', pdfFile);
      //   await uploadSyllabusPdf(Number(id), formData);
      // }

      success('✅ Cập nhật đề cương thành công!');
      navigate('/dashboard');
      
    } catch (error: any) {
      console.error('Error updating syllabus:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật đề cương';
      error(`❌ ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="form-section">
            <h2>Thông tin cơ bản</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label>Mã môn học *</label>
                <input
                  type="text"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  placeholder="VD: CS101"
                />
              </div>
              
              <div className="form-group">
                <label>Tên môn học *</label>
                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="VD: Nhập môn lập trình"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Số tín chỉ *</label>
                <input
                  type="number"
                  value={credits}
                  onChange={(e) => setCredits(e.target.value)}
                  placeholder="3"
                  min="1"
                  max="6"
                />
              </div>
              
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

            <div className="form-group">
              <label>Mục tiêu môn học</label>
              <textarea
                value={courseObjectives}
                onChange={(e) => setCourseObjectives(e.target.value)}
                placeholder="Nhập mục tiêu môn học..."
                rows={4}
              />
            </div>

            <div className="form-group">
              <label>Mô tả môn học</label>
              <textarea
                value={courseDescription}
                onChange={(e) => setCourseDescription(e.target.value)}
                placeholder="Nhập mô tả chi tiết về môn học..."
                rows={6}
              />
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

            <div className="pdf-upload-section">
              <h3>Upload PDF đề cương</h3>
              <div className="upload-area">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handlePdfUpload}
                  id="pdf-upload"
                  className="file-input"
                />
                <label htmlFor="pdf-upload" className="upload-label">
                  <div className="upload-icon">📄</div>
                  <div className="upload-text">
                    {pdfFile ? pdfFile.name : 'Chọn file PDF hoặc kéo thả vào đây'}
                  </div>
                </label>
              </div>
              {uploadStatus && (
                <div className={`upload-status ${uploadStatus.includes('✅') ? 'success' : 'error'}`}>
                  {uploadStatus}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="logo"></div>
            <h2>SMD System</h2>
            <p>Giảng viên</p>
          </div>
        </aside>
        <main className="main-content">
          <div className="content-section">
            <p>Đang tải dữ liệu giáo trình...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Sidebar - Same as LecturerDashboard */}
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
            className="nav-item" 
            onClick={(e) => { e.preventDefault(); navigate('/syllabus/create'); }}
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
        {/* Header - Same as LecturerDashboard */}
        <header className="page-header">
          <div className="header-left">
            <h1>Cập nhật giáo trình</h1>
            <p>Chỉnh sửa thông tin và nội dung giáo trình đã tạo</p>
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
              { num: 5, label: 'Tài liệu & PDF' }
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
                  onClick={handleUpdate}
                  className="btn-submit"
                  disabled={isSubmitting}
                >
                  <Save size={18} style={{ marginRight: '8px' }} />
                  {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
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

export default EditSyllabusPage;
