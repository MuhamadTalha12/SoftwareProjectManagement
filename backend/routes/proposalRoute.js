const express = require('express');
const router = express.Router();
const {
  createProposal,
  getProposals,
  getProposal,
  updateProposal,
  deleteProposal,
} = require('../controllers/proposalController');
const { generateProposal, editProposal } = require('../controllers/geminiController');

router.post('/', createProposal);
router.get('/:userid', getProposals);
router.get('/:userid/:id', getProposal);
router.put('/:id', updateProposal);
router.delete('/:userid/:id', deleteProposal);
router.post('/:id/generate', generateProposal);
router.post('/:id/edit', editProposal);

module.exports = router;