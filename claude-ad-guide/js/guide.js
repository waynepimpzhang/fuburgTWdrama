(function(){
"use strict";
var $=function(s,r){return (r||document).querySelector(s)}, $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var root=document.documentElement, G=window.gsap;
var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var store={get:function(k){try{return localStorage.getItem(k)}catch(e){return null}},set:function(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
var mode=store.get("guide-mode")==="5"?5:15;
if(!G)root.classList.remove("js");
function tc(sec){var f=Math.round(sec*24),s=Math.floor(f/24),ff=f%24;return "00:00:"+(s<10?"0":"")+s+":"+(ff<10?"0":"")+ff}

/* ---------- hero timeline ---------- */
var SHOTS={15:[{n:"S1",l:"遠景，走進來",d:2.5},{n:"S2",l:"中景，伸手",d:3},{n:"S3",l:"特寫，商品",d:3.5},{n:"S4",l:"中景，情緒轉折",d:4.5},{n:"S5",l:"產品定格",d:1.5}],
           5:[{n:"S1",l:"一鏡到底，推近加舉起",d:3.5},{n:"定格",l:"看鏡頭，停在尾格",d:1.5}]};
var camEl=$("#cam"),fig=$("#fig"),arm=$("#arm"),prod=$("#prod"),endc=$("#endc");
var scrub=$("#scrub"),ph=$("#ph"),readout=$("#readout"),shotTag=$("#shotTag"),playIco=$("#playIco");
var heroTl=null,heroT=0;
function cam(tx,ty,s){return {x:90-s*tx,y:160-s*ty,scale:s}}
function ext(o,p){for(var k in p)o[k]=p[k];return o}
function buildHero(){
  var list=SHOTS[mode],total=mode,t=0;
  $("#shotList").innerHTML=list.map(function(s,i){var h='<button type="button" class="shot" data-t="'+t+'" data-i="'+i+'"><span class="n">'+s.n+'</span><span>'+s.l+'</span><span class="d">'+s.d.toFixed(1)+'s</span></button>';t+=s.d;return h}).join("");
  $("#blocks").innerHTML=list.map(function(s){return '<i style="flex:'+s.d+' 1 0"></i>'}).join("");
  scrub.max=total;
  if(!G){syncHero(0);return}
  if(heroTl)heroTl.kill();
  var tl=G.timeline({paused:true,onUpdate:function(){syncHero(tl.time())},onComplete:function(){setPlay(false)}});
  tl.set(arm,{transformOrigin:"0% 50%"},0).set(prod,{transformOrigin:"50% 100%"},0).set(endc,{autoAlpha:0},0);
  if(mode===15){
    tl.set(camEl,ext({svgOrigin:"0 0"},cam(90,160,1)),0).set(fig,{x:-110},0).set(arm,{rotation:20},0).set(prod,{x:0,y:0,rotation:0},0)
      .to(fig,{x:0,duration:2.3,ease:"power1.out"},0)
      .set(camEl,cam(66,160,1.8),2.5).to(camEl,ext({duration:3,ease:"none"},cam(70,160,2)),2.5)
      .to(arm,{rotation:-10,duration:1.2,ease:"power2.inOut"},3.4)
      .set(camEl,cam(120,186,2.8),5.5).to(camEl,ext({duration:3.5,ease:"none"},cam(120,184,3.3)),5.5)
      .to(prod,{y:-8,rotation:-6,duration:1,ease:"power2.out"},6.6)
      .set(camEl,cam(78,165,1.6),9).set(prod,{x:-30,y:-22,rotation:-8},9).set(arm,{rotation:-35},9)
      .to(camEl,ext({duration:4.5,ease:"none"},cam(80,160,1.85)),9)
      .to(arm,{rotation:-55,duration:1.4,ease:"power2.inOut"},10.2).to(prod,{x:-34,y:-40,duration:1.4,ease:"power2.inOut"},10.2)
      .set(camEl,cam(120,184,3),13.5).set(prod,{x:0,y:0,rotation:0},13.5).set(endc,{autoAlpha:1},13.5)
      .to({}, {duration:1.5},13.5);
  }else{
    tl.set(camEl,ext({svgOrigin:"0 0"},cam(84,165,1.2)),0).set(fig,{x:0},0).set(arm,{rotation:-20},0).set(prod,{x:-30,y:-16,rotation:-6},0)
      .to(camEl,ext({duration:3.5,ease:"power1.inOut"},cam(72,152,2.2)),0)
      .to(arm,{rotation:-55,duration:1.6,ease:"power2.inOut"},1).to(prod,{x:-34,y:-40,duration:1.6,ease:"power2.inOut"},1)
      .to(endc,{autoAlpha:1,duration:.3,ease:"power1.out"},3.6)
      .to({}, {duration:1.5},3.5);
  }
  heroTl=tl;tl.progress(0);syncHero(0);
}
function syncHero(t){
  heroT=t;var list=SHOTS[mode],acc=0,idx=0;
  for(var i=0;i<list.length;i++){if(t>=acc-1e-6)idx=i;acc+=list[i].d}
  scrub.value=t;ph.style.left=(t/mode*100)+"%";readout.textContent=tc(t);shotTag.textContent=list[idx].n;
  $$("#shotList .shot").forEach(function(b,i){b.setAttribute("aria-current",i===idx?"true":"false")});
  $$("#blocks i").forEach(function(b,i){b.className=i===idx?"on":""});
}
function setPlay(on){playIco.innerHTML=on?'<path d="M8 5v14M16 5v14"/>':'<path d="M7 5l12 7-12 7z"/>'}
$("#playBtn").addEventListener("click",function(){
  if(!heroTl)return;
  if(heroTl.isActive()){heroTl.pause();setPlay(false)}
  else{if(heroTl.progress()>=1)heroTl.restart();else heroTl.play();setPlay(true)}
});
scrub.addEventListener("input",function(){if(heroTl){heroTl.pause();setPlay(false);heroTl.time(parseFloat(scrub.value))}});
$("#shotList").addEventListener("click",function(e){var b=e.target.closest(".shot");if(!b||!heroTl)return;heroTl.pause();setPlay(false);heroTl.time(parseFloat(b.dataset.t)+0.001)});

/* ---------- mode ---------- */
function setMode(m){
  mode=m;root.dataset.mode=String(m);store.set("guide-mode",String(m));
  $("#mode5").setAttribute("aria-pressed",m===5?"true":"false");$("#mode15").setAttribute("aria-pressed",m===15?"true":"false");
  setTool(m===5?"kling":"seedance");buildHero();renderBudget();onScroll();document.dispatchEvent(new Event("guide:mode"));
}
$$(".bar .seg button").forEach(function(b){b.addEventListener("click",function(){setMode(parseInt(b.dataset.mode,10))})});
function setTool(t){root.dataset.tool=t;$("#toolK").setAttribute("aria-pressed",t==="kling"?"true":"false");$("#toolS").setAttribute("aria-pressed",t==="seedance"?"true":"false")}
$("#toolK").addEventListener("click",function(){setTool("kling")});$("#toolS").addEventListener("click",function(){setTool("seedance")});

/* ---------- scroll progress + rail ---------- */
var steps=$$(".step"),rail=$("#rail"),railHead=$("#railHead"),pageTc=$("#pageTc");
function pad(i){return (i<10?"0":"")+i}
steps.forEach(function(s,i){var nb=$(".meta b",s);if(nb)nb.textContent=pad(i);var li=document.createElement("li");li.innerHTML='<a href="#'+s.id+'"><span class="mono">'+pad(i)+'</span><span>'+s.dataset.name+'</span></a>';rail.appendChild(li)});
var links=$$("a",rail),ticking=false;
function onScroll(){
  ticking=false;
  var max=document.documentElement.scrollHeight-window.innerHeight,p=max>0?Math.min(1,Math.max(0,window.scrollY/max)):0;
  pageTc.textContent=tc(p*mode);
  var cur=-1,mid=window.innerHeight*0.4;
  steps.forEach(function(s,i){if(s.getBoundingClientRect().top<=mid)cur=i});
  links.forEach(function(a,i){if(i===cur)a.setAttribute("aria-current","true");else a.removeAttribute("aria-current")});
  if(rail.offsetHeight){
    var y=0;
    if(cur>=0){var s=steps[cur],r=s.getBoundingClientRect(),f=Math.min(1,Math.max(0,(mid-r.top)/r.height)),a=links[cur].parentNode;y=a.offsetTop+f*a.offsetHeight}
    railHead.style.transform="translateY("+Math.min(y,rail.offsetHeight-7)+"px)";
  }
}
window.addEventListener("scroll",function(){if(!ticking){ticking=true;requestAnimationFrame(onScroll)}},{passive:true});
window.addEventListener("resize",onScroll);

/* ---------- copy ---------- */
$$(".copy").forEach(function(b){b.addEventListener("click",function(){
  var pre=document.getElementById(b.dataset.copy),lab=b.querySelector("span");
  var text=$$("*",pre).length?visibleText(pre):pre.textContent;
  function done(){lab.textContent="已複製";setTimeout(function(){lab.textContent="複製"},1600)}
  function fallback(){var r=document.createRange();r.selectNodeContents(pre);var s=window.getSelection();s.removeAllRanges();s.addRange(r);lab.textContent="已選取，請按 Ctrl+C";setTimeout(function(){lab.textContent="複製"},2400)}
  try{navigator.clipboard.writeText(text).then(done,fallback)}catch(e){fallback()}
})});
function visibleText(el){var out="";el.childNodes.forEach(function(n){if(n.nodeType===3)out+=n.nodeValue;else if(n.nodeType===1&&getComputedStyle(n).display!=="none")out+=visibleText(n)});return out}

/* ---------- budget ---------- */
var ACTS={15:["走進廚房","看見飲料","伸手拿起","打開瓶蓋","喝一口","表情變清醒","看向窗外"],5:["鏡頭推近","舉起飲料","看鏡頭微笑"]};
function renderBudget(){
  var a=ACTS[mode],used=a.length*1.5+1.5,span=Math.max(used,mode);
  $("#chips").innerHTML=a.map(function(t,i){return '<span class="chip">'+esc(t)+'<button type="button" data-i="'+i+'" aria-label="移除 '+esc(t)+'">×</button></span>'}).join("");
  var h="",t=0;a.forEach(function(){t+=1.5;h+='<i class="'+(t+1.5>mode+1e-6?"over":"")+'" style="flex:1.5 1 0"></i>'});
  h+='<i class="hold" style="flex:1.5 1 0"></i>';if(used<mode)h+='<i style="flex:'+(mode-used)+' 1 0;background:none"></i>';
  $("#bar2").innerHTML=h;
  $("#lim").style.left="calc("+(mode/span*100)+"% - 1px)";$("#limLab").textContent=mode+" 秒";
  $("#budgetSum").textContent=used.toFixed(1)+" / "+mode+".0 秒";
  var v=$("#verdict"),diff=mode-used;
  if(diff<-1e-6){var cut=Math.ceil(-diff/1.5);v.className="verdict bad";v.innerHTML="<b>超出 "+(-diff).toFixed(1)+" 秒。</b>至少砍掉或合併 "+cut+" 個動作，或把資訊交給旁白"}
  else{v.className="verdict good";v.innerHTML="<b>放得下。</b>"+(diff>=1.5?"還能再加 "+Math.floor(diff/1.5+1e-6)+" 個動作，但留一點空間節奏會更好":"剛好，別再加了")}
}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
$("#chips").addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;ACTS[mode].splice(parseInt(b.dataset.i,10),1);renderBudget()});
$("#addForm").addEventListener("submit",function(e){e.preventDefault();var i=$("#addInput"),v=i.value.trim();if(!v||ACTS[mode].length>=14)return;ACTS[mode].push(v);i.value="";renderBudget()});

/* ---------- angles ---------- */
var ANG=[{k:"front",l:"正面"},{k:"l45",l:"左 45 度"},{k:"r45",l:"右 45 度"},{k:"side",l:"全側"},{k:"back",l:"背向"},{k:"smile",l:"正面微笑"}];
function head(k){
  var s='<svg viewBox="0 0 56 56" aria-hidden="true"><circle class="gB" cx="28" cy="28" r="18"/>',e='fill="var(--ink)"';
  if(k==="front"||k==="smile")s+='<circle cx="21" cy="26" r="2" '+e+'/><circle cx="35" cy="26" r="2" '+e+'/>'+(k==="smile"?'<path d="M21 34q7 6 14 0" fill="none" stroke="var(--ink)" stroke-width="1.5" stroke-linecap="round"/>':'<path d="M23 35h10" fill="none" stroke="var(--ink)" stroke-width="1.5" stroke-linecap="round"/>');
  if(k==="l45")s+='<circle cx="16" cy="26" r="2" '+e+'/><circle cx="28" cy="26" r="2" '+e+'/><path d="M17 35h9" fill="none" stroke="var(--ink)" stroke-width="1.5" stroke-linecap="round"/>';
  if(k==="r45")s+='<circle cx="28" cy="26" r="2" '+e+'/><circle cx="40" cy="26" r="2" '+e+'/><path d="M30 35h9" fill="none" stroke="var(--ink)" stroke-width="1.5" stroke-linecap="round"/>';
  if(k==="side")s+='<path class="gB" d="M11 24l-6 6 6 2z"/><circle cx="15" cy="25" r="2" '+e+'/><path d="M34 22q6 6 0 12" fill="none" stroke="var(--grey-c)" stroke-width="1.5"/>';
  if(k==="back")s+='<path d="M12 24q16 -16 32 0" fill="none" stroke="var(--grey-c)" stroke-width="1.5"/><path d="M14 30q14 -10 28 0" fill="none" stroke="var(--grey-c)" stroke-width="1.5"/>';
  return s+"</svg>";
}
$("#angles").innerHTML=ANG.map(function(a){return '<button type="button" class="ang" data-k="'+a.k+'" aria-pressed="false">'+head(a.k)+'<span>'+a.l+'</span></button>'}).join("");
$("#angles").addEventListener("click",function(e){
  var b=e.target.closest(".ang");if(!b)return;
  var on=b.getAttribute("aria-pressed")==="true",sel=$$('.ang[aria-pressed="true"]');
  if(!on&&sel.length>=4)return;
  b.setAttribute("aria-pressed",on?"false":"true");
  var ks=$$('.ang[aria-pressed="true"]').map(function(x){return x.dataset.k}),has=function(k){return ks.indexOf(k)>-1},v=$("#angVerdict");
  $("#angCount").textContent=ks.length+" / 4";
  if(ks.length<4){v.className="verdict";v.textContent="再選 "+(4-ks.length)+" 張";return}
  var msg=[];
  if(has("l45")&&has("r45"))msg.push("左右 45 度是同一個資訊，模型會自己鏡像，留一張就好");
  if(has("front")&&has("smile"))msg.push("微笑和中性是同一個角度，表情本來就會依指令生成");
  if(!has("side"))msg.push("少了全側，越肩鏡頭裡的下顎和耳朵會靠模型想像");
  if(!has("back"))msg.push("少了背向，後腦和髮型會每次都不一樣");
  if(msg.length){v.className="verdict bad";v.innerHTML="<b>還可以更好。</b>"+msg.join("；")}
  else{v.className="verdict good";v.innerHTML="<b>這組夠用。</b>正面、45 度、全側、背向，把頭從各個方向交代清楚了"}
});

/* ---------- variants ---------- */
var VAR=["v1","v2","v3","v4"],picked=1;
function renderVars(){
  $("#vars").innerHTML=VAR.map(function(v,i){return '<button type="button" class="var" data-i="'+i+'" aria-pressed="'+(i===picked)+'"><div class="th"><b style="left:'+(38+i*8)+'%"></b><i></i></div><span class="mono">S1_'+v+'</span></button>'}).join("");
  $("#jobLog").textContent=VAR.map(function(v,i){return "S1_"+v+".mp4   5s   完成"+(i===picked?"   選定":"")}).join("\n");
}
$("#vars").addEventListener("click",function(e){var b=e.target.closest(".var");if(!b)return;picked=parseInt(b.dataset.i,10);renderVars()});

/* ---------- diagnose ---------- */
var DX=[
 ["整支只有一顆不動的鏡頭","沒有明講這是剪接序列","開頭宣告鏡頭數，每個鏡頭給不同的焦段與角度"],
 ["道具被轉向鏡頭，角色在讀背面","同一個鏡頭要求了兩件互斥的事","換成越肩高角，畫面裡不給完整正臉"],
 ["角色崩壞變形","同時要動的東西太多，或主體太小","只讓一到兩個主體做主要動作，其餘幾乎不動"],
 ["身體比例奇怪、少一條腿","姿勢交疊，腿腳入鏡","切在腰部以上，改成並坐不重疊"],
 ["畫面中途多長出東西","首尾格的空間關係差太多","重做尾格，讓站位和前後關係與首格一致"],
 ["某個場景整段消失","場景轉換被長段落吞掉","給它自己的時間碼與鏡位，或單獨補拍再剪進去"],
 ["包裝或招牌上是假字","讓模型當場生成文字","改用首尾格放真實素材，或收回後期處理"],
 ["該演的沒演，像靜物","演出寫成了一句話","拆成三到四個帶時間碼的節拍，並給足秒數"]];
$("#dxList").innerHTML=DX.map(function(d,i){return '<li><button type="button" data-i="'+i+'" aria-pressed="'+(i===0)+'">'+d[0]+'</button></li>'}).join("");
function showDx(i){$("#dxWhy").textContent=DX[i][1];$("#dxFix").textContent=DX[i][2];$$("#dxList button").forEach(function(b,j){b.setAttribute("aria-pressed",j===i?"true":"false")})}
$("#dxList").addEventListener("click",function(e){var b=e.target.closest("button");if(b)showDx(parseInt(b.dataset.i,10))});

/* ---------- voice audition ---------- */
var VOICES=["Algenib","Charon","Iapetus","Orus","Rasalgethi"],WRITE=["漢字","台羅"],audSel="1-0";
function wave(seed){var s="",x=seed*97+13;for(var i=0;i<22;i++){x=(x*73+41)%101;s+='<i style="height:'+(6+x%20)+'px"></i>'}return s}
function renderAud(){
  var h='<div class="r hd"><span>聲線</span><span>'+WRITE[0]+'寫法</span><span>'+WRITE[1]+'寫法</span></div>';
  VOICES.forEach(function(v,i){h+='<div class="r"><span class="mono">'+v+'</span>';WRITE.forEach(function(w,j){var k=i+"-"+j;h+='<button type="button" class="wv" data-k="'+k+'" aria-pressed="'+(k===audSel)+'" aria-label="'+v+' '+w+'寫法">'+wave(i*2+j+1)+'</button>'});h+='</div>'});
  $("#aud").innerHTML=h;
  var p=audSel.split("-");$("#audPick").textContent=VOICES[p[0]]+" · "+WRITE[p[1]];
  $("#audVerdict").innerHTML="<b>選定 "+VOICES[p[0]]+"，"+WRITE[p[1]]+"寫法。</b>接著請 Claude 用這個組合把每一句分開生成";
}
$("#aud").addEventListener("click",function(e){var b=e.target.closest(".wv");if(!b)return;audSel=b.dataset.k;renderAud()});

/* ---------- end card timeline ---------- */
var ecTl=null,ecScrub=$("#ecScrub"),ecRead=$("#ecRead");
function ecSync(){if(!ecTl)return;ecScrub.value=ecTl.progress();ecRead.textContent=ecTl.time().toFixed(2)+"s"}
if(G){
  ecTl=G.timeline({paused:true,onUpdate:ecSync});
  ecTl.from("#ecLogo",{autoAlpha:0,duration:.5,ease:"power1.out"},0)
      .from(["#ecL1","#ecL2"],{y:14,autoAlpha:0,duration:.65,ease:"power3.out",stagger:.18},.4)
      .from("#ecPack",{scale:.95,autoAlpha:0,duration:.7,ease:"power2.out"},.5)
      .to({}, {duration:.4});
  ecTl.progress(1);ecSync();
  ecScrub.addEventListener("input",function(){ecTl.pause().progress(parseFloat(ecScrub.value))});
}

/* ---------- checklist ---------- */
$$("#todo input").forEach(function(c){c.checked=store.get("guide-"+c.id)==="1";c.addEventListener("change",function(){store.set("guide-"+c.id,c.checked?"1":"0")})});

/* ---------- demo animations (play once in view, replay on demand) ---------- */
var orb=$("#orbCam");
function placeOrb(p){var a=(152-p*112)*Math.PI/180,r=118-p*34,cx=160,cy=80,x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r,rot=Math.atan2(cy-y,cx-x)*180/Math.PI;orb.setAttribute("transform","translate("+x.toFixed(1)+" "+y.toFixed(1)+") rotate("+rot.toFixed(1)+")")}
placeOrb(1);
var DEMOS={
  term:function(el){var you=$("#termYou"),full=you.dataset.full||(you.dataset.full=you.textContent),o={n:0},re=$$(".re",el);
    return G.timeline().set(re,{autoAlpha:0}).to(o,{n:full.length,duration:1.4,ease:"none",onUpdate:function(){you.textContent=full.slice(0,Math.round(o.n))}}).to(re,{autoAlpha:1,y:0,duration:.3,stagger:.35,ease:"power1.out"},"+=.2")},
  cmp:function(el){var rows=$$(".rows li",el).filter(function(r){return r.offsetParent});return G.timeline().from(rows,{autoAlpha:0,y:6,duration:.3,stagger:.14,ease:"power2.out"})},
  orbit:function(){var o={p:0};return G.timeline().to(o,{p:1,duration:2.6,ease:"power2.inOut",onUpdate:function(){placeOrb(o.p)}})},
  vars:function(el){return G.timeline().fromTo($$(".th i",el),{scaleX:0},{scaleX:1,duration:1.2,stagger:.2,ease:"power1.inOut"})},
  tracks:function(el){var c=$$(".clip[data-dx]",el);return G.timeline().from(c,{x:function(i,t){return parseFloat(t.dataset.dx)},autoAlpha:.4,duration:.7,stagger:.08,ease:"power3.out"})}
};
var live={};
function playDemo(el){var k=el.dataset.demo;if(k==="comp"){if(ecTl)ecTl.restart();return}if(!G||!DEMOS[k])return;if(live[k])live[k].progress(1).kill();live[k]=DEMOS[k](el)}
$$(".demo[data-demo]").forEach(function(el){var b=$(".replay",el);if(b)b.addEventListener("click",function(){playDemo(el)})});
if(G&&!reduce&&!window.ScrollTrigger&&"IntersectionObserver" in window){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){io.unobserve(e.target);playDemo(e.target)}})},{threshold:.45});
  $$(".demo[data-demo]").forEach(function(el){io.observe(el)});
}

/* ---------- boot ---------- */
renderVars();renderAud();showDx(0);setMode(mode);
window.Guide={playDemo:playDemo,tc:tc,getMode:function(){return mode},playHero:function(){if(heroTl){heroTl.play();setPlay(true)}}};
if(heroTl&&!reduce&&!window.ScrollTrigger){heroTl.play();setPlay(true)}
})();
