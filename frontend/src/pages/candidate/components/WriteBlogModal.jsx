import React, { useState, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, PenTool, Save, Image as ImageIcon, Upload } from "lucide-react";
import MDEditor from '@uiw/react-md-editor';
import { useMutation } from "@tanstack/react-query";
import { blogApi } from "../../../api/blogApi";
import { motion } from "framer-motion";
import { useThemeStore } from "../../../store/useThemeStore";

export function WriteBlogModal({ isOpen, onOpenChange }) {
  const { theme } = useThemeStore();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("**Xin chào cộng đồng MockAI...**");
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState("");
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  const draftMutation = useMutation({
    mutationFn: (data) => blogApi.createDraft(data),
    onSuccess: () => {
      alert("Lưu bản nháp thành công!");
      onOpenChange(false);
      setTitle("");
      setContent("");
      setTags("");
      setCategory("");
      setCoverImageFile(null);
      setCoverImagePreview("");
    },
    onError: (error) => {
      console.error("Lỗi lưu nháp:", error);
      alert("Đã xảy ra lỗi khi lưu bản nháp.");
    }
  });

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

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl max-h-[90vh] dark:bg-[#0a0f1c] bg-white dark:border dark:border-white/10 rounded-3xl p-8 z-50 flex flex-col shadow-2xl overflow-y-auto outline-none">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-2xl font-bold dark:text-white text-gray-900 flex items-center gap-2">
              <PenTool className="w-6 h-6 text-[#0ea5e9]" />
              Viết bài mới
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-2 dark:hover:bg-white/10 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-6 h-6 dark:text-slate-400 text-gray-500" />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 flex-1">
            {/* Cột trái: Nội dung chính */}
            <div className="flex-1 space-y-6">
              <div>
                <label className="block text-sm font-medium dark:text-slate-300 text-gray-700 mb-2">Tiêu đề bài viết</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: Kinh nghiệm phỏng vấn tại công ty X..." 
                  className="w-full px-4 py-3 rounded-xl border dark:border-white/10 border-gray-200 dark:bg-[#0f172a] bg-white dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9]"
                />
              </div>

              <div data-color-mode={theme}>
                <label className="block text-sm font-medium dark:text-slate-300 text-gray-700 mb-2">Nội dung</label>
                <MDEditor
                  value={content}
                  onChange={setContent}
                  height={500}
                  className="w-full"
                />
              </div>
            </div>

            {/* Cột phải: Settings (Ảnh bìa, Category, Tags) */}
            <div className="w-full lg:w-80 space-y-6">
              {/* Ảnh bìa */}
              <div>
                <label className="block text-sm font-medium dark:text-slate-300 text-gray-700 mb-2">Ảnh bìa (Cover Image)</label>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="border-2 border-dashed dark:border-white/10 border-gray-300 rounded-2xl p-4 text-center cursor-pointer dark:hover:border-[#0ea5e9] hover:border-[#0ea5e9] dark:hover:bg-[#0ea5e9]/10 hover:bg-[#f0f9ff]/50 transition-all duration-300 flex flex-col items-center justify-center relative overflow-hidden group"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ minHeight: '160px' }}
                >
                  {coverImagePreview ? (
                    <img src={coverImagePreview} alt="Cover Preview" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 dark:text-slate-500 text-gray-400 mb-2 group-hover:text-[#0ea5e9] transition-colors" />
                      <span className="text-sm dark:text-slate-400 text-gray-500 group-hover:text-[#0ea5e9] font-medium transition-colors">Nhấn để tải ảnh lên</span>
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
                    className="mt-2 text-sm text-red-500 hover:text-red-600 font-medium"
                  >
                    Xóa ảnh
                  </button>
                )}
              </div>

              {/* Danh mục */}
              <div>
                <label className="block text-sm font-medium dark:text-slate-300 text-gray-700 mb-2">Danh mục (Category)</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border dark:border-white/10 border-gray-200 dark:bg-[#0f172a] bg-white dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9]"
                >
                  <option value="">-- Chọn danh mục --</option>
                  <option value="Interview Tips">Interview Tips</option>
                  <option value="Career Guide">Career Guide</option>
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="General">General</option>
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium dark:text-slate-300 text-gray-700 mb-2">Tags</label>
                <input 
                  type="text" 
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="react, javascript..." 
                  className="w-full px-4 py-3 rounded-xl border dark:border-white/10 border-gray-200 dark:bg-[#0f172a] bg-white dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9]"
                />
                <p className="text-xs dark:text-slate-500 text-gray-400 mt-2">Các tag cách nhau bằng dấu phẩy</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-4 pt-6 border-t dark:border-white/10 border-gray-100">
            <Dialog.Close asChild>
              <button className="px-6 py-2.5 rounded-xl dark:text-slate-300 text-gray-600 dark:hover:bg-white/10 hover:bg-gray-100 font-medium transition-colors">
                Hủy
              </button>
            </Dialog.Close>
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(14, 165, 233, 0.2)" }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSaveDraft}
              disabled={draftMutation.isPending || isUploadingImage}
              className="px-8 py-2.5 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {isUploadingImage ? "Đang tải ảnh..." : (draftMutation.isPending ? "Đang lưu..." : "Lưu Bản Nháp")}
            </motion.button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
