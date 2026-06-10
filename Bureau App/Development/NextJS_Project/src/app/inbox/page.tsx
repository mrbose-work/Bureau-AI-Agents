export default function Inbox() {
  return (
    <div className="screen on" id="s-inbox">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
        <div className="stitle">Inbox</div>
        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
          <span style={{fontSize: '11px', color: 'var(--ts)'}}>Auto-reply</span>
          <div className="tog"></div>
        </div>
      </div>
      <div className="ctx">
        <div className="cdot"></div>
        <span>"7 messages await your attention, Mr. Bose. 2 are most urgent."</span>
      </div>
      <div className="frow">
        <div className="fc on">All <span style={{background: 'rgba(255,215,0,0.18)', borderRadius: '10px', padding: '1px 6px', marginLeft: '3px', fontSize: '9px'}}>7</span></div>
        <div className="fc">Unread <span style={{background: 'rgba(255,75,75,0.18)', borderRadius: '10px', padding: '1px 6px', marginLeft: '3px', fontSize: '9px', color: 'var(--red)'}}>5</span></div>
      </div>
      {/* Messages */}
      <div className="imsg urg">
        <div style={{display: 'flex', gap: '12px', alignItems: 'flex-start'}}>
          <div className="pi pw">W</div>
          <div style={{flex: 1}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2px'}}>
              <div className="iname">Company A · Priya Sharma</div>
              <div style={{display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0}}>
                <span className="badge bp1">P1</span>
                <span style={{fontSize: '10px', color: 'var(--red)', fontWeight: 600}}>🔴 URGENT</span>
                <span style={{fontSize: '10px', color: 'var(--td)'}}>9:41 AM</span>
              </div>
            </div>
            <div className="isub">Digital Campaign · Active · WhatsApp</div>
            <div className="ibody">"The client wants the campaign live by tomorrow morning — extremely urgent! We need to talk right away."</div>
            <div className="iact">
              <button className="bg bgsm">✦ AI Reply</button>
              <button className="bgh bgsm">Manual Reply</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
