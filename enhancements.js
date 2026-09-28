
(function(){
  const originalRender=window.render;
  const RP_LOGO='<span class="rpMark" aria-label="ReelPage logo"><svg viewBox="0 0 48 48" aria-hidden="true"><rect x="3" y="3" width="42" height="42" rx="12" fill="none" stroke="currentColor" stroke-width="3"/><path d="M14 34V14h11.2c5.1 0 8.3 2.6 8.3 6.7 0 2.9-1.7 5.3-4.7 6.2L34.8 34h-6l-4.8-6.8H20V34h-6Zm6-11.7h5c1.9 0 3.3-.9 3.3-2.4s-1.4-2.3-3.3-2.3h-5v4.7Z" fill="currentColor"/></svg></span>';
  const BRAND='<div class="rpBrand">'+RP_LOGO+'<span>REEL<span>PAGE</span></span></div>';
  window.logo=function(markOnly){return markOnly?RP_LOGO:BRAND};
  window.avatar=function(user,cls){
    const name=typeof user==='string'?user:(user&&((user.full_name||user.name)))||'ReelPage';
    const url=typeof user==='object'&&user?user.avatar_url:'';
    return url?'<div class="avatar '+(cls||'')+'"><img src="'+esc(url)+'" alt="'+esc(name)+'"></div>':'<div class="avatar '+(cls||'')+'">'+RP_LOGO+'<span class="initials">'+esc(initials(name))+'</span></div>';
  };

  window.authModal=function(){
    const signup=state.authMode==='signup';
    return '<button class="modalClose" onclick="closeModal()">×</button><div class="authLogo">'+BRAND+'</div><div class="authTabs"><button class="'+(signup?'active':'')+'" onclick="state.authMode=\'signup\';render()">Create account</button><button class="'+(!signup?'active':'')+'" onclick="state.authMode=\'login\';render()">Sign in</button></div><div class="eyebrow">'+(signup?'JOIN THE NETWORK':'WELCOME BACK')+'</div><h2>'+(signup?'Your creative identity starts here.':'Welcome back to ReelPage.')+'</h2><p class="modalLead">'+(signup?'Choose a username and password. No email address or verification step is required.':'Sign in with the username and password you created on ReelPage.')+'</p>'+(signup?'<input id="authName" class="input" placeholder="Full name" autocomplete="name"><input id="authRole" class="input" placeholder="Professional role · Actor, Writer, Producer..."><input id="authLocation" class="input" placeholder="City / country" value="Nigeria">':'')+'<input id="authUsername" class="input" placeholder="Username" autocomplete="username"><input id="authPassword" class="input" type="password" placeholder="Password · 8+ characters" autocomplete="'+(signup?'new-password':'current-password')+'"><button class="primary full" onclick="submitAuth()">'+(state.loading?'Creating secure session…':signup?'Create my ReelPage →':'Sign in →')+'</button><small class="modalNote">ReelPage uses Supabase Auth behind the scenes. Your email is not collected for this login flow.</small>';
  };

  window.submitAuth=async function(){
    const username=(document.getElementById('authUsername')?.value||'').trim().toLowerCase();
    const password=document.getElementById('authPassword')?.value||'';
    if(!/^[a-z0-9_]{3,24}$/.test(username))return showToast('Username: 3–24 letters, numbers or underscores.');
    if(password.length<8)return showToast('Use at least 8 characters for your password.');
    state.loading=true;render();
    const payload={action:state.authMode,username,password};
    if(state.authMode==='signup'){
      payload.full_name=(document.getElementById('authName')?.value||'').trim();
      payload.role=(document.getElementById('authRole')?.value||'').trim()||'Creative';
      payload.location=(document.getElementById('authLocation')?.value||'Nigeria').trim()||'Nigeria';
      if(payload.full_name.length<2){state.loading=false;render();return showToast('Please enter your full name.')}
    }
    try{
      const res=await fetch(AUTH_URL,{method:'POST',headers:{'Content-Type':'application/json','apikey':SUPABASE_KEY},body:JSON.stringify(payload)});
      const data=await res.json();
      if(!res.ok)throw new Error(data.error||'Authentication failed.');
      await sb.auth.setSession(data.session);
      await loadUser();
      state.loading=false;state.modal=null;
      await hydrate();
      showToast(state.authMode==='signup'?'Welcome to ReelPage. Your profile is live.':'Welcome back to ReelPage.');
    }catch(e){state.loading=false;render();showToast(e.message)}
  };

  window.profile=function(){
    if(!state.user)return '<div class="profilePrompt"><div class="profilePromptArt">'+RP_LOGO+'</div><div class="eyebrow">YOUR CREATIVE IDENTITY</div><h1>Claim your ReelPage.</h1><p>Build a professional home for your headshot, skills, projects and opportunities.</p><button class="primary" onclick="openAuth(\'signup\')">Create profile →</button></div>';
    const u=state.user;
    const mine=state.projects.filter(x=>x.owner_id===u.id);
    return '<div class="profileHero"><div class="coverImage" style="'+(u.cover_url?'background-image:url(\''+esc(u.cover_url)+'\')':'')+'"><button class="coverEdit" onclick="document.getElementById(\'coverInput\').click()">'+icon('plus',14)+' Cover photo</button><input id="coverInput" type="file" accept="image/*" hidden onchange="uploadImage(this.files[0],\'covers\')"></div><div class="identityRow">'+avatar(u,'profileAvatar')+'<div class="identityText"><div class="eyebrow">@'+esc(u.username||'creative')+'</div><h1>'+esc(u.full_name||'ReelPage member')+'</h1><p>'+esc(u.headline||'Creative professional')+' · '+esc(u.location||'Nigeria')+'</p><div class="profileStats"><span><b>'+mine.length+'</b> projects</span><span><b>'+(u.connections_count||0)+'</b> connections</span><span><b>'+(u.followers_count||0)+'</b> followers</span></div></div><button class="secondary" onclick="openCreate(\'profile\')">Edit profile</button></div></div><div class="profileLayout"><div class="profileMain"><section class="surface profileSection"><div class="sectionHeader compact"><div><div class="eyebrow">ABOUT</div><h2>Professional story</h2></div></div><p class="bioText">'+esc(u.bio||'Tell the industry what you make, what you care about and what you want to create next.')+'</p><div class="skillList">'+(u.skills||[]).map(function(s){return '<span>'+esc(s)+'</span>'}).join('')+'</div></section><section class="surface profileSection"><div class="sectionHeader compact"><div><div class="eyebrow">WORK</div><h2>Featured projects</h2></div><button class="textBtn" onclick="openCreate(\'project\')">'+icon('plus',14)+' Add</button></div>'+(mine.length?mine.map(projectRow).join(''):'<div class="emptyInline">'+RP_LOGO+'<div><strong>Your body of work starts here.</strong><small>Add a film, script, project or portfolio piece.</small></div></div>')+'</section></div><aside class="profileAside"><section class="surface"><div class="eyebrow">PROFILE CHECKLIST</div><h3>Make your work discoverable</h3>'+checkItem(!!u.avatar_url,'Profile photo','Upload a clear headshot.')+checkItem(!!u.headline,'Headline','Tell people what you do.')+checkItem(!!u.bio,'About','Give your story context.')+checkItem((u.skills||[]).length>0,'Skills','Add the craft people can hire you for.')+'</section><section class="surface profileCardCall"><span>'+RP_LOGO+'</span><strong>One identity. Many creative possibilities.</strong><small>ReelPage connects people, projects and opportunities.</small></section></aside></div>';
  };

  window.createModal=function(type){
    if(type==='post')return '<button class="modalClose" onclick="closeModal()">×</button><div class="authLogo">'+BRAND+'</div><div class="eyebrow">CREATIVE FEED</div><h2>What are you working on?</h2><p class="modalLead">Share an update, call for collaborators or a thought from your creative journey.</p><textarea id="createDesc" class="input area" placeholder="Tell the network what is happening..."></textarea><label class="uploadBtn">'+icon('film',15)+' Add image<input id="postMedia" type="file" accept="image/*" hidden></label><button class="primary full" onclick="createItem(\'post\')">Publish post →</button>';
    if(type==='profile')return '<button class="modalClose" onclick="closeModal()">×</button><div class="eyebrow">YOUR REELPAGE</div><h2>Edit your creative identity.</h2><p class="modalLead">Your profile is your professional calling card.</p><label class="photoUpload">'+avatar(state.user,'editAvatar')+'<span>Change profile photo<input id="avatarInput" type="file" accept="image/*" hidden onchange="previewAvatar(this.files[0])"></span></label><input id="editName" class="input" value="'+esc(state.user.full_name||'')+'" placeholder="Full name"><input id="editHeadline" class="input" value="'+esc(state.user.headline||'')+'" placeholder="Professional headline"><input id="editLocation" class="input" value="'+esc(state.user.location||'Nigeria')+'" placeholder="Location"><textarea id="editBio" class="input area" placeholder="About you">'+esc(state.user.bio||'')+'</textarea><input id="editSkills" class="input" value="'+esc((state.user.skills||[]).join(', '))+'" placeholder="Skills separated by commas"><button class="primary full" onclick="saveProfile()">Save profile →</button>';
    if(type==='project')return '<button class="modalClose" onclick="closeModal()">×</button><div class="eyebrow">NEW PROJECT</div><h2>Put your work in motion.</h2><p class="modalLead">Create a project page that can attract collaborators.</p><input id="createTitle" class="input" placeholder="Project title"><input id="createMeta" class="input" placeholder="Format · Genre e.g. Short Film · Drama"><textarea id="createDesc" class="input area" placeholder="Logline or project description"></textarea><button class="primary full" onclick="createItem(\'project\')">Create project →</button>';
    return '<button class="modalClose" onclick="closeModal()">×</button><div class="eyebrow">NEW OPPORTUNITY</div><h2>Open a door for someone.</h2><p class="modalLead">Post a casting, crew call, writing brief or collaboration.</p><input id="createTitle" class="input" placeholder="Opportunity title"><input id="createType" class="input" placeholder="Type · Casting, Writing, Crew, Partnership..."><textarea id="createDesc" class="input area" placeholder="What are you looking for?"></textarea><button class="primary full" onclick="createItem(\'opportunity\')">Post opportunity →</button>';
  };

  window.personModal=function(){
    const p=state.modal.p;
    return '<button class="modalClose" onclick="closeModal()">×</button><div class="personModalTop">'+avatar(p,'large')+'<div><div class="eyebrow">'+esc(p.role||'CREATIVE').toUpperCase()+'</div><h2>'+esc(p.name)+'</h2><p>'+esc(p.location||'Nigeria')+'</p></div></div><p class="bioText">'+esc(p.bio||'Creative professional building work on ReelPage.')+'</p><div class="tagRow big">'+(p.skills||[]).map(function(s){return '<span>'+esc(s)+'</span>'}).join('')+'</div>'+(state.user&&p.id!==state.user.id?'<div class="personModalActions"><button class="primary" onclick="connectTo(\''+esc(p.id)+'\')">Connect</button><button class="secondary" onclick="followTo(\''+esc(p.id)+'\')">Follow</button></div>':'');
  };

  window.home=function(){
    const feed=state.posts.length?state.posts:demoFeed();
    return '<div class="homeHero"><div class="heroCopy"><div class="eyebrow">NOLLYWOOD FIRST · GLOBAL BY DESIGN</div><h1>Where stories<br><span>find people.</span></h1><p>ReelPage is a professional network for actors, writers, directors, producers, crew and creative businesses — starting with Nigeria.</p><div class="heroActions"><button class="primary" onclick="setTab(\'Discover\')">Discover creatives '+icon('arrow',16)+'</button><button class="secondary" onclick="openAuth(\'signup\')">Build your profile</button></div><div class="heroProof">'+RP_LOGO+'<div><strong>CONNECT · CREATE · COLLABORATE</strong><small>A creative identity that travels with your work.</small></div></div></div><div class="heroVisual"><div class="heroHalo"></div><div class="heroLogoTile">'+RP_LOGO+'<strong>REEL<br><span>PAGE</span></strong><small>THE CREATIVE NETWORK</small></div><div class="floatingCard cardOne"><span class="liveDot"></span><b>Open opportunity</b><small>Casting · Lagos</small></div><div class="floatingCard cardTwo"><b>12 creatives</b><small>connected to this project</small></div></div></div><div class="sectionHeader"><div><div class="eyebrow">THE NETWORK</div><h2>People you may want to know</h2><p>Find collaborators by craft, city, skill or ambition.</p></div><button class="textBtn" onclick="setTab(\'Discover\')">Explore all '+icon('arrow',15)+'</button></div><div class="peopleGrid">'+state.profiles.slice(0,4).map(profileCard).join('')+'</div><div class="homeColumns"><section class="surface"><div class="sectionHeader compact"><div><div class="eyebrow">CREATIVE FEED</div><h2>What’s happening</h2></div><button class="textBtn" onclick="openCreate(\'post\')">Post '+icon('plus',14)+'</button></div>'+feed.slice(0,4).map(postCard).join('')+'</section><section class="surface"><div class="sectionHeader compact"><div><div class="eyebrow">OPPORTUNITIES</div><h2>Open calls</h2></div><button class="textBtn" onclick="setTab(\'Opportunities\')">View all '+icon('arrow',14)+'</button></div>'+state.opps.slice(0,4).map(oppRow).join('')+'</section></div>';
  };

  window.submitAuth=window.submitAuth;
  window.uploadFile=async function(file,bucket,path){
    if(!file||!state.user)return null;
    if(!file.type.startsWith('image/')){showToast('Please choose an image file.');return null}
    if(file.size>5*1024*1024){showToast('Please keep images under 5MB.');return null}
    const finalPath=path||state.user.id+'/'+Date.now()+'-'+file.name.replace(/[^a-zA-Z0-9._-]/g,'_');
    const r=await sb.storage.from(bucket).upload(finalPath,file,{upsert:true,cacheControl:'3600',contentType:file.type});
    if(r.error){showToast(r.error.message);return null}
    return sb.storage.from(bucket).getPublicUrl(finalPath).data.publicUrl;
  };
  window.uploadImage=async function(file,bucket){
    if(!file||!state.user)return;
    const url=await uploadFile(file,bucket);
    if(!url)return;
    const field=bucket==='avatars'?'avatar_url':'cover_url';
    const r=await sb.from('profiles').update({[field]:url}).eq('id',state.user.id);
    if(r.error)return showToast(r.error.message);
    state.user[field]=url;showToast(bucket==='avatars'?'Profile photo updated.':'Cover photo updated.');await hydrate();
  };
  window.previewAvatar=async function(file){await uploadImage(file,'avatars');state.modal=null;render()};
  window.saveProfile=async function(){
    const updates={full_name:document.getElementById('editName').value.trim(),headline:document.getElementById('editHeadline').value.trim(),location:document.getElementById('editLocation').value.trim(),bio:document.getElementById('editBio').value.trim(),skills:document.getElementById('editSkills').value.split(',').map(function(x){return x.trim()}).filter(Boolean).slice(0,20)};
    const r=await sb.from('profiles').update(updates).eq('id',state.user.id);
    if(r.error)return showToast(r.error.message);
    Object.assign(state.user,updates);state.modal=null;showToast('Profile updated.');await hydrate();
  };
  window.createItem=async function(type){
    if(!state.user)return openAuth('signup');
    const desc=document.getElementById('createDesc')?.value.trim()||'';
    if(type==='post'){
      if(!desc)return showToast('Write something first.');
      let media_url=null;const file=document.getElementById('postMedia')?.files?.[0];if(file)media_url=await uploadFile(file,'post-media');
      const r=await sb.from('posts').insert({author_id:state.user.id,content:desc,media_url});
      state.modal=null;showToast(r.error?r.error.message:'Published to your network.');await hydrate();return;
    }
    const title=document.getElementById('createTitle')?.value.trim();if(!title)return showToast('Give it a title first.');
    let r;
    if(type==='project'){const meta=(document.getElementById('createMeta')?.value||'').split('·').map(function(x){return x.trim()});r=await sb.from('projects').insert({owner_id:state.user.id,title,description:desc,format:meta[0]||'Creative Project',genre:meta[1]||null,status:'In Development'})}
    else{r=await sb.from('opportunities').insert({creator_id:state.user.id,title,description:desc,opportunity_type:(document.getElementById('createType')?.value.trim()||'Other'),status:'Open'})}
    state.modal=null;showToast(r.error?r.error.message:'Published successfully.');await hydrate();
  };
  window.toggleLike=async function(id){
    if(!state.user)return openAuth('signup');
    if(String(id).startsWith('demo'))return showToast('Create your ReelPage account to like posts.');
    state.liked=state.liked||new Set();
    const liked=state.liked.has(id);
    if(liked)await sb.from('post_likes').delete().eq('post_id',id).eq('user_id',state.user.id);
    else await sb.from('post_likes').insert({post_id:id,user_id:state.user.id});
    await hydrate();
  };
  window.followTo=async function(id){
    if(!state.user)return openAuth('signup');
    if(String(id).startsWith('d'))return showToast('Follow preview enabled.');
    const r=await sb.from('follows').upsert({follower_id:state.user.id,following_id:id});
    showToast(r.error?'Could not follow.':'Following.');
  };

  window.hydrate=async function(){
    try{
      const p=await sb.from('profiles').select('*').order('created_at',{ascending:false}).limit(40);
      if(p.data?.length)state.profiles=p.data.map(function(x){return Object.assign({},x,{name:x.full_name,role:x.headline||'Creative',verified:x.is_verified})});
      const pr=await sb.from('projects').select('*').order('created_at',{ascending:false}).limit(24);
      if(pr.data?.length)state.projects=pr.data.map(function(x){return Object.assign({},x,{meta:[x.format,x.genre].filter(Boolean).join(' · ')||'Creative Project',owner:x.owner_id===state.user?.id?'You':'ReelPage member',desc:x.description||x.logline||'',tag:x.status||'In Development'})});
      const o=await sb.from('opportunities').select('*').order('created_at',{ascending:false}).limit(24);
      if(o.data?.length)state.opps=o.data.map(function(x){return Object.assign({},x,{type:x.opportunity_type||'Opportunity',loc:x.location||'Remote',deadline:x.deadline?new Date(x.deadline).toLocaleDateString():null,comp:x.compensation||'See details',desc:x.description||''})});
      const posts=await sb.from('posts').select('id,author_id,content,media_url,created_at,profiles(id,full_name,username,headline,avatar_url)').order('created_at',{ascending:false}).limit(30);
      const likes=await sb.from('post_likes').select('post_id,user_id');
      const counts={};(likes.data||[]).forEach(function(l){counts[l.post_id]=(counts[l.post_id]||0)+1});
      state.liked=new Set((likes.data||[]).filter(function(l){return l.user_id===state.user?.id}).map(function(l){return l.post_id}));
      if(posts.data?.length)state.posts=posts.data.map(function(x){return {id:x.id,content:x.content,media_url:x.media_url,created_at:new Date(x.created_at).toLocaleDateString(),author:x.profiles||{full_name:'ReelPage member'},likes_count:counts[x.id]||0}});
      render();
    }catch(e){console.warn(e);render()}
  };

  window.postCard=function(p){
    const a=p.author||{full_name:'ReelPage member'};
    const liked=state.liked?.has(p.id);
    return '<article class="postCard"><div class="postHead">'+avatar(a,'sm')+'<div><strong>'+esc(a.full_name||a.name)+'</strong><small>'+esc(a.headline||a.role||'Creative')+' · '+esc(p.created_at||'Now')+'</small></div><button class="iconBtn bare">'+icon('more',17)+'</button></div><p class="postText">'+esc(p.content)+'</p>'+(p.media_url?'<img class="postMedia" src="'+esc(p.media_url)+'" alt="Post media">':'')+'<div class="postActions"><button class="'+(liked?'liked':'')+'" onclick="toggleLike(\''+esc(p.id)+'\')">'+icon('heart',17)+' <span>'+(p.likes_count||0)+'</span></button><button onclick="showToast(\'Comments are next on the ReelPage roadmap.\')">'+icon('message',17)+' Comment</button><button onclick="showToast(\'Sharing is coming soon.\')">'+icon('arrow',17)+' Share</button></div></article>';
  };

  setTimeout(function(){render()},0);
})();
