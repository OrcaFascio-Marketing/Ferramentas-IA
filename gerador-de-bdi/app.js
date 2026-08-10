
var currentPage = 1;
var maxStepReached = 1;
var bdiState = {};
var justifHTML = '';

var TIPO_HINTS = {
  edificacoes:  'Edificações: faixa de referência do TCU de 18% a 30% (Acórdão 2.369/2011).',
  pavimentacao: 'Pavimentação: faixa de referência do TCU de 12% a 25%.',
  saneamento:   'Saneamento / Hidráulica: faixa de referência do TCU de 15% a 27%.',
  instalacoes:  'Instalações e montagens: faixa de referência do TCU de 18% a 30%.',
  outro:        'Verifique a faixa aplicável no Acórdão 2.369/2011-TCU-Plenário.'
};
var TIPO_FAIXA = {
  edificacoes:[18,30], pavimentacao:[12,25], saneamento:[15,27], instalacoes:[18,30], outro:[12,35]
};

function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function selectTipo(el,val){
  document.querySelectorAll('.radio-tab').forEach(function(t){t.classList.remove('selected');});
  el.classList.add('selected');
  var h=document.getElementById('tipo-hint');
  if(h) h.textContent=TIPO_HINTS[val]||'';
  calcBDI();
}
function getTipoObra(){
  var el=document.querySelector('input[name="tipo-obra"]:checked');
  return el?el.value:'edificacoes';
}

function onRegimeTributarioChange(){
  var r=document.getElementById('regime-tributario').value;
  var aviso=document.getElementById('aviso-regime');
  if(r==='lucro_presumido'){
    setInputVal('t-pis','0.65'); setInputVal('t-cofins','3.00');
    setInputVal('t-csll','1.08'); setInputVal('t-irpj','1.20');
    setText('hint-pis','Lucro Presumido: 0,65%'); setText('hint-cofins','Lucro Presumido: 3,00%');
    aviso.style.display='none';
  } else if(r==='lucro_real'){
    setInputVal('t-pis','1.65'); setInputVal('t-cofins','7.60');
    setInputVal('t-csll','1.08'); setInputVal('t-irpj','1.20');
    setText('hint-pis','Lucro Real: 1,65% (não-cumulativo)'); setText('hint-cofins','Lucro Real: 7,60% (não-cumulativo)');
    aviso.innerHTML='<strong>Lucro Real:</strong> PIS/COFINS no regime não-cumulativo. Verifique os créditos de entrada para calcular o impacto líquido real.';
    aviso.style.display='block';
  } else {
    setInputVal('t-pis','0.00'); setInputVal('t-cofins','0.00');
    setInputVal('t-csll','0.00'); setInputVal('t-irpj','0.00');
    setText('hint-pis','Simples Nacional: incluído na alíquota unificada');
    setText('hint-cofins','Simples Nacional: incluído na alíquota unificada');
    aviso.innerHTML='<strong>Simples Nacional:</strong> Tributos unificados. Informe a alíquota total em "Outros tributos".';
    aviso.style.display='block';
  }
  calcBDI();
}

function setInputVal(id,v){ var el=document.getElementById(id); if(el) el.value=v; }
function setText(id,v){ var el=document.getElementById(id); if(el) el.textContent=v; }
function getNum(id){ var v=parseFloat(document.getElementById(id).value); return isNaN(v)?0:v; }
function setVal(id,val){ document.getElementById(id).value=val.toFixed(2); calcBDI(); }
function fmt(n){ return n.toFixed(2).replace('.',',')+' %'; }

function setACRef(){ var v=document.getElementById('ac-ref').value; if(v!=='custom') setVal('ac',parseFloat(v)); }
function setRiscoPerfil(){ var m={baixo:0.5,medio:1.27,alto:2.5}; var v=document.getElementById('risco-perfil').value; if(m[v]!==undefined) setVal('r-riscos',m[v]); }
function setLBPerfil(){ var m={minimo:5,medio:7.4,maximo:12}; var v=document.getElementById('lb-perfil').value; if(m[v]!==undefined) setVal('lb',m[v]); }

