import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { AuthContext } from '../utils/context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { 
  FiFileText, 
  FiEdit, 
  FiDownload, 
  FiDollarSign, 
  FiTrendingUp,
  FiClock,
  FiChevronRight,
  FiPlus,
  FiBarChart2,
  FiActivity
} from 'react-icons/fi';

const Dashboard = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProposals();
  }, []);

  // Helper to ensure consistent data structure
  const normalizeProposal = (p) => {
    const id = p?._id || p?.id;
    const projectTitle = p?.projectTitle || 'Untitled Proposal';
    const fundingAmount = Number(p?.fundingAmount) || 0;
    const updatedAt = p?.updatedAt || p?.createdAt || new Date().toISOString();
    const generatedProposal = p?.generatedProposal || '';
    const status = p?.status || (generatedProposal ? 'generated' : 'draft');

    return {
      ...p,
      _id: id,
      projectTitle,
      fundingAmount,
      updatedAt,
      generatedProposal,
      status,
    };
  };

  const fetchProposals = async () => {
    try {
      // FIX: Get user ID from localStorage to match backend requirement
      const userId = localStorage.getItem('user_id');
      
      if (!userId) {
        console.warn('No user ID found, skipping remote fetch');
        setLoading(false);
        return;
      }

      // 1. Fetch from Database (Primary Source)
      // FIX: Append userId to the URL
      const { data } = await api.get(`/proposals/${userId}`);
      const remoteList = Array.isArray(data) ? data.map(normalizeProposal) : [];

      // 2. Fetch from Local Storage (Backup/Offline drafts)
      const localList = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('draft_proposal_')) {
          try {
            const raw = localStorage.getItem(key);
            const draft = JSON.parse(raw);
            const id = key.replace('draft_proposal_', '');
            localList.push(normalizeProposal({ ...draft, _id: id, status: 'draft' }));
          } catch (e) {
            console.warn('Skipping malformed local draft', key);
          }
        }
      }

      // 3. Merge lists (Prefer Database over Local if IDs match)
      const mergedMap = new Map();
      [...localList, ...remoteList].forEach(p => {
        if (p._id) mergedMap.set(p._id, p);
      });

      setProposals(Array.from(mergedMap.values()));
    } catch (error) {
      console.error('Failed to fetch proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  // Real-time Stats Calculations
  const drafts = proposals.filter((p) => p.status === 'draft');
  const generated = proposals.filter((p) => p.status === 'generated');
  
  // REAL VALUE: Sum of actual funding amounts (defaults to 0 if empty)
  const totalFunding = proposals.reduce((sum, p) => sum + p.fundingAmount, 0);

  const stats = [
    { 
      label: 'Total Proposals', 
      value: proposals.length, 
      icon: FiFileText,
      color: 'from-blue-500 to-cyan-500',
      textColor: 'text-blue-600'
    },
    { 
      label: 'Drafts', 
      value: drafts.length, 
      icon: FiEdit,
      color: 'from-amber-500 to-orange-500',
      textColor: 'text-amber-600'
    },
    { 
      label: 'Generated Reports', 
      value: generated.length, 
      icon: FiDownload,
      color: 'from-emerald-500 to-green-500',
      textColor: 'text-emerald-600'
    },
    { 
      label: 'Funding Requested', 
      value: `$${totalFunding.toLocaleString()}`,
      icon: FiDollarSign,
      color: 'from-purple-500 to-pink-500',
      textColor: 'text-purple-600'
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-white">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-black to-gray-800 bg-clip-text text-transparent">
                  Welcome back, {user?.name || 'Researcher'}!
                </h1>
                <p className="text-gray-600 mt-2 flex items-center gap-2">
                  <FiActivity className="text-primary animate-pulse" />
                  <span>You have {drafts.length} active drafts and {generated.length} completed reports</span>
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/dashboard/proposal-builder')}
                className="group relative bg-gradient-to-r from-black to-gray-900 text-white px-6 py-3 rounded-xl hover:shadow-xl transition-all duration-300 flex items-center gap-2 font-semibold shadow-lg"
              >
                <FiPlus className="text-lg" />
                Create New Proposal
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.button>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl rounded-2xl" />
                  <div className="relative bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-gray-50 to-transparent rounded-full -translate-y-4 translate-x-4" />
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
                        <p className={`text-2xl md:text-3xl font-bold ${stat.textColor} mt-2`}>{stat.value}</p>
                      </div>
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-md`}>
                        <stat.icon className="text-xl text-white" />
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center text-sm text-gray-500">
                        <FiTrendingUp className="mr-2" />
                        <span>All time stats</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
              {/* Drafts Section */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-black flex items-center gap-2">
                    <FiEdit className="text-primary" />
                    Continue Working on Drafts
                  </h2>
                  {drafts.length > 5 && (
                    <button
                      onClick={() => navigate('/dashboard/proposals')}
                      className="text-sm font-medium text-primary hover:text-primary-dark flex items-center gap-1"
                    >
                      View all drafts
                      <FiChevronRight />
                    </button>
                  )}
                </div>
                
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="bg-white border border-gray-100 rounded-xl p-6 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                        <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : drafts.length > 0 ? (
                  <div className="space-y-4">
                    {drafts.slice(0, 5).map((proposal, index) => (
                      <motion.div
                        key={proposal._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ x: 4 }}
                        className="group relative bg-white border border-gray-100 p-5 md:p-6 rounded-xl shadow-sm hover:shadow-xl cursor-pointer transition-all duration-300 hover:border-primary/30 overflow-hidden"
                        onClick={() => navigate(`/dashboard/proposal-builder/${proposal._id}`)}
                      >
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary-light group-hover:w-2 transition-all duration-300" />
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center">
                                <FiEdit className="text-amber-600" />
                              </div>
                              <h3 className="font-semibold text-black text-lg truncate">{proposal.projectTitle}</h3>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <FiDollarSign className="text-emerald-500" />
                                ${proposal.fundingAmount?.toLocaleString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <FiClock className="text-gray-400" />
                                Updated {new Date(proposal.updatedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 rounded-full text-sm font-medium">
                              Draft
                            </span>
                            <div className="p-2 rounded-lg bg-gray-50 group-hover:bg-primary/10 transition-colors duration-300">
                              <FiChevronRight className="text-gray-400 group-hover:text-primary transition-colors duration-300" />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-br from-gray-50 to-white p-8 md:p-12 rounded-2xl border-2 border-dashed border-gray-200 text-center hover:border-primary/50 transition-all duration-300"
                  >
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-white flex items-center justify-center border-2 border-gray-200">
                      <FiFileText className="text-3xl text-gray-400" />
                    </div>
                    <p className="text-gray-600 mb-4 text-lg font-medium">No active drafts found</p>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">Start a new project to see your drafts appear here. Your journey to successful funding begins with a single step!</p>
                    <button
                      onClick={() => navigate('/dashboard/proposal-builder')}
                      className="bg-gradient-to-r from-black to-gray-800 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300 font-medium"
                    >
                      Start Your First Draft
                    </button>
                  </motion.div>
                )}
              </div>

              {/* Quick Actions Sidebar */}
              <div className="space-y-6">
                {/* My Proposals Card */}
                <motion.div
                  whileHover={{ y: -5 }}
                  className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-white to-primary/5 p-6 rounded-2xl shadow-sm border border-primary/20"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full -translate-y-16 translate-x-16" />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary-dark shadow-md">
                        <FiBarChart2 className="text-xl text-white" />
                      </div>
                      <h3 className="font-bold text-black text-xl">My Proposals</h3>
                    </div>
                    <p className="text-gray-700 mb-6 text-sm leading-relaxed">
                      Access, download, and manage your finalized AI-generated reports ready for submission to investors.
                    </p>
                    <button
                      onClick={() => navigate('/dashboard/proposals')}
                      className="w-full group relative bg-gradient-to-r from-black to-gray-900 text-white py-3 rounded-xl font-medium hover:shadow-xl transition-all duration-300 overflow-hidden"
                    >
                      <span className="relative z-10">View All Reports</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-dark transform translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                    </button>
                  </div>
                </motion.div>

                {/* Recent Activity Card */}
                <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-black text-xl flex items-center gap-2">
                      <FiActivity className="text-primary" />
                      Recent Activity
                    </h3>
                    <span className="text-xs font-medium px-3 py-1 bg-gray-100 rounded-full text-gray-700">
                      Latest
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    {proposals.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 3).map((p, index) => (
                      <motion.div
                        key={p._id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
                      >
                        <div className="relative mr-4">
                          <div className={`w-3 h-3 rounded-full ${p.status === 'generated' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          {index < 2 && (
                            <div className="absolute inset-0 animate-ping rounded-full bg-current opacity-30" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-black font-medium truncate">{p.projectTitle}</p>
                          <div className="flex items-center justify-between">
                            <p className="text-gray-500 text-xs">
                              {p.status === 'generated' ? 'Report Generated' : 'Draft Saved'}
                            </p>
                            <span className="text-xs text-gray-400">
                              {new Date(p.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                        <FiChevronRight className="ml-2 text-gray-300 group-hover:text-primary transition-colors" />
                      </motion.div>
                    ))}
                    
                    {proposals.length === 0 && (
                      <div className="text-center py-6">
                        <p className="text-gray-500">No recent activity</p>
                        <p className="text-gray-400 text-sm mt-1">Create your first proposal to see activity here</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Stats - Calculated from Real Data */}
                <div className="bg-gradient-to-br from-gray-900 to-black text-white p-6 rounded-2xl shadow-lg">
                  <h3 className="font-bold text-xl mb-4">Quick Stats</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Completion Rate</span>
                      <span className="font-bold">
                        {proposals.length > 0 ? Math.round((generated.length / proposals.length) * 100) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-primary to-primary-light h-2 rounded-full transition-all duration-500"
                        style={{ width: `${proposals.length > 0 ? (generated.length / proposals.length) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                      <span className="text-gray-300">Avg. Funding Request</span>
                      <span className="font-bold">
                        ${proposals.length > 0 ? Math.round(totalFunding / proposals.length).toLocaleString() : 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;