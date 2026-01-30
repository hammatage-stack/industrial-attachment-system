import { useEffect, useState } from 'react';
import { companyAPI } from '../services/api';
import { toast } from 'react-hot-toast';

const CompanyDashboard = () => {
  const [opps, setOpps] = useState([]);
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const { data } = await companyAPI.getMyOpportunities();
      if (data.success) setOpps(data.opportunities || []);
    } catch (err) {
      console.error(err);
      toast.error('Unable to load opportunities');
    }
    setLoading(false);
  };

  const viewApplications = async (oppId) => {
    setSelectedOpp(oppId);
    try {
      const { data } = await companyAPI.getApplicationsForOpportunity(oppId);
      if (data.success) setApplications(data.applications || []);
    } catch (err) {
      console.error(err);
      toast.error('Unable to load applications');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Company Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <h2 className="text-lg font-semibold mb-3">Your Posted Opportunities</h2>
          {loading ? (
            <p>Loading...</p>
          ) : opps.length === 0 ? (
            <p>No opportunities posted yet.</p>
          ) : (
            <div className="space-y-4">
              {opps.map(o => (
                <div key={o._id} className="p-4 bg-white border rounded shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{o.title}</h3>
                      <p className="text-sm text-gray-600">{o.location} • {o.duration}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</p>
                      <p className="text-xs mt-1 px-2 py-1 rounded-full bg-gray-100 inline-block">{o.status}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => viewApplications(o._id)} className="px-3 py-1 bg-blue-600 text-white rounded">View Applications</button>
                    <a href={`/opportunities/${o._id}`} className="px-3 py-1 border rounded">View Public</a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="md:col-span-1">
          <h2 className="text-lg font-semibold mb-3">Applications</h2>
          {selectedOpp ? (
            applications.length === 0 ? (
              <p className="text-sm text-gray-600">No applications for selected opportunity.</p>
            ) : (
              <div className="space-y-3">
                {applications.map(app => (
                  <div key={app._id} className="p-3 bg-white border rounded">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">{app.applicant?.firstName} {app.applicant?.lastName}</p>
                        <p className="text-sm text-gray-600">{app.applicant?.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{app.status}</p>
                        <p className="text-xs text-gray-500">{new Date(app.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-700">{app.coverLetter ? app.coverLetter.slice(0, 200) : ''}</div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <p className="text-sm text-gray-600">Select an opportunity to view applications.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;
