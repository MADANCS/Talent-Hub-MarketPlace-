import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineClipboardCopy, HiOutlineCheck, HiOutlineCode, HiOutlineArrowLeft } from 'react-icons/hi';
import {
  TECH_STACK,
  PLATFORM_FEATURES,
  RESUME_BULLETS,
  ATS_KEYWORDS,
  IMPACT_METRICS,
} from '../../data/projectShowcase';

const ProjectShowcase = () => {
  const [copied, setCopied] = useState(false);

  const copyBullets = async () => {
    const text = RESUME_BULLETS.map((b) => `• ${b}`).join('\n');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen text-slate-900 dark:text-white transition-colors">
      <div className="max-w-5xl mx-auto px-6 py-28">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-primary mb-12 transition-colors"
        >
          <HiOutlineArrowLeft /> Back to platform
        </Link>

        <header className="mb-16">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-4">
            Portfolio · Recruiter Brief
          </p>
          <h1 className="text-4xl md:text-6xl font-black font-outfit tracking-tight mb-6 leading-tight">
            JobSleuths — AI Talent Marketplace
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed max-w-3xl">
            Full-stack MERN application demonstrating production patterns: REST APIs, real-time
            WebSockets, AI resume parsing, live video interviews, payment integrations, and
            role-based hiring workflows. Built for recruiters and hiring managers evaluating
            software engineering capability.
          </p>
        </header>

        {/* Impact metrics */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20" aria-label="Project impact metrics">
          {IMPACT_METRICS.map((m) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5"
            >
              <motion.div className="text-3xl font-black font-outfit text-primary">{m.value}</motion.div>
              <div className="text-xs font-black uppercase tracking-widest mt-1">{m.label}</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{m.detail}</p>
            </motion.div>
          ))}
        </section>

        {/* Resume bullets — copyable */}
        <section className="mb-20" aria-labelledby="resume-bullets-heading">
          <motion.div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h2 id="resume-bullets-heading" className="text-2xl font-black font-outfit">
              Resume-Ready Accomplishments
            </h2>
            <button
              type="button"
              onClick={copyBullets}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-blue-600 transition-all shadow-lg shadow-primary/20"
            >
              {copied ? <HiOutlineCheck size={18} /> : <HiOutlineClipboardCopy size={18} />}
              {copied ? 'Copied' : 'Copy all bullets'}
            </button>
          </motion.div>
          <ul className="space-y-5">
            {RESUME_BULLETS.map((bullet, i) => (
              <li
                key={i}
                className="flex gap-4 p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 text-sm leading-relaxed text-slate-700 dark:text-slate-300"
              >
                <span className="shrink-0 w-8 h-8 rounded-xl bg-primary/10 text-primary font-black text-xs flex items-center justify-center">
                  {i + 1}
                </span>
                {bullet}
              </li>
            ))}
          </ul>
        </section>

        {/* Tech stack */}
        <section className="mb-20" aria-labelledby="tech-stack-heading">
          <h2 id="tech-stack-heading" className="text-2xl font-black font-outfit mb-6 flex items-center gap-3">
            <HiOutlineCode className="text-primary" /> Technical Stack
          </h2>
          <motion.div className="flex flex-wrap gap-2">
            {TECH_STACK.map((tech) => (
              <span
                key={tech}
                className="px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-600 dark:text-slate-300"
              >
                {tech}
              </span>
            ))}
          </motion.div>
        </section>

        {/* Features */}
        <section className="mb-20" aria-labelledby="features-heading">
          <h2 id="features-heading" className="text-2xl font-black font-outfit mb-8">
            Platform Capabilities
          </h2>
          <div className="grid gap-6">
            {PLATFORM_FEATURES.map((f) => (
              <article
                key={f.title}
                className="p-8 rounded-[32px] border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/30"
              >
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">{f.description}</p>
                <div className="flex flex-wrap gap-2">
                  {f.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ATS keywords — semantic for crawlers */}
        <section aria-labelledby="ats-keywords-heading">
          <h2 id="ats-keywords-heading" className="text-2xl font-black font-outfit mb-4">
            ATS &amp; Recruiter Keywords
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-2xl">
            Skills and technologies aligned with Full-Stack Developer, Software Engineer, and MERN
            stack job descriptions. These terms mirror common applicant tracking system filters.
          </p>
          <p className="sr-only">{ATS_KEYWORDS.join(', ')}</p>
          <div className="flex flex-wrap gap-2" aria-hidden="true">
            {ATS_KEYWORDS.map((kw) => (
              <span
                key={kw}
                className="px-3 py-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 border border-dashed border-slate-300 dark:border-white/10 rounded-lg"
              >
                {kw}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProjectShowcase;
