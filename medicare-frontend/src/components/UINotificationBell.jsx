import React, { useEffect, useRef, useState } from 'react';
import { useUINotifications } from '../context/UINotifications.jsx';

export default function UINotificationBell() {
  const { items, markAllRead, removeNotification } = useUINotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const unreadCount = items.filter((i) => i.unread).length;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="bell" ref={ref}>
      <button className="btn ghost" onClick={() => setOpen((v) => !v)} aria-label="Notifications">
        🔔 Notifications
      </button>
      {unreadCount > 0 && <span className="dot" />}
      {open && (
        <div className="panel">
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <strong>Notifications</strong>
            <button className="btn ghost" onClick={markAllRead}>Mark all read</button>
          </div>
          <div className="stack" style={{marginTop:12}}>
            {items.length === 0 && <div className="subtitle">No notifications yet</div>}
            {items.map((n) => (
              <div key={n.id} className={"notif" + (n.unread ? " unread" : "")}> 
                <div style={{display:'flex', justifyContent:'space-between'}}>
                  <div>
                    <div style={{fontWeight:600}}>{n.title}</div>
                    <div className="subtitle">{n.message}</div>
                  </div>
                  <button className="btn ghost" onClick={() => removeNotification(n.id)}>✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}