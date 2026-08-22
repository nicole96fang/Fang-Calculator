const KEY='calculator-workbench-v1';
const state=JSON.parse(localStorage.getItem(KEY)||'null')||{history:[],memory:0,mode:'basic',expr:'',result:'0'};
const tabs=[['basic','Basic'],['scientific','Scientific'],['converter','Converter'],['history','History']];
const $=s=>document.querySelector(s); const save=()=>{localStorage.setItem(KEY,JSON.stringify(state));$('#saveState').textContent='Saved locally ✓'};
function renderTabs(){ $('#tabs').innerHTML=tabs.map(([id,t])=>`<button class="tab ${state.mode===id?'active':''}" data-mode="${id}">${t}</button>`).join(''); document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{state.mode=b.dataset.mode;save();render()}) }
function render(){renderTabs();$('#expression').textContent=state.expr||'0';$('#result').textContent=state.result||'0';const w=$('#workspace');if(state.mode==='basic')w.innerHTML=basic();else if(state.mode==='scientific')w.innerHTML=scientific();else if(state.mode==='converter')w.innerHTML=converter();else w.innerHTML=history();bind();}
function basic(){return `<div class="memory">${['MC','MR','M+','M-'].map(x=>`<button data-m="${x}">${x}</button>`).join('')}</div><div class="keypad">${['AC','⌫','%','÷','7','8','9','×','4','5','6','−','1','2','3','+','0','.','±','='].map(x=>`<button class="key ${x==='AC'?'ac':''} ${['÷','×','−','+','%'].includes(x)?'op':''} ${x==='='?'equal':''}" data-k="${x}">${x}</button>`).join('')}</div><p class="notice">Includes parentheses, percentages, decimals and memory. Results are saved on this device.</p>`}
function scientific(){return `<div class="scientific">${['sin','cos','tan','asin','acos','atan','√','x²','xʸ','ln','log','π','e','(',')'].map(x=>`<button data-s="${x}">${x}</button>`).join('')}</div>${basic()}`}
function history(){return `<div class="panel card"><h2>Calculation History</h2><div class="history">${state.history.length?state.history.map((h,i)=>`<div class="history-item"><span>${escapeHtml(h.e)}</span><b>${escapeHtml(h.r)}</b></div>`).join(''):'<div class="empty">No calculations yet ✨</div>'}</div></div>`}
function converter(){return `<div class="panel card converter"><h2>Unit Converter</h2><div class="mode-row"><button class="mode-btn active" id="lengthMode">Length</button><button class="mode-btn" id="weightMode">Weight</button></div><div class="row"><input id="fromVal" class="input" type="number" value="1"><select id="fromUnit" class="select"></select></div><div class="row"><input id="toVal" class="input" readonly><select id="toUnit" class="select"></select></div><div class="convert-result" id="convResult">1</div><p class="notice">More converter categories can be added without a server.</p></div>`}
function bind(){document.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>key(b.dataset.k));document.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>sci(b.dataset.s));document.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>mem(b.dataset.m));if(state.mode==='converter')bindConverter()}
function key(k){if(k==='AC'){state.expr='';state.result='0'}else if(k==='⌫'){state.expr=state.expr.slice(0,-1);state.result=state.expr||'0'}else if(k==='='){try{let e=sanitize(state.expr);e=e.replace(/(\d+(?:\.\d+)?)%/g,'($1/100)');let r=Function('return ('+e+')')();if(!Number.isFinite(r))throw Error();r=String(Math.round((r+Number.EPSILON)*1e12)/1e12);state.result=r;state.history.unshift({e:state.expr,r});state.history=state.history.slice(0,100)}catch{state.result='Error'}save();render();$('#result').textContent=state.result||'0';return}else if(k==='±'){state.expr=state.expr.startsWith('-')?state.expr.slice(1):'-'+state.expr;state.result=state.expr}else{const map={'×':'*','÷':'/','−':'-'};state.expr+=(map[k]??k);state.result=state.expr}save();render()}
function sci(k){const map={sin:'Math.sin(',cos:'Math.cos(',tan:'Math.tan(',asin:'Math.asin(',acos:'Math.acos(',atan:'Math.atan(', '√':'Math.sqrt(', 'x²':'**2','xʸ':'**','ln':'Math.log(',log:'Math.log10(',π:'Math.PI',e:'Math.E'};state.expr+=map[k]??k;state.result=state.expr;save();render()}
function sanitize(x){return x.replace(/[^0-9+\-*/%.(),\sA-Za-z_]/g,'').replace(/Math\.(sin|cos|tan|asin|acos|atan|sqrt|log10|log|PI|E)/g,'Math.$1')}
function calc(){try{let e=sanitize(state.expr);e=e.replace(/(\d+(?:\.\d+)?)%/g,'($1/100)');let r=Function('return ('+e+')')();if(!Number.isFinite(r))throw Error();r=String(Math.round((r+Number.EPSILON)*1e12)/1e12);state.result=r;state.history.unshift({e:state.expr,r});state.history=state.history.slice(0,100);save()}catch{state.result='Error'}}
function mem(m){const n=Number(state.result)||0;if(m==='MC')state.memory=0;if(m==='MR'){state.expr+=String(state.memory);state.result=state.expr}if(m==='M+')state.memory+=n;if(m==='M-')state.memory-=n;save();render()}
const units={length:{m:1,km:1000,cm:.01,mm:.001,ft:.3048,in:.0254,yd:.9144,mi:1609.344},weight:{kg:1,g:.001,mg:.000001,lb:.45359237,oz:.0283495231}};
function bindConverter(){let kind='length';const fu=$('#fromUnit'),tu=$('#toUnit'),fv=$('#fromVal');function fill(){const opts=Object.keys(units[kind]).map(u=>`<option>${u}</option>`).join('');fu.innerHTML=tu.innerHTML=opts;tu.selectedIndex=1;convert()}function convert(){const v=Number(fv.value)||0;const r=v*units[kind][fu.value]/units[kind][tu.value];$('#toVal').value=r;$('#convResult').textContent=`${v} ${fu.value} = ${r} ${tu.value}`}fill();fv.oninput=convert;fu.onchange=convert;tu.onchange=convert;$('#weightMode').onclick=()=>{kind='weight';$('#weightMode').classList.add('active');$('#lengthMode').classList.remove('active');fill()};$('#lengthMode').onclick=()=>{kind='length';$('#lengthMode').classList.add('active');$('#weightMode').classList.remove('active');fill()}}
function escapeHtml(s){return s.replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
$('#clearAll').onclick=()=>{if(confirm('Clear all locally saved calculator data?')){localStorage.removeItem(KEY);location.reload()}};
function snow(){const el=document.createElement('span');el.className='snow';el.textContent='❄';el.style.left=Math.random()*100+'vw';el.style.setProperty('--drift',(Math.random()*160-80)+'px');el.style.animationDuration=(6+Math.random()*7)+'s';el.style.opacity=.35+Math.random()*.55;$('#snow').appendChild(el);setTimeout(()=>el.remove(),14000)}setInterval(snow,500);for(let i=0;i<8;i++)setTimeout(snow,i*250);render();
/* ===== LIFE + MYR FX EXTENSION ===== */
(()=>{
  const oldRender=render;

  const lifeHTML=()=>`<div class="life-grid">
  <div class="panel card calc-card">
    <h2>🌷 BMI</h2>
    <input id="bw" class="input" type="number" placeholder="Weight kg">
    <input id="bh" class="input" type="number" placeholder="Height cm">
    <button class="calc-btn" id="bmiX">Calculate BMI</button>
    <div class="calc-result" id="br">—</div>
  </div>

  <div class="panel card calc-card">
    <h2>🔥 BMR</h2>
    <select id="bg" class="select">
      <option value="-161">Female</option>
      <option value="5">Male</option>
    </select>
    <input id="ba" class="input" type="number" placeholder="Age">
    <input id="bmw" class="input" type="number" placeholder="Weight kg">
    <input id="bmh" class="input" type="number" placeholder="Height cm">
    <button class="calc-btn" id="bmrX">Calculate BMR</button>
    <div class="calc-result" id="bmrR">—</div>
  </div>

  <div class="panel card calc-card">
    <h2>⚡ TDEE</h2>
    <input id="tb" class="input" type="number" placeholder="BMR">
    <select id="ta" class="select">
      <option value="1.2">Sedentary · 1.20</option>
      <option value="1.375">Light · 1.375</option>
      <option value="1.55">Moderate · 1.55</option>
      <option value="1.725">Very active · 1.725</option>
      <option value="1.9">Extra active · 1.90</option>
    </select>
    <button class="calc-btn" id="tdeeX">Calculate TDEE</button>
    <div class="calc-result" id="tr">—</div>
  </div>

  <div class="panel card calc-card">
    <h2>🍓 Calories</h2>
    <input id="ct" class="input" type="number" placeholder="TDEE">
    <select id="cg" class="select">
      <option value="1">Maintain</option>
      <option value=".85">Weight loss · −15%</option>
      <option value="1.1">Weight gain · +10%</option>
    </select>
    <button class="calc-btn" id="calX">Calculate Calories</button>
    <div class="calc-result" id="cr">—</div>
  </div>

  <div class="panel card calc-card">
    <h2>⚖️ Ideal Weight</h2>
    <input id="ih" class="input" type="number" placeholder="Height cm">
    <button class="calc-btn" id="idealX">Calculate Range</button>
    <div class="calc-result" id="ir">—</div>
  </div>

  <div class="panel card calc-card">
    <h2>📅 Countdown</h2>
    <input id="cd" class="input" type="date">
    <button class="calc-btn" id="countX">Count Days</button>
    <div class="calc-result" id="cdr">—</div>
  </div>

  <div class="panel card calc-card">
    <h2>⏰ Time Calculation</h2>
    <div class="row">
      <input id="ts" class="input" type="time" value="09:00">
      <input id="te" class="input" type="time" value="17:30">
    </div>
    <button class="calc-btn" id="timeX">Calculate Time</button>
    <div class="calc-result" id="timer">—</div>
  </div>
</div>
<p class="notice">Lifestyle results are estimates for reference only.</p>`;

  const currencies={
    USD:'US Dollar',
    SGD:'Singapore Dollar',
    CNY:'Chinese Yuan',
    JPY:'Japanese Yen',
    KRW:'Korean Won',
    THB:'Thai Baht',
    TWD:'Taiwan Dollar',
    HKD:'Hong Kong Dollar',
    AUD:'Australian Dollar',
    NZD:'New Zealand Dollar',
    GBP:'British Pound',
    EUR:'Euro',
    CHF:'Swiss Franc',
    CAD:'Canadian Dollar',
    AED:'UAE Dirham',
    INR:'Indian Rupee',
    IDR:'Indonesian Rupiah',
    VND:'Vietnamese Dong',
    PHP:'Philippine Peso'
  };

  let rates={
    USD:.253,
    SGD:.323,
    CNY:1.82,
    JPY:37.7,
    KRW:348,
    THB:8.18,
    TWD:8.05,
    HKD:1.98,
    AUD:.389,
    NZD:.427,
    GBP:.194,
    EUR:.216,
    CHF:.207,
    CAD:.346,
    AED:.93,
    INR:21.1,
    IDR:4090,
    VND:6610,
    PHP:14.5
  };

  const fxHTML=()=>`
  <div class="panel card converter fx-panel">
    <h2>🎐 Currency Exchange</h2>

    <p class="fx-base">
      Base currency: <b>MYR · Malaysian Ringgit</b>
    </p>

    <div class="row">
      <input id="fxA" class="input" type="number" value="1">

      <select id="fxC" class="select">
        ${Object.keys(currencies).map(c=>
          `<option value="${c}">${c} · ${currencies[c]}</option>`
        ).join('')}
      </select>
    </div>

    <div class="convert-result" id="fxR">—</div>

    <div class="fx-grid">
      ${Object.keys(currencies).map(c=>`
        <button class="fx-chip" data-c="${c}">
          <b>${c}</b>
          <span>${currencies[c]}</span>
          <em>1 MYR ≈ ${fmt(rates[c])} ${c}</em>
        </button>
      `).join('')}
    </div>

    <p class="notice" id="fxS">
      Loading live rates…
    </p>
  </div>`;

  const fmt=n=>
    Number(n).toLocaleString(undefined,{
      maximumFractionDigits:4
    });

  const mins=t=>{
    const [h,m]=t.split(':').map(Number);
    return h*60+m;
  };

  function bindLife(){

    $('#bmiX').onclick=()=>{
      let w=+$('#bw').value;
      let h=+$('#bh').value/100;

      if(w>0&&h>0){
        let b=w/h**2;

        $('#br').textContent=
          b.toFixed(1)+' · '+
          (b<18.5
            ?'Underweight'
            :b<25
            ?'Healthy range'
            :b<30
            ?'Overweight'
            :'Obesity');
      }
    };

    $('#bmrX').onclick=()=>{
      let a=+$('#ba').value;
      let w=+$('#bmw').value;
      let h=+$('#bmh').value;

      if(a&&w&&h){
        let b=
          10*w+
          6.25*h-
          5*a+
          (+$('#bg').value);

        $('#bmrR').textContent=
          Math.round(b)+' kcal/day';

        $('#tb').value=Math.round(b);
      }
    };

    $('#tdeeX').onclick=()=>{
      let b=+$('#tb').value;

      if(b>0){
        $('#tr').textContent=
          Math.round(b*+$('#ta').value)+
          ' kcal/day';
      }
    };

    $('#calX').onclick=()=>{
      let t=+$('#ct').value;

      if(t>0){
        $('#cr').textContent=
          Math.round(t*+$('#cg').value)+
          ' kcal/day';
      }
    };

    $('#idealX').onclick=()=>{
      let h=+$('#ih').value/100;

      if(h>0){
        $('#ir').textContent=
          (18.5*h*h).toFixed(1)+
          '–'+
          (24.9*h*h).toFixed(1)+
          ' kg';
      }
    };

    $('#countX').onclick=()=>{
      if($('#cd').value){

        let t=
          new Date(
            $('#cd').value+'T00:00:00'
          );

        let d=new Date();
        d.setHours(0,0,0,0);

        let n=
          Math.round(
            (t-d)/86400000
          );

        $('#cdr').textContent=
          n>0
          ?n+' days left'
          :n===0
          ?'Today 🎉'
          :Math.abs(n)+' days ago';
      }
    };

    $('#timeX').onclick=()=>{
      let s=mins($('#ts').value);
      let e=mins($('#te').value);

      if(e<s)e+=1440;

      let d=e-s;

      $('#timer').textContent=
        Math.floor(d/60)+
        ' h '+
        d%60+
        ' min';
    };
  }

  function bindFX(){

    const update=()=>{
      const amount=+$('#fxA').value||0;
      const code=$('#fxC').value;

      $('#fxR').textContent=
        'MYR '+
        fmt(amount)+
        ' ≈ '+
        fmt(amount*(rates[code]||0))+
        ' '+
        code;
    };

    $('#fxA').oninput=update;
    $('#fxC').onchange=update;

    document.querySelectorAll('[data-c]').forEach(b=>{
      b.onclick=()=>{
        $('#fxC').value=b.dataset.c;
        update();
      };
    });

    update();

    fetch(
      'https://api.frankfurter.dev/v1/latest?base=MYR'
    )
    .then(r=>r.json())
    .then(d=>{

      if(d.rates){

        rates={
          ...rates,
          ...d.rates
        };

        document
          .querySelectorAll('[data-c]')
          .forEach(b=>{
            b.querySelector('em').textContent=
              '1 MYR ≈ '+
              fmt(rates[b.dataset.c])+
              ' '+
              b.dataset.c;
          });

        update();

        $('#fxS').textContent=
          'Live rates loaded.';
      }

    })
    .catch(()=>{
      $('#fxS').textContent=
        'Using built-in approximate rates.';
    });
  }

  function add(){

    const tabs=$('#tabs');

    if(!tabs.querySelector('[data-extra="life"]')){

      tabs.insertAdjacentHTML(
        'beforeend',
        '<button class="tab" data-extra="life">Life 🌷</button>'+
        '<button class="tab" data-extra="fx">FX 🎐</button>'
      );
    }

    tabs
      .querySelectorAll('[data-extra]')
      .forEach(b=>{
        b.onclick=()=>{
          state.mode=b.dataset.extra;
          save();
          render();
        };
      });

    tabs
      .querySelectorAll('[data-extra]')
      .forEach(b=>{
        b.classList.toggle(
          'active',
          b.dataset.extra===state.mode
        );
      });

    if(state.mode==='life'){
      $('#workspace').innerHTML=lifeHTML();
      bindLife();
    }

    if(state.mode==='fx'){
      $('#workspace').innerHTML=fxHTML();
      bindFX();
    }
  }

  render=function(){
    oldRender();
    add();
  };

})();
render();
