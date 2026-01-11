import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ShieldCheck, UserPlus, Mail, Briefcase, Lock, Trash2 } from 'lucide-react';

const StaffPage = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await api.staff.getAll();
      setStaff(res.data.data);
    } catch (err) {
      console.error('Failed to fetch staff', err);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    const roles = {
      admin: 'bg-red-100 text-red-700 border-red-200',
      librarian: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      staff: 'bg-emerald-100 text-emerald-700 border-emerald-200'
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${roles[role] || 'bg-gray-100'}`}>
        {role}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Staff Directory</h2>
          <p className="text-sm text-gray-500 mt-1">Manage system administrators and librarians.</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-md active:scale-95">
          <UserPlus size={18} />
          <span className="font-semibold">Invite Member</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <ul className="divide-y divide-gray-100">
          {staff.map((member) => (
            <li key={member._id} className="p-6 hover:bg-gray-50/50 transition-colors flex items-center justify-between group">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
                    {member.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-lg shadow-sm border border-gray-100">
                    <ShieldCheck size={16} className="text-green-500" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-gray-900 text-lg">{member.fullName}</h3>
                    {getRoleBadge(member.role)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                    <span className="flex items-center gap-1.5"><Mail size={14}/> {member.email}</span>
                    <span className="flex items-center gap-1.5"><Briefcase size={14}/> {member._id.slice(-8)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button title="Reset Password" className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-indigo-100 transition-all">
                  <Lock size={18} />
                </button>
                <button title="Delete Account" className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-red-100 transition-all">
                  <Trash2 size={18} />
                </button>
              </div>
            </li>
          ))}
        </ul>

        {loading && (
          <div className="flex justify-center items-center py-20 flex-col gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            <p className="text-sm text-gray-400 animate-pulse font-medium">Loading staff data...</p>
          </div>
        )}

        {staff.length === 0 && !loading && (
          <div className="text-center py-20 text-gray-500">
            <ShieldCheck size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-lg font-medium">No staff members found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffPage;
