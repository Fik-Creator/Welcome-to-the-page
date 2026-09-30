const SUPABASE_URL = 'https://mijtwizvmfkhgaqzwexd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_nR_xKWMM77WTcypkrKzxOg_8MvqKTiC';
const AUTH_URL = SUPABASE_URL + '/functions/v1/reelpage-auth';
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});

const DEMO = {
  profiles: [
    {id:'demo-1',full_name:'Amara Okafor',username:'amaraokafor',headline:'Screenwriter',location:'Lagos, Nigeria',bio:'Stories rooted in African life, youth and human connection.',skills:['Drama','Series','Dialogue'],is_verified:true,avatar_url:'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=240&q=80',cover_url:'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1400&q=80'},
    {id:'demo-2',full_name:'Tobi Adebayo',username:'tobiadebayo',headline:'Director / Cinematographer',location:'Ibadan, Nigeria',bio:'Visual storyteller building bold, intimate films.',skills:['Direction','Cinematography','Documentary'],is_verified:true,avatar_url:'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80',cover_url:'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1400&q=80'},
    {id:'demo-3',full_name:'Zainab Yusuf',username:'zainabyusuf',headline:'Actor',location:'Abuja, Nigeria',bio:'Actor and theatre maker exploring contemporary African stories.',skills:['Acting','Theatre','Voice'],is_verified:false,avatar_url:'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80',cover_url:'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1400&q=80'},
    {id:'demo-4',full_name:'Daniel Mensah',username:'danielmensah',headline:'Producer',location:'Accra, Ghana',bio:'Independent producer connecting great stories to audiences.',skills:['Production','Development','Distribution'],is_verified:true,avatar_url:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80',cover_url:'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=1400&q=80'}
  ],
  projects: [
    {id:'demo-p1',title:'The Last Bus',format:'Short Film',genre:'Drama',description:'A teenage girl gets one final chance to say goodbye before leaving home.',status:'Seeking Producer',image_url:'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1000&q=82'},
    {id:'demo-p2',title:'After Rain',format:'Documentary',genre:'24 min',description:'A visual portrait of young creatives rebuilding after a difficult season.',status:'In Development',image_url:'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1000&q=82'},
    {id:'demo-p3',title:'Market Day',format:'Feature Film',genre:'Comedy',description:'Three friends discover that one chaotic market day can change everything.',status:'Seeking Screenwriter',image_url:'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=82'}
  ],
  opps: [
    {id:'demo-o1',title:'Casting: Young Lead — Short Film',opportunity_type:'Casting',location:'Lagos / Hybrid',description:'Independent short film seeking a young lead actor for a character-driven story.',status:'Open',compensation:'Paid',image_url:'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=600&q=80'},
    {id:'demo-o2',title:'Screenwriter Wanted — 15min Drama',opportunity_type:'Writing',location:'Remote',description:'Producer looking for a writer to develop a contained Nigerian drama.',status:'Open',compensation:'Negotiable',image_url:'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=600&q=80'},
    {id:'demo-o3',title:'Cinematographer — Documentary',opportunity_type:'Crew',location:'Ibadan',description:'Small documentary team seeking a cinematographer for a 2-day shoot.',status:'Open',compensation:'Paid'}
  ]
};

const DEMO_SCRIPTS = [
  {id:'demo-script-1',seller_id:'demo-1',title:'The Last Bus',logline:'A teenage girl gets one final chance to say goodbye before leaving home.',description:'Contained short drama designed for a small cast and a focused production footprint.',format:'Short Film',genre:'Drama',language:'English',price:25000,currency:'NGN',status:'Available',seller:DEMO.profiles[0]},
  {id:'demo-script-2',seller_id:'demo-2',title:'Market Day',logline:'Three friends discover that one chaotic market day can change everything.',description:'A fast-paced Nigerian comedy with ensemble energy and practical locations.',format:'Feature Film',genre:'Comedy',language:'English',price:75000,currency:'NGN',status:'Available',seller:DEMO.profiles[1]},
  {id:'demo-script-3',seller_id:'demo-3',title:'After Rain',logline:'Young creatives rebuild their lives while a camera documents the process.',description:'A documentary treatment with room for development and local adaptation.',format:'Documentary',genre:'Documentary',language:'English',price:40000,currency:'NGN',status:'Available',seller:DEMO.profiles[2]}
];

const state = {
  tab:'Home', search:'', user:null, profiles:DEMO.profiles.slice(), projects:DEMO.projects.slice(),
  opps:DEMO.opps.slice(), scripts:[], posts:[], liked:new Set(), following:new Set(), messages:[],
  selectedPerson:null, viewedProfileId:null, profileViewTab:'About', selectedConversation:null,premium:false, modal:null, authMode:'signup', loading:false, toast:''
};

const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const initials = name => String(name||'R').split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase();
const fmtDate = value => value ? new Date(value).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}) : 'Now';
const COUNTRY_CODES=["AF","AL","DZ","AS","AD","AO","AI","AQ","AG","AR","AM","AW","AU","AT","AZ","AX","BS","BH","BD","BB","BY","BE","BZ","BJ","BM","BT","BO","BQ","BA","BW","BV","BR","IO","BN","BG","BF","BI","CV","KH","CM","CA","KY","CF","TD","CL","CN","CX","CC","CO","KM","CG","CD","CK","CR","CI","HR","CU","CW","CY","CZ","DK","DJ","DM","DO","EC","EG","SV","GQ","ER","EE","SZ","ET","FK","FO","FJ","FI","FR","GF","PF","TF","GA","GM","GE","DE","GH","GI","GR","GL","GD","GP","GU","GT","GG","GN","GW","GY","HT","HM","VA","HN","HK","HU","IS","IN","ID","IR","IQ","IE","IM","IL","IT","JM","JP","JE","JO","KZ","KE","KI","KP","KR","KW","KG","LA","LV","LB","LS","LR","LY","LI","LT","LU","MO","MG","MW","MY","MV","ML","MT","MH","MQ","MR","MU","YT","MX","FM","MD","MC","MN","ME","MS","MA","MZ","MM","NA","NR","NP","NL","NC","NZ","NI","NE","NG","NU","NF","MK","MP","NO","OM","PK","PW","PS","PA","PG","PY","PE","PH","PN","PL","PT","PR","QA","RE","RO","RU","RW","BL","SH","KN","LC","MF","PM","VC","WS","SM","ST","SA","SN","RS","SC","SL","SG","SX","SK","SI","SB","SO","ZA","GS","SS","ES","LK","SD","SR","SJ","SE","CH","SY","TW","TJ","TZ","TH","TL","TG","TK","TO","TT","TN","TR","TM","TC","TV","UG","UA","AE","GB","US","UM","UY","UZ","VU","VE","VN","VG","VI","WF","EH","YE","ZM","ZW"];
const countryNames=(()=>{try{return new Intl.DisplayNames(['en'],{type:'region'});}catch(e){return null;}})();
function countryLabel(code){return countryNames?.of(code)||code;}
function countryOptions(selected=''){return '<option value="" disabled '+(!selected?'selected':'')+'>Select your country</option>'+COUNTRY_CODES.map(code=>'<option value="'+code+'" '+(String(selected||'')===code?'selected':'')+'>'+esc(countryLabel(code))+'</option>').join('');}
function countryDisplay(value){const v=String(value||'');return COUNTRY_CODES.includes(v)?countryLabel(v):v;}
function profilePlace(p){return [p?.location,countryDisplay(p?.country)].filter(Boolean).join(' · ')||'Nigeria';}


