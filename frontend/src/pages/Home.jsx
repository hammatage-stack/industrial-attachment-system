import { Link } from 'react-router-dom';
import { FiBriefcase, FiUsers, FiCheckCircle } from 'react-icons/fi';

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Find Your Perfect Industrial Attachment
            </h1>
            <p className="text-xl mb-8 text-primary-100">
              Connect with top companies and secure your dream internship or industrial attachment
            </p>
            <div className="flex justify-center space-x-4">
              <Link to="/opportunities" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                Browse Opportunities
              </Link>
              <Link to="/register" className="bg-primary-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-400 transition">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="flex justify-center mb-4">
                <FiBriefcase className="text-primary-600 text-5xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Wide Range of Opportunities</h3>
              <p className="text-gray-600">
                Access hundreds of internship and industrial attachment positions across various industries
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="flex justify-center mb-4">
                <FiCheckCircle className="text-primary-600 text-5xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Application Process</h3>
              <p className="text-gray-600">
                Simple, streamlined application with secure M-Pesa payment integration
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="flex justify-center mb-4">
                <FiUsers className="text-primary-600 text-5xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Trusted by Companies</h3>
              <p className="text-gray-600">
                Partner companies actively seeking talented students for attachments
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-gray-600 mb-8">
            Join thousands of students who have found their perfect industrial attachment
          </p>
          <Link to="/register" className="btn-primary text-lg px-8 py-3">
            Create Free Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
