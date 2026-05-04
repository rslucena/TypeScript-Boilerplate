import{t as X}from"./chunk-353BL4L5-t05ly1Yi.Dv2ugnS8.js";import{g as c,a8 as q,a7 as U,a9 as Y,aa as Z,aq as _,ap as j,N as z,a as H,aC as J,aU as K,aW as Q,ac as tt,av as et,aE as at,aX as w,aY as nt,aZ as R}from"./theme.B4YvUgw1.js";import{S as rt}from"./treemap-75Q7IDZK-CIjD8Ibx.grBoqDdN.js";import{h as B}from"./arc-aavUJmbb.rlkH01M6.js";import{h as it}from"./ordinal-DfAQgscy.DBZ2HlY2.js";import"./framework.CZ2lsOHd.js";import"./baseUniq-CZHCFN8s.C7Memtp2.js";import"./basePickBy-XITLGQxL.BZpuVLZO.js";import"./clone-CVDc7lii.mjAwCZvY.js";import"./init-DjUOC4st.DHuO7-vr.js";function lt(t,a){return a<t?-1:a>t?1:a>=t?0:NaN}function ot(t){return t}function st(){var t=ot,a=lt,l=null,m=w(0),g=w(R),S=w(0);function i(e){var n,s=(e=nt(e)).length,u,$,h=0,p=new Array(s),r=new Array(s),x=+m.apply(this,arguments),b=Math.min(R,Math.max(-R,g.apply(this,arguments)-x)),f,C=Math.min(Math.abs(b)/s,S.apply(this,arguments)),D=C*(b<0?-1:1),d;for(n=0;n<s;++n)(d=r[p[n]=n]=+t(e[n],n,e))>0&&(h+=d);for(a!=null?p.sort(function(y,v){return a(r[y],r[v])}):l!=null&&p.sort(function(y,v){return l(e[y],e[v])}),n=0,$=h?(b-s*D)/h:0;n<s;++n,x=f)u=p[n],d=r[u],f=x+(d>0?d*$:0)+D,r[u]={data:e[u],index:n,value:d,startAngle:x,endAngle:f,padAngle:C};return r}return i.value=function(e){return arguments.length?(t=typeof e=="function"?e:w(+e),i):t},i.sortValues=function(e){return arguments.length?(a=e,l=null,i):a},i.sort=function(e){return arguments.length?(l=e,a=null,i):l},i.startAngle=function(e){return arguments.length?(m=typeof e=="function"?e:w(+e),i):m},i.endAngle=function(e){return arguments.length?(g=typeof e=="function"?e:w(+e),i):g},i.padAngle=function(e){return arguments.length?(S=typeof e=="function"?e:w(+e),i):S},i}var pt=at.pie,N={sections:new Map,showData:!1},M=N.sections,W=N.showData,ct=structuredClone(pt),ut=c(()=>structuredClone(ct),"getConfig"),dt=c(()=>{M=new Map,W=N.showData,et()},"clear"),gt=c(({label:t,value:a})=>{M.has(t)||(M.set(t,a),z.debug(`added new section: ${t}, with value: ${a}`))},"addSection"),ft=c(()=>M,"getSections"),mt=c(t=>{W=t},"setShowData"),ht=c(()=>W,"getShowData"),L={getConfig:ut,clear:dt,setDiagramTitle:j,getDiagramTitle:_,setAccTitle:Z,getAccTitle:Y,setAccDescription:U,getAccDescription:q,addSection:gt,getSections:ft,setShowData:mt,getShowData:ht},xt=c((t,a)=>{X(t,a),a.setShowData(t.showData),t.sections.map(a.addSection)},"populateDb"),yt={parse:c(async t=>{const a=await rt("pie",t);z.debug(a),xt(a,L)},"parse")},wt=c(t=>`
  .pieCircle{
    stroke: ${t.pieStrokeColor};
    stroke-width : ${t.pieStrokeWidth};
    opacity : ${t.pieOpacity};
  }
  .pieOuterCircle{
    stroke: ${t.pieOuterStrokeColor};
    stroke-width: ${t.pieOuterStrokeWidth};
    fill: none;
  }
  .pieTitleText {
    text-anchor: middle;
    font-size: ${t.pieTitleTextSize};
    fill: ${t.pieTitleTextColor};
    font-family: ${t.fontFamily};
  }
  .slice {
    font-family: ${t.fontFamily};
    fill: ${t.pieSectionTextColor};
    font-size:${t.pieSectionTextSize};
    // fill: white;
  }
  .legend text {
    fill: ${t.pieLegendTextColor};
    font-family: ${t.fontFamily};
    font-size: ${t.pieLegendTextSize};
  }
`,"getStyles"),St=wt,$t=c(t=>{const a=[...t.entries()].map(l=>({label:l[0],value:l[1]})).sort((l,m)=>m.value-l.value);return st().value(l=>l.value)(a)},"createPieArcs"),bt=c((t,a,l,m)=>{z.debug(`rendering pie chart
`+t);const g=m.db,S=H(),i=J(g.getConfig(),S.pie),e=40,n=18,s=4,u=450,$=u,h=K(a),p=h.append("g");p.attr("transform","translate("+$/2+","+u/2+")");const{themeVariables:r}=S;let[x]=Q(r.pieOuterStrokeWidth);x??=2;const b=i.textPosition,f=Math.min($,u)/2-e,C=B().innerRadius(0).outerRadius(f),D=B().innerRadius(f*b).outerRadius(f*b);p.append("circle").attr("cx",0).attr("cy",0).attr("r",f+x/2).attr("class","pieOuterCircle");const d=g.getSections(),y=$t(d),v=[r.pie1,r.pie2,r.pie3,r.pie4,r.pie5,r.pie6,r.pie7,r.pie8,r.pie9,r.pie10,r.pie11,r.pie12],A=it(v);p.selectAll("mySlices").data(y).enter().append("path").attr("d",C).attr("fill",o=>A(o.data.label)).attr("class","pieCircle");let E=0;d.forEach(o=>{E+=o}),p.selectAll("mySlices").data(y).enter().append("text").text(o=>(o.data.value/E*100).toFixed(0)+"%").attr("transform",o=>"translate("+D.centroid(o)+")").style("text-anchor","middle").attr("class","slice"),p.append("text").text(g.getDiagramTitle()).attr("x",0).attr("y",-400/2).attr("class","pieTitleText");const O=p.selectAll(".legend").data(A.domain()).enter().append("g").attr("class","legend").attr("transform",(o,T)=>{const k=n+s,G=k*A.domain().length/2,I=12*n,V=T*k-G;return"translate("+I+","+V+")"});O.append("rect").attr("width",n).attr("height",n).style("fill",A).style("stroke",A),O.data(y).append("text").attr("x",n+s).attr("y",n-s).text(o=>{const{label:T,value:k}=o.data;return g.getShowData()?`${T} [${k}]`:T});const P=Math.max(...O.selectAll("text").nodes().map(o=>o?.getBoundingClientRect().width??0)),F=$+e+n+s+P;h.attr("viewBox",`0 0 ${F} ${u}`),tt(h,u,F,i.useMaxWidth)},"draw"),vt={draw:bt},Wt={parser:yt,db:L,renderer:vt,styles:St};export{Wt as diagram};
