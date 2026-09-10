// ─── STATE ───────────────────────────────────────────────────────────────────
let currentPage = 1;
let maxStepReached = 1;
let promptGerado = '';
let selectedAI = null;

const elistData = {
  'objeto':[], 'documentos':[],
};

// ─── DADOS ───────────────────────────────────────────────────────────────────
const OBJETO_CHIPS = [
  ["Construção de edificação", "Construção"],
  ["Reforma / retrofit de edificação", "Reforma"],
  ["Ampliação de edificação existente", "Ampliação"],
  ["Pavimentação asfáltica", "Pavimentação"],
  ["Drenagem urbana", "Drenagem"],
  ["Saneamento (rede de água e esgoto)", "Saneamento"],
  ["Ponte / obra de arte especial", "Ponte / OAE"],
  ["Infraestrutura viária", "Infra viária"],
  ["Manutenção predial", "Manutenção predial"],
  ["Serviços de engenharia continuados", "Serviços continuados"],
];

const DOCUMENTOS_CHIPS = [
  ["Índices contábeis (liquidez e endividamento)", "Índices contábeis"],
  ["Capital social / patrimônio líquido mínimo", "Capital / PL mínimo"],
  ["Certidões de regularidade fiscal e trabalhista", "Certidões fiscais"],
  ["Quantitativos mínimos exigidos nos atestados", "Quantitativos atestados"],
  ["Prazo de execução exíguo", "Prazo exíguo"],
  ["Planilha com itens sem composição de custos", "Planilha sem composição"],
  ["Vedação à participação de consórcios", "Vedação a consórcio"],
  ["Exigências possivelmente restritivas à competitividade", "Exigências restritivas"],
];

const CARACTERISTICAS_LISTA = [
  "Exige visita técnica obrigatória",
  "Permite visita técnica facultativa / declaração",
  "Exige atestado(s) de capacidade técnica",
  "Exige CAT / acervo técnico (CREA ou CAU)",
  "Exige responsável técnico no quadro permanente",
  "Possui planilha orçamentária de referência (SINAPI / SICRO)",
  "Possui cronograma físico-financeiro",
  "Exige BDI detalhado / demonstrado",
  "Exige composição de preços unitários",
  "Exige garantia de proposta",
  "Exige garantia de execução contratual",
  "Reserva cota ou tratamento diferenciado ME/EPP",
  "Prevê matriz de alocação de riscos",
  "Exige seguro de obra ou de responsabilidade",
  "Permite subcontratação",
  "Prevê reajuste ou repactuação de preços",
  "Exige amostra, protótipo ou demonstração",
  "Possui critérios de sustentabilidade",
  "Prevê margem de preferência",
];

const FOCO_LISTA = [
  "Habilitação jurídica",
  "Regularidade fiscal, social e trabalhista",
  "Qualificação técnica (atestados e CAT)",
  "Qualificação econômico-financeira",
  "Análise da planilha orçamentária",
  "Conferência do BDI",
  "Exequibilidade dos preços (jogo de planilha)",
  "Matriz de riscos e cláusulas contratuais",
  "Prazos, impugnações e esclarecimentos",
  "Critérios de sustentabilidade",
  "Condições de pagamento e medição",
  "Garantias exigidas",
  "Recursos e fase recursal",
  "Tratamento diferenciado ME/EPP",
];

// ─── UTILS ───────────────────────────────────────────────────────────────────
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function showToast(msg, dur=3000){
  const t=document.getElementById('toast');
  t.innerHTML=msg; t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),dur);
}

// ─── MÁSCARAS ────────────────────────────────────────────────────────────────
function mascaraValor(el){
  let v = el.value.replace(/\D/g,'');
  if(!v){ el.value = ''; return; }
  const num = parseInt(v, 10);
  el.value = 'R$ ' + (num/100).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
}

// ─── SELECT "OUTRO" ──────────────────────────────────────────────────────────
function toggleOutro(campo){
  const sel = document.getElementById(campo).value;
  const wrap = document.getElementById(campo+'-outro-wrap');
  if(wrap) wrap.style.display = sel === '_outro' ? 'block' : 'none';
}
function getSelect(campo){
  const sel = document.getElementById(campo).value;
  if(sel === '_outro'){
    const o = document.getElementById(campo+'-outro');
    return o ? o.value.trim() : '';
  }
  return sel;
}

