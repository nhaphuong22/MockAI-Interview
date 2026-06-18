import { useState, useEffect, useRef, useCallback } from 'react';
import axiosClient from '../../../api/axiosClient';
import { Download, Loader2, Save, LayoutGrid, ChevronLeft, ChevronRight } from 'lucide-react';
import { useUiStore } from '../../../store/useUiStore';
import { motion } from 'framer-motion';

export const CVBuilder = () => {
  const showToast = useUiStore((state) => state.addToast);
  const setHideNavbar = useUiStore((state) => state.setHideNavbar);
  const [mode, setMode] = useState('SELECTING_TEMPLATE'); // 'SELECTING_TEMPLATE' | 'EDITING_TEMPLATE'

  useEffect(() => {
    if (mode === 'EDITING_TEMPLATE') {
      setHideNavbar(true);
    } else {
      setHideNavbar(false);
    }
    return () => setHideNavbar(false);
  }, [mode, setHideNavbar]);

  useEffect(() => {
    const handlePopState = () => {
      if (mode === 'EDITING_TEMPLATE') {
        setMode('SELECTING_TEMPLATE');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [mode]);
  
  // States for Template List
  const [templates, setTemplates] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  
  // States for Editing
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [htmlContent, setHtmlContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const iframeRef = useRef(null);

  // States for Sidebar Configuration
  const [templateConfig, setTemplateConfig] = useState(null);
  const [activeColorIndex, setActiveColorIndex] = useState(0);
  const [activeFont, setActiveFont] = useState('');
  const [activeLang, setActiveLang] = useState('en');

  const fetchTemplates = useCallback(async (pageNumber) => {
    try {
      setIsLoadingTemplates(true);
      const response = await axiosClient.get(`/cv/templates?page=${pageNumber}&limit=16`);
      setTemplates(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Failed to fetch templates', error);
      showToast({ message: 'Lỗi khi tải danh sách mẫu CV', type: 'error' });
    } finally {
      setIsLoadingTemplates(false);
    }
  }, [showToast]);

  // Fetch templates when page changes
  useEffect(() => {
    if (mode === 'SELECTING_TEMPLATE') {
      fetchTemplates(page);
    }
  }, [page, mode, fetchTemplates]);

  const handleSelectTemplate = async (templateId) => {
    try {
      setIsLoadingTemplates(true);
      const response = await axiosClient.get(`/cv/templates/${templateId}`);
      setSelectedTemplate(response.data);
      
      let html = response.data.html;
      
      // Parse configuration from template html
      const match = html.match(/const config = (\{[\s\S]*?\});\s*const root = /);
      if (match) {
        try {
          const parsedConfig = JSON.parse(match[1]);
          setTemplateConfig(parsedConfig);
          setActiveColorIndex(parsedConfig.colors.find(c => c.active)?.index || 0);
          setActiveFont(parsedConfig.fonts.selected || 'Be Vietnam');
          setActiveLang(parsedConfig.languages.find(l => l.active)?.code || 'en');
        } catch (e) {
          console.error("Lỗi parse config từ template html", e);
        }
      }
      
      // Hide the internal config panel
      html = html.replace(
        '<div id="local-vietcv-config-panel">', 
        '<div id="local-vietcv-config-panel" style="display:none !important">'
      );
      
      setHtmlContent(html);
      setMode('EDITING_TEMPLATE');
      window.history.pushState({ view: 'EDITING_TEMPLATE' }, '', window.location.href);
    } catch (error) {
      console.error('Failed to load template', error);
      showToast({ message: 'Lỗi khi tải mẫu CV', type: 'error' });
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const handleChangeColor = (colorItem) => {
    setActiveColorIndex(colorItem.index);
    if (!iframeRef.current || !iframeRef.current.contentDocument) return;
    const doc = iframeRef.current.contentDocument;
    doc.documentElement.style.setProperty("--vcv-primary", colorItem.colors[0]?.hex || "#ebd7b5");
    doc.documentElement.style.setProperty("--vcv-secondary", colorItem.colors[1]?.hex || colorItem.colors[0]?.hex || "#d9d9d9");
  };

  const handleChangeFont = (fontName) => {
    setActiveFont(fontName);
    if (!iframeRef.current || !iframeRef.current.contentDocument) return;
    const doc = iframeRef.current.contentDocument;
    const target = doc.querySelector(".editor-text-font-family") || doc.body;
    target.style.fontFamily = "'" + fontName.replace(/'/g, "\\'") + "', sans-serif";
  };

  const handleChangeLang = (langCode) => {
    setActiveLang(langCode);
    if (!iframeRef.current || !iframeRef.current.contentDocument) return;
    const doc = iframeRef.current.contentDocument;
    
    const sectionText = {
      en: {"About me":"About me","Work Experiences":"Work Experiences","Education":"Education","Contact":"Contact","Certificates":"Certificates","Skills":"Skills","Languages":"Languages","Prizes and Awards":"Prizes and Awards","Activities":"Activities","Projects":"Projects","References":"References","Interests":"Interests"},
      vi: {"About me":"Giới thiệu","Work Experiences":"Kinh nghiệm làm việc","Education":"Học vấn","Contact":"Liên hệ","Certificates":"Chứng chỉ","Skills":"Kỹ năng","Languages":"Ngôn ngữ","Prizes and Awards":"Giải thưởng","Activities":"Hoạt động","Projects":"Dự án","References":"Người tham chiếu","Interests":"Sở thích"},
      ja: {"About me":"自己紹介","Work Experiences":"職務経歴","Education":"学歴","Contact":"連絡先","Certificates":"資格","Skills":"スキル","Languages":"言語","Prizes and Awards":"受賞歴","Activities":"活動","Projects":"プロジェクト","References":"推薦者","Interests":"興味"}
    };
    
    const reverse = new Map();
    Object.values(sectionText).forEach((dict) => Object.entries(dict).forEach(([key, value]) => reverse.set(value, key)));
    
    const dict = sectionText[langCode] || sectionText.en;
    doc.documentElement.lang = langCode;
    doc.querySelectorAll(".section-header, .profile-section-header, .title__contact").forEach((node) => {
      const current = node.textContent.trim();
      const key = reverse.get(current) || current;
      if (dict[key]) node.textContent = dict[key];
    });
  };

  const handleSaveCV = async () => {
    if (!iframeRef.current) return;
    
    try {
      setIsSaving(true);
      // Lấy nội dung HTML hiện tại từ iframe
      const currentHtml = iframeRef.current.contentDocument.documentElement.outerHTML;
      
      await axiosClient.post('/cv/save-html', {
        html_content: currentHtml,
        template_id: selectedTemplate?.id
      });
      
      showToast({ message: 'Đã lưu CV thành công!', type: 'success' });
    } catch (error) {
      console.error('Lỗi khi lưu CV', error);
      showToast({ message: 'Lỗi khi lưu CV', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPDF = () => {
    if (!iframeRef.current) return;
    try {
      setIsExporting(true);
      
      // Mẹo nhỏ: gọi lệnh in của cửa sổ iframe. 
      // Các trình duyệt hiện đại đều hỗ trợ Save as PDF cực kỳ nét và giữ đúng vector
      iframeRef.current.contentWindow.print();
      
      showToast({ message: 'Đang chuẩn bị xuất PDF...', type: 'success' });
    } catch (error) {
      console.error('Lỗi in PDF', error);
      showToast({ message: 'Lỗi in PDF', type: 'error' });
    } finally {
      setIsExporting(false);
    }
  };

  // ---------------- RENDER: SELECTING_TEMPLATE ----------------
  if (mode === 'SELECTING_TEMPLATE') {
    return (
      <div className="flex flex-col min-h-[calc(100vh-112px)] bg-slate-50 pt-2 px-8 pb-12">
        <div className="max-w-6xl mx-auto w-full">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                Chọn Mẫu <span className="text-[#0ea5e9]">CV</span>
              </h1>
              <p className="text-slate-500 mt-2">Chọn một mẫu chuyên nghiệp để bắt đầu hành trình của bạn</p>
            </div>
          </div>

          {isLoadingTemplates && templates.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-[#0ea5e9]" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {templates.map((template) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={template.id}
                    className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer group flex flex-col"
                    onClick={() => handleSelectTemplate(template.id)}
                  >
                    <div className="h-64 bg-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
                      <div className="text-slate-400 group-hover:text-[#0ea5e9] transition-colors flex flex-col items-center gap-2">
                        <LayoutGrid size={48} strokeWidth={1} />
                        <span className="text-sm font-medium">Click để sử dụng</span>
                      </div>
                      <div className="absolute inset-0 bg-[#0ea5e9]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="p-4 border-t border-slate-100 flex-1 flex items-center justify-center text-center">
                      <h3 className="font-semibold text-slate-700 line-clamp-2">{template.title}</h3>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Phân trang */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-12">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="p-2 rounded-full border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors text-slate-600"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="text-sm font-medium text-slate-600">
                    Trang {page} / {totalPages}
                  </span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="p-2 rounded-full border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors text-slate-600"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // ---------------- RENDER: EDITING_TEMPLATE ----------------
  return (
    <div className="flex flex-col h-screen bg-slate-100">
      {/* Top Toolbar */}
      <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              if (window.history.state?.view === 'EDITING_TEMPLATE') {
                window.history.back();
              } else {
                setMode('SELECTING_TEMPLATE');
              }
            }}
            className="flex items-center gap-1 text-slate-500 hover:text-[#0ea5e9] transition-colors text-sm font-medium"
          >
            <ChevronLeft size={16} />
            Quay lại mẫu
          </button>
          <div className="h-4 w-px bg-slate-300" />
          <h1 className="text-base font-bold text-slate-800 line-clamp-1 max-w-[300px]">
            {selectedTemplate?.title}
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveCV}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded shadow-sm hover:bg-slate-700 disabled:opacity-70 transition-colors"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>Lưu CV</span>
          </button>

          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-[#0ea5e9] text-white text-sm font-medium rounded shadow-sm hover:bg-[#0284c7] disabled:opacity-70 transition-colors"
          >
            {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            <span>Xuất PDF</span>
          </button>
        </div>
      </div>

      {/* Editor Area & Sidebar */}
      <div className="flex-1 overflow-hidden flex bg-slate-200/50">
        
        {/* Workspace */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden flex justify-center p-6">
          <div className="w-[210mm] min-h-[297mm] bg-white shadow-xl flex-shrink-0 relative">
            <iframe
              ref={iframeRef}
              srcDoc={htmlContent}
              title="CV Editor"
              className="w-full h-[297mm] border-0"
              onLoad={(e) => {
                // Khi iframe load xong, bật contentEditable
                const doc = e.target.contentDocument;
                if (doc) {
                  doc.designMode = 'on'; // Cho phép edit toàn bộ nội dung
                  
                  // Thêm một chút CSS reset vào iframe để tránh bị vỡ font nếu template thiếu
                  const style = doc.createElement('style');
                  style.textContent = `
                    html, body { outline: none; margin: 0; padding: 0; overflow-x: hidden; }
                    * { cursor: text; }
                    .page { box-shadow: none !important; margin: 0 !important; max-width: 100%; }
                  `;
                  doc.head.appendChild(style);
                }
              }}
            />
          </div>
        </div>

        {/* Configuration Sidebar */}
        {templateConfig && (
          <div className="w-80 bg-white border-l border-slate-200 shadow-sm flex flex-col z-10 shrink-0 overflow-y-auto">
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Cài đặt CV</h2>
              <p className="text-sm text-slate-500 mt-1">Tùy chỉnh giao diện theo ý bạn</p>
            </div>
            
            <div className="p-5 flex flex-col gap-6">
              {/* Colors */}
              {templateConfig.colors && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 uppercase mb-3">Màu sắc</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {templateConfig.colors.map(colorItem => (
                      <button
                        key={colorItem.index}
                        onClick={() => handleChangeColor(colorItem)}
                        className={`h-10 rounded-lg border-2 flex items-center justify-center gap-1 transition-all ${activeColorIndex === colorItem.index ? 'border-[#0ea5e9] scale-105 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}
                      >
                        <span className="w-3 h-3 rounded-full border border-slate-200" style={{ backgroundColor: colorItem.colors[0]?.hex }}></span>
                        {colorItem.colors[1] && (
                          <span className="w-3 h-3 rounded-full border border-slate-200" style={{ backgroundColor: colorItem.colors[1]?.hex }}></span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Fonts */}
              {templateConfig.fonts && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 uppercase mb-3">Phông chữ</h3>
                  <select 
                    className="w-full h-10 border border-slate-300 rounded-lg px-3 text-sm text-slate-700 focus:outline-none focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9]"
                    value={activeFont}
                    onChange={(e) => handleChangeFont(e.target.value)}
                  >
                    {templateConfig.fonts.families.map(font => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Languages */}
              {templateConfig.languages && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 uppercase mb-3">Ngôn ngữ</h3>
                  <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
                    {templateConfig.languages.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => handleChangeLang(lang.code)}
                        className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-colors uppercase ${activeLang === lang.code ? 'bg-white text-[#0ea5e9] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        {lang.code}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Lưu ý: Thay đổi ngôn ngữ chỉ áp dụng cho các tiêu đề mục.</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
