import { useState, useEffect } from 'react';
import { jobAPI } from '../../services/api';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, ArcElement, Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  HiOutlineTrendingUp, 
  HiOutlineCurrencyDollar, 
  HiOutlineBriefcase, 
  HiOutlineLightningBolt,
  HiOutlineChartPie
} from 'react-icons/hi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

const MarketIntelligence = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIntelligence = async () => {
      try {
        const res = await jobAPI.getMarketIntelligence();
        setData(res.data.data);
      } catch (error) {
        console.error('Failed to load market intelligence', error);
      } finally {
        setLoading(false);
      }
    };
    fetchIntelligence();
  }, []);

  if (loading) return <LoadingSpinner fullPage />;
  if (!data) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">Failed to load market data</div>;

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        titleFont: { size: 12 },
        padding: 10,
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 10 } } },
      y: { grid: { color: '#f1f5f9' }, ticks: { color: '#64748b', font: { size: 10 } } }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-12 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Market Intelligence</h1>
          <p className="text-slate-500">Actionable insights into salary trends and industry demand.</p>
        </header>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Avg Salary', value: `$${data.averageSalary.toLocaleString()}`, icon: HiOutlineCurrencyDollar, color: 'blue' },
            { label: 'Active Roles', value: data.activeRoles.toLocaleString(), icon: HiOutlineBriefcase, color: 'emerald' },
            { label: 'Growth', value: '+12.4%', icon: HiOutlineTrendingUp, color: 'amber' },
            { label: 'Top Skill', value: data.trendingSkills[0]?.skill || 'N/A', icon: HiOutlineLightningBolt, color: 'purple' },
          ].map((kpi, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-xl`}>
                  <kpi.icon className={`text-${kpi.color}-600`} />
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{kpi.label}</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900">{kpi.value}</h3>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-8 rounded-xl border border-slate-200 shadow-sm h-96 flex flex-col">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <HiOutlineTrendingUp className="text-blue-600" /> Salary Trends
            </h3>
            <div className="flex-1">
              <Line 
                data={{
                  labels: data.salaryTrends.map(t => t.month),
                  datasets: [{
                    label: 'Salary',
                    data: data.salaryTrends.map(t => t.avg),
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    fill: true,
                    tension: 0.3
                  }]
                }} 
                options={commonOptions} 
              />
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm h-96 flex flex-col">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <HiOutlineChartPie className="text-purple-600" /> Role Split
            </h3>
            <div className="flex-1">
              <Doughnut 
                data={{
                  labels: Object.keys(data.roleDistribution),
                  datasets: [{
                    data: Object.values(data.roleDistribution),
                    backgroundColor: ['#2563eb', '#059669', '#d97706', '#7c3aed', '#dc2626'],
                  }]
                }} 
                options={{ ...commonOptions, cutout: '65%' }} 
              />
            </div>
          </div>

          <div className="lg:col-span-3 bg-white p-8 rounded-xl border border-slate-200 shadow-sm h-96 flex flex-col">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <HiOutlineLightningBolt className="text-emerald-600" /> Top Skills
            </h3>
            <div className="flex-1">
              <Bar 
                data={{
                  labels: data.trendingSkills.map(s => s.skill),
                  datasets: [{
                    label: 'Count',
                    data: data.trendingSkills.map(s => s.count),
                    backgroundColor: '#10b981',
                    borderRadius: 8
                  }]
                }} 
                options={commonOptions} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketIntelligence;
