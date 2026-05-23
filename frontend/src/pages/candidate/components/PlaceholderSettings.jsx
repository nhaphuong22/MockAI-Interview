import React from "react";
import { ShieldAlert } from "lucide-react";

export function PlaceholderSettings({ title }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-20 opacity-40 animate-in fade-in slide-in-from-right-4 duration-500">
      <ShieldAlert className="w-20 h-20 mb-6 text-gray-500" />
      <h3 className="text-2xl font-bold text-gray-900">Tính năng "{title}" đang phát triển</h3>
      <p className="font-medium mt-2 text-gray-600">Vui lòng quay lại sau</p>
    </div>
  );
}