function calcBDI(){
  var ac=getNum('ac');
  var seg=getNum('s-seguros'), gar=getNum('s-garantias'), sou=getNum('s-outros');
  var s=seg+gar+sou;
  var r=getNum('r-riscos'), df=getNum('df'), lb=getNum('lb');
  var iss=getNum('t-iss'), pis=getNum('t-pis'), cofins=getNum('t-cofins');
  var csll=getNum('t-csll'), irpj=getNum('t-irpj'), tout=getNum('t-outros');
  var t=iss+pis+cofins+csll+irpj+tout;

  var ttEl=document.getElementById('total-tributos');
  if(ttEl) ttEl.textContent=fmt(t);
  var stEl=document.getElementById('status-tributos');
  if(stEl){
    if(t>15){stEl.textContent='⚠ Tributação elevada';stEl.style.color='var(--orange)';}
    else if(t<5){stEl.textContent='ℹ Tributação baixa';stEl.style.color='var(--muted)';}
    else{stEl.textContent='✓ Faixa usual';stEl.style.color='var(--green)';}
  }

  var num=(1+ac/100)*(1+s/100)*(1+r/100)*(1+df/100)*(1+lb/100);
  var den=1-t/100;
  var bdi=den>0?(num/den-1)*100:0;

  bdiState={ac:ac,s:s,seg:seg,gar:gar,sou:sou,r:r,df:df,lb:lb,
            iss:iss,pis:pis,cofins:cofins,csll:csll,irpj:irpj,tout:tout,t:t,bdi:bdi};

  updatePreview(bdi);
  return bdi;
}

function updatePreview(bdi){
  var el=document.getElementById('preview-bdi');
  if(!el||currentPage!==4) return;
  var d=bdiState;
  var tipo=getTipoObra();
  var faixa=TIPO_FAIXA[tipo]||[12,35];
  var status='';
  if(bdi<faixa[0]) status='<span style="color:var(--orange)">⚠ Abaixo da faixa TCU ('+faixa[0]+'% – '+faixa[1]+'%) — exige justificativa</span>';
  else if(bdi>faixa[1]) status='<span style="color:var(--red)">⚠ Acima da faixa TCU ('+faixa[0]+'% – '+faixa[1]+'%) — exige justificativa</span>';
  else status='<span style="color:var(--green)">✓ Dentro da faixa TCU ('+faixa[0]+'% – '+faixa[1]+'%)</span>';

  el.innerHTML='<div style="display:flex;align-items:flex-end;gap:12px;margin-bottom:10px">'+
    '<span style="font-size:42px;font-weight:900;color:var(--blue);line-height:1">'+bdi.toFixed(2).replace('.',',')+'<span style="font-size:24px"> %</span></span>'+
    '<span style="font-size:12px;color:var(--muted);padding-bottom:6px">BDI calculado</span></div>'+
    '<div style="font-size:12px;margin-bottom:12px">'+status+'</div>'+
    '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;font-size:12px">'+
    mkCard('Tributos (T)',fmt(d.t))+
    mkCard('Adm. Central (AC)',fmt(d.ac))+
    mkCard('Seguros (S)',fmt(d.s))+
    mkCard('Riscos (R)',fmt(d.r))+
    mkCard('Desp. Fin. (DF)',fmt(d.df))+
    mkCard('Lucro Bruto (LB)',fmt(d.lb),'var(--green)')+
    '</div>';
}
function mkCard(lbl,val,color){
  return '<div style="background:var(--bg);padding:9px 11px;border-radius:6px;border:1px solid var(--border)">'+
    '<div style="color:var(--muted);font-size:10px;text-transform:uppercase;letter-spacing:.06em;margin-bottom:3px">'+lbl+'</div>'+
    '<div style="font-weight:700;color:'+(color||'var(--blue-mid)')+'">'+val+'</div></div>';
}

