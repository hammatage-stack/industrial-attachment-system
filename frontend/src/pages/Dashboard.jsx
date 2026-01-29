import useAuthStore from '../context/authStore';

const Dashboard = () => {
  const { user } = useAuthStore();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Welcome, {user?.firstName}!</h1>
      <p className="text-gray-600 mb-8">Manage your applications and profile</p>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-xl font-semibold mb-2">Applications</h3>
          <p className="text-gray-600">View and track your applications</p>
        </div>
        
        <div className="card">
          <h3 className="text-xl font-semibold mb-2">New Opportunities</h3>
          <p className="text-gray-600">Browse latest openings</p>
        </div>
        
        <div className="card">
          <h3 className="text-xl font-semibold mb-2">Profile</h3>
          <p className="text-gray-600">Update your information</p>
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Saved Opportunities</h2>
        <SavedList />
      </div>
    </div>
  );
};

export default Dashboard;

import { useEffect, useState } from 'react';
import { opportunityAPI } from '../services/api';

const SavedList = () => {
  const [saved, setSaved] = useState([]);

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const res = await opportunityAPI.getSaved();
        setSaved(res.data.opportunities || []);
      } catch (e) {
        console.error('Error fetching saved', e);
      }
    };
    fetchSaved();
  }, []);

  if (!saved.length) return <p className="text-gray-600">No saved opportunities.</p>;

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {saved.map(job => (
        <div key={job._id} className="p-3 border rounded">
          <h4 className="font-semibold">{job.title}</h4>
          <p className="text-sm text-gray-600">{job.companyName}</p>
        </div>
      ))}
    </div>
  );
};
