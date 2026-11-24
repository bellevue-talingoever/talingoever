window.setupHeroLoop = function(first, container, toggle) {
  const files=['zomertaling-waterzijde.mp4','a-hoek-impressie.mp4','zomertaling-hero-nieuw.mp4','zomertaling-hero-extra.mp4'];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const second=first.cloneNode(false);
  second.removeAttribute('autoplay');second.removeAttribute('src');second.removeAttribute('poster');
  second.setAttribute('aria-hidden','true');container.insertBefore(second,first.nextSibling);
  container.classList.add('zt-loop');
  const players=[first,second];let active=0,index=0,switching=false,wantsPlay=!reduced;
  const next=document.createElement('button');next.type='button';next.className='zt-video-next';next.dataset.videoNext='';container.append(next);
  const label=()=>{toggle.textContent=wantsPlay?'Video pauzeren':'Video afspelen';next.textContent=`Volgende video · ${index+1}/${files.length}`;next.setAttribute('aria-label',`Volgende achtergrondvideo, nu video ${index+1} van ${files.length}`);};
  players.forEach((v,i)=>{v.muted=true;v.loop=false;v.autoplay=false;v.preload='auto';v.style.opacity=i?'0':'1';});
  const prepare=(v,i)=>{v.src='./'+files[i];v.load();};
  prepare(second,1);
  const ready=v=>v.readyState>=2?Promise.resolve():new Promise((resolve,reject)=>{
    const done=()=>{clearTimeout(timer);v.removeEventListener('loadeddata',done);v.removeEventListener('error',fail);resolve();};
    const fail=()=>{clearTimeout(timer);v.removeEventListener('loadeddata',done);v.removeEventListener('error',fail);reject();};
    const timer=setTimeout(fail,15000);v.addEventListener('loadeddata',done);v.addEventListener('error',fail);
  });
  async function advance(){
    if(switching||!container.isConnected)return;
    switching=true;next.disabled=true;
    const old=players[active],incoming=players[1-active];
    try{
      await ready(incoming);if(!container.isConnected)return;
      incoming.currentTime=0;
      if(wantsPlay)await incoming.play();
      incoming.style.zIndex='1';old.style.zIndex='0';incoming.style.opacity='1';
      await new Promise(resolve=>setTimeout(resolve,reduced?0:850));
      old.pause();old.style.opacity='0';active=1-active;index=(index+1)%files.length;
      prepare(old,(index+1)%files.length);label();
    }catch{wantsPlay=false;players.forEach(v=>v.pause());label();}
    finally{switching=false;next.disabled=false;}
  }
  players.forEach(v=>{
    v.addEventListener('timeupdate',()=>{if(v===players[active]&&wantsPlay&&v.duration-v.currentTime<=.85)advance();});
    v.addEventListener('ended',()=>{if(v===players[active]&&wantsPlay)advance();});
  });
  first.heroController={
    next:advance,
    toggle(){wantsPlay=!wantsPlay;if(wantsPlay)players[active].play().catch(()=>{wantsPlay=false;label();});else players.forEach(v=>v.pause());label();}
  };
  if(wantsPlay)first.play().catch(()=>{wantsPlay=false;label();});
  label();
};
