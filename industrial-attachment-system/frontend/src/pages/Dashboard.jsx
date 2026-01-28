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
    </div>
  );
};

export default Dashboard;
