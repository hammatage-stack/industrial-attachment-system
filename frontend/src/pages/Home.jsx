import { Link } from 'react-router-dom';
import { FiBriefcase, FiUsers, FiCheckCircle, FiTrendingUp, FiAward, FiTarget, FiArrowRight } from 'react-icons/fi';

const Home = () => {
  const features = [
    {
      icon: FiBriefcase,
      title: 'Wide Range of Opportunities',
      description: 'Access hundreds of internship and industrial attachment positions across various industries'
    },
    {
      icon: FiCheckCircle,
      title: 'Easy Application Process',
      description: 'Simple, streamlined application with secure M-Pesa payment integration'
    },
    {
      icon: FiUsers,
      title: 'Trusted by Companies',
      description: 'Partner companies actively seeking talented students for attachments'
    },
    {
      icon: FiTrendingUp,
      title: 'Career Growth',
      description: 'Build practical experience and grow your professional skills'
    },
    {
      icon: FiAward,
      title: 'Quality Positions',
      description: 'Verified companies offering genuine attachment opportunities'
    },
    {
      icon: FiTarget,
      title: 'Perfect Match',
      description: 'Find positions aligned with your skills and career goals'
    }
  ];

  const stats = [
    { number: '5000+', label: 'Active Students' },
    { number: '500+', label: 'Partner Companies' },
    { number: '10000+', label: 'Placements' },
    { number: '95%', label: 'Success Rate' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 text-white py-24 sm:py-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Find Your Perfect <span className="text-blue-200">Industrial Attachment</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-2xl mx-auto">
              Connect with top companies and secure your dream internship. Start building your professional journey today.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              <Link 
                to="/opportunities" 
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition transform hover:scale-105 active:scale-95 shadow-lg"
              >
                Browse Opportunities
                <FiArrowRight size={20} />
              </Link>
              <Link 
                to="/register" 
                className="inline-flex items-center justify-center gap-2 bg-blue-400 hover:bg-blue-300 text-white px-8 py-4 rounded-xl font-bold transition transform hover:scale-105 active:scale-95 border-2 border-blue-300"
              >
                Create Free Account
                <FiArrowRight size={20} />
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-12 border-t border-blue-400 border-opacity-30">
              {stats.map((stat, i) => (
                <div key={i}>
                  <p className="text-3xl md:text-4xl font-bold">{stat.number}</p>
                  <p className="text-blue-200 text-sm mt-2">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Why Choose Us?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're committed to connecting talented students with life-changing opportunities
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="group relative p-8 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition transform hover:-translate-y-2"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl mb-6 group-hover:scale-110 transition transform">
                    <Icon className="text-white text-6xl" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  <div className="mt-4 h-1 w-0 bg-gradient-to-r from-blue-500 to-purple-600 group-hover:w-full transition-all duration-300"></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-24 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Get started in just 4 simple steps</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Create Account', desc: 'Sign up with your Gmail and basic info' },
              { step: '2', title: 'Browse Positions', desc: 'Explore opportunities from top companies' },
              { step: '3', title: 'Apply', desc: 'Submit your application in minutes' },
              { step: '4', title: 'Get Placed', desc: 'Start your attachment journey' }
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="flex flex-col items-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white font-bold text-2xl mb-4 shadow-lg">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 text-center mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-center text-sm">{item.desc}</p>
                </div>
                {i < 3 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[40%] h-1 bg-gradient-to-r from-blue-400 to-transparent"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of students who have found their perfect industrial attachment opportunity
          </p>
          <Link 
            to="/register" 
            className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition transform hover:scale-105 active:scale-95 shadow-lg"
          >
            Get Started for Free
            <FiArrowRight size={20} />
          </Link>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-white py-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Questions?</h3>
              <p className="text-gray-600">Check our help center for FAQs</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">For Companies</h3>
              <p className="text-gray-600">Post opportunities and find talent</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">For Institutions</h3>
              <p className="text-gray-600">Manage student placements</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
