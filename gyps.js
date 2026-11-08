/* Gelin çiçeği (gypsophila) çelengi: mührün etrafında asimetrik hilal. */
function gypsWreath(seed,opt){
  opt=opt||{};
  let a=seed|0;const r=()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
  const stem=opt.stem||'#A9A37A',petal=opt.petal||'#FDFAF2',edge=opt.edge||'#CFC5A2',eye=opt.eye||'#D9CC9C',leaf=opt.leaf||'#B7B28A';
  const RX=54,RY=68;let stems='',flowers='',leaves='';
  function flower(x,y,s){
    flowers+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${s.toFixed(2)}" fill="${petal}" stroke="${edge}" stroke-width=".55"/>`;
    if(s>2.4)flowers+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(s*.32).toFixed(2)}" fill="${eye}"/>`;
  }
  function spray(angDeg,len){
    const A=angDeg*Math.PI/180,x0=RX*.92*Math.cos(A),y0=RY*.92*Math.sin(A);
    const bend=(r()-.5)*.6,dir=A+bend*.3;
    const x1=x0+Math.cos(dir)*len,y1=y0+Math.sin(dir)*len;
    const cx=(x0+x1)/2+Math.cos(dir+Math.PI/2)*len*bend*.5,cy=(y0+y1)/2+Math.sin(dir+Math.PI/2)*len*bend*.5;
    stems+=`<path d="M${x0.toFixed(1)} ${y0.toFixed(1)}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}" stroke="${stem}" stroke-width=".9" fill="none" stroke-linecap="round"/>`;
    const n=4+Math.floor(r()*3);
    for(let k=0;k<n;k++){
      const t=.35+.65*(k/(n-1||1)),q=(u,p0,p1,p2)=>(1-u)*(1-u)*p0+2*(1-u)*u*p1+u*u*p2;
      const bx=q(t,x0,cx,x1),by=q(t,y0,cy,y1);
      const side=(k%2?1:-1),ba=dir+side*(.5+r()*.5),bl=len*(.18+r()*.2);
      const ex=bx+Math.cos(ba)*bl,ey=by+Math.sin(ba)*bl;
      stems+=`<path d="M${bx.toFixed(1)} ${by.toFixed(1)}L${ex.toFixed(1)} ${ey.toFixed(1)}" stroke="${stem}" stroke-width=".55" fill="none"/>`;
      const m=3+Math.floor(r()*4);
      for(let j=0;j<m;j++){
        const fa=ba+(r()-.5)*2.2,fl=3+r()*7,fx=ex+Math.cos(fa)*fl,fy=ey+Math.sin(fa)*fl;
        stems+=`<path d="M${ex.toFixed(1)} ${ey.toFixed(1)}L${fx.toFixed(1)} ${fy.toFixed(1)}" stroke="${stem}" stroke-width=".4"/>`;
        flower(fx,fy,1.7+r()*1.9);
      }
    }
    for(let j=0;j<5;j++){const fa=dir+(r()-.5)*1.6,fl=4+r()*8;flower(x1+Math.cos(fa)*fl,y1+Math.sin(fa)*fl,2+r()*1.8)}
    if(r()<.55){const lt=.3+r()*.3,lx=x0+(x1-x0)*lt,ly=y0+(y1-y0)*lt,la=(dir+(r()<.5?.7:-.7))*180/Math.PI,L=11+r()*5;
      leaves+=`<g transform="translate(${lx.toFixed(1)} ${ly.toFixed(1)}) rotate(${la.toFixed(0)})"><path d="M0 0Q${L/2} ${-L*.22} ${L} 0Q${L/2} ${L*.22} 0 0Z" fill="${leaf}"/></g>`}
  }
  [[118,58],[140,66],[160,60],[182,48],[204,38],[100,40],[300,40],[322,58],[342,62],[4,50],[24,36]].forEach(([g,l])=>spray(g+(r()-.5)*8,l*(.85+r()*.3)));
  return `<g>${leaves}${stems}</g><g>${flowers}</g>`;
}
