// ─── STATE ────────────────────────────────────────────────────────────────────
let currentPage = 1;
let maxStepReached = 1;
let promptGerado = '';
let selectedAI = null;

const AI_URLS = {
  gpt: 'https://chatgpt.com/',
  claude: 'https://claude.ai/new',
  gemini: 'https://gemini.google.com/app',
};

// ─── SCORES ───────────────────────────────────────────────────────────────────
const EIXOS = [
  { id: 'e1', label: 'Padronização de editais', questoes: ['e1q1','e1q2','e1q3','e1q4'] },
  { id: 'e2', label: 'Banco de composições', questoes: ['e2q1','e2q2','e2q3','e2q4'] },
  { id: 'e3', label: 'Fluxo de aprovação', questoes: ['e3q1','e3q2','e3q3','e3q4'] },
  { id: 'e4', label: 'Medição e fiscalização', questoes: ['e4q1','e4q2','e4q3','e4q4','e4q5'] },
];

function getVal(name) {
  const el = document.querySelector('input[name="'+name+'"]:checked');
  return el ? parseInt(el.value) : 0;
}

function calcScore(eixo) {
  const vals = eixo.questoes.map(q => getVal(q)).filter(v => v > 0);
  if (!vals.length) return null;
  return Math.round((vals.reduce((a,b) => a+b, 0) / vals.length) * 10) / 10;
}

function scoreGlobal() {
  const scores = EIXOS.map(e => calcScore(e)).filter(s => s !== null);
  if (!scores.length) return null;
  return Math.round((scores.reduce((a,b) => a+b, 0) / scores.length) * 10) / 10;
}

function nivelInfo(score) {
  if (score === null) return { label: '—', cls: '', cor: '#aaa', pct: 0 };
  if (score <= 2) return { label: 'Inicial', cls: 'nivel-inicial', cor: '#E53935', pct: (score/5)*100 };
  if (score <= 3) return { label: 'Básico', cls: 'nivel-basico', cor: '#E67E22', pct: (score/5)*100 };
  if (score <= 4) return { label: 'Intermediário', cls: 'nivel-intermediario', cor: '#D4A017', pct: (score/5)*100 };
  return { label: 'Avançado', cls: 'nivel-avancado', cor: '#1B8C5A', pct: (score/5)*100 };
}

function renderScorePanel() {
  const panel = document.getElementById('score-panel');
  if (!panel) return;
  let html = '';
  EIXOS.forEach(e => {
    const s = calcScore(e);
    const n = nivelInfo(s);
    html += '<div class="score-card">';
    html += '<div class="score-card-label">'+e.label+'</div>';
    html += '<div class="score-card-val" style="color:'+n.cor+'">'+(s !== null ? s.toFixed(1) : '—')+'<span style="font-size:14px;font-weight:500;color:var(--muted)">/5</span></div>';
    html += '<div class="score-bar"><div class="score-bar-fill" style="width:'+n.pct+'%;background:'+n.cor+'"></div></div>';
    html += '<div class="score-nivel '+n.cls+'">'+n.label+'</div>';
    html += '</div>';
  });
  // Score global
  const sg = scoreGlobal();
  const ng = nivelInfo(sg);
  html += '<div class="score-card" style="border-color:var(--blue-mid);background:var(--blue-pale);grid-column:1/-1">';
  html += '<div class="score-card-label">Score global de maturidade</div>';
  html += '<div class="score-card-val" style="color:'+ng.cor+';font-size:32px">'+(sg !== null ? sg.toFixed(1) : '—')+'<span style="font-size:16px;font-weight:500;color:var(--muted)">/5</span></div>';
  html += '<div class="score-bar" style="height:8px"><div class="score-bar-fill" style="width:'+ng.pct+'%;background:'+ng.cor+'"></div></div>';
  html += '<div class="score-nivel '+ng.cls+'" style="font-size:13px;font-weight:700">'+ng.label+'</div>';
  html += '</div>';
  panel.innerHTML = html;
}

// ─── NAVEGACAO ────────────────────────────────────────────────────────────────
function showToast(msg, dur) {
  dur = dur || 3000;
  var t = document.getElementById('toast');
  t.innerHTML = msg;
  t.classList.add('show');
  setTimeout(function() { t.classList.remove('show'); }, dur);
}

function setStep(n) {
  for (var i = 1; i <= 7; i++) {
    var el = document.getElementById('step-' + i);
    if (!el) continue;
    el.classList.remove('active','done');
    if (i < n) el.classList.add('done');
    else if (i === n) el.classList.add('active');
  }
}

