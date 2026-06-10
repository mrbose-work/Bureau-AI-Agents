const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType,
  VerticalAlign, LevelFormat } = require('docx');
const fs = require('fs');

// ── BRAND COLOURS ──────────────────────────────────────────────────────────────
const NAVY    = '1C2B3A';
const GOLD    = 'C8912A';
const IVORY   = 'FAF3E0';
const W_IVORY = 'F5EDD8';
const CHARCOAL= '333333';
const SLATE   = '5C6B7A';
const WHITE   = 'FFFFFF';
// A4 with ~19mm margins each side
const CW = 9200;
const BULL = 'jcc-bullets';

// ── PRIMITIVE HELPERS ──────────────────────────────────────────────────────────
const sp   = (b=0,a=100) => ({ spacing:{ before:b, after:a } });
const tr   = (text, opts={}) => new TextRun({ text, font:'Arial', size:20, color:CHARCOAL, ...opts });
const pb   = () => new Paragraph({ pageBreakBefore:true, children:[tr('')] });
const spacer = (n=100) => new Paragraph({ spacing:{before:0,after:n}, children:[] });

const rule = (spB=80,spA=160) => new Paragraph({
  border:{ bottom:{ style:BorderStyle.SINGLE, size:8, color:GOLD, space:1 } },
  spacing:{before:spB,after:spA}, children:[]
});

// ── TYPE STYLES ────────────────────────────────────────────────────────────────
const secLabel = (num, title) => new Paragraph({
  ...sp(0,60),
  children:[
    tr(`SECTION ${num}  `, {size:16, bold:true, color:GOLD, allCaps:true}),
    tr('— ', {size:16, color:SLATE}),
    tr(title, {size:16, italics:true, color:SLATE})
  ]
});

const secHead  = t => new Paragraph({ ...sp(60,120), children:[tr(t,{size:36,bold:true,color:NAVY})] });
const subHead  = t => new Paragraph({ ...sp(200,80),  children:[tr(t,{size:22,bold:true,color:GOLD})] });
const h3       = t => new Paragraph({ ...sp(160,60),  children:[tr(t,{size:20,bold:true,color:NAVY})] });
const body     = (t,spA=100) => new Paragraph({ ...sp(0,spA), children:[tr(t)] });
const ibody    = (t,spA=100) => new Paragraph({ ...sp(0,spA), children:[tr(t,{italics:true})] });
const goldLbl  = t => new Paragraph({ ...sp(40,30),  children:[tr(t,{size:15,bold:true,color:GOLD,allCaps:true})] });
const bItem    = t => new Paragraph({
  numbering:{ reference:BULL, level:0 },
  spacing:{before:0,after:60},
  children:[tr(t)]
});

// ── TABLE HELPERS ──────────────────────────────────────────────────────────────
const GB = (c=GOLD,sz=6) => { const b={style:BorderStyle.SINGLE,size:sz,color:c}; return {top:b,bottom:b,left:b,right:b}; };
const NB = () => { const b={style:BorderStyle.NONE,size:0,color:'FFFFFF'}; return {top:b,bottom:b,left:b,right:b}; };

const mkCell = (children,w,fill=IVORY,borders=null,vAlign=VerticalAlign.TOP) =>
  new TableCell({ borders:borders||GB(), width:{size:w,type:WidthType.DXA},
    shading:{fill,type:ShadingType.CLEAR},
    margins:{top:100,bottom:100,left:160,right:160},
    verticalAlign:vAlign, children });

const navyCell = (children,w) =>
  new TableCell({ borders:NB(), width:{size:w,type:WidthType.DXA},
    shading:{fill:NAVY,type:ShadingType.CLEAR},
    margins:{top:180,bottom:180,left:220,right:220}, children });

// Single-column bordered box
const box1 = (ps, fill=IVORY) => new Table({
  width:{size:CW,type:WidthType.DXA}, columnWidths:[CW],
  rows:[ new TableRow({ children:[ mkCell(ps,CW,fill) ] }) ]
});

// Two-column table
const box2 = (lps,rps,lw=null,fill=IVORY) => {
  const lW = lw || Math.floor(CW/2); const rW = CW-lW;
  return new Table({
    width:{size:CW,type:WidthType.DXA}, columnWidths:[lW,rW],
    rows:[ new TableRow({ children:[ mkCell(lps,lW,fill), mkCell(rps,rW,fill) ] }) ]
  });
};

// N-column equal table
const boxN = (cols,fill=IVORY) => {
  const n=cols.length; const cw=Math.floor(CW/n);
  const widths = cols.map((_,i) => i<n-1 ? cw : CW-cw*(n-1));
  return new Table({
    width:{size:CW,type:WidthType.DXA}, columnWidths:widths,
    rows:[ new TableRow({ children: cols.map((ps,i)=>mkCell(ps,widths[i],fill)) }) ]
  });
};

// Header-row table (navy header + ivory rows)
const dataTable = (headers, rows, colWidths) => {
  const hRow = new TableRow({ children: headers.map((h,i) =>
    new TableCell({ borders:GB(GOLD,6), width:{size:colWidths[i],type:WidthType.DXA},
      shading:{fill:NAVY,type:ShadingType.CLEAR},
      margins:{top:80,bottom:80,left:140,right:140},
      children:[new Paragraph({...sp(0,0), children:[tr(h,{size:17,bold:true,color:WHITE})]})]
    })
  )});
  const dRows = rows.map(row => new TableRow({ children: row.map((cell,i) =>
    new TableCell({ borders:GB('CCCCCC',4), width:{size:colWidths[i],type:WidthType.DXA},
      shading:{fill: i===0 ? W_IVORY : IVORY, type:ShadingType.CLEAR},
      margins:{top:80,bottom:80,left:140,right:140},
      children:[new Paragraph({...sp(0,0), children:[tr(cell, i===0 ? {bold:true,color:NAVY} : {italics:cell.startsWith('*')})]}) ]
    })
  )}));
  return new Table({ width:{size:CW,type:WidthType.DXA}, columnWidths:colWidths, rows:[hRow,...dRows] });
};

