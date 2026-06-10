'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Topbar() {
  const [mode, setMode] = useState<'biz' | 'cli'>('biz');
  const [text, setText] = useState('');
  const brand = "THE BUREAU";
  
  // Typewriter effect for brand
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < brand.length) {
        setText(brand.substring(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 150);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="topbar">
      <div className="brand">{text}<span style={{animation: 'cp 1s infinite'}}>_</span></div>
      
      <div className="spill">
        <span>🔍</span>
        <input 
          type="text" 
          placeholder="Search The Bureau..." 
          style={{background: 'transparent', border: 'none', color: 'var(--tw)', outline: 'none', width: '100%'}} 
        />
      </div>
      
      <div className="wchip">
        <span>⛅</span>
        <span>Kolkata</span>
        <span className="tmp">28°C</span>
      </div>
      
      <div className="mswitch">
        <button 
          className={`mbtn ${mode === 'biz' ? 'on' : ''}`} 
          onClick={() => setMode('biz')}
        >
          My Business
        </button>
        <button 
          className={`mbtn ${mode === 'cli' ? 'on' : ''}`} 
          onClick={() => setMode('cli')}
        >
          Client Work
        </button>
      </div>
      
      <Link href="/settings" style={{textDecoration: 'none'}}>
        <div className="rb">
          RB
          <div className="rdot"></div>
        </div>
      </Link>
      
      <div className="tbar-line"></div>
    </div>
  );
}
