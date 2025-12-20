import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const location = useLocation();
  const links = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/dashboard/proposals', label: 'My Proposals' },
  ];

  return (
    <motion.aside initial={{ x: -100 }} animate={{ x: 0 }} className="w-64 bg-white border-r min-h-screen p-6">
      <div className="space-y-4">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`block px-4 py-2 rounded-md transition-colors ${
              location.pathname === link.path ? 'bg-gradient-primary font-medium' : 'hover:bg-gray-100'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </motion.aside>
  );
};

export default Sidebar;