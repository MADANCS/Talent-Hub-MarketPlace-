import { Link } from 'react-router-dom';
import { FaTwitter, FaLinkedin, FaGithub, FaDiscord } from 'react-icons/fa';
import { HiOutlineHeart } from 'react-icons/hi';

const Footer = () => {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="text-xl font-bold text-blue-600 flex items-center gap-2 mb-6">
              <span className="bg-blue-600 text-white w-8 h-8 rounded flex items-center justify-center italic">J</span>
              JobSleuths
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Full-stack MERN talent marketplace — AI job matching, Socket.IO messaging, live Agora
              interviews, and Razorpay payments. Portfolio showcase for recruiters.
            </p>
            <div className="flex gap-4">
               {[FaTwitter, FaLinkedin, FaGithub, FaDiscord].map((Icon, i) => (
                 <a key={i} href="#" className="text-slate-400 hover:text-blue-600 transition-colors">
                   <Icon size={20} />
                 </a>
               ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-6">Marketplace</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><Link to="/jobs" className="hover:text-blue-600 transition-colors">Browse Jobs</Link></li>
              <li><Link to="/market-intelligence" className="hover:text-blue-600 transition-colors">Market Data</Link></li>
              <li><Link to="/pricing" className="hover:text-blue-600 transition-colors">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><Link to="/about" className="hover:text-blue-600 transition-colors">Portfolio &amp; Resume Bullets</Link></li>
              <li><Link to="/careers" className="hover:text-blue-600 transition-colors">Careers</Link></li>
              <li><Link to="/contact" className="hover:text-blue-600 transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-6">Legal</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><Link to="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</Link></li>
              <li><Link to="/cookies" className="hover:text-blue-600 transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500 flex items-center gap-1">
            © 2024 JobSleuths. Built with <HiOutlineHeart className="text-red-500" /> for everyone.
          </p>
          <div className="flex gap-6 text-sm text-slate-400">
            <button className="hover:text-blue-600">Privacy</button>
            <button className="hover:text-blue-600">Terms</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