// Project metadata strip (navy left / warm ivory right)
const projTag = (year,type,client,role) => {
  const lW=Math.floor(CW*0.32); const rW=CW-lW;
  return new Table({
    width:{size:CW,type:WidthType.DXA}, columnWidths:[lW,rW],
    rows:[new TableRow({ children:[
      new TableCell({ borders:GB(GOLD,4), width:{size:lW,type:WidthType.DXA},
        shading:{fill:NAVY,type:ShadingType.CLEAR},
        margins:{top:100,bottom:100,left:160,right:160},
        children:[
          new Paragraph({...sp(0,20),children:[tr(year,{size:26,bold:true,color:GOLD})]}),
          new Paragraph({...sp(0,0), children:[tr(type,{size:15,color:WHITE})]}),
        ]}),
      new TableCell({ borders:GB('CCCCCC',4), width:{size:rW,type:WidthType.DXA},
        shading:{fill:W_IVORY,type:ShadingType.CLEAR},
        margins:{top:100,bottom:100,left:160,right:160},
        children:[
          new Paragraph({...sp(0,20),children:[tr('CLIENT  ',{size:14,bold:true,color:GOLD}), tr(client,{size:14})]}),
          new Paragraph({...sp(0,0), children:[tr('ROLE  ',{size:14,bold:true,color:GOLD}),   tr(role,{size:14})]}),
        ]}),
    ]})]
  });
};


// ══════════════════════════════════════════════════════════════════════════════
// SECTIONS
// ══════════════════════════════════════════════════════════════════════════════

function cover() {
  return [
    box1([
      new Paragraph({...sp(0,60), children:[tr('J.C. CHAKRABORTY & SONS',{size:30,bold:true,color:WHITE})]}),
      new Paragraph({...sp(0,60), children:[tr('Architects  ·  Structural Engineers  ·  Civil Contractors',{size:18,italics:true,color:GOLD})]}),
      new Paragraph({...sp(0,220), children:[tr('Est. 1954  ·  Temple Chambers, Kolkata',{size:16,italics:true,color:'AAAAAA'})]}),
      new Paragraph({ border:{bottom:{style:BorderStyle.SINGLE,size:6,color:GOLD,space:1}}, ...sp(0,120), children:[] }),
      new Paragraph({...sp(0,50),  children:[tr('BRAND STORY &',         {size:52,bold:true,color:WHITE})]}),
      new Paragraph({...sp(0,100), children:[tr('MASTER CONTENT GUIDE',  {size:52,bold:true,color:WHITE})]}),
      new Paragraph({...sp(0,200), children:[tr('The Cornerstone Reference for All Brand, Marketing & Digital Content',{size:18,italics:true,color:GOLD})]}),
      new Paragraph({...sp(180,50),children:[tr('Prepared by  Ronit Bose  ·  Digital Product Manager',{size:16,color:'AAAAAA'})]}),
      new Paragraph({...sp(0,50),  children:[tr('mr.bosework@gmail.com  ·  +91 9330568258  ·  May 2026',{size:16,color:'AAAAAA'})]}),
      new Paragraph({...sp(60,0),  children:[tr('Confidential — for internal use by J.C. Chakraborty & Sons and their designated project team',{size:14,italics:true,color:'888888'})]}),
    ], NAVY),
    spacer(160),
    boxN([
      [new Paragraph({alignment:AlignmentType.CENTER,...sp(60,20),children:[tr('1954',{size:38,bold:true,color:NAVY})]}),
       new Paragraph({alignment:AlignmentType.CENTER,...sp(0,100),children:[tr('Year Established',{size:15,color:SLATE})]})],
      [new Paragraph({alignment:AlignmentType.CENTER,...sp(60,20),children:[tr('700+',{size:38,bold:true,color:NAVY})]}),
       new Paragraph({alignment:AlignmentType.CENTER,...sp(0,100),children:[tr('Projects Delivered',{size:15,color:SLATE})]})],
      [new Paragraph({alignment:AlignmentType.CENTER,...sp(60,20),children:[tr('3',{size:38,bold:true,color:NAVY})]}),
       new Paragraph({alignment:AlignmentType.CENTER,...sp(0,100),children:[tr('Generations of Legacy',{size:15,color:SLATE})]})],
      [new Paragraph({alignment:AlignmentType.CENTER,...sp(60,20),children:[tr('5.0 / 5.0',{size:38,bold:true,color:NAVY})]}),
       new Paragraph({alignment:AlignmentType.CENTER,...sp(0,100),children:[tr('Client Rating',{size:15,color:SLATE})]})],
    ], W_IVORY),
  ];
}

function sec00() {
  return [
    pb(),
    secLabel('00','How to Use This Document'), spacer(80),
    secHead('How to Use This Document'), rule(),
    body('This document is the single source of truth for all brand, marketing, and digital content produced for J.C. Chakraborty & Sons. Every website page, PPT slide, social media post, proposal, or printed material should draw from the language, tone, and stories contained here.', 80),
    body('It is a living document. As we collect more project photographs, client stories, and milestones, this guide should be updated accordingly.'),
    spacer(120),
    box1([
      new Paragraph({...sp(0,60), children:[tr('This document covers:',{bold:true,color:NAVY})]}),
      bItem('Brand Statement, Tagline & Messaging Hierarchy'),
      bItem('Brand Voice & Personality Guide'),
      bItem('The Heritage Story (long form — for About Us, PPT, press)'),
      bItem('Five Brand Pillars'),
      bItem('Mission & Vision Statements (philosophical, polished)'),
      bItem('Website Page Content (all pages, ready to use)'),
      bItem('Six Hero Project Descriptions'),
      bItem('Boilerplate Text (for proposals, RFPs, email signatures)'),
      bItem('Social Media Bios & Post Starters'),
    ], IVORY),
  ];
}

