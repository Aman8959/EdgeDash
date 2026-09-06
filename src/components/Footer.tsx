import React from 'react';
import { 
  Bot, 
  HelpCircle, 
  FileText, 
  Shield, 
  Heart, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2,
  Lock,
  Globe
} from 'lucide-react';
import { InfoModalType } from './InfoModal';

interface FooterProps {
  onOpenInfo: (type: InfoModalType) => void;
  isAuthenticated?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ onOpenInfo, isAuthenticated = false }) => {
  return (
    <footer className="mt-16 border-t border-slate-800 bg-slate-950/80 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
                <Bot className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-white tracking-tight">EdgeDash</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold">
                Intelligence Platform
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              AI-driven career intelligence platform delivering live job discovery from verified public APIs, 
              deep skill gap analytics, and 100% zero-hallucination ATS resume customization.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
              <span className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md">
                <Globe className="w-3.5 h-3.5 text-blue-400" /> Real-time Job APIs
              </span>
              <span className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md">
                <Lock className="w-3.5 h-3.5 text-emerald-400" /> Firebase Secured
              </span>
              <span className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /> Zero Hallucination
              </span>
            </div>
          </div>

          {/* Platform Features & Tools */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Platform Capabilities</h4>
            <ul className="space-y-2 text-xs">
              <li className="hover:text-slate-200 transition">⚡ Real-time Job Aggregation</li>
              <li className="hover:text-slate-200 transition">🎯 Dual-Matrix Fit Scoring</li>
              <li className="hover:text-slate-200 transition">📊 Market Skill Gap Engine</li>
              <li className="hover:text-slate-200 transition">📄 Zero-Hallucination ATS Resumes</li>
              <li className="hover:text-slate-200 transition">🚀 1-Click Direct Apply Dossier</li>
            </ul>
          </div>

          {/* Legal & Help Links (FAQs, Terms, Privacy) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Legal & Trust</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  id="footer-link-faqs"
                  onClick={() => onOpenInfo('faqs')}
                  className="flex items-center gap-1.5 text-slate-300 hover:text-blue-400 transition"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                  <span>Frequently Asked Questions (FAQs)</span>
                </button>
              </li>
              <li>
                <button
                  id="footer-link-terms"
                  onClick={() => onOpenInfo('terms')}
                  className="flex items-center gap-1.5 text-slate-300 hover:text-blue-400 transition"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Terms of Service</span>
                </button>
              </li>
              <li>
                <button
                  id="footer-link-privacy"
                  onClick={() => onOpenInfo('privacy')}
                  className="flex items-center gap-1.5 text-slate-300 hover:text-blue-400 transition"
                >
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Privacy Policy</span>
                </button>
              </li>
              <li>
                <span className="text-[11px] text-slate-500 block pt-1">
                  Data stored securely in Google Cloud Firestore with end-to-end user isolation.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-slate-500">
            © {new Date().getFullYear()} EdgeDash Career Intelligence. All rights reserved.
          </p>

          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <button 
              onClick={() => onOpenInfo('faqs')} 
              className="hover:text-slate-200 transition"
            >
              FAQs
            </button>
            <span>•</span>
            <button 
              onClick={() => onOpenInfo('terms')} 
              className="hover:text-slate-200 transition"
            >
              Terms
            </button>
            <span>•</span>
            <button 
              onClick={() => onOpenInfo('privacy')} 
              className="hover:text-slate-200 transition"
            >
              Privacy
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