// ─── ELIST + CHIPS ───────────────────────────────────────────────────────────
function chipDefs(id){ return id === 'objeto' ? OBJETO_CHIPS : DOCUMENTOS_CHIPS; }
function ea(id){
  const inp=document.getElementById(id+'-input'),v=inp.value.trim();
  if(!v){showToast('Digite um valor antes de adicionar.');return;}
  if(elistData[id].includes(v)){showToast('Item já adicionado.');return;}
  elistData[id].push(v); inp.value=''; er(id); inp.focus();
}
function es(id,v){
  if(elistData[id].includes(v)){showToast('Item já adicionado.');return;}
  elistData[id].push(v); er(id);
}
function edel(id,i){elistData[id].splice(i,1);er(id);}
function er(id){
  document.getElementById(id+'-items').innerHTML=elistData[id].map((t,i)=>`
    <div class="elist-item">
      <span class="elist-text">${esc(t)}</span>
      <button class="elist-del" onclick="edel('${id}',${i})" title="Remover">&times;</button>
    </div>`).join('');
  renderChips(id);
}
function renderChips(id){
  const cont = document.getElementById(id+'-chips');
  if(!cont) return;
  cont.innerHTML = chipDefs(id)
    .filter(([full]) => !elistData[id].includes(full))
    .map(([full,label]) => `<span class="chip" onclick="es('${id}',${JSON.stringify(full).replace(/"/g,'&quot;')})">${esc(label)}</span>`)
    .join('');
}

// ─── CHECKBOXES ──────────────────────────────────────────────────────────────
function toggleChk(grid, i){
  const lbl=document.getElementById(grid+'-lbl-'+i);
  const chk=document.getElementById(grid+'-chk-'+i);
  chk.checked=!chk.checked; lbl.classList.toggle('checked',chk.checked);
}
function getChecked(grid){
  return [...document.querySelectorAll('#'+grid+'-grid input:checked')].map(c=>c.value);
}

// ─── NAVEGAÇÃO ───────────────────────────────────────────────────────────────
function setStep(n){
  if(n > maxStepReached) maxStepReached = n;
  for(let i=1;i<=5;i++){
    const s=document.getElementById('step-'+i);
    s.classList.remove('active','done');
    if(i<n) s.classList.add('done');
    else if(i===n) s.classList.add('active');
    s.style.cursor = i <= maxStepReached ? 'pointer' : 'default';
    s.style.opacity = i <= maxStepReached ? '1' : '0.5';
    s.onclick = i <= maxStepReached ? (()=>{ const step=i; return ()=>navigateToStep(step); })() : null;
  }
}
function navigateToStep(n){
  if(n > maxStepReached) return;
  if(n <= 3){
    document.getElementById('section-prompt').style.display='none';
    document.getElementById('section-result').style.display='none';
    document.getElementById('section-form').style.display='block';
    document.getElementById('steps-bar').style.display='flex';
    for(let i=1;i<=3;i++) document.getElementById('page-'+i).style.display = i===n ? 'block' : 'none';
    currentPage = n; setStep(n);
    window.scrollTo({top:0,behavior:'smooth'});
  } else if(n === 4){
    document.getElementById('section-form').style.display='none';
    document.getElementById('section-result').style.display='none';
    document.getElementById('section-prompt').style.display='block';
    document.getElementById('steps-bar').style.display='flex';
    setStep(4);
    window.scrollTo({top:0,behavior:'smooth'});
  } else if(n === 5){
    if(document.getElementById('doc-content').innerHTML.trim()==='') return;
    document.getElementById('section-form').style.display='none';
    document.getElementById('section-prompt').style.display='none';
    document.getElementById('section-result').style.display='block';
    document.getElementById('steps-bar').style.display='flex';
    setStep(5);
    window.scrollTo({top:0,behavior:'smooth'});
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
    if(!getSelect('modalidade')){showToast('Selecione a modalidade de licitação.');return false;}
    if(!elistData['objeto'].length){showToast('Adicione ao menos um objeto da licitação.');return false;}
  }
  if(n===3){
    if(!getChecked('foco').length){showToast('Selecione ao menos uma área de foco do checklist.');return false;}
  }
  return true;
}
function voltarForm(){
  document.getElementById('section-prompt').style.display='none';
  document.getElementById('section-form').style.display='block';
  document.getElementById('steps-bar').style.display='flex';
  document.getElementById('page-3').style.display='block';
  document.getElementById('page-1').style.display='none';
  document.getElementById('page-2').style.display='none';
  currentPage=3; setStep(3); window.scrollTo({top:0,behavior:'smooth'});
}
function voltarPrompt(){
  document.getElementById('section-result').style.display='none';
  document.getElementById('section-prompt').style.display='block';
  setStep(4); window.scrollTo({top:0,behavior:'smooth'});
}
function resetForm(){
  if(!confirm('Iniciar um novo checklist? Os dados preenchidos serão perdidos.')) return;
  location.reload();
}

