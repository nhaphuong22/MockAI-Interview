import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';
import { motion } from 'framer-motion';

function AnimatedSphere() {
  const sphereRef = useRef(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (sphereRef.current) {
      sphereRef.current.position.y = Math.sin(time) * 0.2;
      sphereRef.current.rotation.y = time * 0.2;
    }
  });

  return (
    <Sphere ref={sphereRef} visible args={[1, 100, 200]} scale={2}>
      <MeshDistortMaterial
        color="#0ea5e9"
        attach="material"
        distort={0.4}
        speed={2}
        roughness={0.2}
      />
    </Sphere>
  );
}

export default function Hero3D() {
  return (
    <div className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0 opacity-60">
        <Canvas>
          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
          <ambientLight intensity={1} />
          <directionalLight position={[3, 2, 1]} intensity={2} />
          <AnimatedSphere />
        </Canvas>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pointer-events-none">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6"
        >
          Elevate Your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            Career Journey
          </span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-4 max-w-2xl text-xl text-gray-600 dark:text-gray-300 mx-auto mb-10"
        >
          The all-in-one AI platform to optimize your CV, practice realistic interviews, and land your dream job at top tech companies.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex justify-center gap-4 pointer-events-auto"
        >
          <button className="px-8 py-4 bg-primary text-white rounded-full font-bold text-lg hover:bg-secondary transition-all shadow-[0_0_20px_rgba(14,165,233,0.4)] hover:shadow-[0_0_30px_rgba(14,165,233,0.6)]">
            Start Free Interview
          </button>
          <button className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-full font-bold text-lg border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary transition-colors">
            View Live Demo
          </button>
        </motion.div>
      </div>
    </div>
  );
}
