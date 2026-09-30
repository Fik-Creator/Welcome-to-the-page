/* REELPAGE CREATIVE GRAPH UPGRADE */
(function(){
  'use strict';
  const db=()=>window.sb, st=()=>window.state;
  const esc=v=>String(v??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const notify=msg=>window.showToast?.(msg);
  async function requireUser(){if(!st()?.user){window.openAuth?.('login');return false}return true}

  async function loadNotifications(){
    if(!st()?.user)return [];
    const {data}=await db().from('notifications').select('id,type,title,body,entity_type,entity_id,read_at,created_at,profiles!notifications_actor_id_fkey(full_name,avatar_url)').eq('user_id',st().user.id).order('created_at',{ascending:false}).limit(50);
    return data||[];
  }
  async function openNotifications(){
    if(!(await requireUser()))return;
    const rows=await loadNotifications();
    const b=document.createElement('div');b.className='rp-upgrade-backdrop';b.innerHTML='<div class="rp-upgrade-modal"><button class="rp-x" onclick="this.closest(\'.rp-upgrade-backdrop\').remove()">×</button><div class="rp-eyebrow">REELPAGE INBOX</div><h2>Notifications</h2><div class="rp-notification-list">'+(rows.length?rows.map(n=>'<button class="rp-notification" data-id="'+esc(n.id)+'"><div class="rp-dot '+(n.read_at?'read':'')+'"></div><div><b>'+esc(n.title)+'</b><p>'+esc(n.body||'')+'</p><small>'+esc(new Date(n.created_at).toLocaleString())+'</small></div></button>').join(''):'<div class="rp-empty">You’re all caught up.</div>')+'</div></div>';
    document.body.appendChild(b);
    b.querySelectorAll('.rp-notification').forEach(x=>x.onclick=async()=>{await db().from('notifications').update({read_at:new Date().toISOString()}).eq('id',x.dataset.id);x.querySelector('.rp-dot')?.classList.add('read')});
  }

  async function openReelMap(){
    const [{data:places},{data:profiles},{data:opps},{data:projects}]=await Promise.all([
      db().from('reelmap_places').select('*').order('city'),
      db().from('profiles').select('id,full_name,role,headline,location,country,avatar_url'),
      db().from('opportunities').select('id,title,location,status'),
      db().from('projects').select('id,title,genre,status,owner_id')
    ]);
    const b=document.createElement('div');b.className='rp-upgrade-backdrop';
    const cities=places||[];
    b.innerHTML='<div class="rp-upgrade-modal rp-map-modal"><button class="rp-x" onclick="this.closest(\'.rp-upgrade-backdrop\').remove()">×</button><div class="rp-eyebrow">REELMAP · NIGERIA</div><h2>Find the creative community.</h2><p>Explore people, projects and opportunities by city.</p><div class="rp-city-grid">'+cities.map(c=>{const cp=(profiles||[]).filter(p=>String(p.location||'').toLowerCase().includes(c.city.toLowerCase()));const co=(opps||[]).filter(o=>String(o.location||'').toLowerCase().includes(c.city.toLowerCase()));const cj=(projects||[]).length;return '<button class="rp-city" data-city="'+esc(c.city)+'"><strong>'+esc(c.city)+'</strong><span>'+cp.length+' creatives</span><span>'+co.length+' opportunities</span></button>'}).join('')+'</div><div class="rp-map-results" id="rpMapResults"><span>Select a city to explore.</span></div></div>';
    document.body.appendChild(b);
    b.querySelectorAll('.rp-city').forEach(x=>x.onclick=()=>{const city=x.dataset.city;const ps=(profiles||[]).filter(p=>String(p.location||'').toLowerCase().includes(city.toLowerCase()));const os=(opps||[]).filter(o=>String(o.location||'').toLowerCase().includes(city.toLowerCase()));b.querySelector('#rpMapResults').innerHTML='<h3>'+esc(city)+'</h3><div class="rp-result-columns"><div><b>CREATIVES</b>'+ps.slice(0,8).map(p=>'<button onclick="openPublicProfile(\''+esc(p.id)+'\');this.closest(\'.rp-upgrade-backdrop\').remove()">'+esc(p.full_name)+' · '+esc(p.headline||p.role||'Creative')+'</button>').join('')+'</div><div><b>OPPORTUNITIES</b>'+os.slice(0,8).map(o=>'<button>'+esc(o.title)+'</button>').join('')+'</div></div>'});
  }

  async function openNeedFlow(projectId){
    if(!(await requireUser()))return;
    const b=document.createElement('div');b.className='rp-upgrade-backdrop';b.innerHTML='<div class="rp-upgrade-modal"><button class="rp-x" onclick="this.closest(\'.rp-upgrade-backdrop\').remove()">×</button><div class="rp-eyebrow">I NEED…</div><h2>Find the missing piece.</h2><p>Turn a production need into a structured creative search.</p><form id="rpNeedForm" class="rp-form"><input name="title" placeholder="What do you need?" required><select name="role"><option>Actor</option><option>Director</option><option>Cinematographer</option><option>Writer</option><option>Editor</option><option>Sound</option><option>Production Design</option><option>Producer</option><option>Funding</option><option>Location</option><option>Collaborator</option></select><input name="skills" placeholder="Skills (comma separated)"><input name="location" placeholder="City e.g. Lagos"><label><input type="checkbox" name="remote_ok"> Remote / hybrid is okay</label><input name="compensation" placeholder="Compensation"><textarea name="description" placeholder="Describe the person or resource you need"></textarea><button class="primary" type="submit">Find matches</button></form><div id="rpNeedMatches"></div></div>';
    document.body.appendChild(b);
    b.querySelector('#rpNeedForm').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.currentTarget);const payload={creator_id:st().user.id,project_id:projectId||null,title:f.get('title'),role:f.get('role'),skills:String(f.get('skills')||'').split(',').map(x=>x.trim()).filter(Boolean),location:f.get('location'),remote_ok:f.get('remote_ok')==='on',compensation:f.get('compensation'),description:f.get('description')};const {error}=await db().from('creative_needs').insert(payload);if(error){notify(error.message);return}const q=String(payload.location||'');let query=db().from('profiles').select('id,full_name,username,headline,role,location,country,skills,availability,avatar_url').limit(30);if(payload.role)query=query.or('role.ilike.%'+payload.role+'%,headline.ilike.%'+payload.role+'%');if(q)query=query.ilike('location','%'+q+'%');const r=await query;const skills=payload.skills.map(x=>x.toLowerCase());const matches=(r.data||[]).filter(p=>p.id!==st().user.id).map(p=>{let score=0;const hay=[p.role,p.headline].join(' ').toLowerCase();if(hay.includes(payload.role.toLowerCase()))score+=50;if(q&&String(p.location||'').toLowerCase().includes(q.toLowerCase()))score+=30;for(const s of skills)if((p.skills||[]).some(x=>String(x).toLowerCase().includes(s)))score+=10;return {...p,score}}).sort((a,c)=>c.score-a.score).slice(0,10);b.querySelector('#rpNeedMatches').innerHTML='<div class="rp-eyebrow">MATCHES</div>'+(matches.length?matches.map(p=>'<button class="rp-match" onclick="openPublicProfile(\''+esc(p.id)+'\');this.closest(\'.rp-upgrade-backdrop\').remove()"><div><b>'+esc(p.full_name)+'</b><small>'+esc(p.headline||p.role||'Creative')+' · '+esc(p.location||'Remote')+'</small></div><strong>'+p.score+'%</strong></button>').join(''):'<div class="rp-empty">No close matches yet. Your need is now visible to the network.</div>');};
  }

  async function openPassport(projectId){
    if(!projectId){notify('Create a project first.');return}
    const {data:p}=await db().from('projects').select('*').eq('id',projectId).maybeSingle();if(!p){notify('Project not found.');return}
    const {data:w}=await db().from('project_workspaces').select('*').eq('project_id',projectId).maybeSingle();
    const workspace=w||{logline:p.logline||'',genre:p.genre||'',format:p.format||'',budget:0,locations:[],cast_requirements:[],crew_requirements:[],shot_list:[],schedule:[],milestones:[],credits:[],production_notes:''};
    const b=document.createElement('div');b.className='rp-upgrade-backdrop';b.innerHTML='<div class="rp-upgrade-modal rp-passport"><button class="rp-x" onclick="this.closest(\'.rp-upgrade-backdrop\').remove()">×</button><div class="rp-eyebrow">PRODUCTION PASSPORT</div><h2>'+esc(p.title)+'</h2><p>One living workspace from idea to audience.</p><div class="rp-passport-tabs"><button class="active" data-t="overview">Overview</button><button data-t="people">People</button><button data-t="production">Production</button><button data-t="audience">Audience</button></div><div id="rpPassportBody"></div></div>';
    document.body.appendChild(b);
    const body=b.querySelector('#rpPassportBody');
    const renderTab=t=>{if(t==='overview')body.innerHTML='<div class="rp-pass-grid"><label>Logline<textarea id="rpLogline">'+esc(workspace.logline)+'</textarea></label><label>Genre<input id="rpGenre" value="'+esc(workspace.genre||'')+'"></label><label>Format<input id="rpFormat" value="'+esc(workspace.format||'')+'"></label><label>Budget<input id="rpBudget" type="number" value="'+Number(workspace.budget||0)+'"></label><label class="full">Production notes<textarea id="rpNotes">'+esc(workspace.production_notes||'')+'</textarea></label></div><button class="primary" id="rpSave">Save passport</button><button class="secondary" id="rpAiPlan">Build with Reel AI</button>';else if(t==='people')body.innerHTML='<div class="rp-section"><h3>People & collaborators</h3><p>Cast and crew requirements stay attached to the project, so Reel AI can reason about who is missing.</p><button class="primary" id="rpNeed">I Need…</button></div>';else if(t==='production')body.innerHTML='<div class="rp-pass-grid"><label>Locations<textarea id="rpLocations">'+esc(JSON.stringify(workspace.locations||[],null,2))+'</textarea></label><label>Shot list<textarea id="rpShots">'+esc(JSON.stringify(workspace.shot_list||[],null,2))+'</textarea></label><label>Schedule<textarea id="rpSchedule">'+esc(JSON.stringify(workspace.schedule||[],null,2))+'</textarea></label><label>Milestones<textarea id="rpMilestones">'+esc(JSON.stringify(workspace.milestones||[],null,2))+'</textarea></label></div><button class="primary" id="rpSaveProduction">Save production plan</button>';else body.innerHTML='<div class="rp-section"><h3>Audience & distribution</h3><p>Release strategy, credits and distribution notes can live with the production rather than being scattered across chats.</p><textarea id="rpDistribution">'+esc(JSON.stringify(workspace.distribution||{},null,2))+'</textarea><button class="primary" id="rpSaveAudience">Save audience plan</button>'};
    renderTab('overview');
    b.querySelectorAll('.rp-passport-tabs button').forEach(btn=>btn.onclick=()=>{b.querySelectorAll('.rp-passport-tabs button').forEach(x=>x.classList.remove('active'));btn.classList.add('active');renderTab(btn.dataset.t)});
    b.addEventListener('click',async e=>{if(e.target.id==='rpNeed'){openNeedFlow(projectId);return}if(e.target.id==='rpAiPlan'){b.remove();window.openReelAI?.();setTimeout(()=>window.reelAiCommand?.('build a production plan for my project '+p.title),100);return}if(e.target.id==='rpSave'){const patch={project_id:projectId,logline:document.getElementById('rpLogline').value,genre:document.getElementById('rpGenre').value,format:document.getElementById('rpFormat').value,budget:Number(document.getElementById('rpBudget').value||0),production_notes:document.getElementById('rpNotes').value};const r=await db().from('project_workspaces').upsert(patch,{onConflict:'project_id'});notify(r.error?r.error.message:'Production Passport saved.');return}if(e.target.id==='rpSaveProduction'){const parse=id=>{try{return JSON.parse(document.getElementById(id).value||'[]')}catch(_){return []}};const r=await db().from('project_workspaces').upsert({project_id:projectId,locations:parse('rpLocations'),shot_list:parse('rpShots'),schedule:parse('rpSchedule'),milestones:parse('rpMilestones')},{onConflict:'project_id'});notify(r.error?r.error.message:'Production plan saved.');return}if(e.target.id==='rpSaveAudience'){let distribution={};try{distribution=JSON.parse(document.getElementById('rpDistribution').value||'{}')}catch(_){}const r=await db().from('project_workspaces').upsert({project_id:projectId,distribution},{onConflict:'project_id'});notify(r.error?r.error.message:'Audience plan saved.');}});
  }

  function install(){
    window.openNotifications=openNotifications;window.openReelMap=openReelMap;window.openNeedFlow=openNeedFlow;window.openProductionPassport=openPassport;
    const originalShell=window.shell;
    if(originalShell&&!window.__rpShellPatched){window.__rpShellPatched=true;}
    document.addEventListener('click',e=>{const nav=e.target.closest?.('.icon-btn');if(nav&&nav.getAttribute('aria-label')==='Notifications'){e.preventDefault();openNotifications()}});
    if(st()?.user){
      db().channel('reelpage-live').on('postgres_changes',{event:'INSERT',schema:'public',table:'notifications',filter:'user_id=eq.'+st().user.id},payload=>{notify(payload.new.title||'New ReelPage notification');window.speakReelAI?.(payload.new.title||'You have a new notification',{silent:false})}).on('postgres_changes',{event:'INSERT',schema:'public',table:'messages',filter:'recipient_id=eq.'+st().user.id},payload=>{notify('New message on ReelPage')}).subscribe();
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,250));else setTimeout(install,250);
})();