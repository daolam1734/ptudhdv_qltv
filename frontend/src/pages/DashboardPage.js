import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  BookOpen, 
  Users, 
  ArrowUpRight, 
  HelpCircle,
  Activity,
  UserCheck
} from 'lucide-react';

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
    </div>
    <div className={`p-3 rounded-lg ${color}`}>
      {icon}
    </div>
  </div>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalBorrowed: 0,
    activeReaders: 0,
    totalBooks: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (['admin', 'librarian', 'staff'].includes(user?.role)) {
          const res = await api.reports.getBorrowedStats();
          const dashboardData = res.data.data;
          setStats({
            totalBorrowed: dashboardData.activeBorrows || 0,
            activeReaders: dashboardData.totalReaders || 0,
            totalBooks: dashboardData.totalBooks || 0
          });
        } else if (user?.role === 'reader' && user?._id) {
          const res = await api.readers.getHistory(user._id);
          const history = res.data.data;
          setStats({
            totalBorrowed: history.filter(r => r.status === 'borrowed' || r.status === 'overdue').length,
            activeReaders: 0, // Not applicable for reader
            totalBooks: history.length
          });
        }
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      }
    };
    fetchStats();
  }, [user]);

  const cards = user?.role === 'reader' ? [
    { title: "Current Borrows", value: stats.totalBorrowed, icon: <BookOpen />, color: "bg-blue-50", iconCol: "text-blue-600" },
    { title: "Total Read", value: stats.totalBooks, icon: <UserCheck />, color: "bg-green-50", iconCol: "text-green-600" },
    { title: "Notifications", value: "3 New", icon: <HelpCircle />, color: "bg-amber-50", iconCol: "text-amber-600" }
  ] : [
    { title: "Active Borrows", value: stats.totalBorrowed, icon: <BookOpen />, color: "bg-blue-50", iconCol: "text-blue-600" },
    { title: "Total Readers", value: stats.activeReaders, icon: <Users />, color: "bg-purple-50", iconCol: "text-purple-600" },
    { title: "Total Books", value: stats.totalBooks, icon: <ArrowUpRight />, color: "bg-green-50", iconCol: "text-green-600" }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Welcome back, {user?.fullName}!</h1>
        <p className="text-gray-500">Here's what's happening today in the library.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, i) => (
          <StatCard 
            key={i}
            title={card.title} 
            value={card.value} 
            icon={React.cloneElement(card.icon, { size: 24, className: card.iconCol })}
            color={card.color}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <Activity size={20} className="text-indigo-600" />
            System Updates
          </h3>
          <ul className="space-y-4">
            <li className="flex gap-4">
              <div className="w-1 h-12 bg-indigo-500 rounded-full shrink-0"></div>
              <div>
                <p className="text-sm font-medium text-gray-800">New system modules finalized.</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="w-1 h-12 bg-green-500 rounded-full shrink-0"></div>
              <div>
                <p className="text-sm font-medium text-gray-800">Fine policy updated to 5,000 VND / day.</p>
                <p className="text-xs text-gray-500">Yesterday at 15:30</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="bg-indigo-700 text-white p-8 rounded-xl shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2">Internal Guidelines</h3>
            <p className="text-indigo-100 mb-6 text-sm">
              Please ensure all reader information is verified before issuing new membership cards.
            </p>
            <button className="bg-white text-indigo-700 px-6 py-2 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors">
              Read Policy
            </button>
          </div>
          <HelpCircle size={120} className="absolute -bottom-10 -right-10 text-indigo-600 opacity-20" />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
