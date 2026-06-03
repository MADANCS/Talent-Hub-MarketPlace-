import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineArrowRight, HiOutlineDocumentText } from 'react-icons/hi';
import {
  TECH_STACK,
  PLATFORM_FEATURES,
  RESUME_BULLETS,
  IMPACT_METRICS,
} from '../../data/projectShowcase';

const ProjectHighlights = () => (
  <>
    <section
      className="py-16 border-y border-slate-200 dark:border-white/5 bg-slate-50/80 dark:bg-slate-900/30 relative z-10"
      aria-labelledby="tech-stack-home"
    >
      <motion.div className="max-w-7xl mx-auto px-6">
        <p id="tech-stack-home" className="text-center text-[10px] font-black uppercase tracking-[0.35em] text-slate-400 mb-8">
          Built With · MERN Stack · Production Patterns
        </p>
        <motion.div className="flex flex-wrap justify-center gap-3">
          {TECH_STACK.map((tech) => (
            <span
              key={tech}
              className="px-4 py-2 rounded-full text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 shadow-sm"
            >
              {tech}
            </span>
          ))}
        </motion.div>
      </motion.div>
    </section>

    <section className="py-24 relative z-10 px-6" aria-label="Engineering impact">
      <motion.div className="max-w-7xl mx-auto">
        <motion.div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-black font-outfit text-slate-900 dark:text-white mb-4">
            Engineering <span className="text-primary">Impact</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-sm font-medium">
            Full-stack talent marketplace — REST APIs, real-time WebSockets, AI matching, and
            secure payments. Designed to demonstrate end-to-end software delivery.
          </p>
        </motion.div>
        <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {IMPACT_METRICS.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="p-8 rounded-[32px] bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 text-center shadow-sm"
            >
              <motion.div className="text-4xl font-black font-outfit text-primary mb-1">{m.value}</motion.div>
              <motion.div className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white mb-2">
                {m.label}
              </motion.div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{m.detail}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>

    <section className="py-24 relative z-10 px-6 bg-white dark:bg-slate-950" aria-labelledby="capabilities-heading">
      <motion.div className="max-w-7xl mx-auto">
        <h2 id="capabilities-heading" className="text-3xl font-black font-outfit text-slate-900 dark:text-white mb-4 text-center">
          Enterprise-Grade <span className="text-emerald-500">Capabilities</span>
        </h2>
        <p className="text-center text-slate-500 dark:text-slate-400 text-sm max-w-2xl mx-auto mb-14 font-medium">
          AI-powered hiring platform with JWT authentication, Socket.IO real-time features,
          Agora video interviews, and Razorpay/Stripe billing — aligned with modern Full-Stack
          Developer job requirements.
        </p>
        <motion.div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PLATFORM_FEATURES.map((f, i) => (
            <motion.article
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="p-8 rounded-[32px] border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/40 hover:border-primary/30 transition-colors"
            >
              <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">{f.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">{f.description}</p>
              <motion.div className="flex flex-wrap gap-1.5">
                {f.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="text-[9px] font-black uppercase tracking-wider text-primary/80 bg-primary/5 px-2 py-1 rounded-md"
                  >
                    {kw}
                  </span>
                ))}
              </motion.div>
            </motion.article>
          ))}
        </motion.div>
      </motion.div>
    </section>

    <section className="py-24 relative z-10 px-6 bg-slate-50 dark:bg-white/5" aria-labelledby="resume-preview-heading">
      <motion.div className="max-w-4xl mx-auto">
        <motion.div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <motion.div>
            <motion.div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-4">
              <HiOutlineDocumentText /> For Recruiters
            </motion.div>
            <h2 id="resume-preview-heading" className="text-3xl font-black font-outfit text-slate-900 dark:text-white">
              Resume-Ready Project Highlights
            </h2>
          </motion.div>
          <Link
            to="/about"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary hover:underline shrink-0"
          >
            Full portfolio brief <HiOutlineArrowRight />
          </Link>
        </motion.div>
        <ul className="space-y-4 mb-10">
          {RESUME_BULLETS.slice(0, 4).map((bullet, i) => (
            <li
              key={i}
              className="flex gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed"
            >
              <span className="shrink-0 w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-xs flex items-center justify-center">
                {i + 1}
              </span>
              {bullet}
            </li>
          ))}
        </ul>
        <Link
          to="/about"
          className="block w-full sm:w-auto text-center px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs uppercase tracking-widest rounded-2xl hover:opacity-90 transition-opacity"
        >
          View ATS Keywords &amp; Copy Resume Bullets
        </Link>
      </motion.div>
    </section>
  </>
);

export default ProjectHighlights;
