// Usage: node tools/trace-silhouette.cjs <in.bgr 1000x1000 BGR> <out contour.json>  (see HANDOFF.md)
const fs=require('fs');const N=1000;const b=fs.readFileSync(process.argv[2]||'cover1000.bgr');
const C=new Float32Array(N*N*3);
for(let y=0;y<N;y++)for(let x=0;x<N;x++){let s=[0,0,0],n=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=Math.min(N-1,Math.max(0,x+dx)),yy=Math.min(N-1,Math.max(0,y+dy));const i=(yy*N+xx)*3;s[0]+=b[i+2];s[1]+=b[i+1];s[2]+=b[i];n++;}const o=(y*N+x)*3;C[o]=s[0]/n;C[o+1]=s[1]/n;C[o+2]=s[2]/n;}
const samp=(x,y)=>{x=Math.min(N-2,Math.max(0,x));y=Math.min(N-2,Math.max(0,y));const x0=Math.floor(x),y0=Math.floor(y),fx=x-x0,fy=y-y0;const r=[0,0,0];for(let k=0;k<3;k++){const a=C[(y0*N+x0)*3+k],bb=C[(y0*N+x0+1)*3+k],c=C[((y0+1)*N+x0)*3+k],d=C[((y0+1)*N+x0+1)*3+k];r[k]=(a*(1-fx)+bb*fx)*(1-fy)+(c*(1-fx)+d*fx)*fy;}return r;};
const feat=(c)=>[(c[0]+c[1]+c[2])/3,(c[2]-c[0])*2.5,(c[1]-c[0])*2.5];
const cx=500,cy=560,A=1440,delta=3;
const raw=[];
for(let a=0;a<A;a++){const th=a/A*2*Math.PI;const dx=Math.cos(th),dy=Math.sin(th);const deg=a/A*360;
 const top=deg>232&&deg<308; // rim sector (y up)
 const rmin=top?300:230,rmax=top?410:420;
 const gs=[];let bestG=0;
 for(let r=rmin;r<=rmax;r++){const p=feat(samp(cx+dx*(r-delta),cy+dy*(r-delta))),q=feat(samp(cx+dx*(r+delta),cy+dy*(r+delta)));const g=Math.hypot(p[0]-q[0],p[1]-q[1],p[2]-q[2]);gs.push([r,g]);bestG=Math.max(bestG,g);}
 const thr=top?Math.max(22,0.2*bestG):0.55*bestG;
 let pick=null;for(let k=gs.length-2;k>0;k--){const [r,g]=gs[k];if(g>=thr&&g>=gs[k-1][1]&&g>=gs[k+1][1]){pick=r;break;}}
 raw.push({r:pick,g:bestG,ok:pick!==null&&bestG>=25});}
// outlier rejection vs wide circular median
const wmed=(arr,i,h)=>{const w=[];for(let k=-h;k<=h;k++){const v=arr[(i+k+A)%A];if(v!=null)w.push(v);}w.sort((a,b)=>a-b);return w.length?w[w.length>>1]:null;};
let r1=raw.map(o=>o.ok?o.r:null);
const m=r1.map((_,i)=>wmed(r1,i,40));
r1=r1.map((v,i)=>(v==null||Math.abs(v-m[i])>14)?null:v);
// fill gaps by linear interpolation around the circle
const idx=r1.map((v,i)=>v==null?null:i).filter(v=>v!=null);
const filled=r1.slice();
for(let i=0;i<A;i++)if(filled[i]==null){let p=i,q=i,dp=0,dq=0;do{p=(p-1+A)%A;dp++;}while(r1[p]==null);do{q=(q+1)%A;dq++;}while(r1[q]==null);filled[i]=(r1[p]*dq+r1[q]*dp)/(dp+dq);}
const med=filled.map((_,i)=>wmed(filled,i,3));
// Body: wide moving average (smooth porcelain curve). Rim sector: narrow, to keep the rim corners crisp.
const sm=med.map((_,i)=>{const deg=i/A*360;const h=(deg>228&&deg<312)?3:12;let s=0;for(let k=-h;k<=h;k++)s+=med[(i+k+A)%A];return s/(2*h+1);});
const out=[];for(let i=0;i<A;i+=2){const th=i/A*2*Math.PI;out.push([+(3*(cx+Math.cos(th)*sm[i])).toFixed(1),+(3*(cy+Math.sin(th)*sm[i])).toFixed(1)]);}
fs.writeFileSync(process.argv[3]||'contour3000.json',JSON.stringify({center:[cx*3,cy*3],points:out}));
console.log('rejected',r1.filter(v=>v==null).length,'of',A);
const xs=out.map(p=>p[0]),ys=out.map(p=>p[1]);console.log('bbox',Math.min(...xs),Math.max(...xs),Math.min(...ys),Math.max(...ys));
