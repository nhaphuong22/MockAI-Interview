import React from 'react';
import { motion } from 'framer-motion';
import { Mic, FileText, LayoutDashboard, Code, BarChart } from 'lucide-react';
import { cn } from '../../utils/cn';

const features = [
  {
    icon: <FileText className="w-6 h-6" />,
    title: "CV Processing",
    description: "Upload your CV and JD. Our ATS-like AI will analyze gaps, suggest Action Verbs, and optimize your profile before the interview.",
    color: "from-blue-500 to-cyan-400"
  },
  {
    icon: <Mic className="w-6 h-6" />,
    title: "AI Voice Engine",
    description: "Real-time voice interviews with Llama-3. Choose between Friendly or Pressure HR styles for a highly realistic simulation.",
    color: "from-primary to-secondary"
  },
  {
    icon: <Code className="w-6 h-6" />,
    title: "Technical Sandbox",
    description: "Integrated Mini IDE with syntax highlighting. The AI analyzes your code logic and algorithm choices on the fly.",
    color: "from-emerald-500 to-teal-400"
  },
  {
    icon: <BarChart className="w-6 h-6" />,
    title: "Assessment & Report",
    description: "Get a comprehensive 5-axis Radar Chart evaluation and a personalized learning path exported as a detailed PDF.",
    color: "from-orange-500 to-amber-400"
  },
  {
    icon: <LayoutDashboard className="w-6 h-6" />,
    title: "Admin Analytics",
    description: "Deep insights into candidate trends, system usage, and an auto-generating Question Bank powered by AI.",
    color: "from-pink-500 to-rose-400"
  }
];

export default function Features() {
  return (
    <section className="py-24 bg-white dark:bg-gray-950 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4"
          >
            A Complete Career Ecosystem
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto"
          >
            End-to-end support modules designed to guide you through every stage of your job search.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -10 }}
              className={cn(
                "p-8 rounded-3xl backdrop-blur-sm border transition-all duration-300",
                "bg-gray-50/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800",
                "hover:shadow-2xl hover:shadow-primary/20 dark:hover:border-gray-700"
              )}
            >
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-white bg-gradient-to-br",
                feature.color
              )}>
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
