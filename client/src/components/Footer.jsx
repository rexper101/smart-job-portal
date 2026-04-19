import React from 'react';
import { Link } from 'react-router-dom';
import { FiBriefcase, FiGithub, FiLinkedin, FiTwitter } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 pt-12 pb-6 mt-auto">
      <div className="container-app">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl mb-3">
              <FiBriefcase className="w-6 h-6 text-indigo-400" />
              SmartHire
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              A modern job portal connecting talented professionals with top companies. Find your dream job or hire the best talent today.
            </p>
            <div className="flex gap-4 mt-4">
              {[FiGithub, FiLinkedin, FiTwitter].map((Icon, i) => (
                <a key={i} href="#" className="p-2 rounded-lg hover:bg-slate-800 hover:text-indigo-400 transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[['/', 'Home'], ['/jobs', 'Browse Jobs'], ['/register', 'Create Account'], ['/login', 'Sign In']].map(([to, label]) => (
                <li key={to}><Link to={to} className="hover:text-indigo-400 transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* For Recruiters */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">For Recruiters</h4>
            <ul className="space-y-2 text-sm">
              {['/post-job', '/dashboard'].map((to) => (
                <li key={to}><Link to={to} className="hover:text-indigo-400 transition-colors capitalize">{to.replace('/', '').replace('-', ' ')}</Link></li>
              ))}
              <li><span className="text-xs bg-indigo-900/50 text-indigo-400 px-2 py-0.5 rounded-full">Register as Recruiter</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs">
          <p>© {new Date().getFullYear()} SmartHire Job Portal. All rights reserved.</p>
          <p>Built with ❤️ using MERN Stack</p>
        </div>
      </div>
    </footer>
  );
}