// ─── RESULTADO ────────────────────────────────────────────────────────────────
function gerarResultado(){
  calcBDI();
  var d=bdiState;
  var empresa=document.getElementById('empresa').value.trim()||'Não informado';
  var objeto=document.getElementById('objeto').value.trim()||'Não informado';
  var respons=document.getElementById('responsavel').value.trim()||'—';
  var dataRef=document.getElementById('data-ref').value;
  var dataFmt=dataRef?new Date(dataRef+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'}):new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'});
  var regTrib={'lucro_presumido':'Lucro Presumido','lucro_real':'Lucro Real','simples':'Simples Nacional'};
  var regExec={'empreitada_global':'Empreitada global','empreitada_preco_unitario':'Empreitada por preço unitário','tarefa':'Tarefa','administracao_contratada':'Administração contratada'};
  var regT=regTrib[document.getElementById('regime-tributario').value]||'';
  var regE=regExec[document.getElementById('regime-execucao').value]||'';
  var tipo=getTipoObra();
  var faixa=TIPO_FAIXA[tipo]||[12,35];
  var tipoLabel={'edificacoes':'Edificações','pavimentacao':'Pavimentação','saneamento':'Saneamento / Hidráulica','instalacoes':'Instalações e montagens','outro':'Outro'}[tipo]||tipo;
  var dentro=d.bdi>=faixa[0]&&d.bdi<=faixa[1];
  var badge=dentro
    ?'<span style="display:inline-block;background:var(--green-bg);color:var(--green);font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;border:1px solid #a7e8c5;vertical-align:middle;margin-left:10px">✓ Dentro da faixa TCU</span>'
    :'<span style="display:inline-block;background:var(--orange-bg);color:var(--orange);font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;border:1px solid #f0c090;vertical-align:middle;margin-left:10px">⚠ Fora da faixa TCU — exige justificativa</span>';

  var num=(1+d.ac/100)*(1+d.s/100)*(1+d.r/100)*(1+d.df/100)*(1+d.lb/100);
  var den=1-d.t/100;

  var html='<div style="background:#fff;border:1.5px solid var(--border);border-radius:var(--radius);padding:28px;box-shadow:var(--shadow-sm)">';

  // Cabeçalho
  html+='<div style="margin-bottom:20px;padding-bottom:18px;border-bottom:2px solid var(--border)">';
  html+='<div style="font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.1em;margin-bottom:6px">Memória de cálculo — BDI</div>';
  html+='<div style="font-size:32px;font-weight:900;color:var(--blue);line-height:1.1;margin-bottom:8px">'+d.bdi.toFixed(2).replace('.',',')+' %'+badge+'</div>';
  html+='<div style="font-size:12px;color:var(--muted);margin-bottom:12px">Faixa TCU para '+tipoLabel+': '+faixa[0]+'% a '+faixa[1]+'%</div>';
  html+='<table style="font-size:12px;width:100%;border-collapse:collapse">';
  html+='<tr><td style="padding:3px 10px 3px 0;color:var(--muted)">Empresa</td><td style="font-weight:600;color:var(--text)">'+esc(empresa)+'</td>';
  html+='<td style="padding:3px 10px;color:var(--muted)">Regime tributário</td><td style="font-weight:600;color:var(--text)">'+regT+'</td></tr>';
  html+='<tr><td style="padding:3px 10px 3px 0;color:var(--muted)">Obra / Objeto</td><td style="font-weight:600;color:var(--text)">'+esc(objeto)+'</td>';
  html+='<td style="padding:3px 10px;color:var(--muted)">Regime de execução</td><td style="font-weight:600;color:var(--text)">'+regE+'</td></tr>';
  html+='<tr><td style="padding:3px 10px 3px 0;color:var(--muted)">Data de referência</td><td style="font-weight:600;color:var(--text)">'+dataFmt+'</td>';
  html+='<td style="padding:3px 10px;color:var(--muted)">Responsável</td><td style="font-weight:600;color:var(--text)">'+esc(respons)+'</td></tr>';
  html+='</table></div>';

  // Fórmula
  html+='<div style="background:var(--blue-pale);border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:14px 18px;margin-bottom:18px">';
  html+='<div style="font-size:10px;font-weight:700;color:var(--blue);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px">Fórmula — Acórdão 2.369/2011-TCU-Plenário</div>';
  html+='<div style="font-family:monospace;font-size:12.5px;color:var(--text);line-height:2">';
  html+='BDI = [(1+AC) × (1+S) × (1+R) × (1+DF) × (1+LB)] / (1−T) − 1<br>';
  html+='BDI = [(1+'+d.ac.toFixed(4)+'%) × (1+'+d.s.toFixed(4)+'%) × (1+'+d.r.toFixed(4)+'%) × (1+'+d.df.toFixed(4)+'%) × (1+'+d.lb.toFixed(4)+'%)] / (1−'+d.t.toFixed(4)+'%) − 1<br>';
  html+='BDI = '+num.toFixed(6)+' / '+den.toFixed(6)+' − 1<br>';
  html+='<strong>BDI = <span style="color:var(--blue)">'+d.bdi.toFixed(4)+'% ≈ '+d.bdi.toFixed(2).replace('.',',')+'%</span></strong>';
  html+='</div></div>';

  // Tabela
  html+='<table class="bdi-table"><thead><tr><th>Componente</th><th>Símbolo</th><th>Descrição</th><th class="td-pct">%</th></tr></thead><tbody>';
  html+='<tr class="tr-group"><th colspan="4">T — Tributos</th></tr>';
  if(d.iss) html+='<tr><td class="td-label">ISS</td><td>T₁</td><td class="td-mem">Imposto Sobre Serviços — alíquota do município</td><td class="td-pct">'+fmt(d.iss)+'</td></tr>';
  if(d.pis) html+='<tr><td class="td-label">PIS</td><td>T₂</td><td class="td-mem">Programa de Integração Social — regime '+regT+'</td><td class="td-pct">'+fmt(d.pis)+'</td></tr>';
  if(d.cofins) html+='<tr><td class="td-label">COFINS</td><td>T₃</td><td class="td-mem">Contribuição para Financiamento da Seguridade Social</td><td class="td-pct">'+fmt(d.cofins)+'</td></tr>';
  if(d.csll) html+='<tr><td class="td-label">CSLL</td><td>T₄</td><td class="td-mem">Contribuição Social sobre o Lucro Líquido</td><td class="td-pct">'+fmt(d.csll)+'</td></tr>';
  if(d.irpj) html+='<tr><td class="td-label">IRPJ</td><td>T₅</td><td class="td-mem">Imposto de Renda Pessoa Jurídica</td><td class="td-pct">'+fmt(d.irpj)+'</td></tr>';
  if(d.tout) html+='<tr><td class="td-label">Outros</td><td>T₆</td><td class="td-mem">Outros tributos incidentes</td><td class="td-pct">'+fmt(d.tout)+'</td></tr>';
  html+='<tr style="background:var(--blue-pale)"><td class="td-label" colspan="3"><strong>Total Tributos (T)</strong></td><td class="td-pct"><strong>'+fmt(d.t)+'</strong></td></tr>';
  html+='<tr class="tr-group"><th colspan="4">AC — Administração Central</th></tr>';
  html+='<tr><td class="td-label">Adm. Central</td><td>AC</td><td class="td-mem">Rateio dos custos fixos da empresa: sede, pró-labore, equipe administrativa, softwares, overhead</td><td class="td-pct">'+fmt(d.ac)+'</td></tr>';
  html+='<tr class="tr-group"><th colspan="4">S — Seguros e Garantias</th></tr>';
  if(d.seg) html+='<tr><td class="td-label">Seguros de obra</td><td>S₁</td><td class="td-mem">Seguro de riscos de engenharia e responsabilidade civil</td><td class="td-pct">'+fmt(d.seg)+'</td></tr>';
  if(d.gar) html+='<tr><td class="td-label">Garantias contratuais</td><td>S₂</td><td class="td-mem">Caução contratual ou seguro-garantia de execução</td><td class="td-pct">'+fmt(d.gar)+'</td></tr>';
  if(d.sou) html+='<tr><td class="td-label">Outros seguros</td><td>S₃</td><td class="td-mem">Demais seguros aplicáveis</td><td class="td-pct">'+fmt(d.sou)+'</td></tr>';
  html+='<tr style="background:var(--blue-pale)"><td class="td-label" colspan="3"><strong>Total Seguros e Garantias (S)</strong></td><td class="td-pct"><strong>'+fmt(d.s)+'</strong></td></tr>';
  html+='<tr class="tr-group"><th colspan="4">R — Riscos</th></tr>';
  html+='<tr><td class="td-label">Riscos</td><td>R</td><td class="td-mem">Imprevistos de execução, variação de insumos, risco tecnológico e de prazo</td><td class="td-pct">'+fmt(d.r)+'</td></tr>';
  html+='<tr class="tr-group"><th colspan="4">DF — Despesas Financeiras</th></tr>';
  html+='<tr><td class="td-label">Desp. financeiras</td><td>DF</td><td class="td-mem">Custo do capital de giro para financiar o ciclo entre medições e recebimentos</td><td class="td-pct">'+fmt(d.df)+'</td></tr>';
  html+='<tr class="tr-group"><th colspan="4">LB — Lucro Bruto</th></tr>';
  html+='<tr><td class="td-label">Lucro bruto</td><td>LB</td><td class="td-mem">Remuneração pelo risco empresarial</td><td class="td-pct">'+fmt(d.lb)+'</td></tr>';
  html+='</tbody><tfoot><tr><td colspan="3"><strong>BDI TOTAL (fórmula TCU)</strong></td><td class="td-pct"><strong>'+fmt(d.bdi)+'</strong></td></tr></tfoot></table>';
  html+='<div style="font-size:11.5px;color:var(--muted);line-height:1.7;margin-top:8px"><strong>Referência:</strong> Acórdão 2.369/2011-TCU-Plenário · Gerado em '+new Date().toLocaleString('pt-BR')+'.</div>';
  html+='</div>';

  document.getElementById('bdi-resultado-bloco').innerHTML=html;
  goPage(5);
  showToast('✓ BDI calculado com sucesso!');
}

