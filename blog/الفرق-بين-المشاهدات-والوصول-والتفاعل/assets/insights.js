(()=>{
  'use strict';
  const $=s=>document.querySelector(s);
  const number=x=>new Intl.NumberFormat('ar-EG',{maximumFractionDigits:1}).format(x);
  const get=id=>Math.max(0,Number($('#'+id)?.value)||0);
  const views=$('#sim-views'), unique=$('#sim-unique'),likes=$('#sim-likes'),comments=$('#sim-comments'),shares=$('#sim-shares'),saves=$('#sim-saves');
  const error=$('#sim-warning');
  function recalc(){
    if(!views)return;
    const v=get('sim-views'),u=get('sim-unique');
    const actions=get('sim-likes')+get('sim-comments')+get('sim-shares')+get('sim-saves');
    const valid=v>0&&u>0&&u<=v;
    if(error)error.hidden=valid;
    const repeat=valid?v/u:0,engage=valid?100*actions/u:0;
    $('#out-views').textContent=number(v);
    $('#out-unique').textContent=number(u);
    $('#out-rate').textContent=valid?number(engage)+'٪':'—';
    $('#out-frequency').textContent=valid?number(repeat)+'×':'—';
    $('#out-engagement').textContent=number(actions);
    $('#bar-unique').style.width=valid?Math.min(100,100*u/v)+'%':'0%';
    $('#bar-actions').style.width=valid?Math.min(100,100*actions/u)+'%':'0%';
    $('#sim-takeaway').textContent=!valid?'أدخل عدد مشاهدات أكبر من صفر، وعدد أشخاص فريدين أكبر من صفر ولا يتجاوز المشاهدات.':'في هذا المثال، '+number(v)+' مشاهدة لا تعني '+number(v)+' شخصًا؛ عدد الحسابات الفريدة هو '+number(u)+' فقط. ومعدل التفاعل المحسوب هنا '+number(engage)+'٪ من الحسابات الفريدة، وليس نسبة إعجابات من إجمالي المشاهدات.';
  }
  [views,unique,likes,comments,shares,saves].forEach(el=>el?.addEventListener('input',recalc));
  document.querySelectorAll('[data-example]').forEach(btn=>btn.addEventListener('click',()=>{
    const preset=btn.getAttribute('data-example');
    const sample=preset==='a'?[100000,64000,2600,210,150,110]:preset==='b'?[42000,35000,1800,120,740,560]:[240000,85000,2900,85,125,95];
    [views,unique,likes,comments,shares,saves].forEach((el,i)=>{if(el)el.value=sample[i]});
    document.querySelectorAll('[data-example]').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));
    recalc();
  }));
  recalc();
  const bar=$('#read-progress');
  let ticking=false;
  window.addEventListener('scroll',()=>{
    if(ticking)return;ticking=true;
    requestAnimationFrame(()=>{
      const max=document.documentElement.scrollHeight-window.innerHeight;
      if(bar)bar.style.width=(max>0?Math.max(0,Math.min(100,100*window.scrollY/max)):0)+'%';
      ticking=false;
    });
  },{passive:true});
  const copy=$('#copy-formula');
  copy?.addEventListener('click',async()=>{
    const text='معدل التفاعل حسب الوصول = (الإعجابات + التعليقات + المشاركات + الحفظ) ÷ الحسابات الفريدة التي وصل إليها المحتوى × 100';
    try{await navigator.clipboard.writeText(text);copy.textContent='تم نسخ المعادلة';}
    catch(_){copy.textContent='يمكنك تحديد المعادلة ونسخها';}
  });
})();
