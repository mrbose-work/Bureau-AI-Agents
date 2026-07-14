export default function Finance() {
  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'10px'}}><div className="stitle">Finance</div><button className="bg">+ New Invoice</button></div>
      <div className="ctx"><div className="cdot"></div><span>"Revenue this month stands at ₹1.2L, Mr. Bose. One invoice remains outstanding. Expenses are well within bounds."</span></div>

      <div className="bento" style={{marginBottom:'14px'}}>
        <div className="ecard"><div className="ecard-in"><div className="slabel">Monthly Revenue</div><div className="snum">₹1.2L</div><div className="ssub">May 2025</div><div className="mc"><div className="mb" style={{height:'45%'}}></div><div className="mb" style={{height:'58%'}}></div><div className="mb" style={{height:'52%'}}></div><div className="mb hi" style={{height:'76%'}}></div><div className="mb hi" style={{height:'88%'}}></div><div className="mb" style={{height:'65%'}}></div><div className="mb top" style={{height:'100%'}}></div></div></div></div>
        <div className="ecard"><div className="ecard-in"><div className="slabel">Expenses</div><div style={{fontFamily:'var(--serif)',fontSize:'29px',color:'var(--red)',fontWeight:600,lineHeight:1}}>₹18,500</div><div className="ssub">this month</div><div className="mc"><div className="mb" style={{height:'30%',background:'rgba(255,75,75,0.2)'}}></div><div className="mb" style={{height:'45%',background:'rgba(255,75,75,0.3)'}}></div><div className="mb" style={{height:'38%',background:'rgba(255,75,75,0.25)'}}></div><div className="mb" style={{height:'55%',background:'rgba(255,75,75,0.35)'}}></div><div className="mb" style={{height:'42%',background:'rgba(255,75,75,0.3)'}}></div><div className="mb" style={{height:'50%',background:'rgba(255,75,75,0.35)'}}></div><div className="mb" style={{height:'60%',background:'rgba(255,75,75,0.4)'}}></div></div></div></div>
        <div className="ecard"><div className="ecard-in"><div className="slabel">Net Profit</div><div style={{fontFamily:'var(--serif)',fontSize:'29px',color:'var(--green)',fontWeight:600,lineHeight:1}}>₹1.01L</div><div className="ssub">84.6% margin</div><div className="pb" style={{marginTop:'12px'}}><div className="pbi pbi-g" style={{width:'84.6%'}}></div></div></div></div>
      </div>

      <div className="slbl">Recent Invoices</div>
      <div className="gcard" style={{marginBottom:'8px'}}>
        <div className="ivrow"><div><div style={{fontSize:'13px',fontWeight:600}}>INV-003</div><div style={{fontSize:'11px',color:'var(--ts)'}}>Company A · Digital Campaign</div></div><div style={{textAlign:'right'}}><div style={{fontSize:'13px',color:'var(--green)',fontWeight:600}}>₹45,000</div><span className="badge bgreen">Paid</span></div></div>
        <div className="ivrow"><div><div style={{fontSize:'13px',fontWeight:600}}>INV-002</div><div style={{fontSize:'11px',color:'var(--ts)'}}>Company B · Brand Strategy</div></div><div style={{textAlign:'right'}}><div style={{fontSize:'13px',color:'var(--amber)',fontWeight:600}}>₹30,000</div><span className="badge bamber">Pending</span></div></div>
        <div className="ivrow"><div><div style={{fontSize:'13px',fontWeight:600}}>INV-001</div><div style={{fontSize:'11px',color:'var(--ts)'}}>Company C · Notion OS</div></div><div style={{textAlign:'right'}}><div style={{fontSize:'13px',color:'var(--green)',fontWeight:600}}>₹25,000</div><span className="badge bgreen">Paid</span></div></div>
      </div>
    </div>
  );
}
