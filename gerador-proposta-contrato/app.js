// ─── STATE ───────────────────────────────────────────────────────────────────
let currentPage = 1;
let exclTags = [];
let promptGerado = '';
let logosData = { contratado: null, contratante: null };
const elistData = {
  'tipo-obra':[],'regime':[],'pagamento':[],'reajuste':[],'multas':[],
  'responsabilidades':[],'rescisao':[],'aditivos':[],'servicos-custom':[],
  'extra-contratado':[],'extra-contratante':[],
};

// ─── DADOS ───────────────────────────────────────────────────────────────────
const SERVICOS_LISTA = [
  "Serviços preliminares e canteiro de obras","Terraplenagem e fundações",
  "Estrutura (concreto armado / metálica / madeira)","Alvenaria e vedações",
  "Cobertura (telhado / laje impermeabilizada)","Instalações elétricas (baixa tensão)",
  "Instalações hidrossanitárias","Instalações de gás","SPDA (para-raios)",
  "Ar-condicionado e climatização","Revestimentos (argamassa, cerâmica, porcelanato)",
  "Pintura interna e externa","Forro (gesso / PVC / drywall)","Esquadrias (portas e janelas)",
  "Vidros e fechamentos","Louças e metais","Impermeabilização","Piso elevado / piso industrial",
  "Calçadas, passeios e pisos externos","Limpeza final de obra",
  "ART / RRT de execução","Demolições e remoção de entulho",
];
const EXCL_SUGESTOES = [
  "Mobiliário e decoração","Paisagismo avançado","Equipamentos de cozinha",
  "Sistema de automação","Painéis fotovoltaicos","Piscina e spa","Elevadores",
  "Climatização central","Projetos executivos","Sondagem e análise de solo",
  "Alvará e licenças","Taxas e impostos","Seguro de obra",
];

// ─── UTILS ───────────────────────────────────────────────────────────────────
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function showToast(msg, dur=3000){
  const t=document.getElementById('toast');
  t.innerHTML=msg; t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),dur);
}

// ─── LOGOS ───────────────────────────────────────────────────────────────────
function handleLogo(tipo, input){
  const file=input.files[0]; if(!file) return;
  if(file.size>2*1024*1024){showToast('Arquivo muito grande. Máximo 2 MB.');return;}
  const reader=new FileReader();
  reader.onload=e=>{
    logosData[tipo]=e.target.result;
    document.getElementById('lp-'+tipo).innerHTML=
      `<img src="${e.target.result}" class="logo-preview" alt="Logo">
       <div style="font-size:11px;color:var(--green);margin-top:5px;font-weight:600">✓ ${file.name}</div>
       <div style="font-size:10.5px;color:var(--muted);margin-top:2px;cursor:pointer;text-decoration:underline" onclick="removeLogo('${tipo}')">Remover</div>`;
  };
  reader.readAsDataURL(file);
}
function removeLogo(tipo){
  logosData[tipo]=null;
  document.getElementById('lp-'+tipo).innerHTML=
    `<div style="font-size:24px;margin-bottom:5px">${tipo==='contratado'?'🏢':'🏗️'}</div>
     <div class="logo-upload-label"><strong>Clique para subir</strong></div>
     <div class="logo-upload-hint">PNG, JPG ou SVG · até 2 MB</div>`;
  document.getElementById('li-'+tipo).value='';
}

// ─── MÁSCARAS ────────────────────────────────────────────────────────────────
function mascaraTel(el){
  let v=el.value.replace(/\D/g,'');
  if(v.length>11) v=v.slice(0,11);
  if(v.length>10) v=v.replace(/^(\d{2})(\d{5})(\d{0,4}).*/,'($1) $2-$3');
  else if(v.length>6) v=v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/,'($1) $2-$3');
  else if(v.length>2) v=v.replace(/^(\d{2})(\d*)/,'($1) $2');
  else if(v.length>0) v='('+v;
  el.value=v;
}
function mascaraCNPJ(el){
  let v=el.value.replace(/\D/g,'');
  if(v.length>14) v=v.slice(0,14);
  if(v.length>11){
    if(v.length<=12) v=v.replace(/^(\d{2})(\d{3})(\d{3})(\d{0,4})/,'$1.$2.$3/$4');
    else v=v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/,'$1.$2.$3/$4-$5');
  } else {
    if(v.length<=3) v=v.replace(/^(\d{1,3})/,'$1');
    else if(v.length<=6) v=v.replace(/^(\d{3})(\d{1,3})/,'$1.$2');
    else if(v.length<=9) v=v.replace(/^(\d{3})(\d{3})(\d{1,3})/,'$1.$2.$3');
    else v=v.replace(/^(\d{3})(\d{3})(\d{3})(\d{1,2})/,'$1.$2.$3-$4');
  }
  el.value=v;
}
function mascaraCPF(el){
  let v=el.value.replace(/\D/g,'');
  if(v.length>11) v=v.slice(0,11);
  if(v.length<=3) v=v.replace(/^(\d{1,3})/,'$1');
  else if(v.length<=6) v=v.replace(/^(\d{3})(\d{1,3})/,'$1.$2');
  else if(v.length<=9) v=v.replace(/^(\d{3})(\d{3})(\d{1,3})/,'$1.$2.$3');
  else v=v.replace(/^(\d{3})(\d{3})(\d{3})(\d{1,2})/,'$1.$2.$3-$4');
  el.value=v;
}
function mascaraValor(el){
  let v=el.value.replace(/\D/g,'');
  if(!v){el.value='';return;}
  el.value='R$ '+(parseInt(v,10)/100).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
}

function toggleTipoPagto(){
  const v=document.getElementById('tipo-pagto').value;
  document.getElementById('campo-pix').style.display=v==='pix'?'block':'none';
  document.getElementById('campos-ted').style.display=v==='ted'?'block':'none';
}

function togglePixTipo(){
  const tipo=document.getElementById('pix-tipo').value;
  const inp=document.getElementById('pix-chave');
  const hint=document.getElementById('pix-hint');
  const placeholders={
    cpf:'000.000.000-00',cnpj:'00.000.000/0001-00',
    email:'Ex: contato@empresa.com.br',celular:'(00) 00000-0000',
    telefone:'(00) 0000-0000',aleatoria:'Cole a chave aleatória gerada no banco'
  };
  const hints={
    cpf:'Informe o CPF cadastrado como chave PIX.',
    cnpj:'Informe o CNPJ cadastrado como chave PIX.',
    celular:'Inclua DDD — ex: (11) 99999-0000.',
    aleatoria:'Chave no formato xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.'
  };
  inp.placeholder=placeholders[tipo]||'Digite a chave cadastrada';
  if(hints[tipo]){hint.textContent=hints[tipo];hint.style.display='block';}
  else hint.style.display='none';
  // Aplicar máscara conforme tipo
  inp.oninput=null;
  if(tipo==='cpf') inp.oninput=()=>mascaraCPF(inp);
  else if(tipo==='cnpj') inp.oninput=()=>mascaraCNPJ(inp);
  else if(tipo==='celular') inp.oninput=()=>mascaraTel(inp);
  inp.value='';
  inp.focus();
}

