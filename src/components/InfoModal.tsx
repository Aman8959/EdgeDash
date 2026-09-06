import React from 'react';
import { X, HelpCircle, FileText, Shield, CheckCircle, ExternalLink } from 'lucide-react';

export type InfoModalType = 'faqs' | 'terms' | 'privacy' | null;

interface InfoModalProps {
  type: InfoModalType;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              {type === 'faqs' && <HelpCircle className="w-5 h-5" />}
              {type === 'terms' && <FileText className="w-5 h-5" />}
              {type === 'privacy' && <Shield className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {type === 'faqs' && 'Frequently Asked Questions (FAQs)'}
                {type === 'terms' && 'Terms of Service'}
                {type === 'privacy' && 'Privacy & Data Protection Policy'}
              </h2>
              <p className="text-xs text-slate-400">
                {type === 'faqs' && 'Everything you need to know about EdgeDash career intelligence'}
                {type === 'terms' && 'Effective date: September 2026 • Version 2.4'}
                {type === 'privacy' && 'Zero-selling policy • Firebase Firestore End-to-End Protection'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300 leading-relaxed">
          {/* FAQs Content */}
          {type === 'faqs' && (
            <div className="space-y-6">
              <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-4">
                <h3 className="text-white font-semibold text-base mb-1.5 flex items-center gap-2">
                  <span className="text-blue-400">Q1.</span> How does EdgeDash discover and ingest real job openings?
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm">
                  EdgeDash connects live with real-world job portal REST APIs including <strong>Jobicy v2</strong>, <strong>Remotive Public API</strong>, and <strong>Arbeitnow Job Board</strong>, alongside direct career listings (such as Razorpay, Swiggy, Zepto, and LinkedIn Jobs). We do not generate mock or synthetic placeholder jobs; all listings represent active market openings.
                </p>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-4">
                <h3 className="text-white font-semibold text-base mb-1.5 flex items-center gap-2">
                  <span className="text-blue-400">Q2.</span> What is the Zero-Hallucination Resume Guarantee?
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm">
                  Most AI tools invent fake job titles, unverified companies, or exaggerated metrics. EdgeDash strictly verifies every bullet point against your authenticated profile. If a skill or accomplishment is not present in your verified profile, EdgeDash will <strong>never fabricate it</strong>. It highlights your true strengths to match the target job's ATS requirements.
                </p>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-4">
                <h3 className="text-white font-semibold text-base mb-1.5 flex items-center gap-2">
                  <span className="text-blue-400">Q3.</span> How is the Job Fit Score calculated?
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm">
                  The Fit Score uses an algorithmic dual-matrix weighted model:
                  <br />
                  • <strong>30% Keyword Alignment</strong>: Compares title keywords, role domain, and operational terms.
                  <br />
                  • <strong>70% Hard Skill Match</strong>: Analyzes required technical skills (Python, SQL, Machine Learning, Power BI, EDA) against your verified competency ledger.
                </p>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-4">
                <h3 className="text-white font-semibold text-base mb-1.5 flex items-center gap-2">
                  <span className="text-blue-400">Q4.</span> How does 1-Click Direct Apply work?
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm">
                  When you click Direct Apply, EdgeDash prepares an official Application Dossier containing your verified profile, tailored resume, targeted cover letter, and screening pitch. You can submit directly in-app, open pre-filled outreach emails in Gmail/Outlook, or jump straight to the company's verified application portal.
                </p>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-4">
                <h3 className="text-white font-semibold text-base mb-1.5 flex items-center gap-2">
                  <span className="text-blue-400">Q5.</span> Is my data secure and persistent across devices?
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm">
                  Yes! Your account is authenticated via Google Firebase Auth and your profile data, applied jobs, and custom preferences are stored securely in Google Cloud Firestore with Attribute-Based Access Control (ABAC).
                </p>
              </div>
            </div>
          )}

          {/* Terms of Service Content */}
          {type === 'terms' && (
            <div className="space-y-5 text-xs sm:text-sm text-slate-300">
              <section className="space-y-2">
                <h3 className="text-white font-semibold text-base">1. Acceptance of Terms</h3>
                <p>
                  By registering for an account or using EdgeDash ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not access or use EdgeDash.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-white font-semibold text-base">2. User Account and Authentication</h3>
                <p>
                  To access career intelligence and resume tailoring features, you must register using a valid email address and password or authenticate through Google Sign-In. You are responsible for safeguarding your credentials and for all activities that occur under your account.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-white font-semibold text-base">3. Career Services & Accuracy Disclaimer</h3>
                <p>
                  EdgeDash provides automated job aggregation, skill matching, and tailored resume authoring tools for career advancement. While we pull live postings from recognized job portals and strive for maximum accuracy, EdgeDash does not guarantee employment offers, interview calls, or hiring outcomes from third-party employers.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-white font-semibold text-base">4. Zero Hallucination & Honest Representation</h3>
                <p>
                  EdgeDash is engineered to protect professional integrity. Users agree to input truthful background information into their candidate profiles. EdgeDash does not support the generation of deceitful academic or professional claims.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-white font-semibold text-base">5. Intellectual Property</h3>
                <p>
                  The algorithms, software code, user interface designs, and branding of EdgeDash are proprietary. All resumes, cover letters, and application materials generated by you using your candidate information remain your intellectual property.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-white font-semibold text-base">6. Termination</h3>
                <p>
                  You may close your account at any time. EdgeDash reserves the right to suspend or terminate accounts that violate system security or misuse automated job scraping pipelines.
                </p>
              </section>
            </div>
          )}

          {/* Privacy Policy Content */}
          {type === 'privacy' && (
            <div className="space-y-5 text-xs sm:text-sm text-slate-300">
              <div className="p-3 bg-emerald-950/40 border border-emerald-700/50 rounded-xl text-emerald-300 flex items-center gap-3">
                <Shield className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>
                  <strong>Privacy Commitment:</strong> We never sell, rent, or trade your personal resume data, email address, or contact details to third-party data brokers or advertisers.
                </span>
              </div>

              <section className="space-y-2">
                <h3 className="text-white font-semibold text-base">1. Information We Collect</h3>
                <ul className="list-disc pl-5 space-y-1 text-slate-300">
                  <li><strong>Account Information:</strong> Your name, email address, and authentication identifiers provided during email registration or Google OAuth sign-in.</li>
                  <li><strong>Candidate Profile Data:</strong> Work history, education credentials, technical projects, verified skills, and certifications entered by you.</li>
                  <li><strong>Application Records:</strong> Job titles, companies, application statuses, and customized resume versions saved to your dashboard.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-white font-semibold text-base">2. How Your Information Is Used</h3>
                <p>
                  Your information is exclusively used to provide core platform functions: matching your skills against active job descriptions, computing fit scores, generating tailored resumes, and maintaining your application pipeline records.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-white font-semibold text-base">3. Cloud Storage & Security Architecture</h3>
                <p>
                  Data is stored in Google Cloud Firestore in isolated per-user security namespaces (`/users/&#123;userId&#125;`). Security rules enforce that only authenticated owners can read or write their personal data. All data transfers use TLS 1.3 encryption in transit.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-white font-semibold text-base">4. Third-Party Job APIs</h3>
                <p>
                  When fetching public jobs, EdgeDash queries public APIs (Jobicy, Remotive, Arbeitnow). No personally identifiable information (PII) is transmitted to these public job feeds during the fetch process.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-white font-semibold text-base">5. Your Rights & Data Deletion</h3>
                <p>
                  You have the right to review, edit, export, or delete your candidate profile and application records at any time directly through the application settings.
                </p>
              </section>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>EdgeDash Trust & Compliance Verified</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold transition"
          >
            I Understand & Close
          </button>
        </div>
      </div>
    </div>
  );
};
