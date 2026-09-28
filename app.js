const SUPABASE_URL = 'https://mijtwizvmfkhgaqzwexd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_nR_xKWMM77WTcypkrKzxOg_8MvqKTiC';
const AUTH_URL = SUPABASE_URL + '/functions/v1/reelpage-auth';
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});

const DEMO = {
  profiles: [
    {id:'demo-1',full_name:'Amara Okafor',username:'amaraokafor',headline:'Screenwriter',location:'Lagos, Nigeria',bio:'Stories rooted in African life, youth and human connection.',skills:['Drama','Series','Dialogue'],is_verified:true},
    {id:'demo-2',full_name:'Tobi Adebayo',username:'tobiadebayo',headline:'Director / Cinematographer',location:'Ibadan, Nigeria',bio:'Visual storyteller building bold, intimate films.',skills:['Direction','Cinematography','Documentary'],is_verified:true},
    {id:'demo-3',full_name:'Zainab Yusuf',username:'zainabyusuf',headline:'Actor',location:'Abuja, Nigeria',bio:'Actor and theatre maker exploring contemporary African stories.',skills:['Acting','Theatre','Voice'],is_verified:false},
    {id:'demo-4',full_name:'Daniel Mensah',username:'danielmensah',headline:'Producer',location:'Accra, Ghana',bio:'Independent producer connecting great stories to audiences.',skills:['Production','Development','Distribution'],is_verified:true}
  ],
  projects: [
    {id:'demo-p1',title:'The Last Bus',format:'Short Film',genre:'Drama',description:'A teenage girl gets one final chance to say goodbye before leaving home.',status:'Seeking Producer'},
    {id:'demo-p2',title:'After Rain',format:'Documentary',genre:'24 min',description:'A visual portrait of young creatives rebuilding after a difficult season.',status:'In Development'},
    {id:'demo-p3',title:'Market Day',format:'Feature Film',genre:'Comedy',description:'Three friends discover that one chaotic market day can change everything.',status:'Seeking Screenwriter'}
  ],
  opps: [
    {id:'demo-o1',title:'Casting: Young Lead — Short Film',opportunity_type:'Casting',location:'Lagos / Hybrid',description:'Independent short film seeking a young lead actor for a character-driven story.',status:'Open',compensation:'Paid'},
    {id:'demo-o2',title:'Screenwriter Wanted — 15min Drama',opportunity_type:'Writing',location:'Remote',description:'Producer looking for a writer to develop a contained Nigerian drama.',status:'Open',compensation:'Negotiable'},
    {id:'demo-o3',title:'Cinematographer — Documentary',opportunity_type:'Crew',location:'Ibadan',description:'Small documentary team seeking a cinematographer for a 2-day shoot.',status:'Open',compensation:'Paid'}
  ]
};

const state = {
  tab:'Home', search:'', user:null, profiles:DEMO.profiles.slice(), projects:DEMO.projects.slice(),
  opps:DEMO.opps.slice(), posts:[], liked:new Set(), following:new Set(), messages:[],
  selectedPerson:null, viewedProfileId:null, profileViewTab:'About', selectedConversation:null, modal:null, authMode:'signup', loading:false, toast:''
};

const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const initials = name => String(name||'R').split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase();
const fmtDate = value => value ? new Date(value).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}) : 'Now';

function logoMark(size='md') {
  return `<span class="rp-mark rp-${size}" aria-label="ReelPage"><svg viewBox="0 0 64 64" aria-hidden="true">
    <defs><linearGradient id="rpBlue" x1="10" y1="8" x2="54" y2="56" gradientUnits="userSpaceOnUse"><stop stop-color="#45a3ff"/><stop offset="1" stop-color="#1687ff"/></linearGradient></defs>
    <path d="M11 7h25c8.3 0 15 6.7 15 15v35H11V7Z" fill="url(#rpBlue)"/>
    <path d="M18 14h17c4.4 0 8 3.6 8 8s-3.6 8-8 8H25v7h10c8.3 0 15-6.7 15-15S43.3 7 35 7H18v7Z" fill="#fff"/>
    <path d="M25 30h-7v20h7V30Z" fill="#fff"/>
    <circle cx="48" cy="18" r="10" fill="#07111d" stroke="#45a3ff" stroke-width="4"/>
    <circle cx="48" cy="18" r="3" fill="#45a3ff"/>
    <circle cx="42.5" cy="13.5" r="2" fill="#45a3ff"/><circle cx="53.5" cy="13.5" r="2" fill="#45a3ff"/><circle cx="53.5" cy="22.5" r="2" fill="#45a3ff"/>
  </svg></span>`;
}
function brand(compact=false){ return `<div class="brand-lockup">${logoMark(compact?'sm':'md')}<span>REEL<span>PAGE</span></span></div>`; }