function sec01() {
  const lW=Math.floor(CW*0.44); const rW=CW-lW;
  return [
    pb(),
    secLabel('01','Brand Statement & Taglines'), spacer(80),
    secHead('Brand Statement & Taglines'), rule(),
    subHead('The Core Brand Statement'),
    body('This is the definitive one or two-sentence description of who J.C. Chakraborty & Sons is. Use it wherever a full introduction is needed — on the PPT opening slide, the website hero, or the top of any proposal.'),
    spacer(100),
    box1([
      ibody('Since 1954, J.C. Chakraborty & Sons has practiced one discipline above all others: permanence. Every structure we design, every project we deliver, is an act of conviction — that what is built well lasts.'),
    ], IVORY),
    spacer(120),
    subHead('Primary Tagline'),
    box1([
      new Paragraph({alignment:AlignmentType.CENTER,...sp(60,40), children:[tr('Permanence, by Design.',{size:36,bold:true,color:NAVY,italics:true})]}),
      new Paragraph({alignment:AlignmentType.CENTER,...sp(0,60), children:[tr('— Primary tagline for all brand touchpoints',{size:16,italics:true,color:SLATE})]}),
    ], W_IVORY),
    spacer(100),
    ibody('Three words. One truth. A statement of intent that is as much philosophy as it is promise — that everything J.C. Chakraborty & Sons creates is designed not merely to stand, but to last. Permanence is the standard. Design is the method.'),
    spacer(120),
    subHead('Alternate Taglines'),
    body('Use these contextually — in campaign headlines, section intros, or printed materials:'),
    spacer(80),
    dataTable(
      ['Tagline','Best Used For'],
      [
        ['Seven Decades. One Standard.  ★','Client-preferred — social media, slide openers, email banners, pitch decks'],
        ["Yesterday's Tradition. Today's Precision. Tomorrow's Vision.",'Heritage narrative, website About page, long-form content'],
        ['Where Legacy Meets Design.','Institutional pitches, school/hospital/government projects'],
        ['Building India Since 1954.','Geographic pride, government and civic tenders'],
        ['700 Projects. One Promise.','Portfolio showcases, PPT covers, credentials packs'],
        ['Built on Trust. Designed for Tomorrow.','Legacy alternate — proposals, email signatures, formal letters'],
      ],
      [lW, rW]
    ),
  ];
}

function sec02() {
  const lW=Math.floor(CW*0.28); const rW=CW-lW;
  return [
    pb(),
    secLabel('02','Brand Voice & Personality'), spacer(80),
    secHead('Brand Voice & Personality'), rule(),
    ibody('J.C. Chakraborty & Sons speaks with the quiet confidence of a firm that has nothing to prove and the warmth of a family that genuinely cares about the spaces it builds. The voice is never boastful, never cold, and never vague. It is the voice of someone who has built schools, temples, stadiums, and homes — and knows exactly what that means to the people inside.'),
    spacer(120),
    subHead('The Four Voice Pillars'),
    dataTable(
      ['Pillar','What it means'],
      [
        ['Warm & Legacy-focused','Write as if speaking to a client you have known for decades. Reference history with pride, not nostalgia. Never cold or corporate.'],
        ['Authoritative & Confident','Speak from expertise. Avoid hedging words like "we try to" or "we hope to". Use "we deliver", "we build", "we ensure". Earned confidence, not arrogance.'],
        ['Modern & Progressive','This is a 70-year-old firm with the mind of a modern practice. Embrace technology, sustainability, and forward thinking. Never sound dated or stuck in the past.'],
        ['Technical & Precise','When speaking to engineers, institutions, or developers, be specific. Use the right terminology. Avoid vague generalities. Clients trust precise language.'],
      ],
      [lW, rW]
    ),
    spacer(120),
    subHead('The Brand Philosophy — Substance Over Surface'),
    body('In an era where digital marketing allows even unqualified practitioners to present a veneer of premium capability, J.C. Chakraborty & Sons deliberately chooses a different path. Our brand perception is rooted in the model of heritage institutions like Bata or Sreeleathers — brands that have earned unshakeable trust not through advertising volume, but through decades of consistent, uncompromising quality.', 80),
    body('A well-crafted shoe endures because of its structural integrity, the quality of its materials, and the precision of its making — not because of its packaging. Our buildings endure for exactly the same reasons. This is not a marketing claim. It is a seven-decade track record.'),
    spacer(120),
    subHead('Do This / Not That'),
    dataTable(
      ['✓  Write This','✗  Not This'],
      [
        ['We have delivered 700+ projects across India.','We have done lots of projects in many places.'],
        ['Our structural engineers ensure every building exceeds safety standards.','We try our best to make safe buildings.'],
        ['Since 1954, permanence has been our standard.','We are an ancient and experienced company.'],
        ['A heritage of precision. A future shaped by purpose.','Old company, but we also do new things.'],
        ['Every space we design serves the people within it.','We make lovely spaces for clients.'],
      ],
      [Math.floor(CW/2), CW-Math.floor(CW/2)]
    ),
  ];
}

