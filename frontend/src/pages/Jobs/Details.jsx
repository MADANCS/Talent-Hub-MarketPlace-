import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { jobAPI, applicationAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  HiOutlineLocationMarker, HiOutlineBriefcase, HiOutlineCurrencyDollar, 
  HiOutlineClock, HiOutlineChevronLeft,
  HiOutlineCheckCircle, HiOutlineDocumentText
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import BookmarkButton from '../../components/common/BookmarkButton';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isCandidate } = useAuth();
  
  const [job, setJob] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [relatedJobs, setRelatedJobs] = useState([]);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await jobAPI.getJob(id);
        setJob(res.data.job);
        setHasApplied(res.data.hasApplied);
        try {
          const relatedRes = await jobAPI.getRelatedJobs(id);
          setRelatedJobs(relatedRes.data.jobs || []);
        } catch(e) {
          console.error(e);
        }
      } catch (error) {
        toast.error('Failed to load job details');
        navigate('/jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    
    setIsApplying(true);
    const toastId = toast.loading('Submitting application...');
    try {
      await applicationAPI.apply({ jobId: id, coverLetter });
      toast.success('Application submitted successfully!', { id: toastId });
      setHasApplied(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit application', { id: toastId });
    } finally {
      setIsApplying(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
       <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-slate-500 font-bold text-sm">Loading job details...</p>
       </div>
    </div>
  );

  if (!job) return null;

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 font-bold text-sm transition-colors"
        >
          <HiOutlineChevronLeft size={20} /> Back to Search
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Job Details */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl p-8 md:p-12 border border-slate-200 shadow-sm">
              <div className="flex flex-col md:flex-row gap-8 mb-8 pb-8 border-b border-slate-100">
                <div className="w-20 h-20 shrink-0 bg-slate-100 rounded-xl flex items-center justify-center text-2xl font-bold text-slate-400 border border-slate-200">
                  {job.company[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">{job.title}</h1>
                    <BookmarkButton jobId={job._id} size={20} className="mt-1 shrink-0" />
                  </div>
                  <p className="text-lg text-slate-600 font-medium mb-4">{job.company}</p>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-2"><HiOutlineLocationMarker className="text-slate-400" /> {job.location}</span>
                    <span className="flex items-center gap-2"><HiOutlineBriefcase className="text-slate-400" /> {job.jobType.replace('_', ' ')}</span>
                    <span className="flex items-center gap-2"><HiOutlineClock className="text-slate-400" /> Posted Recently</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Salary Range</p>
                  <p className="font-bold text-slate-900">₹{job.salaryMin?.toLocaleString()} - ₹{job.salaryMax?.toLocaleString()}</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Experience Level</p>
                  <p className="font-bold text-slate-900">{job.experienceLevel.replace('_', ' ')}</p>
                </div>
              </div>

              <div className="space-y-10">
                <section>
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Job Description</h2>
                  <div className="text-slate-600 leading-relaxed whitespace-pre-wrap text-sm">
                    {job.description}
                  </div>
                </section>

                {job.requirements?.length > 0 && (
                  <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Requirements</h2>
                    <ul className="space-y-3">
                      {job.requirements.map((req, i) => (
                        <li key={i} className="text-slate-600 flex items-start gap-3 text-sm">
                           <HiOutlineCheckCircle className="text-blue-600 mt-1 shrink-0" size={18} />
                           {req}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {job.skills?.length > 0 && (
                  <section>
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Required Skills</h2>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill, i) => (
                        <span key={i} className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-lg font-bold text-[10px] uppercase">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm sticky top-24">
              {hasApplied ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <HiOutlineCheckCircle size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Applied!</h3>
                  <p className="text-slate-500 text-sm mb-8">You have already applied for this position.</p>
                  <Link to="/candidate/dashboard" className="block w-full py-3 bg-slate-100 text-slate-700 font-bold text-xs uppercase rounded-xl hover:bg-slate-200 transition-all">
                    View Application Status
                  </Link>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-6">Quick Apply</h3>
                  <form onSubmit={handleApply} className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Cover Letter (Optional)</label>
                      <textarea
                        rows={6}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all resize-none"
                        placeholder="Tell us why you're a good fit..."
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                      ></textarea>
                    </div>
                    
                    <button 
                      type="submit" 
                      disabled={isApplying || (!isCandidate && user)} 
                      className={`w-full py-4 bg-blue-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2 ${
                        (!isCandidate && user) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                      }`}
                    >
                      {(!isCandidate && user) ? 'Candidate Access Only' : isApplying ? 'Submitting...' : 'Submit Application'}
                    </button>

                    {/* Save Job Button */}
                    <BookmarkButton jobId={job._id} size={16} variant="button"
                      className="w-full justify-center" />
                  </form>
                </div>
              )}
            </div>

            {relatedJobs.length > 0 && (
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Related Jobs</h3>
                <div className="space-y-6">
                  {relatedJobs.map((related) => (
                    <Link to={`/jobs/${related._id}`} key={related._id} className="block group">
                      <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors text-sm mb-1">{related.title}</h4>
                      <p className="text-xs text-slate-500 mb-2">{related.company}</p>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                        <HiOutlineLocationMarker size={14} /> {related.location}
                      </div>
                      <div className="w-full h-px bg-slate-100 mt-6" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
