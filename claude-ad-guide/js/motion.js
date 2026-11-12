/* Scroll layer: GSAP + ScrollTrigger. guide.js holds the demos and works without this file. */
(function(){
"use strict";
var $=function(s,r){return (r||document).querySelector(s)}, $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var root=document.documentElement,G=window.gsap,ST=window.ScrollTrigger,Guide=window.Guide||{};
var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var steps=$$(".step"),flow=$("#flow"),BAR=56,lenis=null;
function pad(i){return (i<10?"0":"")+i}
function sget(k){try{return sessionStorage.getItem(k)}catch(e){return null}}
function sset(k,v){try{sessionStorage.setItem(k,v)}catch(e){}}

/* ---------- static build: works with or without motion ---------- */
steps.forEach(function(s,i){var b=document.createElement("span");b.className="bignum mono";b.setAttribute("aria-hidden","true");b.textContent=pad(i);s.insertBefore(b,s.firstChild)});
$$(".day-steps").forEach(function(box){
  box.innerHTML=box.dataset.steps.split(",").map(function(id){var s=document.getElementById(id),i=steps.indexOf(s);return s?'<a href="#'+id+'"><b>'+pad(i)+'</b>'+s.dataset.name+'</a>':""}).join("");
});
$("#mqT").innerHTML=steps.map(function(s,i){return "<span"+(i%2?' class="f"':"")+">"+s.dataset.name+"</span>"}).join("<i></i>");

/* in-page links: scroll with the sticky bar in mind */
document.addEventListener("click",function(e){
  var a=e.target.closest&&e.target.closest('a[href^="#"]');if(!a)return;
  var t=document.getElementById(a.getAttribute("href").slice(1));if(!t)return;
  e.preventDefault();
  var y=t.getBoundingClientRect().top+window.scrollY-(t.classList.contains("band")?BAR:BAR+24);
  if(lenis)lenis.scrollTo(y,{duration:1.2});else window.scrollTo({top:y,behavior:reduce?"auto":"smooth"});
  if(history.replaceState)history.replaceState(null,"",a.getAttribute("href"));
});

if(!G||!ST||reduce){root.classList.remove("js");root.classList.add("hero-in");return}
G.registerPlugin(ST);

/* ---------- Lenis smooth scrolling, driven by the GSAP ticker ---------- */
if(window.Lenis){
  $$(".sk details pre").forEach(function(p){p.setAttribute("data-lenis-prevent","")});
  lenis=new window.Lenis({lerp:.11,wheelMultiplier:1,smoothWheel:true});
  lenis.on("scroll",ST.update);
  G.ticker.add(function(t){lenis.raf(t*1000)});
  G.ticker.lagSmoothing(0);
}
var EASE="power3.out";

/* ---------- split text into masked characters ---------- */
var TOK=/[A-Za-z0-9.]+[，。、：；！？）」]*|[^\sA-Za-z0-9.][，。、：；！？）」]*|\s+/g;
function split(el){
  (function walk(node){
    Array.prototype.slice.call(node.childNodes).forEach(function(n){
      if(n.nodeType===3){
        var f=document.createDocumentFragment();
        (n.nodeValue.match(TOK)||[]).forEach(function(t){
          if(/^\s+$/.test(t)){f.appendChild(document.createTextNode(t));return}
          var o=document.createElement("span"),i=document.createElement("i");o.className="ch";i.textContent=t;o.appendChild(i);f.appendChild(o);
        });
        node.replaceChild(f,n);
      }else if(n.nodeType===1)walk(n);
    });
  })(el);
  return $$(".ch>i",el);
}

/* ---------- opening slate, then the hero ---------- */
var h1=$(".hero h1"),h1c=split(h1),heroP=$(".hero p"),cta=$(".hero .cta"),deck=$(".deck");
G.set(h1c,{yPercent:115});
G.set([heroP,cta],{autoAlpha:0,y:16});
G.set(deck,{autoAlpha:0,y:40});
G.set([".hero-num",".sk-el",".scroll-hint"],{autoAlpha:0});
root.classList.remove("js");

function heroIn(delay){
  G.timeline({delay:delay||0,defaults:{ease:EASE}})
    .to(h1c,{yPercent:0,duration:.9,stagger:.024},0)
    .to([heroP,cta],{autoAlpha:1,y:0,duration:.7,stagger:.1},.4)
    .to(deck,{autoAlpha:1,y:0,duration:.9},.25)
    .to(".hero-num",{autoAlpha:1,duration:1.2,ease:"power1.out"},.2)
    .to(".sk-el",{autoAlpha:.9,duration:.8,stagger:.12,ease:"power1.out"},.7)
    .to(".scroll-hint",{autoAlpha:1,duration:.5},1.1)
    .add(function(){root.classList.add("hero-in")},.9)
    .add(function(){if(Guide.playHero&&window.scrollY<window.innerHeight*.6)Guide.playHero()},1);
}
if(location.hash||sget("guide-intro")||window.scrollY>40){heroIn(.1)}
else{
  sset("guide-intro","1");
  var slate=document.createElement("div"),o={t:0},m=Guide.getMode?Guide.getMode():15,tc=Guide.tc||function(t){return t.toFixed(2)};
  slate.className="intro";
  slate.innerHTML='<span class="l">AI 短片廣告入門</span><b>'+tc(0)+'</b><span class="r mono">'+m+' 秒</span>';
  document.body.appendChild(slate);
  var num=$("b",slate);
  G.timeline({onComplete:function(){slate.parentNode&&slate.parentNode.removeChild(slate)}})
    .to(o,{t:m,duration:1.1,ease:"power2.inOut",onUpdate:function(){num.textContent=tc(o.t)}})
    .to(slate,{yPercent:-100,duration:.8,ease:"power3.inOut"},"+=.15")
    .add(function(){heroIn(0)},"-=.5");
}

/* ---------- page-long scrubs ---------- */
G.to("#barProg",{scaleX:1,ease:"none",scrollTrigger:{start:0,end:"max",scrub:.3}});
G.to(".paper",{y:-320,ease:"none",scrollTrigger:{start:0,end:"max",scrub:true}});
G.to(".hero-num",{yPercent:-22,ease:"none",scrollTrigger:{trigger:".hero-sec",start:"top top",end:"bottom top",scrub:true}});
$$(".sk-el").forEach(function(el,i){G.to(el,{y:-(60+i*50),ease:"none",scrollTrigger:{trigger:".hero-sec",start:"top top",end:"bottom top",scrub:true}})});
G.to(".scroll-hint i",{scaleX:0,transformOrigin:"100% 50%",ease:"none",scrollTrigger:{trigger:".hero-sec",start:"top top",end:"+=240",scrub:true}});
G.fromTo("#mqT",{xPercent:0},{xPercent:-42,ease:"none",scrollTrigger:{trigger:".mq",start:"top bottom",end:"bottom top",scrub:.5}});

/* ---------- three days ---------- */
var mm=G.matchMedia();
var daysH=split($("#days h2")),daysP=$("#days .sect-h p");
G.set(daysH,{yPercent:115});G.set(daysP,{autoAlpha:0,y:12});
G.timeline({scrollTrigger:{trigger:"#days",start:"top 70%",once:true},defaults:{ease:EASE}})
  .to(daysH,{yPercent:0,duration:.8,stagger:.03}).to(daysP,{autoAlpha:1,y:0,duration:.6},.3);
mm.add("(min-width:960px)",function(){
  var track=$("#daysTrack"),pin=$(".days-pin"),fill=$("#daysFill");
  function dist(){return Math.max(0,track.offsetWidth-root.clientWidth)}
  var tw=G.to(track,{x:function(){return -dist()},ease:"none",
    scrollTrigger:{trigger:pin,start:"top "+BAR,end:function(){return "+="+dist()},pin:true,scrub:.6,invalidateOnRefresh:true,anticipatePin:1,
      onUpdate:function(s){fill.style.transform="scaleX("+s.progress.toFixed(4)+")"}}});
  $$(".day-n").forEach(function(n){G.fromTo(n,{xPercent:24},{xPercent:-12,ease:"none",scrollTrigger:{trigger:n.parentNode,containerAnimation:tw,start:"left right",end:"right left",scrub:true}})});
  G.from(".day",{autoAlpha:0,y:40,duration:.8,stagger:.1,ease:EASE,scrollTrigger:{trigger:pin,start:"top 60%",once:true}});
});
mm.add("(max-width:959px)",function(){
  $$(".day").forEach(function(d){G.from(d,{autoAlpha:0,y:24,duration:.6,ease:EASE,scrollTrigger:{trigger:d,start:"top 88%",once:true}})});
});

/* ---------- steps ---------- */
steps.forEach(function(s){
  var head=$(".step-h",s),h2=split($("h2",head)),meta=$(".meta",head),p=$("p",head),big=$(".bignum",s),body=$(".step-b",s);
  var txt=$$(".txt > *",s),demos=$$(".step-b > .demo, .step-b > .col",s);
  G.set(h2,{yPercent:115});G.set([meta,p],{autoAlpha:0,y:12});G.set(big,{autoAlpha:0});
  G.timeline({scrollTrigger:{trigger:head,start:"top 84%",once:true},defaults:{ease:EASE}})
    .to(meta,{autoAlpha:1,y:0,duration:.5},0)
    .to(h2,{yPercent:0,duration:.8,stagger:.02},.05)
    .to(p,{autoAlpha:1,y:0,duration:.6},.3)
    .to(big,{autoAlpha:1,duration:1,ease:"power1.out"},.1);
  G.fromTo(big,{yPercent:30},{yPercent:-30,ease:"none",scrollTrigger:{trigger:s,start:"top bottom",end:"top top",scrub:true}});
  if(body){
    G.set(txt,{autoAlpha:0,y:24});
    G.set(demos,{autoAlpha:0,y:40,clipPath:"inset(0% 0% 100% 0% round 16px)"});
    G.timeline({scrollTrigger:{trigger:body,start:"top 82%",once:true},defaults:{ease:EASE}})
      .to(txt,{autoAlpha:1,y:0,duration:.7,stagger:.09,clearProps:"transform"},0)
      .to(demos,{autoAlpha:1,y:0,clipPath:"inset(0% 0% 0% 0% round 16px)",duration:1,stagger:.1,clearProps:"transform,clipPath"},.1);
  }
});
$$(".demo[data-demo]").forEach(function(el){ST.create({trigger:el,start:"top 60%",once:true,onEnter:function(){if(Guide.playDemo)Guide.playDemo(el)}})});

/* ---------- skills and closing ---------- */
var skH=split($("#skills-used h2")),skP=$("#skills-used .sect-h p"),skLi=$$("#skills-used li.sk");
G.set(skH,{yPercent:115});G.set(skP,{autoAlpha:0,y:12});G.set(skLi,{autoAlpha:0,y:24});
G.timeline({scrollTrigger:{trigger:"#skills-used",start:"top 72%",once:true},defaults:{ease:EASE}})
  .to(skH,{yPercent:0,duration:.8,stagger:.025}).to(skP,{autoAlpha:1,y:0,duration:.6},.3);
ST.batch(skLi,{start:"top 90%",once:true,onEnter:function(b){G.to(b,{autoAlpha:1,y:0,duration:.6,stagger:.07,ease:EASE,clearProps:"transform"})}});
var fin=split($(".fin"));
G.set(fin,{yPercent:115});G.set(".fin-row",{autoAlpha:0});
G.timeline({scrollTrigger:{trigger:".fin",start:"top 86%",once:true},defaults:{ease:EASE}})
  .to(fin,{yPercent:0,duration:.9,stagger:.028}).to(".fin-row",{autoAlpha:1,duration:.6},.6);

/* ---------- viewfinder ruler ---------- */
var hudPh=$("#hudPh"),hudLab=$("#hudLab"),hudRuler=$("#hudRuler"),skills=$("#skills-used"),daysEl=$("#days");
ST.create({start:0,end:"max",onUpdate:function(self){
  if(!hudRuler.offsetHeight)return;
  hudPh.style.transform="translateY("+(self.progress*hudRuler.offsetHeight).toFixed(1)+"px)";
  var cur=$('#rail a[aria-current="true"]'),mid=window.innerHeight*.4,lab="開場";
  if(daysEl.getBoundingClientRect().top>mid)lab="開場";
  else if(skills.getBoundingClientRect().top<=mid)lab="skill";
  else if(cur)lab=cur.textContent.replace(/^(\d\d)/,"$1 ");
  else if(daysEl.getBoundingClientRect().top<=mid)lab="三天排程";
  if(hudLab.textContent!==lab)hudLab.textContent=lab;
}});

/* ---------- dolly track through the steps ---------- */
var svg=$("#track"),NS="http://www.w3.org/2000/svg",trk=null;
function el(tag,cls){var e=document.createElementNS(NS,tag);if(cls)e.setAttribute("class",cls);svg.appendChild(e);return e}
function rounded(pts,r){
  var d="M"+pts[0][0]+" "+pts[0][1];
  for(var i=1;i<pts.length;i++){
    var a=pts[i-1],b=pts[i],c=pts[i+1];
    if(!c){d+="L"+b[0]+" "+b[1];break}
    var l1=Math.hypot(b[0]-a[0],b[1]-a[1]),l2=Math.hypot(c[0]-b[0],c[1]-b[1]),k=Math.min(r,l1/2,l2/2);
    if(k<1){d+="L"+b[0]+" "+b[1];continue}
    var p1=[b[0]-(b[0]-a[0])/l1*k,b[1]-(b[1]-a[1])/l1*k],p2=[b[0]+(c[0]-b[0])/l2*k,b[1]+(c[1]-b[1])/l2*k];
    d+="L"+p1[0].toFixed(1)+" "+p1[1].toFixed(1)+"Q"+b[0]+" "+b[1]+" "+p2[0].toFixed(1)+" "+p2[1].toFixed(1);
  }
  return d;
}
function buildTrack(){
  while(svg.firstChild)svg.removeChild(svg.firstChild);trk=null;
  if(getComputedStyle(svg).display==="none")return;
  var fr=flow.getBoundingClientRect(),pts=[],kfs=[],xR=0;
  steps.forEach(function(s,i){
    var head=$(".step-h",s),body=$(".step-b",s),a=$(".txt",s),b=body&&body.children[1];
    if(!head||!body||!a||!b)return;
    var sr=s.getBoundingClientRect(),hr=head.getBoundingClientRect(),br=body.getBoundingClientRect(),ar=a.getBoundingClientRect(),dr=b.getBoundingClientRect();
    if(dr.left<ar.right)return;
    xR=Math.round(sr.right-fr.left-12);
    var xG=Math.round((ar.right+dr.left)/2-fr.left),top=Math.round(sr.top-fr.top),ch=Math.round(hr.bottom-fr.top+14),bot=Math.round(br.bottom-fr.top+44);
    if(!pts.length)pts.push([xR,top-40]);
    pts.push([xR,ch],[xG,ch]);
    kfs.push([xR,top+8]);
    if(i===steps.length-1)pts.push([xG,bot-20]);else pts.push([xG,bot],[xR,bot]);
  });
  if(pts.length<3)return;
  var d=rounded(pts,16),base=el("path","base"),run=el("path","run");
  base.setAttribute("d",d);run.setAttribute("d",d);
  var L=run.getTotalLength(),N=Math.ceil(L/6),ys=[];
  for(var k=0;k<=N;k++)ys.push(run.getPointAtLength(L*k/N).y);
  run.style.strokeDasharray=L;run.style.strokeDashoffset=L;
  var marks=kfs.map(function(p){var r=el("rect","kf");r.setAttribute("x",p[0]-4);r.setAttribute("y",p[1]-4);r.setAttribute("width",8);r.setAttribute("height",8);r.setAttribute("transform","rotate(45 "+p[0]+" "+p[1]+")");return {el:r,y:p[1]}});
  var ring=el("circle","camring"),dot=el("circle","camdot");ring.setAttribute("r",9);dot.setAttribute("r",4);
  var state={len:0};
  function render(){
    var p=run.getPointAtLength(state.len);
    run.style.strokeDashoffset=L-state.len;
    dot.setAttribute("cx",p.x);dot.setAttribute("cy",p.y);ring.setAttribute("cx",p.x);ring.setAttribute("cy",p.y);
    marks.forEach(function(mk){mk.el.setAttribute("class",p.y>=mk.y?"kf on":"kf")});
  }
  var to=G.quickTo(state,"len",{duration:.7,ease:"power3.out",onUpdate:render});
  trk={seek:function(){
    var y=window.innerHeight*.55-flow.getBoundingClientRect().top,lo=0,hi=N;
    if(y<=ys[0]){to(0);return}
    while(lo<hi){var mid=(lo+hi+1)>>1;if(ys[mid]<=y)lo=mid;else hi=mid-1}
    to(L*lo/N);
  }};
  render();trk.seek();
}
ST.create({trigger:flow,start:"top bottom",end:"bottom top",onUpdate:function(){if(trk)trk.seek()}});
ST.addEventListener("refresh",buildTrack);

/* ---------- keep measurements right when the layout changes ---------- */
var rt=0;function refresh(){clearTimeout(rt);rt=setTimeout(function(){ST.refresh()},120)}
document.addEventListener("guide:mode",refresh);
document.addEventListener("toggle",refresh,true);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(refresh);
window.addEventListener("load",refresh);
buildTrack();
})();