function sec03() {
  return [
    pb(),
    secLabel('03','The Heritage Story'), spacer(80),
    secHead('The Heritage Story'), rule(),
    ibody('Long-form version — for the About Us page, PPT slides 2–3, press materials, and any institutional presentation. Can be split into subsections or presented in full.'),
    spacer(120),

    subHead('A Legacy That Was Always Meant to Last'),
    body('In the heart of Kolkata, just steps from the Calcutta High Court, there is a building that has stood quietly through seven decades of a city\'s transformation. Inside Temple Chambers at 6 Old Post Office Street, a practice has operated without interruption since 1954 — outlasting trends, outlasting competition, and outlasting doubt.', 80),
    body('That practice is J.C. Chakraborty & Sons.'),
    spacer(120),

    subHead('The Foundation — A Name Shaped by History'),
    body('The story of J.C. Chakraborty & Sons begins not at a drawing board, but in the crucible of India\'s independence movement. Jyotish Chandra Chakraborty was no ordinary figure in Kolkata\'s civic life. A trusted ally of Sarat Bose and a man personally known to Netaji Subhas Chandra Bose, he was a freedom fighter with the Forward Bloc, and served as the night editor of the party\'s newspaper before his arrest by the British authorities. Netaji intervened personally to ensure his protection, and later gifted him a personalized pen as a mark of that bond.', 80),
    body('After independence, Jyotish Chandra served as Personal Assistant to the Chief Justice of the Calcutta High Court — a position that placed him at the intersection of Kolkata\'s most powerful legal, political, and civic networks. It was on the strength of these relationships — with figures including former Chief Minister Dr. B.C. Roy, the Khaitan legal families, and the broader High Court Para community — that the conditions for a new kind of professional practice were quietly established.', 80),
    body('Though the firm bears his name, Jyotish Chandra was not himself an engineer. The engineering practice was founded by his eldest son, Rathindra Nath Chakraborty. With his father\'s patronage, Rathindra Nath was given a modest "table space" at Emerald House, 1B Old Post Office Street — a beginning so small it could have been overlooked, but whose foundations held.'),
    spacer(120),

    subHead('The Beginning — 1954'),
    body('Rathindra Nath Chakraborty was a civil engineer by training and a builder by calling. His decision to leave salaried employment and establish an independent practice in 1954 was not without risk. Kolkata\'s engineering market at that time was dominated by massive British firms — Martin Burn and Talbot & Co. among them — and breaking into a profession controlled by institutional giants required something beyond technical competence. It required a name people trusted.', 80),
    body('He was soon joined by his brother, Gurudas Chakraborty — also a civil engineer, and a man whose experience working with Simplex, Cementation, and Gammon India on major infrastructure projects, including the Kolkata Metro Rail, brought rare depth of field knowledge to the young firm. Two brothers. One firm. One city they would spend their lives helping to build.'),
    spacer(120),

    subHead('The Buildings That Shaped a Generation'),
    body('The transformation of Kolkata\'s real estate landscape in the 1970s created conditions that the firm was uniquely positioned to seize. The Land Ceiling Act and the subsequent 1973 Apartment Ownership Act dissolved the vast estates of the zamindars, allowing individuals to purchase apartments outright for the first time. A massive multi-storey building boom followed, and J.C. Chakraborty & Sons was at its forefront.', 80),
    body('But it was in civic infrastructure that the firm first made its mark on the record of history. In the early 1970s, the firm served as civil engineering consultants on the Birla Temple on Amir Ali Avenue — a project that remains one of Kolkata\'s most recognisable landmarks. Then came the project that would define a generation.'),
    spacer(80),
    box1([
      new Paragraph({...sp(0,60), children:[tr('The Netaji Indoor Stadium — 1974–75',{size:19,bold:true,color:NAVY})]}),
      body('Commissioned by Chief Minister Siddhartha Shankar Ray for the 1975 World Table Tennis Championship, the Netaji Indoor Stadium faced an extraordinary nine-month deadline. J.C. Chakraborty & Sons served as the survey and civil engineering consultants alongside Bose Brothers. The firm\'s founders completed the entire land survey and all detailed drawings in just four to five days — a feat achieved through round-the-clock work. To meet the timeline, pre-cast steel portal frames were cast directly on the street between the Akashvani building and the State Assembly, then lifted into position by cranes. The playing surface required American Pine and Mahogany flooring, specified to meet the exact rebound-index standards that protect world-level athletes.',80),
      ibody('The 12,000-seat arena stands in active use today — a testament to the engineering that underpins it.'),
    ], IVORY),
    spacer(120),

    subHead('The Second Generation — Continuity of Purpose'),
    body('In 1981, the firm welcomed the next chapter. Surya Narayan Chakraborty and Shankar Narayan Chakraborty — sons of Rathindra Nath — joined as partners, both civil engineers trained to uphold the same standard their father had set. Rathindra Nath Chakraborty passed away in May 1982. The firm he had built continued without pause.', 80),
    body('When Gurudas Chakraborty passed away in 1997, Surya Narayan and Shankar Narayan carried the practice forward without missing a step. Their era brought larger clients, more complex projects, and deeper institutional trust.'),
    spacer(80),
    box1([
      new Paragraph({...sp(0,60), children:[tr('NICED — The JICA Building',{size:19,bold:true,color:NAVY})]}),
      body('The National Institute of Cholera and Diarrhoeal Diseases (NICED) facility at Beliaghata — a Rs.100 crore project funded entirely by the Japanese government through JICA — saw JCC engaged as the principal architectural, structural, and project management consultant from the Government of India side. The 75,000 sq. ft. medical research facility, capable of processing 1,000 samples simultaneously, was built in 13 months. That speed was not accidental. It was the product of a full year of rigorous pre-construction planning: weekly Saturday meetings with the international project team, in which every risk was resolved and every decision was finalized before a single brick was laid.'),
    ], IVORY),
    spacer(80),
    box1([
      new Paragraph({...sp(0,60), children:[tr('Hotel Sourav on Park Street — 2003–04',{size:19,bold:true,color:NAVY})]}),
      body('Originally sanctioned as a residential and office development, the Park Street project took a dramatic turn mid-construction when the brief was pivoted to create Kolkata\'s first sports bar — in collaboration with Sourav Ganguly, then Captain of the Indian Cricket team. With the structural frame already standing, the entire elevator shaft arrangement had to be redesigned and relocated. J.C. Chakraborty & Sons handled everything: design, structural engineering, project management, and complete interior detailing — delivering a landmark that became part of Park Street\'s story.'),
    ], IVORY),
    spacer(80),
    box1([
      new Paragraph({...sp(0,60), children:[tr('Hotel Landmark — The Promise That Cost',{size:19,bold:true,color:NAVY})]}),
      body('Built on a filled-up pond on the EM Bypass, Hotel Landmark became a costly test of the firm\'s values. Massive unforeseen escalations in steel prices and cement during construction resulted in a substantial financial loss. J.C. Chakraborty & Sons funded the project through to the final Occupancy Certificate — because in 70 years of practice, the firm has never once delivered substandard work, and a financial loss was not grounds to start.',80),
      ibody('"We have sometimes suffered losses. But we have always kept our standards intact."'),
    ], IVORY),
    spacer(80),
    body('Heritage restoration followed: Swami Vivekananda\'s ancestral residence, the YMCA Central Kolkata building, La Martiniere for Boys, St. Thomas\' School and St. Paul\'s School Kidderpore. Each one a careful, respectful conversation between the past and the present.'),
    spacer(120),

    subHead('The Third Generation — And the Road Ahead'),
    body('In 2020, Aditya Narayan Chakraborty — son of Surya Narayan Chakraborty — joined the firm as a junior engineer. He had refused offers from TCS, AECOM, and L&T to do so. By 2025, he had been made a partner. Three generations. Seventy years. The same address. The same standard.', 80),
    body('Today, J.C. Chakraborty & Sons serves clients across residential, institutional, commercial, and heritage domains across India. The methods have evolved — the firm now works with BIM, CAD, and advanced simulation platforms including Revit, STAAD, ETABS, and QGIS, vastly increasing the speed and reliability of every engagement. But the commitment that defined 1954 remains unchanged: to build spaces that stand, that serve, and that last.'),
    spacer(80),
    box1([
      ibody('We have never built for today. Every structure we have ever delivered was designed with one question in mind: will it still stand when our grandchildren\'s grandchildren need it?'),
    ], W_IVORY),
  ];
}

