import React from "react";
import { Loader2 } from "lucide-react";
import CommentItem from "./CommentItem";

export default function CommentList({ comments, isLoading, onUpdate, onDelete }) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-[#0ea5e9]" />
      </div>
    );
  }

  if (!comments || comments.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-gray-500 dark:text-slate-400 font-medium">
        Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-2">
      {comments.map((comment) => (
        <CommentItem 
          key={comment.id} 
          comment={comment} 
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
