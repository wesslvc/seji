/* 기후 모드 필기 — 펜을 켜면 화면이 고정되고(지도 이동·카드 눌림 없음) 지도와 그래프 위에 그릴 수 있다 */
(function(){
  const COLORS=['#ef5350','#ffb300','#43a047','#1e88e5','#ab47bc','#111111'];
  let on=false,color=COLORS[0],width=3.5,strokes=[],cur=null,cv,ctx,bar;
  const isCq=()=>document.body.classList.contains('cq-mode');
  function build(){
    if(bar)return;
    cv=document.createElement('canvas');cv.id='pen-cv';
    document.body.appendChild(cv);ctx=cv.getContext('2d');
    bar=document.createElement('div');bar.id='pen-bar';
    bar.innerHTML='<button type="button" id="pen-toggle" class="pen-b" aria-label="필기 켜기/끄기" title="필기">'
      +'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg></button>'
      +'<div id="pen-tools">'+COLORS.map((c,i)=>'<button type="button" class="pen-c'+(i?'':' on')+'" data-c="'+c+'" style="background:'+c+'" aria-label="색 '+(i+1)+'"></button>').join('')
      +'<button type="button" class="pen-b" id="pen-undo" aria-label="되돌리기" title="되돌리기">↶</button>'
      +'<button type="button" class="pen-b" id="pen-clear" aria-label="모두 지우기" title="모두 지우기">🗑</button></div>';
    document.body.appendChild(bar);
    bar.addEventListener('click',e=>{
      const t=e.target.closest('button');if(!t)return;
      if(t.id==='pen-toggle')setOn(!on);
      else if(t.id==='pen-undo'){strokes.pop();redraw();}
      else if(t.id==='pen-clear'){strokes=[];redraw();}
      else if(t.dataset.c){color=t.dataset.c;bar.querySelectorAll('.pen-c').forEach(b=>b.classList.toggle('on',b===t));}
    });
    cv.addEventListener('pointerdown',e=>{
      if(!on)return;e.preventDefault();cv.setPointerCapture(e.pointerId);
      cur={c:color,w:width,p:[[e.clientX,e.clientY]]};strokes.push(cur);redraw();
    });
    cv.addEventListener('pointermove',e=>{
      if(!cur)return;e.preventDefault();
      (e.getCoalescedEvents?e.getCoalescedEvents():[e]).forEach(ev=>cur.p.push([ev.clientX,ev.clientY]));redraw();
    });
    const end=()=>{cur=null;};
    cv.addEventListener('pointerup',end);cv.addEventListener('pointercancel',end);
    window.addEventListener('resize',()=>{fit();});
  }
  function fit(){
    if(!cv)return;
    const at=document.getElementById('act-tabs');const top=at&&at.offsetParent!==null?Math.max(0,at.getBoundingClientRect().bottom):0;
    cv.style.top=top+'px';
    const d=window.devicePixelRatio||1,w=innerWidth,h=innerHeight-top;
    cv.width=Math.round(w*d);cv.height=Math.round(h*d);cv.style.width=w+'px';cv.style.height=h+'px';
    ctx.setTransform(d,0,0,d,0,0);redraw();
  }
  function redraw(){
    if(!ctx)return;
    const top=parseFloat(cv.style.top)||0;
    ctx.clearRect(0,0,cv.width,cv.height);ctx.lineCap='round';ctx.lineJoin='round';
    strokes.forEach(s=>{
      ctx.strokeStyle=s.c;ctx.fillStyle=s.c;ctx.lineWidth=s.w;
      const p=s.p;if(p.length===1){ctx.beginPath();ctx.arc(p[0][0],p[0][1]-top,s.w/2,0,7);ctx.fill();return;}
      ctx.beginPath();ctx.moveTo(p[0][0],p[0][1]-top);
      for(let i=1;i<p.length-1;i++){const mx=(p[i][0]+p[i+1][0])/2,my=(p[i][1]+p[i+1][1])/2;ctx.quadraticCurveTo(p[i][0],p[i][1]-top,mx,my-top);}
      const l=p[p.length-1];ctx.lineTo(l[0],l[1]-top);ctx.stroke();
    });
  }
  function setOn(v){
    on=v;build();fit();
    document.body.classList.toggle('pen-on',on);
    bar.classList.toggle('on',on);
  }
  function sync(){
    if(isCq()){build();bar.style.display='flex';cv.style.display='block';fit();}
    else if(bar){setOn(false);bar.style.display='none';cv.style.display='none';strokes=[];}
  }
  /* 새 문제/세트가 시작되면 낙서를 지운다 */
  window.penClear=function(){strokes=[];redraw();};
  new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class']});
  document.addEventListener('DOMContentLoaded',sync);
  ['cqShowRound','cqNextBatch','cqLShowRound'].forEach(n=>{
    const f=window[n];if(typeof f==='function')window[n]=function(){try{window.penClear();}catch(e){}return f.apply(this,arguments);};
  });
})();