function logoMark(size='md') {
  const cls = size==='xs'?'rp-xs':size==='sm'?'rp-sm':size==='lg'?'rp-lg':'rp-md';
  return '<span class="rp-mark '+cls+'" aria-label="ReelPage"><img src="reelpage-mark.svg" alt="" loading="lazy"></span>';
}
function brand(compact=false){
  return '<div class="brand-lockup">'+logoMark('sm')+'<img class="rp-wordmark" src="reelpage-logo.svg" alt="ReelPage" loading="eager"></div>';
};
const ICONS = {
  home:'<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M9.5 20v-5h5v5"/>',
  discover:'<circle cx="11" cy="11" r="7"/><path d="m16.2 16.2 4.2 4.2"/><path d="m8.5 13.5 5-5"/>',
  scripts:'<path d="M4 5.5h16v13H4z"/><path d="m9 9 6 3-6 3z"/>',
  projects:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M8 5V3h8v2"/><path d="M3 10h18"/>',
  messages:'<path d="M4 5h16v11H8l-4 4z"/><path d="M8 9h8M8 12h5"/>',
  opportunities:'<path d="M6 7h12v13H6z"/><path d="M9 7V5h6v2"/><path d="M9 12h6M9 15h4"/>',
  profile:'<circle cx="12" cy="8" r="3"/><path d="M5 20c.8-3.5 3.2-5 7-5s6.2 1.5 7 5"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  search:'<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/>',
  bell:'<path d="M6 9a6 6 0 0 1 12 0c0 6 2 6 2 7H4c0-1 2-1 2-7"/><path d="M10 20h4"/>',
  arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
  film:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m7 5 3 5-3 4M17 5l-3 5 3 4"/>',
  send:'<path d="m3 11 18-8-8 18-2-7z"/><path d="m11 14 5-5"/>',
  heart:'<path d="M20.8 8.8c0 5.3-8.8 10.3-8.8 10.3S3.2 14.1 3.2 8.8A4.7 4.7 0 0 1 12 6.1a4.7 4.7 0 0 1 8.8 2.7Z"/>',
  close:'<path d="m6 6 12 12M18 6 6 18"/>'
};
function icon(name,size=18){ return `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]||ICONS.home}</svg>`; }

function avatar(user,cls=''){
  const name=typeof user==='string'?user:(user?.full_name||user?.name||'ReelPage');
  const url=typeof user==='object'&&user?user.avatar_url:'';
  return url ? `<div class="avatar ${cls}"><img src="${esc(url)}" alt="${esc(name)}" loading="lazy"></div>`
    : `<div class="avatar ${cls}">${logoMark('xs')}<span>${esc(initials(name))}</span></div>`;
}

let searchTimer=null;
function queueSearch(value){clearTimeout(searchTimer);searchTimer=setTimeout(()=>{state.search=value;render();},180);}
function setTab(tab){ state.tab=tab; state.selectedPerson=null; state.viewedProfileId=null; render(); window.scrollTo({top:0,behavior:'smooth'}); }
function openPublicProfile(id){ state.viewedProfileId=id; state.profileViewTab='About'; state.tab='ProfileView'; state.selectedPerson=null; render(); window.scrollTo({top:0,behavior:'smooth'}); }
function setProfileViewTab(tab){ state.profileViewTab=tab; render(); }
function showToast(message){ state.toast=message; render(); clearTimeout(window.__rpToast); window.__rpToast=setTimeout(()=>{state.toast='';render()},2800); }
function openAuth(mode='signup'){ state.authMode=mode; state.modal={type:'auth'}; render(); }
function closeModal(){ state.modal=null; render(); }

function shell(){
  const nav=[['Home','home'],['Discover','discover'],['Scripts','scripts'],['Projects','projects'],['Messages','messages'],['Profile','profile']];
  return `<div class="app-shell">
    <aside class="sidebar">
      <div class="sidebar-brand">${brand()}</div>
      <nav class="nav-list">${nav.map(([name,ico])=>`<button class="nav-item ${state.tab===name?'active':''}" onclick="setTab('${name}')">${icon(ico,19)}<span>${name}</span></button>`).join('')}</nav>
      <div class="sidebar-bottom">
        <button class="create-btn" onclick="openCreate('post')">${icon('plus',17)}<span>Create</span></button>
        <button class="mini-profile" onclick="setTab('Profile')">${avatar(state.user||'Guest','sm')}<span><b>${esc(state.user?.full_name||'Guest')}</b><small>${esc(state.user?.headline||'Explore ReelPage')}</small></span></button>
      </div>
    </aside>
    <main class="main">
      <header class="topbar">
        <div class="mobile-logo">${brand(true)}</div>
        <div class="searchbox">${icon('search',17)}<input value="${esc(state.search)}" oninput="queueSearch(this.value)" placeholder="Search filmmakers, scripts, projects..." aria-label="Search ReelPage"></div>
        <div class="top-actions"><button class="icon-btn" aria-label="Notifications" onclick="showToast('Notifications are ready for your ReelPage account.')">${icon('bell',18)}</button>${state.user?'<button class="profile-chip" onclick="setTab(\'Profile\')">'+avatar(state.user,'xs')+'<span>'+esc(state.user.full_name||'You')+'</span></button>':'<button class="sign-btn" onclick="openAuth(\'login\')">Sign in</button>'}</div>
      </header>
      <section class="content">${page()}</section>
    </main>
    <nav class="mobile-nav">${nav.map(([name,ico])=>`<button class="${state.tab===name?'active':''}" onclick="setTab('${name}')">${icon(ico,19)}<span>${name==='Scripts'?'Scripts':name}</span></button>`).join('')}</nav>
  </div>${state.modal?modal():''}${state.toast?`<div class="toast">${logoMark('xs')}<span>${esc(state.toast)}</span></div>`:''}`;
}

function page(){
  switch(state.tab){
    case 'Discover':return discoverPage();
    case 'Projects':return projectsPage();
    case 'Scripts':return scriptsPage();
    case 'Messages':return messagesPage();
    case 'Profile':return profilePage();
    case 'ProfileView':return publicProfilePage();
    default:return homePage();
  }
}

function homePage(){
  const feed=state.posts.length?state.posts:demoPosts();
  return `<div class="home-hero">
    <div class="hero-copy"><div class="eyebrow">NOLLYWOOD FIRST · GLOBAL BY DESIGN</div>
      <h1>Where stories<br><span>find people.</span></h1>
      <p>ReelPage is a professional network for actors, writers, directors, producers, crew and creative businesses — starting with Nigeria.</p>
      <div class="hero-actions"><button class="primary" onclick="setTab('Discover')">Discover creatives ${icon('arrow',16)}</button><button class="secondary" onclick="openAuth('signup')">Build your profile</button></div>
      <div class="hero-proof">${logoMark('sm')}<div><b>CONNECT · CREATE · COLLABORATE</b><small>A creative identity that travels with your work.</small></div></div>
    </div>
    <div class="hero-visual"><div class="halo"></div><div class="hero-tile">${logoMark('lg')}<strong>REEL<span>PAGE</span></strong><small>THE CREATIVE NETWORK</small></div><div class="float-card card-a"><b>Open opportunity</b><small>Casting · Lagos</small></div><div class="float-card card-b"><b>12 creatives</b><small>connected to this project</small></div></div>
  </div>
  <div class="section-head"><div><div class="eyebrow">THE NETWORK</div><h2>People you may want to know</h2><p>Find collaborators by craft, city, skill or ambition.</p></div><button class="text-btn" onclick="setTab('Discover')">Explore all ${icon('arrow',15)}</button></div>
  <div class="people-grid">${state.profiles.slice(0,4).map(profileCard).join('')}</div>
  <div class="home-columns">
    <section class="surface"><div class="section-head compact"><div><div class="eyebrow">CREATIVE FEED</div><h2>What’s happening</h2></div><button class="text-btn" onclick="openCreate('post')">Post ${icon('plus',14)}</button></div>${feed.slice(0,4).map(postCard).join('')}</section>
    <section class="surface"><div class="section-head compact"><div><div class="eyebrow">SCRIPT MARKETPLACE</div><h2>Stories ready to shoot</h2></div><button class="text-btn" onclick="setTab('Scripts')">Browse scripts ${icon('arrow',14)}</button></div>${(state.scripts.length?state.scripts:DEMO_SCRIPTS).slice(0,3).map(scriptCard).join('')}</section>
  </div>`;
}

