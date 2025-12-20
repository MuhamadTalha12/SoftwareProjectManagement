import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { kickstartGetProposals } from '../utils/api';
import { AuthContext } from '../utils/context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

const Dashboard = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

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
    const updatedAt = p?.updatedAt || p?.updated_at || p?.createdAt || p?.created_at;
    const generatedProposal = p?.generatedProposal || p?.generated_proposal || p?.report || p?.content;
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
      const result = await kickstartGetProposals();
      const list = Array.isArray(result)
        ? result
        : Array.isArray(result?.proposals)
          ? result.proposals
          : Array.isArray(result?.data)
            ? result.data
            : [];

      const remote = list.map(normalizeProposal);

      // Also include locally saved drafts/generations for editability.
      const local = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith('draft_proposal_')) continue;
        try {
          const raw = localStorage.getItem(key);
          if (!raw) continue;
          const draft = JSON.parse(raw);
          const proposalId = key.replace('draft_proposal_', '');
          local.push(
            normalizeProposal({
              _id: proposalId,
              projectTitle: draft.projectTitle,
              fundingAmount: draft.fundingAmount,
              updatedAt: Date.now(),
              status: draft.status || 'draft',
              generatedProposal: draft.generatedProposal,
            }),
          );
        } catch {
          // ignore malformed local entries
        }
      }

      const mergedById = new Map();
      for (const p of [...local, ...remote]) {
        if (!p?._id) continue;
        mergedById.set(p._id, p);
      }
      setProposals(Array.from(mergedById.values()));
    } catch (error) {
      console.error('Failed to fetch proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  // Stats calculation
  const drafts = proposals.filter((p) => p.status === 'draft');
  const generated = proposals.filter((p) => p.status === 'generated');
  const totalFunding = proposals.reduce((sum, p) => sum + (p.fundingAmount || 0), 0);

  const stats = [
    { label: 'Total Proposals', value: proposals.length },
    { label: 'Drafts', value: drafts.length },
    { label: 'Generated Reports', value: generated.length },
    { label: 'Funding Requested', value: `$${totalFunding.toLocaleString()}` },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-black">
                Welcome back, {user?.name}!
              </h1>
              <button
                onClick={() => navigate('/dashboard/proposal-builder')}
                className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors shadow-md"
              >
                + Create New Proposal
              </button>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -5 }}
                  className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm"
                >
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-bold text-black mt-2">{stat.value}</p>
                </motion.div>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Drafts Section */}
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold text-black mb-4">Continue Working on Drafts</h2>
                {loading ? (
                  <div className="text-gray-500">Loading proposals...</div>
                ) : drafts.length > 0 ? (
                  <div className="space-y-4">
                    {drafts.slice(0, 5).map((proposal) => (
                      <motion.div
                        key={proposal._id}
                        whileHover={{ scale: 1.01 }}
                        className="bg-white border border-gray-200 p-5 rounded-lg shadow-sm cursor-pointer hover:border-primary transition-all flex justify-between items-center"
                        onClick={() => navigate(`/dashboard/proposal-builder/${proposal._id}`)}
                      >
                        <div>
                          <h3 className="font-semibold text-black text-lg">{proposal.projectTitle}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Requested: ${proposal.fundingAmount?.toLocaleString()} • Last updated: {new Date(proposal.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="text-primary font-medium text-sm">Resume →</span>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 p-8 rounded-lg border border-dashed border-gray-300 text-center">
                    <p className="text-gray-600">No active drafts found. Start a new project to see it here!</p>
                  </div>
                )}
              </div>

              {/* Quick Actions / Recent Activity Sidebar */}
              <div className="space-y-6">
                <div className="bg-gradient-primary p-6 rounded-xl shadow-sm">
                  <h3 className="font-bold text-black mb-2">My Proposals</h3>
                  <p className="text-sm text-black mb-4">Access and download your finalized, AI-generated reports ready for submission.</p>
                  <button
                    onClick={() => navigate('/dashboard/proposals')}
                    className="w-full bg-white text-black py-2 rounded-md font-medium hover:bg-opacity-90 transition-all shadow-sm"
                  >
                    View All Reports
                  </button>
                </div>

                <div className="border border-gray-200 p-6 rounded-xl">
                  <h3 className="font-bold text-black mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    {proposals.slice(0, 3).map((p) => (
                      <div key={p._id} className="flex items-start space-x-3 text-sm">
                        <div className={`w-2 h-2 mt-1.5 rounded-full ${p.status === 'generated' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                        <div>
                          <p className="text-black font-medium">{p.projectTitle}</p>
                          <p className="text-gray-500 text-xs">{p.status === 'generated' ? 'Report Generated' : 'Draft Saved'}</p>
                        </div>
                      </div>
                    ))}
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