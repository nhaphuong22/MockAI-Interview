import React, { useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

// Link GLTF model Robot Expressive công khai
const MODEL_URL = "https://vazgriz.github.io/three.js/examples/models/gltf/RobotExpressive/RobotExpressive.glb";

// Preload model
try {
  useGLTF.preload(MODEL_URL);
} catch (e) {
  console.warn("Failed to preload 3D model:", e.message);
}

/**
 * Bộ sinh số giả ngẫu nhiên thuần khiết (PRNG) dựa trên seed tĩnh để tránh Math.random trong render
 */
const pseudoRandom = (seed) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

/**
 * Cụm hạt ánh sáng lơ lửng (Floating Particles) tạo chiều sâu 3D
 */
function FloatingParticles({ count = 35 }) {
  const pointsRef = useRef();
  
  // Tạo tọa độ giả ngẫu nhiên cho các hạt (thuần khiết)
  const positions = React.useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      const randX = pseudoRandom(i * 12.3 + 1.1);
      const randY = pseudoRandom(i * 24.5 + 2.2);
      const randZ = pseudoRandom(i * 37.7 + 3.3);
      arr.push(
        (randX - 0.5) * 2.2, // X range
        (randY - 0.5) * 2.0 + 0.3, // Y range (centered around head)
        (randZ - 0.5) * 1.5  // Z range
      );
    }
    return new Float32Array(arr);
  }, [count]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (pointsRef.current) {
      // Xoay nhẹ cụm hạt
      pointsRef.current.rotation.y = time * 0.04;
      
      // Tạo dao động nhấp nhô nhẹ cho các hạt
      const pos = pointsRef.current.geometry.attributes.position.array;
      for (let i = 1; i < pos.length; i += 3) {
        pos[i] += Math.sin(time * 0.5 + i) * 0.0008;
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        color="#38bdf8"
        transparent
        opacity={0.5}
        sizeAttenuation
      />
    </points>
  );
}

/**
 * Robot stylized 3D fallback bằng các mesh hình học cơ bản (Sci-Fi, Ocean Blue)
 */