// ─── PROMPT ───────────────────────────────────────────────────────────────────
function gerarPromptTexto(){
  var d=bdiState;
  var empresa=document.getElementById('empresa').value.trim()||'não informado';
  var objeto=document.getElementById('objeto').value.trim()||'não informado';
  var respons=document.getElementById('responsavel').value.trim()||'não informado';
  var regTrib={'lucro_presumido':'Lucro Presumido','lucro_real':'Lucro Real','simples':'Simples Nacional'};
  var regT=regTrib[document.getElementById('regime-tributario').value]||'Lucro Presumido';
  var tipo=getTipoObra();
  var tipoLabel={'edificacoes':'Edificações','pavimentacao':'Pavimentação','saneamento':'Saneamento / Hidráulica','instalacoes':'Instalações e montagens','outro':'Outro'}[tipo]||tipo;
  var faixa=TIPO_FAIXA[tipo]||[12,35];
  return 'Você é um engenheiro orçamentista especialista em licitações públicas, com domínio do Acórdão 2.369/2011-TCU-Plenário.\n\n'+
    'Elabore uma JUSTIFICATIVA TÉCNICA DO BDI para inserir no memorial descritivo ou processo licitatório.\n\n'+
    '── DADOS ──────────────────────────────────────────\n'+
    'Empresa: '+empresa+'\nObra: '+objeto+'\nResponsável: '+respons+'\nTipo: '+tipoLabel+'\nRegime tributário: '+regT+'\n\n'+
    'COMPOSIÇÃO:\n'+
    '  ISS: '+d.iss.toFixed(2)+'%  PIS: '+d.pis.toFixed(2)+'%  COFINS: '+d.cofins.toFixed(2)+'%\n'+
    '  CSLL: '+d.csll.toFixed(2)+'%  IRPJ: '+d.irpj.toFixed(2)+'%  Outros: '+d.tout.toFixed(2)+'%\n'+
    '  TOTAL T = '+d.t.toFixed(2)+'%\n'+
    '  AC = '+d.ac.toFixed(2)+'%\n'+
    '  Seguros: '+d.seg.toFixed(2)+'%  Garantias: '+d.gar.toFixed(2)+'%  Outros S: '+d.sou.toFixed(2)+'% → S = '+d.s.toFixed(2)+'%\n'+
    '  R = '+d.r.toFixed(2)+'%\n  DF = '+d.df.toFixed(2)+'%\n  LB = '+d.lb.toFixed(2)+'%\n\n'+
    'FÓRMULA: BDI = [(1+AC)(1+S)(1+R)(1+DF)(1+LB)/(1−T)]−1\n'+
    'BDI = '+d.bdi.toFixed(2)+'%   Faixa TCU ('+tipoLabel+'): '+faixa[0]+'%–'+faixa[1]+'%\n\n'+
    '── INSTRUÇÕES ──────────────────────────────────────\n'+
    '1. Redija justificativa técnica em até 600 palavras, em terceira pessoa, linguagem formal.\n'+
    '2. Cite o Acórdão 2.369/2011-TCU-Plenário como base normativa.\n'+
    '3. Justifique cada componente referenciando as faixas TCU.\n'+
    '4. Se o BDI estiver fora da faixa, justifique tecnicamente as circunstâncias.\n'+
    '5. Inclua ao final a fórmula desenvolvida e o resultado numérico.\n';
}

