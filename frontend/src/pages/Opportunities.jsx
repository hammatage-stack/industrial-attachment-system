import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useAuthStore from '../context/authStore';
import { opportunityAPI } from '../services/api';

const Opportunities = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [durationFilter, setDurationFilter] = useState('');
  const [fieldFilter, setFieldFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const params = { page, limit };
        if (search) params.search = search;
        if (locationFilter) params.location = locationFilter;
        if (durationFilter) params.duration = durationFilter;
        if (fieldFilter) params.field = fieldFilter;

        const res = await opportunityAPI.getAll(params);
        if (res.data && res.data.opportunities) {
          setJobs(res.data.opportunities);
          setTotalPages(res.data.totalPages || 1);
        } else {
          setJobs([]);
        }
      } catch (err) {
        console.error('Error fetching jobs', err);
        toast.error('Unable to load opportunities');
      }
      setLoading(false);
    };

    fetchJobs();
  }, [page, limit, search, locationFilter, durationFilter, fieldFilter]);

  const handleViewDetails = (jobId) => {
    navigate(`/opportunities/${jobId}`);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Available Opportunities</h1>

      <div className="mb-6 flex flex-col md:flex-row md:items-center md:space-x-4 gap-3">
        <input
          placeholder="Search by title or company"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="px-3 py-2 border rounded w-full md:w-1/3"
        />
        <input
          placeholder="Location"
          value={locationFilter}
          onChange={(e) => { setLocationFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border rounded w-full md:w-1/6"
        />
        <input
          placeholder="Duration (e.g., 3 months)"
          value={durationFilter}
          onChange={(e) => { setDurationFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border rounded w-full md:w-1/6"
        />
        <select value={fieldFilter} onChange={(e) => { setFieldFilter(e.target.value); setPage(1); }} className="px-3 py-2 border rounded w-full md:w-1/6">
          <option value="">All fields</option>
          <option>IT & Software</option>
          <option>Engineering</option>
          <option>Business & Finance</option>
          <option>Marketing & Sales</option>
          <option>Healthcare</option>
          <option>Education</option>
          <option>Manufacturing</option>
          <option>Hospitality</option>
          <option>Media & Communications</option>
          <option>Other</option>
        </select>
      </div>

      {loading ? (
        <p>Loading opportunities...</p>
      ) : jobs.length === 0 ? (
        <p>No opportunities available at the moment.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <div key={job._id} className="border rounded-lg p-4 shadow-sm bg-white">
                <h2 className="text-lg font-semibold">{job.companyName}</h2>
                <p className="text-md font-medium">{job.title}</p>
                <p className="text-sm text-gray-600">Location: {job.location}</p>
                <p className="text-sm text-gray-600">Duration: {job.duration}</p>
                <p className="text-sm text-gray-600">Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}</p>
                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => handleViewDetails(job._id)}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                  >
                    View
                  </button>
                  <button
                    onClick={() => navigate(`/opportunities/${job._id}`)}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                  >
                    Apply
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await opportunityAPI.save(job._id);
                        alert('Saved');
                      } catch (e) { console.error(e); alert('Error saving'); }
                    }}
                    className="bg-white border px-3 py-2 rounded"
                  >
                    ⭐ Save
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div>
              <button onClick={() => handlePageChange(page - 1)} className="px-3 py-1 border rounded mr-2">Prev</button>
              <button onClick={() => handlePageChange(page + 1)} className="px-3 py-1 border rounded">Next</button>
            </div>
            <div>
              <label className="mr-2">Per page:</label>
              <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} className="px-2 py-1 border rounded">
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Opportunities;
