import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import html2pdf from 'html2pdf.js';

const ProposalPreview = ({ proposal, onClose, onSave }) => {
  const contentRef = useRef(null);

  const handleDownloadPDF = () => {
    const element = contentRef.current;
    
    // Configuration for the PDF
    const opt = {
      margin:       [0.5, 0.5],
      filename:     'funding-proposal.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    // Generate PDF from the rendered HTML element
    html2pdf().set(opt).from(element).save();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-black">Generated Proposal</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
          
          {/* Main Content Area */}
          <div className="p-8 overflow-y-auto flex-1 bg-white">
            <div 
              ref={contentRef} 
              className="prose prose-sm sm:prose lg:prose-lg max-w-none text-black font-serif"
            >
              {/* This component renders the Markdown formatting */}
              <ReactMarkdown>
                {proposal}
              </ReactMarkdown>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-black hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-primary hover:bg-[#9AE6E1] text-black rounded-md transition-colors shadow-sm"
            >
              Download PDF
            </button>
            <button
              onClick={onSave}
              className="px-4 py-2 bg-gradient-primary text-black rounded-md hover:opacity-90 transition-opacity shadow-sm"
            >
              Save to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProposalPreview;