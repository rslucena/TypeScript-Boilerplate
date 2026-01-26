import{t as B}from"./chunk-353BL4L5-t05ly1Yi.CO8LBR7r.js";import{g as n,I as v,h as P,q as S,P as F,D as z,O as W,B as m,a5 as D,$ as E,F as T,C as R,H as A,N as $}from"./theme.D12xF8em.js";import{S as H}from"./treemap-75Q7IDZK-CIjD8Ibx.pHEpbhMG.js";import"./framework.CZ2lsOHd.js";import"./baseUniq-CZHCFN8s.CYPqT_JU.js";import"./basePickBy-XITLGQxL.Xq83xS7I.js";import"./clone-CVDc7lii.CTPInAuO.js";var x={packet:[]},w=structuredClone(x),I=A.packet,Y=n(()=>{const t=m({...I,...R().packet});return t.showBits&&(t.paddingY+=10),t},"getConfig"),L=n(()=>w.packet,"getPacket"),N=n(t=>{t.length>0&&w.packet.push(t)},"pushWord"),O=n(()=>{T(),w=structuredClone(x)},"clear"),u={pushWord:N,getPacket:L,getConfig:Y,clear:O,setAccTitle:W,getAccTitle:z,setDiagramTitle:F,getDiagramTitle:S,getAccDescription:P,setAccDescription:v},X=1e4,q=n(t=>{B(t,u);let e=-1,o=[],i=1;const{bitsPerRow:l}=u.getConfig();for(let{start:a,end:r,bits:d,label:k}of t.blocks){if(a!==void 0&&r!==void 0&&r<a)throw new Error(`Packet block ${a} - ${r} is invalid. End must be greater than start.`);if(a??=e+1,a!==e+1)throw new Error(`Packet block ${a} - ${r??a} is not contiguous. It should start from ${e+1}.`);if(d===0)throw new Error(`Packet block ${a} is invalid. Cannot have a zero bit field.`);for(r??=a+(d??1)-1,d??=r-a+1,e=r,$.debug(`Packet block ${a} - ${e} with label ${k}`);o.length<=l+1&&u.getPacket().length<X;){const[c,b]=M({start:a,end:r,bits:d,label:k},i,l);if(o.push(c),c.end+1===i*l&&(u.pushWord(o),o=[],i++),!b)break;({start:a,end:r,bits:d,label:k}=b)}}u.pushWord(o)},"populate"),M=n((t,e,o)=>{if(t.start===void 0)throw new Error("start should have been set during first phase");if(t.end===void 0)throw new Error("end should have been set during first phase");if(t.start>t.end)throw new Error(`Block start ${t.start} is greater than block end ${t.end}.`);if(t.end+1<=e*o)return[t,void 0];const i=e*o-1,l=e*o;return[{start:t.start,end:i,label:t.label,bits:i-t.start},{start:l,end:t.end,label:t.label,bits:t.end-l}]},"getNextFittingBlock"),j={parse:n(async t=>{const e=await H("packet",t);$.debug(e),q(e)},"parse")},G=n((t,e,o,i)=>{const l=i.db,a=l.getConfig(),{rowHeight:r,paddingY:d,bitWidth:k,bitsPerRow:c}=a,b=l.getPacket(),s=l.getDiagramTitle(),h=r+d,p=h*(b.length+1)-(s?0:r),g=k*c+2,f=D(e);f.attr("viewbox",`0 0 ${g} ${p}`),E(f,p,g,a.useMaxWidth);for(const[C,y]of b.entries())J(f,y,C,a);f.append("text").text(s).attr("x",g/2).attr("y",p-h/2).attr("dominant-baseline","middle").attr("text-anchor","middle").attr("class","packetTitle")},"draw"),J=n((t,e,o,{rowHeight:i,paddingX:l,paddingY:a,bitWidth:r,bitsPerRow:d,showBits:k})=>{const c=t.append("g"),b=o*(i+a)+a;for(const s of e){const h=s.start%d*r+1,p=(s.end-s.start+1)*r-l;if(c.append("rect").attr("x",h).attr("y",b).attr("width",p).attr("height",i).attr("class","packetBlock"),c.append("text").attr("x",h+p/2).attr("y",b+i/2).attr("class","packetLabel").attr("dominant-baseline","middle").attr("text-anchor","middle").text(s.label),!k)continue;const g=s.end===s.start,f=b-2;c.append("text").attr("x",h+(g?p/2:0)).attr("y",f).attr("class","packetByte start").attr("dominant-baseline","auto").attr("text-anchor",g?"middle":"start").text(s.start),g||c.append("text").attr("x",h+p).attr("y",f).attr("class","packetByte end").attr("dominant-baseline","auto").attr("text-anchor","end").text(s.end)}},"drawWord"),K={draw:G},U={byteFontSize:"10px",startByteColor:"black",endByteColor:"black",labelColor:"black",labelFontSize:"12px",titleColor:"black",titleFontSize:"14px",blockStrokeColor:"black",blockStrokeWidth:"1",blockFillColor:"#efefef"},Q=n(({packet:t}={})=>{const e=m(U,t);return`
	.packetByte {
		font-size: ${e.byteFontSize};
	}
	.packetByte.start {
		fill: ${e.startByteColor};
	}
	.packetByte.end {
		fill: ${e.endByteColor};
	}
	.packetLabel {
		fill: ${e.labelColor};
		font-size: ${e.labelFontSize};
	}
	.packetTitle {
		fill: ${e.titleColor};
		font-size: ${e.titleFontSize};
	}
	.packetBlock {
		stroke: ${e.blockStrokeColor};
		stroke-width: ${e.blockStrokeWidth};
		fill: ${e.blockFillColor};
	}
	`},"styles"),ot={parser:j,db:u,renderer:K,styles:Q};export{ot as diagram};
