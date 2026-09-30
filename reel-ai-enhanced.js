(function(){
const A=window.ReelAI;
const oldMount=A&&A.mounted;
window.__REELAI_ENHANCED__=true;
function toast(m){window.showToast?.(m);}
async function agent(action,payload={}){
 if(!window.state?.user){window.openAuth?.('login');return null}
 try{const {data,error}=await window.sb.functions.invoke('reelpage-agent',{body:{action,...payload}});if(error||!data?.ok){toast(data?.error||'Reel AI could not complete that action.');return null}return data}catch(e){toast('Reel AI could not complete that action.');return null}
}
async function contextFor(projectId){
 const r=await agent('get_project_context',{project_id:projectId});return r;
}
window.reelAIEnhanced={agent,contextFor};
})();