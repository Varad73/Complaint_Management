import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../AuthContext";

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const { user } = useAuth();
  
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Regular User",
      date: "since 2022",
      content: "This complaint portal made it incredibly easy to submit and track my issues. The resolution time was impressive, and the updates kept me informed throughout the process.",
      rating: 5,
      avatar: "SJ"
    },
    {
      name: "Michael Chen",
      role: "IT Manager",
      date: "since 2023",
      content: "The analytics dashboard provides invaluable insights into our department's performance. We've reduced resolution time by 40% since implementing this system.",
      rating: 5,
      avatar: "MC"
    },
    {
      name: "Emily Rodriguez",
      role: "Customer Support Lead",
      date: "since 2021",
      content: "Exceptional platform! The real-time tracking and automated notifications have transformed how we handle customer complaints. Highly recommended!",
      rating: 5,
      avatar: "ER"
    }
  ];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { value: "99.9%", label: "Uptime", icon: "🚀", color: "from-blue-500 to-blue-600" },
    { value: "< 24h", label: "Avg Response", icon: "⚡", color: "from-green-500 to-green-600" },
    { value: "50k+", label: "Issues Resolved", icon: "✅", color: "from-purple-500 to-purple-600" },
    { value: "4.9/5", label: "User Rating", icon: "⭐", color: "from-yellow-500 to-yellow-600" }
  ];

  const features = [
    {
      icon: "🎯",
      title: "Real-time Tracking",
      description: "Monitor your complaints' status in real-time and receive instant notifications at every stage of the resolution process.",
      color: "blue"
    },
    {
      icon: "📝",
      title: "Easy Submission",
      description: "Submit complaints quickly with our intuitive form. Add attachments and detailed descriptions for faster resolution.",
      color: "green"
    },
    {
      icon: "🔒",
      title: "Secure & Reliable",
      description: "Your data is protected with enterprise-grade security. We maintain strict confidentiality and data integrity protocols.",
      color: "purple"
    },
    {
      icon: "📊",
      title: "Analytics Dashboard",
      description: "Gain valuable insights with comprehensive analytics. Track trends, measure performance, and optimize your workflow.",
      color: "orange"
    },
    {
      icon: "🤝",
      title: "24/7 Support",
      description: "Our dedicated support team is available around the clock to assist you with any issues or questions.",
      color: "red"
    },
    {
      icon: "🔄",
      title: "Automated Workflows",
      description: "Streamline your complaint management with automated assignment, escalation, and notification workflows.",
      color: "indigo"
    }
  ];

  const getFeatureColors = (color) => {
    const colors = {
      blue: "from-blue-500 to-blue-600",
      green: "from-green-500 to-green-600",
      purple: "from-purple-500 to-purple-600",
      orange: "from-orange-500 to-orange-600",
      red: "from-red-500 to-red-600",
      indigo: "from-indigo-500 to-indigo-600"
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section with Animated Background */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-6 py-20">
        {/* Animated Background Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-1/2 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className={`max-w-7xl mx-auto relative transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Hero Content */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center justify-center p-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-6 animate-pulse">
              <span className="inline-flex items-center px-4 py-2 bg-white rounded-full">
                <span className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  🎯 Streamlined Complaint Management
                </span>
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Transform How You
              <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Handle Complaints
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Experience the future of complaint management with real-time tracking, automated workflows, 
              and comprehensive analytics. Join thousands of satisfied users today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to={user ? "/new" : "/login"}
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
              >
                <span className="relative z-10">{user ? "Submit Complaint" : "Get Started"}</span>
                <svg className="relative z-10 w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>
              
              <Link
                to="/my"
                className="inline-flex items-center px-8 py-4 text-lg font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:border-blue-600 hover:text-blue-600 transition-all duration-300 hover:shadow-lg"
              >
                View Complaints
                <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-4">Trusted by companies worldwide</p>
              <div className="flex flex-wrap justify-center gap-8 opacity-50">
                {["Company"].map((company, idx) => (
                  <span key={idx} className="text-gray-600 font-semibold text-lg">{company}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Stats Section with Animations */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
            {stats.map((stat, idx) => (
              <div 
                key={idx}
                className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-center border border-gray-100"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform">{stat.icon}</div>
                <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                  {stat.value}
                </div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Features Section */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Why Choose{" "}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  SmartGrievance?
                </span>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover the features that make us the leading complaint management platform
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, idx) => (
                <div 
                  key={idx}
                  className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
                >
                  <div className={`h-2 bg-gradient-to-r ${getFeatureColors(feature.color)}`}></div>
                  <div className="p-8">
                    <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">{feature.icon}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial Carousel */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                What Our{" "}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Users Say
                </span>
              </h2>
              <p className="text-lg text-gray-600">Join thousands of satisfied customers</p>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-1">
                <div className="bg-white rounded-2xl p-8 md:p-12">
                  <div className="max-w-4xl mx-auto">
                    <div className="text-center">
                      {/* Quote Icon */}
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-6">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      
                      {/* Rating Stars */}
                      <div className="flex justify-center mb-4">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-6 h-6 text-yellow-400 fill-current" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                        ))}
                      </div>
                      
                      <p className="text-xl md:text-2xl text-gray-700 mb-6 leading-relaxed">
                        "{testimonials[activeTestimonial].content}"
                      </p>
                      
                      <div className="flex items-center justify-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                          {testimonials[activeTestimonial].avatar}
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-gray-900">{testimonials[activeTestimonial].name}</div>
                          <div className="text-sm text-gray-500">{testimonials[activeTestimonial].role}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Carousel Dots */}
              <div className="flex justify-center mt-6 space-x-2">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveTestimonial(idx)}
                    className={`transition-all duration-300 rounded-full ${
                      activeTestimonial === idx 
                        ? "w-8 h-2 bg-gradient-to-r from-blue-600 to-indigo-600" 
                        : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-1">
            <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-center">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
              </div>
              
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Ready to Get Started?
                </h2>
                <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                  Join thousands of users who have transformed their complaint management process
                </p>
                <Link
                  to={user ? "/new" : "/signup"}
                  className="inline-flex items-center px-8 py-4 text-lg font-semibold text-blue-600 bg-white rounded-xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  {user ? "Submit Your First Complaint" : "Create Free Account"}
                  <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add custom CSS for animations */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}