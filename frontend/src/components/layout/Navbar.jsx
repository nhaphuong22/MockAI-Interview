import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, LogIn } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function Navbar() {
  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50",
      "backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-800"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <Bot className="w-8 h-8 text-primary" />
            <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">
              MockAI<span className="text-primary">Interview</span>
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary font-medium px-3 py-2 transition-colors">
              Features
            </button>
            <button className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary font-medium px-3 py-2 transition-colors">
              Pricing
            </button>
            <Link 
              to="/admin"
              className={cn(
                "flex items-center gap-2",
                "bg-primary hover:bg-secondary text-white px-4 py-2 rounded-full font-medium transition-colors shadow-lg shadow-primary/30"
              )}
            >
              <LogIn className="w-4 h-4" />
              Sign In (Test Admin)
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
