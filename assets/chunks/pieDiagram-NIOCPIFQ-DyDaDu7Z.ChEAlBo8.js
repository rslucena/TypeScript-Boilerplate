import{t as X}from"./chunk-353BL4L5-t05ly1Yi.DC0ZKKzb.js";import{g as c,h as q,I as H,D as U,O as Y,q as Z,P as _,N as z,a as j,B as J,aU as K,aW as Q,$ as tt,F as et,H as at,aX as w,aY as nt,aZ as R}from"./theme.DgT5h_PA.js";import{S as rt}from"./treemap-75Q7IDZK-CIjD8Ibx.BpE3KNWd.js";import{h as E}from"./arc-aavUJmbb.Bvvdyl5C.js";import{h as it}from"./ordinal-DfAQgscy.DBZ2HlY2.js";import"./framework.CZ2lsOHd.js";import"./baseUniq-CZHCFN8s.BLfJByOL.js";import"./basePickBy-XITLGQxL.BznLQCn9.js";import"./clone-CVDc7lii.CwbQwa5s.js";import"./init-DjUOC4st.DHuO7-vr.js";function lt(t,a){return a<t?-1:a>t?1:a>=t?0:NaN}function ot(t){return t}function st(){var t=ot,a=lt,l=null,m=w(0),g=w(R),S=w(0);function i(e){var n,s=(e=nt(e)).length,u,$,h=0,p=new Array(s),r=new Array(s),x=+m.apply(this,arguments),b=Math.min(R,Math.max(-R,g.apply(this,arguments)-x)),f,v=Math.min(Math.abs(b)/s,S.apply(this,arguments)),T=v*(b<0?-1:1),d;for(n=0;n<s;++n)(d=r[p[n]=n]=+t(e[n],n,e))>0&&(h+=d);for(a!=null?p.sort(function(y,A){return a(r[y],r[A])}):l!=null&&p.sort(function(y,A){return l(e[y],e[A])}),n=0,$=h?(b-s*T)/h:0;n<s;++n,x=f)u=p[n],d=r[u],f=x+(d>0?d*$:0)+T,r[u]={data:e[u],index:n,value:d,startAngle:x,endAngle:f,padAngle:v};return r}return i.value=function(e){return arguments.length?(t=typeof e=="function"?e:w(+e),i):t},i.sortValues=function(e){return arguments.length?(a=e,l=null,i):a},i.sort=function(e){return arguments.length?(l=e,a=null,i):l},i.startAngle=function(e){return arguments.length?(m=typeof e=="function"?e:w(+e),i):m},i.endAngle=function(e){return arguments.length?(g=typeof e=="function"?e:w(+e),i):g},i.padAngle=function(e){return arguments.length?(S=typeof e=="function"?e:w(+e),i):S},i}var pt=at.pie,F={sections:new Map,showData:!1},M=F.sections,N=F.showData,ct=structuredClone(pt),ut=c(()=>structuredClone(ct),"getConfig"),dt=c(()=>{M=new Map,N=F.showData,et()},"clear"),gt=c(({label:t,value:a})=>{M.has(t)||(M.set(t,a),z.debug(`added new section: ${t}, with value: ${a}`))},"addSection"),ft=c(()=>M,"getSections"),mt=c(t=>{N=t},"setShowData"),ht=c(()=>N,"getShowData"),P={getConfig:ut,clear:dt,setDiagramTitle:_,getDiagramTitle:Z,setAccTitle:Y,getAccTitle:U,setAccDescription:H,getAccDescription:q,addSection:gt,getSections:ft,setShowData:mt,getShowData:ht},xt=c((t,a)=>{X(t,a),a.setShowData(t.showData),t.sections.map(a.addSection)},"populateDb"),yt={parse:c(async t=>{const a=await rt("pie",t);z.debug(a),xt(a,P)},"parse")},wt=c(t=>`
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
`+t);const g=m.db,S=j(),i=J(g.getConfig(),S.pie),e=40,n=18,s=4,u=450,$=u,h=K(a),p=h.append("g");p.attr("transform","translate("+$/2+","+u/2+")");const{themeVariables:r}=S;let[x]=Q(r.pieOuterStrokeWidth);x??=2;const b=i.textPosition,f=Math.min($,u)/2-e,v=E().innerRadius(0).outerRadius(f),T=E().innerRadius(f*b).outerRadius(f*b);p.append("circle").attr("cx",0).attr("cy",0).attr("r",f+x/2).attr("class","pieOuterCircle");const d=g.getSections(),y=$t(d),A=[r.pie1,r.pie2,r.pie3,r.pie4,r.pie5,r.pie6,r.pie7,r.pie8,r.pie9,r.pie10,r.pie11,r.pie12],D=it(A);p.selectAll("mySlices").data(y).enter().append("path").attr("d",v).attr("fill",o=>D(o.data.label)).attr("class","pieCircle");let W=0;d.forEach(o=>{W+=o}),p.selectAll("mySlices").data(y).enter().append("text").text(o=>(o.data.value/W*100).toFixed(0)+"%").attr("transform",o=>"translate("+T.centroid(o)+")").style("text-anchor","middle").attr("class","slice"),p.append("text").text(g.getDiagramTitle()).attr("x",0).attr("y",-400/2).attr("class","pieTitleText");const O=p.selectAll(".legend").data(D.domain()).enter().append("g").attr("class","legend").attr("transform",(o,C)=>{const k=n+s,L=k*D.domain().length/2,G=12*n,V=C*k-L;return"translate("+G+","+V+")"});O.append("rect").attr("width",n).attr("height",n).style("fill",D).style("stroke",D),O.data(y).append("text").attr("x",n+s).attr("y",n-s).text(o=>{const{label:C,value:k}=o.data;return g.getShowData()?`${C} [${k}]`:C});const I=Math.max(...O.selectAll("text").nodes().map(o=>o?.getBoundingClientRect().width??0)),B=$+e+n+s+I;h.attr("viewBox",`0 0 ${B} ${u}`),tt(h,u,B,i.useMaxWidth)},"draw"),At={draw:bt},Nt={parser:yt,db:P,renderer:At,styles:St};export{Nt as diagram};