function discoverPage(){
  const q=state.search.toLowerCase().trim();
  const people=state.profiles.filter(p=>(p.full_name+' '+(p.username||'')+' '+(p.headline||p.role||'')+' '+(p.location||'')+' '+countryDisplay(p.country)+' '+(p.skills||[]).join(' ')).toLowerCase().includes(q));
  return `<div class="page-title"><div><div class="eyebrow">DISCOVER</div><h1>Find your people.</h1><p>Search the creative industry by role, skill or location.</p></div><button class="primary" onclick="openAuth('signup')">Create your ReelPage</button></div>
  <div class="filter-row"><span class="filter active">All creatives</span><span class="filter">Actors</span><span class="filter">Writers</span><span class="filter">Directors</span><span class="filter">Producers</span><span class="filter">Crew</span></div>
  <div class="people-grid">${people.length?people.map(profileCard).join(''):'<div class="empty-state wide">'+logoMark('md')+'<h3>No creatives found</h3><p>Try another name, role, skill or location.</p></div>'}</div>`;
}

function projectsPage(){
  return `<div class="page-title"><div><div class="eyebrow">PROJECTS</div><h1>Stories in motion.</h1><p>Discover films and creative projects looking for collaborators.</p></div><button class="primary" onclick="openCreate('project')">${icon('plus',16)} New project</button></div><div class="project-grid">${state.projects.map(projectCard).join('')}</div>`;
}
function scriptCard(s){
  const seller=s.seller||state.profiles.find(p=>String(p.id)===String(s.seller_id))||{};
  const demo=String(s.id||'').startsWith('demo');
  const price=Number(s.price||0)===0?'Free':new Intl.NumberFormat('en-NG',{style:'currency',currency:s.currency||'NGN',maximumFractionDigits:0}).format(Number(s.price||0));
  return `<article class="script-card">
    <div class="script-poster"><span class="script-clapper">${icon('film',20)}</span><small>${esc(s.format||'Screenplay')}</small><strong>${esc(s.title)}</strong><em>${esc(s.genre||'Drama')}</em></div>
    <div class="script-body"><div class="script-seller">${avatar(seller,'xs')}<span><b>${esc(seller.full_name||'ReelPage writer')}</b><small>${esc(seller.headline||'Writer')}</small></span></div><p>${esc(s.logline||s.description||'A story looking for its next producer, director or cast.')}</p><div class="script-meta"><span>${esc(s.language||'English')}</span><span>${esc(s.status||'Available')}</span><strong>${price}</strong></div><div class="script-actions"><button class="secondary small" onclick="messageScriptSeller('${esc(s.seller_id)}')">Message writer</button><button class="primary small" onclick="requestScript('${esc(s.id)}')">${demo?'View script':'Request script'}</button></div></div>
  </article>`;
}
function scriptsPage(){
  const scripts=state.scripts.length?state.scripts:DEMO_SCRIPTS;
  return `<div class="page-title"><div><div class="eyebrow">SCRIPT MARKETPLACE</div><h1>Stories ready to become films.</h1><p>Browse screenplays, treatments and film ideas from writers across the ReelPage network.</p></div><button class="primary" onclick="openCreate('script')">${icon('plus',16)} List a script</button></div>
  <div class="marketplace-hero"><div><span class="eyebrow">FOR FILMMAKERS</span><h2>Stop searching for jobs. Start finding stories.</h2><p>Writers can present their work. Producers and directors can discover stories, start a conversation and build the right team.</p></div><div class="marketplace-stat"><strong>${scripts.length}</strong><span>scripts visible now</span></div></div>
  <div class="script-grid">${scripts.map(scriptCard).join('')}</div>`;
}
function opportunitiesPage(){
  return `<div class="page-title"><div><div class="eyebrow">OPPORTUNITIES</div><h1>Find the next door.</h1><p>Casting, writing, crew calls, fellowships and collaboration opportunities.</p></div><button class="primary" onclick="openCreate('opportunity')">${icon('plus',16)} Post opportunity</button></div><div class="opp-list">${state.opps.map(oppCard).join('')}</div>`;
}


function messagesPage(){
  if(!state.user)return `<div class="empty-state big">${logoMark('lg')}<div class="eyebrow">MESSAGING</div><h1>Your creative inbox.</h1><p>Sign in to message collaborators and keep project conversations in one place.</p><button class="primary" onclick="openAuth('login')">Sign in to messages</button></div>`;
  const people=state.profiles.filter(p=>p.id!==state.user.id);
  const selected=people.find(p=>p.id===state.selectedConversation)||people[0];
  const msgs=selected?state.messages.filter(m=>(m.sender_id===state.user.id&&m.recipient_id===selected.id)||(m.sender_id===selected.id&&m.recipient_id===state.user.id)):[],
    rows=people.map(p=>`<button class="conversation ${selected?.id===p.id?'active':''}" onclick="state.selectedConversation='${p.id}';loadMessages();render()">${avatar(p,'sm')}<span><b>${esc(p.full_name)}</b><small>${esc(p.headline||'Creative')}</small></span></button>`).join('');
  return `<div class="page-title"><div><div class="eyebrow">MESSAGES</div><h1>Make the connection count.</h1><p>Private project conversations belong here.</p></div></div><div class="message-layout"><div class="conversation-list">${rows||'<div class="empty-state">No other creatives yet.</div>'}</div><div class="chat"><div class="chat-head">${selected?avatar(selected,'sm'):'<span></span>'}<div><b>${esc(selected?.full_name||'Select a creative')}</b><small>${esc(selected?.headline||'')}</small></div></div><div class="chat-body">${msgs.length?msgs.map(m=>`<div class="bubble ${m.sender_id===state.user.id?'mine':''}">${esc(m.body)}<small>${fmtDate(m.created_at)}</small></div>`).join(''):'<div class="empty-state"><p>Start a professional conversation.</p></div>'}</div>${selected?'<form class="chat-form" onsubmit="sendMessage(event)"><input id="messageBody" placeholder="Write a message..."><button class="primary" type="submit">'+icon('send',16)+'</button></form>':''}</div></div>`;
}

function profilePage(){
  if(!state.user)return `<div class="profile-prompt">${logoMark('lg')}<div class="eyebrow">YOUR CREATIVE IDENTITY</div><h1>Claim your ReelPage.</h1><p>Build a professional home for your headshot, skills, projects and opportunities.</p><button class="primary" onclick="openAuth('signup')">Create profile ${icon('arrow',16)}</button></div>`;
  const u=state.user, mine=state.projects.filter(p=>p.owner_id===u.id);
  return `<div class="profile-hero"><div class="cover ${u.cover_url?'has-image':''}" ${u.cover_url?`style="background-image:url('${esc(u.cover_url)}')"`:''}><button class="cover-btn" onclick="document.getElementById('coverInput').click()">${icon('plus',14)} Cover photo</button><input id="coverInput" hidden type="file" accept="image/*" onchange="uploadProfileImage(this.files[0],'covers','cover_url')"></div><div class="identity-row">${avatar(u,'profile-avatar')}<div class="identity-main"><div class="eyebrow">@${esc(u.username||'creative')}</div><h1>${esc(u.full_name||'ReelPage member')}</h1><p>${esc(u.headline||'Creative professional')} · ${esc(profilePlace(u))}</p><div class="stats"><span><b>${mine.length}</b> projects</span><span><b>${u.connections_count||0}</b> connections</span><span><b>${u.followers_count||0}</b> followers</span></div></div><div class="profile-actions"><button class="secondary" onclick="openCreate('profile')">Edit profile</button><button class="premium-btn" onclick="openPremium()">✦ ${state.premium?'ReelPage Pro':'Go Pro · ₦5,000/month'}</button></div></div></div>
  <div class="profile-layout"><div class="profile-main"><section class="surface"><div class="section-head compact"><div><div class="eyebrow">ABOUT</div><h2>Professional story</h2></div></div><p class="bio-text">${esc(u.bio||'Tell the industry what you make, what you care about and what you want to create next.')}</p><div class="tag-row">${(u.skills||[]).map(s=>`<span>${esc(s)}</span>`).join('')}</div></section><section class="surface"><div class="section-head compact"><div><div class="eyebrow">WORK</div><h2>Featured projects</h2></div><button class="text-btn" onclick="openCreate('project')">${icon('plus',14)} Add</button></div>${mine.length?mine.map(projectRow).join(''):'<div class="empty-inline">'+logoMark('sm')+'<div><b>Your body of work starts here.</b><small>Add a film, script or project.</small></div></div>'}</section></div>
  <aside class="profile-aside"><section class="surface"><div class="eyebrow">PROFILE CHECKLIST</div><h3>Make your work discoverable</h3>${checkItem(!!u.avatar_url,'Profile photo','Upload a clear headshot.')}${checkItem(!!u.headline,'Headline','Tell people what you do.')}${checkItem(!!u.bio,'About','Give your story context.')}${checkItem((u.skills||[]).length>0,'Skills','Add the craft people can hire you for.')}</section><section class="surface brand-card">${logoMark('sm')}<b>One identity. Many creative possibilities.</b><small>ReelPage connects people, projects and opportunities.</small></section></aside></div>`;
}