function sec04() {
  const lW3 = Math.floor(CW/3); const rW3 = CW - lW3*2;
  return [
    pb(),
    secLabel('04','Mission, Vision & Brand Pillars'), spacer(80),
    secHead('Mission, Vision & Brand Pillars'), rule(),

    subHead('Mission Statement'),
    ibody('Present-focused and action-driven — what the firm does, every day, and how it does it.'),
    spacer(80),
    box1([ibody('To build with the precision that endures, the care that serves, and the integrity that never compromises. We design and deliver architectural and structural solutions that honour the people who commission them, the clients who trust them, and the generations that will inherit them — across every domain, every scale, and every corner of India.')], IVORY),
    spacer(120),

    subHead('Vision Statement'),
    ibody('Future-focused and aspirational — the destination towards which the firm has always been moving.'),
    spacer(80),
    box1([ibody('To create structures that outlast the hands that built them — not as monuments to ambition, but as quiet acts of service to every person who will ever stand inside them. To build with such integrity, such precision, and such purpose that the question of permanence never arises. Not to build for today. To build for always.')], IVORY),
    spacer(80),
    body('The vision came first — Jyotish Chandra Chakraborty believed that creation is an act of responsibility. That what a man builds is what he leaves behind. The mission is the daily commitment to earning that vision: not once, but on every project, for every client, without exception.'),
    spacer(120),

    subHead('The Five Brand Pillars'),
    body('Everything JCC does flows from these five pillars. Use them to structure the website services section, the PPT, and any institutional presentation.'),
    spacer(80),
    // 3 pillars
    new Table({
      width:{size:CW,type:WidthType.DXA}, columnWidths:[lW3,lW3,rW3],
      rows:[new TableRow({ children:[
        mkCell([new Paragraph({...sp(0,40),children:[tr('01',{size:28,bold:true,color:GOLD})]}),new Paragraph({...sp(0,60),children:[tr('Architectural Versatility',{size:17,bold:true,color:NAVY})]}),body('From high-density residential frameworks to specialised institutional design — a proven mastery of diverse project types, scales, and design languages across India.')],lW3,IVORY),
        mkCell([new Paragraph({...sp(0,40),children:[tr('02',{size:28,bold:true,color:GOLD})]}),new Paragraph({...sp(0,60),children:[tr('Structural Integrity',{size:17,bold:true,color:NAVY})]}),body('The precision that makes buildings safe, lasting, and trusted. Our structural engineering practice brings decades of experience across every typology — from foundations to complex multi-storey systems.')],lW3,IVORY),
        mkCell([new Paragraph({...sp(0,40),children:[tr('03',{size:28,bold:true,color:GOLD})]}),new Paragraph({...sp(0,60),children:[tr('Infrastructure Precision',{size:17,bold:true,color:NAVY})]}),body('Technical leadership in delivering critical infrastructure — research institutes, civic facilities, sports venues, and institutional complexes where engineering rigour is not optional.')],rW3,IVORY),
      ]})]
    }),
    spacer(60),
    // 2 pillars
    box2(
      [new Paragraph({...sp(0,40),children:[tr('04',{size:28,bold:true,color:GOLD})]}),new Paragraph({...sp(0,60),children:[tr('Institutional Reliability',{size:17,bold:true,color:NAVY})]}),body('A 70-year track record of delivering critical environments — schools, research institutes, sports facilities, places of worship, and hotels — where the stakes demand a partner who never fails.')],
      [new Paragraph({...sp(0,40),children:[tr('05',{size:28,bold:true,color:GOLD})]}),new Paragraph({...sp(0,60),children:[tr('Sustainable Value',{size:17,bold:true,color:NAVY})]}),body('Intelligent, responsible use of resources that reduces long-term cost without compromising integrity. We design for performance, durability, and environmental mindfulness — because the most economical building is the one that never needs to be rebuilt.')],
      null, IVORY
    ),
  ];
}

