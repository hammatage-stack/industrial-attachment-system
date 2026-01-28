const MyApplications = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Applications</h1>
      <p className="text-gray-600 mb-6">Track the status of your applications</p>
      
      <div className="card">
        <p className="text-gray-500">You haven't submitted any applications yet.</p>
      </div>
      {/* Add application list logic here */}
    </div>
  );
};

export default MyApplications;
