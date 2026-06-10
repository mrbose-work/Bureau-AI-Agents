export default function Growth() {
  return (
    <div>
      <div className="stitle" style={{marginBottom:'10px'}}>Growth Hub</div>
      <div className="ctx"><div className="cdot"></div><span>"Social engagement is up 23% this week, Mr. Bose. Instagram is outperforming all other channels. An excellent trajectory."</span></div>

      <div className="bento" style={{marginBottom:'14px'}}>
        <div className="ecard"><div className="ecard-in"><div className="slabel">Instagram</div><div className="snum">1,247</div><div className="ssub">followers</div><div style={{fontSize:'11px',color:'var(--green)',marginTop:'5px',fontWeight:500}}>↑ 12% this week</div><div className="mc"><div className="mb" style={{height:'48%'}}></div><div className="mb" style={{height:'60%'}}></div><div className="mb" style={{height:'56%'}}></div><div className="mb hi" style={{height:'75%'}}></div><div className="mb hi" style={{height:'90%'}}></div><div className="mb" style={{height:'70%'}}></div><div className="mb top" style={{height:'100%'}}></div></div></div></div>
        <div className="ecard"><div className="ecard-in"><div className="slabel">LinkedIn</div><div className="snum">483</div><div className="ssub">connections</div><div style={{fontSize:'11px',color:'var(--green)',marginTop:'5px',fontWeight:500}}>↑ 8% this week</div><div className="mc"><div className="mb" style={{height:'55%'}}></div><div className="mb" style={{height:'62%'}}></div><div className="mb" style={{height:'58%'}}></div><div className="mb hi" style={{height:'70%'}}></div><div className="mb hi" style={{height:'82%'}}></div><div className="mb" style={{height:'75%'}}></div><div className="mb top" style={{height:'100%'}}></div></div></div></div>
        <div className="ecard"><div className="ecard-in"><div className="slabel">Website</div><div className="snum">312</div><div className="ssub">visits this week</div><div style={{fontSize:'11px',color:'var(--green)',marginTop:'5px',fontWeight:500}}>↑ 23% this week</div><div className="mc"><div className="mb" style={{height:'40%'}}></div><div className="mb" style={{height:'52%'}}></div><div className="mb" style={{height:'48%'}}></div><div className="mb hi" style={{height:'68%'}}></div><div className="mb hi" style={{height:'85%'}}></div><div className="mb" style={{height:'72%'}}></div><div className="mb top" style={{height:'100%'}}></div></div></div></div>
      </div>

      <div className="slbl">Content Performance</div>
      <div className="gcard">
        <div className="ivrow"><div><div style={{fontSize:'13px',fontWeight:600}}>Instagram Reel — "Bureau Systems Intro"</div><div style={{fontSize:'11px',color:'var(--ts)'}}>Posted 2 days ago</div></div><div style={{textAlign:'right'}}><div style={{fontSize:'13px',color:'var(--g0)',fontWeight:600}}>4,200 views</div><span className="badge bgold">Top Post</span></div></div>
        <div className="ivrow"><div><div style={{fontSize:'13px',fontWeight:600}}>LinkedIn Article — "Why Notion?"</div><div style={{fontSize:'11px',color:'var(--ts)'}}>Posted 5 days ago</div></div><div style={{textAlign:'right'}}><div style={{fontSize:'13px',color:'var(--g0)',fontWeight:600}}>890 impressions</div><span className="badge bgrey">Steady</span></div></div>
        <div className="ivrow"><div><div style={{fontSize:'13px',fontWeight:600}}>Instagram Story — Client Testimonial</div><div style={{fontSize:'11px',color:'var(--ts)'}}>Posted 1 week ago</div></div><div style={{textAlign:'right'}}><div style={{fontSize:'13px',color:'var(--g0)',fontWeight:600}}>1,100 views</div><span className="badge bgreen">Growing</span></div></div>
      </div>
    </div>
  );
}
