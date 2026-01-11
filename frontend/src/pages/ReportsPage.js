import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { BarChart3, TrendingUp, Users, BookMarked, Layers, AlertCircle } from 'lucide-react';

const ReportsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.reports.getBorrowedStats();
      setStats(res.data.data);
    } catch (err) {
      console.error('Failed to fetch reports', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Library Insights & Analytics</h2>
        <div className="flex gap-2">
          <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">Update Real-time</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Readers" 
          value={stats?.totalReaders || 0} 
          icon={<Users className="text-blue-600" />} 
          color="blue" 
        />
        <StatCard 
          title="Total Books" 
          value={stats?.totalBooks || 0} 
          icon={<Layers className="text-purple-600" />} 
          color="purple" 
        />
        <StatCard 
          title="Active Borrows" 
          value={stats?.activeBorrows || 0} 
          icon={<BookMarked className="text-orange-600" />} 
          color="orange" 
        />
        <StatCard 
          title="Overdue Items" 
          value={stats?.overdueRecords || 0} 
          icon={<AlertCircle className="text-red-600" />} 
          color="red" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp size={20} className="text-indigo-600" />
              Popular Categories
            </h3>
          </div>
          <div className="space-y-4">
            {stats?.categoryStats?.map((cat, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-gray-700">{cat.category}</span>
                  <span className="text-gray-500">{cat.count} books</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full" 
                    style={{ width: `${(cat.count / stats.totalBooks) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
            {!stats?.categoryStats?.length && <p className="text-gray-400 text-center py-10">No category data available.</p>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
            <BarChart3 size={20} className="text-indigo-600" />
            Quick Summary
          </h3>
          <ul className="space-y-6">
            <SummaryItem 
              label="Collection Health" 
              value="Excellent" 
              desc="98% of books are in good condition" 
              trend="up"
            />
            <SummaryItem 
              label="Borrowing Velocity" 
              value="+12%" 
              desc="Compared to previous month" 
              trend="up"
            />
            <SummaryItem 
              label="Late Return Rate" 
              value="3.5%" 
              desc="Target: &lt; 5%" 
              trend="down"
            />
          </ul>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  const colors = {
    blue: 'bg-blue-50',
    purple: 'bg-purple-50',
    orange: 'bg-orange-50',
    red: 'bg-red-50'
  };
  
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`p-4 rounded-xl ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-black text-gray-900">{value}</p>
      </div>
    </div>
  );
};

const SummaryItem = ({ label, value, desc, trend }) => (
  <li className="flex flex-col gap-1">
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-500 font-medium">{label}</span>
      <span className={`text-sm font-bold ${trend === 'up' ? 'text-green-600' : 'text-amber-600'}`}>{value}</span>
    </div>
    <p className="text-xs text-gray-400 italic font-light">{desc}</p>
  </li>
);

export default ReportsPage;