const ICONS = {
  home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z"/>',
  discover:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  projects:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 4v5M16 4v5"/>',
  opportunities:'<path d="M12 2 14.7 9.3 22 12l-7.3 2.7L12 22l-2.7-7.3L2 12l7.3-2.7Z"/>',
  messages:'<path d="M4 5h16v11H8l-4 4Z"/><path d="M8 9h8M8 12h5"/>',
  profile:'<circle cx="12" cy="8" r="3"/><path d="M5 21a7 7 0 0 1 14 0"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
  arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
  heart:'<path d="M20.8 8.7c0 5-8.8 10.3-8.8 10.3S3.2 13.7 3.2 8.7A4.7 4.7 0 0 1 12 6.1a4.7 4.7 0 0 1 8.8 2.6Z"/>',
  send:'<path d="m3 11 18-8-8 18-2-7Z"/><path d="m11 14 5-5"/>',
  close:'<path d="m6 6 12 12M18 6 6 18"/>',
  menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
  film:'<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M4 9h16M8 5v4M16 5v4M8 19v-6M16 19v-6"/>'
};
function icon(name,size=18){ return `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]||ICONS.home}</svg>`; }

function avatar(user,cls=''){
  const name=typeof user==='string'?user:(user?.full_name||user?.name||'ReelPage');
  const url=typeof user==='object'&&user?user.avatar_url:'';
  return url ? `<div class="avatar ${cls}"><img src="${esc(url)}" alt="${esc(name)}"></div>`
    : `<div class="avatar ${cls}">${logoMark('xs')}<span>${esc(initials(name))}</span></div>`;
}

function setTab(tab){ state.tab=tab; state.selectedPerson=null; state.viewedProfileId=null; render(); window.scrollTo({top:0,behavior:'smooth'}); }
function openPublicProfile(id){ state.viewedProfileId=id; state.profileViewTab='About'; state.tab='ProfileView'; state.selectedPerson=null; render(); window.scrollTo({top:0,behavior:'smooth'}); }
function setProfileViewTab(tab){ state.profileViewTab=tab; render(); }
function showToast(message){ state.toast=message; render(); clearTimeout(window.__rpToast); window.__rpToast=setTimeout(()=>{state.toast='';render()},2800); }
function openAuth(mode='signup'){ state.authMode=mode; state.modal={type:'auth'}; render(); }
function closeModal(){ state.modal=null; render(); }

function shell(){
  const nav=[['Home','home'],['Discover','discover'],['Projects','projects'],['Opportunities','opportunities'],['Messages','messages'],['Profile','profile']];
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
        <div class="searchbox">${icon('search',17)}<input value="${esc(state.search)}" oninput="state.search=this.value;render()" placeholder="Search creatives, projects, opportunities..."></div>
        <div class="top-actions"><button class="icon-btn" aria-label="Notifications" onclick="showToast('Notifications are ready for your ReelPage account.')">${icon('bell',18)}</button>${state.user?'<button class="profile-chip" onclick="setTab(\'Profile\')">'+avatar(state.user,'xs')+'<span>'+esc(state.user.full_name||'You')+'</span></button>':'<button class="sign-btn" onclick="openAuth(\'login\')">Sign in</button>'}</div>
      </header>
      <section class="content">${page()}</section>
    </main>
    <nav class="mobile-nav">${nav.map(([name,ico])=>`<button class="${state.tab===name?'active':''}" onclick="setTab('${name}')">${icon(ico,19)}<span>${name==='Opportunities'?'Calls':name}</span></button>`).join('')}</nav>
  </div>${state.modal?modal():''}${state.toast?`<div class="toast">${logoMark('xs')}<span>${esc(state.toast)}</span></div>`:''}`;
}

function page(){
  switch(state.tab){
    case 'Discover':return discoverPage();
    case 'Projects':return projectsPage();
    case 'Opportunities':return opportunitiesPage();
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
    <section class="surface"><div class="section-head compact"><div><div class="eyebrow">OPPORTUNITIES</div><h2>Open calls</h2></div><button class="text-btn" onclick="setTab('Opportunities')">View all ${icon('arrow',14)}</button></div>${state.opps.slice(0,4).map(oppRow).join('')}</section>
  </div>`;
}