function copiarPrompt(){
  var txt=gerarPromptTexto();
  var box=document.getElementById('prompt-box');
  var wrap=document.getElementById('prompt-gerado');
  box.textContent=txt;
  wrap.style.display='block';
  navigator.clipboard.writeText(txt).then(function(){
    showToast('✓ Prompt copiado! Cole na IA de sua preferência.');
    var btn=document.getElementById('btn-copiar');
    btn.innerHTML='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Copiado!';
    setTimeout(function(){btn.innerHTML='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg> Copiar prompt de justificativa técnica';},2500);
  }).catch(function(){ showToast('Use Ctrl+C para copiar o prompt.'); });
}

// ─── EDITOR ──────────────────────────────────────────────────────────────────
function docCmd(cmd,val){ document.execCommand(cmd,false,val||null); document.getElementById('justif-editor').focus(); }

function handlePaste(e){
  e.preventDefault();
  var text=(e.clipboardData||window.clipboardData).getData('text/plain');
  var paragraphs=text.split(/\n\n+/);
  var h=paragraphs.map(function(p){
    var t=p.trim(); if(!t) return '';
    if(t.length<80&&(t===t.toUpperCase()||t.endsWith(':'))) return '<h3>'+esc(t)+'</h3>';
    return '<p>'+t.replace(/\n/g,'<br>')+'</p>';
  }).filter(Boolean).join('');
  document.execCommand('insertHTML',false,h||'<p>'+esc(text)+'</p>');
}

