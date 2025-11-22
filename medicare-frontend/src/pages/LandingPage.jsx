import React from 'react';
import { Heart, Calendar, Search, Shield, Clock, Users } from 'lucide-react';

export default function EnhancedLanding() {
  const [hoveredCard, setHoveredCard] = React.useState(null);

  const features = [
    {
      icon: <Calendar className="w-12 h-12" />,
      title: "Easy Booking",
      description: "Book appointments with your preferred doctors in just a few clicks",
      color: "#667eea"
    },
    {
      icon: <Search className="w-12 h-12" />,
      title: "Find Specialists",
      description: "Search and discover qualified doctors across various specializations",
      color: "#10b981"
    },
    {
      icon: <Clock className="w-12 h-12" />,
      title: "Flexible Scheduling",
      description: "Reschedule or cancel appointments hassle-free with automatic notifications",
      color: "#f59e0b"
    },
    {
      icon: <Shield className="w-12 h-12" />,
      title: "Secure & Private",
      description: "Your medical data is protected with enterprise-grade security",
      color: "#ef4444"
    },
    {
      icon: <Users className="w-12 h-12" />,
      title: "Patient Management",
      description: "Doctors can efficiently manage their schedules and patient information",
      color: "#8b5cf6"
    },
    {
      icon: <Heart className="w-12 h-12" />,
      title: "Healthcare Analytics",
      description: "Track appointments, completion rates, and healthcare insights",
      color: "#ec4899"
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff' }}>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated background elements */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '400px',
          height: '400px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          animation: 'float 6s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '20%',
          right: '15%',
          width: '300px',
          height: '300px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          animation: 'float 8s ease-in-out infinite reverse'
        }} />

        <div style={{
          textAlign: 'center',
          color: 'white',
          padding: '2rem',
          maxWidth: '1000px',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '2rem',
            background: 'rgba(255, 255, 255, 0.2)',
            padding: '0.75rem 2rem',
            borderRadius: '50px',
            backdropFilter: 'blur(10px)'
          }}>
            <Heart className="w-8 h-8" fill="currentColor" />
            <span style={{ fontSize: '1.5rem', fontWeight: '700' }}>Medicare</span>
          </div>

          <h1 style={{
            fontSize: '4rem',
            fontWeight: '800',
            marginBottom: '1.5rem',
            lineHeight: '1.1',
            textShadow: '0 2px 20px rgba(0,0,0,0.1)'
          }}>
            Your Health,<br />Our Priority
          </h1>

          <p style={{
            fontSize: '1.5rem',
            marginBottom: '3rem',
            opacity: 0.95,
            maxWidth: '700px',
            margin: '0 auto 3rem',
            lineHeight: '1.6'
          }}>
            Book, manage, and track your medical appointments with ease. 
            Connect with top doctors and take control of your healthcare journey.
          </p>

          <div style={{
            display: 'flex',
            gap: '1.5rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button style={{
              padding: '1.25rem 3rem',
              background: 'white',
              color: '#667eea',
              border: 'none',
              borderRadius: '50px',
              fontSize: '1.2rem',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              Get Started
              <span style={{ fontSize: '1.5rem' }}>→</span>
            </button>

            <button style={{
              padding: '1.25rem 3rem',
              background: 'transparent',
              color: 'white',
              border: '2px solid white',
              borderRadius: '50px',
              fontSize: '1.2rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s',
              backdropFilter: 'blur(10px)'
            }}>
              Learn More
            </button>
          </div>

          {/* Stats Section */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            marginTop: '5rem',
            background: 'rgba(255, 255, 255, 0.15)',
            padding: '2rem',
            borderRadius: '20px',
            backdropFilter: 'blur(10px)'
          }}>
            {[
              { value: '10,000+', label: 'Patients' },
              { value: '500+', label: 'Doctors' },
              { value: '50+', label: 'Clinics' },
              { value: '98%', label: 'Satisfaction' }
            ].map((stat, idx) => (
              <div key={idx} style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: '800',
                  marginBottom: '0.5rem'
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize: '1rem',
                  opacity: 0.9,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div style={{
        padding: '8rem 2rem',
        background: 'linear-gradient(to bottom, #ffffff, #f9fafb)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <h2 style={{
              fontSize: '3rem',
              fontWeight: '800',
              color: '#1f2937',
              marginBottom: '1rem'
            }}>
              Why Choose Medicare?
            </h2>
            <p style={{
              fontSize: '1.25rem',
              color: '#6b7280',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Everything you need to manage your healthcare appointments in one place
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '2rem'
          }}>
            {features.map((feature, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setHoveredCard(idx)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  background: 'white',
                  padding: '2.5rem',
                  borderRadius: '20px',
                  border: `2px solid ${hoveredCard === idx ? feature.color : '#e5e7eb'}`,
                  transition: 'all 0.3s',
                  transform: hoveredCard === idx ? 'translateY(-10px)' : 'translateY(0)',
                  boxShadow: hoveredCard === idx 
                    ? `0 20px 40px ${feature.color}33` 
                    : '0 4px 6px rgba(0,0,0,0.05)',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: `${feature.color}15`,
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.5rem',
                  color: feature.color,
                  transform: hoveredCard === idx ? 'scale(1.1) rotate(5deg)' : 'scale(1)',
                  transition: 'all 0.3s'
                }}>
                  {feature.icon}
                </div>
                
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#1f2937',
                  marginBottom: '1rem'
                }}>
                  {feature.title}
                </h3>
                
                <p style={{
                  color: '#6b7280',
                  lineHeight: '1.6',
                  fontSize: '1rem'
                }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '6rem 2rem',
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '3rem',
            fontWeight: '800',
            marginBottom: '1.5rem'
          }}>
            Ready to Get Started?
          </h2>
          <p style={{
            fontSize: '1.25rem',
            marginBottom: '3rem',
            opacity: 0.95
          }}>
            Join thousands of patients and doctors using Medicare for their healthcare needs
          </p>
          <button style={{
            padding: '1.25rem 3rem',
            background: 'white',
            color: '#667eea',
            border: 'none',
            borderRadius: '50px',
            fontSize: '1.2rem',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            transition: 'all 0.3s'
          }}>
            Create Your Account
          </button>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}