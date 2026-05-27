import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { cvApi } from "../../api/cvApi";
import { CVUploadArea } from "./components/CVUploadArea";
import { CVAnalysisLoading } from "./components/CVAnalysisLoading";
import { CVAnalysisResult } from "./components/CVAnalysisResult";
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as random from 'maath/random/dist/maath-random.esm';

function DataUniverse(props) {
  const ref = useRef();
  const [sphere] = useState(() => random.inSphere(new Float32Array(5000), { radius: 2.5 }));

  useFrame((state, delta) => {
    ref.current.rotation.x -= delta / 10;
    ref.current.rotation.y -= delta / 15;
    ref.current.rotation.z += delta / 20;
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
        <PointMaterial transparent color="#0ea5e9" size={0.003} sizeAttenuation={true} depthWrite={false} opacity={0.6} />
      </Points>
    </group>
  );
}

export function CVReview() {
  const [hasCV, setHasCV] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [_cvText, setCvText] = useState("");
  const [aiResults, setAiResults] = useState(null);

  const scoreMutation = useMutation({
    mutationFn: (data) => cvApi.scoreCV(data.cvText, data.jobDescription),
    onSuccess: (res) => {
      setAiResults(res.data);
      setShowResults(true);
    },
    onError: (error) => {
      console.error('Lỗi khi chấm điểm CV:', error);
      let errorMessage = error.response?.data?.message || error.message || 'Chấm điểm CV thất bại!';
      if (error.response?.status === 413) {
        errorMessage = 'File CV của bạn chứa dung lượng văn bản quá lớn, vui lòng rút gọn lại để hệ thống xử lý tốt nhất.';
      }
      alert(errorMessage);
      setHasCV(false);
    }
  });

  const uploadMutation = useMutation({
    mutationFn: (file) => cvApi.uploadCV(file),
    onSuccess: (res) => {
      const text = res.data?.text || '';
      setCvText(text);
      setHasCV(true);
      scoreMutation.mutate({ cvText: text, jobDescription: "" });
    },
    onError: (error) => {
      console.error('Lỗi khi tải CV:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Tải lên CV thất bại!';
      alert(errorMessage);
    }
  });

  const handleUpload = (file) => {
    uploadMutation.mutate(file);
  };

  const handleReupload = () => {
    setHasCV(false);
    setShowResults(false);
    setAiResults(null);
    setCvText("");
    uploadMutation.reset();
    scoreMutation.reset();
  };

  const isAnalyzing = uploadMutation.isPending || scoreMutation.isPending;

  return (
    <div className="relative min-h-screen py-8 overflow-hidden bg-slate-50 dark:bg-[#020617] selection:bg-[#0ea5e9]/30">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0 opacity-80 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 1] }}>
          <DataUniverse />
        </Canvas>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-10 text-center relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[100px] bg-[#0ea5e9] blur-[100px] opacity-30 pointer-events-none rounded-full" />
          <h1 className="relative text-4xl md:text-6xl font-black mb-4 tracking-tighter text-slate-900 dark:text-white uppercase">
            AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] drop-shadow-sm dark:drop-shadow-[0_0_15px_rgba(14,165,233,0.6)]">HOLO-SCAN</span> CV
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed text-sky-700 dark:text-[#38bdf8] font-mono tracking-tight opacity-90 mt-4 border-t border-[#0ea5e9]/20 pt-4">
            Upload CV của bạn để nhận phân tích 3D chi tiết, đánh giá điểm mạnh, điểm yếu và gợi ý cải thiện tổng quan từ AI Core.
          </p>
        </div>

        {!hasCV && !isAnalyzing && (
          <CVUploadArea onUpload={handleUpload} isAnalyzing={isAnalyzing} />
        )}

        {isAnalyzing && (
          <CVAnalysisLoading />
        )}

        {showResults && !isAnalyzing && aiResults && (
          <CVAnalysisResult aiResults={aiResults} onReupload={handleReupload} />
        )}
      </div>
    </div>
  );
}
export default CVReview;