// ─── COLETA ──────────────────────────────────────────────────────────────────
function collectData(){
  const dataInput=document.getElementById('data-analise').value;
  const dataFormatada=dataInput
    ? new Date(dataInput+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'})
    : new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'});
  const nivelMap={resumido:'Resumido',padrao:'Padrão',detalhado:'Detalhado'};
  return {
    modalidade:   getSelect('modalidade'),
    criterio:     getSelect('criterio'),
    regime:       getSelect('regime'),
    objeto:       elistData['objeto'].join('; '),
    orgao:        document.getElementById('orgao').value.trim(),
    numeroEdital: document.getElementById('numero-edital').value.trim(),
    valor:        document.getElementById('valor').value.trim(),
    municipio:    document.getElementById('municipio').value.trim(),
    dataAnalise:  dataFormatada,
    caracteristicas: getChecked('caracteristicas'),
    documentos:   [...elistData['documentos']],
    prazos:       document.getElementById('prazos').value.trim(),
    foco:         getChecked('foco'),
    nivel:        nivelMap[document.getElementById('nivel').value] || 'Padrão',
    perfil:       document.getElementById('perfil').value.trim(),
    obs:          document.getElementById('obs').value.trim(),
  };
}

// ─── GERAR PROMPT ────────────────────────────────────────────────────────────
function gerarPrompt(){
  if(!validatePage(3)) return;
  const d=collectData();

  const linhas = [];
  linhas.push('- Modalidade: ' + (d.modalidade||'não informada'));
  if(d.criterio) linhas.push('- Critério de julgamento: ' + d.criterio);
  if(d.regime)   linhas.push('- Regime de execução: ' + d.regime);
  linhas.push('- Objeto: ' + (d.objeto||'não informado'));
  if(d.orgao)        linhas.push('- Órgão/entidade: ' + d.orgao);
  if(d.numeroEdital) linhas.push('- Edital/processo nº: ' + d.numeroEdital);
  if(d.valor)        linhas.push('- Valor estimado: ' + d.valor);
  if(d.municipio)    linhas.push('- Município/UF: ' + d.municipio);

  let bloco = '';
  if(d.caracteristicas.length){
    bloco += '\n\nCARACTERÍSTICAS IDENTIFICADAS NO EDITAL:\n' + d.caracteristicas.map(c=>'• '+c).join('\n');
  }
  if(d.documentos.length){
    bloco += '\n\nPONTOS SENSÍVEIS A VERIFICAR:\n' + d.documentos.map(c=>'• '+c).join('\n');
  }
  if(d.prazos){
    bloco += '\n\nPRAZOS CRÍTICOS: ' + d.prazos;
  }

  const focoTxt = d.foco.map((f,i)=>'## ' + (i+1) + '. ' + f).join('\n');

  promptGerado =
`Você é um especialista em licitações de obras e serviços de engenharia no Brasil, com domínio da Lei nº 14.133/2021 e dos referenciais de orçamento público (SINAPI, SICRO) e de BDI (Acórdão 2.369/2011-TCU-Plenário).

Gere um CHECKLIST TÉCNICO DE ANÁLISE DE EDITAL, completo e personalizado, para a equipe verificar item a item antes de elaborar a proposta e participar do certame. O objetivo é evitar esquecimentos de itens críticos e erros na proposta.

DADOS DA LICITAÇÃO:
${linhas.join('\n')}${bloco}

NÍVEL DE DETALHAMENTO SOLICITADO: ${d.nivel}${d.perfil ? '\nPERFIL DA EQUIPE: ' + d.perfil : ''}${d.obs ? '\nOBSERVAÇÕES: ' + d.obs : ''}

---

INSTRUÇÕES DE FORMATAÇÃO (siga à risca):
1. Comece com uma seção "## Visão geral do edital" contendo uma tabela em Markdown com os dados da licitação (modalidade, critério, regime, objeto).
2. Para cada área abaixo, crie uma seção e liste os itens de verificação como checklist, usando "- [ ] " no início de cada item (com o colchete vazio).
3. Antes dos itens de cada seção, inclua UMA linha de orientação entre colchetes duplos [[assim]], explicando o que a equipe deve observar com mais atenção naquele bloco. Essas orientações aparecem destacadas e podem ser removidas depois.
4. Adapte os itens à modalidade, ao critério, ao regime e às características informadas. Cite os artigos pertinentes da Lei 14.133/2021 quando fizer sentido.
5. Encerre com "## Pontos de atenção e riscos", trazendo de 3 a 6 alertas específicos para esta licitação, cada um como uma orientação [[assim]].

SEÇÕES DO CHECKLIST (use exatamente estas áreas de foco):
${focoTxt}

Data da análise: ${d.dataAnalise}`;

  document.getElementById('section-form').style.display='none';
  document.getElementById('steps-bar').style.display='flex';
  document.getElementById('section-prompt').style.display='block';
  setStep(4);
  document.getElementById('prompt-box').textContent=promptGerado;
  window.scrollTo({top:0,behavior:'smooth'});
}

// ─── SELETOR DE IA + COPIAR E ABRIR ──────────────────────────────────────────
function selAI(id, btn){
  selectedAI = id;
  document.querySelectorAll('.ai-sel-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  const hint = document.getElementById('ai-sel-hint');
  const nomes = {gpt:'ChatGPT', claude:'Claude', gemini:'Gemini'};
  if(hint){ hint.textContent = 'Pronto! Vai abrir ' + (nomes[id]||id) + ' em nova aba'; hint.style.color = 'var(--green)'; }
}
function copiarAbrirIA(){
  if(!promptGerado){showToast('Monte o prompt primeiro.');return;}
  if(!selectedAI){showToast('Selecione uma IA antes de continuar.');return;}
  function abrirIA(){
    if(selectedAI === 'claude'){
      window.open('https://claude.ai/new','_blank');
      showToast('✓ Prompt copiado! Cole com Ctrl+V no Claude.');
    } else if(selectedAI === 'gpt'){
      window.open('https://chatgpt.com/?q=' + encodeURIComponent(promptGerado),'_blank');
      showToast('✓ Abrindo ChatGPT com o prompt…');
    } else if(selectedAI === 'gemini'){
      window.open('https://gemini.google.com/app?q=' + encodeURIComponent(promptGerado),'_blank');
      showToast('✓ Abrindo Gemini com o prompt…');
    }
  }
  navigator.clipboard.writeText(promptGerado).then(abrirIA).catch(()=>{
    const ta=document.createElement('textarea');
    ta.value=promptGerado; ta.style.position='fixed'; ta.style.top='-9999px';
    document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); document.body.removeChild(ta);
    abrirIA();
  });
}
function copyPrompt(){ copiarAbrirIA(); }

// ─── FORMATAR CHECKLIST ──────────────────────────────────────────────────────
function formatarChecklist(){
  const texto=document.getElementById('checklist-paste').value.trim();
  if(!texto){showToast('Cole o texto gerado pela IA antes de formatar.');return;}
  const d=collectData();

  // Cabeçalho do documento
  function metaLinha(label, valor){ return valor ? `<div class="doc-meta-item"><span class="doc-meta-label">${label}</span><span class="doc-meta-valor">${esc(valor)}</span></div>` : ''; }
  const cabecalho =
    `<div class="doc-head">
      <div class="doc-head-badge">Checklist técnico de edital</div>
      <h1 class="doc-titulo">${esc(d.objeto || 'Análise de edital de licitação')}</h1>
      <div class="doc-meta">
        ${metaLinha('Órgão/entidade', d.orgao)}
        ${metaLinha('Edital/processo', d.numeroEdital)}
        ${metaLinha('Modalidade', d.modalidade)}
        ${metaLinha('Critério', d.criterio)}
        ${metaLinha('Regime', d.regime)}
        ${metaLinha('Município/UF', d.municipio)}
        ${metaLinha('Data da análise', d.dataAnalise)}
      </div>
    </div>`;

  const docEl=document.getElementById('doc-content');
  docEl.innerHTML = cabecalho + md2html(texto);

  document.getElementById('result-sub').textContent = 'Gerado em ' + d.dataAnalise + (d.modalidade ? ' · ' + d.modalidade : '');
  document.getElementById('section-prompt').style.display='none';
  document.getElementById('section-result').style.display='block';
  setStep(5);
  window.scrollTo({top:0,behavior:'smooth'});
}

// ─── TITLE CASE ──────────────────────────────────────────────────────────────
const TC_MINUSC = new Set([
  'a','à','ao','aos','às','com','contra','da','das','de','do','dos','e','em',
  'entre','na','nas','no','nos','o','os','ou','para','pela','pelas','pelo',
  'pelos','per','por','sem','sob','sobre','um','uma','uns','umas','que','se',
  'até','após','ante','desde','durante','mediante','perante','segundo','via'
]);
const TC_SIGLAS = new Set([
  'abnt','art','arts','bdi','bim','cat','crea','cau','sinapi','sicro','tcu',
  'cnpj','cpf','cnd','me','epp','rrt','spda','iss','icms','inss','fgts','rt',
  'nbr','iso','cdc','oae','uf','ar','art','sa','ltda','mei','eireli'
]);
function titleCase(str){
  const numMatch = str.match(/^(\d+\.?\s*)/);
  const prefix = numMatch ? numMatch[1] : '';
  const rest = numMatch ? str.slice(prefix.length) : str;
  const words = rest.toLowerCase().split(/\s+/);
  const result = words.map((w, i) => {
    if(!w) return w;
    const clean = w.replace(/[^a-záéíóúâêôàãõçü]/gi,'');
    if(TC_SIGLAS.has(clean)) return w.toUpperCase();
    if(/^[ivxlcdm]+$/.test(clean) && clean.length <= 6 && i > 0) return w.toUpperCase();
    if(i > 0 && TC_MINUSC.has(clean)) return w;
    return w.charAt(0).toUpperCase() + w.slice(1);
  });
  return prefix + result.join(' ');
}

// ─── MARKDOWN → HTML ─────────────────────────────────────────────────────────
function md2html(md){
  // Orientações [[...]]
  md=md.replace(/\[\[([^\]]+)\]\]/g,(m,txt)=>`\nORIENTACAO:${txt.trim()}\n`);
  // Separadores
  md=md.replace(/^[-*_]{3,}\s*$/gm,'');
  // Remover linha "Data da análise" do corpo (fica no cabeçalho)
  md=md.replace(/^[#*\-\s]*[Dd]ata\s+da\s+[Aa]n[áa]lise[^\n]*$/gm,'');
  // Remover título genérico "CHECKLIST ..." de primeira linha
  md=md.replace(/^#{0,3}\s*CHECKLIST[^\n]*$/im,'');
  // Referências de rodapé tipo [1]: http...
  md=md.replace(/^\[\d+\]:.*$/gm,'');
  md=md.replace(/\[\d+\](?!:)/g,'');
  // Linhas em branco excessivas
  md=md.replace(/\n{3,}/g,'\n\n');

  let lines=md.split('\n');
  let out=[],inList=false,listType='';
  function closeList(){
    if(inList){
      out.push(listType==='cl' ? '</ul>' : (listType==='ul'?'</ul>':'</ol>'));
      inList=false; listType='';
    }
  }
  for(let raw of lines){
    let line=raw;
    // Orientações
    if(line.startsWith('ORIENTACAO:')){
      closeList();
      const txt=line.slice(11).trim();
      out.push(`<div class="orientacao">${inlineFormat(txt)}<button class="rm-btn" onclick="this.parentElement.remove()" title="Remover esta orientação">&times;</button></div>`);
      continue;
    }
    // Headings
    if(/^#{4,} (.+)$/.test(line)){closeList();out.push(`<h3>${inlineFormat(line.replace(/^#+\s*/,''))}</h3>`);continue;}
    if(/^### (.+)$/.test(line)){closeList();out.push(`<h3>${inlineFormat(line.slice(4))}</h3>`);continue;}
    if(/^## (.+)$/.test(line)){closeList();out.push(`<h2>${inlineFormat(titleCase(line.slice(3)))}</h2>`);continue;}
    if(/^# (.+)$/.test(line)){closeList();out.push(`<h2>${inlineFormat(titleCase(line.slice(2)))}</h2>`);continue;}
    // Checklist item: - [ ] / - [x]
    let mchk = line.match(/^\s*[-*]\s*\[\s*([xX ]?)\s*\]\s*(.+)$/);
    if(mchk){
      const done = mchk[1].toLowerCase()==='x';
      const txt = mchk[2];
      if(!inList||listType!=='cl'){closeList();out.push('<ul class="checklist">');inList=true;listType='cl';}
      out.push(`<li class="cl-item${done?' done':''}"><span class="cl-box"></span><span class="cl-text">${inlineFormat(txt)}</span></li>`);
      continue;
    }
    // Bullets
    if(/^\s*[-•*] (.+)$/.test(line)){
      const txt=line.replace(/^\s*[-•*]\s*/,'');
      if(!inList||listType!=='ul'){closeList();out.push('<ul>');inList=true;listType='ul';}
      out.push(`<li>${inlineFormat(txt)}</li>`); continue;
    }
    // Numbered list
    if(/^\d+\.\s+(.+)$/.test(line)){
      const txt=line.replace(/^\d+\.\s+/,'');
      if(!inList||listType!=='ol'){closeList();out.push('<ol>');inList=true;listType='ol';}
      out.push(`<li>${inlineFormat(txt)}</li>`); continue;
    }
    // Table rows (wrapping em <table> é feito no pós-processamento)
    if(/^\|.+\|$/.test(line)){
      closeList();
      if(line.match(/^\|[\s\-:|]+\|$/)) continue; // linha separadora
      const cells=line.split('|').slice(1,-1).map(c=>c.trim());
      const idx=lines.indexOf(raw);
      const isHeader=idx>=0 && /^\|[\s\-:|]+\|$/.test(lines[idx+1]||'');
      const tag = isHeader ? 'th' : 'td';
      out.push('<tr>'+cells.map(c=>`<${tag}>${inlineFormat(c)}</${tag}>`).join('')+'</tr>');
      continue;
    }
    if(!line.trim()){closeList();out.push('');continue;}
    closeList();
    out.push(`<p>${inlineFormat(line)}</p>`);
  }
  closeList();
  let html=out.join('\n');
  html=html.replace(/(<tr>[\s\S]*?<\/tr>\n*)+/g,m=>{
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

// ─── ORIENTAÇÕES + EDITOR ────────────────────────────────────────────────────
function removerTodasOrientacoes(){
  document.querySelectorAll('#doc-content .orientacao').forEach(el=>el.remove());
  showToast('✓ Todas as orientações foram removidas.');
}
function fmt(cmd){ document.execCommand(cmd,false,null); document.getElementById('doc-content').focus(); }
function fmtBlock(tag){ document.execCommand('formatBlock',false,tag); document.getElementById('doc-content').focus(); }

// ─── DOWNLOAD ────────────────────────────────────────────────────────────────
function nomeArquivo(){
  const d=collectData();
  const base = (d.numeroEdital || d.orgao || d.objeto || 'edital')
    .replace(/[^a-zA-Z0-9çãõáéíóúâêôàü ]/gi,'').trim().replace(/\s+/g,'-').toLowerCase().slice(0,40);
  return base || 'edital';
}

// ─── SALVAR / IMPORTAR (.html com estado embutido) ──────────────────────────
function salvarHTML(){
  const state = {
    version: '1',
    savedAt: new Date().toISOString(),
    elistData: JSON.parse(JSON.stringify(elistData)),
    selects: {
      modalidade: document.getElementById('modalidade').value,
      'modalidade-outro': document.getElementById('modalidade-outro').value,
      criterio: document.getElementById('criterio').value,
      'criterio-outro': document.getElementById('criterio-outro').value,
      regime: document.getElementById('regime').value,
      'regime-outro': document.getElementById('regime-outro').value,
      nivel: document.getElementById('nivel').value,
    },
    fields: {
      orgao: document.getElementById('orgao').value,
      'numero-edital': document.getElementById('numero-edital').value,
      valor: document.getElementById('valor').value,
      municipio: document.getElementById('municipio').value,
      'data-analise': document.getElementById('data-analise').value,
      prazos: document.getElementById('prazos').value,
      perfil: document.getElementById('perfil').value,
      obs: document.getElementById('obs').value,
    },
    caracteristicas: getChecked('caracteristicas'),
    foco: getChecked('foco'),
    promptGerado,
    docHTML: document.getElementById('doc-content').innerHTML,
    currentSection: document.getElementById('section-result').style.display==='block' ? 'result'
                  : document.getElementById('section-prompt').style.display==='block' ? 'prompt'
                  : 'form',
    currentPage,
  };
  const pageHTML = document.documentElement.outerHTML;
  const stateTag = `\n<script id="of-saved-state" type="application/json">${JSON.stringify(state)}<\/script>`;
  const finalHTML = '<!DOCTYPE html>\n' + pageHTML.replace(/<\/body>/, stateTag + '\n</body>');
  const blob = new Blob([finalHTML], {type:'text/html;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url;
  a.download = `of-checklist-${nomeArquivo()}-${new Date().toISOString().slice(0,10)}.html`;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
  showToast('✓ Checklist salvo em HTML! Importe-o quando quiser continuar.');
}

function importarHTML(input){
  const file = input.files[0]; if(!file) return;
  if(!file.name.endsWith('.html')){showToast('Importe um arquivo .html gerado por esta ferramenta.');return;}
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const html = e.target.result;
      const match = html.match(/<script[^>]*id="of-saved-state"[^>]*>([\s\S]*?)<\/script>/);
      if(!match) throw new Error('Arquivo inválido ou não gerado por esta ferramenta.');
      const state = JSON.parse(match[1]);
      if(!state.version) throw new Error('Arquivo inválido.');

      Object.assign(elistData, state.elistData||{});
      Object.keys(elistData).forEach(id=>er(id));

      const sel = state.selects||{};
      Object.keys(sel).forEach(id=>{ const el=document.getElementById(id); if(el) el.value=sel[id]||''; });
      ['modalidade','criterio','regime'].forEach(c=>toggleOutro(c));

      const f = state.fields||{};
      Object.keys(f).forEach(id=>{ const el=document.getElementById(id); if(el) el.value=f[id]||''; });

      (state.caracteristicas||[]).forEach(val=>{
        document.querySelectorAll('#caracteristicas-grid input').forEach(chk=>{
          if(chk.value===val){ chk.checked=true; chk.closest('label').classList.add('checked'); }
        });
      });
      (state.foco||[]).forEach(val=>{
        document.querySelectorAll('#foco-grid input').forEach(chk=>{
          if(chk.value===val){ chk.checked=true; chk.closest('label').classList.add('checked'); }
        });
      });

      promptGerado = state.promptGerado||'';
      if(promptGerado) document.getElementById('prompt-box').textContent=promptGerado;

      const sec = state.currentSection||'form';
      if(sec==='result'&&state.docHTML){
        document.getElementById('section-form').style.display='none';
        document.getElementById('section-prompt').style.display='none';
        document.getElementById('section-result').style.display='block';
        document.getElementById('doc-content').innerHTML=state.docHTML;
        document.getElementById('steps-bar').style.display='flex';
        setStep(5);
      } else if(sec==='prompt'){
        document.getElementById('section-form').style.display='none';
        document.getElementById('section-result').style.display='none';
        document.getElementById('section-prompt').style.display='block';
        document.getElementById('steps-bar').style.display='flex';
        setStep(4);
      } else {
        const pg = Math.min(state.currentPage||1, 3);
        for(let i=1;i<=3;i++) document.getElementById('page-'+i).style.display=i===pg?'block':'none';
        currentPage=pg; setStep(pg);
      }
      showToast('✓ Checklist importado com sucesso!');
    } catch(err) {
      showToast('Erro ao importar: ' + err.message);
    }
  };
  reader.readAsText(file);
  input.value='';
}

// ─── INIT ────────────────────────────────────────────────────────────────────
function renderGrid(grid, lista){
  document.getElementById(grid+'-grid').innerHTML=lista.map((s,i)=>`
    <label class="check-item" id="${grid}-lbl-${i}" onclick="toggleChk('${grid}',${i})">
      <input type="checkbox" id="${grid}-chk-${i}" value="${esc(s)}">
      <div class="check-box"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><polyline points="20 6 9 17 4 12"/></svg></div>
      <span class="check-label">${esc(s)}</span>
    </label>`).join('');
}
document.addEventListener('DOMContentLoaded',function(){
  renderGrid('caracteristicas', CARACTERISTICAS_LISTA);
  renderGrid('foco', FOCO_LISTA);
  renderChips('objeto');
  renderChips('documentos');
  ['objeto','documentos'].forEach(id=>{
    const inp=document.getElementById(id+'-input');
    if(inp) inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();ea(id);}});
  });
  // Data padrão = hoje
  const di=document.getElementById('data-analise');
  if(di && !di.value){ di.value = new Date().toISOString().slice(0,10); }
});