function publicProfilePage(){
  const p=state.profiles.find(x=>String(x.id)===String(state.viewedProfileId));
  if(!p) return '<div class="empty-state big">'+logoMark('lg')+'<div class="eyebrow">PROFILE</div><h1>Creative not found.</h1><p>This profile may no longer be available.</p><button class="primary" onclick="setTab(\'Discover\')">Back to Discover</button></div>';
  const mine=state.projects.filter(x=>String(x.owner_id)===String(p.id));
  const isSelf=state.user&&String(state.user.id)===String(p.id);
  const tab=state.profileViewTab||'About';
  const publicPosts=state.posts.filter(x=>String(x.author?.id)===String(p.id));
  const followLabel=state.following.has(p.id)?'Following':'Follow';
  const content=tab==='Portfolio'
    ? `<div class="public-grid">${mine.length?mine.map(projectCard).join(''):'<div class="empty-inline">'+logoMark('sm')+'<div><b>No projects published yet.</b><small>This creative has not added public projects.</small></div></div>'}</div>`
    : tab==='Projects'
    ? `<div class="public-project-list">${mine.length?mine.map(projectRow).join(''):'<div class="empty-inline">'+logoMark('sm')+'<div><b>No projects yet.</b><small>Projects will appear here when published.</small></div></div>'}</div>`
    : tab==='Skills'
    ? `<div class="skills-panel"><div class="tag-row big">${(p.skills||[]).map(s=>'<span>'+esc(s)+'</span>').join('')||'<span>Skills not added yet</span>'}</div><div class="surface mini-surface"><div class="eyebrow">CREATIVE FOCUS</div><h3>${esc(p.headline||'Creative professional')}</h3><p>${esc(p.bio||'This creative has not added a public biography yet.')}</p></div></div>`
    : `<div class="public-about-grid"><section class="surface"><div class="eyebrow">ABOUT</div><h2>Professional story</h2><p class="bio-text">${esc(p.bio||'This creative has not added a public biography yet.')}</p><div class="tag-row big">${(p.skills||[]).map(s=>'<span>'+esc(s)+'</span>').join('')}</div></section><section class="surface"><div class="eyebrow">RECENT ACTIVITY</div><h2>Creative feed</h2>${publicPosts.length?publicPosts.slice(0,3).map(postCard).join(''):'<div class="empty-inline">'+logoMark('sm')+'<div><b>No public posts yet.</b><small>Updates will appear here when they publish.</small></div></div>'}</section></div>`;
  return `<div class="profile-public-page">
    <button class="back-link" onclick="setTab('Discover')">${icon('arrow',15)} Back to Discover</button>
    <section class="public-profile-hero">
      <div class="public-cover ${p.cover_url?'has-image':''}" ${p.cover_url?`style="background-image:url('${esc(p.cover_url)}')"`:''}></div>
      <div class="public-identity">
        <div class="public-avatar-wrap">${avatar(p,'public-avatar')}</div>
        <div class="public-identity-main">
          <div class="eyebrow">${p.is_verified?'VERIFIED CREATIVE · ':''}@${esc(p.username||'creative')}</div>
          <h1>${esc(p.full_name||'ReelPage member')}</h1>
          <p>${esc(p.headline||'Creative professional')} · ${esc(profilePlace(p))}</p>
          <div class="stats"><span><b>${mine.length}</b> projects</span><span><b>${p.connections_count||0}</b> connections</span><span><b>${p.followers_count||0}</b> followers</span></div>
        </div>
        <div class="public-actions">
          ${isSelf?'<button class="secondary" onclick="setTab(\'Profile\')">Edit profile</button>':`<button class="primary" onclick="connectTo('${esc(p.id)}')">Connect</button><button class="secondary" onclick="followTo('${esc(p.id)}')">${followLabel}</button><button class="secondary" onclick="messagePerson('${esc(p.id)}')">Message</button>`}
        </div>
      </div>
      <div class="profile-tabs">${['About','Portfolio','Projects','Skills'].map(x=>`<button class="${tab===x?'active':''}" onclick="setProfileViewTab('${x}')">${x}</button>`).join('')}</div>
    </section>
    ${content}
  </div>`;
}
function checkItem(done,title,desc){return `<div class="check-item"><span class="${done?'done':''}">${done?'✓':'○'}</span><div><b>${title}</b><small>${desc}</small></div></div>`;}
function profileCard(p){
  return `<article class="person-card" onclick="openPublicProfile('${esc(p.id)}')">${avatar(p,'xl')}<div class="verified">${p.is_verified?'✓':''}</div><h3>${esc(p.full_name||p.name)}</h3><p>${esc(p.headline||p.role||'Creative')}</p><small>${esc(profilePlace(p))}</small><div class="tag-row small-tags">${(p.skills||[]).slice(0,2).map(s=>`<span>${esc(s)}</span>`).join('')}</div><button class="connect-btn" onclick="event.stopPropagation();followTo('${esc(p.id)}')">${state.following.has(p.id)?'Following':'Follow'}</button></article>`;
}
function projectCard(p){
  const image=p.image_url||'';
  const bg=image?' style="background-image:linear-gradient(180deg,rgba(3,8,14,.08),rgba(3,8,14,.94)),url(&quot;'+esc(image)+'&quot;)"':'';
  return '<article class="project-card"><div class="project-poster '+(image?'has-image':'')+'"'+bg+'>'+logoMark('sm')+'<span>'+esc(p.format||'Creative Project')+'</span><strong>'+esc(p.title)+'</strong><small>'+esc(p.genre||'')+'</small></div><div class="project-info"><span class="tiny">'+esc(p.status||'In Development')+'</span><h3>'+esc(p.title)+'</h3><p>'+esc(p.description||p.logline||'')+'</p><div class="project-foot"><span>'+esc(p.owner_id===state.user?.id?'Your project':'Creative project')+'</span><button class="text-btn" onclick="showToast(&quot;Project details are ready.&quot;)">View '+icon('arrow',13)+'</button></div></div></article>';
}
function projectRow(p){return `<div class="data-row"><div class="mini-poster">${logoMark('xs')}</div><div><b>${esc(p.title)}</b><small>${esc([p.format,p.genre,p.status].filter(Boolean).join(' · '))}</small></div></div>`;}
function oppCard(o){
  const image=o.image_url||'';
  const bg=image?' style="background-image:linear-gradient(135deg,rgba(5,12,20,.08),rgba(5,12,20,.88)),url(&quot;'+esc(image)+'&quot;)"':'';
  return '<article class="opp-card"><div class="opp-icon '+(image?'has-image':'')+'"'+bg+'>'+icon('opportunities',20)+'</div><div class="opp-main"><div class="tiny">'+esc(o.opportunity_type||'Opportunity')+' · '+esc(o.location||'Remote')+'</div><h3>'+esc(o.title)+'</h3><p>'+esc(o.description||'')+'</p><div class="opp-meta"><span>'+esc(o.compensation||'See details')+'</span><span>'+(o.deadline?'Deadline '+esc(fmtDate(o.deadline)):'Open now')+'</span></div></div><button class="secondary small" onclick="applyOpportunity(\''+esc(o.id)+'\')">View / Apply</button></article>';
}
function oppRow(o){return `<div class="data-row"><div class="opp-dot">${icon('opportunities',17)}</div><div><b>${esc(o.title)}</b><small>${esc([o.opportunity_type,o.location,o.compensation].filter(Boolean).join(' · '))}</small></div><button class="arrow-btn" onclick="applyOpportunity('${esc(o.id)}')">${icon('arrow',16)}</button></div>`;}
function demoPosts(){return [
  {id:'demo-post-1',content:'ReelPage is building a place where the next great Nigerian story can meet the people who can bring it to life.',author:DEMO.profiles[0],created_at:'Now',likes_count:24,media_url:'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=82'},
  {id:'demo-post-2',content:'Looking for collaborators should feel professional. Your craft, credits and ideas deserve a proper home.',author:DEMO.profiles[1],created_at:'Today',likes_count:17,media_url:'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=1200&q=82'}
];}
function postCard(p){
  const a=p.author||{},liked=state.liked.has(p.id);
  return `<article class="post-card"><div class="post-head">${avatar(a,'sm')}<div><b>${esc(a.full_name||'ReelPage member')}</b><small>${esc(a.headline||'Creative')} · ${esc(p.created_at||'Now')}</small></div></div><p class="post-text">${esc(p.content)}</p>${p.media_url?'<img class="post-media" src="'+esc(p.media_url)+'" alt="Creative post media" loading="lazy">':''}<div class="post-actions"><button class="${liked?'liked':''}" onclick="toggleLike('${esc(p.id)}')">${icon('heart',17)} <span>${p.likes_count||0}</span></button><button onclick="openComments('${esc(p.id)}')">${icon('messages',17)} Comment</button><button onclick="sharePost('${esc(p.id)}')">${icon('arrow',17)} Share</button></div></article>`;
}

