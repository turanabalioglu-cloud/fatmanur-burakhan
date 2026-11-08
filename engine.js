/* Davetiye müzik motoru: tarayıcıda üretilen, telifsiz parçalar. */
const Engine=(function(){
  let ctx,master,dry,noiseBuf,timer,next=0,step=0,cur=null;
  const mtof=m=>440*Math.pow(2,(m-69)/12);
  const TIMBRE={
    bell:{p:[[1,'sine',1],[2,'sine',.28],[3.01,'triangle',.07]],a:.008},
    piano:{p:[[1,'sine',1],[2,'sine',.45],[3,'sine',.16],[4,'sine',.06]],a:.004,body:true},
    harp:{p:[[1,'triangle',.85],[2,'sine',.22],[4,'sine',.04]],a:.002},
    bass:{p:[[1,'triangle',1],[2,'sine',.35]],a:.004,body:true,dry:true},
    vibe:{p:[[1,'sine',1],[4,'sine',.14],[2,'sine',.08]],a:.004}
  };
  function tone(m,t,vol,dec,w){
    const T=TIMBRE[w],g=ctx.createGain();g.connect(T.dry?dry:master);
    g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+T.a);
    if(T.body)g.gain.exponentialRampToValueAtTime(vol*.35,t+Math.min(.25,dec*.5));
    g.gain.exponentialRampToValueAtTime(0.0001,t+dec);
    const f=mtof(m);
    T.p.forEach(([k,type,a])=>{const o=ctx.createOscillator(),og=ctx.createGain();o.type=type;o.frequency.value=f*k;og.gain.value=a;o.connect(og).connect(g);o.start(t);o.stop(t+dec+.05)});
  }
  function hit(t,vol,dec,hp){
    const src=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();
    src.buffer=noiseBuf;f.type='highpass';f.frequency.value=hp;
    g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.0001,t+dec);
    src.connect(f).connect(g).connect(dry);src.start(t);src.stop(t+dec+.02);
  }
  const DEF={
    kutu:{E:.36,gen(s){
      const ch=[[53,57,60,65],[50,57,62,65],[46,53,58,62],[48,55,60,64]],ARP=[0,1,2,3,2,1,2,3];
      const mel=[[77,null,76,74],[74,null,72,69],[70,72,74,null],[72,null,null,null],[77,79,81,null],[81,79,77,74],[74,72,70,74],[72,null,null,null]];
      const bar=Math.floor(s/8)%8,b=s%8,c=ch[bar%4],out=[[c[ARP[b]],.05,1.8,'bell']];
      if(b%2===0){const m=mel[bar][b/2];if(m)out.push([m,.085,2.4,'bell'])}
      if(b===0)out.push([c[0]-12,.06,3,'bell']);return out}},
    kanon:{E:.3,gen(s){
      const bass=[38,45,47,42,43,38,43,45];
      const arp=[[62,66,69,74],[57,61,64,69],[59,62,66,71],[54,57,61,66],[55,59,62,67],[54,57,62,66],[55,59,62,67],[57,61,64,69]];
      const A=[78,76,74,73,71,69,71,73],B=[74,73,71,69,67,66,67,64],C=[74,78,81,79,78,74,78,76,74,71,74,69,67,71,69,67];
      const chord=Math.floor(s/4)%8,b=s%4,cyc=Math.floor(s/32)%4,out=[[arp[chord][b],.035,1.4,'harp']];
      if(b===0)out.push([bass[chord],.08,1.6,'piano']);
      if(cyc===0&&b===0)out.push([A[chord],.08,2.2,'bell']);
      if(cyc===1&&b===0)out.push([B[chord],.08,2.2,'bell']);
      if(cyc===2&&b%2===0)out.push([C[chord*2+b/2],.075,1.5,'bell']);
      if(cyc===3&&b===0){out.push([A[chord],.07,2.2,'bell']);out.push([B[chord],.05,2.2,'bell'])}
      return out}},
    vals:{E:.44,gen(s){
      const ch=[[41,[57,60,65]],[45,[57,60,64]],[46,[58,62,65]],[48,[58,60,64]],[41,[57,60,65]],[38,[57,62,65]],[43,[58,62,67]],[48,[55,60,64]]];
      const mel=[[72,null,77],[76,null,72],[74,null,70],[72,70,69],[69,null,74],[72,null,69],[70,69,67],[65,null,null]];
      const bar=Math.floor(s/3)%8,b=s%3,c=ch[bar],out=[];
      if(b===0)out.push([c[0],.11,1.6,'piano']);else c[1].forEach(m=>out.push([m,.03,.8,'piano']));
      const m=mel[bar][b];if(m)out.push([m,.1,b===0?2.2:1.4,'piano']);return out}},
    arp:{E:.2,gen(s){
      const roll=[[48,55,60,64,67,71,72,76],[45,52,57,60,64,67,69,72],[41,48,53,57,60,64,65,69],[43,50,55,59,62,64,67,71]];
      const top=[79,76,77,74];
      const ch=Math.floor(s/12)%4,b=s%12,out=[];
      if(b<8)out.push([roll[ch][b],.045-b*.003,2.4,'harp']);
      if(b===8)out.push([top[ch],.07,3,'bell']);
      if(b===0)out.push([roll[ch][0]-12,.07,3,'piano']);return out}},
    /* swing caz: 12 triplet steps per bar, walking bass, Charleston piano, ride + hi-hat, vibrafon melodi */
    caz:{E:.15,gen(s){
      const bass=[[41,45,48,37],[38,42,45,44],[43,46,50,49],[48,45,43,40],[41,45,48,47],[46,50,53,44],[43,46,50,49],[48,45,43,40]];
      const comp=[[57,60,64,67],[54,57,60,64],[58,62,65,69],[52,57,58,62],[57,60,64,67],[50,56,60,65],[58,62,65,69],[52,57,58,62]];
      const mel=[
        [[0,72],[3,76],[5,79],[6,81],[9,79]],
        [[0,78],[2,79],[3,78],[6,74],[9,72]],
        [[0,70],[3,74],[5,77],[6,81],[9,79],[11,77]],
        [[0,76],[3,72],[5,70],[6,67],[9,64]],
        [[0,72],[2,74],[3,76],[5,77],[6,79],[9,84]],
        [[0,82],[3,80],[5,77],[6,74],[9,72]],
        [[0,74],[2,77],[3,81],[6,79],[8,77],[9,74]],
        [[0,76],[3,77],[6,72]]];
      const bar=Math.floor(s/12)%8,b=s%12,out=[];
      if(b%3===0)out.push([bass[bar][b/3],.16,.5,'bass']);
      if(b===0||b===5)comp[bar].forEach(m=>out.push([m,.026,b===0?.55:.32,'piano']));
      if(b%3===0)out.push(['ride',.022,.38,6500]);
      if(b===5||b===11)out.push(['ride',.014,.22,6500]);
      if(b===3||b===9)out.push(['ride',.03,.05,8000]);
      mel[bar].forEach(([k,m])=>{if(k===b)out.push([m,.075,1.1,'vibe'])});
      return out}}
  };
  function schedule(){
    const d=DEF[cur];
    while(next<ctx.currentTime+.25){
      d.gen(step).forEach(n=>{if(n[0]==='ride')hit(next,n[1],n[2],n[3]);else tone(n[0],next,n[1],n[2],n[3])});
      next+=d.E;step++;
    }
  }
  function play(id){
    try{
      if(!ctx){ctx=new (window.AudioContext||window.webkitAudioContext)();
        master=ctx.createGain();dry=ctx.createGain();
        const dl=ctx.createDelay(),fb=ctx.createGain(),lp=ctx.createBiquadFilter();
        dl.delayTime.value=.27;fb.gain.value=.3;lp.type='lowpass';lp.frequency.value=2600;
        master.connect(dry);master.connect(dl);dl.connect(lp).connect(fb).connect(dl);lp.connect(dry);
        dry.connect(ctx.destination);dry.gain.value=.0001;
        noiseBuf=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);const ch=noiseBuf.getChannelData(0);for(let i=0;i<ch.length;i++)ch[i]=Math.random()*2-1;}
      ctx.resume();clearInterval(timer);
      dry.gain.cancelScheduledValues(ctx.currentTime);dry.gain.setValueAtTime(.0001,ctx.currentTime);dry.gain.linearRampToValueAtTime(.9,ctx.currentTime+.8);
      cur=id;step=0;next=ctx.currentTime+.15;timer=setInterval(schedule,60);schedule();
      return true;
    }catch(e){cur=null;return false}
  }
  function stop(){if(!ctx)return;clearInterval(timer);dry.gain.setTargetAtTime(.0001,ctx.currentTime,.15);cur=null}
  return{play,stop,get current(){return cur}};
})();
