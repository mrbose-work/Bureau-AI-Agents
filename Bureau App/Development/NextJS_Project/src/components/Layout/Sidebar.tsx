'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { id: 'home', icon: '🏠', label: 'Home', path: '/' },
    { id: 'inbox', icon: '📥', label: 'Inbox', path: '/inbox' },
    { id: 'work', icon: '📁', label: 'Work', path: '/work' },
    { divider: true },
    { id: 'clients', icon: '👥', label: 'Clients', path: '/clients' },
    { id: 'finance', icon: '💰', label: 'Finance', path: '/finance' },
    { id: 'growth', icon: '🚀', label: 'Growth', path: '/growth' },
    { spacer: true },
    { id: 'settings', icon: '⚙️', label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="sidebar">
      <div className="sbar-line"></div>
      
      {navItems.map((item, i) => {
        if (item.divider) return <div key={i} className="ndiv"></div>;
        if (item.spacer) return <div key={i} className="nsp"></div>;
        
        const isActive = pathname === item.path;
        
        return (
          <Link href={item.path!} key={item.id} style={{textDecoration: 'none'}}>
            <div className={`nav ${isActive ? 'on' : ''}`}>
              <div className="nicon">{item.icon}</div>
              <div className="nlbl">{item.label}</div>
              <div className="ntip">{item.label}</div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
