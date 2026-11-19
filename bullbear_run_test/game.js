/* BullBear Run v1 • Galactic Game Labz
 * Standalone Canvas 2D remaster. Clean engine; original lane/physics/difficulty values.
 * All scores are local. No remote leaderboard, analytics or API calls.
 */
(() => {
'use strict';
const W=400,H=700,HOME_URL='https://www.bullbeargames.com/';
const BEST_KEY='bullbear_run_v1_best',TOP_KEY='bullbear_run_v1_top10',MUTE_KEY='bullbear_run_v1_mute',TRACK_KEY='bullbear_run_v1_track';
const COMBO_MS=2600,POWER_MS=5000,ZAP_MS=25000,PLAYER_Z=26,RUNNER_SCALE=.24,SLIDE_H=62.5;
const $=id=>document.getElementById(id), canvas=$('game'),ctx=canvas.getContext('2d',{alpha:false});
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),ease=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
const store={get(k,d){try{return localStorage.getItem(k)??d;}catch(_){return d;}},set(k,v){try{localStorage.setItem(k,v);}catch(_){}}};
const images={},crop={},backgrounds=['crystal_forest','bull_arena','upside_down','spooky_island','crypto_trading','slime_lab','mars_colony'];
const bgNames=['Crystal Forest','Bull Arena','Upside Down','Spooky Island','Crypto Trading','Slime Lab','Mars Colony'];
const colors={magnet:'#ff7fe0',boost:'#6dff9a',double_coins:'#ffd56a',shield:'#7ad8ff',zap:'#8ee4ff'};
const order=[0,4,1,5,2,6,3,7];
let ready=false,mode='loading',lastFrame=0,wall=0,sceneClock=0,dpr=1,uiClock=0,id=0;
let frozen=false;
let best=Math.max(0,Number(store.get(BEST_KEY,'0'))||0),lastRun=null,paused=false;
let s,p,objects=[],floats=[],bolts=[],particles=[],warp=null,countdown=0,bannerTimer=0;
let spawnClock=0,portalClock=0,powerClock=0,powerIndex=0,worldScroll=0,gameClock=0;
let roadRows=[],pausedBeforePanel=false,previousFocus=null;
const audio={ctx:null,music:null,old:null,muted:store.get(MUTE_KEY,'0')==='1',track:clamp(parseInt(store.get(TRACK_KEY,'0'))||0,0,1),started:false,fade:0};
const TRACKS=[{title:'BullBear Run',src:'assets/bullbear_run_music.mp3'},{title:'BullBear to the Moon',src:'assets/bullbear_to_the_moon.mp3'}];
let BEATS={};
BEATS={"0":[0.534,0.998,1.463,1.904,2.345,2.833,3.297,3.762,4.249,4.69,5.155,5.619,6.084,6.548,6.989,7.454,7.941,8.382,8.847,9.311,9.776,10.217,10.681,11.146,11.633,12.098,12.539,13.003,13.444,13.932,14.373,14.861,15.302,15.766,16.231,16.695,17.16,17.624,18.088,18.53,18.994,19.458,19.923,20.387,20.828,21.293,21.757,22.245,22.686,23.174,23.615,24.079,24.543,25.008,25.472,25.937,26.401,26.865,27.307,27.794,28.259,28.723,29.164,29.629,30.093,30.534,30.999,31.463,31.927,32.392,32.856,33.321,33.785,34.226,34.691,35.155,35.619,36.084,36.548,37.013,37.477,37.918,38.383,38.847,39.311,39.776,40.24,40.705,41.169,41.61,42.075,42.539,43.003,43.468,43.932,44.373,44.838,45.302,45.767,46.231,46.695,47.16,47.624,48.065,48.53,49.017,49.459,49.923,50.387,50.852,51.316,51.78,52.245,52.709,53.15,53.615,54.079,54.544,55.008,55.472,55.914,56.378,56.842,57.33,57.794,58.236,58.7,59.164,59.629,60.093,60.534,60.999,61.463,61.928,62.392,62.856,63.298,63.762,64.226,64.691,65.155,65.62,66.084,66.548,67.013,67.454,67.918,68.383,68.847,69.312,69.776,70.24,70.705,71.169,71.61,72.075,72.539,73.004,73.468,73.932,74.397,74.861,75.302,75.767,76.231,76.696,77.16,77.624,78.089,78.553,78.994,79.459,79.923,80.387,80.852,81.316,81.781,82.245,82.709,83.151,83.615,84.079,84.544,85.008,85.473,85.937,86.378,86.843,87.307,87.771,88.236,88.723,89.188,89.629,90.093,90.535,90.999,91.463,91.928,92.392,92.857,93.321,93.785,94.227,94.691,95.155,95.62,96.084,96.549,97.013,97.477,97.942,98.383,98.847,99.312,99.776,100.241,100.705,101.169,101.634,102.075,102.539,103.004,103.468,103.933,104.397,104.861,105.326,105.79,106.231,106.696,107.16,107.624,108.089,108.553,109.018,109.459,109.923,110.388,110.852,111.316,111.781,112.245,112.71,113.151,113.615,114.08,114.544,115.008,115.473,115.914,116.378,116.843,117.307,117.772,118.236,118.7,119.165,119.629,120.07,120.535,120.999,121.464,121.928,122.392,122.857,123.321,123.786,124.25,124.691,125.156,125.62,126.084,126.549,127.013,127.478,127.919,128.383,128.848,129.312,129.776,130.241,130.682,131.146,131.611,132.075,132.54,133.004,133.445,133.886,134.374,134.838,135.303,135.767,136.231,136.696,137.16,137.625,138.089,138.553,139.018,139.459,139.923,140.388,140.852,141.317,141.781,142.245,142.687,143.151,143.615,144.103,144.544,145.009,145.473,145.914,146.402,146.866,147.307,147.772,148.213,148.701,149.165,149.629,150.094,150.558,150.976,151.464,151.928,152.393,152.834,153.321,153.786,154.227,154.691,155.179,155.643,156.108,156.572,157.013,157.478,157.942,158.383,158.848,159.312,159.777,160.241,160.705,161.17,161.611,162.075,162.54,163.004,163.468,163.933,164.397,164.862,165.303,165.767,166.232,166.696,167.16,167.625,168.089,168.554,169.018,169.459,169.924,170.388,170.852,171.317,171.781,172.222,172.71,173.128,173.616,174.08,174.544,174.986,175.45,175.938,176.379,176.843,177.308,177.772,178.236,178.678,179.142,179.63,180.094,180.535,181.0,181.464,181.928,182.393,182.834,183.322,183.786,184.227,184.715,185.179,185.644,186.108,186.572,187.014,187.478,187.942,188.383,188.848,189.312,189.777,190.241,190.682,191.17,191.634,192.075,192.563,193.004,193.469,193.933,194.374,194.839,195.303,195.767,196.232,196.696,197.161,197.625,198.066,198.531,199.018,199.459,199.947,200.388,200.853,201.34,201.805,202.269,202.71,203.151,203.616,204.08,204.545,205.009,205.473,205.938,206.379,206.843,207.308,207.772,208.237,208.701,209.165,209.63,210.071,210.535,211.0,211.464,211.929,212.393,212.857,213.322,213.786,214.227,214.692,215.156,215.62,216.085,216.549,217.014,217.478,217.942,218.384,218.848,219.312,219.777,220.241,220.682,221.147,221.634,222.076,222.54,223.004,223.469,223.933,224.421,224.862,225.303,225.768,226.232,226.696,227.161,227.625,228.066,228.531,229.018,229.46,229.924,230.388,230.853,231.317,231.782,232.246,232.687],"1":[0.418,0.813,1.207,1.602,1.974,2.345,2.717,3.111,3.483,3.878,4.272,4.667,5.039,5.433,5.805,6.177,6.571,6.943,7.361,7.732,8.104,8.475,8.893,9.265,9.66,10.031,10.426,10.82,11.192,11.564,11.958,12.353,12.725,13.096,13.514,13.886,14.257,14.652,15.047,15.418,15.813,16.184,16.579,16.974,17.345,17.717,18.135,18.506,18.901,19.273,19.667,20.062,20.434,20.805,21.2,21.571,21.966,22.338,22.732,23.104,23.499,23.87,24.288,24.66,25.031,25.426,25.821,26.192,26.564,26.958,27.353,27.725,28.119,28.491,28.886,29.28,29.652,30.023,30.395,30.79,31.184,31.579,31.974,32.369,32.74,33.112,33.506,33.878,34.273,34.644,35.039,35.434,35.805,36.177,36.548,36.943,37.361,37.732,38.127,38.522,38.893,39.265,39.66,40.031,40.426,40.797,41.192,41.587,41.958,42.33,42.725,43.096,43.491,43.886,44.28,44.652,45.047,45.418,45.813,46.184,46.579,46.951,47.345,47.74,48.112,48.483,48.878,49.25,49.667,50.039,50.434,50.805,51.2,51.572,51.966,52.338,52.733,53.104,53.499,53.894,54.265,54.66,55.055,55.403,55.821,56.192,56.587,56.982,57.353,57.725,58.12,58.491,58.886,59.257,59.652,60.047,60.418,60.813,61.208,61.579,61.974,62.346,62.74,63.112,63.507,63.878,64.273,64.668,65.039,65.411,65.805,66.2,66.572,66.966,67.361,67.733,68.127,68.499,68.894,69.288,69.66,70.031,70.426,70.821,71.192,71.564,71.959,72.353,72.725,73.12,73.514,73.886,74.281,74.652,75.047,75.442,75.813,76.185,76.579,76.974,77.346,77.717,78.112,78.507,78.878,79.273,79.644,80.039,80.434,80.805,81.2,81.595,81.966,82.338,82.733,83.127,83.499,83.87,84.265,84.66,85.031,85.426,85.821,86.192,86.587,86.959,87.353,87.748,88.12,88.491,88.886,89.281,89.652,90.024,90.442,90.813,91.185,91.58,91.974,92.346,92.717,93.112,93.507,93.901,94.273,94.645,95.039,95.434,95.829,96.177,96.549,96.943,97.338,97.733,98.128,98.499,98.894,99.265,99.66,100.032,100.426,100.798,101.193,101.587,101.982,102.33,102.748,103.12,103.515,103.886,104.281,104.652,105.047,105.419,105.813,106.208,106.58,106.974,107.369,107.741,108.112,108.484,108.878,109.273,109.645,110.039,110.434,110.806,111.2,111.572,111.967,112.361,112.733,113.104,113.499,113.894,114.289,114.66,115.055,115.426,115.798,116.193,116.587,116.959,117.33,117.725,118.097,118.515,118.886,119.258,119.652,120.024,120.419,120.813,121.185,121.58,121.951,122.346,122.717,123.089,123.484,123.878,124.25,124.645,125.016,125.411,125.782,126.177,126.572,126.967,127.315,127.71,128.104,128.499,128.894,129.242,129.66,130.032,130.426,130.798,131.193,131.587,131.982,132.354,132.725,133.12,133.515,133.886,134.281,134.653,135.047,135.419,135.814,136.185,136.58,136.975,137.346,137.718,138.112,138.507,138.879,139.273,139.668,140.04,140.434,140.806,141.201,141.595,141.967,142.338,142.733,143.128,143.523,143.894,144.289,144.66,145.055,145.427,145.821,146.193,146.588,146.959,147.354,147.749,148.12,148.492,148.886,149.281,149.653,150.024,150.419,150.814,151.208,151.58,151.975,152.346,152.741,153.112,153.507,153.902,154.297,154.645,155.04,155.434,155.829,156.201,156.595,156.967,157.338,157.733,158.128,158.499,158.894,159.266,159.66,160.055,160.427,160.798,161.193,161.588,161.959,162.354,162.749,163.12,163.492,163.886,164.281,164.653,165.047,165.419,165.814,166.208,166.603,166.998,167.369,167.741,168.112,168.484,168.879,169.273,169.645,170.017,170.434,170.806,171.201,171.572,171.967,172.362,172.733,173.105,173.523,173.894,174.266,174.637,175.032,175.427,175.798,176.193,176.588,176.982,177.354,177.726,178.12,178.492,178.887,179.258]};
function safeAudio(){
  if(!audio.ctx){const AC=window.AudioContext||window.webkitAudioContext;if(AC)audio.ctx=new AC();}
  if(audio.ctx?.state==='suspended')audio.ctx.resume().catch(()=>{});
}
function playMusic(){
  if(audio.muted||document.hidden)return;
  if(!audio.music){audio.music=new Audio(TRACKS[audio.track].src);audio.music.loop=true;audio.music.preload='auto';audio.music.volume=.42;}
  audio.music.play().then(()=>{audio.started=true;}).catch(()=>{});
}
function tone(f=660,d=.13,type='sine',to){
  if(audio.muted||!audio.ctx)return;
  const a=audio.ctx,o=a.createOscillator(),g=a.createGain(),t=a.currentTime;
  o.type=type;o.frequency.setValueAtTime(f,t);if(to)o.frequency.exponentialRampToValueAtTime(to,t+d);
  g.gain.setValueAtTime(.055,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+d+.01);
}
function selectTrack(i){
  if(i===audio.track){musicMenu(false);return;}
  audio.track=i;store.set(TRACK_KEY,String(i));updateAudioUI();musicMenu(false);
  const prev=audio.music;if(audio.old){audio.old.pause();audio.old=null;}
  const next=new Audio(TRACKS[i].src);next.loop=true;next.preload='auto';next.volume=0;audio.music=next;
  if(!audio.muted){next.play().catch(()=>{});audio.old=prev;audio.fade=.7;}else{if(prev)prev.pause();next.volume=.42;}
}
function mute(){
  safeAudio();audio.muted=!audio.muted;store.set(MUTE_KEY,audio.muted?'1':'0');
  if(audio.muted){audio.music?.pause();audio.old?.pause();audio.old=null;audio.fade=0;}else playMusic();updateAudioUI();
}
function updateAudioUI(){
  $('sound-btn').textContent=audio.muted?'🔇':'🔊';$('sound-btn').setAttribute('aria-pressed',String(audio.muted));
  document.querySelectorAll('.track-btn').forEach(b=>{const on=Number(b.dataset.track)===audio.track;b.classList.toggle('selected',on);b.setAttribute('aria-selected',String(on));});
}
function musicMenu(on){$('music-menu').classList.toggle('open',on);$('music-btn').setAttribute('aria-expanded',String(on));}
function audioTick(dt){
  if(audio.fade>0){audio.fade=Math.max(0,audio.fade-dt);const t=ease(1-audio.fade/.7);if(audio.old)audio.old.volume=.42*(1-t);if(audio.music)audio.music.volume=.42*t;if(!audio.fade&&audio.old){audio.old.pause();audio.old=null;}}
  // The note follows detected beats; glows never follow the beat or flash.
  let target=0;
  if(audio.music&&!audio.music.paused&&!audio.muted){const beats=BEATS[audio.track]||[],t=audio.music.currentTime;let lo=0,hi=beats.length-1,ix=-1;while(lo<=hi){let m=(lo+hi)>>1;if(beats[m]<=t){ix=m;lo=m+1;}else hi=m-1;}if(ix>=0)target=Math.exp(-(t-beats[ix])/.18);}
  audio.note=(audio.note||0)+(target-(audio.note||0))*Math.min(1,dt*16);
  $('music-note').style.transform=`scale(${(1+.23*audio.note).toFixed(3)})`;
}
function reset(){
  s={score:0,coins:0,distance:0,level:1,combo:0,maxCombo:0,comboLeft:0,powerups:0,nearMisses:0,zapped:0,warps:0};
  p={lane:0,target:0,from:0,laneT:1,jump:0,vy:0,slide:0,effects:{magnet:0,boost:0,double_coins:0,shield:0,zap:0},charges:0};
  objects=[];floats=[];particles=[];bolts=[];warp=null;worldScroll=37;gameClock=0;sceneClock=0;spawnClock=-1.8;powerClock=0;portalClock=0;powerIndex=0;bannerTimer=0;
}
function add(type,lane,z,extra={}){const o={id:++id,type,lane,z,done:false,near:false,...extra};objects.push(o);return o;}
function isObstacle(o){return o.type==='low_barrier'||o.type==='overhead'||o.type==='blocker';}
function proj(z,lane=0){const r=140/(140+Math.max(-5,z));return{x:200+lane*90*r,y:230+469*r,r};}
function textFloat(text,x=200,y=480,color='#ffd56a'){for(const f of floats)if(f.life>.35&&Math.abs(f.x-x)<130&&Math.abs(f.y-y)<28)f.y=y-29;floats.push({text,x:clamp(x,62,338),y,life:1.65,max:1.65,color});if(floats.length>18)floats.shift();}
function chain(){s.combo=s.comboLeft>0?s.combo+1:1;s.comboLeft=COMBO_MS;s.maxCombo=Math.max(s.maxCombo,s.combo);if(s.combo===5||s.combo===10||s.combo===20)textFloat(`x${s.combo} ${s.combo>=20?'LEGENDARY':s.combo>=10?'SICK':'NICE'}`,200,445,'#ff8ee0');}
function mult(){return Math.min(5,1+Math.floor(s.combo/5));}
function grant(type){
  s.powerups++;p.effects[type]=type==='zap'?ZAP_MS:POWER_MS;if(type==='zap')p.charges=3;
  textFloat(type==='double_coins'?'COINS x2':type==='zap'?'BEAR ZAP x3':type.toUpperCase(),200,475,colors[type]);tone(type==='zap'?920:784,.25,'sine',1120);
}
function levelCheck(){const lev=Math.floor(s.distance/500)+1;if(lev>s.level){s.level=lev;banner(`LEVEL ${lev}`,'ROAD SPEED UP');tone(523,.25,'triangle',1046);}}
function lane(dir){
  if(mode!=='playing'||paused||warp)return;
  const next=clamp(p.target+dir,-1,1);if(next===p.target)return;
  const win=Math.max(150,roadSpeed()*.45);for(const o of objects)if(isObstacle(o)&&!o.done&&!o.passed&&o.lane===p.target&&o.z>=32&&o.z<win)o.near=true;
  p.from=p.lane;p.target=next;p.laneT=0;tone(250,.07,'sine',400);
}
function jump(){if(mode!=='playing'||paused||warp||p.jump>0||p.slide>0)return;p.vy=1000;p.jump=.01;tone(360,.15,'triangle',640);}
function slide(){if(mode!=='playing'||paused||warp||p.jump>0||p.slide>0)return;p.slide=450;tone(440,.15,'sine',180);}
function fireZap(){
  if(mode!=='playing'||paused||warp||p.effects.zap<=0||p.charges<=0)return false;
  const target=objects.filter(o=>isObstacle(o)&&!o.done&&!o.passed&&!o.locked&&o.z>45&&o.z<480&&Math.abs(o.lane-p.target)<.25).sort((a,b)=>a.z-b.z)[0];
  if(!target)return false;
  target.locked=true;p.charges--;if(!p.charges)p.effects.zap=0;
  const q=proj(target.z,target.lane);bolts.push({x0:proj(PLAYER_Z,p.lane).x,y0:560,x1:q.x,y1:q.y-35*q.r,life:.55,max:.55,seed:target.id,target});
  s.zapped++;chain();s.score+=15*mult();textFloat('+15 ZAPPED',q.x,q.y-80*q.r,'#a7edff');tone(1000,.3,'sawtooth',180);return true;
}
// Light speed warp: world accelerates into the portal, one soft bloom at the jump, drop out at speed. Total WARP_T seconds.
const WARP_J=.4,WARP_T=.9,STREAKS=[];
for(let i=0;i<72;i++)STREAKS.push({a:i*2.39996+((i*7919)%13)*.05,o:((i*0.618034)%1),v:.9+((i*37)%11)/11*.8,w:.7+((i*53)%7)/7*1.4,c:i%5===0?'153,69,255':i%5===2?'20,241,149':'235,245,255'});
function warpRush(u){return u<WARP_J?ease(u/WARP_J):1-ease((u-WARP_J)/(WARP_T-WARP_J));}
function beginWarp(o){
  o.done=true;s.warps++;s.powerups++;chain();const q=proj(o.z,o.lane);
  const radius=94*q.r;warp={time:0,applied:false,x:q.x,y:q.y-radius*.9,scale:radius/35.28,exitX:proj(PLAYER_Z,p.target).x};
  textFloat('+225m',200,430,'#ffe17d');tone(523,.5,'sine',1046);
}
function updateWarp(dt){
  warp.time+=dt;
  worldScroll+=dt*roadSpeed()*(1+5*warpRush(warp.time));
  if(warp.time>=WARP_J&&!warp.applied){warp.applied=true;s.distance+=225;s.score+=22.5;worldScroll+=750;objects=[];spawnClock=-.6;sceneClock=(Math.floor(sceneClock/17000)+1)*17000;levelCheck();}
  if(warp.time>=WARP_T){warp=null;p.effects.shield=Math.max(p.effects.shield,1200);textFloat('BACK ON THE ROAD',200,450,'#ffe17d');}
}
function banner(main,sub=''){const el=$('zone-banner');el.innerHTML=main+(sub?`<small>${sub}</small>`:'');el.classList.add('show');bannerTimer=2200;}
function spawn(){
  // Fair rows: at least one lane is always entirely clear. Nothing stacked on a portal.
  const lanes=[-1,0,1],type=s.level>=3?['low_barrier','overhead','blocker']:['low_barrier','overhead'];
  const a=lanes[Math.floor(Math.random()*3)],t=type[Math.floor(Math.random()*type.length)];
  add(t,a,900);
  let occupied=[a];
  if(s.level>=2&&Math.random()<.25){let b=lanes.filter(l=>l!==a)[Math.floor(Math.random()*2)];add(s.level>=5?'blocker':'low_barrier',b,900);occupied.push(b);}
  const clear=lanes.filter(l=>!occupied.includes(l)),coinLane=clear[Math.floor(Math.random()*clear.length)];
  if(Math.random()<.86)for(let i=0;i<4;i++)add('coin',coinLane,925+i*58);
  const canPortal=portalClock>22&&s.distance>900&&Math.random()<.14;
  if(canPortal){objects=objects.filter(o=>!isObstacle(o)||o.z<820);add('portal',coinLane,1150);portalClock=0;}
  else if(powerClock>7&&Math.random()<.38){const choices=['magnet','shield','boost','double_coins','zap'];const which=choices[powerIndex++%choices.length];add(which,coinLane,1175);powerClock=0;}
}
function roadSpeed(){return Math.min(900,300+(s.level-1)*30)*(p.effects.boost>0?1.25:1);}
function update(dt){
  gameClock+=dt*1000;sceneClock+=dt*1000;spawnClock+=dt;powerClock+=dt;portalClock+=dt;
  if(s.comboLeft>0){s.comboLeft=Math.max(0,s.comboLeft-dt*1000);if(!s.comboLeft)s.combo=0;}
  for(const k in p.effects)p.effects[k]=Math.max(0,p.effects[k]-dt*1000);
  if(warp){updateWarp(dt);tickFX(dt);return;}
  p.laneT=Math.min(1,p.laneT+dt*4.8);p.lane=p.from+(p.target-p.from)*ease(p.laneT);
  if(p.jump>0||p.vy>0){p.vy-=3400*dt;p.jump+=p.vy*dt;if(p.jump<0){p.jump=0;p.vy=0;}}
  p.slide=Math.max(0,p.slide-dt*1000);
  const speed=roadSpeed(),dz=speed*dt;
  s.distance+=dz*.3;s.score+=dz*.03;worldScroll+=dz;levelCheck();
  const interval=Math.max(.45,1.4-(s.level-1)*.07);
  if(spawnClock>=interval){spawnClock=0;spawn();}
  const prevLane=p.lane;
  for(const o of objects){
    if(o.done)continue;const oldZ=o.z;o.z-=dz;
    const close=Math.abs(p.lane-o.lane)<.48;
    if(o.type==='coin'){
      const magnet=p.effects.magnet>0&&Math.hypot((p.lane-o.lane)*90,o.z-PLAYER_Z)<150;
      if((o.z<60&&oldZ>0&&close)||magnet){o.done=true;chain();let n=p.effects.double_coins>0?2:1;s.coins+=n;s.score+=n*mult();tone(780+Math.min(s.combo,20)*18,.08);spark(proj(o.z,o.lane).x,proj(o.z,o.lane).y-25,'#ffd56a',5);}
    }else if(isObstacle(o)){
      if(o.passed||o.locked)continue;
      if(o.z<=PLAYER_Z+12&&oldZ>PLAYER_Z-12&&close){
        const safe=(o.type==='low_barrier'&&p.jump>34)||(o.type==='overhead'&&p.slide>0);
        if(safe){o.passed=true;chain();s.score+=3*mult();textFloat(o.type==='low_barrier'?'CLEAN JUMP':'CLEAN SLIDE',200,475,'#9cefff');}
        else if(p.effects.shield>0){p.effects.shield=0;o.done=true;const q=proj(o.z,o.lane);shatter(q.x,q.y-40*q.r,'#7ad8ff');textFloat('SHIELD BLOCKED',200,475,'#7ad8ff');tone(220,.2,'sine',680);}
        else{gameOver();break;}
      }else if(o.z<PLAYER_Z-15&&oldZ>=PLAYER_Z-15){o.passed=true;if(o.near&&Math.abs(p.lane-o.lane)>.48){s.nearMisses++;chain();s.score+=10*mult();textFloat('+10 NEAR MISS',200,470,'#ffe27a');tone(660,.18,'triangle',990);}}
    }else if(o.z<=PLAYER_Z+16&&oldZ>PLAYER_Z-16&&close){if(o.type==='portal')beginWarp(o);else{o.done=true;grant(o.type);}}
  }
  objects=objects.filter(o=>!o.done&&o.z>-30);
  // Bear Zap: automatically protect the runner's lane, like Bounce's next-threat zap.
  const urgent=objects.some(o=>isObstacle(o)&&!o.done&&!o.passed&&!o.locked&&Math.abs(o.lane-p.target)<.25&&o.z<220&&o.z>70);
  if(urgent&&p.effects.zap>0&&p.charges>0)fireZap();
  tickFX(dt);
}
function spark(x,y,color,n=8){for(let i=0;i<n;i++){const a=Math.PI*2*i/n;particles.push({x,y,vx:Math.cos(a)*32,vy:Math.sin(a)*24-12,life:.6,max:.6,color,r:1.6});}if(particles.length>80)particles.splice(0,particles.length-80);}
function shatter(x,y,color){for(let i=0;i<14;i++){const a=Math.PI*2*i/14+Math.random()*.3,v=50+Math.random()*60;particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-30,life:.7,max:.7,color:i%3?color:'#a7edff',r:1.4+Math.random()*1.8});}if(particles.length>90)particles.splice(0,particles.length-90);}
function tickFX(dt){
  for(const f of floats){f.life-=dt;f.y-=18*dt;}floats=floats.filter(f=>f.life>0);
  for(const z of bolts){z.life-=dt;if(z.target&&z.life<z.max*.5){const o=z.target,q=proj(o.z,o.lane);z.x1=q.x;z.y1=q.y-35*q.r;if(!o.done){o.done=true;shatter(q.x,q.y-35*q.r,o.type==='overhead'?'#ff9a2e':'#ff4a4a');}}}bolts=bolts.filter(z=>z.life>0);
  for(const a of particles){a.life-=dt;a.x+=a.vx*dt;a.y+=a.vy*dt;}particles=particles.filter(a=>a.life>0);
}
// ------------ renderer ------------
const cache={bg:new Map(),spr:{},frames:[],vignette:null,dpr:0};
function stepScale(src,sx,sy,sw,sh,tw,th){
  // Halving steps keep the approved art crisp when it is drawn small; output is the same art, just pre-sized.
  let cur=src,cx=sx,cy=sy,cw=sw,ch=sh;
  while(cw/2>tw*1.02&&ch/2>th*1.02){const c=document.createElement('canvas');c.width=Math.ceil(cw/2);c.height=Math.ceil(ch/2);const g=c.getContext('2d');g.imageSmoothingQuality='high';g.drawImage(cur,cx,cy,cw,ch,0,0,c.width,c.height);cur=c;cx=0;cy=0;cw=c.width;ch=c.height;}
  const out=document.createElement('canvas');out.width=Math.max(1,Math.round(tw));out.height=Math.max(1,Math.round(th));const g=out.getContext('2d');g.imageSmoothingQuality='high';g.drawImage(cur,cx,cy,cw,ch,0,0,out.width,out.height);return out;
}
function buildCaches(){
  if(cache.dpr===dpr)return;cache.dpr=dpr;cache.bg.clear();const k=1.3*dpr;
  const spec={coin:26,barrier:84,blocker:60,pu_magnet:44,pu_boost:44,pu_shield:44,pu_double_coins:44,pu_zap:44};
  for(const [key,w]of Object.entries(spec)){const c=crop[key];cache.spr[key]=stepScale(images[key],c.x,c.y,c.w,c.h,w*k,w*k*c.h/c.w);}
  cache.spr.beam=stepScale(images.beam,0,0,images.beam.width,images.beam.height,100*k,26*k);
  cache.spr.post=stepScale(images.post,0,0,images.post.width,images.post.height,9*k,109*k);
  cache.spr.light_beam=stepScale(images.light_beam,0,0,images.light_beam.width,images.light_beam.height,25*k,11*k);
  cache.spr.arrow_barrier=stepScale(images.arrow_barrier,0,0,images.arrow_barrier.width,images.arrow_barrier.height,22*k,21*k);
  for(const d of ['left','right','both'])cache.spr['arrow_blk_'+d]=stepScale(images['arrow_blk_'+d],0,0,images['arrow_blk_'+d].width,images['arrow_blk_'+d].height,36*k,23*k);
  cache.spr.soc=stepScale(images.soc,0,0,images.soc.width,images.soc.height,130*dpr,130*dpr);
  cache.frames=[];for(let f=0;f<8;f++)cache.frames[f]=stepScale(images.runner,(f%4)*384,Math.floor(f/4)*512,384,512,384*RUNNER_SCALE*dpr,512*RUNNER_SCALE*dpr);
  const v=document.createElement('canvas');v.width=W*dpr;v.height=H*dpr;const g=v.getContext('2d');g.scale(dpr,dpr);
  const vg=g.createRadialGradient(200,315,210,200,350,560);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.23)');g.fillStyle=vg;g.fillRect(0,0,W,H);
  cache.vignette=v;const fc=document.createElement('canvas');fc.width=80*dpr;fc.height=90*dpr;const fg=fc.getContext('2d');fg.scale(dpr,dpr);fg.translate(-160,-256);
  const fog=fg.createLinearGradient(0,258,0,345);fog.addColorStop(0,'rgba(42,26,58,.7)');fog.addColorStop(1,'rgba(42,26,58,0)');
  fg.beginPath();fg.moveTo(187,258);fg.lineTo(213,258);fg.lineTo(236,345);fg.lineTo(164,345);fg.closePath();fg.fillStyle=fog;fg.fill();cache.fog=fc;
}
function bgCanvas(i){
  let c=cache.bg.get(i);if(c)return c;const im=images['bg_'+backgrounds[i]];c=document.createElement('canvas');c.width=W*dpr;c.height=H*dpr;
  const g=c.getContext('2d'),r=Math.max(c.width/im.width,c.height/im.height),dw=im.width*r,dh=im.height*r;g.imageSmoothingQuality='high';g.drawImage(im,(c.width-dw)/2,(c.height-dh)/2,dw,dh);
  cache.bg.set(i,c);if(cache.bg.size>3)cache.bg.delete(cache.bg.keys().next().value);return c;
}
function cover(im,alpha=1){const r=Math.max(W/im.width,H/im.height),dw=im.width*r,dh=im.height*r;ctx.globalAlpha=alpha;ctx.drawImage(im,(W-dw)/2,(H-dh)/2,dw,dh);ctx.globalAlpha=1;}
function drawBg(){
  const t=sceneClock/1000,ix=Math.floor(t/17)%7,blend=ease((t%17-15)/2);
  ctx.drawImage(bgCanvas(ix),0,0,W,H);if(t%17>13)bgCanvas((ix+1)%7);if(blend>0){ctx.globalAlpha=blend;ctx.drawImage(bgCanvas((ix+1)%7),0,0,W,H);ctx.globalAlpha=1;}
}
function makeRoad(){
  roadRows=[];const tw=images.road.width,half=140*tw/528;
  for(let y=259;y<700;y+=2){const r=(y-230)/469,z=140/r-140;roadRows.push({y,r,z,x:200-half*r,w:2*half*r});}
}
function drawRoad(){
  const im=images.road,h=im.height,w=im.width;
  // Two-logical-pixel strips: static projection, no per-frame pixel reads or offscreen allocations.
  for(const row of roadRows){const sy=((row.z+worldScroll)*h/100)%h;ctx.drawImage(im,0,Math.floor(sy),w,1,row.x,row.y,row.w,2.1);}
  ctx.drawImage(cache.fog,160,256,80,90);
}
function glow(x,y,r,color,opacity=.25){
  const b=.5+.5*Math.sin(wall*Math.PI*2/7000);const g=ctx.createRadialGradient(x,y,r*.1,x,y,r*(1+.035*b));
  g.addColorStop(0,color+Math.round((opacity+.07*b)*255).toString(16).padStart(2,'0'));g.addColorStop(1,color+'00');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r*1.04,0,Math.PI*2);ctx.fill();
}
function arrowPulse(){return .5+.5*Math.sin(wall*Math.PI*2/2500);}
function drawArrowGlow(img,dx,dy,dw,dh,rgb,k=1){
  if(!img||dw<1.5||dh<1.5)return;
  const p=arrowPulse(),s=Math.min(dw,dh);
  ctx.save();
  ctx.shadowColor=`rgba(${rgb},${Math.min(1,(.3+.5*p)*k).toFixed(3)})`;
  ctx.shadowBlur=Math.max(2,(4+10*p)*k*s/26);
  ctx.drawImage(img,dx,dy,dw,dh);
  ctx.shadowBlur=0;
  ctx.globalCompositeOperation='lighter';
  ctx.globalAlpha=Math.min(1,(.1+.3*p)*k);
  ctx.drawImage(img,dx,dy,dw,dh);
  ctx.restore();
}
function arrowOn(srcKey,arrowKey,dx,dy,dw,dh,rgb,box,k=1){
  const im=images[srcKey],c=crop[srcKey]||{x:0,y:0,w:im.width,h:im.height};
  const [x0,y0,x1,y1]=box;
  drawArrowGlow(cache.spr[arrowKey],dx+(x0-c.x)/c.w*dw,dy+(y0-c.y)/c.h*dh,(x1-x0)/c.w*dw,(y1-y0)/c.h*dh,rgb,k);
}
// Big block arrows point to the open lane: left lane points right, right lane points left, center points both ways unless a side lane is also blocked.
function blockDir(o){if(o.lane<-.5)return 'right';if(o.lane>.5)return 'left';let L=false,R=false;for(const q of objects)if(q!==o&&q.type==='blocker'&&!q.done&&Math.abs(q.z-o.z)<60){if(q.lane<-.5)L=true;else if(q.lane>.5)R=true;}return L&&!R?'right':R&&!L?'left':'both';}
function sprite(key,x,bottom,w,yoff=0){const im=cache.spr[key],h=w*im.height/im.width;ctx.drawImage(im,x-w/2,bottom-h-yoff,w,h);return h;}
function drawObject(o){
  if(o.z<0||o.z>1500)return;const {x,y,r}=proj(o.z,o.lane),b=.5+.5*Math.sin(wall*Math.PI*2/7000);
  if(o.type==='coin'){const w=26*r;glow(x,y-43*r,w*.9,'#ffd56a',.2);sprite('coin',x,y,w,30*r);}
  else if(o.type==='portal'){
    const radius=94*r;ctx.save();ctx.translate(x,y-radius*.9);ctx.scale(1,.90);drawPortal(0,0,radius/35.28,1,wall);ctx.restore();
    if(r>.3){ctx.save();ctx.font=`${Math.max(9,22*r)}px 'Lilita One',sans-serif`;ctx.textAlign='center';ctx.lineWidth=4*r;ctx.lineJoin='round';ctx.strokeStyle='#18082c';ctx.fillStyle='#ffe68c';ctx.strokeText('Solana Portal',x,y-radius*1.95);ctx.fillText('Solana Portal',x,y-radius*1.95);ctx.restore();}
  }else if(o.type==='overhead'){
    const bw=100*r,bh=26*r,top=y-116*r,pw=9*r;
    ctx.drawImage(cache.spr.post,x-bw/2+3*r,top+bh*.3,pw,109*r);ctx.drawImage(cache.spr.post,x+bw/2-12*r,top+bh*.3,pw,109*r);
    ctx.drawImage(cache.spr.beam,x-bw/2,top,bw,bh);
    arrowOn('beam','light_beam',x-bw/2,top,bw,bh,'255,36,36',[447,24,735,148],2.2);
  }else if(o.type==='low_barrier'){
    const w=84*r,h=sprite('barrier',x,y,w);
    arrowOn('barrier','arrow_barrier',x-w/2,y-h,w,h,'255,200,40',[157,157,278,270]);
  }else if(o.type==='blocker'){
    const w=60*r,h=sprite('blocker',x,y,w);
    arrowOn('blocker','arrow_blk_'+blockDir(o),x-w/2,y-h,w,h,'255,255,255',[30,280,316,460]);
  }
  else{const key='pu_'+o.type;glow(x,y-62*r,34*r,colors[o.type],.25);sprite(key,x,y,44*r,40*r);}
}
function drawRunner(){
  const q=proj(PLAYER_Z,p.lane);let x=q.x,foot=625-p.jump*.65,scale=RUNNER_SCALE,alpha=1;
  if(warp){const u=warp.time;
    // Pulled in: feet travel to the portal centre while he shrinks; dropped out: grows back from the exit centre.
    if(u<WARP_J){let t=ease(u/(WARP_J*.95));x=x+(warp.x-x)*t;foot=625+(warp.y+62*(1-t)*RUNNER_SCALE-625)*t;scale*=1-.92*t;alpha=1-.7*ease((u-WARP_J*.55)/(WARP_J*.45));}
    else{let t=ease((u-WARP_J-.03)/.36);x=warp.exitX;foot=555+70*t;scale*=.08+.92*t;alpha=ease((u-WARP_J)/.14);}}
  const k=scale/.4;
  ctx.save();ctx.fillStyle='rgba(0,0,0,.36)';ctx.beginPath();ctx.ellipse(q.x,625,34*k*(1-p.jump/300),7*k,0,0,Math.PI*2);ctx.fill();ctx.restore();
  const breathe=.5+.5*Math.sin(wall*Math.PI*2/7000);
  if(p.effects.shield>0){glow(x,foot-60*k,79*k,'#7ad8ff',.1);ctx.save();ctx.strokeStyle=`rgba(122,216,255,${.38+.16*breathe})`;ctx.lineWidth=1.6;ctx.beginPath();ctx.ellipse(x,foot-62*k,49*k*(1+.02*breathe),78*k*(1+.02*breathe),0,0,Math.PI*2);ctx.stroke();ctx.restore();}
  if(p.effects.magnet>0){ctx.save();ctx.strokeStyle=`rgba(255,127,224,${.18+.09*breathe})`;ctx.lineWidth=1.3;for(let i=0;i<2;i++){ctx.beginPath();ctx.ellipse(x,foot-38*k,(62+i*14)*k,(30+i*9)*k,0,0,Math.PI*2);ctx.stroke();}ctx.restore();}
  if(p.effects.boost>0)glow(x,foot-15*k,70*k,'#6dff9a',.13);
  ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,foot);
  // Knee-slide sprite if present (feet at the bottom of the image). Fallback squashes the run frame.
  if(p.slide>0&&images.runner_slide){
    // SLIDE_H is sized so head width and horn span match the run cycle at RUNNER_SCALE (not shrunk to clear the bar).
    const im=images.runner_slide,h=SLIDE_H*scale/RUNNER_SCALE,w=h*im.width/im.height;
    ctx.drawImage(im,-w/2,-h,w,h);
  }else{
    if(p.slide>0)ctx.scale(1.13,.52);
    const frame=order[Math.floor(gameClock/(p.effects.boost>0?80:100))%8];
    const fc=cache.frames[frame],fh=(p.jump>2||p.slide>0||warp)?350:512;ctx.drawImage(fc,0,0,fc.width,fc.height*fh/512,-192*scale,-362*scale,384*scale,fh*scale);
  }
  ctx.restore();
}
function drawPortal(x, y, scale, alpha, now) {
  if (alpha <= 0.01 || scale <= 0.01) return;
  const breathe = 0.5 + 0.5 * Math.sin(now * Math.PI * 2 / 7000);
  const s = scale * (0.97 + 0.03 * breathe);
  const spin = 0.55 + now * (Math.PI * 2 / 7000);
  const R = 42 * s;
  const rad = (v) => Math.max(0.01, v);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1, -1);
  ctx.globalAlpha = alpha;

  const glowR = rad(R * (1.82 + 0.1 * breathe));
  const gg = ctx.createRadialGradient(0, 0, rad(R * 0.45), 0, 0, glowR);
  gg.addColorStop(0, "rgba(255,213,106," + (0.18 + 0.07 * breathe).toFixed(3) + ")");
  gg.addColorStop(0.4, "rgba(92,225,255," + (0.08 + 0.03 * breathe).toFixed(3) + ")");
  gg.addColorStop(0.72, "rgba(170,80,255," + (0.07 + 0.03 * breathe).toFixed(3) + ")");
  gg.addColorStop(1, "rgba(255,213,106,0)");
  ctx.fillStyle = gg;
  ctx.beginPath();
  ctx.arc(0, 0, glowR, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, rad(R * 0.76), 0, Math.PI * 2);
  ctx.clip();
  const core = ctx.createRadialGradient(0, 0, 0, 0, 0, rad(R * 0.76));
  core.addColorStop(0, "rgba(24,8,44,0.86)");
  core.addColorStop(0.55, "rgba(52,16,86,0.64)");
  core.addColorStop(1, "rgba(12,8,28,0.28)");
  ctx.fillStyle = core;
  ctx.fillRect(-R, -R, R * 2, R * 2);
  ctx.rotate(spin);
  for (let i = 0; i < 3; i++) {
    const off = i * Math.PI * 2 / 3;
    ctx.strokeStyle = i % 2 === 0 ? "rgba(92,225,255,0.78)" : "rgba(196,110,255,0.76)";
    ctx.lineWidth = 6.8;
    ctx.lineCap = "round";
    ctx.beginPath();
    for (let u = 0; u <= 1; u += 0.02) {
      const ang = off + u * Math.PI * 1.2;
      const rad = 7 + u * R * 0.66;
      const px = Math.cos(ang) * rad;
      const py = Math.sin(ang) * rad;
      if (u === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  for (let i = 0; i < 3; i++) {
    const off = i * Math.PI * 2 / 3 + 0.55;
    ctx.strokeStyle = i % 2 === 0 ? "rgba(196,110,255,0.5)" : "rgba(92,225,255,0.5)";
    ctx.lineWidth = 3.3;
    ctx.lineCap = "round";
    ctx.beginPath();
    for (let u = 0; u <= 1; u += 0.02) {
      const ang = off + u * Math.PI * 1.15;
      const rad = 10 + u * R * 0.58;
      const px = Math.cos(ang) * rad;
      const py = Math.sin(ang) * rad;
      if (u === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  ctx.restore();

  ctx.shadowColor = "rgba(255,213,106,0.92)";
  ctx.shadowBlur = 13 + 6 * breathe;
  ctx.strokeStyle = "#c9922e";
  const ringR = rad(R * 0.84);
  const ringW = Math.min(8, Math.max(1.2, ringR * 0.22));
  ctx.lineWidth = ringW;
  ctx.beginPath();
  ctx.arc(0, 0, ringR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "#ffd56a";
  ctx.lineWidth = Math.max(1, ringW * 0.65);
  ctx.beginPath();
  ctx.arc(0, 0, ringR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,245,210,0.9)";
  ctx.lineWidth = Math.max(0.8, ringW * 0.2);
  ctx.beginPath();
  ctx.arc(0, 0, rad(ringR + Math.min(2.1, ringR * 0.15)), 0, Math.PI * 2);
  ctx.stroke();
  const innerR = ringR - Math.min(3.4, ringR * 0.28);
  if (innerR > 0.5) {
    ctx.strokeStyle = "rgba(150,100,28,0.55)";
    ctx.lineWidth = Math.max(0.8, ringW * 0.18);
    ctx.beginPath();
    ctx.arc(0, 0, innerR, 0, Math.PI * 2);
    ctx.stroke();
  }

  // SoC coin: large, fully opaque, in front of the swirl.
  // Un-flip Y so the artwork stays upright, then apply Bounce's gentle turn.
  if (images.soc) {
    ctx.save();
    ctx.scale(1, -1);
    ctx.rotate(-spin * 0.32);
    ctx.globalAlpha = alpha; // fully opaque coin
    const em = R * 1.10;
    ctx.drawImage(images.soc, -em / 2, -em / 2, em, em);
    ctx.restore();
  }

  for (let i = 0; i < 8; i++) {
    const a = spin * 0.55 + i * Math.PI * 2 / 8;
    const rr = R * (1.04 + 0.08 * Math.sin(now * 0.0022 + i * 1.3));
    ctx.fillStyle = i % 2 ? "rgba(92,225,255,0.34)" : "rgba(255,213,106,0.4)";
    ctx.beginPath();
    ctx.arc(Math.cos(a) * rr, Math.sin(a) * rr, 1.7, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  return { R, breathe, spin, glowR, ringR, ringW };
}


function drawFX(){
  for(const z of bolts){if(z.target&&!z.target.done){const q=proj(z.target.z,z.target.lane);z.x1=q.x;z.y1=q.y-35*q.r;}let t=1-z.life/z.max,endX=z.x0+(z.x1-z.x0)*ease(t*2),endY=z.y0+(z.y1-z.y0)*ease(t*2);ctx.save();ctx.globalAlpha=Math.sin(Math.PI*t);ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(z.x0,z.y0);for(let i=1;i<7;i++){let u=i/7,jitter=Math.sin(z.seed*17+i*13)*13;ctx.lineTo(z.x0+(endX-z.x0)*u+jitter,z.y0+(endY-z.y0)*u);}ctx.lineTo(endX,endY);ctx.strokeStyle='#ffd56a';ctx.lineWidth=4;ctx.stroke();ctx.strokeStyle='#8ee4ff';ctx.lineWidth=2;ctx.stroke();ctx.strokeStyle='#fff';ctx.lineWidth=.7;ctx.stroke();ctx.restore();}
  for(const a of particles){ctx.globalAlpha=a.life/a.max;ctx.fillStyle=a.color;ctx.beginPath();ctx.arc(a.x,a.y,a.r,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;
  for(const f of floats){ctx.save();ctx.globalAlpha=Math.min(1,f.life/.4);ctx.font="800 17px 'Exo 2',sans-serif";ctx.textAlign='center';ctx.lineJoin='round';ctx.lineWidth=5;ctx.strokeStyle='rgba(8,12,22,.9)';ctx.fillStyle=f.color;ctx.strokeText(f.text,f.x,f.y);ctx.fillText(f.text,f.x,f.y);ctx.restore();}
}
function drawWarpPortals(){
  const u=warp.time;
  if(u<WARP_J+.06){const a=1-ease((u-WARP_J+.12)/.18);ctx.save();ctx.translate(warp.x,warp.y);ctx.scale(1,.9);drawPortal(0,0,warp.scale*(1+.25*ease(u/WARP_J)),a,wall);ctx.restore();}
  if(u>WARP_J){const grow=ease((u-WARP_J)/.14),a=1-ease((u-WARP_T+.24)/.24);ctx.save();ctx.translate(warp.exitX,555);ctx.scale(1,.9);drawPortal(0,0,Math.max(.02,2*grow),a,wall);ctx.restore();}
}
function warpCentre(){const u=warp.time,t=ease((u-WARP_J+.04)/.12);return[warp.x+(warp.exitX-warp.x)*t,warp.y+(470-warp.y)*t];}
function warpZoom(){return 1+.13*warpRush(warp.time);}
function drawWarp(){
  // Hyperspace streaks radiating from the portal, plus one smooth bloom at the jump. No repeats, no strobe.
  const u=warp.time,rush=warpRush(u);if(rush<=.01)return;
  const [cx,cy]=warpCentre();
  ctx.save();
  const veil=ctx.createRadialGradient(cx,cy,20,cx,cy,460);
  veil.addColorStop(0,`rgba(20,8,40,${(.10*rush).toFixed(3)})`);veil.addColorStop(.6,`rgba(60,14,110,${(.28*rush).toFixed(3)})`);veil.addColorStop(1,`rgba(6,4,18,${(.55*rush).toFixed(3)})`);
  ctx.fillStyle=veil;ctx.fillRect(0,0,W,H);
  ctx.globalCompositeOperation='lighter';ctx.lineCap='round';
  const speed=.6+2.6*rush,R=520;
  for(const k of STREAKS){
    const d=(k.o+u*speed*k.v)%1;            // 0 at centre, 1 off screen
    const fade=Math.min(1,d*5)*Math.min(1,(1-d)*4)*rush;if(fade<.02)continue;
    const r0=12+R*d*d,len=(.1+.75*rush)*R*d*d+10,ca=Math.cos(k.a),sa=Math.sin(k.a),lw=k.w*(1+3.4*d);
    ctx.beginPath();ctx.moveTo(cx+ca*r0,cy+sa*r0);ctx.lineTo(cx+ca*(r0+len),cy+sa*(r0+len));
    ctx.strokeStyle=`rgba(${k.c},${(.22*fade).toFixed(3)})`;ctx.lineWidth=lw*3.2;ctx.stroke();
    ctx.strokeStyle=`rgba(${k.c},${(.95*fade).toFixed(3)})`;ctx.lineWidth=lw;ctx.stroke();
  }
  ctx.globalCompositeOperation='source-over';
  // Single bloom: quick smooth rise into the jump, softer fade out.
  const bloom=u<WARP_J?ease((u-WARP_J+.08)/.08):1-ease((u-WARP_J)/.26);
  if(bloom>.01){const g=ctx.createRadialGradient(cx,cy,0,cx,cy,520);
    g.addColorStop(0,`rgba(255,255,255,${(.92*bloom).toFixed(3)})`);g.addColorStop(.35,`rgba(225,210,255,${(.62*bloom).toFixed(3)})`);g.addColorStop(1,`rgba(150,120,255,${(.22*bloom).toFixed(3)})`);
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);}
  ctx.restore();
}
function render(){
  if(!ready)return;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
  if(warp){const [cx,cy]=warpCentre(),z=warpZoom();ctx.translate(cx,cy);ctx.scale(z,z);ctx.translate(-cx,-cy);}
  drawBg();drawRoad();
  const list=objects.filter(o=>!o.done),far=list.filter(o=>o.z>=PLAYER_Z).sort((a,b)=>b.z-a.z),near=list.filter(o=>o.z<PLAYER_Z).sort((a,b)=>b.z-a.z);
  for(const o of far)drawObject(o);
  if(warp)drawWarpPortals();
  if(mode==='playing'||mode==='countdown'||mode==='gameover')drawRunner();
  // Redraw a nearby overhead so the beam sits in front of a sliding runner and the gap stays visible.
  for(const o of far)if(o.type==='overhead'&&o.z<PLAYER_Z+80)drawObject(o);
  for(const o of near)drawObject(o);
  if(warp){ctx.setTransform(dpr,0,0,dpr,0,0);drawWarp();}
  drawFX();ctx.drawImage(cache.vignette,0,0,W,H);
}
function resize(){
  const el=$('stage'),scale=Math.min(innerWidth/400,innerHeight/700,460/400);
  // Exact portrait aspect ratio at every size: avoids stretched runner and wonky lanes.
  el.style.width=Math.round(W*scale)+'px';el.style.height=Math.round(H*scale)+'px';
  dpr=Math.min(2,devicePixelRatio||1);canvas.width=W*dpr;canvas.height=H*dpr;canvas.style.width='100%';canvas.style.height='100%';if(ready)buildCaches();render();
}
function updateHUD(){
  $('hud-score').textContent=Math.floor(s.score);$('hud-dist').innerHTML=`${Math.floor(s.distance)}m <span class="lvl">LVL ${s.level}</span>`;
  $('hud-best').querySelector('.val').textContent=best;$('hud-coins').querySelector('.val').textContent=s.coins;
  $('hud-coins').classList.toggle('dbl',p.effects.double_coins>0);
  const on=s.combo>=2;$('hud-combo').classList.toggle('hidden',!on);$('combo-bar').classList.toggle('show',on);
  if(on){$('hud-combo').textContent=`COMBO ${s.combo} · x${mult()}`;$('combo-fill').style.width=(s.comboLeft/COMBO_MS*100)+'%';}
  for(const [type,el]of Object.entries({magnet:'magnet',boost:'boost',double_coins:'double',shield:'shield',zap:'zap'})){
    const pill=$('pill-'+el),left=p.effects[type],active=left>0&&(type!=='zap'||p.charges>0);pill.classList.toggle('on',active);if(active)pill.querySelector('i').style.width=(left/(type==='zap'?ZAP_MS:POWER_MS)*100)+'%';
  }
  $('pill-zap').querySelector('.zt').textContent='ZAP x'+p.charges;
  $('swipe-hint').classList.toggle('show',mode==='playing'&&gameClock<6000);
}
function frame(now){
  const dt=clamp((now-lastFrame)/1000,0,.035);lastFrame=now;wall=now;
  if(ready&&!document.hidden){
    if(!paused&&!frozen){if(mode==='playing')update(dt);else if(mode==='countdown'){countdown-=dt;const n=Math.ceil(countdown);$('count-num').textContent=n>0?n:'GO';if(countdown<=-.4)startPlay();}else if(mode==='start'){sceneClock+=dt*1000;worldScroll+=dt*15;}}
    if(bannerTimer>0&&!paused){bannerTimer-=dt*1000;if(bannerTimer<=0)$('zone-banner').classList.remove('show');}
    audioTick(dt);uiClock+=dt;if(uiClock>.08){uiClock=0;updateHUD();}
    render();
  }
  requestAnimationFrame(frame);
}
// ------------ menus / local-only scores ------------
function hide(id,on=true){$(id).hidden=on;}
function setHero(kind){
  const wrap=$('char-wrap'),img=wrap.querySelector('img');
  if(kind==='fail'){img.src='assets/character_fail.webp';wrap.classList.remove('start-hero');wrap.classList.add('down');}
  else{img.src='assets/runner_goggles.webp';wrap.classList.add('start-hero');wrap.classList.remove('down');}
}
function startScreen(){
  mode='start';paused=false;frozen=false;reset();$('overlay').className='';$('hud').classList.remove('show');
  ['char-wrap','ov-title','ov-tag','btn-play','btn-how','start-actions','ov-controls'].forEach(id=>hide(id,false));
  ['go-title','go-score','go-sub','go-stats','go-actions','count-num'].forEach(id=>hide(id));
  $('go-stats').innerHTML='';$('btn-play').textContent='Play';$('btn-play').classList.remove('btn-again');$('new-best').classList.remove('show');setHero('start');
  $('ov-best').textContent=`BEST ${best}`;$('ov-best').classList.toggle('show',best>0);$('zone-banner').classList.remove('show');
}
function begin(){
  if(!ready||panelOpen())return;safeAudio();playMusic();reset();mode='countdown';countdown=2.1;paused=false;musicMenu(false);
  $('overlay').className='countdown';['char-wrap','ov-title','ov-tag','btn-play','btn-how','start-actions','ov-controls','go-title','go-score','go-sub','go-stats','go-actions'].forEach(id=>hide(id));
  $('ov-best').classList.remove('show');$('new-best').classList.remove('show');hide('count-num',false);$('count-num').textContent='3';$('hud').classList.add('show');tone(660,.15);updateHUD();
  // Readable first pickups and 3.2s warning to first obstacle, not an empty road.
  for(let i=0;i<5;i++)add('coin',0,700+i*60);
  add('low_barrier',-1,1050);add('overhead',1,1400);
}
function startPlay(){mode='playing';$('overlay').className='hidden';$('hud').classList.add('show');tone(523,.22,'triangle',784);}
function loadTop(){
  let list=[];try{list=JSON.parse(store.get(TOP_KEY,'[]'));}catch(_){}
  if(!Array.isArray(list))return[];return list.filter(r=>r&&Number.isFinite(r.score)&&r.score>=0&&Number.isFinite(r.distance)&&Number.isFinite(r.t)).sort((a,b)=>b.score-a.score||b.distance-a.distance).slice(0,10);
}
function gameOver(){
  if(mode!=='playing')return;mode='gameover';const score=Math.floor(s.score),isNew=score>best;
  if(isNew){best=score;store.set(BEST_KEY,String(best));}
  const entry={score,distance:Math.floor(s.distance),coins:s.coins,level:s.level,t:Date.now()};lastRun=entry.t;
  const top=loadTop();top.push(entry);top.sort((a,b)=>b.score-a.score||b.distance-a.distance);store.set(TOP_KEY,JSON.stringify(top.slice(0,10)));
  $('overlay').className='';$('hud').classList.remove('show');['ov-title','ov-tag','btn-how','start-actions','ov-controls','count-num'].forEach(id=>hide(id));
  ['char-wrap','go-title','go-score','go-sub','go-stats','go-actions','btn-play'].forEach(id=>hide(id,false));
  setHero('fail');$('go-score').textContent=score;$('go-sub').textContent=`${Math.floor(s.distance)}m · LEVEL ${s.level} · ${s.coins} COINS`;
  $('ov-best').classList.remove('show');$('new-best').classList.toggle('show',isNew);$('btn-play').textContent='Play Again';$('btn-play').classList.add('btn-again');
  $('go-stats').innerHTML=`<div class="stat-pill"><span class="lbl">BEST</span><span class="val">${best}</span></div><div class="stat-pill"><span class="lbl">POWER-UPS</span><span class="val">${s.powerups}</span></div><div class="stat-pill"><span class="lbl">MAX COMBO</span><span class="val">x${s.maxCombo}</span></div>`;
  floats=[];bolts=[];tone(400,.7,'sine',100);musicMenu(false);$('zone-banner').classList.remove('show');
}
function panelOpen(){return $('how-panel').classList.contains('open')||$('lb-panel').classList.contains('open');}
function openPanel(which){
  if(mode!=='start'&&mode!=='gameover')return;previousFocus=document.activeElement;
  if(which==='lb'){const list=loadTop();$('lb-list').innerHTML=list.length?list.map((r,i)=>`<li class="lb-row${r.t===lastRun?' me':''}"><span class="lb-rank">#${i+1}</span><span class="lb-score">${r.score}</span><span class="lb-dist">${r.distance}m</span><span class="lb-date">${new Date(r.t).toLocaleDateString(undefined,{month:'short',day:'numeric'})}</span></li>`).join(''):'<li class="lb-empty">No scores yet. Go run!</li>';}
  $(which+'-panel').classList.add('open');$(which+'-body').scrollTop=0;$(which+'-close').focus();musicMenu(false);
}
function closePanel(which){$(which+'-panel').classList.remove('open');previousFocus?.focus();}
function drawCard(g,score){
  // 1200x630 card from approved art only: NFT collection background, goggles runner, Solana coin.
  const bg=images['bg_'+backgrounds[Math.floor(sceneClock/17000)%7]]||images.bg_crystal_forest;
  const r=Math.max(1200/bg.width,630/bg.height);g.drawImage(bg,(1200-bg.width*r)/2,(630-bg.height*r)/2,bg.width*r,bg.height*r);
  let sh=g.createLinearGradient(0,0,1200,0);sh.addColorStop(0,'rgba(5,6,13,.86)');sh.addColorStop(.62,'rgba(5,6,13,.55)');sh.addColorStop(1,'rgba(5,6,13,.18)');g.fillStyle=sh;g.fillRect(0,0,1200,630);
  if(images.runner_goggles){const c=images.runner_goggles,h=520,w=h*c.width/c.height;g.save();g.shadowColor='rgba(255,213,106,.35)';g.shadowBlur=40;g.drawImage(c,930-w/2,624-h,w,h);g.restore();}
  g.textAlign='left';g.lineJoin='round';
  const title=(txt,x,y,size)=>{g.font=`${size}px 'Lilita One',sans-serif`;g.lineWidth=size*.12;g.strokeStyle='#080c16';g.strokeText(txt,x,y);const gr=g.createLinearGradient(0,y-size,0,y);gr.addColorStop(0,'#fff6d6');gr.addColorStop(.3,'#ffe7a3');gr.addColorStop(.62,'#ffd56a');gr.addColorStop(1,'#e0a020');g.fillStyle=gr;g.shadowColor='rgba(255,213,106,.4)';g.shadowBlur=24;g.fillText(txt,x,y);g.shadowBlur=0;};
  const label=(txt,x,y,size,color)=>{g.font=`800 ${size}px Orbitron,sans-serif`;g.lineWidth=5;g.strokeStyle='#080c16';g.strokeText(txt,x,y);g.fillStyle=color;g.fillText(txt,x,y);};
  title('BullBear Run',72,182,112);
  if(score){label('SCORE',78,272,24,'#9fe9ff');g.font="900 112px Orbitron,sans-serif";g.lineWidth=9;g.strokeStyle='#080c16';g.strokeText(String(score.score),72,392);g.fillStyle='#ffd56a';g.shadowColor='rgba(255,213,106,.45)';g.shadowBlur=22;g.fillText(String(score.score),72,392);g.shadowBlur=0;
    label(`${score.distance}m   ·   ${score.coins} COINS   ·   COMBO x${score.combo}`,78,452,24,'#f4f7ff');}
  else{label('DODGE, DASH AND STACK THE SOLANA',78,250,26,'#5ce1ff');if(images.coin){for(let i=0;i<5;i++)g.drawImage(images.coin,78+i*86,300,70,70);}
    label('3 LANES  ·  SOLANA PORTAL  ·  BEAR ZAP',78,440,22,'#f4f7ff');}
  label('REMASTERED BY GALACTIC GAME LABZ',78,560,18,'#ffd84a');
}
async function shareScore(){
  // Native share sheet with a score card, or a local PNG download. Never posts anything by itself.
  const text=`I scored ${Math.floor(s.score)} in BullBear Run. ${Math.floor(s.distance)}m and ${s.coins} Solana coins. Can you beat it?`;
  const c=document.createElement('canvas');c.width=1200;c.height=630;drawCard(c.getContext('2d'),{score:Math.floor(s.score),distance:Math.floor(s.distance),coins:s.coins,combo:s.maxCombo});
  const blob=await new Promise(r=>c.toBlob(r,'image/png'));if(!blob)return;
  const file=new File([blob],'BullBear-Run-score.png',{type:'image/png'});
  const url=location.protocol==='https:'?location.href.split(/[?#]/)[0]:undefined;
  if(navigator.share&&navigator.canShare?.({files:[file]})){try{await navigator.share({title:'BullBear Run',text,...(url?{url}:{}),files:[file]});return;}catch(e){if(e.name==='AbortError')return;}}
  const a=document.createElement('a'),href=URL.createObjectURL(blob);a.href=href;a.download=file.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(href),1500);
  $('btn-share').textContent='Saved';setTimeout(()=>$('btn-share').textContent='Share',1800);
}
// ------------ input ------------
$('btn-play').addEventListener('click',begin);$('btn-how').addEventListener('click',()=>openPanel('how'));
for(const id of ['btn-lb','btn-lb-start'])$(id).addEventListener('click',()=>openPanel('lb'));
for(const id of ['btn-home','btn-home-start'])$(id).addEventListener('click',()=>{location.href=HOME_URL;});
$('btn-share').addEventListener('click',shareScore);
for(const which of ['how','lb']){$(which+'-close').addEventListener('click',()=>closePanel(which));$(which+'-panel').addEventListener('click',e=>{if(e.target===$(which+'-panel'))closePanel(which);});}
$('music-btn').addEventListener('click',e=>{e.stopPropagation();safeAudio();musicMenu(!$('music-menu').classList.contains('open'));});
$('sound-btn').addEventListener('click',e=>{e.stopPropagation();mute();});
$('music-menu').addEventListener('click',e=>{e.stopPropagation();const b=e.target.closest('[data-track]');if(b){safeAudio();selectTrack(Number(b.dataset.track));}});
document.addEventListener('click',()=>musicMenu(false));
window.addEventListener('keydown',e=>{
  if(e.code==='Tab'&&panelOpen()){const panel=document.querySelector('.open[role="dialog"]'),f=[...panel.querySelectorAll('button,a[href]')];if(e.shiftKey&&document.activeElement===f[0]){e.preventDefault();f.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===f.at(-1)){e.preventDefault();f[0].focus();}return;}
  if(e.code==='Escape'){for(const which of ['how','lb'])if($(which+'-panel').classList.contains('open')){closePanel(which);return;}musicMenu(false);return;}
  if(panelOpen()||e.repeat)return;
  if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space','KeyA','KeyD','KeyW','KeyS','Enter'].includes(e.code))e.preventDefault();
  if((e.code==='Enter'||e.code==='Space')&&(mode==='start'||mode==='gameover')){begin();return;}
  if(e.code==='ArrowLeft'||e.code==='KeyA')lane(-1);if(e.code==='ArrowRight'||e.code==='KeyD')lane(1);
  if(e.code==='ArrowUp'||e.code==='KeyW'||e.code==='Space')jump();if(e.code==='ArrowDown'||e.code==='KeyS')slide();if(e.code==='KeyZ')fireZap();
});
let pointer=null;
canvas.addEventListener('pointerdown',e=>{if(mode!=='playing')return;e.preventDefault();pointer={x:e.clientX,y:e.clientY,done:false};canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointermove',e=>{if(!pointer||pointer.done)return;const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;if(Math.hypot(dx,dy)<22)return;pointer.done=true;if(Math.abs(dx)>Math.abs(dy))lane(dx>0?1:-1);else if(dy<0)jump();else slide();});
canvas.addEventListener('pointerup',e=>{if(pointer&&!pointer.done)fireZap();pointer=null;});canvas.addEventListener('pointercancel',()=>pointer=null);
document.addEventListener('visibilitychange',()=>{if(document.hidden){paused=true;audio.music?.pause();}else{paused=false;lastFrame=performance.now();if(audio.started)playMusic();}});
window.addEventListener('resize',resize);
function load(key,path){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{images[key]=im;resolve();};im.onerror=()=>reject(new Error('Asset failed: '+path));im.src=path;});}
function trimBounds(key){const im=images[key],c=document.createElement('canvas');c.width=im.width;c.height=im.height;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(im,0,0);const d=g.getImageData(0,0,c.width,c.height).data;let x0=c.width,y0=c.height,x1=0,y1=0;for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(d[(y*c.width+x)*4+3]>8){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}crop[key]={x:x0,y:y0,w:x1-x0+1,h:y1-y0+1};}
async function boot(){
  try{
    const paths={runner:'runner_sheet.png',road:'road_tile.png',coin:'solana_coin.png',soc:'soc_coin.png',barrier:'ob_low_barrier.png',beam:'ob_overhead_beam.png',post:'ob_overhead_post.png',blocker:'ob_tall_blocker.png',pu_magnet:'pu_magnet.png',pu_boost:'pu_boost.png',pu_shield:'pu_shield.png',pu_double_coins:'pu_double_coins.png',pu_zap:'pu_zap.webp',light_beam:'light_beam.png',arrow_barrier:'arrow_barrier.png',arrow_blk_left:'arrow_blk_left.png',arrow_blk_right:'arrow_blk_right.png',arrow_blk_both:'arrow_blk_both.png'};
    backgrounds.forEach(k=>paths['bg_'+k]='bg_'+k+'.webp');
    await Promise.all(Object.entries(paths).map(([k,v])=>load(k,'assets/'+v)));
    await Promise.all([load('runner_goggles','assets/runner_goggles.webp'),load('runner_slide','assets/runner_slide.webp')]);
    for(const k of ['coin','barrier','blocker','pu_magnet','pu_boost','pu_shield','pu_double_coins','pu_zap'])trimBounds(k);
    await document.fonts.ready;makeRoad();ready=true;reset();startScreen();updateAudioUI();resize();
    if(new URLSearchParams(location.search).get('test')==='1')installTestAPI();
    window.BullBearRunReady=true;
  }catch(e){console.error(e);$('ov-tag').textContent='Could not load the game. Please refresh.';}
}
// Deterministic QA only, gated behind ?test=1. Uses the live collision/update paths.
function installTestAPI(){
  window.RunTest={state:()=>JSON.parse(JSON.stringify({mode,s,p,warp,objects,gameClock,sceneClock})),
    start(){begin();countdown=-1;startPlay();},clear(){objects=[];},spawn:add,
    set(data){if(data.s)Object.assign(s,data.s);if(data.p)Object.assign(p,data.p);if(data.effects)Object.assign(p.effects,data.effects);},
    advance(ms){for(let i=0;i<ms;i+=1000/60)if(mode==='playing')update(Math.min(1000/60,ms-i)/1000);updateHUD();render();},
    pause(v=true){frozen=v;},lane,jump,slide,fireZap,gameOver,startScreen,
    scene(which){mode='playing';$('overlay').className='hidden';$('hud').classList.add('show');reset();s.score=188;s.distance=211;s.level=1;s.coins=12;
      for(const [z,l]of [[560,-1],[510,-1],[460,-1],[100,-1],[85,-1],[300,0],[260,0],[220,0]])add('coin',l,z);
      add('magnet',1,520);add('blocker',1,500);add('shield',-1,70);
      if(which==='portal')add('portal',0,155);else{add('overhead',-1,175);add('low_barrier',0,190);add('boost',0,70);}frozen=true;paused=false;
      gameClock=100;sceneClock=0;updateHUD();render();},
    render,clock(ms){wall=ms;render();},constants:{HOME_URL,BEST_KEY,TOP_KEY},shareScore,card(score){const c=document.createElement('canvas');c.width=1200;c.height=630;drawCard(c.getContext('2d'),score);return c.toDataURL('image/png');},
  };
}
reset();updateAudioUI();$('ov-tag').textContent='Loading the road…';$('btn-play').disabled=true;
boot().then(()=>{$('btn-play').disabled=false;$('ov-tag').textContent='Dodge, dash and stack the Solana';});
requestAnimationFrame(t=>{lastFrame=t;requestAnimationFrame(frame);});
})();
