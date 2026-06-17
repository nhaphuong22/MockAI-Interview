import React, { useState, useRef } from "react";
import { ArrowLeft, Image as ImageIcon, Upload, Save, CheckCircle2 } from "lucide-react";
import MDEditor from '@uiw/react-md-editor';
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { blogApi } from "../../api/blogApi";
import { motion } from "framer-motion";
import { useThemeStore } from "../../store/useThemeStore";

export function WriteBlog() {
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("**Xin chào cộng đồng MockAI...**");
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState("");
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef(null);

  const draftMutation = useMutation({
    mutationFn: (data) => blogApi.createDraft(data),
    onSuccess: () => {
      alert("Lưu bản nháp thành công!");
      navigate('/community');
    },
    onError: (error) => {
      console.error("Lỗi lưu nháp:", error);
      alert("Đã xảy ra lỗi khi lưu bản nháp.");
    }
  });

  const publishMutation = useMutation({
    mutationFn: async (data) => {
      const draftRes = await blogApi.createDraft(data);
      const newBlogId = draftRes.data.id;
      return blogApi.submitForReview(newBlogId);
    },
    onSuccess: () => {
      alert("Gửi yêu cầu duyệt bài viết thành công!");
      navigate('/community');
    },
    onError: (error) => {
      console.error("Lỗi đăng bài:", error);
      alert("Đã xảy ra lỗi khi đăng bài.");
    }
  });

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        setCoverImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setCoverImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        alert("Vui lòng chọn file hình ảnh hợp lệ.");
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveDraft = async () => {
    if (!title.trim() || !content.trim()) {
      alert("Vui lòng nhập tiêu đề và nội dung.");
      return;
    }

    let cover_image_url = null;
    if (coverImageFile) {
      setIsUploadingImage(true);
      try {
        const res = await blogApi.uploadCoverImage(coverImageFile);
        cover_image_url = res.data.url;
      } catch (error) {
        console.error("Upload ảnh lỗi:", error);
        alert("Lỗi khi tải lên ảnh bìa.");
        setIsUploadingImage(false);
        return;
      }
      setIsUploadingImage(false);
    }

    const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);
    draftMutation.mutate({ 
      title, 
      content, 
      tags: tagsArray,
      category,
      cover_image_url
    });
  };

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      alert("Vui lòng nhập tiêu đề và nội dung.");
      return;
    }

    let cover_image_url = null;
    if (coverImageFile) {
      setIsUploadingImage(true);
      try {
        const res = await blogApi.uploadCoverImage(coverImageFile);
        cover_image_url = res.data.url;
      } catch (error) {
        console.error("Upload ảnh lỗi:", error);
        alert("Lỗi khi tải lên ảnh bìa.");
        setIsUploadingImage(false);
        return;
      }
      setIsUploadingImage(false);
    }

    const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);
    publishMutation.mutate({ 
      title, 
      content, 
      tags: tagsArray,
      category,
      cover_image_url
    });
  };

  return (
    <div className="min-h-screen dark:bg-[#0a0f1c] bg-gray-50 py-8">
      <style>
        {`
          .markdown-editor-wrapper .w-md-editor {
            background-color: transparent !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          .markdown-editor-wrapper .w-md-editor-toolbar {
            background-color: transparent !important;
            border-bottom: 1px solid var(--border-color) !important;
            padding: 10px 0 !important;
            margin-bottom: 10px !important;
          }
          .dark .markdown-editor-wrapper {
            --border-color: rgba(255, 255, 255, 0.1);
          }
          .markdown-editor-wrapper {
            --border-color: rgba(0, 0, 0, 0.1);
          }
          .markdown-editor-wrapper .w-md-editor-content {
            background-color: transparent !important;
          }
        `}
      </style>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Options */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate('/community')}
            className="flex items-center gap-2 dark:text-slate-400 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Quay lại Cộng đồng</span>
          </button>

          <div className="flex items-center gap-4">
            <button 
              onClick={handleSaveDraft}
              disabled={draftMutation.isPending || publishMutation.isPending || isUploadingImage}
              className="px-6 py-2.5 rounded-xl font-medium dark:bg-white/5 bg-gray-200 dark:text-slate-300 text-gray-700 hover:bg-gray-300 dark:hover:bg-white/10 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {isUploadingImage ? "Đang tải ảnh..." : (draftMutation.isPending ? "Đang lưu..." : "Lưu Bản Nháp")}
            </button>
            <button 
              onClick={handlePublish}
              disabled={draftMutation.isPending || publishMutation.isPending || isUploadingImage}
              className="px-6 py-2.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white rounded-xl font-medium shadow-lg shadow-[#0ea5e9]/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Upload className="w-5 h-5" />
              {isUploadingImage ? "Đang tải ảnh..." : (publishMutation.isPending ? "Đang gửi..." : "Đăng Bài Viết")}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-6">
            <div className="dark:bg-[#0f172a] bg-white rounded-3xl p-6 md:p-10 shadow-xl shadow-gray-200/50 dark:shadow-none border dark:border-white/5 border-gray-100 min-h-[700px] flex flex-col">
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Tiêu đề bài viết của bạn..." 
                className="w-full text-3xl md:text-5xl font-extrabold bg-transparent border-none focus:outline-none focus:ring-0 dark:text-white text-gray-900 placeholder-gray-300 dark:placeholder-slate-700 mb-2 px-0"
              />
              
              <div data-color-mode={theme} className="markdown-editor-wrapper flex-1 flex flex-col">
                <MDEditor
                  value={content}
                  onChange={setContent}
                  className="w-full flex-1 !border-none"
                  preview="edit"
                  extraCommands={[]}
                  height="100%"
                  visibleDragbar={false}
                />
              </div>
            </div>
          </div>

          {/* Settings Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Cover Image */}
            <div className="dark:bg-[#0f172a] bg-white rounded-3xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-none border dark:border-white/5 border-gray-100">
              <h3 className="text-lg font-bold dark:text-white text-gray-900 mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#0ea5e9]" />
                Ảnh bìa (Cover Image)
              </h3>
              
              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center relative overflow-hidden group ${
                  isDragging ? "border-[#0ea5e9] bg-[#0ea5e9]/5" : "dark:border-white/10 border-gray-300 hover:border-[#0ea5e9]"
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{ minHeight: '200px' }}
              >
                {coverImagePreview ? (
                  <img src={coverImagePreview} alt="Cover Preview" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full dark:bg-white/5 bg-gray-100 flex items-center justify-center mb-3 group-hover:bg-[#0ea5e9]/10 transition-colors">
                      <ImageIcon className="w-6 h-6 dark:text-slate-500 text-gray-400 group-hover:text-[#0ea5e9] transition-colors" />
                    </div>
                    <span className="text-sm dark:text-slate-400 text-gray-500 group-hover:text-[#0ea5e9] font-medium transition-colors">Nhấn hoặc kéo thả ảnh vào đây</span>
                    <span className="text-xs dark:text-slate-500 text-gray-400 mt-1">Khuyến nghị: 1200 x 630px</span>
                  </>
                )}
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                />
              </motion.div>

              {coverImagePreview && (
                <button 
                  onClick={() => { setCoverImagePreview(""); setCoverImageFile(null); }}
                  className="mt-4 w-full py-2 text-sm text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-500/10 rounded-xl font-medium transition-colors"
                >
                  Gỡ ảnh bìa
                </button>
              )}
            </div>

            {/* Category & Tags */}
            <div className="dark:bg-[#0f172a] bg-white rounded-3xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-none border dark:border-white/5 border-gray-100">
              <h3 className="text-lg font-bold dark:text-white text-gray-900 mb-6">Phân loại</h3>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium dark:text-slate-300 text-gray-700 mb-2">Danh mục chính</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border dark:border-white/10 border-gray-200 dark:bg-[#0a0f1c] bg-gray-50 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] transition-all"
                  >
                    <option value="">-- Chọn danh mục --</option>
                    <option value="Mẹo Viết CV">Mẹo Viết CV</option>
                    <option value="Kinh Nghiệm Phỏng Vấn">Kinh Nghiệm Phỏng Vấn</option>
                    <option value="Lời Khuyên Sự Nghiệp">Lời Khuyên Sự Nghiệp</option>
                    <option value="Xu Hướng Công Nghệ">Xu Hướng Công Nghệ</option>
                    <option value="Thông Tin Mức Lương">Thông Tin Mức Lương</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-slate-300 text-gray-700 mb-2">Thẻ (Tags)</label>
                  <input 
                    type="text" 
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="react, frontend, interview..." 
                    className="w-full px-4 py-3 rounded-xl border dark:border-white/10 border-gray-200 dark:bg-[#0a0f1c] bg-gray-50 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] transition-all"
                  />
                  <p className="text-xs dark:text-slate-500 text-gray-400 mt-2">Ngăn cách các thẻ bằng dấu phẩy (,)</p>
                </div>
              </div>
            </div>

            {/* Premium Guide */}
            <div className="dark:bg-transparent bg-sky-50 rounded-3xl p-6 border dark:border-[#0ea5e9]/30 border-sky-100">
              <h3 className="text-lg font-bold dark:text-[#0ea5e9] text-[#0284c7] mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Mẹo viết bài hay
              </h3>
              <ul className="text-sm dark:text-slate-300 text-sky-800 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0ea5e9] mt-1.5 flex-shrink-0"></span>
                  Sử dụng tiêu đề hấp dẫn, gợi sự tò mò.
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0ea5e9] mt-1.5 flex-shrink-0"></span>
                  Chia nhỏ nội dung bằng các thẻ Heading (H2, H3).
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0ea5e9] mt-1.5 flex-shrink-0"></span>
                  Bôi đậm những ý chính quan trọng.
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0ea5e9] mt-1.5 flex-shrink-0"></span>
                  Nên có ít nhất 1 ảnh bìa đẹp mắt.
                </li>
              </ul>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
