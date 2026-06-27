import React, { useState } from "react";
import { MoreHorizontal, Edit, Trash2, Check, X } from "lucide-react";
import { useAuthStore } from "../../../store/useAuthStore";
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

export default function CommentItem({ comment, onUpdate, onDelete }) {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  // Quyền: Người viết comment hoặc là Admin
  const isOwner = user?.id === comment.user_id;
  const isAdmin = user?.role === 'ADMIN';
  const canEdit = isOwner;
  const canDelete = isOwner || isAdmin;

  const handleUpdate = () => {
    if (!editContent.trim()) return;
    onUpdate(comment.id, editContent.trim());
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  return (
    <div className="flex gap-3 items-start group">
      <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-sky-100 to-sky-50 dark:from-sky-950 dark:to-slate-900 flex items-center justify-center border border-sky-100/50 shrink-0 text-sm font-semibold">
        {comment.author_avatar ? (
          <img src={comment.author_avatar} alt="author avatar" className="w-full h-full object-cover" />
        ) : (
          comment.author_name?.charAt(0) || "👤"
        )}
      </div>
      <div className="flex-1 flex flex-col gap-1 relative">
        <div className="dark:bg-slate-900 bg-gray-100 px-4 py-2.5 rounded-2xl max-w-[95%] relative">
          <div className="text-xs font-extrabold dark:text-slate-200 text-gray-900 mb-0.5">
            {comment.author_name}
          </div>
          
          {isEditing ? (
            <div className="mt-1 flex flex-col gap-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 text-sm p-2 rounded-lg border border-gray-300 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none"
                rows={2}
                autoFocus
              />
              <div className="flex gap-2 justify-end text-xs font-semibold mt-1">
                <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700 cursor-pointer flex items-center gap-1">
                  <X className="w-3 h-3" /> Hủy
                </button>
                <button onClick={handleUpdate} className="text-sky-500 hover:text-sky-600 cursor-pointer flex items-center gap-1">
                  <Check className="w-3 h-3" /> Lưu
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm dark:text-slate-350 text-gray-700 font-medium leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </p>
          )}

          {/* Radix Dropdown Menu for Edit/Delete */}
          {(canEdit || canDelete) && !isEditing && (
            <div className="absolute top-1/2 -right-10 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-800 text-gray-500 transition-colors cursor-pointer outline-none">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content 
                    className="min-w-[120px] bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-100 dark:border-slate-700 py-1 z-50 text-sm"
                    sideOffset={5}
                    align="end"
                  >
                    {canEdit && (
                      <DropdownMenu.Item 
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer outline-none"
                      >
                        <Edit className="w-4 h-4" />
                        Chỉnh sửa
                      </DropdownMenu.Item>
                    )}
                    {canDelete && (
                      <DropdownMenu.Item 
                        onClick={() => {
                          if (window.confirm("Bạn có chắc chắn muốn xóa bình luận này?")) {
                            onDelete(comment.id);
                          }
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer outline-none"
                      >
                        <Trash2 className="w-4 h-4" />
                        Xóa
                      </DropdownMenu.Item>
                    )}
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>
          )}
        </div>
        
        <span className="text-[10px] text-gray-400 dark:text-slate-500 pl-3 font-semibold">
          {new Date(comment.created_at).toLocaleString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit"
          })}
          {comment.updated_at && comment.updated_at !== comment.created_at && " • Đã chỉnh sửa"}
        </span>
      </div>
    </div>
  );
}