function limparEditor(){
  var ed=document.getElementById('justif-editor');
  ed.innerHTML='<p style="color:var(--muted-light);font-style:italic">Cole aqui o texto gerado pela IA e edite conforme necessário…</p>';
  justifHTML='';
}

function onEditorChange(){ justifHTML=document.getElementById('justif-editor').innerHTML; }

function confirmarJustificativa(){
  var ed=document.getElementById('justif-editor');
  var content=ed.innerHTML;
  if(!content||content.indexOf('Cole aqui o texto')!==-1){ showToast('Cole o texto da IA antes de incorporar.'); return; }
  justifHTML=content;
  var bloco=document.getElementById('bdi-resultado-bloco');
  var antigo=document.getElementById('justif-bloco-incorporado');
  if(antigo) antigo.remove();
  var div=document.createElement('div');
  div.id='justif-bloco-incorporado';
  div.className='justif-incorporada';
  div.innerHTML='<div class="justif-incorporada-label">Justificativa técnica (gerada por IA)</div><div class="result-doc" style="padding:0;border:none;box-shadow:none;min-height:0">'+content+'</div>';
  bloco.appendChild(div);
  showToast('✓ Justificativa incorporada!');
  div.scrollIntoView({behavior:'smooth',block:'start'});
}

// ─── NAVEGAÇÃO ────────────────────────────────────────────────────────────────
function goPage(n){
  for(var i=1;i<=5;i++){
    var p=document.getElementById('page-'+i);
    if(p) p.style.display=(i===n)?'block':'none';
  }
  currentPage=n;
  if(n>maxStepReached) maxStepReached=n;
  setStep(n);
  if(n===4) calcBDI();
  window.scrollTo({top:0,behavior:'smooth'});
}