function validatePage(n) {
  if (n === 1) {
    if (!document.getElementById('nome-orgao').value.trim()) {
      showToast('Informe o nome do órgão.');
      return false;
    }
    if (!document.getElementById('esfera').value) {
      showToast('Selecione a esfera administrativa.');
      return false;
    }
    var cargoVal = document.getElementById('cargo').value;
    if (!cargoVal) {
      showToast('Selecione o cargo / função.');
      return false;
    }
    if (cargoVal === 'Outro' && !document.getElementById('cargo-outro').value.trim()) {
      showToast('Informe o cargo no campo "Outro".');
      return false;
    }
  }
  if (n === 2) {
    var allAnswered = EIXOS[0].questoes.every(q => getVal(q) > 0);
    if (!allAnswered) {
      showToast('Responda todas as perguntas do Eixo 1.');
      return false;
    }
  }
  if (n === 3) {
    var allAnswered = EIXOS[1].questoes.every(q => getVal(q) > 0);
    if (!allAnswered) {
      showToast('Responda todas as perguntas do Eixo 2.');
      return false;
    }
  }
  if (n === 4) {
    var allAnswered = EIXOS[2].questoes.every(q => getVal(q) > 0);
    if (!allAnswered) {
      showToast('Responda todas as perguntas do Eixo 3.');
      return false;
    }
  }
  if (n === 5) {
    var allAnswered = EIXOS[3].questoes.every(q => getVal(q) > 0);
    if (!allAnswered) {
      showToast('Responda todas as perguntas do Eixo 4.');
      return false;
    }
  }
  return true;
}

