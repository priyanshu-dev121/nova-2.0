import axios from 'axios';
import Sidebar from '../components/Sidebar';
import API from '../api/axiosConfig'; // Standardized API handler
import { Utensils, Clock, ChevronLeft, Calendar } from 'lucide-react';
import './Dashboard.css';

const MessPage = () => {
  const [user, setUser] = useState(null);
  const [menu, setMenu] = useState([]);
  const [selectedDay, setSelectedDay] = useState(new Date().toLocaleDateString('en-US', { weekday: 'long' }));
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo) {
      navigate('/login');
    } else {
      setUser(userInfo);
      fetchMenu();
    }
  }, [navigate]);

  const fetchMenu = async () => {
    try {
      const { data } = await API.get('/mess');
      setMenu(data);
    } catch (err) {
      console.error('Error fetching mess menu:', err);
    } finally {
      setLoading(false);
    }
  };

  const dayMenu = menu.find(m => m.day === selectedDay);

  if (!user) return null;

  return (
    <div className="dashboard-layout">
      <Sidebar handleLogout={() => { localStorage.removeItem('userInfo'); navigate('/login'); }} />
      <main className="main-content">
        <div className="page-header flex items-center gap-4 mb-8">
          <button className="icon-btn" onClick={() => navigate('/dashboard')}><ChevronLeft /></button>
          <h1>Mess Menu & Timings</h1>
        </div>

        <div className="days-nav flex gap-2 mb-8 overflow-x-auto pb-2">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
            <button 
              key={day}
              className={`day-btn ${selectedDay === day ? 'active' : ''}`}
              onClick={() => setSelectedDay(day)}
            >
              {day}
            </button>
          ))}
        </div>

        <div className="dashboard-grid">
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <Utensils className="text-primary" />
              <h2>Food Menu</h2>
            </div>
            
            {!dayMenu ? (
              <p className="empty-state">No menu available for {selectedDay}.</p>
            ) : (
              <div className="menu-sections flex flex-col gap-6">
                <div className="menu-item p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h3 className="text-primary font-bold mb-1">Breakfast</h3>
                  <p className="text-lg">{dayMenu.breakfast}</p>
                </div>
                <div className="menu-item p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h3 className="text-primary font-bold mb-1">Lunch</h3>
                  <p className="text-lg">{dayMenu.lunch}</p>
                </div>
                <div className="menu-item p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h3 className="text-primary font-bold mb-1">Dinner</h3>
                  <p className="text-lg">{dayMenu.dinner}</p>
                </div>
              </div>
            )}
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="text-primary" />
              <h2>Service Timings</h2>
            </div>
            {dayMenu && (
              <div className="timings-list flex flex-col gap-4">
                {Object.entries(dayMenu.timings).map(([meal, time]) => (
                  <div key={meal} className="timing-row flex justify-between items-center p-3 border-b">
                    <span className="capitalize font-medium">{meal}</span>
                    <span className="text-secondary">{time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MessPage;
