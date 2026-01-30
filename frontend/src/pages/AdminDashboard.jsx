import React, { useState, useEffect } from 'react';
import { adminAPI, paymentAPI, applicationAPI } from '../services/api';
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [paymentStats, setPaymentStats] = useState(null);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rejectReason, setRejectReason] = useState({});
  const [showRejectForm, setShowRejectForm] = useState({});

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getDashboardStats();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingPayments = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getPendingPayments();
      if (data.success) {
        setPendingPayments(data.applications || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching pending payments');
      toast.error('Failed to fetch pending payments');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentStats = async () => {
    try {
      const { data } = await adminAPI.getPaymentStats();
      if (data.success) {
        setPaymentStats(data);
      }
    } catch (err) {
      console.error('Error fetching payment stats:', err);
    }
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data } = await applicationAPI.getAll({ limit: 50 });
      if (data.success) {
        setApplications(data.applications);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching applications');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (paymentId) => {
    try {
      const { data } = await adminAPI.verifyPayment(paymentId, {});
      if (data.success) {
        toast.success('Payment verified successfully');
        fetchPendingPayments();
        fetchPaymentStats();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error verifying payment');
    }
  };

  const handleRejectPayment = async (applicationId) => {
    const reason = rejectReason[applicationId] || prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      const { data } = await adminAPI.rejectPayment(applicationId, {
        rejectionReason: reason
      });
      if (data.success) {
        toast.success('Payment rejected successfully');
        setRejectReason({ ...rejectReason, [applicationId]: '' });
        setShowRejectForm({ ...showRejectForm, [applicationId]: false });
        fetchPendingPayments();
        fetchPaymentStats();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error rejecting payment');
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'payments') {
      fetchPendingPayments();
      fetchPaymentStats();
    } else if (tab === 'applications') {
      fetchApplications();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8">
            <button
              onClick={() => handleTabChange('overview')}
              className={`py-4 px-2 border-b-2 font-medium ${
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => handleTabChange('payments')}
              className={`py-4 px-2 border-b-2 font-medium ${
                activeTab === 'payments'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Payments ({stats?.payments?.pending || 0})
            </button>
            <button
              onClick={() => handleTabChange('applications')}
              className={`py-4 px-2 border-b-2 font-medium ${
                activeTab === 'applications'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Applications
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Users"
                value={stats.users.total}
                icon="👥"
              />
              <StatCard
                title="Total Applications"
                value={stats.applications.total}
                icon="📋"
              />
              <StatCard
                title="Pending Payments"
                value={stats.payments.pending}
                icon="💰"
                highlight={stats.payments.pending > 0}
              />
              <StatCard
                title="Active Opportunities"
                value={stats.opportunities.active}
                icon="🎯"
              />
            </div>

            {/* Charts/Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold mb-4">Applications by Status</h3>
                <div className="space-y-3">
                  {stats.applications.byStatus.map(item => (
                    <div key={item._id} className="flex justify-between items-center">
                      <span className="text-gray-600 capitalize">{item._id || 'Unknown'}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${(item.count / stats.applications.total) * 100}%`
                            }}
                          />
                        </div>
                        <span className="font-bold w-8 text-right">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold mb-4">Payments by Status</h3>
                <div className="space-y-3">
                  {stats.payments.byStatus.map(item => (
                    <div key={item._id} className="flex justify-between items-center">
                      <span className="text-gray-600 capitalize">{item._id || 'Unknown'}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${(item.count / (stats.payments.pending + stats.payments.verified)) * 100}%`
                            }}
                          />
                        </div>
                        <span className="font-bold w-8 text-right">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Applications */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">Recent Applications</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Applicant</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Opportunity</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentApplications.map(app => (
                      <tr key={app._id} className="border-t">
                        <td className="px-4 py-3 text-sm">
                          {app.applicant?.firstName} {app.applicant?.lastName}
                        </td>
                        <td className="px-4 py-3 text-sm">{app.opportunity?.title}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            app.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                            app.status === 'shortlisted' ? 'bg-green-100 text-green-800' :
                            app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && !loading && (
          <div>
            {/* Payment Stats */}
            {paymentStats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">{paymentStats.pending || 0}</div>
                  <div className="text-sm text-blue-700">Pending Review</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="text-2xl font-bold text-green-600">{paymentStats.verified || 0}</div>
                  <div className="text-sm text-green-700">Verified</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <div className="text-2xl font-bold text-red-600">{paymentStats.rejected || 0}</div>
                  <div className="text-sm text-red-700">Rejected</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <div className="text-2xl font-bold text-purple-600">KES {paymentStats.totalAmount || 0}</div>
                  <div className="text-sm text-purple-700">Total Amount</div>
                </div>
              </div>
            )}

            {/* Pending Payments Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b">
                <h3 className="font-semibold text-gray-800">Pending Payments ({pendingPayments.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Applicant</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Opportunity</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">M-Pesa Code</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Amount</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Submitted</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingPayments.length > 0 ? (
                      pendingPayments.map(app => (
                        <tr key={app._id} className="border-t hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium">
                            {app.applicant?.firstName} {app.applicant?.lastName}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {app.applicant?.email}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {app.opportunity?.title}
                          </td>
                          <td className="px-4 py-3 text-sm font-mono text-gray-600">
                            {app.payment?.mpesaReceiptNumber || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold">
                            KES {app.payment?.amount || 0}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {new Date(app.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => handleVerifyPayment(app._id)}
                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
                              >
                                Verify
                              </button>
                              <button
                                onClick={() => setShowRejectForm({ ...showRejectForm, [app._id]: !showRejectForm[app._id] })}
                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                              >
                                Reject
                              </button>
                              {showRejectForm[app._id] && (
                                <div className="mt-2 p-2 bg-red-50 rounded border border-red-200">
                                  <input
                                    type="text"
                                    placeholder="Rejection reason"
                                    value={rejectReason[app._id] || ''}
                                    onChange={(e) => setRejectReason({ ...rejectReason, [app._id]: e.target.value })}
                                    className="w-full px-2 py-1 border border-gray-300 rounded mb-2 text-sm"
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleRejectPayment(app._id)}
                                      className="flex-1 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                                    >
                                      Confirm
                                    </button>
                                    <button
                                      onClick={() => setShowRejectForm({ ...showRejectForm, [app._id]: false })}
                                      className="flex-1 px-2 py-1 bg-gray-400 text-white text-xs rounded hover:bg-gray-500"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                          No pending payments
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && !loading && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Applicant</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Opportunity</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Payment</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map(app => (
                    <tr key={app._id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">
                        {app.applicant?.firstName} {app.applicant?.lastName}
                      </td>
                      <td className="px-4 py-3 text-sm">{app.opportunity?.title}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          app.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                          app.status === 'shortlisted' ? 'bg-green-100 text-green-800' :
                          app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          app.payment?.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {app.payment?.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-600">Loading...</div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, highlight = false }) => (
  <div className={`rounded-lg shadow p-6 ${highlight ? 'bg-red-50 border-2 border-red-200' : 'bg-white'}`}>
    <div className="text-4xl mb-2">{icon}</div>
    <h3 className="text-gray-600 text-sm font-medium mb-2">{title}</h3>
    <p className={`text-3xl font-bold ${highlight ? 'text-red-600' : 'text-gray-900'}`}>{value}</p>
  </div>
);

export default AdminDashboard;