function goPage(n) {
  if (n > currentPage && !validatePage(currentPage)) return;
  document.getElementById('page-' + currentPage).style.display = 'none';
  currentPage = n;
  document.getElementById('page-' + n).style.display = 'block';
  if (n > maxStepReached) maxStepReached = n;
  setStep(n);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function voltarForm() {
  document.getElementById('section-prompt').style.display = 'none';
  document.getElementById('section-result').style.display = 'none';
  document.getElementById('section-form').style.display = 'block';
  document.getElementById('steps-bar').style.display = 'flex';
  for (var i = 1; i <= 5; i++) {
    document.getElementById('page-' + i).style.display = i === currentPage ? 'block' : 'none';
  }
  setStep(currentPage);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function voltarPrompt() {
  document.getElementById('section-result').style.display = 'none';
  document.getElementById('section-prompt').style.display = 'block';
  setStep(6);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetForm() {
  if (!confirm('Isso vai limpar todas as respostas. Continuar?')) return;
  location.reload();
}

// ─── GERAR PROMPT ─────────────────────────────────────────────────────────────
function gerarPrompt() {
  if (!validatePage(5)) return;

  var orgao    = document.getElementById('nome-orgao').value.trim();
  var esfera   = document.getElementById('esfera').value;
  var cargoSel = document.getElementById('cargo').value;
  var cargo    = cargoSel === 'Outro'
    ? (document.getElementById('cargo-outro').value.trim() || 'Outro')
    : cargoSel;
  var volume   = document.getElementById('volume-contratos').value || 'não informado';
  var valor    = document.getElementById('valor-anual').value || 'não informado';
  var auditoria = document.getElementById('auditoria').value || 'não informado';
  var desafio  = document.getElementById('desafio').value.trim() || 'não informado';

  // Montar respostas por eixo
  var eixoTextos = [
    { nome: 'Eixo 1 — Padronização de editais', questoes: [
      { texto: 'Modelos padronizados de edital aprovados internamente', val: getVal('e1q1') },
      { texto: 'Planilha orçamentária com composições referenciadas em SINAPI/tabela oficial', val: getVal('e1q2') },
      { texto: 'Especificação clara de regime, critério de julgamento e habilitação', val: getVal('e1q3') },
      { texto: 'Revisão jurídica e técnica com registro formal antes da publicação', val: getVal('e1q4') },
    ]},
    { nome: 'Eixo 2 — Banco de composições e orçamento', questoes: [
      { texto: 'Banco interno de composições de custo unitário atualizado', val: getVal('e2q1') },
      { texto: 'Orçamentos com referência SINAPI/SICRO, desoneração declarada e BDI justificado', val: getVal('e2q2') },
      { texto: 'Uso de curva ABC para priorizar análise de preços', val: getVal('e2q3') },
      { texto: 'Itens novos cotados com mínimo 3 fornecedores e documentados', val: getVal('e2q4') },
    ]},
    { nome: 'Eixo 3 — Fluxo de aprovação e rastreabilidade', questoes: [
      { texto: 'Fluxo formal de aprovação de contratos e aditivos com alçadas definidas', val: getVal('e3q1') },
      { texto: 'Aditivos com justificativa técnica formal e revisão da planilha', val: getVal('e3q2') },
      { texto: 'Fiscais designados por portaria com capacitação comprovada', val: getVal('e3q3') },
      { texto: 'Sistema de gestão de contratos (ERP, plataforma gov. ou software específico)', val: getVal('e3q4') },
    ]},
    { nome: 'Eixo 4 — Medição e fiscalização de obras', questoes: [
      { texto: 'Medições in loco com registro fotográfico datado e boletim assinado', val: getVal('e4q1') },
      { texto: 'Diário de obra atualizado com registros diários', val: getVal('e4q2') },
      { texto: 'Confrontação com cronograma físico-financeiro e parecer formal em desvios', val: getVal('e4q3') },
      { texto: 'Recebimento formal de obra (provisório e definitivo) com vistoria documentada', val: getVal('e4q4') },
      { texto: 'Adoção ou plano para tecnologias de fiscalização (BIM, drones, diário digital)', val: getVal('e4q5') },
    ]},
  ];

  var respostasStr = '';
  eixoTextos.forEach(function(e) {
    respostasStr += e.nome + '\n';
    e.questoes.forEach(function(q) {
      respostasStr += '  - ' + q.texto + ': ' + q.val + '/5\n';
    });
    respostasStr += '\n';
  });

  var sg = scoreGlobal();
  var nivelGlobal = sg !== null ? nivelInfo(sg).label : 'não calculado';

  var prompt = 'Você é um especialista em gestão pública de obras, auditoria governamental e conformidade com a Lei 14.133/2021 (Nova Lei de Licitações). Analise o diagnóstico de maturidade abaixo e gere um relatório técnico completo em português.\n\n';
  prompt += '=== DADOS DO ÓRGÃO ===\n';
  prompt += 'Órgão: ' + orgao + '\n';
  prompt += 'Esfera: ' + esfera + '\n';
  prompt += 'Cargo do respondente: ' + cargo + '\n';
  prompt += 'Volume de contratos: ' + volume + '\n';
  prompt += 'Valor anual em obras: ' + valor + '\n';
  prompt += 'Histórico de auditoria: ' + auditoria + '\n';
  prompt += 'Principal desafio declarado: ' + desafio + '\n\n';
  prompt += '=== RESPOSTAS DO DIAGNÓSTICO (escala 1 a 5) ===\n';
  prompt += respostasStr;
  prompt += 'Score global estimado: ' + (sg !== null ? sg.toFixed(1) + '/5' : 'pendente') + ' — Nível: ' + nivelGlobal + '\n\n';
  prompt += '=== INSTRUÇÕES PARA O RELATÓRIO ===\n';
  prompt += 'Gere um relatório com as seguintes seções:\n\n';
  prompt += '1. SUMÁRIO EXECUTIVO (3-4 parágrafos resumindo o nível de maturidade, principais pontos críticos e urgência de ação)\n\n';
  prompt += '2. ANÁLISE POR EIXO (para cada um dos 4 eixos):\n';
  prompt += '   - Nível de maturidade atual (Inicial / Básico / Intermediário / Avançado)\n';
  prompt += '   - Pontos fortes identificados (se houver)\n';
  prompt += '   - Lacunas e riscos específicos (cite referências legais: art. da Lei 14.133, Acórdãos TCU, IN, etc.)\n';
  prompt += '   - 3 recomendações práticas e priorizadas (curto, médio e longo prazo)\n\n';
  prompt += '3. PLANO DE AÇÃO PRIORITÁRIO (tabela ou lista com: Ação | Eixo | Prazo | Responsável sugerido | Impacto esperado)\n';
  prompt += '   Priorize as ações de maior risco legal e de exposição ao TCU/CGU.\n\n';
  prompt += '4. ALERTAS DE CONFORMIDADE (lista de itens com alto risco de questionamento em auditoria com base nas respostas com nota 1 ou 2)\n\n';
  prompt += '5. OPORTUNIDADE DE EVOLUÇÃO (como a adoção de tecnologia e boas práticas pode acelerar a maturidade)\n\n';
  prompt += 'Use linguagem técnica acessível. Seja direto, prático e objetivo. Evite generalidades: use as respostas concretas do diagnóstico.';

  promptGerado = prompt;
  document.getElementById('prompt-box').textContent = prompt;

  // Mostrar secao prompt
  document.getElementById('section-form').style.display = 'none';
  document.getElementById('section-prompt').style.display = 'block';
  document.getElementById('steps-bar').style.display = 'flex';
  maxStepReached = 6;
  setStep(6);

  renderScorePanel();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─── AI SELECTOR ──────────────────────────────────────────────────────────────
function selAI(id, btn) {
  selectedAI = id;
  document.querySelectorAll('.ai-sel-btn').forEach(function(b) { b.classList.remove('selected'); });
  btn.classList.add('selected');
  var hint = document.getElementById('ai-sel-hint');
  var nomes = { gpt: 'ChatGPT', claude: 'Claude', gemini: 'Gemini' };
  if (hint) {
    hint.textContent = 'Pronto! Vai abrir ' + (nomes[id] || id) + ' em nova aba';
    hint.style.color = 'var(--green)';
  }
}

function copiarAbrirIA() {
  if (!promptGerado) { showToast('Monte o prompt primeiro.'); return; }
  if (!selectedAI) { showToast('Selecione uma IA antes de continuar.'); return; }

  function abrirIA() {
    window.open(AI_URLS[selectedAI], '_blank');
    showToast('Prompt copiado! Cole com Ctrl+V na IA.', 4000);
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(promptGerado).then(abrirIA).catch(function() {
      var ta = document.createElement('textarea');
      ta.value = promptGerado;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      abrirIA();
    });
  } else {
    var ta = document.createElement('textarea');
    ta.value = promptGerado;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    abrirIA();
  }
}

// ─── FORMATAR DIAGNOSTICO ─────────────────────────────────────────────────────
function formatarDiagnostico() {
  var texto = document.getElementById('diag-paste').value.trim();
  if (!texto) { showToast('Cole o resultado da IA antes de formatar.'); return; }

  var orgao = document.getElementById('nome-orgao').value.trim();
  var esfera = document.getElementById('esfera').value;
  var cargo = document.getElementById('cargo').value;
  var sg = scoreGlobal();
  var ni = sg !== null ? nivelInfo(sg) : { label: '—', cor: '#aaa' };

  // Cabecalho do relatorio
  var dataHoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  // Montar scores em HTML
  var scoresHtml = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:16px 0">';
  EIXOS.forEach(function(e) {
    var s = calcScore(e);
    var n = nivelInfo(s);
    scoresHtml += '<div style="border:1.5px solid #DDE4FF;border-radius:8px;padding:12px 14px;background:#fff">';
    scoresHtml += '<div style="font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:#6B7BAA;margin-bottom:5px">'+e.label+'</div>';
    scoresHtml += '<div style="font-size:22px;font-weight:800;color:'+n.cor+'">'+(s !== null ? s.toFixed(1) : '—')+'<span style="font-size:12px;color:#9CAAD4">/5</span></div>';
    scoresHtml += '<div style="height:5px;border-radius:3px;background:#DDE4FF;margin-top:6px"><div style="height:100%;border-radius:3px;background:'+n.cor+';width:'+n.pct+'%"></div></div>';
    scoresHtml += '<div style="font-size:11px;font-weight:600;color:'+n.cor+';margin-top:4px">'+n.label+'</div>';
    scoresHtml += '</div>';
  });
  // Score global
  scoresHtml += '<div style="border:1.5px solid #1560F5;border-radius:8px;padding:12px 14px;background:#F5F8FF;grid-column:1/-1">';
  scoresHtml += '<div style="font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:#6B7BAA;margin-bottom:5px">Score global de maturidade</div>';
  scoresHtml += '<div style="font-size:28px;font-weight:800;color:'+ni.cor+'">'+(sg !== null ? sg.toFixed(1) : '—')+'<span style="font-size:13px;color:#9CAAD4">/5 &mdash; '+ni.label+'</span></div>';
  scoresHtml += '<div style="height:7px;border-radius:4px;background:#DDE4FF;margin-top:8px"><div style="height:100%;border-radius:4px;background:'+ni.cor+';width:'+(sg!==null?(sg/5*100).toFixed(0):0)+'%"></div></div>';
  scoresHtml += '</div>';
  scoresHtml += '</div>';

  // Converter markdown simples em HTML
  var linhas = texto.split('\n');
  var htmlLinhas = [];
  linhas.forEach(function(linha) {
    var l = linha.trim();
    if (!l) { htmlLinhas.push('<br>'); return; }
    // Headings
    if (l.startsWith('### ')) { htmlLinhas.push('<h3>'+l.slice(4)+'</h3>'); return; }
    if (l.startsWith('## ')) { htmlLinhas.push('<h2>'+l.slice(3)+'</h2>'); return; }
    if (l.startsWith('# ')) { htmlLinhas.push('<h2>'+l.slice(2)+'</h2>'); return; }
    // Listas
    if (l.startsWith('- ') || l.startsWith('* ')) {
      htmlLinhas.push('<li>'+l.slice(2).replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')+'</li>');
      return;
    }
    if (/^\d+\.\s/.test(l)) {
      htmlLinhas.push('<li>'+l.replace(/^\d+\.\s/,'').replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')+'</li>');
      return;
    }
    // Bold inline
    l = l.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>');
    htmlLinhas.push('<p>'+l+'</p>');
  });

  var conteudo = htmlLinhas.join('\n');

  var htmlFinal = '<h1 style="font-size:20px;font-weight:800;color:#0A1A5C;margin-bottom:4px">Diagn&oacute;stico de maturidade or&ccedil;ament&aacute;ria para &oacute;rg&atilde;os p&uacute;blicos</h1>';
  htmlFinal += '<p style="font-size:12px;color:#6B7BAA;margin-bottom:2px"><strong>'+orgao+'</strong> &mdash; '+esfera+'</p>';
  htmlFinal += '<p style="font-size:12px;color:#6B7BAA;margin-bottom:2px">Respondido por: '+cargo+' &bull; '+dataHoje+'</p>';
  htmlFinal += '<hr style="border:none;border-top:2px solid #DDE4FF;margin:14px 0">';
  htmlFinal += '<h2 style="font-size:14px;font-weight:700;color:#0A1A5C;margin-bottom:10px;border-bottom:2px solid #DDE4FF;padding-bottom:5px">Painel de maturidade</h2>';
  htmlFinal += scoresHtml;
  htmlFinal += '<hr style="border:none;border-top:2px solid #DDE4FF;margin:18px 0">';
  htmlFinal += conteudo;

  document.getElementById('doc-content').innerHTML = htmlFinal;
  document.getElementById('result-sub').textContent = orgao + ' — ' + dataHoje;

  document.getElementById('section-prompt').style.display = 'none';
  document.getElementById('section-result').style.display = 'block';
  maxStepReached = 7;
  setStep(7);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─── EDITOR ───────────────────────────────────────────────────────────────────
function fmt(cmd) { document.execCommand(cmd, false, null); }
function fmtBlock(tag) { document.execCommand('formatBlock', false, tag); }

// ─── SALVAR HTML ──────────────────────────────────────────────────────────────
function salvarHTML() {
  var doc = document.getElementById('doc-content').innerHTML;
  var orgao = document.getElementById('nome-orgao').value.trim() || 'orgao';
  var slug = orgao.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g,'').slice(0,40);
  var html = '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">';
  html += '<title>Diagnostico de maturidade orcamentaria — '+orgao+'</title>';
  html += '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">';
  html += '<style>body{font-family:"Inter",sans-serif;max-width:860px;margin:40px auto;padding:20px 32px;color:#0D1B4B;line-height:1.7}';
  html += 'h1{font-size:22px;font-weight:800;margin-bottom:4px}h2{font-size:16px;font-weight:700;color:#0A1A5C;margin-top:28px;margin-bottom:10px;padding-bottom:5px;border-bottom:2px solid #DDE4FF}';
  html += 'h3{font-size:14px;font-weight:700;margin-top:16px}p{margin-bottom:10px}ul,ol{margin:8px 0 12px 20px}li{margin-bottom:5px}';
  html += 'hr{border:none;border-top:2px solid #DDE4FF;margin:18px 0}';
  html += '@media print{body{margin:20px;padding:0}}';
  html += '</style></head><body>';
  html += doc;
  html += '</body></html>';
  var blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'diagnostico-' + slug + '.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Relatorio salvo como HTML!');
}

// ─── CARGO OUTRO ──────────────────────────────────────────────────────────────
function toggleCargoOutro(val) {
  var el = document.getElementById('cargo-outro');
  if (val === 'Outro') {
    el.style.display = 'block';
    el.focus();
  } else {
    el.style.display = 'none';
    el.value = '';
  }
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  setStep(1);
});