function ndaModalHtml(){
  const s=state.modal?.script||{};
  return `<div class="backdrop" onclick="if(event.target===this)closeModal()"><div class="modal nda-modal"><button class="modal-close" onclick="closeModal()">${icon('close',19)}</button><div class="eyebrow">CONFIDENTIAL SCRIPT ACCESS</div><h2>Sign the ReelPage NDA before reading.</h2><p>You are requesting a private sample from <b>${esc(s.seller?.full_name||'the writer')}</b>. ReelPage stores only a maximum of 10 sample pages.</p><div class="nda-box">${esc(REELPAGE_NDA_TEXT)}</div><label class="nda-check"><input id="ndaAgree" type="checkbox"> I have read and agree to the ReelPage NDA.</label><button class="primary full" onclick="signScriptNda()">Sign NDA & view sample</button></div></div>`;
}
function sampleModalHtml(){
  const s=state.modal?.script||{}, sample=state.modal?.sample||{}, writer=s.seller?.full_name||'the writer';
  return `<div class="backdrop script-reader-backdrop"><div class="modal script-reader"><button class="modal-close" onclick="closeModal()">${icon('close',19)}</button><div class="reader-head"><div><div class="eyebrow">NDA PROTECTED SAMPLE</div><h2>${esc(s.title||'Script sample')}</h2></div><span>${esc(sample.page_count||0)}/10 pages</span></div><div class="reader-notice">Confidential evaluation copy · Watermarked for ${esc(writer)}.</div><div class="script-pages">${(sample.pages||[]).map((p,i)=>`<article class="script-page"><div class="page-number">PAGE ${i+1}</div><div class="watermark-grid">${Array.from({length:12},()=>'<span>REELPAGE · '+esc(writer)+'</span>').join('')}</div><pre>${esc(p)}</pre></article>`).join('')}</div></div></div>`;
}
function premiumModalHtml(){
  return `<div class="backdrop" onclick="if(event.target===this)closeModal()"><div class="modal premium-modal"><button class="modal-close" onclick="closeModal()">${icon('close',19)}</button><div class="eyebrow">REELPAGE PRO</div><h2>Put your creative identity in the spotlight.</h2><p>A premium profile gives your work a richer presentation and additional discovery surfaces across the network.</p><div class="premium-list"><b>✦ Premium profile badge</b><b>✦ Expanded portfolio presentation</b><b>✦ Priority discovery surfaces</b><b>✦ Profile insights</b><b>✦ Enhanced creative storytelling</b></div><div class="premium-price"><strong>₦5,000</strong><span>/ month</span></div><button class="primary full" onclick="startPremiumCheckout()">Upgrade to ReelPage Pro</button><small class="modal-note">Live payment activation requires verified payment-provider configuration. Your profile will only become premium after payment confirmation.</small></div></div>`;
}
function modal(){
  const t=state.modal.type;
  if(t==='auth'){
    const signupFields=state.authMode==='signup'
      ? '<input id="authName" class="input" placeholder="Full name" autocomplete="name" oninput="updateUsernamePreview()"><div class="username-preview"><span>USERNAME</span><b id="usernamePreview">Your name will become your username</b></div><select id="authRole" class="input" aria-label="Professional role"><option value="" selected disabled>Select your professional role</option><option value="Actor">Actor</option><option value="Writer">Writer</option><option value="Director">Director</option><option value="Producer">Producer</option><option value="Executive Producer">Executive Producer</option><option value="Cinematographer / DOP">Cinematographer / DOP</option><option value="Editor">Editor</option><option value="Production Designer">Production Designer</option><option value="Sound Designer">Sound Designer</option><option value="Composer">Composer</option><option value="Casting Director">Casting Director</option><option value="Script Supervisor">Script Supervisor</option><option value="Colorist">Colorist</option><option value="VFX Artist">VFX Artist</option><option value="Animator">Animator</option><option value="Makeup Artist">Makeup Artist</option><option value="Costume Designer">Costume Designer</option><option value="Gaffer">Gaffer</option><option value="Grip">Grip</option><option value="1st Assistant Director">1st Assistant Director</option><option value="Film Critic">Film Critic</option><option value="Distributor">Distributor</option><option value="Studio / Creative Business">Studio / Creative Business</option><option value="Other Creative">Other Creative</option></select><label class="field-label" for="authDob">Date of birth</label><input id="authDob" class="input" type="date" autocomplete="bday" max="2010-09-28" min="1900-01-01"><small class="field-hint">Used for age eligibility and kept private on your public profile.</small><label class="field-label" for="authCountry">Country</label><select id="authCountry" class="input" autocomplete="country">'+countryOptions('NG')+'</select><label class="field-label" for="authLocation">City / region</label><input id="authLocation" class="input" placeholder="City, state or region" autocomplete="address-level2">'
      : '';
    const loginFields=state.authMode==='login'?'<input id="authUsername" class="input" placeholder="Username" autocomplete="username">':'';
    return '<div class="backdrop" onclick="if(event.target===this)closeModal()"><div class="modal auth-modal"><button class="modal-close" onclick="closeModal()">'+icon('close',19)+'</button><div class="auth-logo">'+brand()+'</div><div class="auth-tabs"><button class="'+(state.authMode==='signup'?'active':'')+'" onclick="state.authMode=\'signup\';render()">Create account</button><button class="'+(state.authMode==='login'?'active':'')+'" onclick="state.authMode=\'login\';render()">Sign in</button></div><div class="eyebrow">'+(state.authMode==='signup'?'JOIN THE NETWORK':'WELCOME BACK')+'</div><h2>'+ (state.authMode==='signup'?'Your creative identity starts here.':'Welcome back to ReelPage.')+'</h2><p>Username and password only. No email address or email verification is used for your ReelPage login.</p>'+signupFields+loginFields+'<input id="authPassword" class="input" type="password" placeholder="Password · 8+ characters" autocomplete="'+(state.authMode==='signup'?'new-password':'current-password')+'"><button class="primary full" onclick="submitAuth()" '+(state.loading?'disabled':'')+'>'+(state.loading?'Opening secure account…':state.authMode==='signup'?'Create my ReelPage →':'Sign in →')+'</button><small class="modal-note">ReelPage uses Supabase Auth behind the scenes; the email is an internal account identifier, not collected from you.</small></div></div>';
  }
  if(t==='person'){const p=state.selectedPerson; if(p){openPublicProfile(p.id); return '';} return '';}
  if(t==='nda')return ndaModalHtml();
  if(t==='scriptSample')return sampleModalHtml();
  if(t==='premium')return premiumModalHtml();
  if(t==='profile')return `<div class="backdrop" onclick="if(event.target===this)closeModal()"><div class="modal"><button class="modal-close" onclick="closeModal()">${icon('close',19)}</button><div class="eyebrow">YOUR REELPAGE</div><h2>Edit your creative identity.</h2><p>Your profile is your professional calling card.</p><label class="photo-upload">${avatar(state.user,'edit-avatar')}<span>Change profile photo<input id="avatarInput" type="file" accept="image/*" hidden onchange="uploadProfileImage(this.files[0],'avatars','avatar_url')"></span></label><input id="editName" class="input" value="${esc(state.user.full_name||'')}" placeholder="Full name"><input id="editHeadline" class="input" value="${esc(state.user.headline||'')}" placeholder="Professional headline"><label class="field-label" for="editCountry">Country</label><select id="editCountry" class="input">${countryOptions(state.user.country||'NG')}</select><input id="editLocation" class="input" value="${esc(state.user.location||'')}" placeholder="City, state or region"><textarea id="editBio" class="input area" placeholder="About you">${esc(state.user.bio||'')}</textarea><input id="editSkills" class="input" value="${esc((state.user.skills||[]).join(', '))}" placeholder="Skills separated by commas"><button class="primary full" onclick="saveProfile()">Save profile →</button></div></div>`;
  if(t==='post')return `<div class="backdrop" onclick="if(event.target===this)closeModal()"><div class="modal"><button class="modal-close" onclick="closeModal()">${icon('close',19)}</button><div class="auth-logo">${brand()}</div><div class="eyebrow">CREATIVE FEED</div><h2>What are you working on?</h2><p>Share an update, call for collaborators or a thought from your creative journey.</p><textarea id="postContent" class="input area" placeholder="Tell the network what is happening..."></textarea><label class="upload-label">${icon('film',16)} Add image<input id="postMedia" type="file" accept="image/*" hidden></label><button class="primary full" onclick="createPost()">Publish post →</button></div></div>`;
  if(t==='script')return `<div class="backdrop" onclick="if(event.target===this)closeModal()"><div class="modal"><button class="modal-close" onclick="closeModal()">${icon('close',19)}</button><div class="eyebrow">SCRIPT MARKETPLACE</div><h2>List a story filmmakers can discover.</h2><p>Share the idea, format and asking price. Keep the actual screenplay private until you choose to share it.</p><input id="scriptTitle" class="input" placeholder="Script title"><input id="scriptLogline" class="input" placeholder="One-line logline"><select id="scriptFormat" class="input"><option>Short Film</option><option>Feature Film</option><option>Series</option><option>Documentary</option><option>Web Series</option><option>Treatment</option></select><input id="scriptGenre" class="input" placeholder="Genre"><input id="scriptPrice" class="input" type="number" min="0" step="1000" placeholder="Price in NGN (0 = free)"><textarea id="scriptDescription" class="input area" placeholder="Tell filmmakers what makes this story special..."></textarea><textarea id="scriptSamplePages" class="input area script-sample-input" placeholder="Optional private sample. Separate pages with: --- PAGE ---&#10;Maximum 10 pages. Never upload your full screenplay."></textarea><small class="field-hint">Only a maximum 10-page sample can be stored for marketplace reading.</small><button class="primary full" onclick="createScript()">Publish protected script listing →</button></div></div>`;
  if(t==='project')return `<div class="backdrop" onclick="if(event.target===this)closeModal()"><div class="modal"><button class="modal-close" onclick="closeModal()">${icon('close',19)}</button><div class="eyebrow">NEW PROJECT</div><h2>Put your work in motion.</h2><input id="createTitle" class="input" placeholder="Project title"><input id="createMeta" class="input" placeholder="Format · Genre e.g. Short Film · Drama"><textarea id="createDesc" class="input area" placeholder="Logline or project description"></textarea><button class="primary full" onclick="createProject()">Create project →</button></div></div>`;
  return `<div class="backdrop" onclick="if(event.target===this)closeModal()"><div class="modal"><button class="modal-close" onclick="closeModal()">${icon('close',19)}</button><div class="eyebrow">NEW OPPORTUNITY</div><h2>Open a door for someone.</h2><input id="oppTitle" class="input" placeholder="Opportunity title"><input id="oppType" class="input" placeholder="Type · Casting, Writing, Crew..."><input id="oppLocation" class="input" placeholder="Location or Remote"><textarea id="oppDesc" class="input area" placeholder="What are you looking for?"></textarea><input id="oppComp" class="input" placeholder="Compensation e.g. Paid / Negotiable"><button class="primary full" onclick="createOpportunity()">Post opportunity →</button></div></div>`;
}

