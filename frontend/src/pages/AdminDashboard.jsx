import React, { useState, useEffect } from 'react';
import { adminAPI, paymentAPI, applicationAPI } from '../services/api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [payments, setPayments] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      const { data } = await paymentAPI.getAll({ status: 'pending', limit: 50 });
      if (data.success) {
        setPayments(data.payments);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching payments');
    } finally {
      setLoading(false);
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
      const { data } = await paymentAPI.verify(paymentId, {
        verificationNotes: 'Manually verified'
      });
      if (data.success) {
        alert('Payment verified successfully');
        fetchPendingPayments();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error verifying payment');
    }
  };

  const handleRejectPayment = async (paymentId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      const { data } = await paymentAPI.reject(paymentId, {
        rejectionReason: reason
      });
      if (data.success) {
        alert('Payment rejected');
        fetchPendingPayments();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error rejecting payment');
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'payments') {
      fetchPendingPayments();
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
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Applicant</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">M-Pesa Code</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(payment => (
                    <tr key={payment._id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">
                        {payment.user?.firstName} {payment.user?.lastName}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono">{payment.mpesaCode}</td>
                      <td className="px-4 py-3 text-sm">KES {payment.amount}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          payment.status === 'verified' ? 'bg-green-100 text-green-800' :
                          payment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          payment.status === 'duplicate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {payment.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleVerifyPayment(payment._id)}
                              className="text-green-600 hover:text-green-800 font-medium"
                            >
                              Verify
                            </button>
                            <button
                              onClick={() => handleRejectPayment(payment._id)}
                              className="text-red-600 hover:text-red-800 font-medium"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