function sec05() {
  const sW=Math.floor(CW*0.3); const lW=CW-sW;
  return [
    pb(),
    secLabel('05','Website Page Content'), spacer(80),
    secHead('Website Page Content'), rule(),
    ibody('All copy below is final-draft quality and ready to hand to the web developer or use directly. Placeholders for photos are marked in [brackets].'),
    spacer(120),

    subHead('Page 1 — Home'),
    h3('Hero Section'), spacer(60),
    box1([
      goldLbl('Headline:'),
      new Paragraph({...sp(0,80), children:[tr('Permanence, by Design.',{size:26,bold:true,color:NAVY})]}),
      goldLbl('Subheadline:'),
      body('India\'s trusted architectural and structural consultancy since 1954. 700+ projects. Three generations. One unwavering standard.'),
      spacer(60),
      goldLbl('CTA Buttons:'),
      body('[ View Our Work ]   [ Get in Touch ]'),
      spacer(40),
      goldLbl('Background Image:'),
      ibody('[Full-width aerial or facade image of a landmark JCC project — ideally Netaji Indoor Stadium or NICED building exterior]'),
    ], IVORY),
    spacer(100),

    h3('Stats Bar'), spacer(60),
    boxN([
      [new Paragraph({alignment:AlignmentType.CENTER,...sp(60,20),children:[tr('1954',{size:28,bold:true,color:NAVY})]}),new Paragraph({alignment:AlignmentType.CENTER,...sp(0,80),children:[tr('Year Established',{size:15,color:SLATE})]})],
      [new Paragraph({alignment:AlignmentType.CENTER,...sp(60,20),children:[tr('700+',{size:28,bold:true,color:NAVY})]}),new Paragraph({alignment:AlignmentType.CENTER,...sp(0,80),children:[tr('Projects Delivered',{size:15,color:SLATE})]})],
      [new Paragraph({alignment:AlignmentType.CENTER,...sp(60,20),children:[tr('3',{size:28,bold:true,color:NAVY})]}),new Paragraph({alignment:AlignmentType.CENTER,...sp(0,80),children:[tr('Generations of Expertise',{size:15,color:SLATE})]})],
      [new Paragraph({alignment:AlignmentType.CENTER,...sp(60,20),children:[tr('5.0 / 5.0',{size:28,bold:true,color:NAVY})]}),new Paragraph({alignment:AlignmentType.CENTER,...sp(0,80),children:[tr('Client Rating',{size:15,color:SLATE})]})],
    ], W_IVORY),
    spacer(100),

    h3('Intro Section — Who We Are'), spacer(60),
    box1([
      new Paragraph({...sp(0,60), children:[tr('Heading: A Name Built Into the Fabric of India',{size:17,bold:true,color:NAVY})]}),
      body('For over seven decades, J.C. Chakraborty & Sons has been the quiet force behind some of India\'s most important spaces — from the Netaji Indoor Stadium to heritage schools, from research institutes to the country\'s first sports bar. We are architects, structural engineers, and civil contractors who believe that every building carries a responsibility: to the people inside it, to the street it stands on, and to the city it becomes part of.',80),
      body('We are not the loudest firm in the room. We are the one that gets the job done — on time, to specification, and to a standard that lets our work speak for itself.'),
    ], IVORY),
    spacer(120),

    subHead('Page 2 — About / Our Heritage'),
    box1([
      new Paragraph({...sp(0,40), children:[tr('Page Headline: 70 Years of Building What Matters',{size:17,bold:true,color:NAVY})]}),
      ibody('Subheadline: Three generations. One firm. A country shaped by our hands.',80),
      body('[Use the full Heritage Story from Section 03. Split into five subsections: The Foundation / The Beginning (1954) / The Buildings That Shaped a Generation / The Second Generation / The Third Generation & The Road Ahead]',80),
      ibody('[Add a visual timeline strip between sections showing key years and project names.]'),
    ], IVORY),
    spacer(80),
    h3('Our Team (About Page Sub-section)'), spacer(60),
    box1([
      new Paragraph({...sp(0,60), children:[tr('Heading: The Family Behind the Firm',{size:17,bold:true,color:NAVY})]}),
      body('J.C. Chakraborty & Sons is built on family — not just in name, but in practice. Every decision, every project, and every standard we hold ourselves to comes from the same commitment that Jyotish Chandra Chakraborty instilled when he founded this firm in 1954.',80),
      ibody('[Team cards: Er. Surya Narayan Chakraborty (Partner), Er. Shankar Narayan Chakraborty (Partner), Er. Aditya Narayan Chakraborty (Partner) — photos and bios to be received from client]'),
    ], IVORY),
    spacer(120),

    subHead('Page 3 — Services'),
    box1([
      new Paragraph({...sp(0,40), children:[tr('Page Headline: What We Build. How We Build It.',{size:17,bold:true,color:NAVY})]}),
      ibody('Subheadline: Full-service architecture, structural engineering, and civil contracting — from the first drawing to the final handover.'),
    ], IVORY),
    spacer(80),
    dataTable(
      ['Service','Website Description'],
      [
        ['Architecture & Interior Design','Structures that last — designed for the people who live and work inside them. From institutional complexes to commercial fit-outs, our holistic design-and-build approach means a single point of accountability from concept to completion.'],
        ['Construction','Full civil contracting for clients who need precision delivery from the ground up. We manage every phase — from foundation to final handover — as a trusted turnkey partner with seven decades of proven execution behind every project.'],
        ['Structural Engineering','Strong buildings begin with strong thinking. Our structural engineering team brings decades of experience in frame design, foundation engineering, and load analysis for residential, commercial, and institutional projects across India.'],
        ['Civil Engineering','The technical discipline that underpins everything we build. From site surveys and soil analysis to drainage systems and infrastructure coordination — the rigour that makes every structure safe, code-compliant, and built to last.'],
      ],
      [sW,lW]
    ),
    spacer(120),

    subHead('Page 4 — Contact'),
    box1([
      goldLbl('Headline:'),
      new Paragraph({...sp(0,80), children:[tr("Let's Build Something Together.",{size:22,bold:true,color:NAVY})]}),
      goldLbl('Body:'),
      body('Whether you are planning a new building, undertaking a structural project, or looking for a trusted partner for your next institutional commission — we would like to hear from you. J.C. Chakraborty & Sons has been having these conversations since 1954. We look forward to having one with you.',80),
      goldLbl('Address:'),
      body('2nd Floor, Room 32, Temple Chambers, 6 Old Post Office Street, Dalhousie, Kolkata – 700001',80),
      goldLbl('Landmark:'),
      body('Beside Calcutta High Court, B.B.D. Bagh',80),
      goldLbl('Form Fields:'),
      ibody('Name / Phone / Email / Project Type / Location / Message / [Button: Start the Conversation]'),
    ], IVORY),
  ];
}

