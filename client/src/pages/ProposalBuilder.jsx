import { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  kickstartCreateProposal,
  kickstartGenerateProposalAi,
  kickstartGenerateProposalFromText,
  kickstartGetProposal,
  kickstartUpdateProposal,
} from '../utils/api';
import { AuthContext } from '../utils/context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import ProposalPreview from '../components/ProposalPreview';

const ProposalBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [currentStep, setCurrentStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [generatedProposal, setGeneratedProposal] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    projectTitle: '',
    fundingAgency: '',
    fundingAmount: '',
    coverLetter: '',
    executiveSummary: '',
    introductionAndBackground: '',
    statementOfNeed: '',
    goalsObjectivesAndSpecificAims: '',
    commercializationStrategy: '',
    budgetAndJustification: '',
    timelineAndMilestone: '',
    evaluationAndImpactPlans: '',
    sustainabilityPlans: '',
    appendicesAndSupportingMaterials: '',
  });

  useEffect(() => {
    if (id) {
      fetchProposal();
    }
  }, [id]);

  const getDraftStorageKey = (proposalId) => `draft_proposal_${proposalId}`;

  const safeJsonParse = (value, fallback) => {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  };

  const normalizeProposal = (p) => {
    const proposal = p?.proposal || p;
    return {
      _id: proposal?._id || proposal?.id || proposal?.proposal_id,
      projectTitle: proposal?.projectTitle || proposal?.title || '',
      description: proposal?.description || '',
      fundingAmount:
        typeof proposal?.fundingAmount === 'number'
          ? proposal.fundingAmount
          : Number(proposal?.fundingAmount) || 0,
      timeline: proposal?.timeline || '',
      category: proposal?.category || '',
      generatedProposal:
        proposal?.generatedProposal || proposal?.generated_proposal || proposal?.report || proposal?.content || '',
      status: proposal?.status || (proposal?.generatedProposal ? 'generated' : 'draft'),
    };
  };

  const fetchProposal = async () => {
    try {
      const result = await kickstartGetProposal({ proposal_id: id });
      const data = normalizeProposal(result);

      const localDraft = safeJsonParse(localStorage.getItem(getDraftStorageKey(id)) || '', null);

      setFormData({
        ...(localDraft || {}),
        projectTitle: (localDraft?.projectTitle ?? data.projectTitle) || '',
        fundingAmount: String(localDraft?.fundingAmount ?? data.fundingAmount ?? ''),
      });
    } catch (error) {
      console.error('Failed to fetch proposal:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const saveDraft = async () => {
    try {
      const fundingAmount = parseFloat(formData.fundingAmount) || 0;

      // Store full draft locally so it's always editable even if the remote schema is smaller.
      const localPayload = { ...formData, fundingAmount, status: 'draft' };

      // Remote schema supports the full form (as returned by kickstart_get_proposals).
      const remotePayload = {
        ...formData,
        fundingAmount,
        status: 'draft',
        generatedProposal: '',
      };

      if (id) {
        await kickstartUpdateProposal({ proposal_id: id, ...remotePayload });
        localStorage.setItem(getDraftStorageKey(id), JSON.stringify(localPayload));
      } else {
        const created = await kickstartCreateProposal(remotePayload);
        const createdId = created?._id || created?.id || created?.proposal_id || created?.proposal?.id || created?.proposal?._id;

        if (!createdId) {
          throw new Error('Proposal created but no id was returned by the API');
        }

        localStorage.setItem(getDraftStorageKey(createdId), JSON.stringify(localPayload));
        // Move user onto the editable URL for subsequent updates.
        navigate(`/dashboard/proposal-builder/${createdId}`);
      }

      alert('Draft saved successfully!');
    } catch (error) {
      alert('Failed to save draft');
      console.error(error);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const fundingAmount = parseFloat(formData.fundingAmount) || 0;

      const remotePayload = {
        ...formData,
        fundingAmount,
        status: 'submitted',
      };

      let proposalId = id;
      if (!proposalId) {
        const created = await kickstartCreateProposal(remotePayload);
        proposalId = created?._id || created?.id || created?.proposal_id || created?.proposal?.id || created?.proposal?._id;
        if (!proposalId) {
          throw new Error('Proposal created but no id was returned by the API');
        }
        // Persist detailed form locally for editability.
        localStorage.setItem(
          getDraftStorageKey(proposalId),
          JSON.stringify({ ...formData, fundingAmount, status: 'submitted' }),
        );
      } else {
        await kickstartUpdateProposal({ proposal_id: proposalId, ...remotePayload });
        localStorage.setItem(
          getDraftStorageKey(proposalId),
          JSON.stringify({ ...formData, fundingAmount, status: 'submitted' }),
        );
      }

      const prompt = `Generate a comprehensive funding proposal using the following details.\n\n` +
        `Project Title: ${formData.projectTitle}\n` +
        `Funding Agency: ${formData.fundingAgency}\n` +
        `Funding Amount: $${fundingAmount}\n\n` +
        `Cover Letter:\n${formData.coverLetter}\n\n` +
        `Executive Summary:\n${formData.executiveSummary}\n\n` +
        `Introduction and Background:\n${formData.introductionAndBackground}\n\n` +
        `Statement of Need:\n${formData.statementOfNeed}\n\n` +
        `Goals, Objectives and Specific Aims:\n${formData.goalsObjectivesAndSpecificAims}\n\n` +
        `Commercialization Strategy:\n${formData.commercializationStrategy}\n\n` +
        `Budget and Justification:\n${formData.budgetAndJustification}\n\n` +
        `Timeline and Milestones:\n${formData.timelineAndMilestone}\n\n` +
        `Evaluation and Impact Plans:\n${formData.evaluationAndImpactPlans}\n\n` +
        `Sustainability Plans:\n${formData.sustainabilityPlans}\n\n` +
        `Appendices and Supporting Materials:\n${formData.appendicesAndSupportingMaterials}\n`;

      // Prefer proposal_id based generation. Fallback to text-based generation if needed.
      let generated = '';
      try {
        const result = await kickstartGenerateProposalAi({
          proposal_id: proposalId,
          prompt,
          sections: [
            'executive_summary',
            'market_analysis',
            'technical_specs',
            'financial_projections',
            'risk_assessment',
          ],
        });
        generated =
          result?.generatedProposal ||
          result?.generated_proposal ||
          result?.content ||
          result?.report ||
          (typeof result === 'string' ? result : '');
      } catch (e) {
        const fallback = await kickstartGenerateProposalFromText({ report_text: prompt });
        generated =
          fallback?.generatedProposal ||
          fallback?.generated_proposal ||
          fallback?.content ||
          fallback?.report ||
          (typeof fallback === 'string' ? fallback : '');
      }

      setGeneratedProposal(generated);
      setShowPreview(true);

      // Mark local draft as generated so Dashboard can reflect it quickly.
      localStorage.setItem(
        getDraftStorageKey(proposalId),
        JSON.stringify({ ...formData, fundingAmount, status: 'generated', generatedProposal: generated }),
      );

      // Persist the generated report remotely so MyProposals can list it.
      await kickstartUpdateProposal({
        proposal_id: proposalId,
        ...remotePayload,
        status: 'generated',
        generatedProposal: generated,
      });
    } catch (error) {
      alert('Failed to generate proposal');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreview = async () => {
    setShowPreview(false);
    navigate('/dashboard');
  };

  const steps = [
    { number: 1, title: 'Cover Letter' },
    { number: 2, title: 'Executive Summary' },
    { number: 3, title: 'Introduction' },
    { number: 4, title: 'Statement of Need' },
    { number: 5, title: 'Goals & Objectives' },
    { number: 6, title: 'Commercialization' },
    { number: 7, title: 'Budget' },
    { number: 8, title: 'Timeline' },
    { number: 9, title: 'Evaluation' },
    { number: 10, title: 'Sustainability' },
    { number: 11, title: 'Appendices' },
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-black font-medium mb-2">Project Title *</label>
              <input
                type="text"
                name="projectTitle"
                value={formData.projectTitle}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-black font-medium mb-2">Target Funding Agency</label>
              <input
                type="text"
                name="fundingAgency"
                value={formData.fundingAgency}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g. National Science Foundation, NIH, etc."
              />
            </div>
            <div>
              <label className="block text-black font-medium mb-2">Funding Amount ($) *</label>
              <input
                type="number"
                name="fundingAmount"
                value={formData.fundingAmount}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-black font-medium mb-2">Cover Letter *</label>
              <textarea
                name="coverLetter"
                value={formData.coverLetter}
                onChange={handleInputChange}
                rows={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Write a compelling cover letter introducing your research proposal..."
                required
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-black font-medium mb-2">Executive Summary *</label>
              <textarea
                name="executiveSummary"
                value={formData.executiveSummary}
                onChange={handleInputChange}
                rows={10}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Provide a concise summary of your proposal, including key objectives, methodology, and expected outcomes..."
                required
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-black font-medium mb-2">Introduction and Background *</label>
              <textarea
                name="introductionAndBackground"
                value={formData.introductionAndBackground}
                onChange={handleInputChange}
                rows={10}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Describe the background context, existing research, and rationale for your proposed work..."
                required
              />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-black font-medium mb-2">Statement of Need *</label>
              <textarea
                name="statementOfNeed"
                value={formData.statementOfNeed}
                onChange={handleInputChange}
                rows={10}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Explain the problem or gap that your research addresses and why it's important..."
                required
              />
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-black font-medium mb-2">Goals, Objectives and Specific Aims *</label>
              <textarea
                name="goalsObjectivesAndSpecificAims"
                value={formData.goalsObjectivesAndSpecificAims}
                onChange={handleInputChange}
                rows={10}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Clearly outline your research goals, objectives, and specific aims..."
                required
              />
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-black font-medium mb-2">Commercialization Strategy</label>
              <textarea
                name="commercializationStrategy"
                value={formData.commercializationStrategy}
                onChange={handleInputChange}
                rows={10}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Describe how your research findings will be commercialized or transferred to market..."
              />
            </div>
          </div>
        );
      case 7:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-black font-medium mb-2">Budget and Justification *</label>
              <textarea
                name="budgetAndJustification"
                value={formData.budgetAndJustification}
                onChange={handleInputChange}
                rows={10}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Provide detailed budget breakdown and justification for each expense..."
                required
              />
            </div>
          </div>
        );
      case 8:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-black font-medium mb-2">Timeline and Milestones *</label>
              <textarea
                name="timelineAndMilestone"
                value={formData.timelineAndMilestone}
                onChange={handleInputChange}
                rows={10}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Outline your project timeline with specific milestones and deliverables..."
                required
              />
            </div>
          </div>
        );
      case 9:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-black font-medium mb-2">Evaluation and Impact Plans *</label>
              <textarea
                name="evaluationAndImpactPlans"
                value={formData.evaluationAndImpactPlans}
                onChange={handleInputChange}
                rows={10}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Describe how you will evaluate the success of your research and measure its impact..."
                required
              />
            </div>
          </div>
        );
      case 10:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-black font-medium mb-2">Sustainability Plans</label>
              <textarea
                name="sustainabilityPlans"
                value={formData.sustainabilityPlans}
                onChange={handleInputChange}
                rows={10}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Explain how your research project will be sustained beyond the funding period..."
              />
            </div>
          </div>
        );
      case 11:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-black font-medium mb-2">Appendices and Supporting Materials</label>
              <textarea
                name="appendicesAndSupportingMaterials"
                value={formData.appendicesAndSupportingMaterials}
                onChange={handleInputChange}
                rows={10}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="List any appendices, references, CVs, letters of support, or other supporting materials..."
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold text-black mb-6">Proposal Builder</h1>
            
            <div className="mb-8 bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between overflow-x-auto pb-2">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center flex-shrink-0">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full ${
                        currentStep >= step.number
                          ? 'bg-gradient-primary text-black'
                          : 'bg-gray-200 text-gray-600'
                      } font-semibold text-sm`}
                      title={step.title}
                    >
                      {step.number}
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`w-8 h-1 mx-1 ${
                          currentStep > step.number ? 'bg-primary' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-2 text-center">
                <p className="text-sm font-medium text-black">{steps[currentStep - 1]?.title}</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-6 min-h-[500px]">
              {renderStepContent()}
            </div>

            <div className="flex justify-between">
              <button
                onClick={saveDraft}
                className="px-6 py-2 border border-gray-300 rounded-md text-black hover:bg-gray-50 transition-colors"
              >
                Save Draft
              </button>
              <div className="space-x-4">
                {currentStep > 1 && (
                  <button
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="px-6 py-2 border border-gray-300 rounded-md text-black hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </button>
                )}
                {currentStep < steps.length ? (
                  <button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="px-6 py-2 bg-gradient-primary text-black rounded-md hover:opacity-90 transition-opacity"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Generating...' : 'Generate Proposal'}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </main>
      </div>
      <Footer />
      
      {showPreview && (
        <ProposalPreview
          proposal={generatedProposal}
          onClose={() => setShowPreview(false)}
          onSave={handleSavePreview}
        />
      )}
    </div>
  );
};

export default ProposalBuilder;