function openCreate(type){ if(!state.user && type!=='profile'){openAuth('signup');return;} state.modal={type}; render(); }
function openPerson(id){state.selectedPerson=state.profiles.find(p=>p.id===id);if(state.selectedPerson)state.modal={type:'person'};render();}
async function messagePerson(id){state.modal=null;state.selectedConversation=id;state.tab='Messages';await loadMessages();render();}
function makeUsername(name){
  return String(name||'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'').slice(0,24);
}
function updateUsernamePreview(){
  const el=document.getElementById('usernamePreview');
  const name=document.getElementById('authName')?.value||'';
  if(el)el.textContent=makeUsername(name)||'Your name will become your username';
}
async function submitAuth(){
  const password=document.getElementById('authPassword')?.value||'';
  if(password.length<8)return showToast('Use at least 8 characters for your password.');
  const payload={action:state.authMode,password};
  if(state.authMode==='login'){
    const username=(document.getElementById('authUsername')?.value||'').trim().toLowerCase();
    if(!/^[a-z0-9_]{3,24}$/.test(username))return showToast('Username must be 3–24 letters, numbers or underscores.');
    payload.username=username;
  }else{
    payload.full_name=(document.getElementById('authName')?.value||'').trim();
    payload.role=(document.getElementById('authRole')?.value||'').trim();
    payload.date_of_birth=(document.getElementById('authDob')?.value||'').trim();
    payload.country=(document.getElementById('authCountry')?.value||'').trim();
    payload.location=(document.getElementById('authLocation')?.value||'').trim();
    if(payload.full_name.length<2)return showToast('Please enter your full name.');
    if(!payload.role)return showToast('Please select your professional role.');
    if(!payload.date_of_birth)return showToast('Please select your date of birth.');
    if(!payload.country)return showToast('Please select your country.');
    if(!payload.location)return showToast('Please enter your city or region.');
    payload.username=makeUsername(payload.full_name);
  }
  state.loading=true;render();
  try{
    const res=await fetch(AUTH_URL,{method:'POST',headers:{'Content-Type':'application/json','apikey':SUPABASE_KEY},body:JSON.stringify(payload)});
    const data=await res.json();
    if(!res.ok)throw new Error(data.error||'Authentication failed.');
    if(!data.session)throw new Error('No session was returned. Please try again.');
    await sb.auth.setSession(data.session);
    if(state.authMode==='signup'){
      const profileUpdate=await sb.from('profiles').update({country:payload.country,location:payload.location}).eq('id',data.user.id);
      if(profileUpdate.error)throw new Error(profileUpdate.error.message);
    }
    await loadUser(); state.loading=false; state.modal=null; await hydrate(); showToast(state.authMode==='signup'?'Welcome to ReelPage. Your profile is live.':'Welcome back to ReelPage.');
  }catch(e){state.loading=false;render();showToast(e.message||'Authentication failed.');}
}
async function loadUser(){
  const {data}=await sb.auth.getUser();
  if(!data.user){state.user=null;return;}
  const {data:profile}=await sb.from('profiles').select('*').eq('id',data.user.id).maybeSingle();
  state.user=profile||{id:data.user.id,full_name:data.user.user_metadata?.full_name||'ReelPage member',username:data.user.user_metadata?.username||'',headline:data.user.user_metadata?.role||'Creative',location:data.user.user_metadata?.location||'Nigeria',skills:[]};
}
async function signOut(){await sb.auth.signOut();state.user=null;state.tab='Home';showToast('Signed out of ReelPage.');}
async function uploadFile(file,bucket){
  if(!file||!state.user)return null;
  if(!file.type.startsWith('image/')){showToast('Please choose an image file.');return null;}
  if(file.size>5*1024*1024){showToast('Please keep images under 5MB.');return null;}
  const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,'_'), path=state.user.id+'/'+Date.now()+'-'+safe;
  const r=await sb.storage.from(bucket).upload(path,file,{upsert:true,cacheControl:'3600',contentType:file.type});
  if(r.error){showToast(r.error.message);return null;}
  return sb.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
async function uploadProfileImage(file,bucket,field){
  const url=await uploadFile(file,bucket); if(!url)return;
  const r=await sb.from('profiles').update({[field]:url}).eq('id',state.user.id);
  if(r.error)return showToast(r.error.message);
  state.user[field]=url; state.modal=null; await hydrate(); showToast(field==='avatar_url'?'Profile photo updated.':'Cover photo updated.');
}
async function saveProfile(){
  const updates={full_name:document.getElementById('editName').value.trim(),headline:document.getElementById('editHeadline').value.trim(),location:document.getElementById('editLocation').value.trim(),country:document.getElementById('editCountry').value.trim(),bio:document.getElementById('editBio').value.trim(),skills:document.getElementById('editSkills').value.split(',').map(x=>x.trim()).filter(Boolean).slice(0,20)};
  const r=await sb.from('profiles').update(updates).eq('id',state.user.id); if(r.error)return showToast(r.error.message);
  Object.assign(state.user,updates);state.modal=null;await hydrate();showToast('Profile updated.');
}
async function createPost(){
  const content=document.getElementById('postContent').value.trim();if(!content)return showToast('Write something first.');
  let media_url=null;const file=document.getElementById('postMedia').files?.[0];if(file)media_url=await uploadFile(file,'post-media');
  const r=await sb.from('posts').insert({author_id:state.user.id,content,media_url});if(r.error)return showToast(r.error.message);
  state.modal=null;await hydrate();showToast('Published to your network.');
}
async function createProject(){
  const title=document.getElementById('createTitle').value.trim();if(!title)return showToast('Give the project a title.');
  const meta=document.getElementById('createMeta').value.split('·').map(x=>x.trim());
  const desc=document.getElementById('createDesc').value.trim();
  const r=await sb.from('projects').insert({owner_id:state.user.id,title,description:desc,format:meta[0]||'Creative Project',genre:meta[1]||null,status:'In Development'});
  if(r.error)return showToast(r.error.message);state.modal=null;await hydrate();showToast('Project created.');
}
async function createOpportunity(){
  const title=document.getElementById('oppTitle').value.trim();if(!title)return showToast('Give the opportunity a title.');
  const r=await sb.from('opportunities').insert({creator_id:state.user.id,title,opportunity_type:document.getElementById('oppType').value.trim()||'Other',location:document.getElementById('oppLocation').value.trim()||'Remote',description:document.getElementById('oppDesc').value.trim(),compensation:document.getElementById('oppComp').value.trim()||null,status:'Open'});
  if(r.error)return showToast(r.error.message);state.modal=null;await hydrate();showToast('Opportunity posted.');
}
async function createScript(){
  if(!state.user)return openAuth('signup');
  const title=document.getElementById('scriptTitle')?.value.trim();
  const logline=document.getElementById('scriptLogline')?.value.trim();
  const format=document.getElementById('scriptFormat')?.value||'Short Film';
  const genre=document.getElementById('scriptGenre')?.value.trim()||null;
  const description=document.getElementById('scriptDescription')?.value.trim()||null;
  const price=Math.max(0,Number(document.getElementById('scriptPrice')?.value||0));
  const rawPages=document.getElementById('scriptSamplePages')?.value||'';
  const pages=rawPages.split(/\n\s*---+\s*PAGE\s*---+\s*\n|\f/).map(x=>x.trim()).filter(Boolean);
  if(!title||!logline)return showToast('Give the script a title and logline.');
  if(pages.length>10)return showToast('ReelPage allows a maximum of 10 sample pages.');
  const r=await sb.from('script_listings').insert({seller_id:state.user.id,title,logline,description,format,genre,price,currency:'NGN',status:'Available'}).select('id,seller_id,title,logline,description,format,genre,language,price,currency,status,cover_url,created_at').single();
  if(r.error)return showToast(r.error.message);
  if(pages.length){
    const sr=await sb.from('script_samples').upsert({script_id:r.data.id,writer_id:state.user.id,page_count:pages.length,pages,updated_at:new Date().toISOString()});
    if(sr.error){await sb.from('script_listings').delete().eq('id',r.data.id);return showToast(sr.error.message);}
  }
  state.modal=null;await hydrate();showToast('Your script listing is live. The sample stays locked until an interested filmmaker signs the ReelPage NDA.');
}
const REELPAGE_NDA_TEXT='REELPAGE SCRIPT CONFIDENTIALITY AGREEMENT (NDA) v1.0. The interested viewer agrees to keep the script and sample pages confidential, use them only to evaluate a potential creative or commercial collaboration, and not reproduce, distribute, publish, forward, sell or exploit the material without the writer’s permission. This agreement does not transfer copyright or ownership. Commercial transactions remain between the parties.';
async function signScriptNda(){
  if(!state.user||!state.modal?.script)return openAuth('login');
  const s=state.modal.script;
  if(!document.getElementById('ndaAgree')?.checked)return showToast('Please confirm that you agree to the NDA.');
  const r=await sb.from('script_ndas').insert({script_id:s.id,viewer_id:state.user.id,writer_id:s.seller_id,agreement_text:REELPAGE_NDA_TEXT});
  if(r.error&&r.error.code!=='23505')return showToast(r.error.message);
  state.modal=null;await openScriptSample(s.id);
}
async function openScriptSample(id){
  if(!state.user)return openAuth('login');
  const n=await sb.from('script_ndas').select('id').eq('script_id',id).eq('viewer_id',state.user.id).maybeSingle();
  if(!n.data)return requestScript(id);
  const r=await sb.from('script_samples').select('script_id,writer_id,page_count,pages').eq('script_id',id).maybeSingle();
  if(r.error)return showToast(r.error.message);
  if(!r.data)return showToast('The writer has not uploaded sample pages yet.');
  const s=state.scripts.find(x=>String(x.id)===String(id));
  state.modal={type:'scriptSample',script:s,sample:r.data};render();
}
async function requestScript(id){
  if(String(id).startsWith('demo'))return showToast('Demo listing — sign in and publish real scripts to use the marketplace.');
  if(!state.user)return openAuth('signup');
  const s=state.scripts.find(x=>String(x.id)===String(id));
  if(!s)return showToast('Script listing not found.');
  if(String(s.seller_id)===String(state.user.id))return showToast('This is your own script.');
  const n=await sb.from('script_ndas').select('id').eq('script_id',id).eq('viewer_id',state.user.id).maybeSingle();
  if(n.data){openScriptSample(id);return;}
  state.modal={type:'nda',script:s};render();
}
async function messageScriptSeller(sellerId,prefill){
  if(!state.user)return openAuth('signup');
  if(String(sellerId)===String(state.user.id))return showToast('That is your own script listing.');
  state.selectedConversation=sellerId;state.tab='Messages';
  await loadMessages();render();
  if(prefill){setTimeout(()=>{const input=document.getElementById('messageBody');if(input){input.value=prefill;input.focus();}},0);}
}
async function applyOpportunity(id){
  if(String(id).startsWith('demo'))return openAuth('signup');
  if(!state.user)return openAuth('signup');
  const r=await sb.from('opportunity_applications').upsert({opportunity_id:id,applicant_id:state.user.id,status:'submitted'});
  showToast(r.error?(r.error.message==='duplicate key value violates unique constraint "opportunity_applications_pkey"'?'Already applied.':r.error.message):'Application submitted.');
}
async function connectTo(id){
  if(!state.user)return openAuth('signup');
  if(String(id).startsWith('demo'))return showToast('Create your ReelPage account to connect with real creatives.');
  if(id===state.user.id)return showToast('That is your own profile.');
  const r=await sb.from('connections').upsert({requester_id:state.user.id,addressee_id:id,status:'pending'});
  showToast(r.error?(r.error.code==='23505'?'Connection request already sent.':r.error.message):'Connection request sent.');
}
async function followTo(id){
  if(!state.user)return openAuth('signup');
  if(String(id).startsWith('demo'))return showToast('Follow preview enabled — create your account to follow real creatives.');
  if(id===state.user.id)return showToast('That is your own profile.');
  if(state.following.has(id)){await sb.from('follows').delete().eq('follower_id',state.user.id).eq('following_id',id);state.following.delete(id);showToast('Unfollowed.');}
  else{const r=await sb.from('follows').insert({follower_id:state.user.id,following_id:id});if(r.error&&r.error.code!=='23505')return showToast(r.error.message);state.following.add(id);showToast('Following.');}
  await hydrate();
}
async function toggleLike(id){
  if(!state.user)return openAuth('signup');
  if(String(id).startsWith('demo'))return showToast('Create your ReelPage account to like live posts.');
  if(state.liked.has(id))await sb.from('post_likes').delete().eq('post_id',id).eq('user_id',state.user.id);
  else await sb.from('post_likes').insert({post_id:id,user_id:state.user.id});
  await hydrate();
}
async function loadMessages(){
  if(!state.user)return;
  const r=await sb.from('messages').select('id,sender_id,recipient_id,project_id,body,read_at,created_at').or(`sender_id.eq.${state.user.id},recipient_id.eq.${state.user.id}`).order('created_at',{ascending:true}).limit(120);
  state.messages=r.data||[];
}
async function sendMessage(e){
  e.preventDefault();const body=document.getElementById('messageBody').value.trim();const recipient=state.selectedConversation;if(!body||!recipient)return;
  const r=await sb.from('messages').insert({sender_id:state.user.id,recipient_id:recipient,body});if(r.error)return showToast(r.error.message);
  await loadMessages();render();
}
async function hydrate(){
  try{
    const [p,pr,scripts,posts,follows,mePremium]=await Promise.all([
      sb.from('profiles').select('id,username,full_name,role,headline,bio,location,country,avatar_url,cover_url,skills,is_verified,followers_count,connections_count,created_at').order('created_at',{ascending:false}).limit(60),
      sb.from('projects').select('id,owner_id,title,logline,description,format,genre,status,poster_url,created_at').order('created_at',{ascending:false}).limit(30),
      sb.from('script_listings').select('id,seller_id,title,logline,description,format,genre,language,price,currency,status,cover_url,created_at,profiles(id,full_name,username,headline,avatar_url)').neq('status','Draft').order('created_at',{ascending:false}).limit(30),
      sb.from('posts').select('id,author_id,content,media_url,created_at,profiles(id,full_name,username,headline,avatar_url)').order('created_at',{ascending:false}).limit(30),
      state.user?sb.from('follows').select('following_id').eq('follower_id',state.user.id).limit(500):Promise.resolve({data:[]}),
      state.user?sb.from('profiles').select('is_premium,premium_until').eq('id',state.user.id).maybeSingle():Promise.resolve({data:null})
    ]);
    const postIds=(posts.data||[]).map(x=>x.id);
    const likes=postIds.length
      ? await sb.from('post_likes').select('post_id,user_id').in('post_id',postIds).limit(2000)
      : {data:[]};
    if(p.data?.length)state.profiles=p.data;
    else if(!state.profiles.length)state.profiles=DEMO.profiles.slice();
    if(pr.data?.length)state.projects=pr.data;
    else state.projects=DEMO.projects.slice();
    if(scripts.data?.length)state.scripts=scripts.data.map(x=>({...x,seller:x.profiles}));
    else state.scripts=DEMO_SCRIPTS.slice();
    const counts={};(likes.data||[]).forEach(x=>counts[x.post_id]=(counts[x.post_id]||0)+1);
    state.liked=new Set((likes.data||[]).filter(x=>x.user_id===state.user?.id).map(x=>x.post_id));
    state.following=new Set((follows.data||[]).map(x=>x.following_id));state.premium=!!(mePremium.data?.is_premium && (!mePremium.data?.premium_until || new Date(mePremium.data.premium_until)>new Date()));
    state.posts=(posts.data||[]).map(x=>({...x,author:x.profiles,likes_count:counts[x.id]||0,created_at:fmtDate(x.created_at)}));
    if(state.user&&state.tab==='Messages')await loadMessages();
  }catch(e){console.warn('ReelPage hydration error',e);}
  render();
}

async function boot(){
  await loadUser();
  await hydrate();
  sb.auth.onAuthStateChange(async(event)=>{
    if(event==='SIGNED_OUT'){state.user=null;render();return;}
    if(event==='SIGNED_IN' || event==='TOKEN_REFRESHED'){await loadUser();await hydrate();}
  });
}
window.addEventListener('error',e=>console.warn('ReelPage UI error',e.error||e.message));
window.setTab=setTab;window.openAuth=openAuth;async function startPremiumCheckout(){if(!state.user)return openAuth('signup');showToast('Premium checkout is prepared for ₦5,000/month. Live activation requires verified payment-provider configuration.');}
function openPremium(){state.modal={type:'premium'};render();}
window.openCreate=openCreate;window.closeModal=closeModal;window.submitAuth=submitAuth;
window.followTo=followTo;window.connectTo=connectTo;window.toggleLike=toggleLike;window.showToast=showToast;window.sb=sb;window.openPublicProfile=openPublicProfile;window.setProfileViewTab=setProfileViewTab;window.applyOpportunity=applyOpportunity;window.createPost=createPost;window.createProject=createProject;window.createOpportunity=createOpportunity;
window.saveProfile=saveProfile;window.openPremium=openPremium;window.startPremiumCheckout=startPremiumCheckout;window.signScriptNda=signScriptNda;window.openScriptSample=openScriptSample;window.uploadProfileImage=uploadProfileImage;window.hydrate=hydrate;window.createScript=createScript;window.requestScript=requestScript;window.messageScriptSeller=messageScriptSeller;window.messagePerson=messagePerson;window.sendMessage=sendMessage;window.loadMessages=loadMessages;window.signOut=signOut;window.openPerson=openPerson;window.state=state;window.render=()=>document.getElementById('app').innerHTML=shell();

render();
boot();