// ─── NÚMERO POR EXTENSO (BRL) ────────────────────────────────────────────────
function numeroParaExtenso(valor){
  if(!valor||isNaN(valor)) return '';
  const centavos=Math.round(valor*100);
  const reais=Math.floor(centavos/100);
  const cents=centavos%100;
  if(reais===0&&cents===0) return 'zero reais';

  const unidades=['','um','dois','três','quatro','cinco','seis','sete','oito','nove',
    'dez','onze','doze','treze','quatorze','quinze','dezesseis','dezessete','dezoito','dezenove'];
  const dezenas=['','','vinte','trinta','quarenta','cinquenta','sessenta','setenta','oitenta','noventa'];
  const centenas=['','cento','duzentos','trezentos','quatrocentos','quinhentos',
    'seiscentos','setecentos','oitocentos','novecentos'];

  // grupo(n): converte número de 1–999 em palavras
  function grupo(n){
    if(n===0) return '';
    if(n===100) return 'cem';
    let r='';
    const c=Math.floor(n/100);
    const resto=n%100;
    if(c>0) r+=centenas[c]; // "cento" quando há resto, "cem" só quando exato 100
    if(c>0&&resto>0) r+=' e ';
    if(resto>0&&resto<20) r+=unidades[resto];
    else if(resto>=20){
      r+=dezenas[Math.floor(resto/10)];
      if(resto%10>0) r+=' e '+unidades[resto%10];
    }
    return r;
  }

  function formatarGrupos(n){
    if(n===0) return '';
    const bilhoes=Math.floor(n/1000000000);
    const milhoes=Math.floor((n%1000000000)/1000000);
    const milhares=Math.floor((n%1000000)/1000);
    const resto=n%1000;

    const partes=[];

    // Bilhões — "de" quando número redondo (sem milhões/milhares/resto)
    if(bilhoes>0){
      const isRedondo=milhoes===0&&milhares===0&&resto===0;
      partes.push(grupo(bilhoes)+(bilhoes===1?' bilhão':' bilhões')+(isRedondo?' de':''));
    }
    // Milhões — "de" quando número redondo (sem milhares/resto)
    if(milhoes>0){
      const isRedondo=milhares===0&&resto===0;
      partes.push(grupo(milhoes)+(milhoes===1?' milhão':' milhões')+(isRedondo?' de':''));
    }
    if(milhares>0) partes.push(grupo(milhares)+(milhares===1?' mil':' mil'));
    if(resto>0) partes.push(grupo(resto));

    return partes.join(' e ');
  }

  let resultado='';
  if(reais>0){
    resultado+=formatarGrupos(reais);
    resultado+=(reais===1?' real':' reais');
  }
  if(cents>0){
    if(reais>0) resultado+=' e ';
    resultado+=grupo(cents);
    resultado+=(cents===1?' centavo':' centavos');
  }
  return resultado;
}

function autoExtenso(){
  const raw=document.getElementById('valor-total').value.replace(/\D/g,'');
  if(!raw){
    const el=document.getElementById('valor-extenso');
    if(!el._editado) el.value='';
    return;
  }
  const valor=parseInt(raw,10)/100;
  const extenso=numeroParaExtenso(valor);
  const el=document.getElementById('valor-extenso');
  // Só sobrescrever se o usuário não editou manualmente
  if(!el._editado) el.value=extenso;
}

