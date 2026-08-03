import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Layers, Mail, Settings, Zap, Download } from 'lucide-react';
import Button from '../components/ui/Button';

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-4 text-indigo-600">
      <Icon className="w-6 h-6" />
    </div>
    <h3 className="text-xl font-semibold mb-2 text-gray-900">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </motion.div>
);

const Landing = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">DocExtract</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">Log in</Link>
            <Link to="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-32 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6"
        >
          Extract Data from Any Document with <span className="text-indigo-600">AI</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed"
        >
          Automate your workflow by effortlessly extracting structured data from PDFs, emails, and images. Build custom templates and let AI do the heavy lifting.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/signup">
            <Button size="lg" className="w-full sm:w-auto">Start for free</Button>
          </Link>
          <a href="#features">
            <Button variant="ghost" size="lg" className="w-full sm:w-auto">Learn more</Button>
          </a>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Powerful features for modern teams</h2>
            <p className="mt-4 text-lg text-gray-600">Everything you need to automate your document processing workflow.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Layers}
              title="Custom Fields"
              description="Define exactly what data you want to extract. Build complex templates with text, dates, numbers, and more."
              delay={0}
            />
            <FeatureCard 
              icon={Mail}
              title="Gmail Integration"
              description="Automatically process incoming emails and their attachments without lifting a finger."
              delay={0.1}
            />
            <FeatureCard 
              icon={Zap}
              title="AI-Powered"
              description="State-of-the-art language models understand context, handling variations in document formats seamlessly."
              delay={0.2}
            />
            <FeatureCard 
              icon={Download}
              title="CSV Export"
              description="Download your extracted data instantly or sync it directly to Google Sheets."
              delay={0.3}
            />
            <FeatureCard 
              icon={Settings}
              title="Automated Sessions"
              description="Set it and forget it. Create recurring extraction sessions that run on your schedule."
              delay={0.4}
            />
            <FeatureCard 
              icon={FileText}
              title="Batch Processing"
              description="Upload hundreds of documents at once and process them all in parallel."
              delay={0.5}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-12 text-center border-t border-gray-200">
        <p className="text-gray-500">© {new Date().getFullYear()} DocExtract. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;
