import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Info, AlertCircle, Calendar, Clock } from 'lucide-react';

export default function NotificationSystem() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'appointment',
      title: 'Upcoming Appointment',
      message: 'Your appointment with Dr. Smith is tomorrow at 10:00 AM',
      time: '2 hours ago',
      read: false,
      icon: <Calendar className="w-5 h-5" />
    },
    {
      id: 2,
      type: 'success',
      title: 'Appointment Confirmed',
      message: 'Your appointment has been successfully booked',
      time: '1 day ago',
      read: false,
      icon: <Check className="w-5 h-5" />
    },
    {
      id: 3,
      type: 'info',
      title: 'New Doctor Available',
      message: 'Dr. Johnson is now accepting appointments',
      time: '2 days ago',
      read: true,
      icon: <Info className="w-5 h-5" />
    },
    {
      id: 4,
      type: 'reminder',
      title: 'Appointment Reminder',
      message: 'Don\'t forget your appointment in 3 hours',
      time: '5 hours ago',
      read: false,
      icon: <Clock className="w-5 h-5" />
    }
  ]);

  const [showDropdown, setShowDropdown] = useState(false);
  const [filter, setFilter] = useState('all'); // all, unread, read

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    if (window.confirm('Clear all notifications?')) {
      setNotifications([]);
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'appointment': return '#667eea';
      case 'success': return '#10b981';
      case 'info': return '#3b82f6';
      case 'reminder': return '#f59e0b';
      case 'alert': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  return (
    <div style={{ position: 'relative' }}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          position: 'relative',
          background: 'white',
          border: '2px solid #e5e7eb',
          borderRadius: '12px',
          padding: '0.75rem',
          cursor: 'pointer',
          transition: 'all 0.3s',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          boxShadow: showDropdown ? '0 4px 12px rgba(102, 126, 234, 0.2)' : '0 2px 4px rgba(0,0,0,0.05)'
        }}
      >
        <Bell
          className="w-6 h-6"
          style={{ color: showDropdown ? '#667eea' : '#6b7280' }}
        />
        
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            background: '#ef4444',
            color: 'white',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: '700',
            border: '2px solid white',
            animation: 'pulse 2s infinite'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setShowDropdown(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 40
            }}
          />

          {/* Dropdown Panel */}
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 0.5rem)',
            right: 0,
            width: '420px',
            maxWidth: '95vw',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            zIndex: 50,
            overflow: 'hidden',
            border: '1px solid #e5e7eb'
          }}>
            {/* Header */}
            <div style={{
              padding: '1.25rem',
              borderBottom: '1px solid #e5e7eb',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem'
              }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  margin: 0
                }}>
                  Notifications
                </h3>
                <button
                  onClick={() => setShowDropdown(false)}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.5rem',
                    cursor: 'pointer',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Filter Tabs */}
              <div style={{
                display: 'flex',
                gap: '0.5rem'
              }}>
                {['all', 'unread', 'read'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: filter === f ? 'white' : 'rgba(255,255,255,0.2)',
                      color: filter === f ? '#667eea' : 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      textTransform: 'capitalize',
                      transition: 'all 0.3s'
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions Bar */}
            {notifications.length > 0 && (
              <div style={{
                padding: '0.75rem 1.25rem',
                background: '#f9fafb',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <button
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: unreadCount === 0 ? '#9ca3af' : '#667eea',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: unreadCount === 0 ? 'not-allowed' : 'pointer',
                    padding: '0.25rem 0.5rem'
                  }}
                >
                  Mark all as read
                </button>
                <button
                  onClick={clearAll}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ef4444',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    padding: '0.25rem 0.5rem'
                  }}
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Notifications List */}
            <div style={{
              maxHeight: '400px',
              overflowY: 'auto'
            }}>
              {filteredNotifications.length === 0 ? (
                <div style={{
                  padding: '3rem',
                  textAlign: 'center',
                  color: '#6b7280'
                }}>
                  <Bell className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p style={{ fontSize: '0.95rem' }}>
                    {filter === 'all' 
                      ? 'No notifications yet'
                      : filter === 'unread'
                      ? 'No unread notifications'
                      : 'No read notifications'}
                  </p>
                </div>
              ) : (
                filteredNotifications.map(notification => (
                  <div
                    key={notification.id}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                    style={{
                      padding: '1rem 1.25rem',
                      borderBottom: '1px solid #e5e7eb',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      background: notification.read ? 'white' : '#f0f9ff',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f9fafb';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = notification.read ? 'white' : '#f0f9ff';
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      gap: '1rem'
                    }}>
                      {/* Icon */}
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        background: `${getNotificationColor(notification.type)}15`,
                        color: getNotificationColor(notification.type),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {notification.icon}
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'start',
                          marginBottom: '0.25rem'
                        }}>
                          <h4 style={{
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            color: '#1f2937',
                            margin: 0
                          }}>
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: '#667eea',
                              flexShrink: 0,
                              marginLeft: '0.5rem',
                              marginTop: '0.25rem'
                            }} />
                          )}
                        </div>
                        <p style={{
                          fontSize: '0.875rem',
                          color: '#6b7280',
                          margin: '0 0 0.5rem 0',
                          lineHeight: '1.4'
                        }}>
                          {notification.message}
                        </p>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <span style={{
                            fontSize: '0.75rem',
                            color: '#9ca3af'
                          }}>
                            {notification.time}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#9ca3af',
                              cursor: 'pointer',
                              padding: '0.25rem',
                              borderRadius: '4px',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = '#ef4444';
                              e.currentTarget.style.background = '#fee2e2';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = '#9ca3af';
                              e.currentTarget.style.background = 'transparent';
                            }}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div style={{
                padding: '1rem',
                background: '#f9fafb',
                borderTop: '1px solid #e5e7eb',
                textAlign: 'center'
              }}>
                <a
                  href="/notifications"
                  style={{
                    color: '#667eea',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    textDecoration: 'none'
                  }}
                >
                  View All Notifications →
                </a>
              </div>
            )}
          </div>
        </>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  );
}