function sec06() {
  return [
    pb(),
    secLabel('06','Hero Project Descriptions'), spacer(80),
    secHead('Hero Project Descriptions'), rule(),
    ibody('These descriptions are for the Projects/Portfolio page of the website, the PPT case study slides, and institutional pitch materials. Each entry has a short version (website tiles / PPT) and a long version (full case study pages).'),
    spacer(120),

    // ── PROJECT 1 ──────────────────────────────────────────────────────────────
    subHead('Netaji Indoor Stadium'),
    projTag('1974–75','Sports & Civic Infrastructure','Government of West Bengal','Civil Engineering & Survey Consultant'),
    spacer(80),
    h3('Short Version — Website Tile / PPT Slide'),
    body('One of India\'s most iconic civic landmarks, built for the 1975 World Table Tennis Championship under Chief Minister Siddhartha Shankar Ray. J.C. Chakraborty & Sons completed massive land surveys and all structural drawings in just four to five days, and engineered the stadium\'s innovative pre-cast portal frame system — with specialised American Pine and Mahogany flooring specified to international rebound standards.'),
    spacer(80),
    h3('Long Version — Full Case Study'),
    body('The Netaji Indoor Stadium stands as one of the most significant infrastructure achievements in the history of post-Independence Bengal. Commissioned for the 1975 World Table Tennis Championship under an extraordinary nine-month deadline, J.C. Chakraborty & Sons served as survey and civil engineering consultants alongside Bose Brothers.', 80),
    body('The firm\'s founders completed the entire land survey and all structural drawings in four to five days — a pace that demanded total commitment and round-the-clock work. The construction method was equally innovative: pre-cast steel portal frames were cast directly on the street between the Akashvani building and the State Assembly, then lifted into final position by cranes. For the playing surface, international competition standards required American Pine and Mahogany flooring, precisely specified to meet the rebound-index requirements that protect athletes competing at world level.', 80),
    body('The 12,000-seat stadium remains in active use today. It is a testament not just to the engineering beneath it, but to what a small, committed team can deliver when the stakes are at their highest.'),
    spacer(120),

    // ── PROJECT 2 ──────────────────────────────────────────────────────────────
    subHead('NICED — The JICA Building'),
    projTag('2000s','Government Research Infrastructure','JICA (Japan) / CPWD / Government of India','Principal Architectural, Structural & PMC Consultant (Government of India)'),
    spacer(80),
    h3('Short Version — Website Tile / PPT Slide'),
    body("India's foremost research institute for cholera and diarrhoeal diseases, built at Beliaghata with Rs.100 crore in Japanese (JICA) funding. The 75,000 sq. ft. facility — capable of processing 1,000 samples simultaneously — was delivered in 13 months. J.C. Chakraborty & Sons served as the principal architectural, structural, and project management consultant from the Government of India side."),
    spacer(80),
    h3('Long Version — Full Case Study'),
    body('The JICA Building at the National Institute of Cholera and Diarrhoeal Diseases (NICED) represents one of the most significant research infrastructure projects in eastern India. Funded entirely by the Japanese International Cooperation Agency (JICA) to the value of approximately Rs.100 crore, this 75,000 sq. ft. facility stands as India\'s number-one institute in its field.', 80),
    body('J.C. Chakraborty & Sons was designated as the principal architectural, structural, and project management consultant from the Government of India side — the highest level of institutional trust — working in close coordination with CPWD and the Japanese agency. The 13-month construction timeline was not the result of compression. It was the result of preparation: a full year of weekly Saturday pre-construction meetings with the international team, during which every risk was resolved, every design decision was finalised, and every stakeholder was aligned before construction commenced.'),
    spacer(120),

    // ── PROJECT 3 ──────────────────────────────────────────────────────────────
    subHead('Hotel Sourav on Park Street'),
    projTag('2003–04','Hospitality & Commercial Design','Private Client / Sourav Ganguly (collaboration)','Full Design, Structural Engineering & PMC'),
    spacer(80),
    h3('Short Version — Website Tile / PPT Slide'),
    body("Kolkata's first sports bar — originally sanctioned as a residential and office development, pivoted mid-construction in collaboration with Sourav Ganguly, then Captain of the Indian Cricket team. J.C. Chakraborty & Sons engineered the complex structural transformation required — including relocating elevator shafts within an already-standing frame — and delivered every element from structural engineering to interior detailing."),
    spacer(80),
    h3('Long Version — Full Case Study'),
    body('Hotel Sourav on Park Street sits at the intersection of architecture, engineering, and cultural memory. Originally sanctioned as a G+4 residential and office development, the project took a dramatic turn mid-construction: the brief was pivoted to create what would become Kolkata\'s first sports bar, in collaboration with Sourav Ganguly, then Captain of the Indian Cricket team.', 80),
    body('What makes this project a true demonstration of JCC\'s capability is not the cultural significance of what was built, but the technical complexity of how the transformation was achieved. With the structural frame already standing, the entire elevator shaft arrangement had to be redesigned and relocated. J.C. Chakraborty & Sons handled everything: design, structural engineering, Project Management Consultancy, and complete interior detailing. It remains a landmark not just in the firm\'s portfolio, but in the story of Park Street itself.'),
    spacer(120),

    // ── PROJECT 4 ──────────────────────────────────────────────────────────────
    subHead("Swami Vivekananda's Ancestral House"),
    projTag('Heritage Project','Heritage Restoration & Preservation','Ramakrishna Mission / Archaeological Survey of India','Structural Restoration & Heritage Consultant'),
    spacer(80),
    h3('Short Version — Website Tile / PPT Slide'),
    body("A ₹250 crore heritage restoration of Swami Vivekananda's ancestral residence, conducted in collaboration with the Archaeological Survey of India and the Ramakrishna Mission. Rather than use modern cement, J.C. Chakraborty & Sons insisted on period-accurate Murshidabad bricks and traditional chun-surki lime mortar — preserving not just the structure, but its historical soul."),
    spacer(80),
    h3('Long Version — Full Case Study'),
    body("Swami Vivekananda's ancestral house is not simply a building. It is one of India's most spiritually significant addresses — a structure whose restoration demanded something far beyond technical competence. It required reverence.", 80),
    body("The ₹250 crore project, conducted alongside the Archaeological Survey of India and the Ramakrishna Mission, presented J.C. Chakraborty & Sons with a fundamental choice: restore the structure using modern materials for convenience and speed, or reconstruct it using the methods and materials of its original era. The firm chose the harder path. The dilapidated 19th-century structure was painstakingly rebuilt using period-accurate small Murshidabad bricks and chun-surki — traditional lime mortar — with no modern cement used anywhere in the restoration.", 80),
    body('This is what it means to practise permanence as a discipline rather than a slogan: to know when the most technically demanding solution is also the most historically correct one, and to have the expertise and conviction to deliver it.'),
    spacer(120),

    // ── PROJECT 5 ──────────────────────────────────────────────────────────────
    subHead('Hotel Landmark — The Test of Integrity'),
    projTag('Commercial Project','Hospitality & Commercial Construction','Private Client','Full Turnkey Design & Build'),
    spacer(80),
    h3('Short Version — Website Tile / PPT Slide'),
    body("Built on a filled-up pond on the EM Bypass, Hotel Landmark became one of the firm's costliest projects — not in budget, but in principle. When massive unforeseen escalations in steel and cement prices resulted in a substantial financial loss, J.C. Chakraborty & Sons refused to cut corners, funding the project through to its final Occupancy Certificate. The building stands as a monument to what the firm's values actually cost — and what those values are actually worth."),
    spacer(80),
    h3('Long Version — Full Case Study'),
    body("There are projects that define a firm's technical capability. And there are projects that define its character. Hotel Landmark on the EM Bypass is the second kind.", 80),
    body('Built on a barren, filled-up pond site with its own engineering challenges from the foundations up, the project was overtaken by a crisis that no contract could have anticipated: massive, unforeseen price escalations in both steel and cement during construction. The arithmetic was unambiguous. The project had become a substantial financial loss.', 80),
    body('J.C. Chakraborty & Sons funded the project through to the final Occupancy Certificate — because in 70 years of practice, the firm has never delivered substandard work, and a financial loss was not grounds to start.', 80),
    box1([ibody('"The most economical building is the one you never have to rebuild. That standard has a cost. We have paid it. We would pay it again."')], W_IVORY),
    spacer(120),

    // ── PROJECT 6 ──────────────────────────────────────────────────────────────
    subHead('Heritage Restoration Portfolio — La Martiniere, YMCA & Institutional Works'),
    projTag('Multiple Projects','Heritage Restoration & Institutional Architecture','La Martiniere for Boys / YMCA Central Kolkata / St. Thomas\' School / CNI','Architectural, Structural & Heritage Consultant'),
    spacer(80),
    h3('Short Version — Website Tile / PPT Slide'),
    body("Conservation and structural restoration across some of Kolkata's most significant heritage institutions — La Martiniere for Boys, the YMCA Central Kolkata building, and multiple engagements at St. Thomas' School Kidderpore, including extension blocks, a proposed law college, and a proposed Olympic-standard swimming pool complex."),
    spacer(80),
    h3('Long Version — Full Case Study'),
    body("The firm's work across this institutional heritage portfolio represents the depth of trust that Kolkata's most established institutions place in J.C. Chakraborty & Sons.", 80),
    body('At La Martiniere for Boys — a 19th-century structure that carries the weight of both history and daily institutional life — the restoration demanded the ability to read a structure, understand what it was built to be, and intervene with the lightest possible hand while ensuring it is safe and serviceable for generations to come.', 80),
    body("At the YMCA Central Kolkata, the mandate was dual: restore the heritage fabric while simultaneously upgrading the building's systems and facilities to contemporary standards. At St. Thomas' School Kidderpore, the firm has served across multiple engagements — extension blocks for the boys' and girls' schools, a proposed law college within the school premises, and a proposed open-air stadium with an Olympic-standard swimming pool. The Auditorium Block at St. Paul's School Kidderpore and institutional works for the Churches of North India complete a portfolio that speaks to seven decades of earned trust."),
  ];
}