// ─── CORES ───────────────────────────────────────────────────────────────────
function syncCor(tipo){
  const ci=document.getElementById('cor-'+tipo);
  const hi=document.getElementById('cor-'+tipo+'-hex');
  if(document.activeElement===hi){
    const v=hi.value.trim();
    if(/^#[0-9A-Fa-f]{6}$/.test(v)) ci.value=v;
  } else { hi.value=ci.value; }
}
function getCores(){
  return {
    primaria:   document.getElementById('cor-primaria')?.value  || '#1560F5',
    secundaria: document.getElementById('cor-secundaria')?.value || '#0A1A5C',
  };
}

// ─── PRAZO ───────────────────────────────────────────────────────────────────
function togglePrazoOutro(){
  const sel=document.getElementById('prazo-unidade').value;
  document.getElementById('prazo-outro').style.display=sel==='_outro'?'block':'none';
}
function getPrazo(){
  const num=document.getElementById('prazo-num').value.trim();
  const un=document.getElementById('prazo-unidade').value;
  if(un==='_outro') return document.getElementById('prazo-outro').value.trim()||num;
  return num?num+' '+un:'';
}

// ─── ELIST ───────────────────────────────────────────────────────────────────
function ea(id){
  const inp=document.getElementById(id+'-input'),v=inp.value.trim();
  if(!v){showToast('Digite um valor antes de adicionar.');return;}
  if(elistData[id].includes(v)){showToast('Item já adicionado.');inp.value='';return;}
  elistData[id].push(v); inp.value=''; er(id); inp.focus();
}
function es(id,v){
  if(elistData[id].includes(v)){showToast('Item já adicionado.');return;}
  elistData[id].push(v); er(id);
  // Ocultar o chip correspondente
  syncChips(id);
}
function edel(id,i){
  elistData[id].splice(i,1); er(id);
  // Reexibir chips que possam ter sido ocultados
  syncChips(id);
}
function er(id){
  const container=document.getElementById(id+'-items');
  if(!container) return;
  container.innerHTML=elistData[id].map((t,i)=>`
    <div class="elist-item">
      <span class="elist-text">${esc(t)}</span>
      <button class="elist-del" onclick="edel('${id}',${i})">×</button>
    </div>`).join('');
}
// Sincroniza visibilidade dos chips com os itens já adicionados na lista
function syncChips(id){
  // Encontrar o container de sugestões associado ao elist
  const itemsEl=document.getElementById(id+'-items');
  if(!itemsEl) return;
  // Buscar .suggestions no mesmo .field pai (ou irmão próximo)
  let parent=itemsEl.parentElement;
  while(parent&&!parent.classList.contains('card')&&!parent.classList.contains('form-grid')){
    parent=parent.parentElement;
  }
  if(!parent) return;
  const chips=parent.querySelectorAll('.chip');
  chips.forEach(chip=>{
    // Extrair o valor do onclick (segundo argumento de es())
    const m=chip.getAttribute('onclick')||'';
    const match=m.match(/es\(['"][^'"]+['"],\s*['"](.+)['"]\)/);
    if(!match) return;
    const val=match[1];
    chip.style.display=elistData[id]&&elistData[id].includes(val)?'none':'';
  });
}

// ─── CHECKBOXES ──────────────────────────────────────────────────────────────
function toggleChk(i){
  const chk=document.getElementById('chk-'+i),lbl=document.getElementById('chk-lbl-'+i);
  chk.checked=!chk.checked; lbl.classList.toggle('checked',chk.checked);
}

// ─── TAGS EXCLUSÕES ──────────────────────────────────────────────────────────
function addExcl(t){
  if(exclTags.includes(t)){showToast('Item já adicionado.');return;}
  exclTags.push(t);renderExcl();syncExclChips();
}
function removeExcl(t){
  exclTags=exclTags.filter(x=>x!==t);renderExcl();syncExclChips();
}
function syncExclChips(){
  const container=document.getElementById('excl-sugestoes');
  if(!container) return;
  container.querySelectorAll('.chip').forEach(chip=>{
    const m=chip.getAttribute('onclick')||'';
    const match=m.match(/addExcl\(['"](.+)['"]\)/);
    if(!match) return;
    chip.style.display=exclTags.includes(match[1])?'none':'';
  });
}
function renderExcl(){
  document.getElementById('excl-tags').innerHTML=exclTags.map(t=>
    `<span class="tag">${esc(t)}<span class="tag-x" onclick="removeExcl('${t.replace(/'/g,"\\'")}')">×</span></span>`
  ).join('');
}

// ─── NAVEGAÇÃO ───────────────────────────────────────────────────────────────
let maxStepReached = 1;
const TOTAL_FORM_PAGES = 4;

function setStep(n){
  if(n>maxStepReached) maxStepReached=n;
  const total=6;
  for(let i=1;i<=total;i++){
    const s=document.getElementById('step-'+i);
    s.classList.remove('active','done');
    if(i<n) s.classList.add('done');
    else if(i===n) s.classList.add('active');
    s.style.cursor=i<=maxStepReached?'pointer':'default';
    s.style.opacity=i<=maxStepReached?'1':'0.5';
    s.onclick=i<=maxStepReached?(()=>{const step=i;return()=>navigateToStep(step);})():null;
  }
}

function navigateToStep(n){
  if(n>maxStepReached) return;
  if(n<=TOTAL_FORM_PAGES){
    document.getElementById('section-prompt').style.display='none';
    document.getElementById('section-result').style.display='none';
    document.getElementById('section-form').style.display='block';
    for(let i=1;i<=TOTAL_FORM_PAGES;i++) document.getElementById('page-'+i).style.display=i===n?'block':'none';
    currentPage=n; setStep(n); window.scrollTo({top:0,behavior:'smooth'});
  } else if(n===5){
    document.getElementById('section-form').style.display='none';
    document.getElementById('section-result').style.display='none';
    document.getElementById('section-prompt').style.display='block';
    setStep(5); window.scrollTo({top:0,behavior:'smooth'});
  } else if(n===6){
    if(!document.getElementById('doc-content').innerHTML.trim()) return;
    document.getElementById('section-form').style.display='none';
    document.getElementById('section-prompt').style.display='none';
    document.getElementById('section-result').style.display='block';
    setStep(6); window.scrollTo({top:0,behavior:'smooth'});
  }
}

function goPage(n){
  if(n>currentPage&&!validatePage(currentPage)) return;
  document.getElementById('page-'+currentPage).style.display='none';
  currentPage=n;
  document.getElementById('page-'+n).style.display='block';
  setStep(n); window.scrollTo({top:0,behavior:'smooth'});
}

function validatePage(n){
  if(n===1){
    if(!document.getElementById('nome-contratado').value.trim()){showToast('Informe o nome do Contratado.');return false;}
    if(!document.getElementById('cnpj-contratado').value.trim()){showToast('Informe o CNPJ ou CPF do Contratado.');return false;}
    if(!document.getElementById('nome-contratante').value.trim()){showToast('Informe o nome do Contratante.');return false;}
    if(!document.getElementById('cnpj-contratante').value.trim()){showToast('Informe o CNPJ ou CPF do Contratante.');return false;}
    if(!document.getElementById('data-contrato').value){showToast('Informe a data de assinatura do contrato.');return false;}
  }
  if(n===2){
    if(!elistData['tipo-obra'].length){showToast('Adicione ao menos um tipo de obra.');return false;}
    if(!elistData['regime'].length){showToast('Adicione ao menos um regime de execução.');return false;}
    if(!document.getElementById('local-obra').value.trim()){showToast('Informe o local da obra.');return false;}
    if(!document.getElementById('objeto').value.trim()){showToast('Descreva o objeto do contrato.');return false;}
    if(!document.getElementById('prazo-num').value.trim()){showToast('Informe o prazo de execução.');return false;}
  }
  if(n===3){
    if(!document.getElementById('valor-total').value.trim()){showToast('Informe o valor total do contrato.');return false;}
    if(!elistData['pagamento'].length){showToast('Adicione ao menos uma forma de pagamento.');return false;}
  }
  return true;
}

function voltarForm(){
  document.getElementById('section-prompt').style.display='none';
  document.getElementById('section-form').style.display='block';
  document.getElementById('page-4').style.display='block';
  currentPage=4; setStep(4); window.scrollTo({top:0,behavior:'smooth'});
}
function voltarPrompt(){
  document.getElementById('section-result').style.display='none';
  document.getElementById('section-prompt').style.display='block';
  setStep(5); window.scrollTo({top:0,behavior:'smooth'});
}
function resetForm(){
  if(!confirm('Iniciar novo contrato? Os dados serão perdidos.')) return;
  location.reload();
}

// ─── COLETA ──────────────────────────────────────────────────────────────────
function collectData(){
  const checked=[...document.querySelectorAll('#servicos-grid input:checked')].map(c=>c.value);
  const dataDoc=document.getElementById('data-contrato').value;
  const dataFormatada=dataDoc
    ? new Date(dataDoc+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'})
    : new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'});
  // Montar "Local, data" para bloco de assinaturas
  const foro=document.getElementById('foro').value.trim();
  // Extrair cidade do foro (pegar antes de "/" ou "," ou usar o campo inteiro)
  const cidadeAssin = foro
    ? foro.replace(/^[Cc]omarca\s+(de\s+)?/i,'').replace(/\/.*$/,'').replace(/,.*$/,'').trim()
    : (document.getElementById('cidade-contratado').value.trim() || document.getElementById('cidade-contratante').value.trim() || '');
  const localData = cidadeAssin && dataDoc
    ? cidadeAssin + ', ' + new Date(dataDoc+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'})
    : dataFormatada;

  const tipoPagto=document.getElementById('tipo-pagto').value;
  let dadosPagto='';
  if(tipoPagto==='pix'){
    const pixTipoEl=document.getElementById('pix-tipo');
    const pixTipoLabels={cpf:'CPF',cnpj:'CNPJ',email:'E-mail',celular:'Celular',telefone:'Telefone fixo',aleatoria:'Chave aleatória'};
    const pixTipoLabel=pixTipoEl&&pixTipoEl.value?pixTipoLabels[pixTipoEl.value]||pixTipoEl.value:'';
    const ch=document.getElementById('pix-chave').value.trim();
    dadosPagto='PIX'+(pixTipoLabel?' — Tipo: '+pixTipoLabel:'')+(ch?' — Chave: '+ch:'');
  } else if(tipoPagto==='ted'){
    const b=document.getElementById('banco-nome').value.trim();
    const ag=document.getElementById('banco-agencia').value.trim();
    const cc=document.getElementById('banco-conta').value.trim();
    const tit=document.getElementById('banco-titular').value.trim();
    const partes=[b&&'Banco: '+b,ag&&'Agência: '+ag,cc&&'Conta: '+cc,tit&&'Titular: '+tit].filter(Boolean);
    dadosPagto=partes.length?'Transferência / TED — '+partes.join(' · '):'Transferência / TED';
  } else if(tipoPagto){
    const labels={boleto:'Boleto bancário',cheque:'Cheque nominal',dinheiro:'Dinheiro'};
    dadosPagto=labels[tipoPagto]||tipoPagto;
  }
  return {
    nomeContratado:       document.getElementById('nome-contratado').value.trim(),
    cnpjContratado:       document.getElementById('cnpj-contratado').value.trim(),
    endContratado:        document.getElementById('end-contratado').value.trim(),
    cidadeContratado:     document.getElementById('cidade-contratado').value.trim(),
    repContratado:        document.getElementById('rep-contratado').value.trim(),
    repCpfContratado:     document.getElementById('rep-cpf-contratado').value.trim(),
    repRgContratado:      document.getElementById('rep-rg-contratado').value.trim(),
    repCargoContratado:   document.getElementById('rep-cargo-contratado').value.trim(),
    emailContratado:      document.getElementById('email-contratado').value.trim(),
    extraContratado:      [...elistData['extra-contratado']],
    nomeContratante:      document.getElementById('nome-contratante').value.trim(),
    cnpjContratante:      document.getElementById('cnpj-contratante').value.trim(),
    endContratante:       document.getElementById('end-contratante').value.trim(),
    cidadeContratante:    document.getElementById('cidade-contratante').value.trim(),
    repContratante:       document.getElementById('rep-contratante').value.trim(),
    repCpfContratante:    document.getElementById('rep-cpf-contratante').value.trim(),
    repRgContratante:     document.getElementById('rep-rg-contratante').value.trim(),
    repCargoContratante:  document.getElementById('rep-cargo-contratante').value.trim(),
    emailContratante:     document.getElementById('email-contratante').value.trim(),
    extraContratante:     [...elistData['extra-contratante']],
    foro:                 foro||'a definir',
    dataContrato:         dataFormatada,
    localData:            localData,
    tipoObra:             elistData['tipo-obra'].join('; '),
    regime:               elistData['regime'].join('; '),
    localObra:            document.getElementById('local-obra').value.trim(),
    areaObra:             document.getElementById('area-obra').value.trim(),
    objeto:               document.getElementById('objeto').value.trim(),
    servicos:             [...checked,...elistData['servicos-custom']],
    prazo:                getPrazo(),
    dataInicio:           document.getElementById('data-inicio').value.trim()||'após assinatura do contrato',
    valorTotal:           document.getElementById('valor-total').value.trim(),
    valorExtenso:         document.getElementById('valor-extenso').value.trim(),
    pagamento:            elistData['pagamento'].join('; '),
    dadosPagto:           dadosPagto,
    reajuste:             elistData['reajuste'].length?elistData['reajuste'].join('; '):'Sem previsão de reajuste',
    multas:               elistData['multas'],
    responsabilidades:    elistData['responsabilidades'],
    exclusoes:            [...exclTags],
    rescisao:             elistData['rescisao'],
    aditivos:             elistData['aditivos'],
    test1Nome:            document.getElementById('test1-nome').value.trim(),
    test1Email:           document.getElementById('test1-email').value.trim(),
    test2Nome:            document.getElementById('test2-nome').value.trim(),
    test2Email:           document.getElementById('test2-email').value.trim(),
    obs:                  document.getElementById('obs-extras').value.trim(),
    rodapeTexto:          document.getElementById('rodape-texto').value.trim(),
  };
}

// ─── GERAR PROMPT ────────────────────────────────────────────────────────────
function gerarPrompt(){
  if(!validatePage(4)) return;
  const d=collectData();

  promptGerado=
`Você é um especialista em direito da construção civil e contratos de engenharia no Brasil.

Gere um CONTRATO DE EMPREITADA DE OBRA completo, formal e juridicamente fundamentado. O contrato deve proteger ambas as partes, com ênfase na proteção do Contratado.

IMPORTANTE: NÃO repita o título "Contrato de Empreitada de Obra" no corpo do texto — ele já consta no cabeçalho do documento. Comece direto pela CLÁUSULA PRIMEIRA.

PARTES:
- Contratado: ${d.nomeContratado}${d.cnpjContratado?' · CNPJ/CPF: '+d.cnpjContratado:''}${d.endContratado?' · Endereço: '+d.endContratado:''}${d.cidadeContratado?' · '+d.cidadeContratado:''}${d.repContratado?' · Representante: '+d.repContratado:''}
- Contratante: ${d.nomeContratante}${d.cnpjContratante?' · CNPJ/CPF: '+d.cnpjContratante:''}${d.endContratante?' · Endereço: '+d.endContratante:''}${d.cidadeContratante?' · '+d.cidadeContratante:''}${d.repContratante?' · Representante: '+d.repContratante:''}

OBJETO DO CONTRATO:
- Tipo de obra: ${d.tipoObra}
- Regime: ${d.regime}
- Local: ${d.localObra}${d.areaObra?'\n- Área: '+d.areaObra:''}
- Descrição: ${d.objeto}
${d.servicos.length?'\nSERVIÇOS INCLUÍDOS:\n'+d.servicos.map(s=>'• '+s).join('\n'):''}
${d.exclusoes.length?'\nEXCLUSÕES DO ESCOPO:\n'+d.exclusoes.map(t=>'• '+t).join('\n'):''}

PRAZO E VALORES:
- Prazo de execução: ${d.prazo}
- Início previsto: ${d.dataInicio}
- Valor total: ${d.valorTotal}${d.valorExtenso?' ('+d.valorExtenso+')':''}
- Forma de pagamento: ${d.pagamento}${d.dadosPagto?'\n- Dados para recebimento: '+d.dadosPagto:''}
- Reajuste: ${d.reajuste}
${d.multas.length?'\nMULTAS E PENALIDADES:\n'+d.multas.map(m=>'• '+m).join('\n'):''}

${d.responsabilidades.length?'RESPONSABILIDADES E GARANTIAS:\n'+d.responsabilidades.map(r=>'• '+r).join('\n'):''}
${d.rescisao.length?'\nCONDIÇÕES DE RESCISÃO:\n'+d.rescisao.map(r=>'• '+r).join('\n'):''}
${d.aditivos.length?'\nALTERAÇÕES DE ESCOPO:\n'+d.aditivos.map(a=>'• '+a).join('\n'):''}
${d.obs?'\nDISPOSIÇÕES ESPECIAIS: '+d.obs:''}
- Foro de eleição: ${d.foro}

---

Gere o contrato com as cláusulas abaixo, em linguagem jurídica formal (use "Contratado" e "Contratante" como denominações padrão). Numere cada cláusula com ordinal em maiúsculas (CLÁUSULA PRIMEIRA, CLÁUSULA SEGUNDA, etc.).

IMPORTANTE: Para cada cláusula, antes do texto jurídico, inclua uma linha de orientação entre colchetes duplos [[assim]] explicando o que o profissional deve verificar ou personalizar antes de usar o contrato. Essas orientações serão destacadas em laranja na ferramenta e removidas antes de assinar.

NÃO inclua bloco de assinaturas no texto gerado — ele será inserido automaticamente pela ferramenta.

## CLÁUSULA PRIMEIRA — DAS PARTES
## CLÁUSULA SEGUNDA — DO OBJETO
## CLÁUSULA TERCEIRA — DO PRAZO
## CLÁUSULA QUARTA — DO VALOR E FORMA DE PAGAMENTO
## CLÁUSULA QUINTA — DO REAJUSTE DE PREÇOS
## CLÁUSULA SEXTA — DAS RESPONSABILIDADES DO CONTRATADO
## CLÁUSULA SÉTIMA — DAS RESPONSABILIDADES DO CONTRATANTE
## CLÁUSULA OITAVA — DAS GARANTIAS E VÍCIOS DE CONSTRUÇÃO
## CLÁUSULA NONA — DAS EXCLUSÕES E LIMITAÇÕES DO ESCOPO
## CLÁUSULA DÉCIMA — DA RESCISÃO CONTRATUAL
## CLÁUSULA DÉCIMA PRIMEIRA — DAS MULTAS E PENALIDADES
## CLÁUSULA DÉCIMA SEGUNDA — DAS ALTERAÇÕES DE ESCOPO E ADITIVOS
## CLÁUSULA DÉCIMA TERCEIRA — DO FORO
## CLÁUSULA DÉCIMA QUARTA — DAS DISPOSIÇÕES GERAIS`;

  document.getElementById('section-form').style.display='none';
  document.getElementById('section-prompt').style.display='block';
  setStep(5);
  document.getElementById('prompt-box').textContent=promptGerado;
  window.scrollTo({top:0,behavior:'smooth'});
}

// ─── FORMATAR CONTRATO ───────────────────────────────────────────────────────
function formatarContrato(){
  const texto=document.getElementById('contrato-paste').value.trim();
  if(!texto){showToast('Cole o texto gerado pela IA antes de formatar.');return;}
  const d=collectData();
  const cores=getCores();

  // CABEÇALHO
  const blocoLogoContratado=logosData.contratado||d.nomeContratado?`<div class="doc-logo-box">
    ${logosData.contratado?`<img src="${logosData.contratado}" alt="${esc(d.nomeContratado)}">`:''}
    ${d.nomeContratado?`<span class="doc-logo-label">${esc(d.nomeContratado)}</span>`:''}
  </div>`:'';
  const blocoLogoContratante=logosData.contratante||d.nomeContratante?`<div class="doc-logo-box">
    ${logosData.contratante?`<img src="${logosData.contratante}" alt="${esc(d.nomeContratante)}">`:''}
    ${d.nomeContratante?`<span class="doc-logo-label">${esc(d.nomeContratante)}</span>`:''}
  </div>`:'';
  const temLogos=blocoLogoContratado||blocoLogoContratante;
  const logosBloco=temLogos?`<div class="doc-logos">${blocoLogoContratado}<div style="flex:1"></div>${blocoLogoContratante}</div>`:'';

  const tituloPrincipal=`<div class="doc-titulo-contrato">Contrato de empreitada de obra</div>
  ${d.tipoObra?`<div class="doc-subtitulo-tipo">${esc(d.tipoObra.toUpperCase())}</div>`:''}`;

  // RODAPÉ DAS PARTES — removido do resultado (data e foro já constam no corpo do contrato)

  // BLOCO DE ASSINATURAS
  // Linha "local, data" abaixo do último item do contrato
  const localDataHtml=`<p style="margin-top:28px;text-align:right;font-size:12.5px;color:var(--text-2)">${esc(d.localData)}</p>`;

  // Montar linhas do representante — cada dado em linha separada
  function repLinhas(nome,cpf,rg,cargo,extra){
    const linhas=[];
    if(nome)  linhas.push(`<div class="assinatura-cargo">${esc(nome)}</div>`);
    if(cargo) linhas.push(`<div class="assinatura-cargo">Cargo: ${esc(cargo)}</div>`);
    if(cpf)   linhas.push(`<div class="assinatura-cargo">CPF: ${esc(cpf)}</div>`);
    if(rg)    linhas.push(`<div class="assinatura-cargo">RG: ${esc(rg)}</div>`);
    if(extra) extra.forEach(e=>{ if(e) linhas.push(`<div class="assinatura-cargo">${esc(e)}</div>`); });
    return linhas.join('');
  }
  const repLinhasContratado=repLinhas(d.repContratado,d.repCpfContratado,d.repRgContratado,d.repCargoContratado,d.extraContratado);
  const repLinhasContratante=repLinhas(d.repContratante,d.repCpfContratante,d.repRgContratante,d.repCargoContratante,d.extraContratante);

  // Bloco principal: contratado + contratante
  const assinaturasPartes=`<div class="doc-assinaturas">
    <div class="assinatura-box">
      <div class="assinatura-linha"></div>
      <div class="assinatura-nome">${esc(d.nomeContratado||'Contratado')}</div>
      ${repLinhasContratado}
      <div class="assinatura-cargo" style="font-size:10px;margin-top:4px;letter-spacing:.08em">CONTRATADO</div>
    </div>
    <div style="flex-shrink:0;width:40px"></div>
    <div class="assinatura-box">
      <div class="assinatura-linha"></div>
      <div class="assinatura-nome">${esc(d.nomeContratante||'Contratante')}</div>
      ${repLinhasContratante}
      <div class="assinatura-cargo" style="color:var(--text-2);font-size:10px;margin-top:4px;letter-spacing:.08em">CONTRATANTE</div>
    </div>
  </div>`;

  // Testemunhas — só aparecem se pelo menos um nome foi preenchido
  let assinaturasTestemunhas='';
  if(d.test1Nome||d.test2Nome){
    const t1=d.test1Nome||'Testemunha 1';
    const t2=d.test2Nome||'Testemunha 2';
    assinaturasTestemunhas=`<div class="doc-assinaturas" style="margin-top:20px;padding-top:0;border-top:none">
    <div class="assinatura-box">
      <div class="assinatura-linha"></div>
      <div class="assinatura-nome">${esc(t1)}</div>
      ${d.test1Email?`<div class="assinatura-cargo">${esc(d.test1Email)}</div>`:''}
      <div class="assinatura-cargo" style="font-size:10px;color:var(--muted);margin-top:4px;letter-spacing:.08em">TESTEMUNHA 01</div>
    </div>
    <div style="flex-shrink:0;width:40px"></div>
    <div class="assinatura-box">
      <div class="assinatura-linha"></div>
      <div class="assinatura-nome">${esc(t2)}</div>
      ${d.test2Email?`<div class="assinatura-cargo">${esc(d.test2Email)}</div>`:''}
      <div class="assinatura-cargo" style="font-size:10px;color:var(--muted);margin-top:4px;letter-spacing:.08em">TESTEMUNHA 02</div>
    </div>
  </div>`;
  }
  const assinaturasHtml=localDataHtml+assinaturasPartes+assinaturasTestemunhas;

  const rodapeTextoHtml=d.rodapeTexto?`<div class="rodape-doc">${esc(d.rodapeTexto)}</div>`:'';

  const docEl=document.getElementById('doc-content');
  docEl.style.setProperty('--doc-primary',cores.primaria);
  docEl.style.setProperty('--doc-secondary',cores.secundaria);
  docEl.innerHTML=logosBloco+tituloPrincipal+md2html(texto)+assinaturasHtml+rodapeTextoHtml;

  document.getElementById('result-sub').textContent='Gerado em '+d.dataContrato+' · '+d.tipoObra;
  document.getElementById('section-prompt').style.display='none';
  document.getElementById('section-result').style.display='block';
  setStep(6);
  window.scrollTo({top:0,behavior:'smooth'});
}

// ─── MARKDOWN → HTML ─────────────────────────────────────────────────────────
const TC_MINUSC=new Set(['a','à','ao','aos','às','com','contra','da','das','de','do','dos','e','em','entre','na','nas','no','nos','o','os','ou','para','pela','pelas','pelo','pelos','per','por','sem','sob','sobre','um','uma','uns','umas','que','se','até','após','ante','desde','durante','mediante','perante','segundo','via']);
const TC_SIGLAS=new Set(['abnt','art','arts','bim','cnpj','cpf','crea','cau','art','rrt','spda','incc','ipca','cub','nbr','iso','iss','inss','fgts','gf','ltda','mei','epp','sa','eire']);

function titleCase(str){
  const numMatch=str.match(/^(\d+\.?\s*)/);
  const prefix=numMatch?numMatch[1]:'';
  const rest=numMatch?str.slice(prefix.length):str;
  const words=rest.toLowerCase().split(/\s+/);
  const result=words.map((w,i)=>{
    if(!w) return w;
    const clean=w.replace(/[^a-záéíóúâêôàãõçü]/gi,'');
    if(TC_SIGLAS.has(clean)) return w.toUpperCase();
    if(/^[ivxlcdm]+$/.test(clean)&&clean.length<=6&&i>0) return w.toUpperCase();
    if(i>0&&TC_MINUSC.has(clean)) return w;
    return w.charAt(0).toUpperCase()+w.slice(1);
  });
  return prefix+result.join(' ');
}

function md2html(md){
  // Orientações [[...]]
  md=md.replace(/\[\[([^\]]+)\]\]/g,(m,txt)=>`\nORIENTACAO:${txt.trim()}\n`);

  // Separadores
  md=md.replace(/^[-*_]{3,}\s*$/gm,'');
  // Limpar parágrafos genéricos da IA
  md=md.replace(/^.*[Ss]egue\s+(um|o)\s+modelo[^\n]*$/gm,'');
  md=md.replace(/^.*[Aa]baixo\s+está\s+o?\s+contrato[^\n]*$/gm,'');
  md=md.replace(/^.*[Ee]spero\s+que\s+este\s+contrato[^\n]*$/gm,'');
  md=md.replace(/^.*[Rr]ecomendo\s+(que\s+)?revisar[^\n]*$/gm,'');
  // Remover seção de nota/observação final genérica
  md=md.replace(/^#{0,3}\s*[Nn]ota\s*[Ii]mportante[\s\S]{0,800}$/m,'');
  // Remover título repetido "Contrato de Empreitada de Obra" (já está no cabeçalho)
  md=md.replace(/^#{0,3}\s*CONTRATO\s+DE\s+EMPREITADA[^\n]*/gim,'');
  md=md.replace(/^#{0,3}\s*Contrato\s+de\s+[Ee]mpreitada[^\n]*/gm,'');
  // Remover blocos de assinatura gerados pela IA (já inseridos pela ferramenta)
  md=md.replace(/^#{0,3}\s*(LOCAL\s+E\s+DATA|Assinatura|ASSINATURA)[^\n]*/gim,'');
  md=md.replace(/^_{3,}\s*\n.*?(Contratado|Contratante|Testemunha)[^\n]*/gim,'');
  // Referências
  md=md.replace(/^\[\d+\]:.*$/gm,'');
  md=md.replace(/\[\d+\](?!:)/g,'');
  // Linhas em branco excessivas
  md=md.replace(/\n{3,}/g,'\n\n');

  let lines=md.split('\n');
  let out=[],inList=false,listType='';
  function closeList(){if(inList){out.push(listType==='ul'?'</ul>':'</ol>');inList=false;listType='';}}

  for(let raw of lines){
    let line=raw;
    if(line.startsWith('ORIENTACAO:')){
      closeList();
      const txt=line.slice(11).trim();
      out.push(`<div class="orientacao">${esc(txt)}<button class="rm-btn" onclick="this.parentElement.remove()" title="Remover">✕</button></div>`);
      continue;
    }
    // CLÁUSULA como h2 especial
    if(/^#{0,3}\s*CLÁUSULA\s+/i.test(line)){
      closeList();
      const raw2=line.replace(/^#+\s*/,'');
      out.push(`<h2>${inlineFormat(raw2)}</h2>`);
      continue;
    }
    if(/^#{4,} (.+)$/.test(line)){closeList();out.push(`<h3>${inlineFormat(line.replace(/^#+\s*/,''))}</h3>`);continue;}
    if(/^### (.+)$/.test(line)){closeList();out.push(`<h3>${inlineFormat(line.slice(4))}</h3>`);continue;}
    if(/^## (.+)$/.test(line)){
      closeList();
      const h2txt=titleCase(line.slice(3));
      out.push(`<h2>${inlineFormat(h2txt)}</h2>`);continue;
    }
    if(/^# (.+)$/.test(line)){
      closeList();
      const h1txt=inlineFormat(titleCase(line.slice(2)));
      out.push(`<h1 class="doc-titulo">${h1txt}</h1>`);continue;
    }
    if(/^\s*[-•*] (.+)$/.test(line)){
      const txt=line.replace(/^\s*[-•*]\s*/,'');
      if(!inList||listType!=='ul'){closeList();out.push('<ul>');inList=true;listType='ul';}
      out.push(`<li>${inlineFormat(txt)}</li>`);continue;
    }
    if(/^\d+\.\s+(.+)$/.test(line)){
      const txt=line.replace(/^\d+\.\s+/,'');
      if(!inList||listType!=='ol'){closeList();out.push('<ol>');inList=true;listType='ol';}
      out.push(`<li>${inlineFormat(txt)}</li>`);continue;
    }
    if(/^\|.+\|$/.test(line)){
      closeList();
      if(line.match(/^\|[\s\-|]+\|$/)) continue;
      const cells=line.split('|').slice(1,-1).map(c=>c.trim());
      const isHeader=lines.indexOf(raw)>0&&/^\|[\s\-|]+\|$/.test(lines[lines.indexOf(raw)+1]||'');
      if(isHeader){out.push('<table><tr>'+cells.map(c=>`<th>${inlineFormat(c)}</th>`).join('')+'</tr>');continue;}
      out.push('<tr>'+cells.map(c=>`<td>${inlineFormat(c)}</td>`).join('')+'</tr>');continue;
    }
    if(out.length&&!line.startsWith('|')&&out[out.length-1]&&(out[out.length-1].startsWith('<tr>')||out[out.length-1].startsWith('<th>'))){
      out.push('</table>');
    }
    if(!line.trim()){closeList();out.push('');continue;}
    closeList();
    out.push(`<p>${inlineFormat(line)}</p>`);
  }
  closeList();
  let html=out.join('\n');
  html=html.replace(/(<tr>.*?<\/tr>\n*)+/gs,m=>{
    if(!m.includes('<table>')) return `<table>${m}</table>`;
    return m;
  });
  return html;
}

function inlineFormat(s){
  return s
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/\*\*\*(.+?)\*\*\*/g,'<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,'<em>$1</em>')
    .replace(/`(.+?)`/g,'<code>$1</code>');
}

// ─── ORIENTAÇÕES ─────────────────────────────────────────────────────────────
function removerTodasOrientacoes(){
  document.querySelectorAll('#doc-content .orientacao').forEach(el=>el.remove());
  showToast('✓ Todas as orientações foram removidas.');
}

// ─── EDITOR ──────────────────────────────────────────────────────────────────
function fmt(cmd){document.execCommand(cmd,false,null);document.getElementById('doc-content').focus();}
function fmtBlock(tag){document.execCommand('formatBlock',false,tag);document.getElementById('doc-content').focus();}

// ─── SELETOR DE IA ───────────────────────────────────────────────────────────
let selectedAI=null;
function selAI(id,btn){
  selectedAI=id;
  document.querySelectorAll('.ai-sel-btn').forEach(b=>b.classList.remove('selected'));
  btn.classList.add('selected');
  const hint=document.getElementById('ai-sel-hint');
  const nomes={gpt:'ChatGPT',claude:'Claude',gemini:'Gemini'};
  if(hint){hint.textContent='Pronto! Vai abrir '+(nomes[id]||id)+' em nova aba';hint.style.color='var(--green)';}
}
function copiarAbrirIA(){
  if(!promptGerado){showToast('Monte o prompt primeiro.');return;}
  if(!selectedAI){showToast('Selecione uma IA antes de continuar.');return;}
  function abrirIA(){
    if(selectedAI==='claude'){window.open('https://claude.ai/new','_blank');showToast('✓ Prompt copiado! Cole com Ctrl+V no Claude.');}
    else if(selectedAI==='gpt'){window.open('https://chatgpt.com/?q='+encodeURIComponent(promptGerado),'_blank');showToast('✓ Abrindo ChatGPT com o prompt…');}
    else if(selectedAI==='gemini'){window.open('https://gemini.google.com/app?q='+encodeURIComponent(promptGerado),'_blank');showToast('✓ Abrindo Gemini com o prompt…');}
  }
  navigator.clipboard.writeText(promptGerado).then(abrirIA).catch(()=>{
    const ta=document.createElement('textarea');
    ta.value=promptGerado;ta.style.position='fixed';ta.style.top='-9999px';
    document.body.appendChild(ta);ta.select();document.execCommand('copy');
    document.body.removeChild(ta);abrirIA();
  });
}

// ─── DOWNLOAD WORD ───────────────────────────────────────────────────────────
function baixarDocx(){
  const btn=document.getElementById('btn-dl-docx');
  btn.disabled=true;btn.textContent='Gerando…';
  const docEl=document.getElementById('doc-content');
  const clone=docEl.cloneNode(true);
  clone.querySelectorAll('.orientacao').forEach(el=>{
    const txt=document.createTextNode('[ORIENTAÇÃO — REMOVER: '+el.innerText.replace('✕','').trim()+']');
    el.replaceWith(txt);
  });
  const html=clone.innerHTML;
  const cores2=getCores();
  const htmlDoc=`<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="UTF-8">
<style>
@page{size:A4;margin:2.5cm}
body{font-family:Arial,sans-serif;font-size:11pt;line-height:1.6;color:#111;width:16cm;margin:0 auto}
h1.doc-titulo{font-size:20pt;font-weight:bold;text-align:center;color:${cores2.secundaria};margin:0 0 4pt}
.doc-subtitulo-tipo{font-size:11pt;text-align:center;color:#666;margin:0 0 18pt}
.doc-titulo-contrato{font-size:22pt;font-weight:bold;text-align:center;color:${cores2.secundaria};margin:0 0 6pt}
h2{font-size:10pt;font-weight:bold;color:${cores2.primaria};margin:18pt 0 6pt;border-bottom:0.5pt solid #ccc;padding-bottom:3pt;page-break-after:avoid}
h3{font-size:10.5pt;font-weight:bold;margin:10pt 0 4pt;page-break-after:avoid}
p{margin:0 0 7pt;orphans:3;widows:3;text-align:justify}
table{border-collapse:collapse;width:100%;margin:8pt 0;page-break-inside:avoid}
th{background:#EEF3FF;font-weight:bold;text-align:left;padding:5pt 7pt;border:0.5pt solid #ccc;font-size:10pt}
td{padding:5pt 7pt;border:0.5pt solid #ccc;font-size:10pt;vertical-align:top}
ul,ol{margin:4pt 0 8pt;padding-left:16pt}
li{margin-bottom:3pt;font-size:10.5pt}
.doc-logos{display:flex;justify-content:space-between;border-bottom:1pt solid #ddd;padding-bottom:10pt;margin-bottom:14pt;page-break-inside:avoid}
.doc-logo-box img{max-height:50pt;max-width:120pt;object-fit:contain}
.doc-rodape{display:flex;gap:30pt;margin-top:24pt;padding-top:12pt;border-top:1pt solid #ccc;page-break-inside:avoid}
.doc-rodape-col{flex:1}
.doc-rodape-col-label{font-size:7.5pt;font-weight:bold;text-transform:uppercase;color:${cores2.primaria};margin-bottom:5pt}
.doc-rodape-col table{width:100%;border:none;margin:0}
.doc-rodape-col td{border:none;padding:1.5pt 0;font-size:9.5pt}
.doc-rodape-col td:first-child{font-size:8pt;font-weight:bold;text-transform:uppercase;color:#888;width:90pt;padding-right:6pt;white-space:nowrap}
.doc-data-validade{display:flex;gap:24pt;margin-top:10pt;padding-top:8pt;border-top:0.5pt solid #eee;page-break-inside:avoid}
.doc-data-item{display:flex;flex-direction:column;gap:1pt}
.doc-data-label{font-size:7.5pt;font-weight:bold;text-transform:uppercase;color:#999}
.doc-data-valor{font-size:10pt}
.doc-assinaturas{display:flex;justify-content:space-between;margin-top:30pt;padding-top:18pt;border-top:1pt solid #ccc;page-break-inside:avoid}
.assinatura-box{flex:1;text-align:center}
.assinatura-linha{border-top:1pt solid #000;margin-bottom:6pt;width:80%;margin-left:auto;margin-right:auto}
.assinatura-nome{font-size:10.5pt;font-weight:bold}
.assinatura-cargo{font-size:9pt;color:#666}
.assinatura-local{font-size:10pt;color:#666;text-align:center;padding-bottom:20pt}
.orientacao{background:#FEF3E8;border-left:3pt solid #E67E22;padding:6pt 10pt;margin:6pt 0;font-size:9.5pt;color:#7a3c00;page-break-inside:avoid}
.rodape-doc{border-top:0.5pt solid #ddd;margin-top:14pt;padding-top:8pt;font-size:9pt;color:#888;text-align:center;page-break-inside:avoid}
</style>
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom><w:DoNotOptimizeForBrowser/></w:WordDocument></xml><![endif]-->
</head><body>${html}</body></html>`;
  const blob=new Blob([htmlDoc],{type:'application/msword;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;a.download='Contrato-de-Obra.doc';
  document.body.appendChild(a);a.click();
  document.body.removeChild(a);URL.revokeObjectURL(url);
  btn.disabled=false;
  btn.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> Word (.docx)';
  showToast('✓ Arquivo Word baixado!');
}

// ─── SALVAR / IMPORTAR ───────────────────────────────────────────────────────
function salvarHTML(){
  const state={
    version:'1',
    savedAt:new Date().toISOString(),
    elistData:JSON.parse(JSON.stringify(elistData)),
    exclTags:[...exclTags],
    logosData:{...logosData},
    cores:getCores(),
    fields:{
      'nome-contratado':      document.getElementById('nome-contratado').value,
      'cnpj-contratado':      document.getElementById('cnpj-contratado').value,
      'end-contratado':       document.getElementById('end-contratado').value,
      'cidade-contratado':    document.getElementById('cidade-contratado').value,
      'rep-contratado':       document.getElementById('rep-contratado').value,
      'rep-cpf-contratado':   document.getElementById('rep-cpf-contratado').value,
      'rep-rg-contratado':    document.getElementById('rep-rg-contratado').value,
      'rep-cargo-contratado': document.getElementById('rep-cargo-contratado').value,
      'email-contratado':     document.getElementById('email-contratado').value,
      'nome-contratante':     document.getElementById('nome-contratante').value,
      'cnpj-contratante':     document.getElementById('cnpj-contratante').value,
      'end-contratante':      document.getElementById('end-contratante').value,
      'cidade-contratante':   document.getElementById('cidade-contratante').value,
      'rep-contratante':      document.getElementById('rep-contratante').value,
      'rep-cpf-contratante':  document.getElementById('rep-cpf-contratante').value,
      'rep-rg-contratante':   document.getElementById('rep-rg-contratante').value,
      'rep-cargo-contratante':document.getElementById('rep-cargo-contratante').value,
      'email-contratante':    document.getElementById('email-contratante').value,
      'foro':                 document.getElementById('foro').value,
      'data-contrato':        document.getElementById('data-contrato').value,
      'local-obra':           document.getElementById('local-obra').value,
      'area-obra':            document.getElementById('area-obra').value,
      'objeto':               document.getElementById('objeto').value,
      'prazo-num':            document.getElementById('prazo-num').value,
      'prazo-unidade':        document.getElementById('prazo-unidade').value,
      'prazo-outro':          document.getElementById('prazo-outro').value,
      'data-inicio':          document.getElementById('data-inicio').value,
      'valor-total':          document.getElementById('valor-total').value,
      'valor-extenso':        document.getElementById('valor-extenso').value,
      'tipo-pagto':           document.getElementById('tipo-pagto').value,
      'pix-tipo':             document.getElementById('pix-tipo').value,
      'pix-chave':            document.getElementById('pix-chave').value,
      'banco-nome':           document.getElementById('banco-nome').value,
      'banco-agencia':        document.getElementById('banco-agencia').value,
      'banco-conta':          document.getElementById('banco-conta').value,
      'banco-titular':        document.getElementById('banco-titular').value,
      'test1-nome':           document.getElementById('test1-nome').value,
      'test1-email':          document.getElementById('test1-email').value,
      'test2-nome':           document.getElementById('test2-nome').value,
      'test2-email':          document.getElementById('test2-email').value,
      'obs-extras':           document.getElementById('obs-extras').value,
      'rodape-texto':         document.getElementById('rodape-texto').value,
    },
    checkedServicos:[...document.querySelectorAll('#servicos-grid input:checked')].map(c=>c.value),
    promptGerado,
    escopoHTML:document.getElementById('doc-content').innerHTML,
    currentPage,
    currentSection:document.getElementById('section-result').style.display==='block'?'result'
                  :document.getElementById('section-prompt').style.display==='block'?'prompt':'form',
  };
  const pageHTML=document.documentElement.outerHTML;
  const stateTag=`\n<script id="of-saved-state" type="application/json">${JSON.stringify(state)}<\/script>`;
  const finalHTML=pageHTML.replace(/<\/body>/,stateTag+'\n</body>');
  const blob=new Blob([finalHTML],{type:'text/html;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;
  const nome=(state.fields['nome-contratado']||'contrato').replace(/[^a-zA-Z0-9çãõáéíóúâêôàü ]/gi,'').trim().replace(/\s+/g,'-').toLowerCase().slice(0,40);
  a.download=`of-contrato-${nome}-${new Date().toISOString().slice(0,10)}.html`;
  document.body.appendChild(a);a.click();
  document.body.removeChild(a);URL.revokeObjectURL(url);
  showToast('✓ Contrato salvo em HTML!');
}

function importarHTML(input){
  const file=input.files[0];if(!file) return;
  if(!file.name.endsWith('.html')){showToast('Importe um arquivo .html gerado por esta ferramenta.');return;}
  const reader=new FileReader();
  reader.onload=e=>{
    try{
      const html=e.target.result;
      const match=html.match(/<script[^>]*id="of-saved-state"[^>]*>([\s\S]*?)<\/script>/);
      if(!match) throw new Error('Arquivo inválido ou não foi gerado por esta ferramenta.');
      const state=JSON.parse(match[1]);
      Object.assign(elistData,state.elistData||{});
      Object.keys(elistData).forEach(id=>er(id));
      exclTags=state.exclTags||[];renderExcl();
      if(state.logosData){
        logosData=state.logosData;
        ['contratado','contratante'].forEach(tipo=>{
          if(logosData[tipo]){
            document.getElementById('lp-'+tipo).innerHTML=
              `<img src="${logosData[tipo]}" class="logo-preview" alt="Logo">
               <div style="font-size:11px;color:var(--green);margin-top:5px;font-weight:600">✓ Logo importado</div>
               <div style="font-size:10.5px;color:var(--muted);margin-top:2px;cursor:pointer;text-decoration:underline" onclick="removeLogo('${tipo}')">Remover</div>`;
          }
        });
      }
      const f=state.fields||{};
      Object.keys(f).forEach(id=>{const el=document.getElementById(id);if(el) el.value=f[id]||'';});
      (state.checkedServicos||[]).forEach(val=>{
        document.querySelectorAll('#servicos-grid input').forEach(chk=>{
          if(chk.value===val){chk.checked=true;chk.closest('label').classList.add('checked');}
        });
      });
      togglePrazoOutro();
      toggleTipoPagto();
      promptGerado=state.promptGerado||'';
      if(promptGerado) document.getElementById('prompt-box').textContent=promptGerado;
      const sec=state.currentSection||'form';
      if(sec==='result'&&state.escopoHTML){
        document.getElementById('section-form').style.display='none';
        document.getElementById('section-prompt').style.display='none';
        document.getElementById('section-result').style.display='block';
        document.getElementById('doc-content').innerHTML=state.escopoHTML;
        setStep(6);
      } else if(sec==='prompt'){
        document.getElementById('section-form').style.display='none';
        document.getElementById('section-result').style.display='none';
        document.getElementById('section-prompt').style.display='block';
        setStep(5);
      } else {
        const pg=Math.min(state.currentPage||1,TOTAL_FORM_PAGES);
        for(let i=1;i<=TOTAL_FORM_PAGES;i++) document.getElementById('page-'+i).style.display=i===pg?'block':'none';
        currentPage=pg;setStep(pg);
      }
      showToast('✓ Contrato importado com sucesso!');
    }catch(err){showToast('Erro ao importar: '+err.message);}
  };
  reader.readAsText(file);
  input.value='';
}

// ─── INIT ────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded',function(){
  // Checkboxes
  document.getElementById('servicos-grid').innerHTML=SERVICOS_LISTA.map((s,i)=>`
    <label class="check-item" id="chk-lbl-${i}" onclick="toggleChk(${i})">
      <input type="checkbox" id="chk-${i}" value="${esc(s)}">
      <div class="check-box"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><polyline points="20 6 9 17 4 12"/></svg></div>
      <span class="check-label">${s}</span>
    </label>`).join('');

  // Sugestões exclusões
  document.getElementById('excl-sugestoes').innerHTML=EXCL_SUGESTOES.map(s=>
    `<span class="chip" onclick="addExcl('${esc(s)}')">${s}</span>`).join('');

  // Tag input exclusões
  const ei=document.getElementById('excl-input');
  ei.addEventListener('keydown',e=>{
    if(e.key==='Enter'||e.key===','){
      e.preventDefault();
      const v=ei.value.trim().replace(/,$/,'');
      if(v) addExcl(v);ei.value='';
    }
  });
  ei.addEventListener('blur',()=>{const v=ei.value.trim();if(v) addExcl(v);ei.value='';});

  // Enter nos inputs elist
  ['tipo-obra','regime','pagamento','reajuste','multas','responsabilidades','rescisao','aditivos','servicos-custom','extra-contratado','extra-contratante'].forEach(id=>{
    const inp=document.getElementById(id+'-input');
    if(inp) inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();ea(id);}});
  });

  // Sync cores
  ['primaria','secundaria'].forEach(tipo=>{
    document.getElementById('cor-'+tipo).addEventListener('input',()=>{
      document.getElementById('cor-'+tipo+'-hex').value=document.getElementById('cor-'+tipo).value;
    });
  });

  // Valor por extenso — detectar edição manual
  const elExtenso=document.getElementById('valor-extenso');
  elExtenso.addEventListener('input',()=>{ elExtenso._editado=true; });
  elExtenso.addEventListener('blur',()=>{
    // Se o campo ficou vazio, liberar auto-preenchimento
    if(!elExtenso.value.trim()) elExtenso._editado=false;
  });

  // Restaurar state embutido (se houver — importado via save)
  const savedEl=document.getElementById('of-saved-state');
  if(savedEl){
    try{
      const state=JSON.parse(savedEl.textContent);
      // Restauração automática ao abrir arquivo salvo
      setTimeout(()=>importarEstado(state),100);
    }catch(e){}
  }

  setStep(1);
});

function importarEstado(state){
  Object.assign(elistData,state.elistData||{});
  Object.keys(elistData).forEach(id=>er(id));
  exclTags=state.exclTags||[];renderExcl();
  if(state.logosData){
    logosData=state.logosData;
    ['contratado','contratante'].forEach(tipo=>{
      if(logosData[tipo]){
        document.getElementById('lp-'+tipo).innerHTML=
          `<img src="${logosData[tipo]}" class="logo-preview" alt="Logo">
           <div style="font-size:11px;color:var(--green);margin-top:5px;font-weight:600">✓ Logo importado</div>
           <div style="font-size:10.5px;color:var(--muted);margin-top:2px;cursor:pointer;text-decoration:underline" onclick="removeLogo('${tipo}')">Remover</div>`;
      }
    });
  }
  const f=state.fields||{};
  Object.keys(f).forEach(id=>{const el=document.getElementById(id);if(el) el.value=f[id]||'';});
  (state.checkedServicos||[]).forEach(val=>{
    document.querySelectorAll('#servicos-grid input').forEach(chk=>{
      if(chk.value===val){chk.checked=true;chk.closest('label').classList.add('checked');}
    });
  });
  togglePrazoOutro();
  toggleTipoPagto();
  promptGerado=state.promptGerado||'';
  if(promptGerado) document.getElementById('prompt-box').textContent=promptGerado;
  const sec=state.currentSection||'form';
  if(sec==='result'&&state.escopoHTML){
    document.getElementById('section-form').style.display='none';
    document.getElementById('section-prompt').style.display='none';
    document.getElementById('section-result').style.display='block';
    document.getElementById('doc-content').innerHTML=state.escopoHTML;
    setStep(6);
  } else if(sec==='prompt'){
    document.getElementById('section-form').style.display='none';
    document.getElementById('section-result').style.display='none';
    document.getElementById('section-prompt').style.display='block';
    setStep(5);
  } else {
    const pg=Math.min(state.currentPage||1,TOTAL_FORM_PAGES);
    for(let i=1;i<=TOTAL_FORM_PAGES;i++) document.getElementById('page-'+i).style.display=i===pg?'block':'none';
    currentPage=pg;setStep(pg);
  }
}