function FallbackRobot({ volume, isListening }) {
  const headRef = useRef();
  const ringRef = useRef();
  const ringInnerRef = useRef();
  const eyeLeftRef = useRef();
  const eyeRightRef = useRef();
  
  // Ref cho 3 cột LED Equalizer của miệng
  const mouthMidRef = useRef();
  const mouthLeftRef = useRef();
  const mouthRightRef = useRef();

  const blinkTimerRef = useRef(0);
  const isBlinkingRef = useRef(false);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // 1. Idle Swing: Lắc lư đầu nhẹ
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(time * 0.8) * 0.06;
      headRef.current.rotation.x = Math.sin(time * 1.2) * 0.03;
      
      // Listening State: Gật đầu nhẹ động viên khi ứng viên nói
      if (isListening) {
        headRef.current.position.y = Math.sin(time * 6.0) * 0.02 + 0.3;
      } else {
        headRef.current.position.y = Math.sin(time * 0.8) * 0.01 + 0.3;
      }
    }

    // 2. Xoay các vòng Hologram Sci-Fi
    if (ringRef.current) {
      ringRef.current.rotation.y = time * 0.4;
      ringRef.current.rotation.x = Math.sin(time * 0.2) * 0.1;
    }
    if (ringInnerRef.current) {
      ringInnerRef.current.rotation.y = -time * 0.6;
      ringInnerRef.current.rotation.z = Math.cos(time * 0.3) * 0.15;
    }

    // 3. Lipsync: Scale 3 cột miệng LED theo âm lượng volume của AI TTS
    const vol = volume || 0;
    if (mouthMidRef.current && mouthLeftRef.current && mouthRightRef.current) {
      // Cột giữa mở rộng nhiều nhất, 2 cột bên mở rộng ít hơn một chút tạo hình Equalizer sóng âm
      const targetMid = 0.2 + vol * 1.8;
      const targetSide = 0.1 + vol * 1.1;

      mouthMidRef.current.scale.y += (targetMid - mouthMidRef.current.scale.y) * 0.3;
      mouthLeftRef.current.scale.y += (targetSide - mouthLeftRef.current.scale.y) * 0.3;
      mouthRightRef.current.scale.y += (targetSide - mouthRightRef.current.scale.y) * 0.3;
    }

    // 4. Blinking: Chớp mắt ngẫu nhiên sau mỗi 3-4 giây
    blinkTimerRef.current += delta;
    if (blinkTimerRef.current > 3.2 && !isBlinkingRef.current) {
      isBlinkingRef.current = true;
      blinkTimerRef.current = 0;
    }

    if (isBlinkingRef.current) {
      const blinkScaleY = 0.05;
      if (eyeLeftRef.current && eyeRightRef.current) {
        eyeLeftRef.current.scale.y += (blinkScaleY - eyeLeftRef.current.scale.y) * 0.7;
        eyeRightRef.current.scale.y += (blinkScaleY - eyeRightRef.current.scale.y) * 0.7;
        
        if (eyeLeftRef.current.scale.y < 0.1) {
          isBlinkingRef.current = false; // Mở mắt
        }
      }
    } else {
      if (eyeLeftRef.current && eyeRightRef.current) {
        eyeLeftRef.current.scale.y += (1 - eyeLeftRef.current.scale.y) * 0.35;
        eyeRightRef.current.scale.y += (1 - eyeRightRef.current.scale.y) * 0.35;
      }
    }
  });

  return (
    <group position={[0, -0.5, 0]}>
      {/* Cụm hạt ánh sáng lơ lửng */}
      <FloatingParticles count={35} />

      {/* Vòng xoay Hologram ngoài */}
      <group ref={ringRef} position={[0, 0.3, 0]}>
        <mesh rotation={[Math.PI / 2 + 0.1, 0, 0]}>
          <torusGeometry args={[0.52, 0.006, 8, 64]} />
          <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.8} transparent opacity={0.3} />
        </mesh>
      </group>

      {/* Vòng xoay Hologram trong */}
      <group ref={ringInnerRef} position={[0, 0.3, 0]}>
        <mesh rotation={[Math.PI / 2 - 0.2, 0, 0]}>
          <torusGeometry args={[0.45, 0.004, 8, 48]} />
          <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={0.6} transparent opacity={0.2} />
        </mesh>
      </group>

      {/* Thân Robot (Chất liệu Kim loại sáng xám bạc bóng bẩy) */}
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.24, 0.32, 0.65, 32]} />
        <meshStandardMaterial color="#475569" roughness={0.15} metalness={0.9} />
      </mesh>

      {/* Khớp nối vai phát sáng neon */}
      <mesh position={[-0.3, -0.25, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.06, 0.08, 16]} />
        <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={1.0} />
      </mesh>
      <mesh position={[0.3, -0.25, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.06, 0.08, 16]} />
        <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={1.0} />
      </mesh>

      {/* Cổ (Kim loại đậm) */}
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.16, 16]} />
        <meshStandardMaterial color="#1e293b" roughness={0.1} metalness={0.9} />
      </mesh>

      {/* Đầu Robot (Bán kính 0.24, đẩy các chi tiết visor và mắt ra ngoài) */}
      <group ref={headRef} position={[0, 0.3, 0]}>
        <mesh>
          <sphereGeometry args={[0.24, 32, 32]} />
          <meshStandardMaterial color="#334155" roughness={0.12} metalness={0.9} />
        </mesh>
        
        {/* Vành tai nghe neon */}
        <mesh position={[-0.24, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.08, 0.05, 16]} />
          <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={1.2} />
        </mesh>
        <mesh position={[0.24, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.08, 0.05, 16]} />
          <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={1.2} />
        </mesh>

        {/* Khung kính hiển thị mắt visor (Đẩy hẳn ra Z = 0.21) */}
        <mesh position={[0, 0.04, 0.21]}>
          <boxGeometry args={[0.32, 0.11, 0.07]} />
          <meshStandardMaterial color="#0f172a" roughness={0.1} metalness={0.6} />
        </mesh>

        {/* Mắt trái (Đẩy ra Z = 0.25, nổi trên visor) */}
        <mesh ref={eyeLeftRef} position={[-0.08, 0.04, 0.25]}>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={2.0} />
        </mesh>

        {/* Mắt phải (Đẩy ra Z = 0.25, nổi trên visor) */}
        <mesh ref={eyeRightRef} position={[0.08, 0.04, 0.25]}>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={2.0} />
        </mesh>

        {/* Khung miệng tối (Đẩy ra Z = 0.21) */}
        <mesh position={[0, -0.11, 0.21]}>
          <boxGeometry args={[0.18, 0.06, 0.04]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} />
        </mesh>

        {/* 3 cột LED Equalizer nhấp nháy (Đẩy hẳn ra Z = 0.24) */}
        <group position={[0, -0.11, 0.24]}>
          {/* Cột giữa */}
          <mesh ref={mouthMidRef} position={[0, 0, 0]}>
            <boxGeometry args={[0.016, 0.04, 0.01]} />
            <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={2.2} />
          </mesh>
          {/* Cột trái */}
          <mesh ref={mouthLeftRef} position={[-0.035, 0, 0]}>
            <boxGeometry args={[0.014, 0.04, 0.01]} />
            <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1.8} />
          </mesh>
          {/* Cột phải */}
          <mesh ref={mouthRightRef} position={[0.035, 0, 0]}>
            <boxGeometry args={[0.014, 0.04, 0.01]} />
            <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1.8} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/**
 * GLTF Robot Model loader và điều khiển
 */