function sec07() {
  const pW=Math.floor(CW*0.18); const bW=CW-pW;
  return [
    pb(),
    secLabel('07','Boilerplate Text & Social Media'), spacer(80),
    secHead('Boilerplate Text & Social Media'), rule(),

    subHead('Company Boilerplate — Short (For RFPs, Emails, LinkedIn About)'),
    box1([body('J.C. Chakraborty & Sons is an architectural and structural consultancy established in 1954. With 700+ projects delivered across India — spanning residential, institutional, commercial, and heritage domains — the firm brings three generations of engineering excellence and a 70-year legacy of trust to every project it undertakes. Operating from Temple Chambers at 6 Old Post Office Street, Dalhousie, Kolkata, the firm provides end-to-end services: architecture, interior design, structural engineering, civil contracting, and project management consultancy.')], IVORY),
    spacer(100),

    subHead('Company Boilerplate — One Line'),
    box1([ibody('J.C. Chakraborty & Sons — Permanence, by Design. Since 1954.')], W_IVORY),
    spacer(100),

    subHead('Email Signature Block'),
    box1([
      new Paragraph({...sp(0,40), children:[tr('[Partner Name]',{bold:true,size:22,color:NAVY})]}),
      body('Partner, J.C. Chakraborty & Sons',60),
      body('Architects  ·  Structural Engineers  ·  Civil Contractors',60),
      body('Est. 1954  ·  Temple Chambers, 6 Old Post Office Street, Kolkata – 700001',60),
      body('M: [Phone]  ·  E: [Email]  ·  W: [Website URL]',60),
      spacer(40),
      ibody('Permanence, by Design.'),
    ], IVORY),
    spacer(100),

    subHead('Social Media Bios'),
    dataTable(
      ['Platform','Bio Copy'],
      [
        ['Instagram','Architects. Engineers. Builders. Kolkata, India. 700+ projects. Three generations. Est. 1954. Permanence, by Design.'],
        ['LinkedIn','J.C. Chakraborty & Sons is an architectural and structural consultancy with over 70 years of unbroken practice. Founded in 1954, we have delivered 700+ projects across India — from the Netaji Indoor Stadium to the NICED JICA Building, from the restoration of Swami Vivekananda\'s ancestral house to Hotel Sourav on Park Street. Permanence, by Design.'],
        ['Google Business','India\'s trusted architectural, structural, and civil engineering consultancy since 1954. Architecture · Construction · Structural Engineering · Civil Engineering. 700+ projects. 5.0 rating.'],
        ['WhatsApp Business','J.C. Chakraborty & Sons  |  Est. 1954  |  Architects & Structural Engineers  |  Kolkata  |  Permanence, by Design.'],
      ],
      [pW, bW]
    ),
    spacer(100),

    subHead('10 Social Media Post Starters'),
    body('Ready-to-use opening lines for Instagram captions, LinkedIn posts, or WhatsApp broadcasts:'),
    spacer(80),
    body('1.  In 1954, a family in Kolkata started building. Seventy years later, we are still at it — and the standard has never dropped.',80),
    body('2.  Some firms count projects. We count the people whose lives happen inside them.',80),
    body('3.  From the Netaji Indoor Stadium to Swami Vivekananda\'s ancestral house — these are not just buildings. They are part of India\'s story.',80),
    body('4.  A sports bar built with a cricket captain. A research institute funded by Japan. A heritage house rebuilt brick by brick. This is what 70 years of work looks like.',80),
    body('5.  Architecture is the mother of all arts. Engineering is the mother of all disciplines. We practice both.',80),
    body('6.  700 projects. Every one of them earned on merit, delivered with precision, and handed over with pride.',80),
    body('7.  Permanence is not an accident. It is a decision — made at the drawing board, enforced on the site, and measured in decades.',80),
    body('8.  If your building needs to stand for 100 years, it needs to be built by someone who has thought about 100 years. We have been doing exactly that since 1954.',80),
    body('9.  Three generations of the same family. One office. One standard. That is J.C. Chakraborty & Sons.',80),
    body('10.  The most economical building is the one you never have to rebuild. That is the promise behind every structure we design.',80),
  ];
}

function backCover() {
  return [
    pb(),
    box1([
      new Paragraph({alignment:AlignmentType.CENTER,...sp(200,80), children:[tr('J.C. CHAKRABORTY & SONS',{size:28,bold:true,color:WHITE})]}),
      new Paragraph({alignment:AlignmentType.CENTER,...sp(0,160), children:[tr('Permanence, by Design.',{size:24,italics:true,color:GOLD})]}),
      new Paragraph({alignment:AlignmentType.CENTER,...sp(0,0), children:[tr('Brand Story & Master Content Guide  ·  Prepared by Ronit Bose  ·  May 2026  ·  Confidential',{size:14,color:'AAAAAA'})]}),
    ], NAVY),
  ];
}

// ── BUILD ──────────────────────────────────────────────────────────────────────
const doc = new Document({
  numbering: {
    config: [{
      reference: BULL,
      levels: [{ level:0, format:LevelFormat.BULLET, text:'\u2022',
        alignment:AlignmentType.LEFT,
        style:{ paragraph:{ indent:{ left:720, hanging:360 } } }
      }]
    }]
  },
  sections: [{
    properties: {
      page: {
        size:{ width:11906, height:16838 },
        margin:{ top:1080, right:1080, bottom:1080, left:1080 }
      }
    },
    children: [
      ...cover(),
      ...sec00(),
      ...sec01(),
      ...sec02(),
      ...sec03(),
      ...sec04(),
      ...sec05(),
      ...sec06(),
      ...sec07(),
      ...backCover(),
    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('./JCC_Brand_Story_v6.docx', buf);
  console.log('Done — JCC_Brand_Story_v6.docx');
}).catch(e => { console.error(e); process.exit(1); });
