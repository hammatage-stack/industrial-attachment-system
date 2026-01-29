import React, { useState, useEffect } from 'react';
import { institutionAPI } from '../services/api';

const InstitutionDirectory = () => {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    county: '',
    subCounty: '',
    page: 1,
    limit: 20
  });
  const [types, setTypes] = useState([]);
  const [counties, setCounties] = useState([]);
  const [subCounties, setSubCounties] = useState([]);
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [totalPages, setTotalPages] = useState(0);

  // Fetch institution types on mount
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const { data } = await institutionAPI.getTypes();
        if (data.success) {
          setTypes(data.types);
        }
      } catch (err) {
        console.error('Error fetching types:', err);
      }
    };

    const fetchCounties = async () => {
      try {
        const { data } = await institutionAPI.getCounties();
        if (data.success) {
          setCounties(data.counties);
        }
      } catch (err) {
        console.error('Error fetching counties:', err);
      }
    };

    fetchTypes();
    fetchCounties();
  }, []);

  // Fetch sub-counties when county changes
  useEffect(() => {
    if (filters.county) {
      const fetchSubCounties = async () => {
        try {
          const { data } = await institutionAPI.getSubCounties(filters.county);
          if (data.success) {
            setSubCounties(data.subCounties);
          }
        } catch (err) {
          console.error('Error fetching sub-counties:', err);
        }
      };
      fetchSubCounties();
    } else {
      setSubCounties([]);
    }
  }, [filters.county]);

  // Fetch institutions
  useEffect(() => {
    const fetchInstitutions = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await institutionAPI.getAll(filters);
        if (data.success) {
          setInstitutions(data.institutions);
          setTotalPages(data.pages);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching institutions');
      } finally {
        setLoading(false);
      }
    };

    fetchInstitutions();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters(prev => ({
      ...prev,
      page: 1
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Institution Directory</h1>
          <p className="text-gray-600 mt-2">Search and explore companies, organizations, and educational institutions across Kenya</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <input
                type="text"
                name="search"
                placeholder="Search by name or sector..."
                value={filters.search}
                onChange={handleFilterChange}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                {types.map(type => (
                  <option key={type} value={type}>
                    {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </option>
                ))}
              </select>

              <select
                name="county"
                value={filters.county}
                onChange={handleFilterChange}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Counties</option>
                {counties.map(county => (
                  <option key={county} value={county}>{county}</option>
                ))}
              </select>

              <select
                name="subCounty"
                value={filters.subCounty}
                onChange={handleFilterChange}
                disabled={!filters.county}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">All Sub-counties</option>
                {subCounties.map(subCounty => (
                  <option key={subCounty} value={subCounty}>{subCounty}</option>
                ))}
              </select>

              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-8">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="text-gray-600">Loading institutions...</div>
          </div>
        ) : institutions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">No institutions found matching your criteria</p>
          </div>
        ) : (
          <>
            <div className="text-gray-600 mb-4">
              Found {institutions.length} institutions
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {institutions.map(institution => (
                <div
                  key={institution._id}
                  onClick={() => setSelectedInstitution(institution)}
                  className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
                >
                  {institution.logo?.url && (
                    <img
                      src={institution.logo.url}
                      alt={institution.name}
                      className="w-full h-32 object-cover rounded-lg mb-4"
                    />
                  )}
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{institution.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    <span className="font-medium">Type:</span> {institution.type.replace('-', ' ')}
                  </p>
                  <p className="text-sm text-gray-600 mb-3">
                    <span className="font-medium">Location:</span> {institution.location.county}, {institution.location.subCounty}
                  </p>
                  {institution.email && (
                    <p className="text-sm text-gray-600 mb-3">
                      <span className="font-medium">Email:</span> {institution.email}
                    </p>
                  )}
                  {institution.phoneNumber && (
                    <p className="text-sm text-gray-600 mb-3">
                      <span className="font-medium">Phone:</span> {institution.phoneNumber}
                    </p>
                  )}
                  {institution.sectors.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Sectors:</p>
                      <div className="flex flex-wrap gap-2">
                        {institution.sectors.map((sector, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                          >
                            {sector}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mb-8">
                <button
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 rounded-lg ${
                      filters.page === page
                        ? 'bg-blue-600 text-white'
                        : 'border hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={filters.page === totalPages}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {selectedInstitution && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <button
                onClick={() => setSelectedInstitution(null)}
                className="float-right text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
              <h2 className="text-2xl font-bold mb-4">{selectedInstitution.name}</h2>
              
              {selectedInstitution.description && (
                <div className="mb-4">
                  <p className="font-medium text-gray-700">About:</p>
                  <p className="text-gray-600">{selectedInstitution.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="font-medium text-gray-700">Type</p>
                  <p className="text-gray-600">{selectedInstitution.type}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Location</p>
                  <p className="text-gray-600">
                    {selectedInstitution.location.county}, {selectedInstitution.location.subCounty}
                  </p>
                </div>
                {selectedInstitution.email && (
                  <div>
                    <p className="font-medium text-gray-700">Email</p>
                    <p className="text-gray-600">{selectedInstitution.email}</p>
                  </div>
                )}
                {selectedInstitution.phoneNumber && (
                  <div>
                    <p className="font-medium text-gray-700">Phone</p>
                    <p className="text-gray-600">{selectedInstitution.phoneNumber}</p>
                  </div>
                )}
                {selectedInstitution.website && (
                  <div>
                    <p className="font-medium text-gray-700">Website</p>
                    <a href={selectedInstitution.website} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                      {selectedInstitution.website}
                    </a>
                  </div>
                )}
              </div>

              {selectedInstitution.sectors.length > 0 && (
                <div className="mb-4">
                  <p className="font-medium text-gray-700 mb-2">Sectors</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedInstitution.sectors.map((sector, idx) => (
                      <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded">
                        {sector}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstitutionDirectory;
