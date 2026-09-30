/* REEL AI — voice + in-app assistant for ReelPage */
(function(){
  'use strict';

  const WAKE = /\b(?:hey\s+)?reel\s*ai\b[,:.!\s-]*/i;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const ai = {
    recognition:null,
    listening:false,
    armed:false,
    speaking:false,
    mounted:false,
    history:[],
    flow:null,
    lastTranscript:'',
    retryTimer:null,
    recognitionSupported:!!SpeechRecognition
  };
  window.ReelAI = ai;

  const escAI = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const speak = (text) => {
    if(!('speechSynthesis' in window) || !text) return;
    try{
      ai.speaking=true;
      window.speechSynthesis.cancel();
      const u=new SpeechSynthesisUtterance(String(text));
      u.lang='en-NG';
      u.rate=1.02;
      u.pitch=1;
      u.onend=()=>{ai.speaking=false; if(ai.listening && ai.recognition) safeStart();};
      u.onerror=()=>{ai.speaking=false; if(ai.listening && ai.recognition) safeStart();};
      window.speechSynthesis.speak(u);
    }catch(_){}
  };

  function toast(message){
    if(window.showToast) window.showToast(message);
  }

  function setPanel(open){
    const panel=document.getElementById('reelAiPanel');
    if(!panel)return;
    panel.classList.toggle('open',!!open);
    if(open) setTimeout(()=>document.getElementById('reelAiInput')?.focus(),80);
  }

  function addChat(role,text){
    ai.history.push({role,text});
    const body=document.getElementById('reelAiMessages');
    if(!body)return;
    const row=document.createElement('div');
    row.className='reel-ai-msg '+role;
    row.innerHTML='<span class="reel-ai-msg-label">'+(role==='ai'?'REEL AI':'YOU')+'</span><p>'+escAI(text)+'</p>';
    body.appendChild(row);
    body.scrollTop=body.scrollHeight;
  }

  function answer(text, opts={}){
    addChat('ai',text);
    if(opts.speak!==false) speak(text);
  }

  function mount(){
    if(document.getElementById('reelAiRoot')) return;
    const root=document.createElement('div');
    root.id='reelAiRoot';
    root.innerHTML=`
      <button id="reelAiFab" class="reel-ai-fab" type="button" aria-label="Open Reel AI" title="Reel AI">
        <span class="reel-ai-orbit"></span><span class="reel-ai-mic">⌁</span><span class="reel-ai-fab-text">Reel AI</span>
      </button>
      <section id="reelAiPanel" class="reel-ai-panel" aria-label="Reel AI assistant">
        <header class="reel-ai-head">
          <div class="reel-ai-avatar">R<span>AI</span></div>
          <div><strong>Reel AI</strong><small id="reelAiStatus">Your filmmaking copilot</small></div>
          <button id="reelAiClose" class="reel-ai-close" type="button" aria-label="Close">×</button>
        </header>
        <div id="reelAiMessages" class="reel-ai-messages">
          <div class="reel-ai-msg ai"><span class="reel-ai-msg-label">REEL AI</span><p>I’m here. Say “Reel AI” and I’ll listen, or type what you want me to do.</p></div>
          <div class="reel-ai-chips">
            <button type="button" data-ai-command="find filmmakers in Lagos">Find filmmakers</button>
            <button type="button" data-ai-command="open script marketplace">Open scripts</button>
            <button type="button" data-ai-command="help me improve my profile">Improve my profile</button>
            <button type="button" data-ai-command="craft a message to a producer">Craft a message</button>
          </div>
        </div>
        <form id="reelAiForm" class="reel-ai-form">
          <input id="reelAiInput" autocomplete="off" placeholder="Tell Reel AI what to do…" aria-label="Ask Reel AI">
          <button id="reelAiMic" class="reel-ai-mic-btn" type="button" aria-label="Start voice listening">●</button>
          <button class="reel-ai-send" type="submit" aria-label="Send">↑</button>
        </form>
        <footer class="reel-ai-foot"><span id="reelAiHint">Voice recognition works best in supported browsers.</span><button type="button" id="reelAiListenToggle">Start voice</button></footer>
      </section>`;
    document.body.appendChild(root);

    root.querySelector('#reelAiFab').onclick=()=>{setPanel(true);if(!ai.listening)toggleListening();};
    root.querySelector('#reelAiClose').onclick=()=>setPanel(false);
    root.querySelector('#reelAiForm').onsubmit=e=>{
      e.preventDefault();
      const input=root.querySelector('#reelAiInput');
      const value=input.value.trim();
      if(!value)return;
      input.value='';
      runCommand(value);
    };
    root.querySelector('#reelAiMic').onclick=toggleListening;
    root.querySelector('#reelAiListenToggle').onclick=toggleListening;
    root.querySelectorAll('[data-ai-command]').forEach(b=>b.onclick=()=>runCommand(b.dataset.aiCommand));
    ai.mounted=true;
    updateUI();
  }

  function updateUI(){
    const root=document.getElementById('reelAiRoot');
    if(!root)return;
    const fab=root.querySelector('#reelAiFab');
    const mic=root.querySelector('#reelAiMic');
    const toggle=root.querySelector('#reelAiListenToggle');
    const status=root.querySelector('#reelAiStatus');
    if(fab)fab.classList.toggle('listening',ai.listening);
    if(mic)mic.classList.toggle('active',ai.listening);
    if(toggle)toggle.textContent=ai.listening?'Stop voice':'Start voice';
    if(status)status.textContent=ai.listening?(ai.armed?'Listening for your command…':'Listening for “Reel AI”…'):'Your filmmaking copilot';
  }

  function buildRecognition(){
    if(!SpeechRecognition)return null;
    const r=new SpeechRecognition();
    r.lang='en-NG';
    r.continuous=true;
    r.interimResults=true;
    r.maxAlternatives=3;
    r.onstart=()=>{ai.listening=true;updateUI();};
    r.onend=()=>{
      if(ai.listening && !ai.speaking) {
        clearTimeout(ai.retryTimer);
        ai.retryTimer=setTimeout(safeStart,350);
      } else updateUI();
    };
    r.onerror=e=>{
      if(e.error==='not-allowed'||e.error==='service-not-allowed'){
        ai.listening=false; ai.armed=false; updateUI();
        answer('I need microphone permission before I can listen.',{speak:false});
        return;
      }
      updateUI();
    };
    r.onresult=e=>{
      let finalText='';
      let interim='';
      for(let i=e.resultIndex;i<e.results.length;i++){
        const txt=e.results[i][0]?.transcript?.trim()||'';
        if(e.results[i].isFinal) finalText+=' '+txt;
        else interim+=' '+txt;
      }
      const live=(finalText||interim).trim();
      if(live) {
        ai.lastTranscript=live;
        const lower=live.toLowerCase();
        if(!ai.armed && WAKE.test(live)){
          const command=live.replace(WAKE,'').trim();
          ai.armed=true;
          answer('I am listening.');
          if(command) {
            ai.armed=false;
            runCommand(command);
          }
          return;
        }
        if(ai.armed && finalText.trim()){
          ai.armed=false;
          runCommand(finalText.trim());
        }
      }
    };
    return r;
  }

  function safeStart(){
    if(!ai.listening || ai.speaking || !ai.recognition)return;
    try{ai.recognition.start();}catch(_){}
  }

  function toggleListening(){
    if(!SpeechRecognition){
      answer('Voice recognition is not available in this browser. Try Chrome or Edge on desktop.',{speak:false});
      return;
    }
    if(ai.listening){
      ai.listening=false;ai.armed=false;
      try{ai.recognition.stop();}catch(_){}
      updateUI();
      return;
    }
    ai.recognition=ai.recognition||buildRecognition();
    ai.listening=true;
    updateUI();
    safeStart();
  }

  async function searchProfiles(term){
    const q=String(term||'').trim().replace(/[,%()]/g,' ').replace(/[.*]/g,' ').replace(/\s+/g,' ').slice(0,80);
    if(!q){answer('Tell me the name, role, skill or city you want to search.');return;}
    const db=window.sb;
    if(!db){answer('The ReelPage data connection is not ready yet.');return;}
    answer('Searching ReelPage for '+q+'…',{speak:false});
    const fields='id,username,full_name,role,headline,bio,location,country,avatar_url,cover_url,skills,is_verified,followers_count,connections_count,created_at';
    let data=[],error=null;
    const locationMatch=q.match(/^(.+?)\s+(?:in|at|from)\s+(.+)$/i);
    if(locationMatch){
      const role=locationMatch[1].trim(), loc=locationMatch[2].trim();
      const [a,b]=await Promise.all([
        db.from('profiles').select(fields).or(`full_name.ilike.%${role}%,username.ilike.%${role}%,role.ilike.%${role}%,headline.ilike.%${role}%`).limit(60),
        db.from('profiles').select(fields).or(`location.ilike.%${loc}%,country.ilike.%${loc}%`).limit(100)
      ]);
      error=a.error||b.error;
      if(!error){
        const ids=new Set((b.data||[]).map(x=>String(x.id)));
        data=(a.data||[]).filter(x=>ids.has(String(x.id))).slice(0,24);
      }
    }else{
      const filter=`full_name.ilike.%${q}%,username.ilike.%${q}%,role.ilike.%${q}%,headline.ilike.%${q}%,location.ilike.%${q}%`;
      const result=await db.from('profiles').select(fields).or(filter).order('created_at',{ascending:false}).limit(24);
      data=result.data||[];error=result.error;
    }
    if(error){answer('I could not complete that search right now.');return;}
    if(window.state){
      window.state.profiles=data;
      window.state.search=q;
      window.state.tab='Discover';
      window.state.viewedProfileId=null;
      window.render();
    }
    answer(data.length?`I found ${data.length} creative profile${data.length===1?'':'s'} matching “${q}”.`:'I could not find a matching profile yet.');
  }

  async function findPerson(term){
    const needle=String(term||'').trim().replace(/^@/,'');
    const local=(window.state?.profiles||[]).find(p=>
      String(p.username||'').toLowerCase()===needle.toLowerCase() ||
      String(p.full_name||'').toLowerCase()===needle.toLowerCase() ||
      String(p.full_name||'').toLowerCase().includes(needle.toLowerCase())
    );
    if(local)return local;
    const db=window.sb;if(!db)return null;
    const safe=needle.replace(/[,%()]/g,' ').replace(/[.*]/g,' ').slice(0,60);
    const {data}=await db.from('profiles').select('id,username,full_name,role,headline,bio,location,country,avatar_url,cover_url,skills,is_verified,followers_count,connections_count,created_at').or(`full_name.ilike.%${safe}%,username.ilike.%${safe}%,headline.ilike.%${safe}%`).limit(8);
    return (data||[])[0]||null;
  }

  function craftedMessage(person,topic){
    const name=person?.full_name||'there';
    const subject=topic||'a possible creative collaboration';
    return `Hi ${name}, I came across your work on ReelPage and I really like what you’re building. I’d love to discuss ${subject}. If you’re open to it, I’d be happy to share more about the project and explore whether we could create something together. Best, ${window.state?.user?.full_name||'a ReelPage creative'}.`;
  }

  async function openMessage(person,body){
    if(!window.state?.user){window.openAuth?.('login');return;}
    if(String(person.id)===String(window.state.user.id)){answer('That is your own profile. Pick another creative.');return;}
    if(!window.state.profiles.some(p=>String(p.id)===String(person.id)))window.state.profiles.unshift(person);
    window.state.selectedConversation=person.id;
    window.state.tab='Messages';
    if(window.loadMessages)await window.loadMessages();
    window.render();
    if(body){
      setTimeout(()=>{
        const input=document.getElementById('messageBody');
        if(input){input.value=body;input.focus();}
      },80);
    }
  }

  async function sendDirect(person,body){
    if(!window.state?.user){window.openAuth?.('login');return;}
    const text=String(body||'').trim();
    if(!text){answer('Tell me what you want the message to say.');return;}
    const {error}=await window.sb.from('messages').insert({sender_id:window.state.user.id,recipient_id:person.id,body:text});
    if(error){answer('I could not send that message.');return;}
    window.state.selectedConversation=person.id;
    window.state.tab='Messages';
    if(window.loadMessages)await window.loadMessages();
    window.render();
    answer('Message sent to '+(person.full_name||'your connection')+'.');
  }

  async function profileInterview(){
    if(!window.state?.user){window.openAuth?.('login');return;}
    ai.flow={step:0,answers:{}};
    answer('Let’s build your professional profile. First: what do you make or what kind of filmmaker are you?');
  }

  async function handleFlow(text){
    if(!ai.flow)return false;
    const f=ai.flow;
    if(f.step===0){f.answers.headline=text.trim();f.step=1;answer('Nice. Which city or region are you based in?');return true;}
    if(f.step===1){f.answers.location=text.trim();f.step=2;answer('What are three to five skills you want filmmakers to find you for?');return true;}
    if(f.step===2){f.answers.skills=text.split(/,| and /i).map(x=>x.trim()).filter(Boolean).slice(0,8);f.step=3;answer('In one or two sentences, what kind of stories or work do you want to be known for?');return true;}
    if(f.step===3){
      f.answers.bio=text.trim();
      const {error}=await window.sb.from('profiles').update({headline:f.answers.headline,location:f.answers.location,skills:f.answers.skills,bio:f.answers.bio}).eq('id',window.state.user.id);
      if(error){answer('I could not save the profile update.');ai.flow=null;return true;}
      Object.assign(window.state.user,{headline:f.answers.headline,location:f.answers.location,skills:f.answers.skills,bio:f.answers.bio});
      ai.flow=null;
      await window.hydrate?.();
      answer('Your professional profile has been updated. You’re ready to be discovered.');
      return true;
    }
    return false;
  }

  async function runCommand(raw){
    const text=String(raw||'').trim();
    if(!text)return;
    setPanel(true);
    addChat('user',text);
    if(await handleFlow(text))return;
    const lower=text.toLowerCase();

    if(/^help|what can you do|commands/.test(lower)){
      answer('I can search creatives, open profiles and sections, follow or connect with people, open or send messages, craft messages, publish posts, create projects, list scripts, share posts, and help complete your profile.');
      return;
    }
    if(/^(stop|go quiet|stop listening|turn off voice)/.test(lower)){
      ai.listening=false;ai.armed=false;try{ai.recognition?.stop();}catch(_){ }updateUI();answer('Voice listening is off.',{speak:false});return;
    }
    if(/\b(?:open|go to|show)\b.*\b(?:script|scripts|marketplace)\b/.test(lower)){
      window.setTab?.('Scripts');answer('Opening the script marketplace.');return;
    }
    if(/\b(?:open|go to|show)\b.*\b(?:home|feed)\b/.test(lower)){window.setTab?.('Home');answer('Opening your feed.');return;}
    if(/\b(?:open|go to|show)\b.*\bdiscover\b/.test(lower)){window.setTab?.('Discover');answer('Opening Discover.');return;}
    if(/\b(?:open|go to|show)\b.*\bprojects?\b/.test(lower)){window.setTab?.('Projects');answer('Opening Projects.');return;}
    if(/\b(?:open|go to|show)\b.*\bmessages?\b/.test(lower)){window.setTab?.('Messages');answer('Opening Messages.');return;}
    if(/\b(?:open|go to|show)\b.*\bprofile\b/.test(lower)){window.setTab?.('Profile');answer('Opening your profile.');return;}

    const searchMatch=lower.match(/(?:search|find|look for|show me)\s+(?:for\s+)?(?:an?\s+)?(?:account|accounts|creative|creatives|filmmaker|filmmakers|writer|writers|actor|actors|director|directors|producer|producers|person|people)?\s*(?:named\s+)?(.+)/);
    if(searchMatch){
      let term=searchMatch[1].trim();
      term=term.replace(/\b(?:in|from)\s+(?:the\s+)?(?:network|reelpage)\b/,'').trim();
      if(term) {await searchProfiles(term);return;}
    }

    const connectMatch=text.match(/(?:connect|send a connection request)\s+(?:me\s+)?(?:with|to)\s+(.+)/i);
    if(connectMatch){
      const person=await findPerson(connectMatch[1]);
      if(!person){answer('I could not find that creative. Try their full name or username.');return;}
      if(!window.state?.user){window.openAuth?.('login');return;}
      await window.connectTo?.(person.id);answer('Connection request sent to '+person.full_name+'.');return;
    }

    const followMatch=text.match(/follow\s+(.+)/i);
    if(followMatch){
      const person=await findPerson(followMatch[1]);
      if(!person){answer('I could not find that creative.');return;}
      await window.followTo?.(person.id);answer('I handled the follow action for '+person.full_name+'.');return;
    }

    const sendMatch=text.match(/(?:send|message)\s+(?:a\s+)?message\s+(?:to|for)\s+(.+?)\s+(?:saying|that says|:)(.+)/i);
    if(sendMatch){
      const person=await findPerson(sendMatch[1]);
      if(!person){answer('I could not find that creative.');return;}
      await sendDirect(person,sendMatch[2].trim());return;
    }

    const craftMatch=text.match(/(?:craft|write|draft)\s+(?:a\s+)?message\s+(?:to|for)\s+(.+?)(?:\s+(?:about|regarding|for)\s+(.+))?$/i);
    if(craftMatch){
      const person=await findPerson(craftMatch[1]);
      if(!person){answer('I could not find that creative.');return;}
      const body=craftedMessage(person,craftMatch[2]);
      await openMessage(person,body);
      answer('I drafted the message and placed it in your conversation with '+person.full_name+'.',{speak:false});
      return;
    }

    const profileMatch=/(?:help me|let us|let’s|lets)\s+(?:complete|improve|build|finish)\s+(?:my\s+)?profile/i;
    if(profileMatch||/ask me questions.*profile|interview me for my profile/i.test(lower)){await profileInterview();return;}

    if(/\b(?:create|write|publish|post)\b.*\b(?:post|update)\b/.test(lower)){
      if(!window.state?.user){window.openAuth?.('login');return;}
      window.openCreate?.('post');answer('Post composer opened. Tell me what you want to publish.');return;
    }
    if(/\b(?:create|start|make)\b.*\bproject\b/.test(lower)){
      if(!window.state?.user){window.openAuth?.('login');return;}
      window.openCreate?.('project');answer('Project composer opened.');return;
    }
    if(/\b(?:list|sell|publish)\b.*\b(?:script|screenplay|treatment)\b/.test(lower)){
      if(!window.state?.user){window.openAuth?.('login');return;}
      window.openCreate?.('script');answer('Script listing opened.');return;
    }

    if(/\b(?:share)\b.*\bpost\b/.test(lower)){answer('Use the Share button on the post you want to share, and Reel AI will handle the rest once the post is selected.');return;}

    answer('I can do that inside ReelPage, but I need a little more detail. Try: “search for directors in Lagos”, “connect me with Amara”, “craft a message to Tobi about my short film”, or “open the script marketplace”.');
  }



  async function openComments(postId){
    const db=window.sb;
    if(!db){toast('ReelPage data is not ready.');return;}
    const existing=document.getElementById('reelCommentsBackdrop');
    if(existing)existing.remove();
    const wrap=document.createElement('div');
    wrap.id='reelCommentsBackdrop';
    wrap.className='reel-comments-backdrop';
    wrap.innerHTML='<div class="reel-comments-modal"><header class="reel-comments-head"><div><strong>Conversation</strong><small style="display:block;color:#6e8293;margin-top:3px">Comments on this post</small></div><button type="button" class="reel-ai-close" id="reelCommentsClose">×</button></header><div class="reel-comments-list" id="reelCommentsList"><div style="color:#71869a;padding:20px 0">Loading comments…</div></div><form class="reel-comments-form" id="reelCommentsForm"><input id="reelCommentInput" maxlength="2000" placeholder="Add a thoughtful comment…" aria-label="Comment"><button type="submit">Post</button></form></div>';
    document.body.appendChild(wrap);
    wrap.addEventListener('click',e=>{if(e.target===wrap)wrap.remove();});
    wrap.querySelector('#reelCommentsClose').onclick=()=>wrap.remove();
    const list=wrap.querySelector('#reelCommentsList');
    const renderComments=rows=>{
      list.innerHTML=rows.length?rows.map(x=>'<div class="reel-comment">'+(window.avatar?window.avatar(x.author,'xs'):'')+'<div class="reel-comment-body"><b>'+escAI(x.author?.full_name||'ReelPage member')+'</b><div>'+escAI(x.body)+'</div><small>'+escAI(new Date(x.created_at).toLocaleString())+'</small></div></div>').join(''):'<div style="color:#71869a;padding:30px 0;text-align:center">Be the first to start the conversation.</div>';
      list.scrollTop=list.scrollHeight;
    };
    const load=async()=>{
      const {data,error}=await db.from('post_comments').select('id,post_id,author_id,body,created_at,profiles(id,full_name,username,headline,avatar_url)').eq('post_id',postId).order('created_at',{ascending:true}).limit(100);
      if(error){list.innerHTML='<div style="color:#ff8d9a;padding:20px 0">Comments could not be loaded.</div>';return;}
      renderComments((data||[]).map(x=>({...x,author:x.profiles})));
    };
    await load();
    wrap.querySelector('#reelCommentsForm').onsubmit=async e=>{
      e.preventDefault();
      if(!window.state?.user){window.openAuth?.('login');return;}
      const input=wrap.querySelector('#reelCommentInput');
      const body=input.value.trim();
      if(!body)return;
      const {error}=await db.from('post_comments').insert({post_id:postId,author_id:window.state.user.id,body});
      if(error){toast(error.message);return;}
      input.value='';
      await load();
    };
  }

  async function sharePost(postId){
    const url=window.location.origin+window.location.pathname+'#post-'+encodeURIComponent(postId);
    const title='ReelPage creative post';
    try{
      if(navigator.share){await navigator.share({title,text:'A creative post on ReelPage',url});}
      else if(navigator.clipboard){await navigator.clipboard.writeText(url);toast('Post link copied.');}
      else toast('Copy this page link to share the post.');
    }catch(e){if(e?.name!=='AbortError')toast('Sharing was cancelled or unavailable.');}
  }

  window.messageScriptSeller=async function(sellerId,prefill){
    if(!window.state?.user){window.openAuth?.('login');return;}
    if(String(sellerId)===String(window.state.user.id)){toast('That is your own script listing.');return;}
    const person=await findPerson(String(sellerId));
    if(!person){answer('I could not load the script writer profile.');return;}
    await openMessage(person,prefill||'I found your script on ReelPage and would like to discuss it.');
  };
  window.openComments=openComments;window.sharePost=sharePost;
  window.reelAiCommand=runCommand;
  window.openReelAI=()=>{mount();setPanel(true);};
  window.toggleReelAIVoice=toggleListening;

  // Voice is opt-in at the browser level: the user starts listening once, then Reel AI keeps the recognition session alive.
  // This avoids silently activating a microphone without a user gesture.
  document.addEventListener('click',e=>{
    if(e.target.closest?.('#reelAiFab,#reelAiPanel'))return;
    if(ai.mounted && ai.listening) updateUI();
  });

  const originalRender=window.render;
  if(typeof originalRender==='function'){
    window.render=function(){
      originalRender();
      requestAnimationFrame(mount);
    };
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);
  else mount();
})();