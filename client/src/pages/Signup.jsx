// Signup.jsx - Enhanced Version
import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { AuthContext } from '../utils/context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiCheck,
  FiX,
  FiShield,
  FiUpload
} from 'react-icons/fi';
import { FaGoogle, FaGithub, FaTwitter } from 'react-icons/fa';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [step, setStep] = useState(1);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Password strength checker
  useEffect(() => {
    const calculateStrength = () => {
      let strength = 0;
      if (formData.password.length >= 8) strength += 25;
      if (/[A-Z]/.test(formData.password)) strength += 25;
      if (/[0-9]/.test(formData.password)) strength += 25;
      if (/[^A-Za-z0-9]/.test(formData.password)) strength += 25;
      setPasswordStrength(strength);
    };
    
    if (formData.password) calculateStrength();
    else setPasswordStrength(0);
  }, [formData.password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (passwordStrength < 75) {
      setError('Please use a stronger password');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data } = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      login(data.token, { 
        _id: data._id, 
        name: data.name, 
        email: data.email,
        avatar: data.avatar 
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength < 50) return 'bg-red-500';
    if (passwordStrength < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const nextStep = () => {
    if (step < 2) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSocialSignup = (provider) => {
    window.location.href = `/auth/${provider}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-white to-pink-50 overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/3 left-1/4 w-64 h-64 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 blur-3xl"
          animate={{
            y: [0, 30, 0],
            x: [0, 20, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-20 blur-3xl"
          animate={{
            y: [0, -40, 0],
            x: [0, -20, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
          className="bg-white/90 backdrop-blur-xl p-10 rounded-3xl shadow-2xl max-w-xl w-full border border-white/20"
        >
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center">
              {[1, 2].map((s) => (
                <div key={s} className="flex items-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: s <= step ? 1 : 0.8 }}
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                      s <= step 
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {s === step ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : s < step ? (
                      <FiCheck />
                    ) : (
                      s
                    )}
                  </motion.div>
                  {s < 2 && (
                    <div className={`w-24 h-1 mx-2 rounded-full ${s < step ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm font-semibold text-gray-600"
            >
              Step {step} of 2
            </motion.div>
          </div>

          {/* Header */}
          <div className="text-center mb-10">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2"
            >
              Join Our Community
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-gray-600"
            >
              Create your account and start your journey
            </motion.p>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={(e) => { e.preventDefault(); nextStep(); }}
                className="space-y-6"
              >
                <div className="flex flex-col items-center mb-8">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-indigo-400">
                          <FiUser className="text-6xl" />
                        </div>
                      )}
                    </div>
                    <label className="absolute bottom-2 right-2 w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-shadow">
                      <FiUpload className="text-white text-xl" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-gray-500 text-sm mt-3">Upload a profile picture (optional)</p>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-3 text-sm uppercase tracking-wider">
                    <FiUser className="inline mr-2" />
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-5 py-4 pl-14 bg-white/50 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-300 outline-none"
                      placeholder="John Doe"
                      required
                    />
                    <div className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <FiUser />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-3 text-sm uppercase tracking-wider">
                    <FiMail className="inline mr-2" />
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-5 py-4 pl-14 bg-white/50 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-300 outline-none"
                      placeholder="hello@example.com"
                      required
                    />
                    <div className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <FiMail />
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
                >
                  Continue
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.button>
              </motion.form>
            ) : (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition-colors mb-4"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>

                <div>
                  <label className="block text-gray-700 font-semibold mb-3 text-sm uppercase tracking-wider">
                    <FiLock className="inline mr-2" />
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-5 py-4 pl-14 pr-14 bg-white/50 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-300 outline-none"
                      placeholder="Create a strong password"
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
                  
                  {/* Password Strength Meter */}
                  {formData.password && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 space-y-2"
                    >
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Password Strength</span>
                        <span className={`font-bold ${getStrengthColor().replace('bg-', 'text-')}`}>
                          {passwordStrength < 50 ? 'Weak' : passwordStrength < 75 ? 'Fair' : 'Strong'}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${passwordStrength}%` }}
                          className={`h-full ${getStrengthColor()} rounded-full`}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <div className="flex items-center">
                          {formData.password.length >= 8 ? (
                            <FiCheck className="text-green-500 mr-2" />
                          ) : (
                            <FiX className="text-red-500 mr-2" />
                          )}
                          8+ characters
                        </div>
                        <div className="flex items-center">
                          {/[A-Z]/.test(formData.password) ? (
                            <FiCheck className="text-green-500 mr-2" />
                          ) : (
                            <FiX className="text-red-500 mr-2" />
                          )}
                          Uppercase letter
                        </div>
                        <div className="flex items-center">
                          {/[0-9]/.test(formData.password) ? (
                            <FiCheck className="text-green-500 mr-2" />
                          ) : (
                            <FiX className="text-red-500 mr-2" />
                          )}
                          Number
                        </div>
                        <div className="flex items-center">
                          {/[^A-Za-z0-9]/.test(formData.password) ? (
                            <FiCheck className="text-green-500 mr-2" />
                          ) : (
                            <FiX className="text-red-500 mr-2" />
                          )}
                          Special character
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-3 text-sm uppercase tracking-wider">
                    <FiLock className="inline mr-2" />
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className={`w-full px-5 py-4 pl-14 pr-14 bg-white/50 border-2 rounded-2xl focus:ring-4 focus:ring-indigo-100 transition-all duration-300 outline-none ${
                        formData.confirmPassword && formData.password !== formData.confirmPassword
                          ? 'border-red-500 focus:border-red-500'
                          : formData.password === formData.confirmPassword && formData.confirmPassword
                          ? 'border-green-500 focus:border-green-500'
                          : 'border-gray-200 focus:border-indigo-500'
                      }`}
                      placeholder="Confirm your password"
                      required
                    />
                    <div className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <FiLock />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-red-500 text-sm mt-2"
                    >
                      Passwords don't match
                    </motion.p>
                  )}
                </div>

                {/* Terms & Conditions */}
                <div className="flex items-center p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="terms" className="ml-3 text-sm text-gray-700">
                    I agree to the{' '}
                    <Link to="/terms" className="text-indigo-600 hover:text-indigo-800 font-medium">
                      Terms & Conditions
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-indigo-600 hover:text-indigo-800 font-medium">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 p-4 rounded-r-lg"
                  >
                    <div className="flex items-center">
                      <FiShield className="text-red-500 mr-3" />
                      <span className="text-red-700">{error}</span>
                    </div>
                  </motion.div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Social Signup */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-10"
            >
              <div className="flex items-center my-6">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                <span className="px-4 text-gray-500 text-sm font-medium">OR SIGN UP WITH</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: FaGoogle, provider: 'google', color: 'hover:border-red-400' },
                  { icon: FaGithub, provider: 'github', color: 'hover:border-gray-800' },
                  { icon: FaTwitter, provider: 'twitter', color: 'hover:border-blue-400' },
                ].map(({ icon: Icon, provider, color }) => (
                  <motion.button
                    key={provider}
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 0 }}
                    type="button"
                    onClick={() => handleSocialSignup(provider)}
                    className={`flex items-center justify-center p-4 bg-white border-2 border-gray-200 rounded-2xl ${color} hover:shadow-md transition-all duration-300 group`}
                  >
                    <Icon className="text-xl group-hover:scale-110 transition-transform" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center pt-6 border-t border-gray-100"
          >
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
              >
                Sign In
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Signup;