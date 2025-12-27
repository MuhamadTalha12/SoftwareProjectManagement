// src/pages/Landing.jsx
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  FiZap, 
  FiSave, 
  FiDownload, 
  FiAward, 
  FiTarget,
  FiUsers,
  FiBarChart,
  FiShield,
  FiGlobe,
  FiChevronRight
} from 'react-icons/fi';
import { FaRobot, FaLightbulb, FaChartLine } from 'react-icons/fa';
import { useEffect, useState } from 'react';

const Landing = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
      
      // Show CTA when scrolled 30%
      if (window.scrollY > window.innerHeight * 0.3) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <FaRobot className="text-4xl" />,
      title: 'AI-Powered Generation',
      description: 'Leverage cutting-edge AI to create professional, compelling proposals in minutes',
      gradient: 'from-purple-500 to-pink-500',
      delay: 0.1
    },
    {
      icon: <FiSave className="text-4xl" />,
      title: 'Save as Draft',
      description: 'Work at your own pace with auto-save and version control features',
      gradient: 'from-blue-500 to-cyan-500',
      delay: 0.2
    },
    {
      icon: <FiDownload className="text-4xl" />,
      title: 'Export to PDF',
      description: 'Download professionally formatted proposals ready for submission',
      gradient: 'from-green-500 to-emerald-500',
      delay: 0.3
    },
    {
      icon: <FiAward className="text-4xl" />,
      title: 'Grant Success Rate',
      description: 'Increase your funding success with data-driven insights',
      gradient: 'from-orange-500 to-red-500',
      delay: 0.4
    },
    {
      icon: <FiTarget className="text-4xl" />,
      title: 'Smart Templates',
      description: 'Industry-specific templates for various funding agencies',
      gradient: 'from-indigo-500 to-purple-500',
      delay: 0.5
    },
    {
      icon: <FiUsers className="text-4xl" />,
      title: 'Collaborative Editing',
      description: 'Work seamlessly with your research team in real-time',
      gradient: 'from-pink-500 to-rose-500',
      delay: 0.6
    }
  ];

  const stats = [
    { value: '98%', label: 'Success Rate', sublabel: 'Average satisfaction' },
    { value: '50K+', label: 'Proposals', sublabel: 'Generated successfully' },
    { value: '3.5x', label: 'Faster', sublabel: 'Than traditional methods' },
    { value: '24/7', label: 'Support', sublabel: 'Expert assistance available' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50">
        <motion.div 
          className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
          style={{ width: `${scrollProgress}%` }}
          transition={{ type: "spring", stiffness: 100 }}
        />
      </div>

      {/* Floating CTA */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 z-40"
          >
            <Link to="/signup">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 hover:shadow-3xl transition-all duration-300"
              >
                <span className="font-bold">Get Started Free</span>
                <FiChevronRight className="text-xl" />
              </motion.div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <motion.div
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 opacity-60"
            style={{
              backgroundSize: '400% 400%',
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="text-center"
          >
            {/* Animated Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200 mb-8"
            >
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2 animate-pulse"></span>
              <span className="text-sm font-semibold text-purple-700">
                Trusted by 10,000+ researchers worldwide
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6"
            >
              <span className="block text-gradient-primary">
                Craft Winning
              </span>
              <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Funding Proposals
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed"
            >
              Transform your research ideas into compelling grant applications with our AI-powered platform.
              Join thousands of successful researchers who've secured funding faster and easier.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            >
              <Link to="/signup">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-primary group-hover:opacity-90 transition-all duration-300" />
                  <div className="relative bg-gradient-primary px-8 py-4 rounded-2xl text-white font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300">
                    <span className="flex items-center">
                      Start Free Trial
                      <FiChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </motion.div>
              </Link>

              <Link to="/demo">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 rounded-2xl bg-white border-2 border-gray-200 text-gray-700 font-bold text-lg shadow-lg hover:shadow-xl hover:border-purple-200 hover:bg-purple-50 transition-all duration-300"
                >
                  <span className="flex items-center">
                    <FiZap className="mr-2 text-purple-600" />
                    Watch Demo
                  </span>
                </motion.button>
              </Link>
            </motion.div>

            {/* Stats Preview */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="text-center bg-white p-4 rounded-2xl shadow-lg border border-gray-100"
                >
                  <div className="text-3xl md:text-4xl font-bold text-gradient-primary">
                    {stat.value}
                  </div>
                  <div className="text-sm font-semibold text-gray-700 mt-2">{stat.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{stat.sublabel}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="text-gray-400 text-sm font-medium flex flex-col items-center">
            <span>Scroll to explore</span>
            <svg className="w-6 h-6 mt-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              className="inline-block mb-4"
            >
              <div className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-blue-100">
                <span className="text-sm font-semibold text-purple-700">FEATURES</span>
              </div>
            </motion.div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need to{' '}
              <span className="text-gradient-primary">
                Succeed
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A comprehensive suite of tools designed specifically for researchers and academics
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: feature.delay }}
                whileHover={{ y: -10 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white to-gray-50 rounded-3xl border-2 border-gray-100 group-hover:border-purple-200 transition-all duration-300" />
                <div className="relative p-8">
                  <div className={`mb-6 w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center text-white shadow-lg`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 mb-6">{feature.description}</p>
                  <div className="flex items-center text-purple-600 font-medium">
                    <span>Learn more</span>
                    <FiChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo/Testimonial Section */}
      <section className="py-24 bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <div className="aspect-video bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center">
                      <FiZap className="text-3xl text-purple-600" />
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
                  <div className="text-white">
                    <div className="text-sm font-medium mb-1">Watch Demo</div>
                    <div className="text-lg font-bold">See our platform in action</div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                Join <span className="text-gradient-primary">
                  10,000+
                </span>{' '}
                Successful Researchers
              </h3>
              
              <div className="space-y-6 mb-8">
                {[
                  {
                    quote: "This platform cut our proposal writing time by 70% and helped us secure a $2M NIH grant.",
                    author: "Dr. Sarah Chen",
                    role: "Principal Investigator, Stanford University",
                    avatar: "SC"
                  },
                  {
                    quote: "The AI suggestions dramatically improved our proposal's clarity and impact.",
                    author: "Prof. James Wilson",
                    role: "Research Director, MIT",
                    avatar: "JW"
                  }
                ].map((testimonial, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 }}
                    className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
                  >
                    <div className="flex items-start mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold mr-4">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{testimonial.author}</div>
                        <div className="text-sm text-gray-600">{testimonial.role}</div>
                      </div>
                    </div>
                    <p className="text-gray-700 italic">"{testimonial.quote}"</p>
                  </motion.div>
                ))}
              </div>

              <Link to="/signup">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-primary text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  <span className="flex items-center justify-center">
                    Start Your Free Trial
                    <FiChevronRight className="ml-2" />
                  </span>
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            Ready to Transform Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-300">
              Research Funding
            </span>
            ?
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white/90 mb-10 max-w-2xl mx-auto"
          >
            Join thousands of researchers who've already secured millions in funding with our platform
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/signup">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group"
              >
                <div className="px-10 py-5 rounded-2xl bg-white text-gray-900 font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 group-hover:bg-gray-50">
                  <span className="flex items-center">
                    Get Started Free
                    <FiChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </motion.div>
            </Link>
            
            <Link to="/contact">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-5 rounded-2xl bg-transparent border-2 border-white text-white font-bold text-lg hover:bg-white/10 transition-all duration-300"
              >
                Schedule a Demo
              </motion.button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-12 text-white/80"
          >
            <div className="flex flex-wrap justify-center items-center gap-4 text-sm">
              <div className="flex items-center">
                <FiShield className="mr-2" />
                <span>Secure & Compliant</span>
              </div>
              <div className="hidden sm:block">•</div>
              <div className="flex items-center">
                <FiGlobe className="mr-2" />
                <span>Global Support</span>
              </div>
              <div className="hidden sm:block">•</div>
              <div className="flex items-center">
                <FiZap className="mr-2" />
                <span>No credit card required</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;