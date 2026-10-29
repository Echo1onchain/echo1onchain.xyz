/* ECHO Botz mint banner bot. One of the chosen ECHO Botz peekers (Hammer Peeker, Magnifier Peek or Scan Drone, each in 1 of 4 colours) is picked at random on each load and peeks over the top edge of the "ECHO BOTZ MINT" banner (#mintCdPanel).
   Same behaviour as the home page card bots: with a mouse, head and eyes follow the cursor and a click gives a quick stronger look; taps turn it toward the tap. Every 6 to 12 s it looks up at the viewer. The Scan Drone glides sideways after the mouse, slowly, staying clear of the page title above.
   Decorative only: no pointer events, hidden from screen readers. Off screen: nothing runs. Reduced motion: eyes only, no idle animation.
   Preview hooks (harmless): ?mbb=hp|p2|p4 forces the bot, ?mbc=a-d forces the colour. */
(function(){
  var panel=document.getElementById("mintCdPanel");
  if(!panel||!panel.parentNode||document.getElementById("mint-bot")) return;
  var css='.mbw-anchor{position:relative; z-index:3; height:0; margin:0; padding:0; pointer-events:none}'+
  '.mbw{position:absolute; bottom:0; pointer-events:none; overflow:visible}'+
  '.mbw svg{display:block; width:100%; height:100%; overflow:visible}'+
  '.mbw.fb{right:40px; width:160px; height:80px; bottom:-20px}'+
  '.mbw.p2{right:50px; width:116px; height:74px; bottom:-18px}'+
  '.mbw.p4{right:68px; width:69px; height:81px; bottom:0}'+
  '@media (max-width:720px){.mbw-anchor{height:1.6rem}'+
    '.mbw.fb{right:62px; width:128px; height:64px; bottom:-16px}'+
    '.mbw.p2{right:70px; width:93px; height:59px; bottom:-14.4px}'+
    '.mbw.p4{right:58px; width:53px; height:62px}}'+
  '.mbw .bw-head{transform-box:view-box; transform-origin:var(--wo,0px 0px); transform:translate(var(--wx,0px),var(--wy,0px)) rotate(var(--wr,0deg)) scale(var(--ws,1))}'+
  '.mbw .bw-eyes{transform-box:fill-box; transform-origin:center; transform:translate(var(--ex,0px),var(--ey,0px)) scale(var(--eg,1)) scaleY(var(--es,1))}'+
  '.mbw .bw-blink{transform-box:fill-box; transform-origin:center; animation:mbwBlink 6.4s infinite; animation-delay:-1.4s}'+
  '.mbw .fb-bob, .mbw .p2-bob{animation:mbwBob 4.8s ease-in-out infinite}'+
  '.mbw .fb-ham{transform-box:view-box; transform-origin:48px -2px; animation:mbwHam 4.8s ease-in-out infinite}'+
  '.mbw .p4-hover{animation:mbwHover 4.2s ease-in-out infinite}'+
  '.mbw .p4-beam{animation:mbwBeam 4.2s ease-in-out infinite}'+
  '.mbw .p4-scan{animation:mbwScan 3.2s ease-in-out infinite}'+
  '.mbw.p4 svg{transform:translateX(var(--gx,0px))}'+
  '.mbw .p4-bank{transform-box:view-box; transform-origin:0px 0px; transform:rotate(var(--gb,0deg))}'+
  '@keyframes mbwBlink{0%,93%,100%{transform:scaleY(1)}95.5%{transform:scaleY(.12)}}'+
  '@keyframes mbwBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-1.6px)}}'+
  '@keyframes mbwHam{0%,100%{transform:rotate(0)}50%{transform:rotate(-4deg)}}'+
  '@keyframes mbwHover{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}'+
  '@keyframes mbwBeam{0%,100%{opacity:1}50%{opacity:.78}}'+
  '@keyframes mbwScan{0%,100%{transform:translateY(-14px); opacity:.2}50%{transform:translateY(12px); opacity:1}}'+
  '@media (prefers-reduced-motion: reduce){.mbw *{animation:none!important}}';
  var C={teal:{L:"#22E4F5",E:"#22E4F5",T:"#11203A",B:"#040812",A:"#FF2D9B"},pumpkin:{L:"#FF8A1E",E:"#FFB23F",T:"#2B1708",B:"#0B0603",A:"#B266FF"},
    ghost:{L:"#E2D4FF",E:"#F7F2FF",T:"#231E3E",B:"#080716",A:"#9B6BFF"},purple:{L:"#B266FF",E:"#FF4FB0",T:"#24103F",B:"#0A0418",A:"#22E4F5"},
    pink:{L:"#FF2D9B",E:"#FF6EC0",T:"#2E0B24",B:"#0B030A",A:"#22E4F5"},gold:{L:"#FFC93C",E:"#FFE27A",T:"#2A2108",B:"#0B0803",A:"#FF8A1E"}};
  var D={
    fb:{vb:"-66 -60 160 80",cols:["teal","pumpkin","ghost","purple"],ox:0,oy:-2,hx:5,hy:3.4,hr:12,ex:5,ey:3.6,lift:4.5,sc:.09,lr:5.5,t:'<defs><linearGradient id="fbMBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="%T%"/><stop offset="1" stop-color="%B%"/></linearGradient><filter id="fbMBf" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="1.8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="fbMBs" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="0" stdDeviation="2.4" flood-color="%L%" flood-opacity=".42"/></filter><clipPath id="fbMBc" clipPathUnits="userSpaceOnUse"><rect x="-300" y="-300" width="600" height="300.3"/></clipPath></defs><g filter="url(#fbMBs)"><g clip-path="url(#fbMBc)"><g class="bw-head"><rect x="-14" y="-14" width="28" height="34" rx="6" fill="url(#fbMBg)" stroke="%L%" stroke-opacity=".78" stroke-width="1.3"/><g class="fb-bob"><g transform="rotate(-6 0 -2)"><rect x="-36" y="-36" width="72" height="34" rx="17" fill="url(#fbMBg)" stroke="%L%" stroke-opacity=".78" stroke-width="1.3" /><rect x="-32.5" y="-32.5" width="65" height="27" rx="13.5" fill="none" stroke="%L%" stroke-opacity=".14"/><g class="bw-eyes"><g class="bw-blink"><circle cx="-15" cy="-17" r="6.5" fill="%E%" filter="url(#fbMBf)"/><circle cx="-17.08" cy="-19.21" r="1.82" fill="#fff" opacity=".75"/><circle cx="11" cy="-17" r="6.5" fill="%E%" filter="url(#fbMBf)"/><circle cx="8.92" cy="-19.21" r="1.82" fill="#fff" opacity=".75"/></g></g></g></g></g></g><g class="fb-ham"><g transform="translate(48 -2) rotate(30)"><path d="M0 0V-34" fill="none" stroke="%L%" stroke-opacity=".78" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><path d="M0 0V-34" fill="none" stroke="%T%" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M-15 -51C-15 -64 15 -64 15 -51" fill="none" stroke="%L%" stroke-opacity=".78" stroke-width="5.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M-15 -51C-15 -64 15 -64 15 -51" fill="none" stroke="%T%" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><rect x="-14" y="-49" width="28" height="14" rx="5" fill="url(#fbMBg)" stroke="%L%" stroke-opacity=".78" stroke-width="1.3"/><path d="M-8 -42h16" stroke="%L%" stroke-opacity=".35" stroke-linecap="round"/><rect x="-20" y="-51" width="8" height="18" rx="3.5" fill="url(#fbMBg)" stroke="%L%" stroke-opacity=".78" stroke-width="1.3"/><rect x="12" y="-51" width="8" height="18" rx="3.5" fill="url(#fbMBg)" stroke="%L%" stroke-opacity=".78" stroke-width="1.3"/><circle cx="-16" cy="-42" r="2.2" fill="%A%" filter="url(#fbMBf)"/><circle cx="16" cy="-42" r="2.2" fill="%A%" filter="url(#fbMBf)"/></g></g><rect x="-63" y="-12" width="26" height="14" rx="7" fill="url(#fbMBg)" stroke="%L%" stroke-opacity=".78" stroke-width="1.3"/><rect x="-60.5" y="-5" width="7" height="13" rx="3.5" fill="url(#fbMBg)" stroke="%L%" stroke-opacity=".78" stroke-width="1.3"/><rect x="-53.5" y="-5" width="7" height="13" rx="3.5" fill="url(#fbMBg)" stroke="%L%" stroke-opacity=".78" stroke-width="1.3"/><rect x="-46.5" y="-5" width="7" height="13" rx="3.5" fill="url(#fbMBg)" stroke="%L%" stroke-opacity=".78" stroke-width="1.3"/><path d="M-59 2h4M-52 2h4M-45 2h4" stroke="%L%" stroke-opacity=".4" stroke-linecap="round"/><rect x="35" y="-12" width="26" height="14" rx="7" fill="url(#fbMBg)" stroke="%L%" stroke-opacity=".78" stroke-width="1.3"/><rect x="37.5" y="-5" width="7" height="13" rx="3.5" fill="url(#fbMBg)" stroke="%L%" stroke-opacity=".78" stroke-width="1.3"/><rect x="44.5" y="-5" width="7" height="13" rx="3.5" fill="url(#fbMBg)" stroke="%L%" stroke-opacity=".78" stroke-width="1.3"/><rect x="51.5" y="-5" width="7" height="13" rx="3.5" fill="url(#fbMBg)" stroke="%L%" stroke-opacity=".78" stroke-width="1.3"/><path d="M39 2h4M46 2h4M53 2h4" stroke="%L%" stroke-opacity=".4" stroke-linecap="round"/></g>'},
    p2:{vb:"-60 -56 116 74",cols:["pink","teal","gold","ghost"],ox:0,oy:0,hx:5.5,hy:3,hr:10,ex:4,ey:2.4,lift:4,sc:.08,lr:0,t:'<defs><linearGradient id="p2MBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="%T%"/><stop offset="1" stop-color="%B%"/></linearGradient><filter id="p2MBf" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="1.8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="p2MBs" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="0" stdDeviation="2.4" flood-color="%L%" flood-opacity=".42"/></filter><clipPath id="p2MBc" clipPathUnits="userSpaceOnUse"><rect x="-300" y="-300" width="600" height="300.3"/></clipPath></defs><g filter="url(#p2MBs)"><g clip-path="url(#p2MBc)"><g class="bw-head"><g class="p2-bob"><path d="M0 -40V-47" stroke="%L%" stroke-opacity=".85" stroke-width="1.8"/><circle cx="0" cy="-49" r="3.4" fill="%A%" filter="url(#p2MBf)"/><path d="M-31 16V-14A31 26 0 0 1 31 -14V16Z" fill="url(#p2MBg)" stroke="%L%" stroke-opacity=".78" stroke-width="1.3"/><path d="M-24 -30A26 20 0 0 1 -8 -38" fill="none" stroke="%L%" stroke-opacity=".25" stroke-linecap="round"/><rect x="-25" y="-27" width="50" height="16" rx="8" fill="rgba(2,4,12,.9)" stroke="%L%" stroke-opacity=".4"/><path class="p2-hd" d="M24 -10L39 1" fill="none" stroke="%L%" stroke-opacity=".78" stroke-width="6.6" stroke-linecap="round" stroke-linejoin="round"/><path class="p2-hd" d="M24 -10L39 1" fill="none" stroke="%T%" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="13" cy="-20" r="13.5" fill="%E%" fill-opacity=".1"/><g class="bw-eyes"><g class="bw-blink"><circle cx="-11" cy="-19" r="4.8" fill="%E%" filter="url(#p2MBf)"/><circle cx="-12.536" cy="-20.632" r="1.34" fill="#fff" opacity=".75"/><circle cx="12" cy="-19" r="8.5" fill="%E%" filter="url(#p2MBf)"/><circle cx="9.28" cy="-21.89" r="2.38" fill="#fff" opacity=".75"/></g></g><circle cx="13" cy="-20" r="13.5" fill="none" stroke="%L%" stroke-width="3.6"/><circle cx="13" cy="-20" r="13.5" fill="none" stroke="%T%" stroke-width="1.4"/><path d="M4 -27A11 11 0 0 1 11 -31" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1.6" stroke-linecap="round"/></g></g></g><rect x="-53" y="-11" width="26" height="14" rx="7" fill="url(#p2MBg)" stroke="%L%" stroke-opacity=".78" stroke-width="1.3"/><rect x="-50.5" y="-4" width="7" height="13" rx="3.5" fill="url(#p2MBg)" stroke="%L%" stroke-opacity=".78" stroke-width="1.3"/><rect x="-43.5" y="-4" width="7" height="13" rx="3.5" fill="url(#p2MBg)" stroke="%L%" stroke-opacity=".78" stroke-width="1.3"/><rect x="-36.5" y="-4" width="7" height="13" rx="3.5" fill="url(#p2MBg)" stroke="%L%" stroke-opacity=".78" stroke-width="1.3"/><path d="M-49 3h4M-42 3h4M-35 3h4" stroke="%L%" stroke-opacity=".4" stroke-linecap="round"/><rect x="27" y="-11" width="26" height="14" rx="7" fill="url(#p2MBg)" stroke="%L%" stroke-opacity=".78" stroke-width="1.3"/><rect x="29.5" y="-4" width="7" height="13" rx="3.5" fill="url(#p2MBg)" stroke="%L%" stroke-opacity=".78" stroke-width="1.3"/><rect x="36.5" y="-4" width="7" height="13" rx="3.5" fill="url(#p2MBg)" stroke="%L%" stroke-opacity=".78" stroke-width="1.3"/><rect x="43.5" y="-4" width="7" height="13" rx="3.5" fill="url(#p2MBg)" stroke="%L%" stroke-opacity=".78" stroke-width="1.3"/><path d="M31 3h4M38 3h4M45 3h4" stroke="%L%" stroke-opacity=".4" stroke-linecap="round"/></g>'},
    p4:{vb:"-48 -46 96 112",cols:["ghost","teal","pink","gold"],ox:0,oy:0,hx:7,hy:4,hr:14,ex:5.5,ey:4.5,lift:5,sc:.08,lr:0,t:'<defs><linearGradient id="p4MBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="%T%"/><stop offset="1" stop-color="%B%"/></linearGradient><filter id="p4MBf" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="1.8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="p4MBs" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="0" stdDeviation="2.4" flood-color="%L%" flood-opacity=".42"/></filter><clipPath id="p4MBc" clipPathUnits="userSpaceOnUse"><rect x="-300" y="-300" width="600" height="366"/></clipPath></defs><defs><linearGradient id="p4MBbeam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="%E%" stop-opacity=".42"/><stop offset=".77" stop-color="%E%" stop-opacity="0"/></linearGradient></defs><g clip-path="url(#p4MBc)"><g class="p4-bank"><g class="p4-hover"><g class="bw-head"><g class="p4-beam"><path d="M-6 18L6 18L44.75 80L-44.75 80Z" fill="url(#p4MBbeam)"/><path class="p4-scan" d="M-26 50H26" stroke="%E%" stroke-opacity=".55" stroke-width="1.4" filter="url(#p4MBf)"/></g><g filter="url(#p4MBs)"><path d="M0 -18V-32" stroke="%L%" stroke-opacity=".85" stroke-width="2.4"/><ellipse class="p4-rotor" cx="0" cy="-33" rx="28" ry="3.6" fill="url(#p4MBg)" stroke="%L%" stroke-opacity=".78" stroke-width="1.3"/><circle cx="0" cy="-33" r="3" fill="%A%"/><rect x="-44" y="-6" width="12" height="18" rx="5" fill="url(#p4MBg)" stroke="%L%" stroke-opacity=".78" stroke-width="1.3"/><rect x="32" y="-6" width="12" height="18" rx="5" fill="url(#p4MBg)" stroke="%L%" stroke-opacity=".78" stroke-width="1.3"/><path d="M-41 13H-35M35 13H41" stroke="%A%" stroke-width="2.4" stroke-linecap="round" filter="url(#p4MBf)"/><path d="M-33 3H-28M28 3H33" stroke="%L%" stroke-width="3"/><rect x="-30" y="-18" width="60" height="34" rx="17" fill="url(#p4MBg)" stroke="%L%" stroke-opacity=".78" stroke-width="1.3" /><rect x="-26.5" y="-14.5" width="53" height="27" rx="13.5" fill="none" stroke="%L%" stroke-opacity=".14"/><g class="bw-eyes"><g class="bw-blink"><circle cx="-11" cy="-1" r="6" fill="%E%" filter="url(#p4MBf)"/><circle cx="-12.92" cy="-3.04" r="1.68" fill="#fff" opacity=".75"/><circle cx="11" cy="-1" r="6" fill="%E%" filter="url(#p4MBf)"/><circle cx="9.08" cy="-3.04" r="1.68" fill="#fff" opacity=".75"/></g></g><rect x="-8" y="15" width="16" height="6" rx="3" fill="url(#p4MBg)" stroke="%L%" stroke-opacity=".78" stroke-width="1.3"/><circle cx="0" cy="19.5" r="2.4" fill="%E%" filter="url(#p4MBf)"/></g></g></g></g></g>'}
  };
  var q=location.search;
  function opt(n){var m=new RegExp("[?&]"+n+"=([a-z0-9]+)").exec(q);return m?m[1]:""}
  function z(){return {x:0,y:0,r:0,ds:0,ex:0,ey:0,eg:0}}
  function pick(v,n){var i="abcd".indexOf(v);return i>=0&&i<n?i:Math.floor(Math.random()*n)}
  var key={hp:"fb",p2:"p2",p4:"p4"}[opt("mbb")]||["fb","p2","p4"][Math.floor(Math.random()*3)];
  var d=D[key],ci=pick(opt("mbc"),4),c=C[d.cols[ci]];
  var st=document.createElement("style"); st.id="mint-bot-css"; st.textContent=css; document.head.appendChild(st);
  var anchor=document.createElement("div"); anchor.className="mbw-anchor"; anchor.setAttribute("aria-hidden","true");
  var host=document.createElement("div"); host.id="mint-bot"; host.className="mbw "+key; host.setAttribute("aria-hidden","true");
  host.setAttribute("data-bot",key==="fb"?"hp":key); host.setAttribute("data-color","abcd".charAt(ci));
  host.style.setProperty("--wo",d.ox+"px "+d.oy+"px");
  host.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="'+d.vb+'" focusable="false">'+
    d.t.replace(/%L%/g,c.L).replace(/%E%/g,c.E).replace(/%T%/g,c.T).replace(/%B%/g,c.B).replace(/%A%/g,c.A)+'</svg>';
  anchor.appendChild(host); panel.parentNode.insertBefore(anchor,panel);
  var b={host:host,d:d,head:host.querySelector(".bw-head"),hd:host.querySelectorAll(".p2-hd"),cur:z(),tgt:z(),vis:true,home:null,look:false,lt0:0,lend:0,lt:0,
    glide:key==="p4",gx:0,gv:0,gt:0,gb:0,gmin:0,gmax:0,gc:0,gf:1};
  var bots=[b];

  var mq=window.matchMedia("(prefers-reduced-motion: reduce)"), hov=window.matchMedia("(hover: hover) and (pointer: fine)");
  var raf=0,last=0,following=false,still=0,kick=0,mx=0,my=0,tapT=0,tapping=false,tx=0,ty=0;
  function now(){return performance.now()}
  function cl(v,a,b){return v<a?a:v>b?b:v}
  function aim(x,y,cx,cy){
    var nx=cl((x-cx)/Math.max(innerWidth*.42,160),-1,1), ny=cl((y-cy)/Math.max(innerHeight*.3,160),-1,1);
    if(ny>0) ny=Math.min(ny,.6); return [nx,ny];
  }
  function measure(b){var r=(b.head||b.host).getBoundingClientRect();b.home={x:r.left+r.width/2+scrollX,y:r.top+r.height/2+scrollY}; if(b.glide) range(b)}
  var SKIP="defs,clipPath,mask,pattern,symbol,filter,linearGradient,radialGradient";
  function range(b){ /* Scan Drone glide range: along the banner's top edge, on screen, clear of any title art above that reaches down into its flight band */
    var h=b.host,cr=panel.getBoundingClientRect(),hr=h.getBoundingClientRect(),half=hr.width/2,top=hr.top-6,
      L=Math.max(cr.left+half+12,half+8),R=Math.min(cr.right-half-12,innerWidth-half-8),gc=hr.left+half,e=anchor.previousElementSibling,n=0;
    while(e&&n<3){
      var er=e.getBoundingClientRect();
      if(er.bottom>top&&er.top<cr.top&&er.height>0){
        var els=[e].concat([].slice.call(e.querySelectorAll("text,path,circle,ellipse,rect,polygon,polyline,line,image,img,use,canvas,span,b,i,p,h1,h2,a")));
        for(var k=0;k<els.length;k++){
          var el=els[k]; if(el.closest&&el.closest(SKIP)) continue; if(el===e&&e.children.length) continue;
          var r=el.getBoundingClientRect(); if(r.width<1||r.height<1||r.width>cr.width*.9) continue;
          if(r.bottom<=top||r.top>=cr.top||r.right<L-half||r.left>R+half) continue;
          var cs=getComputedStyle(el); if(cs.visibility==="hidden"||cs.display==="none"||+cs.opacity===0) continue;
          if(r.left+r.width/2<gc) L=Math.max(L,r.right+12+half); else R=Math.min(R,r.left-12-half);
        }
      }
      e=e.previousElementSibling; n++;
    }
    b.gc=gc; b.gf=(hr.width/h.offsetWidth)||1; b.gmin=Math.min(0,L-gc); b.gmax=Math.max(0,R-gc);
  }
  function target(b,x,y,k){
    if(!b.home) measure(b);
    if(b.glide) b.gt=mq.matches?0:cl(x-b.gc,b.gmin,b.gmax);
    if(b.look) return;
    var n=aim(x,y,b.home.x-scrollX,b.home.y-scrollY),nx=n[0],ny=n[1],m=mq.matches?0:1,d=b.d,t=b.tgt;
    t.ex=cl(nx*d.ex*k,-d.ex*1.3,d.ex*1.3); t.ey=cl(ny*d.ey*k,-d.ey*1.3,d.ey*1.3);
    t.x=m*nx*d.hx*k; t.y=m*ny*d.hy*k; t.r=m*nx*d.hr*k; t.ds=0; t.eg=0;
  }
  function rest(b){b.gt=0; if(b.look)return; for(var k in b.tgt)b.tgt[k]=0}
  function home0(){bots.forEach(rest)}
  function resume(b){if(following) target(b,mx,my,1); else if(tapping){measure(b);target(b,tx,ty,1)} else rest(b)}
  function hand(b,c){ /* Magnifier Peek: keep the handle end in the hand while the head moves */
    if(!b.hd.length) return;
    var d=b.d,s=1+c.ds,a=-c.r*Math.PI/180,qx=39-d.ox-c.x,qy=1-d.oy-c.y,
      lx=d.ox+(qx*Math.cos(a)-qy*Math.sin(a))/s, ly=d.oy+(qx*Math.sin(a)+qy*Math.cos(a))/s,
      p="M24 -10L"+lx.toFixed(2)+" "+ly.toFixed(2);
    for(var i=0;i<b.hd.length;i++) b.hd[i].setAttribute("d",p);
  }
  function write(b,es){var s=b.host.style,c=b.cur;
    s.setProperty("--wx",c.x.toFixed(2)+"px");s.setProperty("--wy",c.y.toFixed(2)+"px");s.setProperty("--wr",c.r.toFixed(2)+"deg");
    s.setProperty("--ws",(1+c.ds).toFixed(4));s.setProperty("--ex",c.ex.toFixed(2)+"px");s.setProperty("--ey",c.ey.toFixed(2)+"px");
    s.setProperty("--es",es.toFixed(3)); s.setProperty("--eg",(1+c.eg).toFixed(4)); hand(b,c);
    if(b.glide){s.setProperty("--gx",(b.gx/b.gf).toFixed(2)+"px");s.setProperty("--gb",b.gb.toFixed(2)+"deg")}}
  function clear(b){["--wx","--wy","--wr","--ws","--ex","--ey","--es","--eg","--gx","--gb"].forEach(function(k){b.host.style.removeProperty(k)});for(var k in b.cur)b.cur[k]=b.tgt[k]=0; b.gx=b.gv=b.gt=b.gb=0;
    for(var i=0;i<b.hd.length;i++) b.hd[i].setAttribute("d","M24 -10L39 1")}
  function blink(b,t){if(!b.look||mq.matches) return 1; var p=(t-b.lt0-480)/220; return p>0&&p<1?1-.86*Math.sin(Math.PI*p):1}
  function frame(){
    raf=0; var t=now(), dt=last?Math.min(t-last,64):16; last=t;
    if(kick>0){kick=Math.max(0,kick-dt/450); if(following) bots.forEach(function(b){target(b,mx,my,1+.3*kick)})}
    var done=true, looking=false;
    bots.forEach(function(b){
      if(!b.vis) return;
      if(b.look) looking=true;
      var a=1-Math.exp(-dt/(b.look||t-b.lend<700?230:kick>0?70:(following||tapping)?140:200));
      for(var k in b.cur){var d=b.tgt[k]-b.cur[k]; b.cur[k]+=d*a; if(Math.abs(d)>(k==="ds"||k==="eg"?.0005:.02)) done=false; else if(Math.abs(d)<1e-3) b.cur[k]=b.tgt[k]}
      if(b.glide){ /* slow critically damped spring: about 1.3 s to catch up, banks into the direction of travel */
        var w=3.6,s=dt/1000; b.gv+=(w*w*(b.gt-b.gx)-2*w*b.gv)*s; b.gx+=b.gv*s; b.gb+=(cl(b.gv*.018,-6,6)-b.gb)*(1-Math.exp(-dt/220));
        if(Math.abs(b.gt-b.gx)>.3||Math.abs(b.gv)>1||Math.abs(b.gb)>.05) done=false; else {b.gx=b.gt;b.gv=0;b.gb=0}
      }
      write(b,blink(b,t));
    });
    if(looking) done=false;
    if(done&&!following&&!tapping){bots.forEach(clear);last=0;return}
    if(done&&kick===0){last=0;return}
    raf=requestAnimationFrame(frame);
  }
  function go(){if(!raf){last=0;raf=requestAnimationFrame(frame)}}
  function sched(b,ms){clearTimeout(b.lt);b.lt=setTimeout(function(){startLook(b)},ms)}
  function startLook(b){ /* look up at the viewer */
    var t=now();
    if(!b.vis||document.hidden){sched(b,2500+Math.random()*2500);return}
    var d=b.d,m=mq.matches?0:1,g=b.tgt;
    b.look=true; b.lt0=t;
    g.x=0; g.r=m*d.lr; g.ex=0; g.ey=0; g.y=-m*d.lift; g.ds=m*d.sc; g.eg=m*.14;
    go();
    clearTimeout(b.lt); b.lt=setTimeout(function(){endLook(b)},1600+Math.random()*400);
  }
  function endLook(b){if(!b.look) return; b.look=false; b.lend=now(); resume(b); go(); sched(b,6000+Math.random()*6000)}
  sched(b,2500+Math.random()*3500);

  function stopFollow(){following=false;clearTimeout(still);home0();go()}
  function anyVis(){return bots.some(function(b){return b.vis})}
  function move(e){
    if(e.pointerType!=="mouse"||!hov.matches||!anyVis()) return;
    mx=e.clientX; my=e.clientY;
    if(!following){following=true;tapping=false;clearTimeout(tapT);bots.forEach(measure)}
    bots.forEach(function(b){target(b,mx,my,1+.3*kick)}); go();
    clearTimeout(still); still=setTimeout(stopFollow,3000);
  }
  document.addEventListener("pointermove",move,{passive:true});
  document.addEventListener("pointerdown",function(e){
    bots.forEach(function(b){if(b.look) endLook(b)}); /* a click or tap wins over a look-up */
    if(e.pointerType==="mouse"&&hov.matches){if(!anyVis())return; move(e); kick=1; bots.forEach(function(b){target(b,mx,my,1.3)}); go(); return}
    if(following){clearTimeout(still);following=false}
    if(!anyVis()) return;
    tapping=true; tx=e.clientX; ty=e.clientY; bots.forEach(function(b){measure(b);target(b,tx,ty,1)}); go();
    clearTimeout(tapT); tapT=setTimeout(function(){tapping=false;home0();go()},2100);
  },{passive:true});
  document.documentElement.addEventListener("mouseleave",function(){if(following)stopFollow()},{passive:true});
  window.addEventListener("blur",function(){if(following)stopFollow()});
  window.addEventListener("resize",function(){bots.forEach(function(b){b.home=null})},{passive:true});
  window.addEventListener("scroll",function(){if(!following)bots.forEach(function(b){b.home=null})},{passive:true});
  if("IntersectionObserver" in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(en){bots.forEach(function(b){if(b.host===en.target){b.vis=en.isIntersecting; if(!b.vis){if(b.look){b.look=false;b.lend=now();sched(b,6000+Math.random()*6000)} clear(b)}}})})});
    bots.forEach(function(b){io.observe(b.host)});
  }
})();
