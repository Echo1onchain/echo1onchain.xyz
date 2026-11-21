/* BullBear Christmas Run • Galactic Game Labz
 * Christmas edition of BullBear Run v1. Gameplay, lanes, physics and difficulty are unchanged.
 * Adds: gentle snow, Christmas lights, present-stack tall blockers. All scores are local.
 */
(() => {
'use strict';
const W=400,H=700,HOME_URL='https://www.bullbeargames.com/';
// Best, top 10, mute and track are shared with the main game.
const BEST_KEY='bullbear_run_v1_best',TOP_KEY='bullbear_run_v1_top10',MUTE_KEY='bullbear_run_v1_mute',TRACK_KEY='bullbear_xmas_run_track';
const REDUCED_MOTION=!!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
// Present-stack blockers, one image per arrow direction. The arrow is baked onto the green label of the middle box.
// XMAS_ARROW_BOX = the yellow fill of each baked arrow, in source pixels [x0,y0,x1,y1] (measured from the 480x760 art).
// The glowing arrow's own yellow fill is mapped onto it, so fill and black outline line up with the printed arrow at the same size.
// Set an entry to null to find the arrow automatically from the green label instead (for new art).
const XMAS_BLOCKER={left:'ob_tall_blocker_xmas_left.png',right:'ob_tall_blocker_xmas_right.png',both:'ob_tall_blocker_xmas_both.png'};
const XMAS_ARROW_BOX={left:[79,281,290,417],right:[81,283,293,420],both:[78,283,300,419]};
// Yellow fill of the game's arrow_blk_* sprites (298x192), measured once.
const ARROW_SPRITE_YELLOW={left:[15,11,284,181],right:[14,11,284,181],both:[15,11,284,181]};
const COMBO_MS=2600,POWER_MS=5000,ZAP_MS=25000,PLAYER_Z=26,RUNNER_SCALE=.24,SLIDE_H=62.5,PORTAL_R=70.5;
const $=id=>document.getElementById(id), canvas=$('game'),ctx=canvas.getContext('2d',{alpha:false});
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),ease=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
const store={get(k,d){try{return localStorage.getItem(k)??d;}catch(_){return d;}},set(k,v){try{localStorage.setItem(k,v);}catch(_){}}};
const images={},crop={},backgrounds=['crystal_forest','bull_arena','upside_down','spooky_island','crypto_trading','slime_lab','mars_colony'];
const bgNames=['Crystal Forest','Bull Arena','Upside Down','Spooky Island','Crypto Trading','Slime Lab','Mars Colony'];
const colors={magnet:'#ff7fe0',boost:'#6dff9a',double_coins:'#ffd56a',shield:'#7ad8ff',zap:'#8ee4ff'};
let ready=false,mode='loading',lastFrame=0,wall=0,sceneClock=0,dpr=1,uiClock=0,id=0;
let frozen=false;
let best=Math.max(0,Number(store.get(BEST_KEY,'0'))||0),lastRun=null,paused=false;
let s,p,objects=[],floats=[],bolts=[],particles=[],warp=null,countdown=0,bannerTimer=0;
let spawnClock=0,portalClock=0,powerClock=0,powerIndex=0,worldScroll=0,gameClock=0;
let roadRows=[],pausedBeforePanel=false,previousFocus=null;
const audio={ctx:null,music:null,old:null,muted:store.get(MUTE_KEY,'0')==='1',track:clamp(parseInt(store.get(TRACK_KEY,'2'))||0,0,2),started:false,fade:0};
const TRACKS=[{title:'BullBear Run',src:'assets/bullbear_run_music.mp3'},{title:'BullBear to the Moon',src:'assets/bullbear_to_the_moon.mp3'},{title:'Merry BullBear Christmas',src:'assets/merry_bullbear_christmas.mp3'}];
let BEATS={};
BEATS={"0":[0.534,0.998,1.463,1.904,2.345,2.833,3.297,3.762,4.249,4.69,5.155,5.619,6.084,6.548,6.989,7.454,7.941,8.382,8.847,9.311,9.776,10.217,10.681,11.146,11.633,12.098,12.539,13.003,13.444,13.932,14.373,14.861,15.302,15.766,16.231,16.695,17.16,17.624,18.088,18.53,18.994,19.458,19.923,20.387,20.828,21.293,21.757,22.245,22.686,23.174,23.615,24.079,24.543,25.008,25.472,25.937,26.401,26.865,27.307,27.794,28.259,28.723,29.164,29.629,30.093,30.534,30.999,31.463,31.927,32.392,32.856,33.321,33.785,34.226,34.691,35.155,35.619,36.084,36.548,37.013,37.477,37.918,38.383,38.847,39.311,39.776,40.24,40.705,41.169,41.61,42.075,42.539,43.003,43.468,43.932,44.373,44.838,45.302,45.767,46.231,46.695,47.16,47.624,48.065,48.53,49.017,49.459,49.923,50.387,50.852,51.316,51.78,52.245,52.709,53.15,53.615,54.079,54.544,55.008,55.472,55.914,56.378,56.842,57.33,57.794,58.236,58.7,59.164,59.629,60.093,60.534,60.999,61.463,61.928,62.392,62.856,63.298,63.762,64.226,64.691,65.155,65.62,66.084,66.548,67.013,67.454,67.918,68.383,68.847,69.312,69.776,70.24,70.705,71.169,71.61,72.075,72.539,73.004,73.468,73.932,74.397,74.861,75.302,75.767,76.231,76.696,77.16,77.624,78.089,78.553,78.994,79.459,79.923,80.387,80.852,81.316,81.781,82.245,82.709,83.151,83.615,84.079,84.544,85.008,85.473,85.937,86.378,86.843,87.307,87.771,88.236,88.723,89.188,89.629,90.093,90.535,90.999,91.463,91.928,92.392,92.857,93.321,93.785,94.227,94.691,95.155,95.62,96.084,96.549,97.013,97.477,97.942,98.383,98.847,99.312,99.776,100.241,100.705,101.169,101.634,102.075,102.539,103.004,103.468,103.933,104.397,104.861,105.326,105.79,106.231,106.696,107.16,107.624,108.089,108.553,109.018,109.459,109.923,110.388,110.852,111.316,111.781,112.245,112.71,113.151,113.615,114.08,114.544,115.008,115.473,115.914,116.378,116.843,117.307,117.772,118.236,118.7,119.165,119.629,120.07,120.535,120.999,121.464,121.928,122.392,122.857,123.321,123.786,124.25,124.691,125.156,125.62,126.084,126.549,127.013,127.478,127.919,128.383,128.848,129.312,129.776,130.241,130.682,131.146,131.611,132.075,132.54,133.004,133.445,133.886,134.374,134.838,135.303,135.767,136.231,136.696,137.16,137.625,138.089,138.553,139.018,139.459,139.923,140.388,140.852,141.317,141.781,142.245,142.687,143.151,143.615,144.103,144.544,145.009,145.473,145.914,146.402,146.866,147.307,147.772,148.213,148.701,149.165,149.629,150.094,150.558,150.976,151.464,151.928,152.393,152.834,153.321,153.786,154.227,154.691,155.179,155.643,156.108,156.572,157.013,157.478,157.942,158.383,158.848,159.312,159.777,160.241,160.705,161.17,161.611,162.075,162.54,163.004,163.468,163.933,164.397,164.862,165.303,165.767,166.232,166.696,167.16,167.625,168.089,168.554,169.018,169.459,169.924,170.388,170.852,171.317,171.781,172.222,172.71,173.128,173.616,174.08,174.544,174.986,175.45,175.938,176.379,176.843,177.308,177.772,178.236,178.678,179.142,179.63,180.094,180.535,181.0,181.464,181.928,182.393,182.834,183.322,183.786,184.227,184.715,185.179,185.644,186.108,186.572,187.014,187.478,187.942,188.383,188.848,189.312,189.777,190.241,190.682,191.17,191.634,192.075,192.563,193.004,193.469,193.933,194.374,194.839,195.303,195.767,196.232,196.696,197.161,197.625,198.066,198.531,199.018,199.459,199.947,200.388,200.853,201.34,201.805,202.269,202.71,203.151,203.616,204.08,204.545,205.009,205.473,205.938,206.379,206.843,207.308,207.772,208.237,208.701,209.165,209.63,210.071,210.535,211.0,211.464,211.929,212.393,212.857,213.322,213.786,214.227,214.692,215.156,215.62,216.085,216.549,217.014,217.478,217.942,218.384,218.848,219.312,219.777,220.241,220.682,221.147,221.634,222.076,222.54,223.004,223.469,223.933,224.421,224.862,225.303,225.768,226.232,226.696,227.161,227.625,228.066,228.531,229.018,229.46,229.924,230.388,230.853,231.317,231.782,232.246,232.687],"1":[0.418,0.813,1.207,1.602,1.974,2.345,2.717,3.111,3.483,3.878,4.272,4.667,5.039,5.433,5.805,6.177,6.571,6.943,7.361,7.732,8.104,8.475,8.893,9.265,9.66,10.031,10.426,10.82,11.192,11.564,11.958,12.353,12.725,13.096,13.514,13.886,14.257,14.652,15.047,15.418,15.813,16.184,16.579,16.974,17.345,17.717,18.135,18.506,18.901,19.273,19.667,20.062,20.434,20.805,21.2,21.571,21.966,22.338,22.732,23.104,23.499,23.87,24.288,24.66,25.031,25.426,25.821,26.192,26.564,26.958,27.353,27.725,28.119,28.491,28.886,29.28,29.652,30.023,30.395,30.79,31.184,31.579,31.974,32.369,32.74,33.112,33.506,33.878,34.273,34.644,35.039,35.434,35.805,36.177,36.548,36.943,37.361,37.732,38.127,38.522,38.893,39.265,39.66,40.031,40.426,40.797,41.192,41.587,41.958,42.33,42.725,43.096,43.491,43.886,44.28,44.652,45.047,45.418,45.813,46.184,46.579,46.951,47.345,47.74,48.112,48.483,48.878,49.25,49.667,50.039,50.434,50.805,51.2,51.572,51.966,52.338,52.733,53.104,53.499,53.894,54.265,54.66,55.055,55.403,55.821,56.192,56.587,56.982,57.353,57.725,58.12,58.491,58.886,59.257,59.652,60.047,60.418,60.813,61.208,61.579,61.974,62.346,62.74,63.112,63.507,63.878,64.273,64.668,65.039,65.411,65.805,66.2,66.572,66.966,67.361,67.733,68.127,68.499,68.894,69.288,69.66,70.031,70.426,70.821,71.192,71.564,71.959,72.353,72.725,73.12,73.514,73.886,74.281,74.652,75.047,75.442,75.813,76.185,76.579,76.974,77.346,77.717,78.112,78.507,78.878,79.273,79.644,80.039,80.434,80.805,81.2,81.595,81.966,82.338,82.733,83.127,83.499,83.87,84.265,84.66,85.031,85.426,85.821,86.192,86.587,86.959,87.353,87.748,88.12,88.491,88.886,89.281,89.652,90.024,90.442,90.813,91.185,91.58,91.974,92.346,92.717,93.112,93.507,93.901,94.273,94.645,95.039,95.434,95.829,96.177,96.549,96.943,97.338,97.733,98.128,98.499,98.894,99.265,99.66,100.032,100.426,100.798,101.193,101.587,101.982,102.33,102.748,103.12,103.515,103.886,104.281,104.652,105.047,105.419,105.813,106.208,106.58,106.974,107.369,107.741,108.112,108.484,108.878,109.273,109.645,110.039,110.434,110.806,111.2,111.572,111.967,112.361,112.733,113.104,113.499,113.894,114.289,114.66,115.055,115.426,115.798,116.193,116.587,116.959,117.33,117.725,118.097,118.515,118.886,119.258,119.652,120.024,120.419,120.813,121.185,121.58,121.951,122.346,122.717,123.089,123.484,123.878,124.25,124.645,125.016,125.411,125.782,126.177,126.572,126.967,127.315,127.71,128.104,128.499,128.894,129.242,129.66,130.032,130.426,130.798,131.193,131.587,131.982,132.354,132.725,133.12,133.515,133.886,134.281,134.653,135.047,135.419,135.814,136.185,136.58,136.975,137.346,137.718,138.112,138.507,138.879,139.273,139.668,140.04,140.434,140.806,141.201,141.595,141.967,142.338,142.733,143.128,143.523,143.894,144.289,144.66,145.055,145.427,145.821,146.193,146.588,146.959,147.354,147.749,148.12,148.492,148.886,149.281,149.653,150.024,150.419,150.814,151.208,151.58,151.975,152.346,152.741,153.112,153.507,153.902,154.297,154.645,155.04,155.434,155.829,156.201,156.595,156.967,157.338,157.733,158.128,158.499,158.894,159.266,159.66,160.055,160.427,160.798,161.193,161.588,161.959,162.354,162.749,163.12,163.492,163.886,164.281,164.653,165.047,165.419,165.814,166.208,166.603,166.998,167.369,167.741,168.112,168.484,168.879,169.273,169.645,170.017,170.434,170.806,171.201,171.572,171.967,172.362,172.733,173.105,173.523,173.894,174.266,174.637,175.032,175.427,175.798,176.193,176.588,176.982,177.354,177.726,178.12,178.492,178.887,179.258],"2":[0.116,0.441,0.766,1.091,1.416,1.741,2.043,2.368,2.694,3.019,3.344,3.669,3.994,4.296,4.621,4.946,5.271,5.596,5.921,6.246,6.548,6.873,7.198,7.523,7.848,8.173,8.475,8.8,9.125,9.451,9.776,10.101,10.403,10.728,11.053,11.378,11.703,12.028,12.353,12.678,12.98,13.282,13.63,13.955,14.28,14.582,14.907,15.232,15.557,15.859,16.208,16.509,16.834,17.16,17.485,17.81,18.112,18.46,18.785,19.11,19.412,19.737,20.039,20.364,20.689,21.014,21.316,21.664,21.966,22.291,22.616,22.941,23.243,23.568,23.893,24.242,24.543,24.869,25.194,25.519,25.844,26.169,26.471,26.796,27.121,27.446,27.748,28.096,28.421,28.746,29.048,29.373,29.698,30.023,30.348,30.65,30.975,31.3,31.626,31.951,32.276,32.601,32.926,33.251,33.553,33.878,34.18,34.528,34.853,35.178,35.48,35.805,36.107,36.455,36.757,37.082,37.407,37.732,38.058,38.383,38.708,39.033,39.358,39.683,40.008,40.31,40.635,40.96,41.285,41.61,41.912,42.237,42.562,42.887,43.189,43.537,43.862,44.188,44.489,44.815,45.14,45.465,45.767,46.115,46.417,46.742,47.067,47.392,47.717,48.019,48.321,48.669,48.994,49.319,49.621,49.923,50.248,50.596,50.898,51.223,51.548,51.873,52.198,52.524,52.849,53.174,53.476,53.801,54.126,54.451,54.776,55.101,55.403,55.728,56.053,56.378,56.703,57.028,57.33,57.655,57.98,58.282,58.607,58.932,59.257,59.582,59.884,60.209,60.534,60.86,61.161,61.486,61.812,62.16,62.462,62.787,63.112,63.414,63.739,64.064,64.389,64.714,65.016,65.364,65.689,65.991,66.293,66.618,66.943,67.268,67.593,67.918,68.197,68.545,68.87,69.195,69.521,69.846,70.147,70.473,70.798,71.146,71.448,71.773,72.075,72.423,72.725,73.05,73.375,73.7,74.002,74.35,74.675,75,75.302,75.627,75.929,76.254,76.579,76.881,77.206,77.531,77.857,78.182,78.507,78.832,79.134,79.459,79.784,80.109,80.411,80.759,81.084,81.386,81.688,82.036,82.338,82.663,82.988,83.313,83.638,83.963,84.265,84.614,84.915,85.24,85.542,85.867,86.192,86.518,86.819,87.144,87.47,87.795,88.12,88.422,88.747,89.049,89.397,89.722,90.024,90.349,90.674,90.999,91.324,91.649,91.951,92.276,92.601,92.926,93.228,93.553,93.878,94.203,94.505,94.854,95.155,95.48,95.806,96.131,96.456,96.781,97.083,97.408,97.71,98.035,98.36,98.685,99.01,99.312,99.614,99.962,100.287,100.612,100.914,101.216,101.541,101.866,102.191,102.516,102.841,103.166,103.468,103.793,104.118,104.443,104.745,105.07,105.395,105.72,106.046,106.371,106.696,106.998,107.323,107.648,107.95,108.275,108.6,108.925,109.25,109.575,109.877,110.179,110.527,110.852,111.154,111.479,111.804,112.106,112.431,112.756,113.081,113.406,113.731,114.056,114.358,114.683,115.008,115.334,115.635,115.96,116.286,116.611,116.936,117.238,117.539,117.888,118.19,118.515,118.84,119.165,119.467,119.792,120.094,120.419,120.744,121.069,121.371,121.719,122.044,122.369,122.671,122.996,123.321,123.646,123.948,124.273,124.598,124.923,125.225,125.55,125.852,126.177,126.502,126.827,127.152,127.454,127.756,128.104,128.406,128.731,129.057,129.382,129.707,130.009,130.31,130.635,130.961,131.309,131.634,131.936,132.238,132.563,132.865,133.19,133.515,133.84,134.142,134.467,134.792,135.117,135.419,135.744,136.069,136.394,136.696,137.021,137.346,137.671,137.973,138.298,138.623,138.948,139.25,139.575,139.9,140.202,140.504,140.829,141.154,141.479,141.781,142.129,142.454,142.756,143.058,143.383,143.708,144.033,144.335,144.66,144.985,145.287,145.612,145.937,146.239,146.564,146.889,147.215,147.54,147.841,148.143,148.468,148.793,149.119,149.42,149.745,150.047,150.372,150.698,151.023,151.348,151.673,151.975,152.3,152.625,152.95,153.252,153.577,153.879,154.204,154.506,154.854,155.179,155.481,155.806,156.131,156.433,156.758,157.06,157.385,157.71,158.035,158.337,158.662,158.987,159.289,159.591,159.939,160.264,160.566,160.891,161.193,161.518,161.843,162.168,162.47,162.795,163.12,163.422,163.747]};
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
function chain(){s.combo=s.comboLeft>0?s.combo+1:1;s.comboLeft=COMBO_MS;s.maxCombo=Math.max(s.maxCombo,s.combo);if(s.combo===5||s.combo===10||s.combo===20)textFloat(`x${s.combo} ${s.combo>=20?'LEGENDARY':s.combo>=10?'MERRY':'JOLLY'}`,200,445,'#ff8ee0');}
function mult(){return Math.min(5,1+Math.floor(s.combo/5));}
function grant(type){
  s.powerups++;p.effects[type]=type==='zap'?ZAP_MS:POWER_MS;if(type==='zap')p.charges=3;
  textFloat(type==='double_coins'?'SoC DOUBLE COIN':type==='zap'?'BEAR ZAP x3':type.toUpperCase(),200,475,colors[type]);tone(type==='zap'?920:784,.25,'sine',1120);
}
function levelCheck(){const lev=Math.floor(s.distance/500)+1;if(lev>s.level){s.level=lev;banner(`LEVEL ${lev}`,'SLEIGH SPEED UP');tone(523,.25,'triangle',1046);}}
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
  const radius=PORTAL_R*q.r;warp={time:0,applied:false,x:q.x,y:q.y-radius*.9,scale:radius/35.28,exitX:proj(PLAYER_Z,p.target).x};
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
  const spec={coin:39,barrier:84,blocker:60,pu_magnet:44,pu_boost:44,pu_shield:44,pu_double_coins:44,pu_zap:44};
  for(const [key,w]of Object.entries(spec)){const c=crop[key];cache.spr[key]=stepScale(images[key],c.x,c.y,c.w,c.h,w*k,w*k*c.h/c.w);}
  cache.spr.beam=stepScale(images.beam,0,0,images.beam.width,images.beam.height,100*k,100*k*images.beam.height/images.beam.width);
  cache.spr.arrow_beam=stepScale(images.arrow_beam,0,0,images.arrow_beam.width,images.arrow_beam.height,10*k,10*k*images.arrow_beam.height/images.arrow_beam.width);
  const pc=crop.post||{x:0,y:0,w:images.post.width,h:images.post.height};
  cache.spr.post=stepScale(images.post,pc.x,pc.y,pc.w,pc.h,9*k,109*k);
  cache.spr.light_beam=stepScale(images.light_beam,0,0,images.light_beam.width,images.light_beam.height,25*k,11*k);
  cache.spr.arrow_barrier=stepScale(images.arrow_barrier,0,0,images.arrow_barrier.width,images.arrow_barrier.height,22*k,21*k);
  for(const d of ['left','right','both'])cache.spr['arrow_blk_'+d]=stepScale(images['arrow_blk_'+d],0,0,images['arrow_blk_'+d].width,images['arrow_blk_'+d].height,36*k,23*k);
  for(const d of ['left','right','both']){const key='blocker_'+d,c=crop[key];if(images[key]&&c)cache.spr[key]=stepScale(images[key],c.x,c.y,c.w,c.h,60*k,60*k*c.h/c.w);}
  // Christmas: soft bulb glows (one per colour) and a snowflake dot, pre-rendered once.
  cache.bulb={};for(const col of LIGHT_COLORS){const b=document.createElement('canvas');b.width=b.height=Math.ceil(64*dpr);const bg=b.getContext('2d');bg.scale(dpr,dpr);
    const gr=bg.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,`rgba(${col},.55)`);gr.addColorStop(.35,`rgba(${col},.2)`);gr.addColorStop(1,`rgba(${col},0)`);bg.fillStyle=gr;bg.fillRect(0,0,64,64);cache.bulb[col]=b;}
  const fl=document.createElement('canvas');fl.width=fl.height=Math.ceil(16*dpr);const flg=fl.getContext('2d');flg.scale(dpr,dpr);
  const fgr=flg.createRadialGradient(8,8,0,8,8,8);fgr.addColorStop(0,'rgba(255,255,255,1)');fgr.addColorStop(.45,'rgba(240,248,255,.85)');fgr.addColorStop(1,'rgba(230,240,255,0)');flg.fillStyle=fgr;flg.fillRect(0,0,16,16);cache.flake=fl;
  cache.spr.soc=stepScale(images.soc,0,0,images.soc.width,images.soc.height,130*dpr,130*dpr);
  cache.frames=[];for(let f=0;f<16;f++)cache.frames[f]=stepScale(images.runner,(f%4)*384,Math.floor(f/4)*512,384,512,384*RUNNER_SCALE*dpr,512*RUNNER_SCALE*dpr);
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
function arrowPulse(ms=2500){return .5+.5*Math.sin(wall*Math.PI*2/ms);}
function drawArrowGlow(img,dx,dy,dw,dh,rgb,k=1,ms=2500){
  if(!img||dw<1.5||dh<1.5)return;
  const p=arrowPulse(ms),s=Math.min(dw,dh);
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
function arrowOn(srcKey,arrowKey,dx,dy,dw,dh,rgb,box,k=1,ms=2500){
  const im=images[srcKey],c=crop[srcKey]||{x:0,y:0,w:im.width,h:im.height};
  const [x0,y0,x1,y1]=box;
  drawArrowGlow(cache.spr[arrowKey],dx+(x0-c.x)/c.w*dw,dy+(y0-c.y)/c.h*dh,(x1-x0)/c.w*dw,(y1-y0)/c.h*dh,rgb,k,ms);
}
// Present blockers: the glowing arrow is laid exactly over the arrow baked onto the green label.
// The arrow sprite's own opaque area is stretched to the baked arrow's box, so the glow arrow is the same size as the printed one.
const labelBox={};
function arrowOnLabel(srcKey,arrowKey,dx,dy,dw,dh,rgb,k=1,ms=2500){
  const c=crop[srcKey],b=labelBox[srcKey],t=ARROW_SPRITE_YELLOW[arrowKey.slice(10)],a=images[arrowKey];if(!c||!b||!t||!a)return;
  const sx=dw/c.w,sy=dh/c.h,bx=dx+(b[0]-c.x)*sx,by=dy+(b[1]-c.y)*sy,bw=(b[2]-b[0])*sx,bh=(b[3]-b[1])*sy;
  const fw=bw*a.width/(t[2]-t[0]),fh=bh*a.height/(t[3]-t[1]);
  drawArrowGlow(cache.spr[arrowKey],bx-t[0]*fw/a.width,by-t[1]*fh/a.height,fw,fh,rgb,k,ms);
}
// Finds the baked arrow: the largest non-green shape fully enclosed by a green label, preferring the label nearest the centre.
function findLabelArrow(key){
  const im=images[key],w=im.width,h=im.height,N=w*h,c=document.createElement('canvas');c.width=w;c.height=h;
  const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(im,0,0);const d=g.getImageData(0,0,w,h).data;
  const green=new Uint8Array(N);
  for(let i=0;i<N;i++){const R=d[i*4],G=d[i*4+1],B=d[i*4+2];green[i]=d[i*4+3]>160&&G>70&&G>R*1.25&&G>B*1.12?1:0;}
  const lab=new Int32Array(N),stack=new Int32Array(N);
  const flood=(seed,test,mark,id)=>{let sp=0,x0=w,y0=h,x1=-1,y1=-1,area=0;stack[sp++]=seed;mark[seed]=id;
    while(sp){const j=stack[--sp],x=j%w,y=(j/w)|0;area++;if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;
      if(x>0&&!mark[j-1]&&test(j-1)){mark[j-1]=id;stack[sp++]=j-1;}if(x<w-1&&!mark[j+1]&&test(j+1)){mark[j+1]=id;stack[sp++]=j+1;}
      if(y>0&&!mark[j-w]&&test(j-w)){mark[j-w]=id;stack[sp++]=j-w;}if(y<h-1&&!mark[j+w]&&test(j+w)){mark[j+w]=id;stack[sp++]=j+w;}}
    return{x0,y0,x1,y1,area};};
  let n=0,best=null;
  for(let i=0;i<N;i++){
    if(!green[i]||lab[i])continue;const L=flood(i,j=>green[j],lab,++n);if(L.area<N*.0015)continue;
    const bw=L.x1-L.x0+1,bh=L.y1-L.y0+1,rowL=new Int32Array(bh).fill(w),rowR=new Int32Array(bh).fill(-1),colT=new Int32Array(bw).fill(h),colB=new Int32Array(bw).fill(-1);
    for(let y=L.y0;y<=L.y1;y++)for(let x=L.x0;x<=L.x1;x++)if(lab[y*w+x]===n){const ry=y-L.y0,cx=x-L.x0;if(x<rowL[ry])rowL[ry]=x;if(x>rowR[ry])rowR[ry]=x;if(y<colT[cx])colT[cx]=y;if(y>colB[cx])colB[cx]=y;}
    const inside=new Uint8Array(N);let any=false;
    for(let y=L.y0;y<=L.y1;y++)for(let x=L.x0;x<=L.x1;x++){const j=y*w+x;if(lab[j]!==n&&d[j*4+3]>100&&x>rowL[y-L.y0]&&x<rowR[y-L.y0]&&y>colT[x-L.x0]&&y<colB[x-L.x0]){inside[j]=1;any=true;}}
    if(!any)continue;
    const seen=new Uint8Array(N);let shape=null;
    for(let y=L.y0;y<=L.y1;y++)for(let x=L.x0;x<=L.x1;x++){const j=y*w+x;if(inside[j]&&!seen[j]){const S=flood(j,q=>inside[q]===1,seen,1);if(!shape||S.area>shape.area)shape=S;}}
    if(!shape||shape.area<L.area*.05)continue;
    // Anti-aliased outline pixels read as green, so grow the box a hair to cover the full printed arrow.
    const pad=Math.max(1,Math.round((shape.x1-shape.x0+1)*.012));shape.x0-=pad;shape.y0-=pad;shape.x1+=pad;shape.y1+=pad;
    // Convert the outlined shape to its yellow fill (the sprite's outline is 6/298 wide, 6/192 tall).
    {const ix=(shape.x1-shape.x0+1)*6/281,iy=(shape.y1-shape.y0+1)*6/182;shape.x0+=ix;shape.x1-=ix;shape.y0+=iy;shape.y1-=iy;}
    const aw=shape.x1-shape.x0+1,ah=shape.y1-shape.y0+1,aspect=aw/ah;if(aspect<.8||aspect>3)continue;
    const score=shape.area*(1-.6*Math.abs((shape.x0+shape.x1)/2/w-.5))*(1-.4*Math.abs((shape.y0+shape.y1)/2/h-.5));
    if(!best||score>best.score)best={score,box:[shape.x0,shape.y0,shape.x1+1,shape.y1+1]};
  }
  return best&&best.box;
}
function setupPresentBlockers(){
  for(const dir of ['left','right','both']){
    const key='blocker_'+dir;if(!images[key])continue;trimBounds(key);
    let box=XMAS_ARROW_BOX[dir]||findLabelArrow(key);
    if(!box){const c=crop[key],bw=c.w*.45,bh=bw*170/269;box=[c.x+(c.w-bw)/2,c.y+(c.h-bh)/2,c.x+(c.w+bw)/2,c.y+(c.h+bh)/2];console.warn('BullBear Christmas Run: no green label arrow found on '+XMAS_BLOCKER[dir]+', centring the glow arrow. Set XMAS_ARROW_BOX.'+dir+' to place it exactly.');}
    labelBox[key]=box;
  }
}
// Big block arrows point to the open lane: left lane points right, right lane points left, center points both ways unless a side lane is also blocked.
function blockDir(o){if(o.lane<-.5)return 'right';if(o.lane>.5)return 'left';let L=false,R=false;for(const q of objects)if(q!==o&&q.type==='blocker'&&!q.done&&Math.abs(q.z-o.z)<60){if(q.lane<-.5)L=true;else if(q.lane>.5)R=true;}return L&&!R?'right':R&&!L?'left':'both';}
function sprite(key,x,bottom,w,yoff=0){const im=cache.spr[key],h=w*im.height/im.width;ctx.drawImage(im,x-w/2,bottom-h-yoff,w,h);return h;}
function drawObject(o){
  if(o.z<0||o.z>1500)return;const {x,y,r}=proj(o.z,o.lane),b=.5+.5*Math.sin(wall*Math.PI*2/7000);
  if(o.type==='coin'){const w=39*r;glow(x,y-43*r,w*.9,'#ffd56a',.2);sprite('coin',x,y,w,23.5*r);}
  else if(o.type==='portal'){
    const radius=PORTAL_R*r;ctx.save();ctx.translate(x,y-radius*.9);ctx.scale(1,.90);drawPortal(0,0,radius/35.28,1,wall);ctx.restore();
    if(r>.3){ctx.save();ctx.font=`${Math.max(9,22*r)}px 'Lilita One',sans-serif`;ctx.textAlign='center';ctx.lineWidth=4*r;ctx.lineJoin='round';ctx.strokeStyle='#18082c';ctx.fillStyle='#ffe68c';ctx.strokeText('SolOnChain Portal',x,y-radius*1.95);ctx.fillText('SolOnChain Portal',x,y-radius*1.95);ctx.restore();}
  }else if(o.type==='overhead'){
    // Mistletoe beam: candy-cane bar keeps the old top; the extra height is the hanging mistletoe. Slide gap and hitbox unchanged.
    const bw=100*r,bh=bw*images.beam.height/images.beam.width,top=y-116*r,pw=9*r;
    ctx.drawImage(cache.spr.post,x-bw/2+3*r,top+26*r*.3,pw,109*r);ctx.drawImage(cache.spr.post,x+bw/2-12*r,top+26*r*.3,pw,109*r);
    ctx.drawImage(cache.spr.beam,x-bw/2,top,bw,bh);
    arrowOn('beam','arrow_beam',x-bw/2,top,bw,bh,'255,36,36',[530,36,648,145],2.2);
  }else if(o.type==='low_barrier'){
    const w=84*r,h=sprite('barrier',x,y,w);
    arrowOn('barrier','arrow_barrier',x-w/2,y-h,w,h,'255,200,40',[157,157,278,270]);
  }else if(o.type==='blocker'){
    // Lock the direction the first time the blocker is drawn, so the present image and arrow never swap mid-run (no pop or flash).
    const dir=o.dir||(o.dir=blockDir(o)),key='blocker_'+dir;
    if(images[key]&&cache.spr[key]){
      const w=60*r,h=sprite(key,x,y,w);
      arrowOnLabel(key,'arrow_blk_'+dir,x-w/2,y-h,w,h,'255,214,10',1,1750);
    }else{
      const w=60*r,h=sprite('blocker',x,y,w);
      arrowOn('blocker','arrow_blk_'+dir,x-w/2,y-h,w,h,'255,214,10',[24,274,322,466],1,1750);
    }
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
    const frame=Math.floor(gameClock/(p.effects.boost>0?40:50))%16;
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
  if(u>WARP_J){const grow=ease((u-WARP_J)/.14),a=1-ease((u-WARP_T+.24)/.24);ctx.save();ctx.translate(warp.exitX,555);ctx.scale(1,.9);drawPortal(0,0,Math.max(.02,1.5*grow),a,wall);ctx.restore();}
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
// ------------ Christmas: lights and snow ------------
// Every glow breathes on smooth sine curves (7s), staggered per bulb. Nothing switches on and off, nothing flashes.
const LIGHT_COLORS=['255,64,80','70,226,128','255,213,106','110,190,255'];
function bulbBreath(i){return .5+.5*Math.sin(wall*Math.PI*2/7000+i*1.7);}
function drawBulb(x,y,size,ci,i){
  const col=LIGHT_COLORS[((ci%4)+4)%4],b=bulbBreath(i),gs=size*(4.2+.5*b);
  ctx.globalAlpha=.55+.35*b;ctx.drawImage(cache.bulb[col],x-gs,y-gs+size*.4,gs*2,gs*2);
  ctx.globalAlpha=1;ctx.fillStyle='#1d2a1a';ctx.fillRect(x-size*.42,y-size*.95,size*.84,size*.6);
  ctx.fillStyle=`rgba(${col},${(.82+.18*b).toFixed(3)})`;ctx.beginPath();ctx.ellipse(x,y+size*.35,size*.62,size,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=`rgba(255,255,255,${(.35+.2*b).toFixed(3)})`;ctx.beginPath();ctx.ellipse(x-size*.2,y,size*.17,size*.32,0,0,Math.PI*2);ctx.fill();
}
// A string of lights along each road edge, scrolling with the road. Bulbs keep their colour as they travel.
function drawRoadLights(){
  const step=46,base=Math.floor(worldScroll/step),off=worldScroll-base*step;
  for(const side of [-1,1]){
    const pts=[];
    for(let k=21;k>=0;k--){const z=k*step-off;if(z<-2||z>950)continue;const q=proj(z,side*1.74);pts.push({x:q.x,y:q.y-15*q.r,r:q.r,i:base+k});}
    ctx.save();ctx.strokeStyle='rgba(40,110,60,.9)';ctx.lineCap='round';
    for(let j=1;j<pts.length;j++){const a=pts[j-1],b=pts[j];ctx.lineWidth=Math.max(.7,2.4*b.r);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.quadraticCurveTo((a.x+b.x)/2,(a.y+b.y)/2+7*b.r,b.x,b.y);ctx.stroke();}
    ctx.restore();
    for(const pt of pts)drawBulb(pt.x,pt.y+4*pt.r,Math.max(1,7*pt.r),pt.i*3+(side>0?1:0),pt.i*2+(side>0?.9:0));
  }
}
// Garland swags across the top of the screen.
function drawTopGarland(){
  const swags=3,span=(W+20)/swags,sag=15,y0=2;ctx.save();ctx.lineCap='round';
  for(let s2=0;s2<swags;s2++){const xa=-10+s2*span,xb=xa+span;
    ctx.strokeStyle='#123a22';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(xa,y0);ctx.quadraticCurveTo((xa+xb)/2,y0+sag*2,xb,y0);ctx.stroke();
    ctx.strokeStyle='#1f6b3a';ctx.lineWidth=3.5;ctx.stroke();}
  ctx.restore();
  for(let s2=0;s2<swags;s2++){const xa=-10+s2*span;for(let j=1;j<6;j++){const t=j/6,x=xa+span*t,y=y0+sag*2*2*t*(1-t)*1+2;drawBulb(x,y+5,5,s2*5+j,s2*5+j+40);}}
}
// Gentle snow: positions come straight from the clock, so it never jumps and costs nothing to update.
const FLAKES=[];{let seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
  for(let i=0;i<(REDUCED_MOTION?36:84);i++){const depth=rnd();FLAKES.push({x:rnd()*W,y:rnd()*(H+30),size:1.4+depth*depth*3.6,v:(REDUCED_MOTION?.5:1)*(16+depth*30),sway:rnd()*Math.PI*2,amp:5+rnd()*12,freq:.25+rnd()*.35,a:.42+depth*.48});}}
function drawSnow(alpha=1){
  if(alpha<=.01)return;const t=wall/1000;
  for(const f of FLAKES){const y=((f.y+f.v*t)%(H+30))-15,x=(((f.x+Math.sin(t*f.freq+f.sway)*f.amp+t*4)%(W+20))+W+20)%(W+20)-10;
    ctx.globalAlpha=f.a*alpha;const d=f.size*2.2;ctx.drawImage(cache.flake,x-d/2,y-d/2,d,d);}
  ctx.globalAlpha=1;
}
function render(){
  if(!ready)return;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
  if(warp){const [cx,cy]=warpCentre(),z=warpZoom();ctx.translate(cx,cy);ctx.scale(z,z);ctx.translate(-cx,-cy);}
  drawBg();drawRoad();drawRoadLights();
  const list=objects.filter(o=>!o.done),far=list.filter(o=>o.z>=PLAYER_Z).sort((a,b)=>b.z-a.z),near=list.filter(o=>o.z<PLAYER_Z).sort((a,b)=>b.z-a.z);
  for(const o of far)drawObject(o);
  if(warp)drawWarpPortals();
  if(mode==='playing'||mode==='countdown'||mode==='gameover')drawRunner();
  // Redraw a nearby overhead so the beam sits in front of a sliding runner and the gap stays visible.
  for(const o of far)if(o.type==='overhead'&&o.z<PLAYER_Z+80)drawObject(o);
  for(const o of near)drawObject(o);
  if(warp){ctx.setTransform(dpr,0,0,dpr,0,0);drawWarp();}
  drawSnow(warp?1-.8*warpRush(warp.time):1);drawTopGarland();
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
  if(which==='lb'){const list=loadTop();$('lb-list').innerHTML=list.length?list.map((r,i)=>`<li class="lb-row${r.t===lastRun?' me':''}"><span class="lb-rank">#${i+1}</span><span class="lb-score">${r.score}</span><span class="lb-dist">${r.distance}m</span><span class="lb-date">${new Date(r.t).toLocaleDateString(undefined,{month:'short',day:'numeric'})}</span></li>`).join(''):'<li class="lb-empty">No scores yet. Jingle all the way!</li>';}
  $(which+'-panel').classList.add('open');$(which+'-body').scrollTop=0;$(which+'-close').focus();musicMenu(false);
}
function closePanel(which){$(which+'-panel').classList.remove('open');previousFocus?.focus();}
// BullBears and SolOnChain info strip for the share card. Sun mark = official SolOnChain vector (SOC_VEC rays + body, 148x134 viewBox).
const CARD_SOC={rays:'M68.00,133.67C68.00,133.49 67.86,133.15 67.69,132.93L67.38,132.52L67.38,126.91C67.38,121.72 67.40,121.28 67.61,120.80C68.11,119.71 69.01,119.13 70.21,119.13C70.92,119.12 71.35,119.31 71.92,119.85C72.86,120.76 72.81,120.40 72.81,126.81C72.81,132.56 72.81,132.56 72.53,133.01C72.38,133.26 72.25,133.59 72.25,133.73C72.25,134.00 72.21,134.00 70.12,134.00L68.00,134.00L68.00,133.67ZM109.88,122.99C109.45,122.77 109.02,122.42 108.75,122.05C108.51,121.73 108.08,121.21 107.80,120.89C107.52,120.57 107.16,120.12 107.00,119.88C106.84,119.63 106.53,119.23 106.32,118.98C105.93,118.52 105.42,117.91 104.79,117.12C104.59,116.88 104.28,116.45 104.09,116.16C103.90,115.86 103.70,115.62 103.63,115.62C103.57,115.62 103.39,115.42 103.24,115.16C103.08,114.91 102.72,114.43 102.44,114.11C101.63,113.15 101.38,112.79 101.18,112.32C100.96,111.80 100.95,111.47 101.14,110.61C101.37,109.52 102.62,108.50 103.72,108.50C104.10,108.50 105.32,108.99 105.59,109.25C105.71,109.38 106.04,109.77 106.31,110.12C106.59,110.47 107.04,111.03 107.31,111.36C107.59,111.69 108.07,112.28 108.38,112.67C108.68,113.06 109.15,113.64 109.41,113.95C109.66,114.26 109.88,114.59 109.88,114.68C109.88,114.76 110.06,115.01 110.28,115.22C110.50,115.43 111.03,116.03 111.44,116.56C111.85,117.09 112.37,117.73 112.59,117.97C112.82,118.21 113.00,118.46 113.00,118.51C113.00,118.57 113.17,118.81 113.38,119.04C114.11,119.88 114.04,121.35 113.23,122.36C112.83,122.87 112.61,123.03 112.09,123.19C111.20,123.45 110.67,123.41 109.88,122.99ZM27.39,123.11C26.46,122.74 26.27,122.59 25.94,121.94C25.40,120.86 25.39,120.42 25.91,119.33C26.15,118.81 26.47,118.33 26.61,118.26C26.76,118.18 26.99,117.91 27.13,117.65C27.27,117.40 27.61,116.91 27.89,116.56C28.64,115.63 29.78,114.14 30.09,113.68C30.24,113.45 30.47,113.20 30.59,113.10C30.72,113.01 30.95,112.73 31.11,112.47C31.27,112.21 31.45,112.00 31.51,112.00C31.57,112.00 31.82,111.70 32.06,111.34C33.08,109.82 33.61,109.27 34.44,108.86C35.38,108.40 35.75,108.42 36.83,108.96C38.48,109.80 38.72,111.97 37.33,113.60C37.02,113.96 36.73,114.36 36.69,114.49C36.65,114.62 36.54,114.76 36.44,114.79C36.34,114.83 36.14,115.09 36.00,115.38C35.86,115.66 35.65,115.92 35.55,115.96C35.45,116.00 35.17,116.32 34.93,116.67C34.70,117.02 34.14,117.76 33.70,118.31C33.26,118.86 32.69,119.57 32.44,119.88C30.30,122.55 30.09,122.77 29.56,123.02C29.02,123.26 27.89,123.31 27.39,123.11ZM3.80,90.77C3.30,90.61 2.38,89.67 2.19,89.12C1.55,87.31 2.62,85.81 5.10,85.05C5.70,84.87 6.44,84.60 6.75,84.44C7.06,84.29 7.59,84.10 7.92,84.01C8.26,83.93 8.79,83.73 9.11,83.57C9.43,83.41 9.94,83.24 10.25,83.19C10.56,83.14 11.08,82.93 11.40,82.73C11.72,82.53 12.20,82.30 12.46,82.23C12.72,82.16 13.43,81.91 14.02,81.68C15.42,81.13 16.30,81.02 16.91,81.31C17.59,81.63 18.58,82.74 18.75,83.38C19.16,84.88 18.05,86.33 16.02,86.95C15.42,87.13 14.69,87.40 14.38,87.56C14.07,87.71 13.54,87.90 13.20,87.99C12.87,88.07 12.33,88.27 12.01,88.43C11.68,88.60 11.06,88.82 10.62,88.94C10.17,89.05 9.59,89.28 9.31,89.44C9.03,89.60 8.46,89.82 8.04,89.93C7.61,90.04 6.91,90.30 6.48,90.50C5.84,90.80 5.53,90.87 4.88,90.86C4.43,90.86 3.94,90.81 3.80,90.77ZM133.25,90.61C132.87,90.47 132.10,90.19 131.54,89.99C130.97,89.79 130.33,89.52 130.10,89.39C129.87,89.25 129.31,89.03 128.85,88.89C128.39,88.75 127.80,88.53 127.54,88.40C127.28,88.26 126.73,88.06 126.32,87.94C125.91,87.82 125.32,87.60 125.01,87.44C124.69,87.29 124.13,87.06 123.75,86.95C123.37,86.84 122.64,86.51 122.13,86.21C121.28,85.73 121.17,85.62 120.96,85.06C120.78,84.58 120.74,84.26 120.80,83.67C120.91,82.60 121.08,82.18 121.54,81.89C121.76,81.75 122.08,81.53 122.24,81.41C122.71,81.07 124.41,81.10 125.01,81.45C125.25,81.60 125.92,81.87 126.50,82.06C127.08,82.25 127.72,82.51 127.93,82.63C128.14,82.75 128.63,82.94 129.02,83.05C129.41,83.16 130.00,83.39 130.34,83.55C130.67,83.72 131.19,83.92 131.50,84.00C131.80,84.08 132.43,84.34 132.88,84.56C133.33,84.79 134.02,85.07 134.41,85.19C135.25,85.43 136.58,86.37 136.77,86.85C136.98,87.41 137.04,87.95 136.94,88.70C136.87,89.29 136.77,89.49 136.33,89.97C135.46,90.92 134.57,91.10 133.25,90.61ZM16.87,54.87C16.55,54.82 16.07,54.67 15.80,54.53C15.53,54.40 14.92,54.16 14.44,54.00C13.96,53.84 13.12,53.49 12.57,53.23C12.02,52.97 11.49,52.75 11.38,52.75C11.27,52.75 10.96,52.63 10.69,52.49C10.42,52.34 9.79,52.09 9.29,51.92C8.78,51.76 8.04,51.46 7.65,51.26C7.25,51.06 6.73,50.86 6.49,50.81C5.76,50.67 4.34,49.72 4.10,49.21C3.68,48.34 3.62,47.78 3.88,46.95C4.07,46.34 4.23,46.09 4.68,45.72C5.65,44.90 6.88,44.81 8.25,45.45C8.63,45.63 9.44,45.96 10.06,46.19C12.54,47.10 13.21,47.36 13.81,47.66C14.16,47.83 14.75,48.07 15.12,48.19C15.50,48.31 15.88,48.46 15.96,48.52C16.03,48.58 16.55,48.79 17.10,48.99C18.47,49.46 19.57,50.19 19.80,50.75C20.09,51.49 20.16,52.22 19.99,52.90C19.87,53.42 19.71,53.67 19.21,54.15C18.86,54.49 18.45,54.78 18.29,54.82C17.63,54.95 17.41,54.96 16.87,54.87ZM37.10,27.87C36.70,27.66 36.30,27.24 34.57,25.19C34.34,24.91 33.92,24.42 33.64,24.09C33.36,23.76 33.12,23.43 33.12,23.36C33.12,23.29 32.69,22.74 32.15,22.15C31.62,21.55 31.05,20.85 30.89,20.59C30.73,20.34 30.56,20.12 30.51,20.12C30.41,20.12 29.47,18.92 29.27,18.53C29.06,18.11 29.00,17.41 29.13,16.80C29.42,15.42 31.01,14.41 32.34,14.74C33.13,14.94 33.59,15.20 33.76,15.53C33.84,15.69 34.10,16.01 34.33,16.25C34.97,16.89 35.78,17.89 36.11,18.41C36.27,18.67 36.44,18.88 36.50,18.88C36.56,18.88 36.73,19.09 36.89,19.34C37.05,19.60 37.35,19.99 37.56,20.20C37.77,20.42 38.13,20.86 38.38,21.18C38.62,21.50 38.99,21.97 39.20,22.22C39.41,22.48 39.77,22.97 40.00,23.31C40.24,23.66 40.52,24.04 40.63,24.16C40.89,24.44 41.02,25.51 40.88,26.23C40.76,26.90 39.91,27.82 39.25,28.00C38.55,28.20 37.61,28.14 37.10,27.87ZM70.79,18.82C70.06,18.59 69.15,17.80 69.00,17.25C68.82,16.60 68.84,4.47 69.02,3.86C69.24,3.12 70.30,2.26 71.11,2.17C72.01,2.06 72.53,2.20 73.18,2.72C73.59,3.06 73.82,3.37 74.00,3.85C74.24,4.47 74.25,4.82 74.25,10.48C74.25,17.43 74.25,17.41 73.27,18.23C72.91,18.54 72.44,18.79 72.11,18.87C71.44,19.02 71.44,19.02 70.79,18.82Z',body:'M68.19,113.30C63.26,112.98 61.27,112.69 57.88,111.82C56.92,111.57 54.25,110.66 53.88,110.45C53.70,110.36 53.25,110.19 52.88,110.07C52.21,109.86 50.13,108.92 49.50,108.55C49.33,108.45 48.85,108.20 48.44,108.01C48.02,107.81 47.49,107.50 47.26,107.33C47.02,107.15 46.76,107.00 46.67,107.00C46.59,107.00 46.15,106.75 45.69,106.44C45.24,106.13 44.82,105.88 44.75,105.88C44.68,105.88 44.41,105.69 44.16,105.45C43.90,105.22 43.52,104.94 43.31,104.83C43.11,104.71 42.60,104.34 42.19,104.00C41.77,103.65 41.17,103.17 40.84,102.92C40.52,102.68 40.25,102.43 40.25,102.36C40.25,102.30 40.02,102.11 39.75,101.94C39.13,101.55 36.10,98.49 34.59,96.73C33.26,95.18 33.00,94.86 33.00,94.75C33.00,94.69 32.79,94.39 32.53,94.08C31.95,93.38 31.61,92.88 31.14,91.99C30.94,91.61 30.68,91.22 30.57,91.13C30.46,91.04 30.17,90.56 29.94,90.07C29.71,89.59 29.44,89.05 29.34,88.88C28.42,87.28 26.72,83.06 26.11,80.88C25.97,80.36 25.73,79.52 25.57,79.00C25.41,78.48 25.22,77.58 25.14,77.00C25.07,76.42 24.91,75.23 24.80,74.38C24.69,73.52 24.55,72.54 24.49,72.21C24.10,70.19 24.81,61.85 25.54,59.68C25.71,59.20 25.94,58.34 26.05,57.77C26.17,57.20 26.38,56.44 26.52,56.08C26.66,55.73 26.90,54.99 27.06,54.44C27.23,53.89 27.52,53.10 27.73,52.69C27.93,52.27 28.16,51.71 28.23,51.44C28.31,51.16 28.51,50.73 28.68,50.48C28.85,50.23 29.10,49.75 29.22,49.42C29.35,49.09 29.64,48.53 29.85,48.19C30.07,47.85 30.25,47.53 30.25,47.47C30.25,47.42 30.43,47.09 30.66,46.75C30.88,46.41 31.29,45.76 31.56,45.31C31.84,44.85 32.25,44.25 32.48,43.97C32.70,43.69 32.98,43.28 33.09,43.07C33.19,42.86 33.49,42.45 33.74,42.16C33.98,41.87 34.38,41.38 34.62,41.07C35.07,40.48 39.03,36.46 40.04,35.56C40.35,35.29 40.82,34.91 41.08,34.72C41.35,34.53 41.93,34.09 42.38,33.75C42.82,33.41 43.39,33.02 43.63,32.89C43.88,32.75 44.15,32.55 44.24,32.45C44.33,32.34 44.47,32.25 44.56,32.25C44.64,32.25 45.02,32.03 45.40,31.76C45.78,31.50 46.30,31.21 46.56,31.13C46.81,31.04 47.20,30.82 47.42,30.64C48.02,30.13 50.59,28.90 52.45,28.25C52.80,28.13 53.48,27.85 53.95,27.65C54.43,27.44 55.18,27.18 55.62,27.07C56.07,26.96 56.83,26.73 57.31,26.56C57.79,26.39 58.98,26.12 59.94,25.95C60.90,25.78 62.14,25.55 62.69,25.45C64.65,25.09 65.98,24.99 69.38,24.99C72.97,24.98 74.87,25.14 76.94,25.62C77.49,25.75 78.39,25.92 78.94,26.00C79.49,26.08 80.42,26.30 81.00,26.50C81.58,26.70 82.48,26.98 82.99,27.13C83.50,27.27 84.27,27.59 84.72,27.82C85.16,28.06 85.60,28.25 85.69,28.25C85.79,28.25 86.07,28.42 86.31,28.64C86.86,29.12 86.89,29.53 86.39,29.82C86.20,29.94 85.94,30.19 85.83,30.39C85.71,30.58 85.47,30.90 85.28,31.11C85.09,31.31 84.68,31.80 84.38,32.19C83.21,33.67 82.81,33.89 82.04,33.47C81.78,33.33 80.97,33.06 80.25,32.87C79.53,32.68 78.62,32.43 78.24,32.32C77.85,32.22 76.11,31.90 74.36,31.63C70.21,30.97 68.09,30.96 64.81,31.55C64.26,31.65 63.11,31.82 62.26,31.93C61.40,32.04 60.31,32.27 59.82,32.44C59.34,32.60 58.44,32.86 57.84,33.00C57.23,33.14 56.53,33.36 56.28,33.48C56.02,33.61 55.48,33.82 55.06,33.93C54.65,34.05 54.06,34.28 53.75,34.44C53.44,34.61 52.43,35.11 51.50,35.57C49.63,36.48 48.85,36.91 48.15,37.42C47.42,37.95 46.88,38.33 46.03,38.88C45.60,39.17 45.25,39.44 45.25,39.50C45.25,39.55 45.08,39.71 44.87,39.84C44.67,39.97 44.24,40.30 43.93,40.57C43.18,41.22 40.05,44.36 39.54,44.96C39.33,45.22 38.96,45.66 38.72,45.94C38.48,46.21 38.08,46.75 37.82,47.12C37.13,48.16 36.79,48.65 36.50,49.02C36.36,49.21 36.10,49.67 35.93,50.05C35.75,50.43 35.56,50.78 35.49,50.82C35.36,50.90 33.96,53.76 33.81,54.25C33.76,54.42 33.59,54.79 33.43,55.06C33.27,55.34 33.05,55.92 32.94,56.37C32.82,56.81 32.62,57.39 32.48,57.66C32.35,57.93 32.13,58.70 32.00,59.38C31.87,60.06 31.65,60.99 31.50,61.46C31.08,62.81 30.87,64.71 30.79,67.82C30.69,71.77 30.92,74.66 31.51,76.62C31.64,77.07 31.89,77.94 32.07,78.56C32.53,80.13 32.90,80.82 33.38,80.98C33.65,81.08 44.34,81.12 69.80,81.12C104.02,81.13 105.84,81.12 106.03,80.91C106.25,80.66 106.86,78.84 107.24,77.25C107.39,76.67 107.58,75.88 107.68,75.50C107.90,74.68 108.12,72.62 108.21,70.56C108.27,69.13 108.10,65.90 107.93,65.46C107.80,65.13 107.45,65.09 104.56,65.07C102.45,65.05 101.61,64.99 100.94,64.83C99.53,64.49 97.00,63.64 96.20,63.24C95.79,63.04 95.39,62.87 95.31,62.87C95.22,62.87 94.85,62.65 94.48,62.37C94.12,62.10 93.75,61.88 93.67,61.88C93.58,61.88 93.26,61.66 92.95,61.41C92.64,61.15 92.07,60.68 91.68,60.38C90.60,59.52 88.48,57.08 88.16,56.33C88.07,56.14 87.84,55.77 87.64,55.52C87.19,54.94 86.77,53.96 85.93,51.46C85.13,49.11 84.92,47.63 85.05,45.06C85.13,43.30 85.28,42.54 85.94,40.46C86.67,38.15 87.71,36.18 88.80,35.04C89.02,34.82 89.28,34.54 89.39,34.41C89.50,34.29 89.68,34.10 89.79,34.00C89.90,33.90 90.35,33.45 90.80,33.00C91.24,32.55 91.75,32.05 91.93,31.88C92.11,31.70 92.32,31.49 92.41,31.40C92.49,31.31 93.51,30.33 94.67,29.21C95.83,28.10 97.29,26.68 97.92,26.06C98.56,25.44 100.53,23.54 102.32,21.82C108.83,15.57 108.95,15.46 109.77,15.07C110.02,14.95 110.26,14.77 110.30,14.67C110.34,14.57 110.75,14.32 111.22,14.11C111.68,13.90 112.29,13.62 112.57,13.49C112.85,13.36 113.14,13.25 113.20,13.25C113.27,13.25 113.94,13.04 114.70,12.79L116.06,12.32L119.12,12.32L122.19,12.31L123.88,12.79C125.42,13.24 127.23,14.02 127.79,14.49C127.91,14.59 128.20,14.79 128.43,14.93C129.75,15.74 133.45,19.34 135.81,22.11C137.31,23.88 137.63,24.32 137.95,24.99C138.09,25.30 138.36,25.78 138.53,26.04C138.71,26.30 138.90,26.69 138.94,26.91C138.99,27.13 139.19,27.63 139.39,28.03C139.82,28.88 140.09,30.33 140.24,32.62C140.43,35.58 140.07,38.31 139.26,40.11C138.98,40.74 138.75,41.30 138.75,41.37C138.75,41.43 138.62,41.64 138.47,41.83C138.31,42.03 138.08,42.41 137.96,42.67C137.70,43.25 136.95,44.17 135.62,45.56C135.17,46.04 128.69,52.24 127.20,53.63C126.38,54.39 123.19,57.45 122.06,58.56C121.01,59.60 119.66,60.75 119.01,61.19C118.43,61.57 117.02,62.32 115.14,63.23C114.58,63.50 114.21,64.02 114.21,64.53C114.21,64.75 114.30,65.89 114.42,67.06C114.67,69.69 114.68,70.67 114.44,72.01C114.34,72.59 114.17,74.02 114.05,75.19C113.91,76.73 113.75,77.62 113.49,78.44C113.30,79.06 113.07,79.96 112.99,80.44C112.91,80.92 112.66,81.79 112.43,82.38C112.21,82.96 111.96,83.69 111.88,84.00C111.80,84.31 111.64,84.70 111.54,84.86C111.44,85.02 111.22,85.54 111.06,86.02C110.90,86.49 110.65,87.04 110.51,87.23C110.37,87.43 110.14,87.90 110.00,88.28C109.86,88.67 109.63,89.12 109.49,89.30C109.35,89.47 109.12,89.88 108.98,90.21C108.83,90.54 108.58,90.98 108.41,91.17C108.25,91.37 107.97,91.79 107.80,92.11C107.63,92.43 107.37,92.86 107.21,93.08C107.06,93.30 106.84,93.63 106.72,93.83C106.60,94.03 106.25,94.53 105.94,94.94C105.63,95.35 105.21,95.93 105.01,96.23C104.81,96.53 104.53,96.89 104.38,97.04C104.24,97.19 103.63,97.88 103.02,98.56C101.76,99.98 98.87,102.76 98.27,103.13C98.05,103.26 97.88,103.42 97.88,103.48C97.88,103.54 97.61,103.76 97.28,103.98C96.95,104.20 96.35,104.62 95.94,104.93C95.53,105.24 94.96,105.64 94.69,105.83C94.41,106.01 94.05,106.26 93.87,106.38C93.70,106.50 93.30,106.72 93.00,106.87C92.69,107.03 92.33,107.25 92.19,107.38C92.05,107.50 91.68,107.70 91.38,107.83C91.07,107.95 90.54,108.23 90.20,108.46C89.87,108.69 89.53,108.88 89.45,108.88C89.37,108.88 88.84,109.10 88.28,109.37C87.71,109.64 87.01,109.93 86.72,110.01C86.43,110.09 85.88,110.31 85.49,110.50C85.11,110.70 84.43,110.95 83.99,111.06C83.55,111.17 82.85,111.40 82.44,111.56C82.03,111.72 81.43,111.89 81.12,111.94C80.82,111.99 79.91,112.18 79.11,112.38C76.60,112.98 70.84,113.47 68.19,113.30ZM74.19,106.70C77.73,106.11 78.99,105.83 80.70,105.26C83.41,104.35 84.63,103.89 85.06,103.63C85.27,103.50 86.25,103.02 87.24,102.56C88.24,102.10 89.12,101.64 89.21,101.52C89.40,101.27 89.55,100.64 89.45,100.53C89.41,100.49 80.62,100.47 69.91,100.48C48.43,100.50 49.96,100.44 50.20,101.27C50.30,101.62 50.44,101.74 51.07,102.00C51.48,102.17 51.96,102.41 52.13,102.52C52.30,102.64 52.72,102.84 53.06,102.98C53.41,103.11 53.98,103.42 54.33,103.66C54.69,103.90 55.19,104.13 55.46,104.18C55.72,104.23 56.22,104.40 56.56,104.56C56.91,104.71 57.52,104.94 57.94,105.06C58.35,105.18 59.08,105.41 59.56,105.57C60.04,105.74 61.20,106.01 62.13,106.18C63.06,106.35 63.91,106.52 64.02,106.57C64.85,106.88 72.46,106.98 74.19,106.70ZM97.92,94.07C98.49,93.96 99.88,92.41 100.94,90.69C101.08,90.47 101.35,90.10 101.54,89.86C102.64,88.53 102.87,87.98 102.45,87.64C102.32,87.53 94.12,87.49 69.69,87.49C40.19,87.49 37.07,87.50 36.80,87.68C36.25,88.04 36.51,88.85 37.50,89.94C37.69,90.14 37.94,90.49 38.05,90.71C38.16,90.93 38.32,91.16 38.41,91.21C38.51,91.27 38.75,91.57 38.96,91.88C39.56,92.75 40.92,94.10 41.26,94.14C41.77,94.22 97.54,94.14 97.92,94.07ZM106.51,58.75C106.86,58.56 106.83,57.65 106.45,56.90C106.29,56.58 106.09,56.02 106.02,55.65C105.94,55.29 105.79,54.79 105.67,54.53C105.56,54.27 105.33,53.70 105.17,53.25C105.00,52.80 104.73,52.23 104.56,51.97C104.39,51.71 104.13,51.21 103.99,50.86C103.85,50.50 103.63,50.07 103.49,49.90C103.36,49.73 103.25,49.52 103.25,49.43C103.25,49.35 103.05,48.97 102.80,48.61C102.55,48.24 102.24,47.70 102.11,47.40C101.99,47.11 101.80,46.84 101.69,46.80C101.59,46.76 101.38,46.52 101.23,46.27C101.08,46.02 100.80,45.64 100.61,45.44C99.99,44.77 99.37,43.53 99.38,42.96C99.38,41.53 100.82,40.00 102.16,40.00C103.29,40.00 103.85,40.41 105.38,42.31C105.68,42.70 106.15,43.27 106.41,43.58C106.67,43.89 106.99,44.37 107.13,44.64C107.27,44.91 107.43,45.12 107.49,45.12C107.55,45.13 107.72,45.39 107.87,45.72C108.03,46.05 108.28,46.48 108.44,46.69C108.68,47.01 109.44,48.40 110.71,50.86C110.87,51.17 111.00,51.49 111.00,51.58C111.00,51.67 111.19,52.18 111.43,52.71C111.66,53.25 111.89,53.86 111.94,54.06C112.16,55.06 112.82,56.84 113.03,57.03C113.39,57.35 113.64,57.30 114.39,56.80C114.75,56.56 115.24,56.28 115.46,56.19C115.69,56.09 116.26,55.63 116.73,55.16C117.20,54.70 118.09,53.83 118.71,53.25C120.28,51.76 125.23,47.00 126.38,45.88C126.91,45.36 128.28,44.04 129.44,42.94C130.59,41.84 131.81,40.66 132.14,40.31C132.70,39.74 133.59,38.35 133.99,37.44C134.23,36.87 134.62,34.66 134.62,33.86C134.62,32.43 133.97,29.63 133.49,29.03C133.37,28.87 133.23,28.59 133.19,28.40C133.05,27.74 131.39,25.89 127.29,21.80C125.18,19.69 124.05,19.04 121.19,18.30C118.74,17.66 114.91,18.65 112.65,20.50C112.36,20.74 111.51,21.53 110.78,22.25C110.04,22.98 108.31,24.64 106.94,25.95C104.37,28.40 104.09,28.66 100.60,32.06C99.47,33.16 98.06,34.51 97.46,35.06C96.42,36.01 95.30,37.11 94.26,38.19C93.04,39.47 92.23,40.79 91.67,42.47C90.90,44.76 90.81,47.38 91.44,49.31C91.61,49.83 91.75,50.33 91.75,50.42C91.75,50.51 92.03,51.13 92.37,51.81C93.20,53.48 94.46,54.95 96.20,56.32C97.41,57.27 100.00,58.37 101.88,58.74C102.68,58.90 106.22,58.90 106.51,58.75Z'};let cardSocPaths=null;
function drawBrandStrip(g,x,y,maxW){
  if(!cardSocPaths)cardSocPaths={rays:new Path2D(CARD_SOC.rays),body:new Path2D(CARD_SOC.body)};
  const h=96,mark=58,padL=20,gapM=20,padR=26;
  const rows=[[['BULLBEARS NFT ON SOLANA','#f4f7ff'],['@BullBearsX','#9fe9ff']],[['POWERED BY SOLONCHAIN','#ffd56a'],['@solonchainx','#9fe9ff'],['SOLONCHAIN.IO','#f4f7ff']]];
  let fs=19,sep=26;const rowW=()=>rows.map(r=>r.reduce((w,[t])=>{g.font=`800 ${fs}px Orbitron,sans-serif`;return w+g.measureText(t).width;},0)+sep*(r.length-1));
  const mw=()=>padL+mark*148/134+gapM+Math.max(...rowW())+padR;
  while(mw()>maxW&&fs>13){fs-=.5;sep=fs*1.37;}
  const w=mw();g.save();
  const rr=(px,py,pw,ph,r)=>{g.beginPath();g.moveTo(px+r,py);g.arcTo(px+pw,py,px+pw,py+ph,r);g.arcTo(px+pw,py+ph,px,py+ph,r);g.arcTo(px,py+ph,px,py,r);g.arcTo(px,py,px+pw,py,r);g.closePath();};
  g.shadowColor='rgba(0,0,0,.45)';g.shadowBlur=18;g.shadowOffsetY=4;rr(x,y,w,h,18);
  const pf=g.createLinearGradient(0,y,0,y+h);pf.addColorStop(0,'rgba(14,16,32,.86)');pf.addColorStop(1,'rgba(5,6,13,.9)');g.fillStyle=pf;g.fill();
  g.shadowColor='transparent';g.shadowBlur=0;g.shadowOffsetY=0;g.lineWidth=1.5;g.strokeStyle='rgba(255,213,106,.6)';g.stroke();
  const mW=mark*148/134,mx=x+padL,my=y+(h-mark)/2;
  g.save();g.translate(mx,my);g.scale(mark/134,mark/134);g.fillStyle='#fed700';g.shadowColor='rgba(254,215,0,.45)';g.shadowBlur=14;g.fill(cardSocPaths.rays);g.fill(cardSocPaths.body,'evenodd');g.restore();
  const dx=mx+mW+gapM/2;g.fillStyle='rgba(255,255,255,.14)';g.fillRect(dx,y+18,1.5,h-36);
  g.textAlign='left';g.textBaseline='alphabetic';g.lineJoin='round';
  rows.forEach((r,i)=>{let tx=mx+mW+gapM;const ty=y+(i?72:41);r.forEach(([t,c],j)=>{g.font=`800 ${fs}px Orbitron,sans-serif`;g.lineWidth=3.5;g.strokeStyle='#05060d';g.strokeText(t,tx,ty);g.fillStyle=c;g.fillText(t,tx,ty);tx+=g.measureText(t).width;
    if(j<r.length-1){g.beginPath();g.arc(tx+sep/2,ty-fs*.36,2.4,0,Math.PI*2);g.fillStyle='rgba(255,213,106,.85)';g.fill();tx+=sep;}});});
  g.restore();return w;
}
function drawCard(g,score){
  // 1200x630 card from approved art only: NFT collection background, goggles runner, Solana coin.
  const bgi=score&&Number.isInteger(score.bg)?score.bg%7:Math.floor(sceneClock/17000)%7,bg=images['bg_'+backgrounds[bgi]]||images.bg_crystal_forest;
  const r=Math.max(1200/bg.width,630/bg.height);g.drawImage(bg,(1200-bg.width*r)/2,(630-bg.height*r)/2,bg.width*r,bg.height*r);
  let sh=g.createLinearGradient(0,0,1200,0);sh.addColorStop(0,'rgba(5,6,13,.86)');sh.addColorStop(.62,'rgba(5,6,13,.55)');sh.addColorStop(1,'rgba(5,6,13,.18)');g.fillStyle=sh;g.fillRect(0,0,1200,630);
  if(images.runner_goggles){const c=images.runner_goggles,h=520,w=h*c.width/c.height;g.save();g.shadowColor='rgba(255,213,106,.35)';g.shadowBlur=40;g.drawImage(c,930-w/2,624-h,w,h);g.restore();}
  g.textAlign='left';g.lineJoin='round';
  const title=(txt,x,y,size)=>{g.font=`${size}px 'Lilita One',sans-serif`;g.lineWidth=size*.12;g.strokeStyle='#080c16';g.strokeText(txt,x,y);const gr=g.createLinearGradient(0,y-size,0,y);gr.addColorStop(0,'#fff6d6');gr.addColorStop(.3,'#ffe7a3');gr.addColorStop(.62,'#ffd56a');gr.addColorStop(1,'#e0a020');g.fillStyle=gr;g.shadowColor='rgba(255,213,106,.4)';g.shadowBlur=24;g.fillText(txt,x,y);g.shadowBlur=0;};
  const label=(txt,x,y,size,color)=>{g.font=`800 ${size}px Orbitron,sans-serif`;g.lineWidth=5;g.strokeStyle='#080c16';g.strokeText(txt,x,y);g.fillStyle=color;g.fillText(txt,x,y);};
  title('BullBear Run',72,150,96);label('CHRISTMAS EDITION',80,196,26,'#ff4a5c');
  // Light snow over the card, same seeded flakes every time.
  {let sd=11;const rn=()=>(sd=(sd*16807)%2147483647)/2147483647;g.save();for(let i=0;i<120;i++){const x=rn()*1200,y=rn()*630,r=1+rn()*rn()*4;g.globalAlpha=.35+rn()*.5;g.fillStyle='#fff';g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();}g.restore();}
  if(score){label('SCORE',78,258,24,'#8ff0b4');g.font="900 112px Orbitron,sans-serif";g.lineWidth=9;g.strokeStyle='#080c16';g.strokeText(String(score.score),72,374);g.fillStyle='#ffd56a';g.shadowColor='rgba(255,213,106,.45)';g.shadowBlur=22;g.fillText(String(score.score),72,374);g.shadowBlur=0;
    label(`${score.distance}m   ·   ${score.coins} COINS   ·   COMBO x${score.combo}`,78,428,24,'#f4f7ff');
    drawBrandStrip(g,72,458,650);label('REMASTERED BY GALACTIC GAME LABZ',78,594,18,'#ffd84a');return;}
  else{label('DASH THROUGH THE SNOW, STACK THE SOLANA',78,250,24,'#6ee39a');if(images.coin){for(let i=0;i<5;i++)g.drawImage(images.coin,78+i*86,300,70,70);}
    label('3 LANES  ·  SOLONCHAIN PORTAL  ·  BEAR ZAP',78,440,22,'#f4f7ff');}
  label('REMASTERED BY GALACTIC GAME LABZ',78,560,18,'#ffd84a');
}
async function shareScore(){
  // Native share sheet with a score card, or a local PNG download. Never posts anything by itself.
  const text=`I scored ${Math.floor(s.score)} in BullBear Christmas Run. ${Math.floor(s.distance)}m and ${s.coins} Solana coins. Can you beat it?`;
  const c=document.createElement('canvas');c.width=1200;c.height=630;drawCard(c.getContext('2d'),{score:Math.floor(s.score),distance:Math.floor(s.distance),coins:s.coins,combo:s.maxCombo});
  const blob=await new Promise(r=>c.toBlob(r,'image/png'));if(!blob)return;
  const file=new File([blob],'BullBear-Christmas-Run-score.png',{type:'image/png'});
  const url=location.protocol==='https:'?location.href.split(/[?#]/)[0]:undefined;
  if(navigator.share&&navigator.canShare?.({files:[file]})){try{await navigator.share({title:'BullBear Christmas Run',text,...(url?{url}:{}),files:[file]});return;}catch(e){if(e.name==='AbortError')return;}}
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
    const paths={runner:'runner_sheet16.png',road:'road_tile.png',coin:'solana_coin.png',soc:'soc_coin.png',barrier:'ob_low_barrier.png',beam:'ob_overhead_beam.png',post:'ob_overhead_post.png',blocker:'ob_tall_blocker.png',pu_magnet:'pu_magnet.png',pu_boost:'pu_boost.png',pu_shield:'pu_shield.png',pu_double_coins:'pu_double_coins.png',pu_zap:'pu_zap.webp',light_beam:'light_beam.png',arrow_beam:'arrow_beam.png',arrow_barrier:'arrow_barrier.png',arrow_blk_left:'arrow_blk_left.png',arrow_blk_right:'arrow_blk_right.png',arrow_blk_both:'arrow_blk_both.png'};
    backgrounds.forEach(k=>paths['bg_'+k]='bg_'+k+'.webp');
    await Promise.all(Object.entries(paths).map(([k,v])=>load(k,'assets/'+v)));
    await Promise.all([load('runner_goggles','assets/runner_goggles.webp'),load('runner_slide','assets/runner_slide.webp')]);
    // Present blockers are optional: if a file is missing, that direction falls back to the original blocker art.
    await Promise.all(Object.entries(XMAS_BLOCKER).map(([d,f])=>load('blocker_'+d,'assets/'+f).catch(()=>console.warn('BullBear Christmas Run: '+f+' not found, using ob_tall_blocker.png'))));
    for(const k of ['coin','barrier','blocker','post','pu_magnet','pu_boost','pu_shield','pu_double_coins','pu_zap','arrow_blk_left','arrow_blk_right','arrow_blk_both'])trimBounds(k);
    setupPresentBlockers();
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
reset();updateAudioUI();$('ov-tag').textContent='Loading the sleigh road…';$('btn-play').disabled=true;
boot().then(()=>{$('btn-play').disabled=false;$('ov-tag').textContent='Jingle, dash and stack the Solana';});
requestAnimationFrame(t=>{lastFrame=t;requestAnimationFrame(frame);});
})();
