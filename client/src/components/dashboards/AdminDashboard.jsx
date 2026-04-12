import { 
  ShieldCheck, 
  MessageSquare, 
  Users, 
  Settings, 
  CheckCircle, 
  XCircle,
  BarChart3,
  CalendarDays,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboard = ({ user }) => {
  return (
    <div className="p-0 max-w-full">
      <header className="top-bar">
        <div className="welcome-msg">
          <motion.h2 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            Welcome, SysAdmin!
          </motion.h2>
          <p>Global management and system-wide analytics.</p>
        </div>
        <div className="top-actions">
          <div className="user-profile">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-black">
              A
            </div>
            <span className="font-bold text-sm">SysAdmin</span>
          </div>
        </div>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ color: '#ef4444' }}>
            <MessageSquare size={28} />
          </div>
          <div className="stat-info">
            <h3>Open Complaints</h3>
            <div className="value">14</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: '#166534' }}>
            <Users size={28} />
          </div>
          <div className="stat-info">
            <h3>Faculty Verified</h3>
            <div className="value">42</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: '#3b82f6' }}>
            <BarChart3 size={28} />
          </div>
          <div className="stat-info">
            <h3>Student Activity</h3>
            <div className="value">2.4k</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h2>
                <MessageSquare size={22} className="text-indigo-500" /> 
                Recent Complaints
              </h2>
            </div>
            <div className="space-y-3">
              {[
                { title: 'Wi-Fi issue in Block C', user: 'Rahul S.', status: 'Pending' },
                { title: 'Broken Lab AC', user: 'Priya K.', status: 'Processing' },
                { title: 'Library Book Shortage', user: 'Amit V.', status: 'Resolved' }
              ].map((complaint, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-black/5 rounded-2xl hover:bg-black/10 transition-all cursor-pointer">
                  <div>
                    <p className="font-bold text-sm">{complaint.title}</p>
                    <p className="text-xs font-bold opacity-60">Reported by: {complaint.user}</p>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${
                    complaint.status === 'Resolved' ? 'bg-green-100 text-green-700' : 
                    complaint.status === 'Processing' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {complaint.status}
                  </span>
                </div>
              ))}
            </div>
            <button className="action-btn-p w-full mt-6">
              Manage All Complaints
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h2>
                <CalendarDays size={22} className="text-indigo-500" /> 
                University-wide Notice
              </h2>
            </div>
            <div className="flex flex-col gap-4">
              <textarea 
                placeholder="Post a notice for all students and faculty..." 
                className="p-4 bg-black/5 border-none rounded-2xl text-sm h-32 resize-none font-bold"
              ></textarea>
              <button className="action-btn-p w-full">
                Broadcast Now
              </button>
            </div>
          </div>

          <div className="card">
            <h3 className="font-black mb-6 flex items-center gap-3">
              <Settings size={22} className="text-slate-400" /> System Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm py-2 border-b border-black/5">
                <span className="font-bold opacity-60">Backend Services</span>
                <span className="text-green-600 font-black flex items-center gap-1">
                  <CheckCircle size={14} /> Operational
                </span>
              </div>
              <div className="flex items-center justify-between text-sm py-2 border-b border-black/5">
                <span className="font-bold opacity-60">Database Connection</span>
                <span className="text-green-600 font-black flex items-center gap-1">
                  <CheckCircle size={14} /> Stabilized
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
