'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [briefingText, setBriefingText] = useState('');
  const fullBriefing = "Good morning, Mr. Bose. A busy day ahead. You have 2 urgent escalations pending, and Company A's project is due this Friday. Your cash flow looks excellent at ₹1.2L for the month. Shall we begin with the escalations?";

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < fullBriefing.length) {
        setBriefingText(fullBriefing.substring(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 30);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="screen on" id="s-home">
      <div className="briefing">
        <div className="bby">✦ BENJAMIN</div>
        <div className="btxt">{briefingText}</div>
        <button className="rpbtn">↺ Replay Briefing</button>
      </div>

      <div className="fcard">
        <div className="flbl">Today's Focus</div>
        <div className="ftxt">"Review Company A campaign assets — P1 · Due Friday"</div>
      </div>

      <div className="qa">
        <div className="qab"><span>✏️</span>New Task</div>
        <div className="qab"><span>📄</span>New Invoice</div>
        <div className="qab"><span>💬</span>New Message</div>
        <div className="qab"><span>📅</span>New Meeting</div>
        <div className="qab"><span>💸</span>Log Expense</div>
      </div>

      <div className="bento">
        {/* Bento Grid Items */}
        <div className="ecard bw">
          <div className="ecard-in">
            <div className="slabel">Inbox Summary</div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'}}>
              <div>
                <div className="snum cu">7</div>
                <div className="ssub">unread messages</div>
              </div>
              <div style={{textAlign: 'right'}}>
                <div style={{fontSize: '11px', color: 'var(--red)', marginBottom: '7px', fontWeight: 500}}>2 escalated 🔴</div>
              </div>
            </div>
          </div>
        </div>

        <div className="ecard">
          <div className="ecard-in">
            <div className="slabel">Bureau Health</div>
            <div className="hring"><div className="hnum">78</div></div>
            <div style={{fontSize: '10px', color: 'var(--green)', fontWeight: 500, textAlign: 'center'}}>Good standing</div>
          </div>
        </div>

        <div className="ecard">
          <div className="ecard-in">
            <div className="slabel">Today's Revenue</div>
            <div className="ctick">₹<span className="cu">45,000</span></div>
            <div style={{fontSize: '11px', color: 'var(--ts)', marginTop: '3px'}}>INV-003 received</div>
          </div>
        </div>

        {/* More cards can be extracted into individual components later */}
        <div className="ecard urg">
          <div className="ecard-in">
            <div className="slabel" style={{color: 'var(--red)'}}>Escalations 🔴</div>
            <div style={{fontFamily: 'var(--serif)', fontSize: '29px', color: 'var(--red)', fontWeight: 600}}>1</div>
            <div style={{fontSize: '11px', color: 'var(--ts)', marginTop: '5px'}}>Company A — urgent</div>
            <button className="bg bgsm" style={{marginTop: '9px', background: 'rgba(255,75,75,0.1)', borderColor: 'rgba(255,75,75,0.3)', color: 'var(--red)'}}>Handle Now</button>
          </div>
        </div>
      </div>
    </div>
  );
}
