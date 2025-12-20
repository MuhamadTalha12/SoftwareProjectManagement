import { useState, useEffect } from 'react';
import { kickstartEditProposalAi, kickstartGetProposals, kickstartGetProposal } from '../utils/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import jsPDF from 'jspdf';
import ProposalPreview from '../components/ProposalPreview';
import { motion, AnimatePresence } from 'framer-motion'; // Ensure framer-motion is imported

const MyProposals = () => {
  const [proposals, setProposals] = useState([]);
  const [viewingProposal, setViewingProposal] = useState(null);
  
  // New State for Editing
  const [editingProposal, setEditingProposal] = useState(null); // The proposal object being edited
  const [editPrompt, setEditPrompt] = useState(''); // The user's instructions
  const [isRegenerating, setIsRegenerating] = useState(false); // Loading state

  useEffect(() => {
    fetchProposals();
  }, []);

  const normalizeProposal = (p) => {
    const id = p?._id || p?.id || p?.proposal_id;
    const projectTitle = p?.projectTitle || p?.title || 'Untitled Proposal';
    const fundingAmount =
      typeof p?.fundingAmount === 'number'
        ? p.fundingAmount
        : Number(p?.fundingAmount) || 0;
    const generatedProposal = p?.generatedProposal || p?.generated_proposal || p?.report || p?.content;
    const status = p?.status || (generatedProposal ? 'generated' : 'draft');
    return {
      ...p,
      _id: id,
      projectTitle,
      fundingAmount,
      generatedProposal,
      status,
    };
  };

  const fetchProposals = async () => {
    try {
      const result = await kickstartGetProposals();
      const list = Array.isArray(result)
        ? result
        : Array.isArray(result?.proposals)
          ? result.proposals
          : Array.isArray(result?.data)
            ? result.data
            : [];
      const normalized = list.map(normalizeProposal);
      setProposals(
        normalized.filter(
          (p) => (p.status && String(p.status).toLowerCase() === 'generated') || (p.generatedProposal || '').trim().length > 0,
        ),
      );
    } catch (err) {
      console.error("Error fetching proposals", err);
    }
  };

  const handleView = async (proposal) => {
    try {
      // If list payload already contains the report, show immediately.
      if ((proposal?.generatedProposal || '').trim().length > 0) {
        setViewingProposal(proposal);
        return;
      }

      // Otherwise fetch the full proposal first.
      const result = await kickstartGetProposal({ proposal_id: proposal._id });
      const full = normalizeProposal(result?.proposal || result);
      setViewingProposal({ ...proposal, ...full });
    } catch (e) {
      console.error('Failed to load proposal', e);
      alert('Failed to load proposal. Please try again.');
    }
  };

  const download = async (p) => {
    try {
      let content = (p?.generatedProposal || '').trim();
      if (!content) {
        const result = await kickstartGetProposal({ proposal_id: p._id });
        const full = normalizeProposal(result?.proposal || result);
        content = (full?.generatedProposal || '').trim();
      }

      if (!content) {
        alert('No generated proposal content found to download.');
        return;
      }

      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const marginX = 40;
      const marginY = 50;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const usableWidth = pageWidth - marginX * 2;
      const lineHeight = 14;

      doc.setFont('Times', 'Normal');
      doc.setFontSize(11);

      // Title
      doc.setFontSize(14);
      doc.text(p.projectTitle || 'Proposal', marginX, marginY);
      doc.setFontSize(11);

      let cursorY = marginY + 22;
      const lines = doc.splitTextToSize(content, usableWidth);

      for (const line of lines) {
        if (cursorY + lineHeight > pageHeight - marginY) {
          doc.addPage();
          cursorY = marginY;
        }
        doc.text(line, marginX, cursorY);
        cursorY += lineHeight;
      }

      const safeName = String(p.projectTitle || 'proposal')
        .replace(/[\\/:*?"<>|]/g, '-')
        .slice(0, 120);
      doc.save(`${safeName}.pdf`);
    } catch (e) {
      console.error('Failed to download proposal', e);
      alert('Failed to download proposal. Please try again.');
    }
  };

  // Handler for submitting the edit
  const handleAiEdit = async () => {
    if (!editPrompt.trim()) return;
    
    setIsRegenerating(true);
    try {
      const current = await kickstartGetProposal({ proposal_id: editingProposal._id });
      const currentProposal = normalizeProposal(current?.proposal || current);
      const currentContent = currentProposal?.generatedProposal || '';

      const result = await kickstartEditProposalAi({
        proposal_id: editingProposal._id,
        edit_instructions: editPrompt,
        section: 'technical_specs',
        content: currentContent,
      });

      const updatedContent =
        result?.generatedProposal ||
        result?.generated_proposal ||
        result?.content ||
        result?.report ||
        (typeof result === 'string' ? result : null);

      if (updatedContent) {
        setProposals((prev) =>
          prev.map((p) => (p._id === editingProposal._id ? { ...p, generatedProposal: updatedContent } : p)),
        );
      } else {
        // Fallback: refetch the proposal in case the server stored the update
        await fetchProposals();
      }
      
      alert('Proposal updated successfully!');
      setEditingProposal(null); // Close modal
      setEditPrompt('');
    } catch (error) {
      console.error("Failed to edit proposal", error);
      alert('Failed to update proposal. Please try again.');
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold mb-6">My Reports</h1>
          <div className="space-y-4">
            {proposals.map(p => (
              <div key={p._id} className="border p-4 rounded-lg flex flex-col md:flex-row justify-between items-center shadow-sm gap-4">
                <div>
                  <h3 className="font-bold text-lg">{p.projectTitle}</h3>
                  <p className="text-sm text-gray-500">
                    Amount: ${p.fundingAmount?.toLocaleString()} | Agency: {p.fundingAgency || 'N/A'}
                  </p>
                </div>
                <div className="flex space-x-2">
                   {/* VIEW BUTTON */}
                   <button 
                    onClick={() => handleView(p)} 
                    className="bg-gray-100 border border-gray-300 text-black px-3 py-2 rounded text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    View
                  </button>

                  {/* EDIT BUTTON */}
                  <button 
                    onClick={() => setEditingProposal(p)} 
                    className="bg-black text-white px-3 py-2 rounded text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    Edit with AI
                  </button>

                  {/* DOWNLOAD BUTTON */}
                  <button 
                    onClick={() => download(p)} 
                    className="bg-primary hover:bg-[#9AE6E1] text-black px-3 py-2 rounded text-sm font-medium transition-colors"
                  >
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
      <Footer />

      {/* VIEW MODAL */}
      {viewingProposal && (
        <ProposalPreview
          proposal={viewingProposal.generatedProposal || ''}
          onClose={() => setViewingProposal(null)}
          onSave={() => setViewingProposal(null)}
        />
      )}

      {/* EDIT MODAL */}
      <AnimatePresence>
        {editingProposal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6"
            >
              <h2 className="text-xl font-bold mb-4">Edit Proposal with AI</h2>
              <p className="text-sm text-gray-600 mb-4">
                Tell the AI how you want to change "<strong>{editingProposal.projectTitle}</strong>".
              </p>
              
              <textarea
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent min-h-[120px]"
                placeholder="e.g., Make the executive summary more concise, or emphasize the commercialization strategy more..."
                disabled={isRegenerating}
              />

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setEditingProposal(null);
                    setEditPrompt('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={isRegenerating}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAiEdit}
                  disabled={!editPrompt.trim() || isRegenerating}
                  className="px-4 py-2 bg-gradient-primary text-black rounded-md font-medium hover:opacity-90 disabled:opacity-50 flex items-center"
                >
                  {isRegenerating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </>
                  ) : 'Update Proposal'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyProposals;