import { useState, useEffect } from 'react';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import jsPDF from 'jspdf';
import ProposalPreview from '../components/ProposalPreview';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiFileText, 
  FiDownload, 
  FiEye, 
  FiEdit2, 
  FiFilter,
  FiSearch,
  FiX,
  FiCheck,
  FiDollarSign,
  FiCalendar,
  FiChevronRight,
  FiRefreshCw,
  FiExternalLink,
  FiMessageSquare
} from 'react-icons/fi';

const MyProposals = () => {
  const [proposals, setProposals] = useState([]);
  const [filteredProposals, setFilteredProposals] = useState([]);
  const [viewingProposal, setViewingProposal] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgency, setSelectedAgency] = useState('all');
  
  // New State for Editing
  const [editingProposal, setEditingProposal] = useState(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    fetchProposals();
  }, []);

  useEffect(() => {
    filterProposals();
  }, [proposals, searchTerm, selectedAgency]);

  const fetchProposals = async () => {
    try {
      const { data } = await api.get('/proposals');
      const generatedProposals = data.filter(p => p.status === 'generated');
      setProposals(generatedProposals);
    } catch (err) {
      console.error("Error fetching proposals", err);
    }
  };

  const filterProposals = () => {
    let filtered = proposals;
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.generatedProposal && p.generatedProposal.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Agency filter
    if (selectedAgency !== 'all') {
      filtered = filtered.filter(p => p.fundingAgency === selectedAgency);
    }
    
    setFilteredProposals(filtered);
  };

  const getAgencies = () => {
    const agencies = new Set(proposals.map(p => p.fundingAgency || 'Unspecified'));
    return ['all', ...Array.from(agencies)].filter(Boolean);
  };

  const download = (p) => {
    const doc = new jsPDF();
    const splitText = doc.splitTextToSize(p.generatedProposal, 180);
    doc.text(splitText, 10, 20);
    doc.save(`${p.projectTitle}.pdf`);
  };

  const handleAiEdit = async () => {
    if (!editPrompt.trim()) return;
    
    setIsRegenerating(true);
    try {
      const { data } = await api.post(`/proposals/${editingProposal._id}/edit`, {
        userPrompt: editPrompt
      });

      setProposals(prev => prev.map(p => 
        p._id === editingProposal._id 
          ? { ...p, generatedProposal: data.generatedProposal } 
          : p
      ));
      
      // Show success notification
      alert('Proposal updated successfully!');
      setEditingProposal(null);
      setEditPrompt('');
    } catch (error) {
      console.error("Failed to edit proposal", error);
      alert('Failed to update proposal. Please try again.');
    } finally {
      setIsRegenerating(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

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
                  My Reports
                </h1>
                <p className="text-gray-600 mt-2 flex items-center gap-2">
                  <FiFileText className="text-primary" />
                  <span>{proposals.length} AI-generated reports ready for submission</span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchProposals}
                  className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                  title="Refresh"
                >
                  <FiRefreshCw className="text-gray-600" />
                </button>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      <FiX className="text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2">
                <FiFilter className="text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filter by:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <select
                  value={selectedAgency}
                  onChange={(e) => setSelectedAgency(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {getAgencies().map(agency => (
                    <option key={agency} value={agency}>
                      {agency === 'all' ? 'All Agencies' : agency}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiCheck className="text-emerald-500" />
                  <span>Showing {filteredProposals.length} of {proposals.length} reports</span>
                </div>
              </div>
            </div>

            {/* Proposals Grid */}
            {filteredProposals.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-white to-gray-50 p-12 rounded-2xl border-2 border-dashed border-gray-200 text-center"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-white flex items-center justify-center border-2 border-gray-200">
                  <FiFileText className="text-4xl text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-3">No reports found</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  {proposals.length === 0 
                    ? "You haven't generated any reports yet. Create your first proposal to see it here!"
                    : "No reports match your current filters. Try adjusting your search criteria."}
                </p>
                {proposals.length === 0 && (
                  <button
                    onClick={() => window.location.href = '/dashboard/proposal-builder'}
                    className="bg-gradient-to-r from-black to-gray-800 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300 font-medium inline-flex items-center gap-2"
                  >
                    <FiEdit2 /> Create First Proposal
                  </button>
                )}
              </motion.div>
            ) : (
              <div className="grid gap-6">
                {filteredProposals.map((p, index) => (
                  <motion.div
                    key={p._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -4 }}
                    className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary-light group-hover:w-2 transition-all duration-300" />
                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Proposal Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center flex-shrink-0">
                              <FiFileText className="text-2xl text-emerald-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xl font-bold text-gray-900 truncate mb-1">{p.projectTitle}</h3>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <FiDollarSign className="text-emerald-500" />
                                  ${p.fundingAmount?.toLocaleString() || '0'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <FiCalendar className="text-blue-500" />
                                  {formatDate(p.updatedAt || p.createdAt)}
                                </span>
                                {p.fundingAgency && (
                                  <span className="px-3 py-1 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                    {p.fundingAgency}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Preview Snippet */}
                          {p.generatedProposal && (
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {p.generatedProposal.substring(0, 200)}...
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          {/* View Button */}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setViewingProposal(p)}
                            className="group/view relative p-3 rounded-lg bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:border-primary transition-all duration-200"
                            title="View Report"
                          >
                            <FiEye className="text-gray-600 group-hover/view:text-primary" />
                          </motion.button>

                          {/* Edit Button */}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setEditingProposal(p)}
                            className="group/edit relative p-3 rounded-lg bg-gradient-to-br from-black to-gray-800 hover:shadow-lg transition-all duration-200"
                            title="Edit with AI"
                          >
                            <FiEdit2 className="text-white" />
                          </motion.button>

                          {/* Download Button */}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => download(p)}
                            className="group/download relative px-4 py-3 rounded-lg bg-gradient-to-r from-primary to-primary-light text-black font-medium hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                          >
                            <FiDownload />
                            Download
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Stats Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 p-6 bg-gradient-to-br from-gray-900 to-black rounded-2xl text-white"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">{proposals.length}</div>
                  <div className="text-gray-300 text-sm">Total Reports</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">
                    ${proposals.reduce((sum, p) => sum + (p.fundingAmount || 0), 0).toLocaleString()}
                  </div>
                  <div className="text-gray-300 text-sm">Total Funding Requested</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">
                    {getAgencies().length - 1}
                  </div>
                  <div className="text-gray-300 text-sm">Different Agencies</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </main>
      </div>
      <Footer />

      {/* VIEW MODAL */}
      {viewingProposal && (
        <ProposalPreview
          proposal={viewingProposal.generatedProposal}
          onClose={() => setViewingProposal(null)}
          onSave={() => setViewingProposal(null)}
        />
      )}

      {/* EDIT MODAL */}
      <AnimatePresence>
        {editingProposal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-primary/10 to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-black to-gray-800">
                      <FiMessageSquare className="text-xl text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Edit with AI Assistant</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        Refine: <span className="font-semibold text-primary">{editingProposal.projectTitle}</span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setEditingProposal(null);
                      setEditPrompt('');
                    }}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <FiX className="text-xl" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <span className="flex items-center gap-2">
                      <FiEdit2 /> Instructions for AI
                    </span>
                  </label>
                  <textarea
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-primary focus:border-transparent min-h-[150px] bg-gray-50/50 resize-none"
                    placeholder="Describe what changes you'd like to make...
                    
Examples:
• Make the executive summary more concise
• Emphasize the commercialization strategy
• Add more technical details about the methodology
• Strengthen the budget justification
• Improve the readability for non-technical reviewers"
                    disabled={isRegenerating}
                    rows={6}
                  />
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-gray-500">
                      The AI will rewrite the entire proposal based on your instructions
                    </p>
                    <span className="text-xs text-gray-400">
                      {editPrompt.length}/1000 characters
                    </span>
                  </div>
                </div>

                {/* Quick Suggestions */}
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-3">Quick suggestions:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Make more concise',
                      'Add technical details',
                      'Strengthen impact statement',
                      'Improve readability'
                    ].map((suggestion, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setEditPrompt(suggestion)}
                        className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-100 bg-gray-50">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>AI-powered editing • Regenerates entire proposal</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setEditingProposal(null);
                        setEditPrompt('');
                      }}
                      className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                      disabled={isRegenerating}
                    >
                      Cancel
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAiEdit}
                      disabled={!editPrompt.trim() || isRegenerating}
                      className="relative px-6 py-2.5 bg-gradient-to-r from-black to-gray-800 text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        {isRegenerating ? (
                          <>
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Updating...
                          </>
                        ) : (
                          <>
                            <FiEdit2 /> Generate Update
                          </>
                        )}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-dark transform translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyProposals;