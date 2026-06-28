import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { X, ZoomIn, ZoomOut, Check, Loader2 } from "lucide-react";
import { getCroppedImg } from "../../utils/canvasUtils";

export function ImageCropModal({
  isOpen,
  onClose,
  imageSrc,
  aspect = 1,
  title = "Căn chỉnh ảnh",
  onConfirm,
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    try {
      setIsProcessing(true);
      const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels, "cropped-image.jpg");
      await onConfirm(croppedFile);
      onClose();
    } catch (e) {
      console.error("Lỗi khi cắt ảnh:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            {title}
          </h3>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cropper Container */}
        <div className="relative w-full h-80 sm:h-96 bg-slate-950">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            cropShape={aspect === 1 ? "round" : "rect"}
            showGrid={true}
          />
        </div>

        {/* Controls */}
        <div className="p-6 space-y-6 bg-gray-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-4">
            <ZoomOut className="w-5 h-5 text-gray-400" />
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.05}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#0ea5e9]"
            />
            <ZoomIn className="w-5 h-5 text-gray-400" />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isProcessing}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] font-semibold text-white shadow-lg shadow-[#0ea5e9]/25 hover:brightness-110 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Xác nhận
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
