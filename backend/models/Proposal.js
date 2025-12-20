const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  projectTitle: {
    type: String,
    required: true,
  },
  fundingAgency: {
    type: String,
    default: '',
  },
  fundingAmount: {
    type: Number,
    required: true,
  },
  coverLetter: {
    type: String,
    default: '',
  },
  executiveSummary: {
    type: String,
    default: '',
  },
  introductionAndBackground: {
    type: String,
    default: '',
  },
  statementOfNeed: {
    type: String,
    default: '',
  },
  goalsObjectivesAndSpecificAims: {
    type: String,
    default: '',
  },
  commercializationStrategy: {
    type: String,
    default: '',
  },
  budgetAndJustification: {
    type: String,
    default: '',
  },
  timelineAndMilestone: {
    type: String,
    default: '',
  },
  evaluationAndImpactPlans: {
    type: String,
    default: '',
  },
  sustainabilityPlans: {
    type: String,
    default: '',
  },
  appendicesAndSupportingMaterials: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'generated'],
    default: 'draft',
  },
  generatedProposal: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

// Check if model already exists to prevent recompilation during hot-reload
module.exports = mongoose.models.Proposal || mongoose.model('Proposal', proposalSchema);