function GltfRobotModel({ volume, isListening }) {
  const { scene } = useGLTF(MODEL_URL);
  const modelRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (!modelRef.current) return;

    // 1. Idle Swing: Xoay nhẹ đầu/cơ thể
    modelRef.current.rotation.y = Math.sin(time * 0.6) * 0.04;
    
    // Tìm khớp đầu (Head) và cằm (Jaw/Mouth) của model
    scene.traverse((child) => {
      // Idle head nod
      if (child.isBone && child.name.toLowerCase().includes("head")) {
        child.rotation.y = Math.sin(time * 0.8) * 0.03;
        child.rotation.x = Math.sin(time * 1.1) * 0.02;
        if (isListening) {
          child.rotation.x += Math.sin(time * 5.0) * 0.03; // Gật đầu khi nghe
        }
      }

      // Mấp máy miệng theo Lipsync âm lượng
      if (child.isMesh && child.morphTargetInfluences) {
        // Tìm index của morphTarget miệng mở (thường tên là mouthOpen, jawOpen, hoặc index 0)
        const jawOpenIndex = child.morphTargetDictionary ? (child.morphTargetDictionary.jawOpen || child.morphTargetDictionary.mouthOpen || 0) : 0;
        if (child.morphTargetInfluences[jawOpenIndex] !== undefined) {
          // Gán trị biến dạng miệng theo âm lượng volume (0 -> 1)
          const targetInfluence = (volume || 0) * 1.1;
          child.morphTargetInfluences[jawOpenIndex] += (targetInfluence - child.morphTargetInfluences[jawOpenIndex]) * 0.25;
        }
      }
    });
  });

  return (
    <primitive 
      ref={modelRef} 
      object={scene} 
      position={[0, -1.0, 0]} 
      scale={0.8}
    />
  );
}

class AvatarErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.warn("Avatar3D GLTF load error captured by boundary. Falling back to Robot mesh:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

/**
 * Wrapper render Model GLTF có catch error để tự động chuyển sang Fallback Robot
 */
function SafeAvatar({ volume, isListening }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const checkModel = async () => {
      try {
        // useGLTF sử dụng fetch ngầm. Nếu lỗi CORS hoặc network sẽ nhảy vào catch
        await fetch(MODEL_URL, { method: "HEAD", mode: "no-cors" });
      } catch (err) {
        console.warn("Failed to reach 3D model CDN via prefetch. Using Fallback Robot Avatar.", err.message);
        setHasError(true);
      }
    };
    checkModel();
  }, []);

  const fallback = <FallbackRobot volume={volume} isListening={isListening} />;

  if (hasError) {
    return fallback;
  }

  return (
    <AvatarErrorBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <GltfRobotModel volume={volume} isListening={isListening} />
      </Suspense>
    </AvatarErrorBoundary>
  );
}

/**
 * Component chính Avatar3D chứa Canvas
 */
export function Avatar3D({ volume = 0, isListening = false }) {
  return (
    <div className="w-full h-full relative bg-gradient-to-b from-gray-950 to-gray-900 overflow-hidden">
      {/* Grid trang trí nền */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-15" />
      
      {/* Vòng tròn sáng neon xanh lam dưới chân Avatar */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-48 h-12 bg-[#0ea5e9]/10 rounded-full blur-xl border border-[#0ea5e9]/20" />

      <Canvas camera={{ position: [0, 0, 2.2], fov: 45 }}>
        {/* Ánh sáng */}
        <ambientLight intensity={1.2} />
        <directionalLight position={[1, 3, 3]} intensity={1.5} />
        <pointLight position={[-2, 1, 2]} intensity={1.0} color="#38bdf8" />
        <spotLight 
          position={[0, 3, 2]} 
          intensity={2.0} 
          angle={0.5} 
          penumbra={0.5} 
          color="#0ea5e9"
          castShadow
        />

        {/* Render Avatar */}
        <SafeAvatar volume={volume} isListening={isListening} />

        {/* Orbit Controls (hạn chế góc xoay để giữ góc nhìn chính) */}
        <OrbitControls 
          enableZoom={true} 
          maxDistance={3.5}
          minDistance={1.5}
          enablePan={false}
          maxPolarAngle={Math.PI / 2 + 0.1}
          minPolarAngle={Math.PI / 3}
          maxAzimuthAngle={Math.PI / 4}
          minAzimuthAngle={-Math.PI / 4}
        />
      </Canvas>
    </div>
  );
}
