import { useState, useEffect } from 'react';
import { jobAPI } from '../../services/api';
import { 
  HiOutlineSearch, HiOutlineLocationMarker, HiOutlineBriefcase, 
  HiOutlineCurrencyDollar, HiOutlineOfficeBuilding, HiOutlineAdjustments,
  HiOutlineChevronRight
} from 'react-icons/hi';
import { Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import BookmarkButton from '../../components/common/BookmarkButton';

const JobSearch = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('search') || '';
  const initialLocation = queryParams.get('location') || '';

  const [filters, setFilters] = useState({
    search: initialSearch,
    location: initialLocation,
    jobType: '',
    experienceLevel: '',
  });

  useEffect(() => {
    fetchJobs();
  }, [filters]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await jobAPI.getJobs(filters);
      setJobs(res.data.jobs);
    } catch (error) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-12 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Search Header */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-12">
          <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-4">
            <div className="flex-[2] relative">
              <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                name="search"
                value={filters.search}
                placeholder="Job title, keywords, or company..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                onChange={handleFilterChange}
              />
            </div>
            
            <div className="flex-1 relative">
              <HiOutlineLocationMarker className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                name="location"
                value={filters.location}
                placeholder="City or Remote..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                onChange={handleFilterChange}
              />
            </div>

            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md shadow-blue-600/10 active:scale-95">
              Search Jobs
            </button>
          </form>

          {/* Quick Filters */}
          <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-6">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
               <HiOutlineAdjustments className="text-slate-400" size={16} />
               <select 
                name="jobType"
                value={filters.jobType}
                className="bg-transparent text-slate-600 text-xs font-bold uppercase outline-none cursor-pointer"
                onChange={handleFilterChange}
               >
                 <option value="">Job Type</option>
                 <option value="FULL_TIME">Full Time</option>
                 <option value="PART_TIME">Part Time</option>
                 <option value="CONTRACT">Contract</option>
                 <option value="INTERNSHIP">Internship</option>
               </select>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
               <HiOutlineBriefcase className="text-slate-400" size={16} />
               <select 
                name="experienceLevel"
                value={filters.experienceLevel}
                className="bg-transparent text-slate-600 text-xs font-bold uppercase outline-none cursor-pointer"
                onChange={handleFilterChange}
               >
                 <option value="">Experience</option>
                 <option value="ENTRY_LEVEL">Entry Level</option>
                 <option value="MID_LEVEL">Mid Level</option>
                 <option value="SENIOR_LEVEL">Senior Level</option>
               </select>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <header className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Latest Opportunities</h2>
                <p className="text-slate-500 text-sm font-medium">Found {jobs.length} jobs for you</p>
              </div>
            </header>

            <div className="space-y-4">
              {loading ? (
                Array.from({length: 3}).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl p-6 h-32 animate-pulse border border-slate-200"></div>
                ))
              ) : jobs.length > 0 ? jobs.map((job) => (
                <div key={job._id} className="group bg-white border border-slate-200 rounded-xl p-6 hover:border-blue-600 transition-all shadow-sm hover:shadow-md">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center text-2xl font-bold text-slate-400">
                        {job.company.charAt(0)}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                         <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-600">
                           {job.jobType.replace('_', ' ')}
                         </span>
                      </div>
                      <Link to={`/jobs/${job._id}`} className="text-xl font-bold text-slate-900 hover:text-blue-600 transition-colors block mb-1">
                        {job.title}
                      </Link>
                      <p className="text-slate-600 font-medium mb-4">{job.company}</p>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-slate-500 mb-4">
                        <span className="flex items-center gap-1.5"><HiOutlineLocationMarker className="text-slate-400" /> {job.location}</span>
                        <span className="flex items-center gap-1.5"><HiOutlineBriefcase className="text-slate-400" /> {job.experienceLevel}</span>
                        {job.salaryMin && (
                          <span className="flex items-center gap-1.5 text-slate-900 font-bold"><HiOutlineCurrencyDollar className="text-green-600" /> ₹{(job.salaryMin/100000).toFixed(1)}L+</span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {job.skills.slice(0, 3).map((skill, i) => (
                          <span key={i} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-md text-[10px] font-bold uppercase">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex-shrink-0 flex flex-col items-end gap-2 justify-center">
                      <BookmarkButton jobId={job._id} size={16} />
                      <Link to={`/jobs/${job._id}`} className="w-full md:w-auto bg-slate-50 text-slate-600 hover:bg-blue-600 hover:text-white font-bold py-2.5 px-6 rounded-lg transition-all text-xs uppercase flex items-center justify-center gap-2">
                        View Details <HiOutlineChevronRight />
                      </Link>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="bg-white border border-slate-200 rounded-xl p-16 text-center shadow-sm">
                   <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                      <HiOutlineBriefcase size={32} />
                   </div>
                   <h3 className="text-xl font-bold text-slate-900 mb-2">No Jobs Found</h3>
                   <p className="text-slate-500 text-sm max-w-xs mx-auto">We couldn't find any positions matching your search criteria.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Right Sidebar */}
          <div className="hidden lg:block space-y-6">
            <div className="bg-blue-600 rounded-2xl p-8 text-white shadow-xl shadow-blue-600/20">
              <h3 className="text-lg font-bold mb-3">Job Alerts</h3>
              <p className="text-blue-100 text-xs mb-6 leading-relaxed">Stay updated with the latest openings matching your profile.</p>
              <button className="w-full bg-white text-blue-600 font-bold py-3 rounded-xl transition-all text-[10px] uppercase tracking-widest hover:bg-blue-50">
                Create Alert
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobSearch;
