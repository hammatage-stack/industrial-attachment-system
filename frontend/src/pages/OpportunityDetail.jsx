import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useAuthStore from '../context/authStore';
import { opportunityAPI } from '../services/api';

const OpportunityDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      try {
        const res = await opportunityAPI.getById(id);
        if (res.data && res.data.opportunity) setJob(res.data.opportunity);
      } catch (err) {
        console.error('Error fetching job', err);
        toast.error('Unable to load opportunity');
      }
      setLoading(false);
    };
    fetchJob();
  }, [id]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!job) return <div className="p-8">Opportunity not found.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-2">{job.title}</h1>
      <h2 className="text-lg text-gray-700 mb-4">{job.companyName}</h2>

      <div className="mb-4">
        <strong>Location:</strong> {job.location}
      </div>

      <div className="mb-4">
        <strong>Duration:</strong> {job.duration}
      </div>

      <div className="mb-4">
        <strong>Deadline:</strong> {new Date(job.applicationDeadline).toLocaleString()}
      </div>

      <div className="mb-6">
        <h3 className="font-semibold">Full Description</h3>
        <p className="text-gray-700">{job.description}</p>
      </div>

      {job.requirements && job.requirements.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold">Requirements</h3>
          <ul className="list-disc list-inside text-gray-700">
            {job.requirements.map((r, idx) => (
              <li key={idx}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-6">
        <h3 className="font-semibold">Company Contact</h3>
        <p className="text-gray-700">Email: {job.companyEmail || 'N/A'}</p>
        <p className="text-gray-700">Phone: {job.companyPhone || 'N/A'}</p>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={() => {
            if (!isAuthenticated) {
              toast('Please login to apply');
              navigate('/login');
              return;
            }
            navigate(`/apply/${job._id}`);
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Apply Now
        </button>

        <button onClick={() => navigate('/opportunities')} className="px-4 py-2 border rounded">
          Back to list
        </button>
      </div>
    </div>
  );
};

export default OpportunityDetail;
