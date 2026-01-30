import useAuthStore from '../context/authStore';
import { applicationAPI } from '../services/api';

const Dashboard = () => {
  const { user } = useAuthStore();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Welcome, {user?.firstName}!</h1>
      <p className="text-gray-600 mb-8">Manage your applications and profile</p>
      
      <Stats />
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

const Stats = () => {
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 });

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await applicationAPI.getMyApplications();
        const apps = res.data.applications || [];
        const total = apps.length;
        const pending = apps.filter(a => a.status === 'pending').length;
        const approved = apps.filter(a => a.status === 'approved' || a.status === 'submitted').length;
        setStats({ total, pending, approved });
      } catch (e) {
        console.error('Error fetching stats', e);
      }
    };
    fetch();
  }, []);

  return (
    <div className="grid md:grid-cols-3 gap-6 mb-6">
      <div className="p-4 bg-white rounded shadow">
        <h3 className="text-lg font-semibold">Applications</h3>
        <p className="text-2xl font-bold">{stats.total}</p>
      </div>
      <div className="p-4 bg-white rounded shadow">
        <h3 className="text-lg font-semibold">Pending</h3>
        <p className="text-2xl font-bold">{stats.pending}</p>
      </div>
      <div className="p-4 bg-white rounded shadow">
        <h3 className="text-lg font-semibold">Approved</h3>
        <p className="text-2xl font-bold">{stats.approved}</p>
      </div>
    </div>
  );
};
