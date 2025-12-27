// Login.jsx - Enhanced Version
import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { AuthContext } from '../utils/context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  FiMail, 
  FiLock, 
  FiEye, 
  FiEyeOff,
  FiLogIn,
  FiUser,
  FiShield 
} from 'react-icons/fi';
import { FaGoogle, FaGithub, FaTwitter } from 'react-icons/fa';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [particles, setParticles] = useState([]);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Create floating particles
  useEffect(() => {
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 10 + 5,
      duration: Math.random() * 10 + 10,
    }));
    setParticles(newParticles);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const { data } = await api.post('/auth/login', formData);
      login(data.token, { 
        _id: data._id, 
        name: data.name, 
        email: data.email,
        avatar: data.avatar 
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    // Implement social login
    window.location.href = `/auth/${provider}`;
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-white to-blue-50 overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-gradient-to-r from-purple-300 to-blue-300 opacity-20"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, Math.random() * 10 - 5, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
        
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 -left-24 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-10 blur-3xl" />
        <div className="absolute bottom-1/4 -right-24 w-96 h-96 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-10 blur-3xl" />
      </div>

      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 relative z-10">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-8 left-1/2 transform -translate-x-1/2 w-full max-w-md"
            >
              <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center justify-between">
                <div className="flex items-center">
                  <FiShield className="mr-3 text-xl" />
                  <span>{error}</span>
                </div>
                <button 
                  onClick={() => setError('')}
                  className="text-white hover:text-red-100 transition-colors"
                >
                  ×
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
          className="bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl max-w-md w-full border border-white/20"
        >
          {/* Decorative Header */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg"
            >
              <FiLogIn className="text-white text-3xl" />
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2"
            >
              Welcome Back
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600"
            >
              Sign in to your account to continue
            </motion.p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label className="block text-gray-700 font-semibold mb-3 text-sm uppercase tracking-wider">
                <FiMail className="inline mr-2" />
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-5 py-4 pl-14 bg-white/50 border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 outline-none"
                  placeholder="hello@example.com"
                  required
                />
                <div className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <FiMail />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <label className="block text-gray-700 font-semibold mb-3 text-sm uppercase tracking-wider">
                <FiLock className="inline mr-2" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-5 py-4 pl-14 pr-14 bg-white/50 border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 outline-none"
                  placeholder="••••••••"
                  required
                />
                <div className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <FiLock />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              
              <div className="flex justify-between items-center mt-3">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors"
                >
                  Forgot password?
                </button>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-400 mr-2"></div>
                  <span className="text-xs text-gray-500">Secure connection</span>
                </div>
              </div>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                  Signing In...
                </>
              ) : (
                <>
                  <FiLogIn className="mr-3" />
                  Sign In
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            <span className="px-4 text-gray-500 text-sm font-medium">OR CONTINUE WITH</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
              type="button"
              onClick={() => handleSocialLogin('google')}
              className="flex items-center justify-center p-4 bg-white border-2 border-gray-200 rounded-2xl hover:border-red-400 hover:shadow-md transition-all duration-300 group"
            >
              <FaGoogle className="text-xl text-red-500 group-hover:scale-110 transition-transform" />
            </motion.button>
            
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
              type="button"
              onClick={() => handleSocialLogin('github')}
              className="flex items-center justify-center p-4 bg-white border-2 border-gray-200 rounded-2xl hover:border-gray-800 hover:shadow-md transition-all duration-300 group"
            >
              <FaGithub className="text-xl text-gray-800 group-hover:scale-110 transition-transform" />
            </motion.button>
            
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
              type="button"
              onClick={() => handleSocialLogin('twitter')}
              className="flex items-center justify-center p-4 bg-white border-2 border-gray-200 rounded-2xl hover:border-blue-400 hover:shadow-md transition-all duration-300 group"
            >
              <FaTwitter className="text-xl text-blue-500 group-hover:scale-110 transition-transform" />
            </motion.button>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center pt-6 border-t border-gray-100"
          >
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link 
                to="/signup" 
                className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
              >
                Create Account
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;