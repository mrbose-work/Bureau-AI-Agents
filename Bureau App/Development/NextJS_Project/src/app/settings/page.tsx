'use client';

export default function Settings() {
  return (
    <div>
      <div className="stitle" style={{marginBottom:'16px'}}>Settings</div>

      <div className="gcard" style={{marginBottom:'14px'}}>
        <div style={{fontSize:'10px',color:'var(--ts)',textTransform:'uppercase',letterSpacing:'0.8px',marginBottom:'12px',fontWeight:600}}>Profile</div>
        <div className="srow"><div><div style={{fontSize:'13px',fontWeight:600}}>Ronit Bose</div><div style={{fontSize:'11px',color:'var(--ts)'}}>Founder, Bureau</div></div><button className="bgh bgsm">Edit</button></div>
        <div className="srow"><div style={{fontSize:'12px',color:'var(--ts)'}}>Email</div><div style={{fontSize:'12px'}}>ronit@bureau.co</div></div>
        <div className="srow"><div style={{fontSize:'12px',color:'var(--ts)'}}>Location</div><div style={{fontSize:'12px'}}>Kolkata, India</div></div>
      </div>

      <div className="gcard" style={{marginBottom:'14px'}}>
        <div style={{fontSize:'10px',color:'var(--ts)',textTransform:'uppercase',letterSpacing:'0.8px',marginBottom:'12px',fontWeight:600}}>Benjamin AI</div>
        <div className="srow"><div style={{fontSize:'12px'}}>Voice Responses</div><div className="tog on" onClick={(e) => e.currentTarget.classList.toggle('on')}></div></div>
        <div className="srow"><div style={{fontSize:'12px'}}>Morning Briefing</div><div className="tog on" onClick={(e) => e.currentTarget.classList.toggle('on')}></div></div>
        <div className="srow"><div style={{fontSize:'12px'}}>Auto-Draft Replies</div><div className="tog" onClick={(e) => e.currentTarget.classList.toggle('on')}></div></div>
        <div className="srow"><div style={{fontSize:'12px'}}>Proactive Insights</div><div className="tog on" onClick={(e) => e.currentTarget.classList.toggle('on')}></div></div>
      </div>

      <div className="gcard" style={{marginBottom:'14px'}}>
        <div style={{fontSize:'10px',color:'var(--ts)',textTransform:'uppercase',letterSpacing:'0.8px',marginBottom:'12px',fontWeight:600}}>Integrations</div>
        <div className="srow"><div style={{display:'flex',alignItems:'center',gap:'8px'}}><div className="acico" style={{background:'rgba(255,215,0,0.1)',color:'var(--g0)'}}>N</div><div><div style={{fontSize:'12px',fontWeight:500}}>Notion</div><div style={{fontSize:'10px',color:'var(--green)'}}>Connected</div></div></div><button className="bgh bgsm">Configure</button></div>
        <div className="srow"><div style={{display:'flex',alignItems:'center',gap:'8px'}}><div className="acico" style={{background:'rgba(234,67,53,0.1)',color:'#EA4335'}}>G</div><div><div style={{fontSize:'12px',fontWeight:500}}>Gmail</div><div style={{fontSize:'10px',color:'var(--ts)'}}>Not connected</div></div></div><button className="bg bgsm">Connect</button></div>
        <div className="srow"><div style={{display:'flex',alignItems:'center',gap:'8px'}}><div className="acico" style={{background:'rgba(37,211,102,0.1)',color:'#25D366'}}>W</div><div><div style={{fontSize:'12px',fontWeight:500}}>WhatsApp</div><div style={{fontSize:'10px',color:'var(--ts)'}}>Not connected</div></div></div><button className="bg bgsm">Connect</button></div>
      </div>

      <div className="gcard">
        <div style={{fontSize:'10px',color:'var(--ts)',textTransform:'uppercase',letterSpacing:'0.8px',marginBottom:'12px',fontWeight:600}}>Appearance</div>
        <div className="srow"><div style={{fontSize:'12px'}}>Dark Mode</div><div className="tog on" onClick={(e) => e.currentTarget.classList.toggle('on')}></div></div>
        <div className="srow"><div style={{fontSize:'12px'}}>Gold Accent Glow</div><div className="tog on" onClick={(e) => e.currentTarget.classList.toggle('on')}></div></div>
      </div>

      <div className="vtag">THE BUREAU · v4.0 · Built in Kolkata</div>
    </div>
  );
}
