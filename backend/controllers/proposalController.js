const Proposal = require('../models/Proposal');

exports.createProposal = async (req, res) => {
  try {
    const { userid, ...proposalData } = req.body;
    const proposal = await Proposal.create({
      ...proposalData,
      user: userid,
    });
    res.status(201).json(proposal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProposals = async (req, res) => {
  try {
    const { userid } = req.params;
    const proposals = await Proposal.find({ user: userid })
      .sort({ createdAt: -1 });
    res.json(proposals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProposal = async (req, res) => {
  try {
    const { userid, id } = req.params;
    const proposal = await Proposal.findOne({
      _id: id,
      user: userid,
    });
    
    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }
    
    res.json(proposal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProposal = async (req, res) => {
  try {
    const { userid, ...updateData } = req.body;
    const proposal = await Proposal.findOneAndUpdate(
      { _id: req.params.id, user: userid },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }
    
    res.json(proposal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProposal = async (req, res) => {
  try {
    const { userid, id } = req.params;
    const proposal = await Proposal.findOneAndDelete({
      _id: id,
      user: userid,
    });
    
    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }
    
    res.json({ message: 'Proposal deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};