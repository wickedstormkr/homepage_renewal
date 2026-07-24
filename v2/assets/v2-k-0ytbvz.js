import{D as ta,R as ao,d as ro,N as Ce,e as yt,M as Nt,O as oa,B as So,f as Io,b as Z,g as Oe,V as M,a as k,h as Ro,A as Qe,c as aa,C as Je,i as xo,I as Wa,j as ie,U as Mt,k as q,H as Ye,l as qa,T as Ya,m as ja,n as Ka,o as Qa,p as Ja,L as Za,q as er,r as tr,s as ra,t as or,u as ar,v as rr,S as sa,W as sr,P as nr}from"./three.module-BsiMqXZE.js";const Ze=matchMedia("(max-width: 760px)").matches,so=1337;let U=256,P=U*U;function ir(t){U=t,P=t*t}const Se=[{name:"B0",p0:0,p1:.06},{name:"S1",p0:.06,p1:.1},{name:"T1",p0:.1,p1:.22},{name:"S2",p0:.22,p1:.3},{name:"T2",p0:.3,p1:.4},{name:"S3",p0:.4,p1:.46},{name:"T3",p0:.46,p1:.58},{name:"S4",p0:.58,p1:.64},{name:"T4",p0:.64,p1:.8},{name:"S5",p0:.8,p1:.88},{name:"B6",p0:.88,p1:1}];function na(t){for(let e=0;e<Se.length;e+=1)if(t<Se[e].p1||e===Se.length-1)return Se[e].name;return Se[Se.length-1].name}const lr=329232,se=[1.2,2.6,0],me=[.4,1.2,2],cr=2.2,ur=3.4,fr=.12,dr=3,hr=1.2,It=-1.4,we=88,Eo=240,ia=3,Dt=.032,pr=.018,vr=.006,la=.35,mr=2.15,Ft=Eo*ia,Ut=[1.2,-.2,0],Y=[[1.2,-.2,0],[-2.6,1.5,-.6],[-1.8,-1.6,.5],[3.9,1.8,-.4],[4.6,-.9,.7]],_r=16e3/65536,Ar=8192/65536,Bt=[.32,.45],Do=.45,Tr=.05,et=8,Lo=[1.6,.1],$t=[3.5,4.8],Ho=.62,zt=[.5,.9],Vt=-.3,L={DAMP:.86,DT:1/60,ARC:.6,ARC2:.32,EDGE_ARC:.35,GATE_JIT:.22,EDGE_V:5,TURB_FREQ:.5,TURB_TIME:.25,CATCHUP_GAIN:400,CATCHUP_MAX:6,WARM_CATCHUP:8,WARM_FRAMES:12,WARM_SUBSTEPS:8},gr=1.5,j={DUST:9147320,ACTOR:10251775,VERB:2744786,OBJECT:4947455,HIGHLIGHT:14674431},Re={MID_SEEDJIT:.72,MID_SIZE:.03,DUST_SIZE:.02,MID_BRI:1,DUST_BRI:.55,HERO_POINT_SIZE:.052},ue={DUST:.35,LANE:.85,HIGHLIGHT:1.5,HERO:1.4},Xt=[1.22,.55,1.08],be={BASE:.1,GAIN:2.2,MAX:.8},re={COLOR_LO:.55,COLOR_HI:.9,SPARK_A:.5,SPARK_B:.62,SPARK_C:.78,SPARK_GAIN:1.6,DISC_MIX:.85,DISC_LUMA:1.6},tt=.15,Ne={HALO_POW:3.2,CORE_R:.18,CORE_GAIN:1.2},Fe={BASE_SIZE:.055,STRETCH_GAIN:1.4,STRETCH_MAX:2.2,CORE_R:.12,CORE_GAIN:1.4},ut={TIME:.8,YFREQ:9,XFREQ:1.3,AMP:.2},J={ARR_LO:.45,ARR_HI:.55,BRI:.3,ALPHA_FLOOR_ARR:.22,ROW_LEAN:.35},ca=.8,Tt={STRENGTH:1,RADIUS:.4,THRESHOLD:.2},de={GRAIN:.035,VIGNETTE:.32,BLUE_LIFT:1,SAT:1.1,GRAIN_GATE_LO:.015,GRAIN_GATE_HI:.22,GRAIN_FLOOR:.15},Ot=.045,Sr=It+we*Dt,Rr=(It+Sr)/2,b={WORDS:["학습자","완료함","도형 퀴즈"],CARD_CAPTION:"xAPI Statement",TARGET_VW:.78,TARGET_VH:.24,TARGET_VW_MOBILE:.5,TARGET_VH_MOBILE:.32,P_APPEAR:.252,P_FLY0:.256,P_FLY1:.264,P_HOLD1:.272,P_GONE:.283,ARC_PX:12,SPAWN_BELOW_PX:18},Q={ANCHOR:[3,-1.5,0],CAPACITY:we*Eo*ia,LABEL:"축적된 학습 기록",CAPTION:"statements",IN_P:.3,OUT0_P:.455,OUT1_P:.465},he={PLANE_H:we*Dt+.6,PLANE_Z:la*2+.3,PLANE_ALPHA:.32,PLANE_IN:[.455,.47],PLANE_OUT:[.57,.585]},Ie=1.95,kt=.25,xr=1.2,Er=.55,Pr=.1,E={GRAPH:{ANCHOR_X:1.1,WIDTH:1.6,HEIGHT:.55,BASE_Y:Ie-.55,VERTS_H:[.18,.4,.12,.42,.68,1],HERO_VERT_U:[.2,.4,.6,.8,1],LINE_COUNT:550,VERT_COUNT:150,THICK:.05,VERT_JIT:.022,POINT_BOOST:1.7},RING:{ANCHOR_X:-.2,CENTER_Y:Ie-.28,RADIUS:.28,COUNT:380,RATE:.08,THICK:.03},ANOM:{ANCHOR_X:2.4,CLUSTER_R:.13,OFFSET:.45,DIR:[.7,.714],CENTER_Y:Ie-.45*.714,CLUSTER_COUNT:200,STROKE_COUNT:20,STROKE_JIT:.02,PULSE_HZ:1.5,POINT_BOOST:2.6}},Cr=E.GRAPH.LINE_COUNT+E.GRAPH.VERT_COUNT+E.RING.COUNT+E.ANOM.CLUSTER_COUNT+E.ANOM.STROKE_COUNT+1,ua=[{key:"A1",text:"반복 학습 패턴",x:E.RING.ANCHOR_X,y:Ie+kt},{key:"A2",text:"성취 경로",x:E.GRAPH.ANCHOR_X,y:Ie+kt},{key:"A3",text:"이상 신호 후보",x:E.ANOM.ANCHOR_X,y:Ie+kt}],Go=[.632,.645],Ee=.79,Ue=.895,yr=.55,Fo=[22,30],Mr=.35,Or=.015,wr=.04,Wt=[1.2,3.05,0],Uo=[.1,.29],br=[16,24],G={RADIUS:.38,COUNT:360,JITTER:.02,POINT_WORLD:.05,ALPHA_IN:[.08,.12],ALPHA_OUT:[.26,.3],RATE:.13,ARC_BASE:.35,ARC_GAIN:1.5},I={REPEL_RADIUS:1.2,REPEL_GAIN:6,DAMP_RADIUS:.5,DAMP_K:.2,READ_RADIUS:.8,READ_BOOST:2.6,PULSE_LIFE:1.2,PULSE_SPEED:1.8,PULSE_WIDTH:.14,PULSE_BOOST:1.4,DISC_WORLD_R:.5,DISC_BOOST:1.6,DISC_WIN:[.58,.64],NODE_RADIUS_PX:90,EDGE_BOOST_HI:2.2,EDGE_BASE_RATE:.14,LERP:8},F={BENCH_MS:1500,BENCH_HIGH_MS:9,BENCH_MID_MS:14,WARM_P:[.03,.26,.44,.61,.85],LOADER_MIN_MS:600,LOADER_MAX_MS:2e3,LOADER_FADE_MS:400,PARAMS:{high:{size:256,bloomOn:!0,bloomStrength:Tt.STRENGTH,quadsOn:!0,pixelRatioCap:1.5,haloPow:Ne.HALO_POW,coreGainMul:1},mid:{size:192,bloomOn:!0,bloomStrength:.8,quadsOn:!0,pixelRatioCap:1.25,haloPow:Ne.HALO_POW,coreGainMul:1},low:{size:128,bloomOn:!1,bloomStrength:0,quadsOn:!1,pixelRatioCap:1,haloPow:2.2,coreGainMul:1.2}}},Nr=40,Ir=.1,Dr=60,Lr=.8,Hr=6;function Gr(t,e){switch(t){case"lin":return e;case"in2":return e*e;case"out2":return 1-(1-e)*(1-e);case"in3":return e*e*e;case"out3":return 1-Math.pow(1-e,3);default:return e*e*(3-2*e)}}const fa={camPos:[{p:0,v:[0,3.5,11]},{p:.1,v:[0,3.5,11],e:"lin"},{p:.22,v:[2.6,1.8,9],e:"out2"},{p:.3,v:[2.8,.4,8.4],e:"out2"},{p:.4,v:[2.2,-.5,7.4],e:"out2"},{p:.46,v:[1.9,-.7,6.9],e:"out2"},{p:.52,v:[1.9,-.45,6.6],e:"smooth"},{p:.58,v:[3.3,-.2,6.5],e:"smooth"},{p:.64,v:[.9,.1,7.6],e:"out2"},{p:.8,v:[0,2,13.5],e:"out2"},{p:.88,v:[0,2.2,14.5],e:"out2"},{p:1,v:[0,2.6,16],e:"smooth"}],camLook:[{p:0,v:[1.2,.2,0]},{p:.1,v:[1.2,.5,0],e:"smooth"},{p:.22,v:[1.2,.7,0],e:"smooth"},{p:.3,v:[1.2,.3,0],e:"smooth"},{p:.4,v:[1.2,-.4,0],e:"smooth"},{p:.46,v:[1.2,-.8,0],e:"smooth"},{p:.58,v:[1.2,-.5,0],e:"smooth"},{p:.64,v:[1.2,-.1,0],e:"smooth"},{p:.8,v:[1.2,0,0],e:"smooth"},{p:.88,v:[1,-.2,0],e:"smooth"},{p:1,v:[1,-.1,0],e:"smooth"}],attractK:[{p:0,v:6},{p:.1,v:6,e:"lin"},{p:.115,v:.4,e:"out2"},{p:.17,v:2.6,e:"smooth"},{p:.22,v:6,e:"in2"},{p:.3,v:6,e:"lin"},{p:.315,v:.4,e:"out2"},{p:.36,v:1.6,e:"smooth"},{p:.4,v:6,e:"in2"},{p:.46,v:5,e:"smooth"},{p:.52,v:3,e:"smooth"},{p:.58,v:6,e:"in2"},{p:.64,v:6,e:"lin"},{p:.655,v:.4,e:"out2"},{p:.72,v:1.6,e:"smooth"},{p:.8,v:6,e:"in2"},{p:.88,v:6,e:"lin"},{p:1,v:6,e:"lin"}],turb:[{p:0,v:.12},{p:.1,v:.12,e:"lin"},{p:.14,v:.55,e:"out2"},{p:.22,v:.12,e:"in2"},{p:.3,v:.12,e:"lin"},{p:.35,v:.55,e:"out2"},{p:.4,v:.12,e:"in2"},{p:.46,v:.12,e:"lin"},{p:.52,v:.55,e:"out2"},{p:.58,v:.12,e:"in2"},{p:.64,v:.12,e:"lin"},{p:.72,v:.7,e:"out2"},{p:.8,v:.12,e:"in2"},{p:.88,v:.12,e:"lin"},{p:1,v:.1,e:"smooth"}],uT1:[{p:0,v:0},{p:.1,v:0,e:"lin"},{p:.22,v:1,e:"smooth"},{p:1,v:1,e:"lin"}],uT2:[{p:0,v:0},{p:.3,v:0,e:"lin"},{p:.4,v:1,e:"smooth"},{p:1,v:1,e:"lin"}],uT3:[{p:0,v:0},{p:.46,v:0,e:"lin"},{p:.58,v:1,e:"smooth"},{p:1,v:1,e:"lin"}],uT4:[{p:0,v:0},{p:.64,v:0,e:"lin"},{p:.8,v:1,e:"smooth"},{p:1,v:1,e:"lin"}],scanX:[{p:0,v:-1.2},{p:.46,v:-1.2,e:"lin"},{p:.58,v:3.4,e:"lin"},{p:1,v:3.4,e:"lin"}],rowsOpen:[{p:0,v:0},{p:.3,v:0,e:"lin"},{p:.42,v:1,e:"smooth"},{p:1,v:1,e:"lin"}],coreShrink:[{p:0,v:0},{p:.64,v:0,e:"lin"},{p:.8,v:1,e:"smooth"},{p:1,v:1,e:"lin"}],exposure:[{p:0,v:1},{p:.78,v:1,e:"lin"},{p:.83,v:1.12,e:"smooth"},{p:.9,v:1.12,e:"lin"},{p:.97,v:.85,e:"smooth"},{p:1,v:.85,e:"lin"}],cursorRepel:[{p:0,v:-.9},{p:.1,v:-.9,e:"lin"},{p:.145,v:0,e:"out2"},{p:1,v:0,e:"lin"}],cursorDamp:[{p:0,v:0},{p:.215,v:0,e:"lin"},{p:.23,v:.5,e:"smooth"},{p:.29,v:.5,e:"lin"},{p:.3,v:0,e:"smooth"},{p:1,v:0,e:"lin"}],sizeDensityDamp:[{p:0,v:0},{p:.3,v:0,e:"lin"},{p:.4,v:.35,e:"smooth"},{p:.43,v:.22,e:"smooth"},{p:.64,v:.22,e:"lin"},{p:.72,v:.36,e:"smooth"},{p:.88,v:.36,e:"lin"},{p:1,v:0,e:"smooth"}]};function da(t,e){if(e<=t[0].p)return[t[0],t[0],0];const o=t[t.length-1];if(e>=o.p)return[o,o,0];for(let a=1;a<t.length;a+=1)if(e<=t[a].p){const s=t[a-1],r=t[a],n=(e-s.p)/Math.max(1e-6,r.p-s.p);return[s,r,Gr(r.e||"smooth",n)]}return[o,o,0]}function D(t,e){const o=fa[t];if(!o)return 0;const[a,s,r]=da(o,e);return a.v+(s.v-a.v)*r}function Bo(t,e,o){const a=fa[t];if(!a)return o[0]=o[1]=o[2]=0,o;const[s,r,n]=da(a,e);return o[0]=s.v[0]+(r.v[0]-s.v[0])*n,o[1]=s.v[1]+(r.v[1]-s.v[1])*n,o[2]=s.v[2]+(r.v[2]-s.v[2])*n,o}function no(t){let e=t>>>0;return()=>(e^=e<<13,e^=e>>>17,e^=e<<5,(e>>>0)/4294967296)}function ha(t){const e=[],o=[];for(let a=0;a<et;a+=1){const s=(a+.5)/et*Math.PI*2,r=$t[0]+t()*($t[1]-$t[0]);let n=Lo[0]+Math.cos(s)*r*Ho;const i=Lo[1]+Math.sin(s)*r*Ho,l=(t()-.5)*2.2;n<Vt&&(n=Vt+(Vt-n)*.5),e.push([n,i,l]),o.push(zt[0]+t()*(zt[1]-zt[0]))}return{centers:e,radii:o}}function Fr(){return ha(no(so)).centers}function qt(t){return t*t*t*(t*(t*6-15)+10)}function le(t,e,o){let a=t*374761393+e*668265263+o*1274126177|0;return a=a^a>>>13|0,a=Math.imul(a,1274126177),a=(a^a>>>16)>>>0,a/4294967296}function $o(t,e,o){const a=Math.floor(t),s=Math.floor(e),r=Math.floor(o),n=t-a,i=e-s,l=o-r,u=qt(n),p=qt(i),v=qt(l),f=le(a,s,r),d=le(a+1,s,r),h=le(a,s+1,r),T=le(a+1,s+1,r),S=le(a,s,r+1),x=le(a+1,s,r+1),y=le(a,s+1,r+1),m=le(a+1,s+1,r+1),A=f+(d-f)*u,_=h+(T-h)*u,C=S+(x-S)*u,g=y+(m-y)*u,w=A+(_-A)*p,H=C+(g-C)*p;return w+(H-w)*v}function Be(t){const e=new ta(t,U,U,ao,ro);return e.needsUpdate=!0,e.minFilter=Ce,e.magFilter=Ce,e.wrapS=yt,e.wrapT=yt,e}function Ur(){const t=no(so),e=no((so^2654435769)>>>0),o=new Float32Array(P*4),a=new Float32Array(P*4),s=new Float32Array(P*4),r=new Float32Array(P*4),n=new Float32Array(P*4),{centers:i,radii:l}=ha(t),u=Math.round(P*Ar),p=Math.round(P*_r),v=Math.max(1,Math.floor(p/4)),f=new Int32Array(P);for(let m=0;m<P;m+=1)f[m]=m;for(let m=P-1;m>0;m-=1){const A=Math.floor(t()*(m+1)),_=f[m];f[m]=f[A],f[A]=_}const d=new Uint8Array(P),h=new Uint8Array(P),T=new Float32Array(P*3);for(let m=0;m<P;m+=1){const A=f[m];if(m<u){d[A]=2;const _=1+m%4;h[A]=_,T[A*3]=Y[_][0],T[A*3+1]=Y[_][1],T[A*3+2]=Y[_][2]}else if(m<u+p){d[A]=1;const _=1+Math.min(3,Math.floor((m-u)/v));h[A]=_;const C=t()*2-1,g=t()*Math.PI*2,w=Bt[0]+t()*(Bt[1]-Bt[0]),H=Math.sqrt(Math.max(0,1-C*C));T[A*3]=Y[_][0]+Math.cos(g)*H*w,T[A*3+1]=Y[_][1]+C*w,T[A*3+2]=Y[_][2]+Math.sin(g)*H*w}else d[A]=0,h[A]=0}const S=new Uint8Array(P),x=new Float32Array(P);{const m=Math.floor(P/Ft),A=Math.floor(m*Do),_=[];for(let O=0;O<P;O+=1)Math.floor(O/Ft)>=A&&_.push(O);const C=Math.min(Cr,_.length),g=_.length/C,w=E.GRAPH,H=E.RING,V=E.ANOM,N=w.LINE_COUNT,X=w.VERT_COUNT,ee=H.COUNT,ae=V.CLUSTER_COUNT,Te=V.STROKE_COUNT,ne=X/w.HERO_VERT_U.length;for(let O=0;O<C;O+=1){const fe=_[Math.floor(O*g)];let K=0,oe=0;if(O<N)K=1,oe=(O+.5)/N;else if(O<N+X){K=5;const ge=Math.min(w.HERO_VERT_U.length-1,Math.floor((O-N)/ne));oe=w.HERO_VERT_U[ge]}else O<N+X+ee?(K=2,oe=(O-N-X+.5)/ee):O<N+X+ee+ae?K=3:O<N+X+ee+ae+Te?(K=6,oe=(O-(N+X+ee+ae)+.5)/Te):K=4;S[fe]=K,x[fe]=oe}}const y=we*Do;for(let m=0;m<P;m+=1){const A=m*4,_=m%3,C=Math.floor(m/3)%Eo,g=Math.floor(m/Ft),w=(_-1)*vr,H=hr-mr+C*pr+w,V=It+g*Dt,N=($o(H*1.7,V*1.7,_*3.1)*2-1)*la;a[A]=H,a[A+1]=V,a[A+2]=N,a[A+3]=_;const X=m%et,ee=i[X],ae=l[X],Te=(t()+t()+t()-1.5)/1.5,ne=(t()+t()+t()-1.5)/1.5,O=(t()+t()+t()-1.5)/1.5,fe=ee[0]+Te*ae,K=ee[1]+ne*ae,oe=ee[2]+O*ae*.7;o[A]=fe,o[A+1]=K,o[A+2]=oe,o[A+3]=X,s[A]=T[m*3],s[A+1]=T[m*3+1],s[A+2]=T[m*3+2],g>=y&&t();const ge=t()<Tr,Gt=S[m],Ba=Gt>0?1:0,$a=Gt>0?0:ge?1:0;s[A+3]=d[m]+h[m]*4+Ba*32+$a*64+Gt*128;const za=$o(fe*.6,K*.6,oe*.6),Va=t(),Xa=.3+Math.min(g,we)/we*.115,ka=.1+X/et*.1;r[A]=za,r[A+1]=Va,r[A+2]=Xa,r[A+3]=ka,n[A]=e(),n[A+1]=e(),n[A+2]=e(),n[A+3]=x[m]}return{texScatter:Be(o),texStrata:Be(a),texEco:Be(s),texMeta:Be(r),texSeed:Be(n),scatterData:o}}class Ge{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}const Br=new oa(-1,1,1,-1,0,1);class $r extends So{constructor(){super(),this.setAttribute("position",new Io([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new Io([0,2,0,0,2,0],2))}}const zr=new $r;class Lt{constructor(e){this._mesh=new Nt(zr,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,Br)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}}class Vr{constructor(e,o,a){this.variables=[],this.currentTextureIndex=0;let s=ro;const r={passThruTexture:{value:null}},n=u(v(),r),i=new Lt(n);this.setDataType=function(f){return s=f,this},this.addVariable=function(f,d,h){const T=this.createShaderMaterial(d),S={name:f,initialValueTexture:h,material:T,dependencies:null,renderTargets:[],wrapS:null,wrapT:null,minFilter:Ce,magFilter:Ce};return this.variables.push(S),S},this.setVariableDependencies=function(f,d){f.dependencies=d},this.init=function(){if(a.capabilities.maxVertexTextures===0)return"No support for vertex shader textures.";for(let f=0;f<this.variables.length;f++){const d=this.variables[f];d.renderTargets[0]=this.createRenderTarget(e,o,d.wrapS,d.wrapT,d.minFilter,d.magFilter),d.renderTargets[1]=this.createRenderTarget(e,o,d.wrapS,d.wrapT,d.minFilter,d.magFilter),this.renderTexture(d.initialValueTexture,d.renderTargets[0]),this.renderTexture(d.initialValueTexture,d.renderTargets[1]);const h=d.material,T=h.uniforms;if(d.dependencies!==null)for(let S=0;S<d.dependencies.length;S++){const x=d.dependencies[S];if(x.name!==d.name){let y=!1;for(let m=0;m<this.variables.length;m++)if(x.name===this.variables[m].name){y=!0;break}if(!y)return"Variable dependency not found. Variable="+d.name+", dependency="+x.name}T[x.name]={value:null},h.fragmentShader=`
uniform sampler2D `+x.name+`;
`+h.fragmentShader}}return this.currentTextureIndex=0,null},this.compute=function(){const f=this.currentTextureIndex,d=this.currentTextureIndex===0?1:0;for(let h=0,T=this.variables.length;h<T;h++){const S=this.variables[h];if(S.dependencies!==null){const x=S.material.uniforms;for(let y=0,m=S.dependencies.length;y<m;y++){const A=S.dependencies[y];x[A.name].value=A.renderTargets[f].texture}}this.doRenderTarget(S.material,S.renderTargets[d])}this.currentTextureIndex=d},this.getCurrentRenderTarget=function(f){return f.renderTargets[this.currentTextureIndex]},this.getAlternateRenderTarget=function(f){return f.renderTargets[this.currentTextureIndex===0?1:0]},this.dispose=function(){i.dispose();const f=this.variables;for(let d=0;d<f.length;d++){const h=f[d];h.initialValueTexture&&h.initialValueTexture.dispose();const T=h.renderTargets;for(let S=0;S<T.length;S++)T[S].dispose();h.material.dispose()}};function l(f){f.defines.resolution="vec2( "+e.toFixed(1)+", "+o.toFixed(1)+" )"}this.addResolutionDefine=l;function u(f,d){d=d||{};const h=new Z({name:"GPUComputationShader",uniforms:d,vertexShader:p(),fragmentShader:f});return l(h),h}this.createShaderMaterial=u,this.createRenderTarget=function(f,d,h,T,S,x){return f=f||e,d=d||o,h=h||yt,T=T||yt,S=S||Ce,x=x||Ce,new Oe(f,d,{wrapS:h,wrapT:T,minFilter:S,magFilter:x,format:ao,type:s,depthBuffer:!1})},this.createTexture=function(){const f=new Float32Array(e*o*4),d=new ta(f,e,o,ao,ro);return d.needsUpdate=!0,d},this.renderTexture=function(f,d){r.passThruTexture.value=f,this.doRenderTarget(n,d),r.passThruTexture.value=null},this.doRenderTarget=function(f,d){const h=a.getRenderTarget(),T=a.xr.enabled,S=a.shadowMap.autoUpdate;a.xr.enabled=!1,a.shadowMap.autoUpdate=!1,i.material=f,a.setRenderTarget(d),i.render(a),i.material=n,a.xr.enabled=T,a.shadowMap.autoUpdate=S,a.setRenderTarget(h)};function p(){return`void main()	{

	gl_Position = vec4( position, 1.0 );

}
`}function v(){return`uniform sampler2D passThruTexture;

void main() {

	vec2 uv = gl_FragCoord.xy / resolution.xy;

	gl_FragColor = texture2D( passThruTexture, uv );

}
`}}}const R=t=>{const e=String(t);return e.includes(".")||e.includes("e")||e.includes("E")?e:e+".0"},pa=`
#define PI 3.14159265359
#define LANE_X0 ${R(me[0])}
#define LANE_X1 ${R(me[1])}
#define LANE_X2 ${R(me[2])}
#define LANE_TOP ${R(cr)}
#define LANE_LEN ${R(ur)}
#define LANE_Z_SEP ${R(fr)}
#define CONV_V ${R(dr)}
#define ARC ${R(L.ARC)}
#define ARC2 ${R(L.ARC2)}
#define EDGE_ARC ${R(L.EDGE_ARC)}
#define GATE_JIT ${R(L.GATE_JIT)}
#define EDGE_V ${R(L.EDGE_V)}
#define TURB_FREQ ${R(L.TURB_FREQ)}
#define TURB_TIME ${R(L.TURB_TIME)}
#define CURSOR_REPEL_R ${R(I.REPEL_RADIUS)}
#define CURSOR_REPEL_GAIN ${R(I.REPEL_GAIN)}
#define CURSOR_DAMP_R ${R(I.DAMP_RADIUS)}
#define CURSOR_DAMP_K ${R(I.DAMP_K)}
#define GATE_C vec3(${R(se[0])}, ${R(se[1])}, ${R(se[2])})
#define CORE_C vec3(${R(Ut[0])}, ${R(Ut[1])}, ${R(Ut[2])})

// --- Ashima simplex 3D noise ---
vec3 mod289(vec3 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x){ return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 gg = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - gg;
  vec3 i1 = min(gg.xyz, l.zxy);
  vec3 i2 = max(gg.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
vec3 snoiseVec3(vec3 x){
  return vec3(
    snoise(x),
    snoise(x + vec3(123.4, 234.5, 345.6)),
    snoise(x + vec3(-345.6, 456.7, -567.8))
  );
}
// --- curl noise (simplex 3D 기반) ---
vec3 curl3(vec3 p){
  const float e = 0.1;
  vec3 dx = vec3(e, 0.0, 0.0);
  vec3 dy = vec3(0.0, e, 0.0);
  vec3 dz = vec3(0.0, 0.0, e);
  vec3 px0 = snoiseVec3(p - dx), px1 = snoiseVec3(p + dx);
  vec3 py0 = snoiseVec3(p - dy), py1 = snoiseVec3(p + dy);
  vec3 pz0 = snoiseVec3(p - dz), pz1 = snoiseVec3(p + dz);
  float cx = py1.z - py0.z - pz1.y + pz0.y;
  float cy = pz1.x - pz0.x - px1.z + px0.z;
  float cz = px1.y - px0.y - py1.x + py0.x;
  return normalize(vec3(cx, cy, cz) * (1.0 / (2.0 * e)));
}
// --- 경로 헬퍼 ---
float laneXOf(int li){ return li == 0 ? LANE_X0 : (li == 1 ? LANE_X1 : LANE_X2); }
float laneZOf(int li){ return (float(li) - 1.0) * LANE_Z_SEP; }
vec3 gateRoute(vec3 scatter, vec3 lanePos, float w1){
  vec3 gateJit = GATE_C + curl3(scatter * 1.3) * GATE_JIT;
  if (w1 < 0.5) return mix(scatter, gateJit, w1 * 2.0);
  return mix(gateJit, lanePos, w1 * 2.0 - 1.0);
}
vec3 edgePath(vec3 a, vec3 b, float t){
  vec3 p = mix(a, b, t);
  p.y += sin(PI * t) * EDGE_ARC;
  return p;
}

// ── §9 R1: 인사이트 형태 3종 목표 (그래프·링·이상점) — 스캔 통과 시 응집 ───────────
#define SCAN_GATE ${R(tt)}
#define SHAPE_W3_BIAS ${R(Pr)}
#define GRAPH_AX ${R(E.GRAPH.ANCHOR_X)}
#define GRAPH_W ${R(E.GRAPH.WIDTH)}
#define GRAPH_H ${R(E.GRAPH.HEIGHT)}
#define GRAPH_BY ${R(E.GRAPH.BASE_Y)}
#define GRAPH_THICK ${R(E.GRAPH.THICK)}
#define GRAPH_VJIT ${R(E.GRAPH.VERT_JIT)}
#define GH0 ${R(E.GRAPH.VERTS_H[0])}
#define GH1 ${R(E.GRAPH.VERTS_H[1])}
#define GH2 ${R(E.GRAPH.VERTS_H[2])}
#define GH3 ${R(E.GRAPH.VERTS_H[3])}
#define GH4 ${R(E.GRAPH.VERTS_H[4])}
#define GH5 ${R(E.GRAPH.VERTS_H[5])}
#define RING_AX ${R(E.RING.ANCHOR_X)}
#define RING_CY ${R(E.RING.CENTER_Y)}
#define RING_R ${R(E.RING.RADIUS)}
#define RING_THICK ${R(E.RING.THICK)}
#define RING_RATE ${R(E.RING.RATE)}
#define ANOM_AX ${R(E.ANOM.ANCHOR_X)}
#define ANOM_CY ${R(E.ANOM.CENTER_Y)}
#define ANOM_CR ${R(E.ANOM.CLUSTER_R)}
#define ANOM_OFF ${R(E.ANOM.OFFSET)}
#define ANOM_DX ${R(E.ANOM.DIR[0])}
#define ANOM_DY ${R(E.ANOM.DIR[1])}
#define ANOM_SJIT ${R(E.ANOM.STROKE_JIT)}

// 상승 폴리라인 높이(정규화 0..1): 6정점(세그 5), 한 번 하락 후 상승.
float graphH(float u){
  float s = clamp(u, 0.0, 1.0) * 5.0;
  float i = floor(s); float t = s - i;
  if (i < 0.5) return mix(GH0, GH1, t);
  if (i < 1.5) return mix(GH1, GH2, t);
  if (i < 2.5) return mix(GH2, GH3, t);
  if (i < 3.5) return mix(GH3, GH4, t);
  return mix(GH4, GH5, t);
}
// 형태 앵커 x (스캔 통과 게이트 기준 — 형태는 지층 슬롯이 아니라 형태 앵커에서 응집·점화)
float shapeAnchorX(float st){
  if (st < 1.5) return GRAPH_AX;   // 1 그래프선
  if (st < 2.5) return RING_AX;    // 2 링
  if (st < 4.5) return ANOM_AX;    // 3 무리 · 4 이상점
  if (st < 5.5) return GRAPH_AX;   // 5 그래프정점
  return ANOM_AX;                  // 6 스트로크
}
// 형태 목표 위치. uTime은 링 순환 위상에만(§10-C 닫힌 루프 위상 — 스크럽 결정론 불변).
vec3 shapeTarget(float st, float u, vec3 sd, float uTime){
  if (st < 1.5) {                                                  // ① 그래프 라인
    float x = GRAPH_AX - GRAPH_W * 0.5 + u * GRAPH_W;
    float y = GRAPH_BY + graphH(u) * GRAPH_H + (sd.z - 0.5) * GRAPH_THICK;
    return vec3(x, y, (sd.x - 0.5) * GRAPH_THICK);
  } else if (st < 2.5) {                                           // ② 링 (시간 순환)
    float ang = 2.0 * PI * fract(u + uTime * RING_RATE);
    float r = RING_R + (sd.x - 0.5) * RING_THICK;
    return vec3(RING_AX + r * cos(ang), RING_CY + r * sin(ang), (sd.z - 0.5) * RING_THICK);
  } else if (st < 3.5) {                                           // ③ 정상 무리(촘촘한 원반)
    float rr = ANOM_CR * sqrt(sd.x);
    float aa = sd.y * 2.0 * PI;
    return vec3(ANOM_AX + rr * cos(aa), ANOM_CY + rr * sin(aa), (sd.z - 0.5) * ANOM_CR);
  } else if (st < 4.5) {                                           // ③ 단독 이상점
    return vec3(ANOM_AX + ANOM_OFF * ANOM_DX, ANOM_CY + ANOM_OFF * ANOM_DY, 0.0);
  } else if (st < 5.5) {                                           // ① 그래프 정점(hero 데이터 포인트)
    float x = GRAPH_AX - GRAPH_W * 0.5 + u * GRAPH_W;
    float y = GRAPH_BY + graphH(u) * GRAPH_H;
    return vec3(x + (sd.x - 0.5) * GRAPH_VJIT, y + (sd.z - 0.5) * GRAPH_VJIT, (sd.y - 0.5) * GRAPH_VJIT);
  }
  // ③ 무리 → 이상점 짧은 입자 스트로크
  vec3 c = vec3(ANOM_AX, ANOM_CY, 0.0);
  vec3 pt = vec3(ANOM_AX + ANOM_OFF * ANOM_DX, ANOM_CY + ANOM_OFF * ANOM_DY, 0.0);
  vec3 s0 = c + normalize(pt - c) * ANOM_CR;
  return mix(s0, pt, u) + vec3(0.0, 0.0, (sd.z - 0.5) * ANOM_SJIT);
}
`,Xr=pa+`
uniform float uP, uTime, uDt, uK, uTurb, uCatchup, uDamp, uScanX, uCoreShrink, uT4;
uniform float uCursorRepel, uCursorDamp;                       // §13-E 커서 힘 강도(타임라인 트랙)
uniform vec3 uCursor;                                          // §13-E z=0 평면 투영 월드좌표
uniform float uEdgePhase1, uEdgePhase2, uEdgePhase3, uEdgePhase4; // §13-E 노드별 에지 순환 위상(가속 반영)
uniform sampler2D texScatter, texStrata, texEco, texMeta, texSeed;
// GPUComputationRenderer 자동 주입: texturePosition, textureVelocity

// 노드별 에지 위상 선택 (GLSL ES1 — 동적 배열 인덱싱 회피, 분기)
float edgePhaseOf(float nid){
  if (nid < 1.5) return uEdgePhase1;
  if (nid < 2.5) return uEdgePhase2;
  if (nid < 3.5) return uEdgePhase3;
  return uEdgePhase4;
}

void main(){
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec3 pos = texture2D(texturePosition, uv).xyz;
  vec3 vel = texture2D(textureVelocity, uv).xyz;

  vec4 scat = texture2D(texScatter, uv);
  vec4 strt = texture2D(texStrata, uv);
  vec4 ecod = texture2D(texEco, uv);
  vec4 meta = texture2D(texMeta, uv);
  vec4 seedv = texture2D(texSeed, uv);

  vec3 scatter = scat.xyz;
  vec3 strata = strt.xyz;
  int laneId = int(strt.w + 0.5);

  float ecoW = ecod.w;
  float ecoType = mod(ecoW, 4.0);
  float nodeId = mod(floor(ecoW / 4.0), 8.0);       // §13-E 에지 위상 선택용
  float shapeType = mod(floor(ecoW / 128.0), 8.0);  // §9 R1 인사이트 형태(1..6, 0=없음)

  // T1: scatter → 관문 → 레인 (게이트 경유 2구간 + 종형 컬 오프셋). w1 창 0.06 (§10-D.1)
  float w1 = smoothstep(meta.w + meta.x * 0.03, meta.w + meta.x * 0.03 + 0.06, uP);
  // S2 레인 튜브: 입자별 고정 xz 반경 오프셋(지름 ~0.32) + 26행 양자화 낙하 (§10-D.2)
  //   낙하 위상 uTime·0.10 = 순환 위상(§10-C — dwell에도 폭포가 흐른다)
  float rr = 0.05 + seedv.x * 0.13;
  float th = seedv.y * (2.0 * PI);
  float yFrac = fract(uP * CONV_V + uTime * 0.10 + meta.y);
  float yQ = mix(yFrac, (floor(yFrac * 26.0) + 0.5) / 26.0, 0.55); // 26행 클럼프 리듬
  float yJit = (seedv.z - 0.5) * 0.02;                             // y지터 ±0.01
  vec3 lanePos = vec3(
    laneXOf(laneId) + cos(th) * rr,
    LANE_TOP - yQ * LANE_LEN + yJit,
    laneZOf(laneId) + sin(th) * rr
  );
  vec3 toLane = gateRoute(scatter, lanePos, w1) + curl3(scatter * 0.7 + meta.x * 7.0) * ARC * sin(PI * w1);

  // T2: 레인 → 지층 착지 (착지 창 + 아치)
  float w2 = smoothstep(meta.z, meta.z + 0.012, uP);
  vec3 T = mix(toLane, strata, w2) + curl3(strata * 0.9 + meta.x * 3.0) * ARC2 * sin(PI * w2);

  // T3: 스캔 통과 → 인사이트 형태로 응집 (§9 R1 — 기존 발견 상승/산개 대체).
  //   형태 입자는 스캔이 형태 앵커 x를 지나는 순간부터 자기 형태 목표로 응집(earned-reveal,
  //   기존 scanX 게이트 방식 동일). 링은 시간 순환(§10-C), 나머지는 정적 슬롯+호흡.
  if (shapeType > 0.5) {
    float ax = shapeAnchorX(shapeType);
    float passedShape = smoothstep(-SCAN_GATE, SCAN_GATE, uScanX - ax);
    vec3 sp = shapeTarget(shapeType, seedv.w, seedv.xyz, uTime);
    T = mix(T, sp, passedShape);
  }

  // T4: 생태계 (에지 순환 / 노드 격자 / 코어 압축). 창 단축·스태거 확대 (§10-D.3).
  //   §9 item4: 형태(discovery) 입자는 w3 시작 −0.1 보정 → T4에서 가장 먼저 방사(생태계 씨앗).
  float w3s = meta.x * 0.6 - (shapeType > 0.5 ? SHAPE_W3_BIAS : 0.0);
  float w3 = smoothstep(w3s, w3s + 0.28, uT4);
  vec3 ecoT;
  if (ecoType > 1.5) {
    // 상시 순환(uP 무관, §10-D.5). 위상은 노드별 누적(§13-E 커서 에지 가속 — 배속 시 텔레포트 없이 연속 가속).
    ecoT = edgePath(CORE_C, ecod.xyz, fract(edgePhaseOf(nodeId) + meta.y));
  } else if (ecoType > 0.5) {
    ecoT = ecod.xyz;
  } else {
    ecoT = mix(strata, CORE_C, uCoreShrink);
  }
  // 운반 아크: 종형 컬 오프셋(양 끝 0, 비행 중 스트림 방사) — seed=meta.x (§10-D.3)
  T = mix(T, ecoT, w3) + curl3(ecoT * 0.5 + meta.x) * 0.5 * sin(PI * w3);

  // 힘: 어트랙터 + 컬 난류 + 커서 + 감쇠
  vec3 acc = (T - pos) * uK * (1.0 + uCatchup);
  acc += curl3(pos * TURB_FREQ + uTime * TURB_TIME) * uTurb;
  // §13-E S1 회피: 커서 반경 안 입자를 밀어냄 (uCursorRepel<0). 트랙 0이면 무효.
  vec3 cd = pos - uCursor;
  float cdist = length(cd);
  float repelFall = smoothstep(CURSOR_REPEL_R, 0.0, cdist);          // 1 중심 → 0 반경
  acc += normalize(cd + vec3(1e-4)) * (-uCursorRepel) * repelFall * CURSOR_REPEL_GAIN;
  vel = (vel + acc * uDt) * uDamp;
  // §13-E S2 읽기: 커서 근접 레인 입자 추가 감쇠(0.5트랙 → vel×0.9). 트랙 0이면 무효.
  float dampFall = smoothstep(CURSOR_DAMP_R, 0.0, cdist);
  vel *= 1.0 - uCursorDamp * dampFall * CURSOR_DAMP_K;

  // Phase 1 §11-A: 색 획득 채널 — w채널에 w1(문법화 진행) 기록.
  //   xyz(속도)엔 영향 없음: 위·아래 셰이더 모두 velocity를 .xyz로만 읽는다.
  gl_FragColor = vec4(vel, w1);
}
`,kr=`
uniform float uDt;
// 자동 주입: texturePosition, textureVelocity
void main(){
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec3 pos = texture2D(texturePosition, uv).xyz;
  vec3 vel = texture2D(textureVelocity, uv).xyz;
  pos += vel * uDt;
  gl_FragColor = vec4(pos, 1.0);
}
`;let te=null,Pe=null,pe=null,gt=0;function Wr(t,e){te=new Vr(U,U,t);const o=te.createTexture(),a=o.image.data;for(let i=0;i<P;i+=1)a[i*4]=e.scatterData[i*4],a[i*4+1]=e.scatterData[i*4+1],a[i*4+2]=e.scatterData[i*4+2],a[i*4+3]=1;const s=te.createTexture();s.image.data.fill(0),pe=te.addVariable("textureVelocity",Xr,s),Pe=te.addVariable("texturePosition",kr,o),te.setVariableDependencies(pe,[pe,Pe]),te.setVariableDependencies(Pe,[pe,Pe]);const r=pe.material.uniforms;r.uP={value:0},r.uTime={value:0},r.uDt={value:L.DT},r.uK={value:6},r.uTurb={value:.12},r.uCatchup={value:0},r.uDamp={value:L.DAMP},r.uScanX={value:-1.2},r.uCoreShrink={value:0},r.uT4={value:0},r.uCursor={value:new M(999,999,999)},r.uCursorRepel={value:0},r.uCursorDamp={value:0},r.uEdgePhase1={value:0},r.uEdgePhase2={value:0},r.uEdgePhase3={value:0},r.uEdgePhase4={value:0},r.texScatter={value:e.texScatter},r.texStrata={value:e.texStrata},r.texEco={value:e.texEco},r.texMeta={value:e.texMeta},r.texSeed={value:e.texSeed},Pe.material.uniforms.uDt={value:L.DT};const n=te.init();if(n!==null)throw new Error("GPUComputationRenderer init: "+n);gt=L.WARM_FRAMES}function va(t){t.jumped&&(gt=L.WARM_FRAMES);let e=Math.min(L.CATCHUP_MAX,t.velP*L.CATCHUP_GAIN),o=1;gt>0?(e=Math.max(e,L.WARM_CATCHUP),o=L.WARM_SUBSTEPS,gt-=1):t.velP>.001&&(o=3);const a=pe.material.uniforms;a.uP.value=t.p,a.uTime.value=t.time,a.uK.value=t.k,a.uTurb.value=t.turb,a.uCatchup.value=e,a.uScanX.value=t.scanX,a.uCoreShrink.value=t.coreShrink,a.uT4.value=t.uT4,a.uCursor.value.copy(t.cursor),a.uCursorRepel.value=t.cursorRepel,a.uCursorDamp.value=t.cursorDamp,a.uEdgePhase1.value=t.edgePhase[1],a.uEdgePhase2.value=t.edgePhase[2],a.uEdgePhase3.value=t.edgePhase[3],a.uEdgePhase4.value=t.edgePhase[4];for(let s=0;s<o;s+=1)te.compute()}function ma(){return te.getCurrentRenderTarget(Pe).texture}function _a(){return te.getCurrentRenderTarget(pe).texture}const c=t=>{const e=String(t);return e.includes(".")||e.includes("e")||e.includes("E")?e:e+".0"};function $e(t){const e=new Je(t),o=Math.max(e.r,e.g,e.b)||1;return[e.r/o,e.g/o,e.b/o]}const ze=t=>`vec3(${c(t[0])}, ${c(t[1])}, ${c(t[2])})`;function Aa(){return`
    #define DUST_DIR ${ze($e(j.DUST))}
    #define ACTOR_DIR ${ze($e(j.ACTOR))}
    #define VERB_DIR ${ze($e(j.VERB))}
    #define OBJECT_DIR ${ze($e(j.OBJECT))}
    #define HI_DIR ${ze($e(j.HIGHLIGHT))}
    #define LANE_BAL vec3(${c(Xt[0])}, ${c(Xt[1])}, ${c(Xt[2])})
    vec3 laneDir(float lane){ return lane < 0.5 ? ACTOR_DIR : (lane < 1.5 ? VERB_DIR : OBJECT_DIR); }
    // §11-G.1 레인 지각 휘도 밸런싱 계수 (시안 백열 억제)
    float laneLumaBal(float lane){ return lane < 0.5 ? LANE_BAL.x : (lane < 1.5 ? LANE_BAL.y : LANE_BAL.z); }
    // §11-G.2 구조 도착 게이트: max(지층 도착 w2, eco/T4 도착 w3)
    float structArrived(float w2, float w3){
      return max(smoothstep(${c(J.ARR_LO)}, ${c(J.ARR_HI)}, w2),
                 smoothstep(${c(J.ARR_LO)}, ${c(J.ARR_HI)}, w3));
    }
    // §11-G.3 지층 행 리듬 리닝: 행 인덱스(strataY)→레인색으로 col 리닝(밸런싱 반영, w3에서 소멸)
    vec3 strataRowBand(vec3 col, float strataY, float strataArr, float w3, float laneLuma){
      float rowLane = mod(floor((strataY - (${c(It)})) / ${c(Dt)}), 3.0);
      vec3 laneCol = laneDir(rowLane) * laneLuma * laneLumaBal(rowLane);
      return mix(col, laneCol, ${c(J.ROW_LEAN)} * strataArr * (1.0 - w3));
    }
    // §11-H.3 damp 코어 한정 게이트: T4 진행(uT4)에 따라 damp 대상이 지층 도착 입자(strataArr)
    //   → 코어 잔류체(isCore=ecoType==0)로 전환. S5 노드·에지(isCore=0)는 감쇠 해제.
    //   T4 이전(uT4≈0)엔 strataArr 유지(T2~S4 지층 밀집 완화 그대로).
    float dampMask(float strataArr, float isCore, float uT4){
      return mix(strataArr, isCore, smoothstep(0.0, 0.25, uT4));
    }
  `}function Ta(){return`
    // base = mix(DUST, LANE, smoothstep(0.55,0.9,w1)) — 무채→레인색
    vec3 acquireColor(float w1, float lane, float bri, float disc, float passedScan,
                      float arrived, vec3 pos, float uTime, float dustLuma, float laneLuma) {
      bri += arrived * ${c(J.BRI)};                     // §11-G.2 구조 기저 휘도 (정지 판독성)
      float acq = smoothstep(${c(re.COLOR_LO)}, ${c(re.COLOR_HI)}, w1);
      vec3 hue = mix(DUST_DIR, laneDir(lane), acq);
      float luma = mix(dustLuma, laneLuma * laneLumaBal(lane), acq); // §11-G.1 레인 밸런싱
      vec3 col = hue * luma * bri;
      // 획득 스파크: 분류 순간 1회 백색 섬광
      float spark = smoothstep(${c(re.SPARK_A)}, ${c(re.SPARK_B)}, w1)
                  * (1.0 - smoothstep(${c(re.SPARK_B)}, ${c(re.SPARK_C)}, w1));
      col += spark * ${c(re.SPARK_GAIN)} * (HI_DIR * ${c(ue.HIGHLIGHT)});
      // 발견 하이라이트: discovery && 스캔 통과 → HIGHLIGHT로, 휘도 ×1.6 (통과 후 지속)
      float d = disc * passedScan;
      col = mix(col, HI_DIR * ${c(ue.HIGHLIGHT)}, d * ${c(re.DISC_MIX)});
      col *= 1.0 + d * ${c(re.DISC_LUMA-1)};
      // 앰비언트 호흡(§11-E): 시간 기반 밝기 파동 (구조 불변)
      col *= 1.0 + arrived * sin(uTime * ${c(ut.TIME)}
              + pos.y * ${c(ut.YFREQ)} + pos.x * ${c(ut.XFREQ)}) * ${c(ut.AMP)};
      return col;
    }
  `}function ga(){return`
    uniform vec3 uCursor, uPulsePos;
    uniform float uCursorRead, uPulseT0, uDiscHi;
    vec3 cursorFx(vec3 col, vec3 pos, float aDisc, float tNow){
      float dxy = length(pos.xy - uCursor.xy);
      // S2 읽기: 커서 근접 레인 로컬 밝힘
      float readNear = smoothstep(${c(I.READ_RADIUS)}, 0.0, dxy);
      col *= 1.0 + readNear * uCursorRead * ${c(I.READ_BOOST)};
      // S3 파문: 호버 지점에서 반경 시간 확장 링(1회 ${c(I.PULSE_LIFE)}s, 시간 감쇠)
      float age = tNow - uPulseT0;
      float live = step(0.0, age) * step(age, ${c(I.PULSE_LIFE)});
      float ringR = age * ${c(I.PULSE_SPEED)};
      float ring = smoothstep(${c(I.PULSE_WIDTH)}, 0.0,
                     abs(length(pos.xy - uPulsePos.xy) - ringR)) * (1.0 - age / ${c(I.PULSE_LIFE)}) * live;
      col *= 1.0 + ring * ${c(I.PULSE_BOOST)};
      // S4 발견 강조: 발견 입자면서 커서 근접
      float discNear = aDisc * smoothstep(${c(I.DISC_WORLD_R)}, 0.0, dxy);
      col *= 1.0 + discNear * uDiscHi * ${c(I.DISC_BOOST)};
      return col;
    }
  `}function qr(){const t=E.GRAPH,e=E.RING,o=E.ANOM;return`
    #define S_GRAPH_AX ${c(t.ANCHOR_X)}
    #define S_RING_AX ${c(e.ANCHOR_X)}
    #define S_RING_CY ${c(e.CENTER_Y)}
    #define S_ANOM_AX ${c(o.ANCHOR_X)}
    #define S_RING_OMEGA ${c(2*Math.PI*e.RATE)}
    #define S_ANOM_OMEGA ${c(2*Math.PI*o.PULSE_HZ)}
    #define S_SIZE_BOOST ${c(xr)}
    #define S_GRAPH_PT_BOOST ${c(t.POINT_BOOST)}
    #define S_ANOM_PT_BOOST ${c(o.POINT_BOOST)}
    float shapeAnchorXR(float st){
      if (st < 1.5) return S_GRAPH_AX;   // 1 그래프선 / 5 정점
      if (st < 2.5) return S_RING_AX;    // 2 링
      if (st < 4.5) return S_ANOM_AX;    // 3 무리 / 4 이상점
      if (st < 5.5) return S_GRAPH_AX;
      return S_ANOM_AX;                  // 6 스트로크
    }
    // 형태 크기 배수: 정점(5)·이상점(4)=hero급 데이터 포인트, 그 외 형태=+20%.
    float shapeSizeBoost(float st){
      if (st < 0.5) return 1.0;
      if (st > 3.5 && st < 4.5) return S_ANOM_PT_BOOST;
      if (st > 4.5 && st < 5.5) return S_GRAPH_PT_BOOST;
      return S_SIZE_BOOST;
    }
    // 형태 시간 변조: 링 회전 호(순환 가시화) + 이상점 펄스. formVis로 S4 형성 구간에 국한
    //   (T4 방사 시 소멸). 비형태·타 형태는 ×1(중립).
    vec3 shapeTimeMod(vec3 col, float st, vec3 pos, float uTime, float formVis){
      if (st > 1.5 && st < 2.5) {              // ② 링: 회전하는 밝은 호
        float ang = atan(pos.y - S_RING_CY, pos.x - S_RING_AX);
        float lobe = 0.5 + 0.5 * cos(ang - uTime * S_RING_OMEGA);
        col *= mix(1.0, 0.4 + 1.2 * lobe, formVis);
      } else if (st > 3.5 && st < 4.5) {       // ③ 이상점: highlight색 ~1.5Hz 펄스
        float pulse = 0.5 + 0.5 * sin(uTime * S_ANOM_OMEGA);
        col *= mix(1.0, 0.7 + 0.9 * pulse, formVis);
      }
      return col;
    }
  `}function Sa(t,e,o=Ne.HALO_POW){return`
    float spriteIntensity(vec2 uv){
      float d = length(uv);
      float halo = pow(max(0.0, 1.0 - d * 2.0), ${c(o)});
      float core = 1.0 - smoothstep(0.0, ${c(t)}, d);
      return halo + core * ${c(e)};
    }
  `}function Yr(t,e={}){const{haloPow:o=Ne.HALO_POW,coreGainMul:a=1,quadsOn:s=!0}=e,r=new So,n=new Float32Array(P*2),i=new Float32Array(P),l=new Float32Array(P),u=new Float32Array(P),p=new Float32Array(P),v=new Float32Array(P),f=new Float32Array(P),d=new Float32Array(P),h=new Float32Array(P),T=new Float32Array(P),S=new Float32Array(P),x=t.texStrata.image.data,y=t.texEco.image.data,m=t.texMeta.image.data,A=t.texSeed.image.data;for(let g=0;g<P;g+=1){const w=g%U,H=Math.floor(g/U);n[g*2]=(w+.5)/U,n[g*2+1]=(H+.5)/U;const V=x[g*4+3],N=x[g*4],X=x[g*4+1],ee=m[g*4],ae=m[g*4+2],Te=A[g*4+2],ne=Math.round(y[g*4+3]),O=Math.floor(ne/64)%2,fe=Math.floor(ne/32)%2,K=Math.floor(ne/128)%8,oe=ne%4===0,ge=!O&&Te>Re.MID_SEEDJIT;i[g]=V,v[g]=N,f[g]=X,d[g]=ee,p[g]=ae,h[g]=fe,T[g]=oe?1:0,S[g]=K,l[g]=O?s?0:Re.HERO_POINT_SIZE:ge?Re.MID_SIZE:Re.DUST_SIZE,u[g]=O?1:ge?Re.MID_BRI:Re.DUST_BRI}r.setAttribute("position",new k(new Float32Array(P*3),3)),r.setAttribute("aRef",new k(n,2)),r.setAttribute("aLane",new k(i,1)),r.setAttribute("aSize",new k(l,1)),r.setAttribute("aBri",new k(u,1)),r.setAttribute("aRowOpenP",new k(p,1)),r.setAttribute("aStrataX",new k(v,1)),r.setAttribute("aStrataY",new k(f,1)),r.setAttribute("aStagger",new k(d,1)),r.setAttribute("aDisc",new k(h,1)),r.setAttribute("aCore",new k(T,1)),r.setAttribute("aShapeType",new k(S,1)),r.setDrawRange(0,P),r.boundingSphere=new Ro(new M(1.2,0,0),40);const _=new Z({transparent:!0,depthWrite:!1,depthTest:!1,blending:Qe,uniforms:{texturePosition:{value:null},textureVelocity:{value:null},uProjScale:{value:1},uSizeDamp:{value:0},uP:{value:0},uTime:{value:0},uScanX:{value:-1.2},uT4:{value:0},uCursor:{value:new M(999,999,999)},uPulsePos:{value:new M(999,999,999)},uCursorRead:{value:0},uPulseT0:{value:-10},uDiscHi:{value:0}},vertexShader:Aa()+Ta()+ga()+qr()+`
      uniform sampler2D texturePosition;
      uniform sampler2D textureVelocity;
      uniform float uProjScale, uSizeDamp, uP, uTime, uScanX, uT4;
      attribute vec2 aRef;
      attribute float aLane, aSize, aBri, aRowOpenP, aStrataX, aStrataY, aStagger, aDisc, aCore, aShapeType;
      varying vec3 vCol;
      varying float vAlpha;
      void main(){
        vec3 pos = texture2D(texturePosition, aRef).xyz;
        vec4 velT = texture2D(textureVelocity, aRef);
        vec3 vel = velT.xyz;
        float w1 = velT.w;                       // §11-A 색 획득 진행
        float speed = length(vel);

        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mv;

        // w2(지층 도착)·w3(eco/T4) 재계산 → 구조 도착 게이트(§11-G.2)·밀집 완화
        float w2 = smoothstep(aRowOpenP, aRowOpenP + 0.012, uP);
        float w3 = smoothstep(aStagger * 0.6, aStagger * 0.6 + 0.28, uT4); // sim §10-D.3 동일식
        float strataArr = smoothstep(${c(J.ARR_LO)}, ${c(J.ARR_HI)}, w2);
        float arrived = structArrived(w2, w3);           // max(지층, eco/T4) — 호흡·기저 휘도
        float dampGate = uSizeDamp * dampMask(strataArr, aCore, uT4); // §11-H.3 코어 한정 게이트

        float isShape = step(0.5, aShapeType);   // §9 R1 인사이트 형태 입자 여부

        // 크기: 1/z 감쇠 + 밀집 완화. 형태는 +20%(정점·이상점 hero급) + 밀집 완화 면제.
        float size = aSize * shapeSizeBoost(aShapeType) * uProjScale / max(0.05, -mv.z);
        size *= (1.0 - dampGate * (1.0 - isShape));
        gl_PointSize = clamp(size, 0.0, 40.0);

        // 스캔 통과 게이트: 형태는 형태 앵커 x 기준(응집·점화 동기), 그 외 지층 슬롯 x.
        float scanRefX = mix(aStrataX, shapeAnchorXR(aShapeType), isShape);
        float passedScan = smoothstep(-${c(tt)}, ${c(tt)}, uScanX - scanRefX);
        // 색 획득 (§11-A): dust 0.35 / lane 0.85 예산 (형태는 발견 하이라이트로 백색 hero급).
        vec3 col = acquireColor(w1, aLane, aBri, aDisc, passedScan, arrived, pos, uTime,
                                ${c(ue.DUST)}, ${c(ue.LANE)});
        vec3 banded = strataRowBand(col, aStrataY, strataArr, w3, ${c(ue.LANE)}); // §11-G.3 행 밴딩
        col = mix(banded, col, isShape);                 // 형태는 행 밴딩 스킵(백색 인사이트 유지)
        col = cursorFx(col, pos, aDisc, uTime);          // §13-E 커서 FX (S4 형태 근접 hover 부스트)
        // §9 R1: 링 회전 호·이상점 펄스 (S4 형성 구간에만 — formVis, T4 방사 시 소멸)
        float formVis = passedScan * (1.0 - smoothstep(0.0, 0.4, uT4));
        col = shapeTimeMod(col, aShapeType, pos, uTime, formVis);

        // FogExp2(#050610) 수동 적용 — additive 이므로 투과율로 감쇠(≈원거리 소멸)
        float dist = -mv.z;
        col *= exp(-${c(Ot)} * ${c(Ot)} * dist * dist);
        vCol = col;

        // 속도 결합 알파 (§11-B) + §11-G.2 도착 알파 하한 + 형태 알파 하한(hero급) + 밀집 완화(형태 면제)
        float aFloor = mix(${c(be.BASE)}, ${c(J.ALPHA_FLOOR_ARR)}, arrived);
        float alpha = clamp(aFloor + speed * ${c(be.GAIN)}, aFloor, ${c(be.MAX)});
        alpha = max(alpha, isShape * ${c(Er)});
        vAlpha = alpha * (1.0 - dampGate * ${c(ca)} * (1.0 - isShape));
      }
    `,fragmentShader:Sa(Ne.CORE_R,Ne.CORE_GAIN*a,o)+`
      precision highp float;
      varying vec3 vCol;
      varying float vAlpha;
      void main(){
        float s = spriteIntensity(gl_PointCoord - 0.5);
        // additive(SrcAlpha,One): 누적 = vCol · (vAlpha·s). 노출·톤매핑은 post(ACES).
        gl_FragColor = vec4(vCol, vAlpha * s);
      }
    `}),C=new aa(r,_);return C.frustumCulled=!1,{points:C,material:_}}function jr(t){const e=t.texEco.image.data,o=t.texStrata.image.data,a=t.texMeta.image.data,s=[],r=[],n=[],i=[],l=[],u=[],p=[],v=[];for(let x=0;x<P;x+=1){const y=Math.round(e[x*4+3]);if(Math.floor(y/64)%2!==1)continue;const m=x%U,A=Math.floor(x/U);s.push((m+.5)/U,(A+.5)/U),r.push(o[x*4+3]),n.push(o[x*4]),i.push(o[x*4+1]),l.push(a[x*4]),u.push(a[x*4+2]),p.push(Math.floor(y/32)%2),v.push(y%4===0?1:0)}const f=r.length,d=new xo(1,1),h=new Wa;h.index=d.index,h.setAttribute("position",d.attributes.position),h.setAttribute("uv",d.attributes.uv),h.setAttribute("aRef",new ie(new Float32Array(s),2)),h.setAttribute("aLane",new ie(new Float32Array(r),1)),h.setAttribute("aStrataX",new ie(new Float32Array(n),1)),h.setAttribute("aStrataY",new ie(new Float32Array(i),1)),h.setAttribute("aStagger",new ie(new Float32Array(l),1)),h.setAttribute("aRowOpenP",new ie(new Float32Array(u),1)),h.setAttribute("aDisc",new ie(new Float32Array(p),1)),h.setAttribute("aCore",new ie(new Float32Array(v),1)),h.instanceCount=f,h.boundingSphere=new Ro(new M(1.2,0,0),40);const T=new Z({transparent:!0,depthWrite:!1,depthTest:!1,blending:Qe,uniforms:{texturePosition:{value:null},textureVelocity:{value:null},uSizeDamp:{value:0},uP:{value:0},uTime:{value:0},uScanX:{value:-1.2},uT4:{value:0},uCursor:{value:new M(999,999,999)},uPulsePos:{value:new M(999,999,999)},uCursorRead:{value:0},uPulseT0:{value:-10},uDiscHi:{value:0}},vertexShader:Aa()+Ta()+ga()+`
      uniform sampler2D texturePosition;
      uniform sampler2D textureVelocity;
      uniform float uSizeDamp, uP, uTime, uScanX, uT4;
      // position(quad 코너 xy∈[-0.5,0.5])·uv 는 ShaderMaterial가 자동 주입 — 재선언 금지.
      attribute vec2 aRef;
      attribute float aLane, aStrataX, aStrataY, aRowOpenP, aStagger, aDisc, aCore;
      varying vec2 vUv;
      varying vec3 vCol;
      varying float vAlpha;
      void main(){
        vUv = uv;
        vec3 pos = texture2D(texturePosition, aRef).xyz;
        vec4 velT = texture2D(textureVelocity, aRef);
        vec3 vel = velT.xyz;
        float w1 = velT.w;
        float speed = length(vel);

        // 도착 게이트(§11-G.2): w2(지층)·w3(eco/T4) 재계산 — sim §10-D.3 동일식
        float w2 = smoothstep(aRowOpenP, aRowOpenP + 0.012, uP);
        float w3 = smoothstep(aStagger * 0.6, aStagger * 0.6 + 0.28, uT4);
        float strataArr = smoothstep(${c(J.ARR_LO)}, ${c(J.ARR_HI)}, w2);
        float arrived = structArrived(w2, w3);

        // 빌보드: 뷰공간 중심 + 뷰공간 속도 정렬 신장(§11-C)
        vec4 mvCenter = modelViewMatrix * vec4(pos, 1.0);
        vec3 velView = (modelViewMatrix * vec4(vel, 0.0)).xyz;
        vec2 dir = length(velView.xy) > 1e-4 ? normalize(velView.xy) : vec2(1.0, 0.0);
        vec2 perp = vec2(-dir.y, dir.x);
        float stretch = clamp(speed * ${c(Fe.STRETCH_GAIN)}, 0.0, ${c(Fe.STRETCH_MAX)});
        // 밀집 완화(§10-E②) — §11-H.3 코어 한정 게이트(T4 이후 코어 잔류체만), hero 크기에도 반영
        float dampGate = uSizeDamp * dampMask(strataArr, aCore, uT4);
        float sz = ${c(Fe.BASE_SIZE)} * (1.0 - dampGate);
        vec2 offs = (dir * position.x * (1.0 + stretch) + perp * position.y) * sz;
        vec4 mv = mvCenter + vec4(offs, 0.0, 0.0);
        gl_Position = projectionMatrix * mv;

        float passedScan = smoothstep(-${c(tt)}, ${c(tt)}, uScanX - aStrataX);
        // hero 휘도 예산 ≥1.3 (dust·lane 모두 HERO_LUMA=1.4), bri=1.0
        vec3 col = acquireColor(w1, aLane, 1.0, aDisc, passedScan, arrived, pos, uTime,
                                ${c(ue.HERO)}, ${c(ue.HERO)});
        col = strataRowBand(col, aStrataY, strataArr, w3, ${c(ue.HERO)}); // §11-G.3 행 밴딩
        col = cursorFx(col, pos, aDisc, uTime);          // §13-E 커서 FX
        float dist = -mv.z;
        col *= exp(-${c(Ot)} * ${c(Ot)} * dist * dist);
        vCol = col;

        // 속도 결합 알파 + §11-G.2 도착 알파 하한 mix(0.10,0.16,arrived)
        float aFloor = mix(${c(be.BASE)}, ${c(J.ALPHA_FLOOR_ARR)}, arrived);
        float alpha = clamp(aFloor + speed * ${c(be.GAIN)}, aFloor, ${c(be.MAX)});
        vAlpha = alpha * (1.0 - dampGate * ${c(ca)});
      }
    `,fragmentShader:Sa(Fe.CORE_R,Fe.CORE_GAIN)+`
      precision highp float;
      varying vec2 vUv;
      varying vec3 vCol;
      varying float vAlpha;
      void main(){
        float s = spriteIntensity(vUv - 0.5);
        gl_FragColor = vec4(vCol, vAlpha * s);
      }
    `}),S=new Nt(h,T);return S.frustumCulled=!1,{quads:S,material:T,heroCount:f}}const St={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};class Ra extends Ge{constructor(e,o="tDiffuse"){super(),this.textureID=o,this.uniforms=null,this.material=null,e instanceof Z?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=Mt.clone(e.uniforms),this.material=new Z({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new Lt(this.material)}render(e,o,a){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=a.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(o),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}}class zo extends Ge{constructor(e,o){super(),this.scene=e,this.camera=o,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,o,a){const s=e.getContext(),r=e.state;r.buffers.color.setMask(!1),r.buffers.depth.setMask(!1),r.buffers.color.setLocked(!0),r.buffers.depth.setLocked(!0);let n,i;this.inverse?(n=0,i=1):(n=1,i=0),r.buffers.stencil.setTest(!0),r.buffers.stencil.setOp(s.REPLACE,s.REPLACE,s.REPLACE),r.buffers.stencil.setFunc(s.ALWAYS,n,4294967295),r.buffers.stencil.setClear(i),r.buffers.stencil.setLocked(!0),e.setRenderTarget(a),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(o),this.clear&&e.clear(),e.render(this.scene,this.camera),r.buffers.color.setLocked(!1),r.buffers.depth.setLocked(!1),r.buffers.color.setMask(!0),r.buffers.depth.setMask(!0),r.buffers.stencil.setLocked(!1),r.buffers.stencil.setFunc(s.EQUAL,1,4294967295),r.buffers.stencil.setOp(s.KEEP,s.KEEP,s.KEEP),r.buffers.stencil.setLocked(!0)}}class Kr extends Ge{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}}class Qr{constructor(e,o){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),o===void 0){const a=e.getSize(new q);this._width=a.width,this._height=a.height,o=new Oe(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:Ye}),o.texture.name="EffectComposer.rt1"}else this._width=o.width,this._height=o.height;this.renderTarget1=o,this.renderTarget2=o.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new Ra(St),this.copyPass.material.blending=qa,this.timer=new Ya}swapBuffers(){const e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,o){this.passes.splice(o,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){const o=this.passes.indexOf(e);o!==-1&&this.passes.splice(o,1)}isLastEnabledPass(e){for(let o=e+1;o<this.passes.length;o++)if(this.passes[o].enabled)return!1;return!0}render(e){this.timer.update(),e===void 0&&(e=this.timer.getDelta());const o=this.renderer.getRenderTarget();let a=!1;for(let s=0,r=this.passes.length;s<r;s++){const n=this.passes[s];if(n.enabled!==!1){if(n.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(s),n.render(this.renderer,this.writeBuffer,this.readBuffer,e,a),n.needsSwap){if(a){const i=this.renderer.getContext(),l=this.renderer.state.buffers.stencil;l.setFunc(i.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),l.setFunc(i.EQUAL,1,4294967295)}this.swapBuffers()}zo!==void 0&&(n instanceof zo?a=!0:n instanceof Kr&&(a=!1))}}this.renderer.setRenderTarget(o)}reset(e){if(e===void 0){const o=this.renderer.getSize(new q);this._pixelRatio=this.renderer.getPixelRatio(),this._width=o.width,this._height=o.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,o){this._width=e,this._height=o;const a=this._width*this._pixelRatio,s=this._height*this._pixelRatio;this.renderTarget1.setSize(a,s),this.renderTarget2.setSize(a,s);for(let r=0;r<this.passes.length;r++)this.passes[r].setSize(a,s)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}class Jr extends Ge{constructor(e,o,a=null,s=null,r=null){super(),this.scene=e,this.camera=o,this.overrideMaterial=a,this.clearColor=s,this.clearAlpha=r,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new Je}render(e,o,a){const s=e.autoClear;e.autoClear=!1;let r,n;this.overrideMaterial!==null&&(n=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(r=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:a),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(r),this.overrideMaterial!==null&&(this.scene.overrideMaterial=n),e.autoClear=s}}const Zr={uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new Je(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`};class De extends Ge{constructor(e,o=1,a,s){super(),this.strength=o,this.radius=a,this.threshold=s,this.resolution=e!==void 0?new q(e.x,e.y):new q(256,256),this.clearColor=new Je(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let r=Math.round(this.resolution.x/2),n=Math.round(this.resolution.y/2);this.renderTargetBright=new Oe(r,n,{type:Ye}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let p=0;p<this.nMips;p++){const v=new Oe(r,n,{type:Ye});v.texture.name="UnrealBloomPass.h"+p,v.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(v);const f=new Oe(r,n,{type:Ye});f.texture.name="UnrealBloomPass.v"+p,f.texture.generateMipmaps=!1,this.renderTargetsVertical.push(f),r=Math.round(r/2),n=Math.round(n/2)}const i=Zr;this.highPassUniforms=Mt.clone(i.uniforms),this.highPassUniforms.luminosityThreshold.value=s,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new Z({uniforms:this.highPassUniforms,vertexShader:i.vertexShader,fragmentShader:i.fragmentShader}),this.separableBlurMaterials=[];const l=[6,10,14,18,22];r=Math.round(this.resolution.x/2),n=Math.round(this.resolution.y/2);for(let p=0;p<this.nMips;p++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(l[p])),this.separableBlurMaterials[p].uniforms.invSize.value=new q(1/r,1/n),r=Math.round(r/2),n=Math.round(n/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=o,this.compositeMaterial.uniforms.bloomRadius.value=.1;const u=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=u,this.bloomTintColors=[new M(1,1,1),new M(1,1,1),new M(1,1,1),new M(1,1,1),new M(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=Mt.clone(St.uniforms),this.blendMaterial=new Z({uniforms:this.copyUniforms,vertexShader:St.vertexShader,fragmentShader:St.fragmentShader,premultipliedAlpha:!0,blending:Qe,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new Je,this._oldClearAlpha=1,this._basic=new ja,this._fsQuad=new Lt(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,o){let a=Math.round(e/2),s=Math.round(o/2);this.renderTargetBright.setSize(a,s);for(let r=0;r<this.nMips;r++)this.renderTargetsHorizontal[r].setSize(a,s),this.renderTargetsVertical[r].setSize(a,s),this.separableBlurMaterials[r].uniforms.invSize.value=new q(1/a,1/s),a=Math.round(a/2),s=Math.round(s/2)}render(e,o,a,s,r){e.getClearColor(this._oldClearColor),this._oldClearAlpha=e.getClearAlpha();const n=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),r&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=a.texture,e.setRenderTarget(null),e.clear(),this._fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=a.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this._fsQuad.render(e);let i=this.renderTargetBright;for(let l=0;l<this.nMips;l++)this._fsQuad.material=this.separableBlurMaterials[l],this.separableBlurMaterials[l].uniforms.colorTexture.value=i.texture,this.separableBlurMaterials[l].uniforms.direction.value=De.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[l]),e.clear(),this._fsQuad.render(e),this.separableBlurMaterials[l].uniforms.colorTexture.value=this.renderTargetsHorizontal[l].texture,this.separableBlurMaterials[l].uniforms.direction.value=De.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[l]),e.clear(),this._fsQuad.render(e),i=this.renderTargetsVertical[l];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this._fsQuad.render(e),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,r&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(a),this._fsQuad.render(e)),e.setClearColor(this._oldClearColor,this._oldClearAlpha),e.autoClear=n}_getSeparableBlurMaterial(e){const o=[],a=e/3;for(let s=0;s<e;s++)o.push(.39894*Math.exp(-.5*s*s/(a*a))/a);return new Z({defines:{KERNEL_RADIUS:e},uniforms:{colorTexture:{value:null},invSize:{value:new q(.5,.5)},direction:{value:new q(.5,.5)},gaussianCoefficients:{value:o}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				#include <common>

				varying vec2 vUv;

				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float gaussianCoefficients[KERNEL_RADIUS];

				void main() {

					float weightSum = gaussianCoefficients[0];
					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;

					for ( int i = 1; i < KERNEL_RADIUS; i ++ ) {

						float x = float( i );
						float w = gaussianCoefficients[i];
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += ( sample1 + sample2 ) * w;

					}

					gl_FragColor = vec4( diffuseSum, 1.0 );

				}`})}_getCompositeMaterial(e){return new Z({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				varying vec2 vUv;

				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor( const in float factor ) {

					float mirrorFactor = 1.2 - factor;
					return mix( factor, mirrorFactor, bloomRadius );

				}

				void main() {

					// 3.0 for backwards compatibility with previous alpha-based intensity
					vec3 bloom = 3.0 * bloomStrength * (
						lerpBloomFactor( bloomFactors[ 0 ] ) * bloomTintColors[ 0 ] * texture2D( blurTexture1, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 1 ] ) * bloomTintColors[ 1 ] * texture2D( blurTexture2, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 2 ] ) * bloomTintColors[ 2 ] * texture2D( blurTexture3, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 3 ] ) * bloomTintColors[ 3 ] * texture2D( blurTexture4, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 4 ] ) * bloomTintColors[ 4 ] * texture2D( blurTexture5, vUv ).rgb
					);

					float bloomAlpha = max( bloom.r, max( bloom.g, bloom.b ) );
					gl_FragColor = vec4( bloom, bloomAlpha );

				}`})}}De.BlurDirectionX=new q(1,0);De.BlurDirectionY=new q(0,1);const ft={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#elif defined( CUSTOM_TONE_MAPPING )

				gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`};class es extends Ge{constructor(){super(),this.isOutputPass=!0,this.uniforms=Mt.clone(ft.uniforms),this.material=new Ka({name:ft.name,uniforms:this.uniforms,vertexShader:ft.vertexShader,fragmentShader:ft.fragmentShader}),this._fsQuad=new Lt(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,o,a){this.uniforms.tDiffuse.value=a.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},Qa.getTransfer(this._outputColorSpace)===Ja&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===Za?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===er?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===tr?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===ra?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===or?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===ar?this.material.defines.NEUTRAL_TONE_MAPPING="":this._toneMapping===rr&&(this.material.defines.CUSTOM_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(o),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}}const ts={uniforms:{tDiffuse:{value:null},uTime:{value:0},uAspect:{value:1}},vertexShader:`
    varying vec2 vUv;
    void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
  `,fragmentShader:`
    precision highp float;
    uniform sampler2D tDiffuse;
    uniform float uTime, uAspect;
    varying vec2 vUv;
    float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
    void main(){
      vec3 col = texture2D(tDiffuse, vUv).rgb;
      // 채도 커브 (약한 부스트)
      float l = dot(col, vec3(0.2126, 0.7152, 0.0722));
      col = mix(vec3(l), col, ${c(de.SAT)});
      // 새도우 블루 리프트 (약간) — 어두운 영역을 네이비로 살짝 들어올림
      float shadow = 1.0 - smoothstep(0.0, 0.4, l);
      col += shadow * vec3(0.0, 0.006, 0.018) * ${c(de.BLUE_LIFT)};
      // 비네트
      vec2 q = (vUv - 0.5) * vec2(uAspect, 1.0);
      col *= clamp(1.0 - ${c(de.VIGNETTE)} * dot(q, q), 0.0, 1.0);
      // 필름 그레인 (§11-G.5 luma 게이트: 다크 영역 억제 → 클린 블랙)
      float gLuma = dot(col, vec3(0.2126, 0.7152, 0.0722));
      float grainAmt = ${c(de.GRAIN)} * mix(${c(de.GRAIN_FLOOR)}, 1.0,
                       smoothstep(${c(de.GRAIN_GATE_LO)}, ${c(de.GRAIN_GATE_HI)}, gLuma));
      float n = hash(vUv * vec2(uAspect, 1.0) * 900.0 + uTime) - 0.5;
      col += n * grainAmt;
      gl_FragColor = vec4(col, 1.0);
    }
  `};function os(t,e,o,a={}){const{bloomOn:s=!0,bloomStrength:r=Tt.STRENGTH}=a,n=t.getDrawingBufferSize(new q),i=new Qr(t);i.setPixelRatio(t.getPixelRatio());const l=new Jr(e,o),u=new De(new q(n.x,n.y),r,Tt.RADIUS,Tt.THRESHOLD);u.enabled=s;const p=new Ra(ts),v=new es;i.addPass(l),i.addPass(u),i.addPass(p),i.addPass(v);function f(d,h){i.setPixelRatio(t.getPixelRatio()),i.setSize(d,h),p.uniforms.uAspect.value=d/h}return f(innerWidth,innerHeight),{composer:i,bloom:u,grade:p,setSize:f}}let ye=0,je=0,Po=0,Co=0,io=!1,lo=null,Ht=1;const xa=t=>Math.min(1,Math.max(0,t));function Ea(){const t=lo?lo.offsetHeight:document.documentElement.scrollHeight;return Math.max(1,t-innerHeight)}function as(){return Math.max(1,document.documentElement.scrollHeight-innerHeight)}function Pa(){return xa(scrollY/Ht)}function Ca(){return xa(scrollY/as())}function rs(){lo=document.querySelector(".v2-track"),Ht=Ea(),ye=Pa(),je=ye,Po=0,Co=Ca()}function ss(){Ht=Ea()}function ns(t){const e=Pa();Math.abs(e-ye)>.02&&(io=!0),ye=e;const o=1-Math.exp(-t*Hr);je+=(ye-je)*o,Po=Math.abs(ye-je),Co=Ca()}function ot(){return je}function is(){return Po}function ls(){return Co}function ya(){return Ht}function cs(){const t=io;return io=!1,t}const dt=[0,0,0],ce=new M;let Ma=0,Oa=0,Yt=0,jt=0;const us=Lr*Math.PI/180;let wa=1;function fs(){return wa}function ds(){Ze||addEventListener("pointermove",t=>{Ma=t.clientX/innerWidth*2-1,Oa=t.clientY/innerHeight*2-1},{passive:!0})}function ba(t,e,o){Bo("camPos",e,dt),Bo("camLook",e,ce);const a=t.aspect,s=Math.min(1.7,Math.max(1,.85/a));wa=s,t.position.set(ce.x+(dt[0]-ce.x)*s,ce.y+(dt[1]-ce.y)*s,ce.z+(dt[2]-ce.z)*s),t.up.set(0,1,0),t.lookAt(ce);const r=1-Math.min(1,hs(e)),n=1-Math.exp(-o*5);Yt+=(Ma-Yt)*n,jt+=(Oa-jt)*n;const i=us*r;t.rotateY(-Yt*i),t.rotateX(-jt*i)}function hs(t){let e=0;for(const o of["uT1","uT2","uT3","uT4"]){const a=D(o,t);e=Math.max(e,4*a*(1-a))}return e}const ht=.004,ps=[{key:"B0",inP:0,outP:.095},{key:"S2",inP:.228,outP:.292},{key:"S3",inP:.408,outP:.452},{key:"S4",inP:.588,outP:.632},{key:"S5",inP:.808,outP:.872},{key:"B6",inP:.905,outP:1}],Vo=t=>`#${t.toString(16).padStart(6,"0")}`;let at=[],co=null,uo=!1;function Xo(){document.documentElement.style.setProperty("--pal-actor",Vo(j.ACTOR)),document.documentElement.style.setProperty("--pal-verb",Vo(j.VERB)),at=ps.map(({key:t,inP:e,outP:o})=>{const a=document.querySelector(`.copy-block[data-block="${t}"]`);return a?{key:t,inP:e,outP:o,el:a,active:!1}:(console.error(`[v2/copy] .copy-block[data-block="${t}"] DOM 누락`),null)}).filter(Boolean),co=document.querySelector(".progress__bar"),uo=!1}function vs(t){for(let e=0;e<at.length;e+=1){const o=at[e];let a;if(!uo)a=t>=o.inP&&t<=o.outP;else{const s=o.active?o.inP-ht:o.inP+ht,r=o.active?o.outP+ht:o.outP-ht;a=t>=s&&t<=r}a!==o.active&&(o.active=a,o.el.classList.toggle("is-active",a),o.el.setAttribute("aria-hidden",a?"false":"true"))}co&&(co.style.transform=`scaleX(${ls()})`),uo=!0}function ms(){for(let t=0;t<at.length;t+=1){const e=at[t];e.active=!0,e.el.classList.add("is-active"),e.el.setAttribute("aria-hidden","false")}}const pt=.004,_s=8.5,As=12,Kt=2.35,Ts=[0,0],gs=[48,26],Qt=t=>`#${t.toString(16).padStart(6,"0")}`,Ss=t=>Math.min(1,Math.max(0,t)),Ve=t=>[Y[t][0],Y[t][1]+yr,Y[t][2]],Xe={fadeNear:Fo[0],fadeFar:Fo[1]},Rs=[{key:"ACTOR",anchor:[me[0],Kt,0],inP:.215,outP:.315,color:Qt(j.ACTOR)},{key:"VERB",anchor:[me[1],Kt,0],inP:.215,outP:.315,color:Qt(j.VERB)},{key:"OBJECT",anchor:[me[2],Kt,0],inP:.215,outP:.315,color:Qt(j.OBJECT)},{key:"LRS",anchor:[3.05,.45,0],inP:.405,outP:.575},{key:"LAP",anchor:[1.2,1.5,0],inP:.585,outP:.635},{key:"N0",anchor:Ve(0),inP:Ee,outP:Ue,node:0,...Xe},{key:"N1",anchor:Ve(1),inP:Ee,outP:Ue,node:1,...Xe},{key:"N2",anchor:Ve(2),inP:Ee,outP:Ue,node:2,offset:gs,...Xe},{key:"N3",anchor:Ve(3),inP:Ee,outP:Ue,node:3,...Xe},{key:"N4",anchor:Ve(4),inP:Ee,outP:Ue,node:4,...Xe}],xs=[{key:"SRC0",cluster:0},{key:"SRC1",cluster:2},{key:"SRC2",cluster:5},{key:"SRC3",cluster:6}];function Es(){const t=Fr(),[e,o]=br,a=xs.map(({key:r,cluster:n})=>{const i=t[n],l=.1+n/et*.1;return{key:r,anchor:[i[0],i[1]+Mr,i[2]],inP:Or,outP:l+wr,fadeNear:e,fadeFar:o}}),s={key:"GATE01",anchor:[Wt[0],Wt[1],Wt[2]],inP:Uo[0],outP:Uo[1],fadeNear:e,fadeFar:o};return[...a,s]}let fo=[];const ho={};let ko=-1,po=!1;const xe=new M,Wo=new M;function Ps(){fo=[...Rs,...Es()].map(e=>{const o=document.querySelector(`.label[data-anchor="${e.key}"]`);return o?(e.color&&(o.style.color=e.color),e.node!==void 0&&(ho[e.node]=o),{...e,el:o,active:!1}):(console.error(`[v2/labels] .label[data-anchor="${e.key}"] DOM 누락`),null)}).filter(Boolean),po=!1}function Cs(t){if(t!==ko){ko=t;for(const e in ho)ho[e].classList.toggle("is-hi",Number(e)===t)}}function ys(t,e){const o=innerWidth,a=innerHeight;for(let s=0;s<fo.length;s+=1){const r=fo[s];let n;if(!po)n=e>=r.inP&&e<=r.outP;else{const h=r.active?r.inP-pt:r.inP+pt,T=r.active?r.outP+pt:r.outP-pt;n=e>=h&&e<=T}if(r.active=n,!n){r.el.style.opacity="0";continue}if(xe.set(r.anchor[0],r.anchor[1],r.anchor[2]),Wo.copy(xe).applyMatrix4(t.matrixWorldInverse),Wo.z>0){r.el.style.opacity="0";continue}const i=r.fadeNear!==void 0?r.fadeNear:_s,l=r.fadeFar!==void 0?r.fadeFar:As,u=t.position.distanceTo(xe)/fs(),p=1-Ss((u-i)/(l-i));if(p<=.001){r.el.style.opacity="0";continue}xe.project(t);const v=r.offset||Ts,f=(xe.x*.5+.5)*o+v[0],d=(-xe.y*.5+.5)*a+v[1];r.el.style.transform=`translate3d(${f}px, ${d}px, 0)`,r.el.style.opacity=String(p)}po=!0}const Ms=2.35,qo=[j.ACTOR,j.VERB,j.OBJECT],Yo=t=>`#${t.toString(16).padStart(6,"0")}`,Na=t=>Math.min(1,Math.max(0,t)),Os=t=>1-(1-t)*(1-t),Le=(t,e,o)=>{const a=Na((o-t)/(e-t));return a*a*(3-2*a)},ws=t=>t.toLocaleString("en-US"),jo=new M,Jt=new M;let ct=null;function bs(){const t=document.querySelector("#v2-devices");if(!t){console.error("[v2/devices] #v2-devices DOM 누락");return}const e=[0,1,2].map(n=>t.querySelector(`.device-frag[data-frag="${n}"]`)),o=[0,1,2].map(n=>t.querySelector(`.device-annot[data-annot="${n}"]`)),a=t.querySelector(".device-card"),s=t.querySelector(".device-counter");e.forEach((n,i)=>{n.textContent=b.WORDS[i],n.style.borderColor=Yo(qo[i]),n.style.color=Yo(qo[i])}),a.querySelector(".device-card__stmt").textContent=b.WORDS.join(" · "),a.querySelector(".device-card__cap").textContent=b.CARD_CAPTION,s.querySelector(".device-counter__label").textContent=Q.LABEL,s.querySelector(".device-counter__cap").textContent=Q.CAPTION;const r=s.querySelector(".device-counter__num");o.forEach((n,i)=>{n.textContent=ua[i].text}),ct={root:t,frags:e,annots:o,card:a,counter:s,counterNum:r}}function yo(t,e,o,a){jo.set(e,o,a).applyMatrix4(t.matrixWorldInverse);const s=jo.z>0;return Jt.set(e,o,a).project(t),{x:(Jt.x*.5+.5)*innerWidth,y:(-Jt.y*.5+.5)*innerHeight,behind:s}}function Ns(t,e){ct&&(Is(t,e),Ds(t,e),Ls(t,e))}function Is(t,e){const{frags:o,card:a}=ct,s=(Ze?b.TARGET_VW_MOBILE:b.TARGET_VW)*innerWidth,r=(Ze?b.TARGET_VH_MOBILE:b.TARGET_VH)*innerHeight,n=Na((e-b.P_FLY0)/(b.P_FLY1-b.P_FLY0)),i=Os(n),l=e>=b.P_APPEAR&&e<b.P_FLY1,u=Le(b.P_APPEAR,b.P_APPEAR+.0025,e);for(let S=0;S<3;S+=1){const x=o[S];if(!l){x.style.opacity="0";continue}const y=yo(t,me[S],Ms,0),m=y.x,A=y.y+b.SPAWN_BELOW_PX;let _=m+(s-m)*i,C=A+(r-A)*i;const g=s-m,w=r-A,H=Math.hypot(g,w)||1,V=b.ARC_PX*Math.sin(Math.PI*n);_+=-w/H*V,C+=g/H*V,x.style.transform=`translate(${_}px, ${C}px) translate(-50%, -50%)`,x.style.opacity=String(u)}if(!(e>=b.P_FLY1&&e<b.P_GONE)){a.style.opacity="0";return}const v=Le(b.P_HOLD1,b.P_GONE,e),f=1-.42*v,d=v*44,h=1-v;a.style.transform=`translate(${s}px, ${r+d}px) translate(-50%, -50%) scale(${f})`,a.style.opacity=String(h);const T=Math.exp(-(((e-b.P_FLY1)/.0035)**2));a.style.boxShadow=`0 0 ${10+T*26}px rgba(140, 232, 255, ${.25+T*.65})`,a.style.borderColor=`rgba(190, 240, 255, ${.5+T*.5})`}function Ds(t,e){const{counter:o,counterNum:a}=ct;if(!(e>=Q.IN_P&&e<=Q.OUT1_P)){o.style.opacity="0";return}const r=yo(t,Q.ANCHOR[0],Q.ANCHOR[1],Q.ANCHOR[2]);if(r.behind){o.style.opacity="0";return}const n=Math.floor(D("rowsOpen",e)*Q.CAPACITY);a.textContent=ws(n);const i=Le(Q.IN_P,Q.IN_P+.008,e)*(1-Le(Q.OUT0_P,Q.OUT1_P,e));o.style.transform=`translate(${r.x}px, ${r.y}px) translate(-50%, -50%)`,o.style.opacity=String(i)}function Ls(t,e){const{annots:o}=ct,a=D("scanX",e),s=1-Le(Go[0],Go[1],e);for(let r=0;r<3;r+=1){const n=o[r],i=ua[r],u=Le(i.x-.05,i.x+.05,a)*s;if(u<=.001){n.style.opacity="0";continue}const p=yo(t,i.x,i.y,0);if(p.behind){n.style.opacity="0";continue}n.style.transform=`translate(${p.x}px, ${p.y}px) translate(-50%, -50%)`,n.style.opacity=String(u)}}const vt=.004,Hs=[{key:"S2",inP:.232,outP:.292},{key:"S3",inP:.41,outP:.452},{key:"S4",inP:.59,outP:.632},{key:"S5",inP:.808,outP:.872}],Ko=4e3,Gs=560,Fs=3;let We=[],vo=!1,ve=null,mt=0,mo=0,Rt=-1,Ia=!1,xt=[],rt=-1,Qo=-1;const Us=t=>Math.min(1,Math.max(0,t));function Bs(){if(We=Hs.map(({key:t,inP:e,outP:o})=>{const a=document.querySelector(`.dock[data-dock="${t}"]`);return a?{key:t,inP:e,outP:o,el:a,active:!1}:(console.error(`[v2/docks] .dock[data-dock="${t}"] DOM 누락`),null)}).filter(Boolean),ve=document.querySelector('.dock[data-dock="S2"] .dock-ticker__track'),ve){const t=Array.from(ve.children);mo=t.length;for(let e=0;e<Fs;e+=1){const o=t[e%mo].cloneNode(!0);o.setAttribute("aria-hidden","true"),o.dataset.clone="1",ve.appendChild(o)}}xt=Array.from(document.querySelectorAll('.dock[data-dock="S5"] .dock-chip')).map(t=>{const e=Number(t.dataset.node);return t.addEventListener("pointerenter",()=>{rt=e}),t.addEventListener("pointerleave",()=>{rt=-1}),{node:e,el:t}}),vo=!1}function $s(t,e){for(let o=0;o<We.length;o+=1){const a=We[o];let s;if(!vo)s=t>=a.inP&&t<=a.outP;else{const r=a.active?a.inP-vt:a.inP+vt,n=a.active?a.outP+vt:a.outP-vt;s=t>=r&&t<=n}s!==a.active&&(a.active=s,a.el.classList.toggle("is-shown",s),a.el.setAttribute("aria-hidden",s?"false":"true"),a.key==="S2"&&s&&(Rt=e),a.key==="S5"&&(Ia=s,s||(rt=-1,Mo(-1))))}ve&&We.length&&We[0].active&&zs(e),vo=!0}function zs(t){if(mt<=0){const i=ve.children[0];if(mt=i?i.getBoundingClientRect().height:0,mt<=0)return}Rt<0&&(Rt=t);const e=t-Rt,o=Math.floor(e/Ko),a=e-o*Ko,s=Us(a/Gs),r=s*s*(3-2*s),n=(o+r)%mo;ve.style.transform=`translateY(${-n*mt}px)`}function Mo(t){if(t!==Qo){Qo=t;for(let e=0;e<xt.length;e+=1)xt[e].el.classList.toggle("is-hi",xt[e].node===t)}}function Vs(){return Ia?rt:-1}function Xs(){rt=-1,Mo(-1)}function ks(t){let e=t>>>0;return()=>(e^=e<<13,e^=e>>>17,e^=e<<5,(e>>>0)/4294967296)}function Ws(t){const e=new xo(he.PLANE_Z,he.PLANE_H),o=new Z({transparent:!0,depthWrite:!1,depthTest:!1,blending:Qe,uniforms:{uAlpha:{value:0}},vertexShader:`
      varying vec2 vUv;
      void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
    `,fragmentShader:`
      precision highp float;
      uniform float uAlpha;
      varying vec2 vUv;
      void main(){
        // 시안-화이트 수직 그라데이션 (하단 시안 → 상단 화이트)
        vec3 col = mix(vec3(0.35, 0.9, 1.0), vec3(0.9, 0.98, 1.0), vUv.y);
        // 코어 알파 + 가장자리 페이드 (y·z 양축)
        float ex = smoothstep(0.0, 0.14, vUv.x) * smoothstep(1.0, 0.86, vUv.x);
        float ey = smoothstep(0.0, 0.10, vUv.y) * smoothstep(1.0, 0.90, vUv.y);
        float a = ${c(he.PLANE_ALPHA)} * uAlpha * ex * ey;
        gl_FragColor = vec4(col, a);
      }
    `}),a=new Nt(e,o);a.rotation.y=Math.PI/2,a.position.set(-1.2,Rr,0),a.frustumCulled=!1,t.add(a);const s=G.COUNT,r=new Float32Array(s*3),n=new Float32Array(s),i=ks(5369175);for(let h=0;h<s;h+=1){const T=h/s*Math.PI*2;n[h]=T;const S=(i()-.5)*2*G.JITTER,x=(i()-.5)*2*G.JITTER,y=(i()-.5)*2*G.JITTER;r[h*3]=se[0]+Math.cos(T)*G.RADIUS+S,r[h*3+1]=se[1]+Math.sin(T)*G.RADIUS+x,r[h*3+2]=se[2]+y}const l=new So;l.setAttribute("position",new k(r,3)),l.setAttribute("aAngle",new k(n,1)),l.boundingSphere=new Ro(new M(se[0],se[1],se[2]),G.RADIUS+1);const u=2*Math.PI*G.RATE,p=new Z({transparent:!0,depthWrite:!1,depthTest:!1,blending:Qe,uniforms:{uAlpha:{value:0},uTime:{value:0},uProjScale:{value:1e3}},vertexShader:`
      uniform float uAlpha, uTime, uProjScale;
      attribute float aAngle;
      varying float vBri;
      void main(){
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        // 해상도 독립 포인트 크기 (1/z 감쇠) — 인접 중첩 → 연속 발광 원주
        gl_PointSize = clamp(${c(G.POINT_WORLD)} * uProjScale / max(0.05, -mv.z), 0.0, 40.0);
        // 밝은 호 시간 순환: 회전하는 로브(§10-C 닫힌 위상 — uTime만 소비)
        float lobe = 0.5 + 0.5 * cos(aAngle - uTime * ${c(u)});
        vBri = ${c(G.ARC_BASE)} + ${c(G.ARC_GAIN)} * lobe;
      }
    `,fragmentShader:`
      precision highp float;
      uniform float uAlpha;
      varying float vBri;
      void main(){
        float d = length(gl_PointCoord - 0.5);
        float sprite = smoothstep(0.5, 0.0, d);          // 소프트 원형 스프라이트
        float hot = clamp(vBri - ${c(G.ARC_BASE)}, 0.0, 1.0); // 0 기저 → 1 호 정점
        // 시안 기저 → 밝은 호일수록 화이트 편향. vBri를 색에 곱해 additive 기여를 선형화.
        vec3 col = mix(vec3(0.30, 0.85, 1.0), vec3(0.85, 0.97, 1.0), hot) * vBri;
        gl_FragColor = vec4(col, sprite * uAlpha);
      }
    `}),v=new aa(l,p);v.frustumCulled=!1,t.add(v);function f({p:h,scanX:T,t:S=0}){a.position.x=T;const x=_t(he.PLANE_IN[0],he.PLANE_IN[1],h)*(1-_t(he.PLANE_OUT[0],he.PLANE_OUT[1],h));o.uniforms.uAlpha.value=x;const y=_t(G.ALPHA_IN[0],G.ALPHA_IN[1],h)*(1-_t(G.ALPHA_OUT[0],G.ALPHA_OUT[1],h));p.uniforms.uAlpha.value=y,p.uniforms.uTime.value=S}function d(h){p.uniforms.uProjScale.value=h}return{update:f,setProjScale:d}}function _t(t,e,o){const a=Math.min(1,Math.max(0,(o-t)/(e-t)));return a*a*(3-2*a)}function qs(){const t=new URLSearchParams(location.search).get("tier");return t==="high"||t==="mid"||t==="low"?t:null}function Ys(t){if(t.length===0)return 999;const e=t.slice().sort((a,s)=>a-s),o=e.length>>1;return e.length%2?e[o]:(e[o-1]+e[o])/2}function Jo(t){return new Promise(e=>{setTimeout(e,t)})}const Zt=512;function js(t,e){return new Promise(o=>{const a=new Oe(Zt,Zt,{type:Ye}),s=new sa,r=new oa(-1,1,1,-1,0,1),n=new xo(2,2),i=new Z({uniforms:{uTime:{value:0}},vertexShader:`
        void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }
      `,fragmentShader:pa+`
        precision highp float;
        uniform float uTime;
        void main(){
          vec2 uv = gl_FragCoord.xy / ${Zt.toFixed(1)};
          vec3 p = vec3((uv - 0.5) * 6.0, uTime * 0.3);
          vec3 c = curl3(p) + curl3(p * 1.6 + 5.0) + curl3(p * 2.4 - 3.0);
          c += curl3(p * 0.7 + uTime) * 0.5;
          gl_FragColor = vec4(c * 0.5 + 0.5, 1.0);
        }
      `}),l=new Nt(n,i);s.add(l);const u=[],p=performance.now(),v=t.getRenderTarget();function f(){t.setRenderTarget(v),n.dispose(),i.dispose(),a.dispose()}function d(h){const T=performance.now();i.uniforms.uTime.value=h*.001,t.setRenderTarget(a),t.render(s,r),u.push(performance.now()-T);const S=performance.now()-p;e&&e(Math.min(1,S/F.BENCH_MS)),S<F.BENCH_MS?requestAnimationFrame(d):(f(),o(Ys(u)))}requestAnimationFrame(d)})}async function Ks(t,e){const o=qs();if(o)return{tier:o,benched:!1,median:null};if(Ze)return{tier:"low",benched:!1,median:null};const a=await js(t,e);return{tier:a<F.BENCH_HIGH_MS?"high":a<F.BENCH_MID_MS?"mid":"low",benched:!0,median:a}}function Qs(t){return F.PARAMS[t]||F.PARAMS.high}function Js(){const t=document.querySelector("#v2-loader"),e=t?t.querySelector(".v2-loader__fill"):null,o=performance.now();return t||console.error("[v2/tiers] #v2-loader DOM 누락"),{setProgress(a){e&&(e.style.transform=`scaleX(${Math.max(0,Math.min(1,a))})`)},async finish(){const a=performance.now()-o,s=Math.min(F.LOADER_MAX_MS,Math.max(F.LOADER_MIN_MS,a))-a;s>0&&await Jo(s),t&&(t.classList.add("is-hidden"),await Jo(F.LOADER_FADE_MS),t.setAttribute("aria-hidden","true"),t.style.display="none")}}}const Da=new URLSearchParams(location.search).get("debug")==="1",Me=matchMedia("(prefers-reduced-motion: reduce)").matches,Zs=120,en=Math.ceil(Zs/L.WARM_SUBSTEPS)-1,tn=document.querySelector("#v2-canvas"),W=new sr({canvas:tn,antialias:!1,alpha:!1,powerPreference:"high-performance"});W.setPixelRatio(Math.min(devicePixelRatio,gr));W.setClearColor(lr,1);W.toneMapping=ra;W.toneMappingExposure=1;W.capabilities.isWebGL2===!1&&console.error("[v2] WebGL2 미지원 — Phase 0은 WebGL2 전제입니다.");const qe=new sa,B=new nr(Nr,1,Ir,Dr);B.position.set(0,3.5,11);let Zo=null,z=null,eo=null,$=null,wt=0,st=null,Ae=null,La=!1,Et="high";function on(t){ir(t.size);const e=Ur();Wr(W,e);const o=Yr(e,t);if(Zo=o.points,z=o.material,qe.add(Zo),t.quadsOn){const a=jr(e);eo=a.quads,$=a.material,wt=a.heroCount,qe.add(eo)}else eo=null,$=null,wt=0;st=Ws(qe),Ae=os(W,qe,B,t),La=!0}function Ha({p:t,t:e,scanX:o,uT4:a,sizeDamp:s,posTex:r,velTex:n,cursor:i,cursorRead:l,pulsePos:u,pulseT0:p,discHi:v}){z.uniforms.texturePosition.value=r,z.uniforms.textureVelocity.value=n,z.uniforms.uSizeDamp.value=s,z.uniforms.uP.value=t,z.uniforms.uTime.value=e,z.uniforms.uScanX.value=o,z.uniforms.uT4.value=a,z.uniforms.uCursor.value.copy(i),z.uniforms.uCursorRead.value=l,z.uniforms.uPulsePos.value.copy(u),z.uniforms.uPulseT0.value=p,z.uniforms.uDiscHi.value=v,$&&($.uniforms.texturePosition.value=r,$.uniforms.textureVelocity.value=n,$.uniforms.uSizeDamp.value=s,$.uniforms.uP.value=t,$.uniforms.uTime.value=e,$.uniforms.uScanX.value=o,$.uniforms.uT4.value=a,$.uniforms.uCursor.value.copy(i),$.uniforms.uCursorRead.value=l,$.uniforms.uPulsePos.value.copy(u),$.uniforms.uPulseT0.value=p,$.uniforms.uDiscHi.value=v)}const to=new M(999,999,999);let nt=0;function _o(t,e=0){ba(B,t,0),B.updateMatrixWorld();const o=D("attractK",t),a=D("turb",t),s=D("scanX",t),r=D("coreShrink",t),n=D("uT4",t),i=D("sizeDensityDamp",t),l={p:t,time:0,k:o,turb:a,velP:0,scanX:s,coreShrink:r,uT4:n,jumped:!0,cursor:to,cursorRepel:0,cursorDamp:0,edgePhase:[0,0,0,0,0]};for(let v=0;v<=e;v+=1)va(l);const u=ma(),p=_a();Ha({p:t,t:0,scanX:s,uT4:n,sizeDamp:i,posTex:u,velTex:p,cursor:to,cursorRead:0,pulsePos:to,pulseT0:-10,discHi:0}),st.update({p:t,scanX:s,t:0}),W.toneMappingExposure=D("exposure",t),Ae.grade.uniforms.uTime.value=0,Ae.composer.render(),nt=t}const it=new M(999,999,999),Ao=new M(999,999,999);let To=-10,Oo=-1,wo=-1,Ke=!1;const ke=new M,At=new M,ea=[0,0,0,0,0],oo=[1,1,1,1,1];function Ga(t,e,o,a){ke.set(e/innerWidth*2-1,-(o/innerHeight)*2+1,.5),ke.unproject(t),ke.sub(t.position).normalize();const s=-t.position.z/ke.z;a.copy(t.position).addScaledVector(ke,s)}function Fa(){Ga(B,Oo,wo,it)}function an(t){let e=-1,o=t*t;for(let a=0;a<Y.length;a+=1){if(At.set(Y[a][0],Y[a][1],Y[a][2]).project(B),At.z>1)continue;const s=(At.x*.5+.5)*innerWidth,r=(-At.y*.5+.5)*innerHeight,n=s-Oo,i=r-wo,l=n*n+i*i;l<o&&(o=l,e=a)}return e}function rn(){if(Ze){addEventListener("pointerdown",t=>{const e=ot();e>=.4&&e<=.46&&(Ga(B,t.clientX,t.clientY,Ao),To=performance.now()*.001)},{passive:!0});return}addEventListener("pointermove",t=>{Oo=t.clientX,wo=t.clientY,Ke=!0,Fa();const e=ot();e>=.4&&e<=.46&&(Ao.copy(it),To=performance.now()*.001)},{passive:!0}),addEventListener("pointerleave",()=>{Ke=!1,it.set(999,999,999)})}const bt=document.querySelector("#v2-hud");Da&&bt&&bt.classList.add("on");let Pt=16;function bo(){const t=innerWidth,e=innerHeight;if(W.setSize(t,e,!1),B.aspect=t/e,B.updateProjectionMatrix(),z){const a=.5*W.getDrawingBufferSize(new q).y*B.projectionMatrix.elements[5];z.uniforms.uProjScale.value=a,st&&st.setProjScale(a)}Ae&&Ae.setSize(t,e),Me||ss(),Me&&La&&_o(nt||F.WARM_P[F.WARM_P.length-1])}addEventListener("resize",bo,{passive:!0});bo();let go=performance.now(),_e=0,Ua=0,lt=!0,Ct=0;function No(t){let e=(t-go)/1e3;go=t,e>.05&&(e=.05),Ua+=1,ns(e);const o=ot(),a=is(),s=cs()||Ct>0;Ct>0&&(Ct-=1);const r=t*.001,n=performance.now();ba(B,o,e),B.updateMatrixWorld(),Ke&&Fa();const i=D("attractK",o),l=D("turb",o)+Math.min(.6,a*20),u=D("scanX",o),p=D("coreShrink",o),v=D("uT4",o),f=D("sizeDensityDamp",o),d=D("cursorRepel",o),h=D("cursorDamp",o),T=Ke&&o>=Ee&&o<=.9?an(I.NODE_RADIUS_PX):-1,S=T>=0?T:Vs();Cs(S),Mo(S);const x=1-Math.exp(-e*I.LERP);for(let C=1;C<=4;C+=1){const g=T===C?I.EDGE_BOOST_HI:1;oo[C]+=(g-oo[C])*x,ea[C]+=e*I.EDGE_BASE_RATE*oo[C]}va({p:o,time:r,k:i,turb:l,velP:a,scanX:u,coreShrink:p,uT4:v,jumped:s,cursor:it,cursorRepel:d,cursorDamp:h,edgePhase:ea});const y=ma(),m=_a(),A=Ke&&o>=I.DISC_WIN[0]&&o<=I.DISC_WIN[1]?1:0;Ha({p:o,t:r,scanX:u,uT4:v,sizeDamp:f,posTex:y,velTex:m,cursor:it,cursorRead:h,pulsePos:Ao,pulseT0:To,discHi:A}),W.toneMappingExposure=D("exposure",o),Ae.grade.uniforms.uTime.value=r,Ns(B,o),vs(o),$s(o,t),ys(B,o),st.update({p:o,scanX:u,t:r}),Ae.composer.render(),nt=o;const _=performance.now()-n;Pt+=(_-Pt)*.1,Da&&bt&&(bt.textContent=`P ${o.toFixed(4)}
seg ${na(o)}
tier ${Et}
frame ${Pt.toFixed(1)} ms (post)
particles ${P.toLocaleString()} (${U}²) · hero ${wt.toLocaleString()}`),_e=requestAnimationFrame(No)}const He=document.querySelector(".v2-stage");function sn(){lt&&(lt=!1,_e&&(cancelAnimationFrame(_e),_e=0),He&&He.classList.add("is-idle"),Xs())}function nn(){lt||(lt=!0,He&&He.classList.remove("is-idle"),go=performance.now(),Ct=L.WARM_FRAMES,_e||(_e=requestAnimationFrame(No)))}function ln(){if(!He||typeof IntersectionObserver>"u")return;new IntersectionObserver(e=>{for(let o=0;o<e.length;o+=1)e[o].isIntersecting?nn():sn()},{threshold:0}).observe(He)}function cn(){const t=document.querySelector('[data-film-cta="infra"]');t&&t.addEventListener("click",e=>{e.preventDefault(),scrollTo({top:ya(),behavior:"smooth"})})}async function un(){const t=Js();t.setProgress(.02);let e;try{e=await Ks(W,a=>t.setProgress(.02+a*.55))}catch(a){console.error("[v2/tiers] 티어 벤치 실패 — high로 폴백",a),e={tier:"high",benched:!1,median:null}}Et=e.tier;const o=Qs(Et);t.setProgress(.6),W.setPixelRatio(Math.min(devicePixelRatio,o.pixelRatioCap)),on(o),bo(),t.setProgress(.72),await W.compileAsync(qe,B),t.setProgress(.85);for(let a=0;a<F.WARM_P.length;a+=1)_o(F.WARM_P[a]),t.setProgress(.85+(a+1)/F.WARM_P.length*.15);if(await t.finish(),window.__v2={ready:!0,tier:Et,tierBench:e,reducedMotion:Me,getP:()=>Me?nt:ot(),seg:()=>na(Me?nt:ot()),count:P,heroCount:wt,frameMs:()=>Pt,frames:()=>Ua,filmActive:()=>lt,scrollToP:a=>{scrollTo(0,a*ya())},projectWorld:(a,s,r)=>{const n=new M(a,s,r).project(B);return{x:(n.x*.5+.5)*innerWidth,y:(-n.y*.5+.5)*innerHeight,behind:n.z>1}}},Me){_o(F.WARM_P[F.WARM_P.length-1],en),Xo(),ms();return}rs(),ds(),Xo(),Ps(),bs(),Bs(),rn(),cn(),_e=requestAnimationFrame(No),ln()}un();(function(){var t=document,e=t.documentElement,o=window,a=o.matchMedia&&o.matchMedia("(prefers-reduced-motion: reduce)").matches,s="IntersectionObserver"in o;e.classList.add("site-js"),(function(){var r=t.getElementById("hdr"),n=t.querySelector(".site-info");if(!r||!n)return;var i=0;function l(){i=n.getBoundingClientRect().top+(o.scrollY||o.pageYOffset||0)}function u(){r.classList.toggle("on-info",(o.scrollY||o.pageYOffset||0)+72>=i)}l(),u(),o.addEventListener("scroll",u,{passive:!0}),o.addEventListener("resize",function(){l(),u()},{passive:!0})})(),(function(){var r=t.getElementById("menuBtn"),n=t.getElementById("drawer");if(!r||!n)return;var i=!1,l=null;function u(){return[r].concat([].slice.call(n.querySelectorAll("a[href],button:not([disabled])")))}function p(v){i=v,r.setAttribute("aria-expanded",i?"true":"false"),r.setAttribute("aria-label",i?"메뉴 닫기":"메뉴 열기"),i?(clearTimeout(l),n.hidden=!1,o.requestAnimationFrame(function(){n.classList.add("open");var f=n.querySelector("a[href]");f&&f.focus()}),e.classList.add("nav-open"),t.body.style.overflow="hidden"):(n.classList.remove("open"),e.classList.remove("nav-open"),t.body.style.overflow="",r.focus(),l=setTimeout(function(){i||(n.hidden=!0)},420))}r.addEventListener("click",function(){p(!i)}),n.querySelectorAll("a").forEach(function(v){v.addEventListener("click",function(){p(!1)})}),o.addEventListener("keydown",function(v){if(i){if(v.key==="Escape"){v.preventDefault(),p(!1);return}if(v.key==="Tab"){var f=u(),d=f[0],h=f[f.length-1];v.shiftKey&&t.activeElement===d?(v.preventDefault(),h.focus()):(!v.shiftKey&&t.activeElement===h||f.indexOf(t.activeElement)<0)&&(v.preventDefault(),d.focus())}}})})(),(function(){var r=[].slice.call(t.querySelectorAll(".rv"));if(a||!s){r.forEach(function(u){u.classList.add("in")});return}var n=r.filter(function(u){return!u.closest(".stag")}),i=[].slice.call(t.querySelectorAll(".stag")),l=new IntersectionObserver(function(u){u.forEach(function(p){if(p.isIntersecting){var v=p.target;v.classList.contains("stag")?[].slice.call(v.querySelectorAll(".rv")).forEach(function(f,d){f.style.transitionDelay=d*.07+"s",f.classList.add("in")}):v.classList.add("in"),l.unobserve(v)}})},{threshold:.12,rootMargin:"0px 0px -5% 0px"});n.forEach(function(u){l.observe(u)}),i.forEach(function(u){l.observe(u)})})(),(function(){var r=[].slice.call(t.querySelectorAll("[data-count]"));if(!r.length)return;function n(l){var u=parseInt(l.getAttribute("data-count"),10),p=performance.now(),v=1200;(function f(d){var h=Math.min(1,(d-p)/v),T=1-Math.pow(1-h,3);l.textContent=String(Math.round(u*T)),h<1&&o.requestAnimationFrame(f)})(performance.now())}if(a||!s){r.forEach(function(l){l.textContent=l.getAttribute("data-count")});return}r.forEach(function(l){l.setAttribute("aria-hidden","true");var u=t.createElement("span");u.className="sr-only",u.textContent=l.getAttribute("data-count"),l.parentNode.insertBefore(u,l.nextSibling),l.textContent="0"});var i=new IntersectionObserver(function(l){l.forEach(function(u){u.isIntersecting&&(n(u.target),i.unobserve(u.target))})},{threshold:.6});r.forEach(function(l){i.observe(l)})})(),(function(){var r=[].slice.call(t.querySelectorAll(".ncard"));function n(l,u){var p=l.querySelector(".nmore");p&&p.firstChild&&(p.firstChild.nodeValue=u)}function i(l){l.classList.remove("open"),l.querySelector(".nhead").setAttribute("aria-expanded","false"),l.querySelector(".npanel").style.height="0px",n(l,"자세히 보기 ")}r.forEach(function(l){var u=l.querySelector(".nhead"),p=l.querySelector(".npanel");!u||!p||u.addEventListener("click",function(){var v=l.classList.contains("open");r.forEach(function(f){f!==l&&i(f)}),v?i(l):(l.classList.add("open"),u.setAttribute("aria-expanded","true"),p.style.height=p.querySelector(".npanel-inner").offsetHeight+"px",n(l,"접기 "))})})})(),(function(){var r=t.getElementById("cform");if(!r)return;var n=r.querySelector("[data-status]"),i=r.querySelector("[data-submit]"),l=r.querySelector('select[name="userTraffic"]'),u=r.querySelector("[data-etc]"),p=u.querySelector("input"),v=u.querySelector("[data-etc-label]"),f=["direct","etc"],d=o.WS_CONFIG&&o.WS_CONFIG.CONTACT_API||"https://v6pa5eyigfdkbuzm2rskahdf6y0xfsre.lambda-url.ap-northeast-2.on.aws",h={userName:"이름을 입력해 주세요.",userCompany:"소속을 입력해 주세요.",userEmail:"이메일을 입력해 주세요.",userTraffic:"유입 경로를 선택해 주세요.",userTrafficEtc:"유입 경로를 입력해 주세요.",userMemo:"문의사항을 입력해 주세요.",checkPrivacy:"개인정보 수집·이용에 동의해 주세요."},T=["userName","userCompany","userEmail","userTraffic","userTrafficEtc","userMemo","checkPrivacy"];function S(_){return _.validity.typeMismatch&&_.type==="email"?"이메일 형식을 확인해 주세요.":h[_.name]||"필수 항목입니다."}function x(_){return _.closest("label")||_.parentNode}function y(_){var C=x(_),g=C.querySelector(".field-err");g||(g=t.createElement("span"),g.className="field-err",g.id="err-"+_.name,C.appendChild(g)),g.textContent=S(_),_.setAttribute("aria-invalid","true"),_.setAttribute("aria-describedby",g.id)}function m(_){var C=x(_),g=C.querySelector(".field-err");g&&g.parentNode.removeChild(g),_.removeAttribute("aria-invalid"),_.removeAttribute("aria-describedby")}l.addEventListener("change",function(){var _=f.indexOf(l.value)>=0;u.hidden=!_,p.required=_,_?(v.textContent=l.value==="direct"?"유입 경로 직접 입력 *":"기타 내용 *",p.focus()):(p.value="",m(p))});function A(_,C){n.textContent=_,n.className="status "+(C||"")}["userName","userCompany","userEmail","userTrafficEtc","userMemo"].forEach(function(_){r[_]&&r[_].addEventListener("input",function(){m(r[_])})}),r.userTraffic.addEventListener("change",function(){m(r.userTraffic)}),r.checkPrivacy.addEventListener("change",function(){m(r.checkPrivacy)}),r.addEventListener("submit",function(_){if(_.preventDefault(),!r.website.value){var C=null;if(T.forEach(function(V){var N=r[V];N&&(N.willValidate&&!N.checkValidity()?(y(N),C||(C=N)):m(N))}),C){C.focus();return}var g=r.userName.value.trim(),w=r.userCompany.value.trim(),H={name:g,affiliation:w,email:r.userEmail.value.trim(),inquiry:r.userMemo.value.trim(),userTraffic:r.userTraffic.value,subject:"Contact Us 문의 접수: "+g+"님 (소속: "+w+")"};f.indexOf(r.userTraffic.value)>=0&&r.userTrafficEtc.value.trim()&&(H.userTrafficEtc=r.userTrafficEtc.value.trim()),i.disabled=!0,A("전송 중입니다…"),fetch(d,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(H),signal:AbortSignal.timeout(15e3)}).then(function(V){if(!V.ok)throw new Error("bad");A("문의가 접수되었습니다. 빠른 시일 내 답변드리겠습니다.","ok"),r.reset(),u.hidden=!0,p.required=!1}).catch(function(){A("전송에 실패했습니다. manager@wickedstorm.kr로 보내주세요.","err")}).then(function(){i.disabled=!1})}})})(),(function(){var r=[].slice.call(t.querySelectorAll(".media-frame video"));if(!(!r.length||a||!s)){var n=new IntersectionObserver(function(i){i.forEach(function(l){var u=l.target;if(l.isIntersecting){var p=u.play();p&&p.catch&&p.catch(function(){})}else u.pause()})},{threshold:.25});r.forEach(function(i){n.observe(i)}),t.addEventListener("visibilitychange",function(){t.hidden&&r.forEach(function(i){i.pause()})})}})()})();