function discoverPage(){
  const q=state.search.toLowerCase().trim();
  const people=state.profiles.filter(p=>(p.full_name+' '+(p.username||'')+' '+(p.headline||p.role||'')+' '+(p.location||'')+' '+(p.skills||[]).join(' ')).toLowerCase().includes(q));
  return `<div class="page-title"><div><div class="eyebrow">DISCOVER</div><h1>Find your people.</h1><p>Search the creative industry by role, skill or location.</p></div><button class="primary" onclick="openAuth('signup')">Create your ReelPage</button></div>
  <div class="filter-row"><span class="filter active">All creatives</span><span class="filter">Actors</span><span class="filter">Writers</span><span class="filter">Directors</span><span class="filter">Producers</span><span class="filter">Crew</span></div>
  <div class="people-grid">${people.length?people.map(profileCard).join(''):'<div class="empty-state wide">'+logoMark('md')+'<h3>No creatives found</h3><p>Try another name, role, skill or location.</p></div>'}</div>`;
}

function projectsPage(){
  return `<div class="page-title"><div><div class="eyebrow">PROJECTS</div><h1>Stories in motion.</h1><p>Discover films and creative projects looking for collaborators.</p></div><button class="primary" onclick="openCreate('project')">${icon('plus',16)} New project</button></div><div class="project-grid">${state.projects.map(projectCard).join('')}</div>`;
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
  return `<div class="profile-hero"><div class="cover ${u.cover_url?'has-image':''}" ${u.cover_url?`style="background-image:url('${esc(u.cover_url)}')"`:''}><button class="cover-btn" onclick="document.getElementById('coverInput').click()">${icon('plus',14)} Cover photo</button><input id="coverInput" hidden type="file" accept="image/*" onchange="uploadProfileImage(this.files[0],'covers','cover_url')"></div><div class="identity-row">${avatar(u,'profile-avatar')}<div class="identity-main"><div class="eyebrow">@${esc(u.username||'creative')}</div><h1>${esc(u.full_name||'ReelPage member')}</h1><p>${esc(u.headline||'Creative professional')} · ${esc(u.location||'Nigeria')}</p><div class="stats"><span><b>${mine.length}</b> projects</span><span><b>${u.connections_count||0}</b> connections</span><span><b>${u.followers_count||0}</b> followers</span></div></div><button class="secondary" onclick="openCreate('profile')">Edit profile</button></div></div>
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
          <p>${esc(p.headline||'Creative professional')} · ${esc(p.location||'Nigeria')}</p>
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
  return `<article class="person-card" onclick="openPublicProfile('${esc(p.id)}')">${avatar(p,'xl')}<div class="verified">${p.is_verified?'✓':''}</div><h3>${esc(p.full_name||p.name)}</h3><p>${esc(p.headline||p.role||'Creative')}</p><small>${esc(p.location||'Nigeria')}</small><div class="tag-row small-tags">${(p.skills||[]).slice(0,2).map(s=>`<span>${esc(s)}</span>`).join('')}</div><button class="connect-btn" onclick="event.stopPropagation();followTo('${esc(p.id)}')">${state.following.has(p.id)?'Following':'Follow'}</button></article>`;
}
function projectCard(p){
  return `<article class="project-card"><div class="project-poster">${logoMark('sm')}<span>${esc(p.format||'Creative Project')}</span><strong>${esc(p.title)}</strong><small>${esc(p.genre||'')}</small></div><div class="project-info"><span class="tiny">${esc(p.status||'In Development')}</span><h3>${esc(p.title)}</h3><p>${esc(p.description||p.logline||'')}</p><div class="project-foot"><span>${esc(p.owner_id===state.user?.id?'Your project':'Creative project')}</span><button class="text-btn" onclick="showToast('Project details are ready for the next ReelPage release.')">View ${icon('arrow',13)}</button></div></div></article>`;
}
function projectRow(p){return `<div class="data-row"><div class="mini-poster">${logoMark('xs')}</div><div><b>${esc(p.title)}</b><small>${esc([p.format,p.genre,p.status].filter(Boolean).join(' · '))}</small></div></div>`;}
function oppCard(o){return `<article class="opp-card"><div class="opp-icon">${icon('opportunities',20)}</div><div class="opp-main"><div class="tiny">${esc(o.opportunity_type||'Opportunity')} · ${esc(o.location||'Remote')}</div><h3>${esc(o.title)}</h3><p>${esc(o.description||'')}</p><div class="opp-meta"><span>${esc(o.compensation||'See details')}</span><span>${o.deadline?'Deadline '+esc(fmtDate(o.deadline)):'Open now'}</span></div></div><button class="secondary small" onclick="applyOpportunity('${esc(o.id)}')">View / Apply</button></article>`;}
function oppRow(o){return `<div class="data-row"><div class="opp-dot">${icon('opportunities',17)}</div><div><b>${esc(o.title)}</b><small>${esc([o.opportunity_type,o.location,o.compensation].filter(Boolean).join(' · '))}</small></div><button class="arrow-btn" onclick="applyOpportunity('${esc(o.id)}')">${icon('arrow',16)}</button></div>`;}
function demoPosts(){return [
  {id:'demo-post-1',content:'ReelPage is building a place where the next great Nigerian story can meet the people who can bring it to life.',author:DEMO.profiles[0],created_at:'Now',likes_count:24},
  {id:'demo-post-2',content:'Looking for collaborators should feel professional. Your craft, credits and ideas deserve a proper home.',author:DEMO.profiles[1],created_at:'Today',likes_count:17}
];}
function postCard(p){
  const a=p.author||{},liked=state.liked.has(p.id);
  return `<article class="post-card"><div class="post-head">${avatar(a,'sm')}<div><b>${esc(a.full_name||'ReelPage member')}</b><small>${esc(a.headline||'Creative')} · ${esc(p.created_at||'Now')}</small></div></div><p class="post-text">${esc(p.content)}</p>${p.media_url?'<img class="post-media" src="'+esc(p.media_url)+'" alt="Creative post media" loading="lazy">':''}<div class="post-actions"><button class="${liked?'liked':''}" onclick="toggleLike('${esc(p.id)}')">${icon('heart',17)} <span>${p.likes_count||0}</span></button><button onclick="showToast('Comments will be available in the next messaging release.')">${icon('messages',17)} Comment</button><button onclick="showToast('Share links are coming to the public release.')">${icon('arrow',17)} Share</button></div></article>`;
}

function modal(){
  const t=state.modal.type;
  if(t==='auth')return `<div class="backdrop" onclick="if(event.target===this)closeModal()"><div class="modal auth-modal"><button class="modal-close" onclick="closeModal()">${icon('close',19)}</button><div class="auth-logo">${brand()}</div><div class="auth-tabs"><button class="${state.authMode==='signup'?'active':''}" onclick="state.authMode='signup';render()">Create account</button><button class="${state.authMode==='login'?'active':''}" onclick="state.authMode='login';render()">Sign in</button></div><div class="eyebrow">${state.authMode==='signup'?'JOIN THE NETWORK':'WELCOME BACK'}</div><h2>${state.authMode==='signup'?'Your creative identity starts here.':'Welcome back to ReelPage.'}</h2><p>Username and password only. No email address or email verification is used for your ReelPage login.</p>${state.authMode==='signup'?'<input id="authName" class="input" placeholder="Full name" autocomplete="name" oninput="updateUsernamePreview()"><div class="username-preview"><span>USERNAME</span><b id="usernamePreview">Your name will become your username</b></div><select id="authRole" class="input" aria-label="Professional role"><option value="" selected disabled>Select your professional role</option><option value="Writer">Writer</option><option value="Producer">Producer</option><option value="Director">Director</option><option value="Executive Producer">Executive Producer</option></select><label class="field-label" for="authDob">Date of birth</label><input id="authDob" class="input" type="date" autocomplete="bday" max="2026-09-28" min="1900-01-01"><small class="field-hint">Used for age eligibility and kept private on your public profile.</small><input id="authLocation" class="input" placeholder="City / country" value="Nigeria">':''}<input id="authUsername" class="input" placeholder="Username" autocomplete="username"><input id="authPassword" class="input" type="password" placeholder="Password · 8+ characters" autocomplete="${state.authMode==='signup'?'new-password':'current-password'}"><button class="primary full" onclick="submitAuth()" ${state.loading?'disabled':''}>${state.loading?'Opening secure account…':state.authMode==='signup'?'Create my ReelPage →':'Sign in →'}</button><small class="modal-note">ReelPage uses Supabase Auth behind the scenes; the email is an internal account identifier, not collected from you.</small></div></div>`;
  if(t==='person'){const p=state.selectedPerson; if(p){openPublicProfile(p.id); return '';} return '';}
  if(t==='profile')return `<div class="backdrop" onclick="if(event.target===this)closeModal()"><div class="modal"><button class="modal-close" onclick="closeModal()">${icon('close',19)}</button><div class="eyebrow">YOUR REELPAGE</div><h2>Edit your creative identity.</h2><p>Your profile is your professional calling card.</p><label class="photo-upload">${avatar(state.user,'edit-avatar')}<span>Change profile photo<input id="avatarInput" type="file" accept="image/*" hidden onchange="uploadProfileImage(this.files[0],'avatars','avatar_url')"></span></label><input id="editName" class="input" value="${esc(state.user.full_name||'')}" placeholder="Full name"><input id="editHeadline" class="input" value="${esc(state.user.headline||'')}" placeholder="Professional headline"><input id="editLocation" class="input" value="${esc(state.user.location||'Nigeria')}" placeholder="Location"><textarea id="editBio" class="input area" placeholder="About you">${esc(state.user.bio||'')}</textarea><input id="editSkills" class="input" value="${esc((state.user.skills||[]).join(', '))}" placeholder="Skills separated by commas"><button class="primary full" onclick="saveProfile()">Save profile →</button></div></div>`;
  if(t==='post')return `<div class="backdrop" onclick="if(event.target===this)closeModal()"><div class="modal"><button class="modal-close" onclick="closeModal()">${icon('close',19)}</button><div class="auth-logo">${brand()}</div><div class="eyebrow">CREATIVE FEED</div><h2>What are you working on?</h2><p>Share an update, call for collaborators or a thought from your creative journey.</p><textarea id="postContent" class="input area" placeholder="Tell the network what is happening..."></textarea><label class="upload-label">${icon('film',16)} Add image<input id="postMedia" type="file" accept="image/*" hidden></label><button class="primary full" onclick="createPost()">Publish post →</button></div></div>`;
  if(t==='project')return `<div class="backdrop" onclick="if(event.target===this)closeModal()"><div class="modal"><button class="modal-close" onclick="closeModal()">${icon('close',19)}</button><div class="eyebrow">NEW PROJECT</div><h2>Put your work in motion.</h2><input id="createTitle" class="input" placeholder="Project title"><input id="createMeta" class="input" placeholder="Format · Genre e.g. Short Film · Drama"><textarea id="createDesc" class="input area" placeholder="Logline or project description"></textarea><button class="primary full" onclick="createProject()">Create project →</button></div></div>`;
  return `<div class="backdrop" onclick="if(event.target===this)closeModal()"><div class="modal"><button class="modal-close" onclick="closeModal()">${icon('close',19)}</button><div class="eyebrow">NEW OPPORTUNITY</div><h2>Open a door for someone.</h2><input id="oppTitle" class="input" placeholder="Opportunity title"><input id="oppType" class="input" placeholder="Type · Casting, Writing, Crew..."><input id="oppLocation" class="input" placeholder="Location or Remote"><textarea id="oppDesc" class="input area" placeholder="What are you looking for?"></textarea><input id="oppComp" class="input" placeholder="Compensation e.g. Paid / Negotiable"><button class="primary full" onclick="createOpportunity()">Post opportunity →</button></div></div>`;
}

function openCreate(type){ if(!state.user && type!=='profile'){openAuth('signup');return;} state.modal={type}; render(); }
function openPerson(id){state.selectedPerson=state.profiles.find(p=>p.id===id);if(state.selectedPerson)state.modal={type:'person'};render();}
function messagePerson(id){state.modal=null;state.selectedConversation=id;state.tab='Messages';loadMessages().then(render);}
function makeUsername(name){
  return String(name||'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'').slice(0,24);
}
function updateUsernamePreview(){
  const el=document.getElementById('usernamePreview');
  const name=document.getElementById('authName')?.value||'';
  if(el)el.textContent=makeUsername(name)||'Your name will become your username';
}
async function submitAuth(){
  const username=(document.getElementById('authUsername')?.value||'').trim().toLowerCase(), password=document.getElementById('authPassword')?.value||'';
  if(!/^[a-z0-9_]{3,24}$/.test(username))return showToast('Username must be 3–24 letters, numbers or underscores.');
  if(password.length<8)return showToast('Use at least 8 characters for your password.');
  state.loading=true;render();
  const payload={action:state.authMode,username,password};
  if(state.authMode==='signup'){
    payload.full_name=(document.getElementById('authName')?.value||'').trim();
    payload.role=(document.getElementById('authRole')?.value||'').trim();
    payload.date_of_birth=(document.getElementById('authDob')?.value||'').trim();
    payload.location=(document.getElementById('authLocation')?.value||'Nigeria').trim()||'Nigeria';
    if(payload.full_name.length<2){state.loading=false;render();return showToast('Please enter your full name.');}
    if(!payload.role){state.loading=false;render();return showToast('Please select your professional role.');}
    if(!payload.date_of_birth){state.loading=false;render();return showToast('Please select your date of birth.');}
    payload.username=makeUsername(payload.full_name);
  }
  try{
    const res=await fetch(AUTH_URL,{method:'POST',headers:{'Content-Type':'application/json','apikey':SUPABASE_KEY},body:JSON.stringify(payload)});
    const data=await res.json();
    if(!res.ok)throw new Error(data.error||'Authentication failed.');
    if(!data.session)throw new Error('No session was returned. Please try again.');
    await sb.auth.setSession(data.session);
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
  const updates={full_name:document.getElementById('editName').value.trim(),headline:document.getElementById('editHeadline').value.trim(),location:document.getElementById('editLocation').value.trim(),bio:document.getElementById('editBio').value.trim(),skills:document.getElementById('editSkills').value.split(',').map(x=>x.trim()).filter(Boolean).slice(0,20)};
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
  const r=await sb.from('messages').select('*').or(`sender_id.eq.${state.user.id},recipient_id.eq.${state.user.id}`).order('created_at',{ascending:true}).limit(300);
  state.messages=r.data||[];
}
async function sendMessage(e){
  e.preventDefault();const body=document.getElementById('messageBody').value.trim();const recipient=state.selectedConversation;if(!body||!recipient)return;
  const r=await sb.from('messages').insert({sender_id:state.user.id,recipient_id:recipient,body});if(r.error)return showToast(r.error.message);
  await loadMessages();render();
}
async function hydrate(){
  try{
    const [p,pr,o,posts,likes,follows]=await Promise.all([
      sb.from('profiles').select('*').order('created_at',{ascending:false}).limit(80),
      sb.from('projects').select('*').order('created_at',{ascending:false}).limit(40),
      sb.from('opportunities').select('*').order('created_at',{ascending:false}).limit(40),
      sb.from('posts').select('id,author_id,content,media_url,created_at,profiles(id,full_name,username,headline,avatar_url)').order('created_at',{ascending:false}).limit(40),
      sb.from('post_likes').select('post_id,user_id').limit(2000),
      state.user?sb.from('follows').select('following_id').eq('follower_id',state.user.id).limit(500):Promise.resolve({data:[]})
    ]);
    if(p.data?.length)state.profiles=p.data;
    else if(!state.profiles.length)state.profiles=DEMO.profiles.slice();
    if(pr.data?.length)state.projects=pr.data;
    else state.projects=DEMO.projects.slice();
    if(o.data?.length)state.opps=o.data;
    else state.opps=DEMO.opps.slice();
    const counts={};(likes.data||[]).forEach(x=>counts[x.post_id]=(counts[x.post_id]||0)+1);
    state.liked=new Set((likes.data||[]).filter(x=>x.user_id===state.user?.id).map(x=>x.post_id));
    state.following=new Set((follows.data||[]).map(x=>x.following_id));
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
window.setTab=setTab;window.openAuth=openAuth;window.openCreate=openCreate;window.closeModal=closeModal;window.submitAuth=submitAuth;
window.followTo=followTo;window.connectTo=connectTo;window.toggleLike=toggleLike;window.openPublicProfile=openPublicProfile;window.setProfileViewTab=setProfileViewTab;window.applyOpportunity=applyOpportunity;window.createPost=createPost;window.createProject=createProject;window.createOpportunity=createOpportunity;
window.saveProfile=saveProfile;window.uploadProfileImage=uploadProfileImage;window.messagePerson=messagePerson;window.sendMessage=sendMessage;window.loadMessages=loadMessages;window.signOut=signOut;window.openPerson=openPerson;window.state=state;window.render=()=>document.getElementById('app').innerHTML=shell();

render();
boot();