function goStepNav(n){
  if(n>maxStepReached) return;
  goPage(n);
}

function setStep(n){
  for(var i=1;i<=5;i++){
    var el=document.getElementById('step-'+i);
    if(!el) continue;
    el.classList.remove('active','done');
    if(i===n) el.classList.add('active');
    else if(i<n||i<=maxStepReached) el.classList.add('done');
  }
}

// ─── DOWNLOADS ────────────────────────────────────────────────────────────────
function baixarHTML(){
  var state=coletarState();
  var stateJSON=JSON.stringify(state).replace(/</g,'\\u003c').replace(/>/g,'\\u003e');
  var html=document.documentElement.outerHTML;
  var marker='/*__BDI_STATE__*/';
  var inject='var __IMPORTED_STATE__='+stateJSON+'; /*__BDI_STATE__*/';
  if(html.indexOf(marker)!==-1){
    html=html.replace(/var __IMPORTED_STATE__[\s\S]*?\/\*__BDI_STATE__\*\//,inject);
  } else {
    html=html.replace('</body>','<script>'+inject+'<\/script></body>');
  }
  var blob=new Blob([html],{type:'text/html;charset=utf-8'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');
  a.href=url;
  var emp=(document.getElementById('empresa').value.trim()||'bdi').replace(/[^a-zA-Z0-9]/g,'-').toLowerCase();
  a.download='BDI-'+emp+'.html';
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  showToast('✓ Arquivo HTML salvo!');
}

function baixarPDF(){ window.print(); }

function baixarWord(){
  var empresa=document.getElementById('empresa').value.trim()||'BDI';
  var resultBloco=document.getElementById('bdi-resultado-bloco').innerHTML;
  var jstf=justifHTML?'<h2>Justificativa técnica (gerada por IA)</h2>'+justifHTML:'';
  var doc='<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;font-size:11pt;color:#0D1B4B;margin:2cm}h1{font-size:18pt;color:#0A1A5C;margin-bottom:6pt}h2{font-size:11pt;color:#1560F5;margin-top:16pt;border-bottom:0.5pt solid #DDE4FF;padding-bottom:3pt}table{width:100%;border-collapse:collapse;margin:10pt 0;font-size:10pt}th{background:#EEF3FF;color:#1245B8;font-weight:bold;padding:6pt 8pt;border:0.5pt solid #DDE4FF;text-align:left}td{padding:5pt 8pt;border:0.5pt solid #DDE4FF}p{margin-bottom:6pt}</style></head><body>'+
    '<h1>Memória de cálculo — BDI</h1><p style="font-size:9pt;color:#6B7BAA">Gerado em '+new Date().toLocaleString('pt-BR')+' · OrçaFascio</p>'+
    resultBloco+jstf+'</body></html>';
  var blob=new Blob([doc],{type:'application/msword;charset=utf-8'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');
  a.href=url; a.download='BDI-'+empresa.replace(/[^a-zA-Z0-9]/g,'-')+'.doc';
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  showToast('✓ Arquivo Word baixado!');
}

// ─── SAVE / IMPORT ────────────────────────────────────────────────────────────
function coletarState(){
  var fields=['empresa','objeto','responsavel','data-ref','regime-tributario','regime-execucao','modalidade',
    't-iss','t-pis','t-cofins','t-csll','t-irpj','t-outros',
    'ac','ac-ref','s-seguros','s-garantias','s-outros','r-riscos','risco-perfil','df','lb','lb-perfil'];
  var state={currentPage:currentPage,maxStepReached:maxStepReached,justifHTML:justifHTML};
  fields.forEach(function(id){ var el=document.getElementById(id); if(el) state[id]=el.value; });
  state['tipo-obra']=getTipoObra();
  state.bdiResultHTML=document.getElementById('bdi-resultado-bloco').innerHTML;
  return state;
}

function importarHTML(input){
  var file=input.files[0]; if(!file) return;
  var reader=new FileReader();
  reader.onload=function(e){
    try{
      var html=e.target.result;
      var match=html.match(/var __IMPORTED_STATE__=([\s\S]*?); \/\*__BDI_STATE__\*\//);
      if(!match){ showToast('Arquivo sem dados salvos.'); return; }
      restaurarState(JSON.parse(match[1]));
    } catch(err){ showToast('Erro ao importar: '+err.message); }
  };
  reader.readAsText(file);
  input.value='';
}

function restaurarState(state){
  var fields=['empresa','objeto','responsavel','data-ref','regime-tributario','regime-execucao','modalidade',
    't-iss','t-pis','t-cofins','t-csll','t-irpj','t-outros',
    'ac','ac-ref','s-seguros','s-garantias','s-outros','r-riscos','risco-perfil','df','lb','lb-perfil'];
  fields.forEach(function(id){ var el=document.getElementById(id); if(el&&state[id]!==undefined) el.value=state[id]; });
  if(state['tipo-obra']){
    document.querySelectorAll('input[name="tipo-obra"]').forEach(function(r){
      if(r.value===state['tipo-obra']){
        r.checked=true;
        document.querySelectorAll('.radio-tab').forEach(function(t){t.classList.remove('selected');});
        var tab=r.closest('.radio-tab'); if(tab) tab.classList.add('selected');
        var h=document.getElementById('tipo-hint'); if(h) h.textContent=TIPO_HINTS[state['tipo-obra']]||'';
      }
    });
  }
  maxStepReached=state.maxStepReached||1;
  if(state.bdiResultHTML) document.getElementById('bdi-resultado-bloco').innerHTML=state.bdiResultHTML;
  if(state.justifHTML){
    justifHTML=state.justifHTML;
    var ed=document.getElementById('justif-editor');
    if(ed) ed.innerHTML=state.justifHTML;
  }
  calcBDI();
  goPage(Math.min(state.currentPage||1,5));
  showToast('✓ BDI importado com sucesso!');
}

function novoCalculo(){
  if(!confirm('Isso irá limpar todos os campos. Deseja continuar?')) return;
  maxStepReached=1; justifHTML='';
  document.getElementById('bdi-resultado-bloco').innerHTML='';
  limparEditor();
  goPage(1);
  showToast('Novo cálculo iniciado.');
}

// ─── TOAST ───────────────────────────────────────────────────────────────────
function showToast(msg){
  var t=document.getElementById('toast');
  t.textContent=msg; t.classList.add('show');
  setTimeout(function(){ t.classList.remove('show'); },2800);
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded',function(){
  document.getElementById('data-ref').value=new Date().toISOString().split('T')[0];
  if(typeof __IMPORTED_STATE__!=='undefined'){
    restaurarState(__IMPORTED_STATE__);
  } else {
    goPage(1);
  }
});

