import { useEffect, useState } from 'react';
import { opportunityAPI } from '../services/api';
import useAuthStore from '../context/authStore';

const CompanyDashboard = () => {
  const { user } = useAuthStore();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyOpportunities = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await opportunityAPI.getMyPostedOpportunities();
        setOpportunities(res.data.opportunities || []);
      } catch (e) {
        console.error('Error fetching my opportunities:', e);
        setError('Failed to load opportunities');
      }
      setLoading(false);
    };
    fetchMyOpportunities();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Company Dashboard</h1>
      <p className="text-gray-600 mb-6">Manage your posted opportunities and view applications.</p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-gray-600">Loading your opportunities...</p>
      ) : opportunities.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No opportunities posted yet</p>
          <a href="/opportunities/create" className="text-blue-600 hover:underline">
            Create your first opportunity
          </a>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {opportunities.map((o) => (
            <div key={o._id} className="p-4 border rounded bg-white hover:shadow-lg transition">
              <h3 className="font-semibold text-lg mb-2">{o.title}</h3>
              <p className="text-sm text-gray-600 mb-1">{o.companyName}</p>
              <p className="text-sm text-gray-600 mb-3">
                Deadline: {new Date(o.applicationDeadline).toLocaleDateString()}
              </p>
              <span className={`text-xs px-3 py-1 rounded-full ${
                o.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {o.status || 'open'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompanyDashboard;
