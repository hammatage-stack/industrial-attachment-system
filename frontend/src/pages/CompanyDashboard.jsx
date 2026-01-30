import { useEffect, useState } from 'react';
import { opportunityAPI } from '../services/api';
import useAuthStore from '../context/authStore';

const CompanyDashboard = () => {
  const { user } = useAuthStore();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMy = async () => {
      setLoading(true);
      try {
        const res = await opportunityAPI.getAll({ page: 1, limit: 50 });
        // Filter by postedBy if backend supports; otherwise show all for now
        setOpportunities(res.data.opportunities || []);
      } catch (e) {
        console.error('Error fetching opportunities', e);
      }
      setLoading(false);
    };
    fetchMy();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Company Dashboard</h1>
      <p className="text-gray-600 mb-6">Manage your posted opportunities and view applications.</p>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {opportunities.map((o) => (
            <div key={o._id} className="p-4 border rounded bg-white">
              <h3 className="font-semibold">{o.title}</h3>
              <p className="text-sm text-gray-600">{o.companyName}</p>
              <p className="text-sm text-gray-600">Deadline: {new Date(o.applicationDeadline).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompanyDashboard;
