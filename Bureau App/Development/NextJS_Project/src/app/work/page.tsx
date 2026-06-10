export default function Work() {
  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'10px'}}><div className="stitle">Work</div><button className="bg">+ New</button></div>
      <div className="ctx"><div className="cdot"></div><span>"3 active projects, Mr. Bose. Company A's campaign is pressing — 2 tasks overdue. Shall I reprioritise your afternoon?"</span></div>
      <div className="frow"><div className="fc on">Kanban</div><div className="fc">Timeline</div><div className="fc">List</div></div>
      <div className="kboard">
        <div className="kcol"><div className="kch"><span>Planning</span><span className="badge bgrey">1</span></div><div className="kc"><div className="kcc">Company B</div><div className="kcn">Brand Strategy</div><span className="badge bp2">P2</span><div className="pb"><div className="pbi" style={{width:'10%'}}></div></div><div style={{fontSize:'9px',color:'var(--td)',marginTop:'6px'}}>Start: Apr 1</div></div></div>
        <div className="kcol"><div className="kch"><span>Active</span><span className="badge bgold">2</span></div><div className="kc" style={{borderColor:'rgba(255,75,75,0.3)'}}><div className="kcc">Company A</div><div className="kcn">Digital Campaign</div><span className="badge bp1">P1</span><div className="pb"><div className="pbi" style={{width:'65%'}}></div></div><div style={{fontSize:'9px',color:'var(--red)',marginTop:'6px',fontWeight:500}}>Due: Friday ⚠</div></div><div className="kc"><div className="kcc">Company C</div><div className="kcn">Notion OS Build</div><span className="badge bp3">P3</span><div className="pb"><div className="pbi" style={{width:'35%'}}></div></div><div style={{fontSize:'9px',color:'var(--td)',marginTop:'6px'}}>Due: Apr 15</div></div></div>
        <div className="kcol"><div className="kch"><span>In Review</span><span className="badge bgrey">0</span></div><div className="ke"><span style={{fontSize:'10px',color:'var(--ob5)'}}>empty</span></div></div>
        <div className="kcol"><div className="kch"><span>On Hold</span><span className="badge bgrey">0</span></div><div className="ke"><span style={{fontSize:'10px',color:'var(--ob5)'}}>empty</span></div></div>
        <div className="kcol"><div className="kch"><span>Completed</span><span className="badge bgrey">1</span></div><div className="kc" style={{opacity:0.45}}><div className="kcc">Company A</div><div className="kcn">Social Media Setup</div><span className="badge bp2">P2</span><div className="pb"><div className="pbi pbi-g" style={{width:'100%'}}></div></div></div></div>
      </div>
      <div className="slbl">Today's Tasks</div>
      <div className="tlayout">
        <div>
          <div className="trow ov"><div className="tck"></div><div style={{flex:1,fontSize:'13px'}}>Finalise campaign assets <span className="badge bp1" style={{marginLeft:'6px'}}>P1</span></div><span style={{fontSize:'10px',color:'var(--red)'}}>Overdue</span></div>
          <div className="trow ov"><div className="tck"></div><div style={{flex:1,fontSize:'13px'}}>Send invoice INV-003 <span className="badge bp1" style={{marginLeft:'6px'}}>P1</span></div><span style={{fontSize:'10px',color:'var(--red)'}}>Overdue</span></div>
          <div className="trow"><div className="tck" style={{borderColor:'rgba(255,215,0,0.3)'}}></div><div style={{flex:1,fontSize:'13px'}}>Notion DB review <span className="badge bp2" style={{marginLeft:'6px'}}>P2</span></div><span style={{fontSize:'10px',color:'var(--ts)'}}>3:00 PM</span></div>
          <div className="trow"><div className="tck"></div><div style={{flex:1,fontSize:'13px'}}>Instagram reel brief <span className="badge bp3" style={{marginLeft:'6px'}}>P3</span></div><span style={{fontSize:'10px',color:'var(--ts)'}}>5:00 PM</span></div>
          <div className="trow dn"><div className="tck">✓</div><div style={{flex:1,fontSize:'13px'}}><span>Weekly report draft</span></div><span style={{fontSize:'10px',color:'var(--green)'}}>Done</span></div>
        </div>
        <div className="tan">
          <div style={{fontSize:'10px',color:'var(--ts)',textTransform:'uppercase',letterSpacing:'0.8px',marginBottom:'12px',fontWeight:600}}>Task Analytics</div>
          <div style={{marginBottom:'10px'}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:'4px'}}><span style={{fontSize:'11px',color:'var(--ts)'}}>Completion</span><span style={{fontSize:'11px',color:'var(--g0)',fontWeight:600}}>40%</span></div><div className="pb"><div className="pbi" style={{width:'40%'}}></div></div></div>
          <div className="g2" style={{gap:'7px',marginTop:'12px'}}>
            <div style={{background:'var(--ob3)',borderRadius:'8px',padding:'10px',textAlign:'center'}}><div style={{fontFamily:'var(--serif)',fontSize:'20px',color:'var(--red)',fontWeight:600}}>2</div><div style={{fontSize:'9px',color:'var(--ts)',marginTop:'2px'}}>Overdue</div></div>
            <div style={{background:'var(--ob3)',borderRadius:'8px',padding:'10px',textAlign:'center'}}><div style={{fontFamily:'var(--serif)',fontSize:'20px',color:'var(--amber)',fontWeight:600}}>2</div><div style={{fontSize:'9px',color:'var(--ts)',marginTop:'2px'}}>Pending</div></div>
            <div style={{background:'var(--ob3)',borderRadius:'8px',padding:'10px',textAlign:'center'}}><div style={{fontFamily:'var(--serif)',fontSize:'20px',color:'var(--green)',fontWeight:600}}>1</div><div style={{fontSize:'9px',color:'var(--ts)',marginTop:'2px'}}>Done</div></div>
            <div style={{background:'var(--ob3)',borderRadius:'8px',padding:'10px',textAlign:'center'}}><div style={{fontFamily:'var(--serif)',fontSize:'20px',color:'var(--g0)',fontWeight:600}}>4h</div><div style={{fontSize:'9px',color:'var(--ts)',marginTop:'2px'}}>Est. left</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
