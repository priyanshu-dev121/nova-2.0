import axios from 'axios';
import Sidebar from '../components/Sidebar';
import API from '../api/axiosConfig'; // Standardized API handler
import { Search, Plus, ChevronLeft, Mail, MapPin, Camera, Upload } from 'lucide-react';
import './Dashboard.css';

const LostFoundPage = () => {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', contactInfo: '' });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo) {
      navigate('/login');
    } else {
      setUser(userInfo);
      fetchItems();
    }
  }, [navigate]);

  const fetchItems = async () => {
    try {
      const { data } = await API.get('/lostfound');
      setItems(data);
    } catch (err) {
      console.error('Error fetching items:', err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please upload an image of the item');

    setLoading(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('contactInfo', formData.contactInfo);
    data.append('image', file);

    try {
      await API.post('/lostfound', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setShowForm(false);
      setFormData({ title: '', description: '', contactInfo: '' });
      setFile(null);
      fetchItems();
    } catch (err) {
      console.error('Error reporting item:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="dashboard-layout">
      <Sidebar handleLogout={() => { localStorage.removeItem('userInfo'); navigate('/login'); }} />
      <main className="main-content">
        <header className="page-header flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button className="icon-btn" onClick={() => navigate('/dashboard')}><ChevronLeft /></button>
            <h1 className="text-2xl font-bold">Lost & Found</h1>
          </div>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            <Plus size={20} /> Report Item
          </button>
        </header>

        {showForm && (
          <div className="centered-action-module fade-up">
            <div className="card">
              <h2 className="premium-form-header">List an Item</h2>
              <form onSubmit={handleUpload} className="mt-4 flex flex-col gap-6">
                <div className="form-group">
                  <label>Item Name</label>
                  <input 
                    type="text" 
                    value={formData.title} 
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g. Blue Water Bottle"
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Description & Location Found/Lost</label>
                  <textarea 
                    rows="3" 
                    value={formData.description} 
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Where and when did you see/lose it?"
                    required
                  ></textarea>
                </div>
                <div className="form-group">
                  <label>Alternate Contact (Optional)</label>
                  <input 
                    type="text" 
                    value={formData.contactInfo} 
                    onChange={(e) => setFormData({...formData, contactInfo: e.target.value})}
                    placeholder="Phone number or WhatsApp"
                  />
                </div>
                
                <div className="form-group">
                  <label>Item Image</label>
                  <div className="relative">
                    <input 
                      type="file" 
                      id="item-image-upload"
                      className="hidden"
                      onChange={(e) => setFile(e.target.files[0])} 
                      required 
                    />
                    <label htmlFor="item-image-upload" className="file-upload-hub">
                      <div className="upload-icon-wrapper">
                        <Camera size={32} />
                      </div>
                      <div>
                        <p className="upload-text-main">
                          {file ? file.name : "Click to take or upload item photo"}
                        </p>
                        <p className="upload-text-sub">Help others identify the item more easily</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Posting...' : 'Post Item'}
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="items-grid">
          {items.length === 0 ? (
            <p className="empty-state">No items listed yet.</p>
          ) : (
            items.map((item) => (
              <div key={item._id} className="item-card fade-up">
                <div className="item-image">
                  <img src={item.imageUrl} alt={item.title} />
                </div>
                <div className="item-details p-4">
                  <h3>{item.title}</h3>
                  <p className="description">{item.description}</p>
                  <p className="poster">Posted by {item.userId.name}</p>
                  <div className="flex gap-2 mt-4">
                    <a href={`mailto:${item.userId.email}`} className="btn-primary flex-1 justify-center">
                      <Mail size={18} /> Email Finder
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default LostFoundPage;
