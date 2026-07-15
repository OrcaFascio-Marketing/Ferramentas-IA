/* ===== QUESTIONS ===== */
var DIMENSIONS = [
  {key:'modelagem', name:'Modelagem BIM', icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 20h20"/><rect x="4" y="8" width="4" height="12" rx="1"/><rect x="10" y="4" width="4" height="16" rx="1"/><rect x="16" y="10" width="4" height="10" rx="1"/></svg>'},
  {key:'quantitativos', name:'Extração de quantitativos', icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3h18v18H3z"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>'},
  {key:'orcamento', name:'Integração com orçamento', icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M8 10h8M8 14h8"/></svg>'},
  {key:'processos', name:'Processos e colaboração', icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>'}
];

var QUESTIONS = [
  {dim:'modelagem', text:'Qual o nível atual de adoção de BIM na sua empresa?', hint:'Considere os projetos em andamento.', options:[
    {label:'Não usamos BIM', desc:'Trabalhamos com CAD 2D ou ferramentas tradicionais.', score:1},
    {label:'BIM em fase piloto', desc:'Estamos testando em 1 ou 2 projetos.', score:2},
    {label:'BIM parcial', desc:'Alguns projetos e disciplinas usam BIM, outros não.', score:3},
    {label:'BIM na maioria dos projetos', desc:'A maior parte dos projetos já nasce em BIM.', score:4},
    {label:'BIM pleno e obrigatório', desc:'100% dos projetos em BIM, com padrões definidos.', score:5}
  ]},
  {dim:'modelagem', text:'Seus modelos BIM possuem informações de materiais e especificações técnicas?', hint:'Parâmetros como tipo de concreto, espessura de revestimento, marca, etc.', options:[
    {label:'Não — são modelos geométricos puros', desc:'Apenas a forma 3D, sem dados.', score:1},
    {label:'Dados mínimos', desc:'Alguns materiais genéricos atribuídos.', score:2},
    {label:'Dados parciais', desc:'Principais elementos têm informações, outros não.', score:3},
    {label:'Dados padronizados', desc:'Templates com parâmetros definidos para cada família.', score:4},
    {label:'LOD 400+ com rastreabilidade', desc:'Informações completas, rastreáveis e auditáveis.', score:5}
  ]},
  {dim:'modelagem', text:'Existe um padrão (template) BIM definido na empresa?', options:[
    {label:'Não temos padrão', desc:'Cada profissional modela como preferir.', score:1},
    {label:'Diretrizes informais', desc:'Algumas orientações verbais ou em documento solto.', score:2},
    {label:'Template básico', desc:'Um template com famílias e views padrão.', score:3},
    {label:'BEP (BIM Execution Plan) estruturado', desc:'Documento formal com responsabilidades e entregas.', score:4},
    {label:'BEP + auditoria periódica', desc:'Padrão documentado, revisado e auditado a cada projeto.', score:5}
  ]},
  {dim:'modelagem', text:'Qual o nível de LOD (Level of Development) predominante nos seus modelos?', hint:'LOD define o grau de detalhe geométrico e informacional do modelo.', options:[
    {label:'Não controlamos LOD', desc:'Não temos essa definição.', score:1},
    {label:'LOD 100–200', desc:'Modelo conceitual ou esquemático.', score:2},
    {label:'LOD 300', desc:'Modelo para documentação e compatibilização.', score:3},
    {label:'LOD 350', desc:'Modelo com detalhamento suficiente para extração de quantitativos.', score:4},
    {label:'LOD 400–500', desc:'Modelo de fabricação/construção com dados completos.', score:5}
  ]},
  {dim:'modelagem', text:'A modelagem BIM inclui elementos de todas as disciplinas necessárias ao orçamento?', hint:'Arquitetura, estrutura, instalações, paisagismo, etc.', options:[
    {label:'Apenas arquitetura básica', desc:'Modelo só tem paredes, pisos e cobertura.', score:1},
    {label:'Arquitetura + estrutura', desc:'Duas disciplinas modeladas.', score:2},
    {label:'3 ou mais disciplinas', desc:'Modelo multidisciplinar, mas incompleto.', score:3},
    {label:'Todas as disciplinas relevantes', desc:'Modelo completo para orçamento.', score:4},
    {label:'Modelo federado e compatibilizado', desc:'Todas as disciplinas integradas com clash detection.', score:5}
  ]},
  {dim:'quantitativos', text:'Como são extraídos os quantitativos dos projetos hoje?', options:[
    {label:'Levantamento manual em planta 2D', desc:'Medição com escalímetro ou contagem visual.', score:1},
    {label:'Planilha alimentada manualmente', desc:'Os quantitativos são digitados em Excel/Sheets.', score:2},
    {label:'Tabelas nativas do BIM (schedules)', desc:'Usamos tabelas do Revit/ArchiCAD, mas sem automação.', score:3},
    {label:'Extração automatizada com plugin', desc:'Usamos ferramentas como OrçaBIM ou Navisworks.', score:4},
    {label:'Extração automatizada + validação cruzada', desc:'Quantitativos extraídos, cruzados e auditados no processo.', score:5}
  ]},
  {dim:'quantitativos', text:'Os quantitativos extraídos do BIM são confiáveis para uso direto no orçamento?', options:[
    {label:'Não extraímos do BIM', desc:'Tudo é manual.', score:1},
    {label:'Extraímos, mas não confiamos', desc:'Sempre refazemos a medição por fora.', score:2},
    {label:'Confiáveis para algumas disciplinas', desc:'Estrutura ok, mas acabamento ainda é manual.', score:3},
    {label:'Confiáveis na maioria', desc:'Usamos direto, com revisão pontual.', score:4},
    {label:'100% confiáveis e auditáveis', desc:'Processo validado, rastreável e com histórico.', score:5}
  ]},
  {dim:'quantitativos', text:'Com que frequência os quantitativos são atualizados quando o modelo muda?', options:[
    {label:'Nunca — são feitos uma vez só', desc:'Não há atualização após o primeiro levantamento.', score:1},
    {label:'Raramente — só em revisões grandes', desc:'Refazemos apenas quando muda muito.', score:2},
    {label:'Manualmente quando lembram', desc:'Depende de alguém refazer a extração.', score:3},
    {label:'Periodicamente com processo', desc:'Há um fluxo definido para re-extração.', score:4},
    {label:'Automaticamente vinculado ao modelo', desc:'Alteração no modelo atualiza quantitativos.', score:5}
  ]},
  {dim:'quantitativos', text:'As unidades de medida e nomenclaturas do BIM são compatíveis com o orçamento?', hint:'Exemplo: o modelo mede em m³, mas o orçamento usa m² ou unidade.', options:[
    {label:'Não verificamos isso', desc:'Nunca cruzamos.', score:1},
    {label:'Há divergências frequentes', desc:'Sempre precisamos converter manualmente.', score:2},
    {label:'Parcialmente compatíveis', desc:'Algumas disciplinas batem, outras não.', score:3},
    {label:'Compatíveis com ajustes mínimos', desc:'Template BIM já prevê as unidades do orçamento.', score:4},
    {label:'100% compatíveis — sem conversão', desc:'Padrão BIM e orçamentário são unificados.', score:5}
  ]},
  {dim:'quantitativos', text:'A empresa faz clash detection (detecção de interferências) antes de extrair quantitativos?', options:[
    {label:'Não fazemos clash detection', desc:'Nunca executamos esse processo.', score:1},
    {label:'Fazemos visualmente', desc:'Revisão visual no modelo 3D.', score:2},
    {label:'Clash detection eventual', desc:'Rodamos em projetos mais complexos.', score:3},
    {label:'Clash detection padrão', desc:'Faz parte do nosso fluxo antes de orçar.', score:4},
    {label:'Clash detection automatizado + resolução', desc:'Rotina com relatório, correção e re-extração.', score:5}
  ]},
  {dim:'orcamento', text:'Existe integração direta entre o modelo BIM e o software de orçamento?', options:[
    {label:'Nenhuma integração', desc:'Orçamento é feito totalmente à parte.', score:1},
    {label:'Exportação manual de tabelas', desc:'Exportamos Excel do BIM e importamos no orçamento.', score:2},
    {label:'Plugin de exportação', desc:'Usamos um plugin, mas sem vínculo bidirecional.', score:3},
    {label:'Integração nativa (ex: OrçaBIM)', desc:'O modelo alimenta o orçamento com vínculo direto.', score:4},
    {label:'Integração bidirecional e contínua', desc:'Modelo e orçamento sincronizados — alteração em um reflete no outro.', score:5}
  ]},
  {dim:'orcamento', text:'Os custos unitários do orçamento estão vinculados a elementos do modelo BIM?', options:[
    {label:'Não — orçamento sem vínculo com BIM', desc:'São processos separados.', score:1},
    {label:'Vínculo informal', desc:'O orçamentista consulta o modelo, mas sem link.', score:2},
    {label:'Vínculo parcial por planilha', desc:'Algumas composições referenciam elementos do modelo.', score:3},
    {label:'Composições SINAPI/próprias vinculadas', desc:'Cada elemento BIM tem composição de custo associada.', score:4},
    {label:'Curva ABC automática a partir do modelo', desc:'Orçamento, ABC e composições gerados do BIM.', score:5}
  ]},
  {dim:'orcamento', text:'Quando há alteração de projeto, o orçamento é atualizado automaticamente?', options:[
    {label:'Nunca — refazemos do zero', desc:'Cada revisão gera retrabalho total.', score:1},
    {label:'Manualmente, com muito esforço', desc:'Atualizamos célula por célula.', score:2},
    {label:'Parcialmente — algumas partes sim', desc:'Estrutura atualiza, acabamento não.', score:3},
    {label:'Atualização semi-automática', desc:'Re-extração com plugin + revisão rápida.', score:4},
    {label:'Atualização automática e rastreável', desc:'Alteração no modelo reflete no orçamento com log.', score:5}
  ]},
  {dim:'orcamento', text:'Sua empresa consegue comparar cenários de custo alterando o modelo BIM?', hint:'Ex: simular trocar tipo de revestimento e ver o impacto no custo total.', options:[
    {label:'Impossível hoje', desc:'Não temos essa capacidade.', score:1},
    {label:'Possível mas nunca fizemos', desc:'Em teoria sim, mas não temos processo.', score:2},
    {label:'Já fizemos pontualmente', desc:'Em um projeto piloto ou teste.', score:3},
    {label:'Fazemos em projetos estratégicos', desc:'Simulações de custo são parte do processo decisório.', score:4},
    {label:'Rotina consolidada de simulação', desc:'Cenários de custo são gerados a cada decisão de projeto.', score:5}
  ]},
  {dim:'orcamento', text:'A empresa utiliza referências de preços (SINAPI, SICRO, próprias) integradas ao BIM?', options:[
    {label:'Não usamos referências formais', desc:'Preços baseados em experiência.', score:1},
    {label:'SINAPI/SICRO em planilha separada', desc:'Consultamos, mas sem vínculo com BIM.', score:2},
    {label:'Base de composições no software de orçamento', desc:'Composições no sistema, mas sem link com modelo.', score:3},
    {label:'Composições vinculadas a famílias BIM', desc:'Cada família tem composição associada.', score:4},
    {label:'Base unificada BIM + orçamento + planejamento', desc:'SINAPI/próprias linkadas ao modelo com atualização periódica.', score:5}
  ]},
  {dim:'processos', text:'Existe um fluxo definido de entrega entre equipe de BIM e equipe de orçamento?', options:[
    {label:'Não há comunicação formal', desc:'Cada equipe trabalha isoladamente.', score:1},
    {label:'Comunicação informal', desc:'Trocam e-mails ou conversam quando precisa.', score:2},
    {label:'Fluxo definido mas não seguido', desc:'Há um processo, mas não é respeitado.', score:3},
    {label:'Fluxo ativo e funcional', desc:'Entregas com checklist e prazos definidos.', score:4},
    {label:'Fluxo automatizado com CDE', desc:'Entregas via ambiente comum de dados, com status e aprovação.', score:5}
  ]},
  {dim:'processos', text:'A empresa investe em treinamento BIM voltado a orçamento e custos?', options:[
    {label:'Nenhum treinamento', desc:'Cada um aprende sozinho.', score:1},
    {label:'Treinamento básico de software', desc:'Revit/ArchiCAD para modelar, mas sem foco em custos.', score:2},
    {label:'Treinamento eventual', desc:'Cursos pontuais quando surge demanda.', score:3},
    {label:'Programa de capacitação', desc:'Treinamentos recorrentes com foco em BIM + orçamento.', score:4},
    {label:'Cultura BIM 5D consolidada', desc:'Equipe capacitada, processo documentado e melhoria contínua.', score:5}
  ]},
  {dim:'processos', text:'A empresa utiliza um CDE (Common Data Environment) para gerenciar arquivos BIM?', hint:'CDE: ambiente centralizado de armazenamento, versionamento e colaboração de modelos.', options:[
    {label:'Não — arquivos em pastas locais', desc:'Cada um salva onde quer.', score:1},
    {label:'Pastas em nuvem (Drive/Dropbox)', desc:'Alguma organização, mas sem controle de versão.', score:2},
    {label:'Servidor com estrutura de pastas', desc:'Organizado, mas sem workflow de aprovação.', score:3},
    {label:'CDE básico com versionamento', desc:'Plataforma dedicada com controle de versão.', score:4},
    {label:'CDE completo com workflow integrado', desc:'Versionamento, aprovação, rastreabilidade e integração com BIM.', score:5}
  ]},
  {dim:'processos', text:'Como a diretoria enxerga o BIM na empresa?', options:[
    {label:'Custo desnecessário', desc:'Resistência — "CAD resolve".', score:1},
    {label:'Ferramenta de visualização', desc:'Serve para apresentar ao cliente, só.', score:2},
    {label:'Requisito de mercado', desc:'Usam porque os clientes ou editais exigem.', score:3},
    {label:'Estratégico para produtividade', desc:'A diretoria apoia e investe.', score:4},
    {label:'Pilar de transformação digital', desc:'BIM 5D é parte do planejamento estratégico.', score:5}
  ]},
  {dim:'processos', text:'A empresa já vinculou o modelo BIM ao cronograma da obra (4D) ou ao orçamento (5D)?', options:[
    {label:'Nunca — BIM é apenas 3D', desc:'Usamos só para visualização e documentação.', score:1},
    {label:'Já ouvimos falar mas não aplicamos', desc:'Sabemos que existe mas não implementamos.', score:2},
    {label:'Fizemos um piloto de 4D ou 5D', desc:'Teste pontual em um projeto.', score:3},
    {label:'4D ou 5D em projetos selecionados', desc:'Alguns projetos estratégicos usam.', score:4},
    {label:'4D + 5D integrados no fluxo padrão', desc:'Cronograma e custo vinculados ao modelo como rotina.', score:5}
  ]}
];

/* ===== STATE ===== */
var currentQ = 0;
var answers = new Array(QUESTIONS.length).fill(null);
var selectedAI = '';
var promptGerado = '';

var AI_URLS = {
  gpt: 'https://chatgpt.com/',
  claude: 'https://claude.ai/new',
  gemini: 'https://gemini.google.com/app'
};

var LEVELS = [
  {min:1, max:1.5, title:'Nível 1 — Pré-BIM', color:'#E53935', subtitle:'Sua empresa ainda não utiliza BIM ou está nos primeiros passos. O orçamento é totalmente manual e desconectado de qualquer modelo digital.'},
  {min:1.5, max:2.5, title:'Nível 2 — BIM Inicial', color:'#E67E22', subtitle:'BIM existe de forma pontual e exploratória. A extração de quantitativos é manual e o orçamento não tem vínculo com o modelo.'},
  {min:2.5, max:3.5, title:'Nível 3 — BIM Intermediário', color:'#F4C542', subtitle:'BIM é utilizado em boa parte dos projetos, com extração parcial de quantitativos. Ainda há lacunas na integração com orçamento e processos.'},
  {min:3.5, max:4.5, title:'Nível 4 — BIM Avançado', color:'#27AE60', subtitle:'A empresa tem boa integração BIM-orçamento, com processos definidos, extração automatizada e uso de plugins como OrçaBIM.'},
  {min:4.5, max:5.01, title:'Nível 5 — BIM 5D Pleno', color:'#1560F5', subtitle:'Excelência em BIM 5D: modelo, quantitativos, orçamento e cronograma integrados em um fluxo automatizado, rastreável e auditável.'}
];

/* ===== TOGGLE OUTRO ===== */
function toggleOutro(field, val) {
  var el = document.getElementById(field + '-outro');
  if (val === 'Outro') {
    el.style.display = 'block';
    el.focus();
  } else {
    el.style.display = 'none';
    el.value = '';
  }
}

function getFieldVal(id) {
  var sel = document.getElementById(id).value;
  if (sel === 'Outro') {
    var outro = document.getElementById(id + '-outro');
    return outro ? (outro.value.trim() || 'Outro') : 'Outro';
  }
  return sel;
}

/* ===== QUIZ FLOW ===== */
function startQuiz() {
  var seg = getFieldVal('segmento');
  if (!seg) { showToast('Selecione o segmento para continuar.'); return; }
  if (seg === 'Outro' && !document.getElementById('segmento-outro').value.trim()) {
    showToast('Informe o segmento no campo "Outro".'); return;
  }
  show('section-quiz');
  renderQuestion();
}

function renderQuestion() {
  var q = QUESTIONS[currentQ];
  var dim = DIMENSIONS.find(function(d){return d.key===q.dim});
  document.getElementById('qIcon').innerHTML = dim.icon;
  document.getElementById('qDimension').textContent = dim.name;
  document.getElementById('qCount').textContent = 'Pergunta '+(currentQ+1)+' de '+QUESTIONS.length;
  document.getElementById('qText').textContent = q.text;
  document.getElementById('qHint').textContent = q.hint||'';
  document.getElementById('qHint').style.display = q.hint?'block':'none';

  var html = '';
  for(var i=0;i<q.options.length;i++){
    var o = q.options[i];
    var sel = answers[currentQ]===i?' selected':'';
    html += '<div class="option'+sel+'" onclick="selectOption('+i+')">'
      +'<div class="option-radio"><div class="option-radio-dot"></div></div>'
      +'<div class="option-content"><div class="option-label">'+o.label+'</div>'
      +(o.desc?'<div class="option-desc">'+o.desc+'</div>':'')
      +'</div></div>';
  }
  document.getElementById('qOptions').innerHTML = html;

  document.getElementById('btnBack').style.display = currentQ===0?'none':'inline-flex';
  document.getElementById('btnNext').disabled = answers[currentQ]===null;
  var isLast = currentQ===QUESTIONS.length-1;
  document.getElementById('btnNext').innerHTML = isLast
    ? 'Ver resultado <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>'
    : 'Próxima <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';

  var pct = Math.round(((currentQ + (answers[currentQ]!==null?1:0))/QUESTIONS.length)*100);
  document.getElementById('progressFill').style.width = pct+'%';
  document.getElementById('progressLabel').textContent = (currentQ+1)+' / '+QUESTIONS.length;
}

function selectOption(idx) {
  answers[currentQ] = idx;
  var opts = document.querySelectorAll('#qOptions .option');
  for(var i=0;i<opts.length;i++) opts[i].classList.remove('selected');
  opts[idx].classList.add('selected');
  document.getElementById('btnNext').disabled = false;
  var pct = Math.round(((currentQ+1)/QUESTIONS.length)*100);
  document.getElementById('progressFill').style.width = pct+'%';
}

function nextQuestion() {
  if(answers[currentQ]===null) return;
  if(currentQ<QUESTIONS.length-1){
    currentQ++;
    renderQuestion();
    window.scrollTo({top:0,behavior:'smooth'});
  } else {
    showResult();
  }
}

function prevQuestion() {
  if(currentQ>0){
    currentQ--;
    renderQuestion();
  } else {
    show('section-profile');
  }
}

/* ===== RESULT CALC ===== */
function calcScores() {
  var dimScores = {};
  var dimCounts = {};
  DIMENSIONS.forEach(function(d){dimScores[d.key]=0;dimCounts[d.key]=0});
  for(var i=0;i<QUESTIONS.length;i++){
    var q = QUESTIONS[i];
    var a = answers[i];
    if(a!==null){
      dimScores[q.dim] += q.options[a].score;
      dimCounts[q.dim]++;
    }
  }
  var result = {};
  DIMENSIONS.forEach(function(d){
    result[d.key] = dimCounts[d.key]>0 ? dimScores[d.key]/dimCounts[d.key] : 0;
  });
  return result;
}

function getLevel(avg) {
  return LEVELS.find(function(l){return avg>=l.min && avg<l.max}) || LEVELS[LEVELS.length-1];
}

function showResult() {
  var scores = calcScores();
  var vals = DIMENSIONS.map(function(d){return scores[d.key]});
  var avg = vals.reduce(function(a,b){return a+b},0)/vals.length;
  var level = getLevel(avg);

  document.getElementById('rScore').textContent = avg.toFixed(1);
  document.getElementById('rTitle').textContent = level.title;
  document.getElementById('rSubtitle').textContent = level.subtitle;
  document.getElementById('progressFill').style.width = '100%';
  document.getElementById('progressLabel').textContent = 'Completo';

  // Gauge
  var gaugeHTML = '';
  var colors = ['#E53935','#E67E22','#F4C542','#27AE60','#1560F5'];
  var labels = ['Pré-BIM','Inicial','Intermed.','Avançado','Pleno'];
  var roundAvg = Math.round(avg);
  for(var i=0;i<5;i++){
    var active = i+1===roundAvg;
    var h = active ? 80 : 35+(i*8);
    var opacity = active ? 1 : 0.35;
    gaugeHTML += '<div style="text-align:center"><div class="gauge-bar" style="height:'+h+'px;background:'+colors[i]+';opacity:'+opacity+'">'
      +'<div class="gauge-bar-num">'+(i+1)+'</div></div>'
      +'<div class="gauge-bar-label">'+labels[i]+'</div></div>';
  }
  document.getElementById('gauge').innerHTML = gaugeHTML;

  // Dim cards
  var cardsHTML = '';
  DIMENSIONS.forEach(function(d){
    var s = scores[d.key];
    var pct = (s/5)*100;
    var col = s<2?'#E53935':s<3?'#E67E22':s<4?'#F4C542':s<4.5?'#27AE60':'#1560F5';
    var lvl = s<2?'Nível 1':s<3?'Nível 2':s<4?'Nível 3':s<4.5?'Nível 4':'Nível 5';
    cardsHTML += '<div class="dim-card">'
      +'<div class="dim-card-head"><div class="dim-card-name">'+d.name+'</div>'
      +'<div class="dim-card-score" style="background:'+col+'22;color:'+col+'">'+s.toFixed(1)+' — '+lvl+'</div></div>'
      +'<div class="dim-card-bar"><div class="dim-card-fill" style="width:'+pct+'%;background:'+col+'"></div></div>'
      +'</div>';
  });
  document.getElementById('dimCards').innerHTML = cardsHTML;

  drawRadar(scores);
  buildPrompt(scores, avg, level);
  show('section-result');
  window.scrollTo({top:0,behavior:'smooth'});
}

/* ===== RADAR CHART ===== */
function drawRadar(scores) {
  var canvas = document.getElementById('radarCanvas');
  var ctx = canvas.getContext('2d');
  var W = canvas.width, H = canvas.height;
  var cx = W/2, cy = H/2, R = 120;
  var dims = DIMENSIONS;
  var n = dims.length;

  ctx.clearRect(0,0,W,H);

  for(var ring=1;ring<=5;ring++){
    var r = R*(ring/5);
    ctx.beginPath();
    for(var i=0;i<=n;i++){
      var angle = (Math.PI*2/n)*i - Math.PI/2;
      var x = cx + r*Math.cos(angle);
      var y = cy + r*Math.sin(angle);
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.closePath();
    ctx.strokeStyle = ring===5?'#C0CCEE':'#E8EDFF';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  for(var i=0;i<n;i++){
    var angle = (Math.PI*2/n)*i - Math.PI/2;
    ctx.beginPath();
    ctx.moveTo(cx,cy);
    ctx.lineTo(cx+R*Math.cos(angle), cy+R*Math.sin(angle));
    ctx.strokeStyle='#DDE4FF';
    ctx.lineWidth=1;
    ctx.stroke();
  }

  ctx.beginPath();
  for(var i=0;i<=n;i++){
    var idx = i%n;
    var angle = (Math.PI*2/n)*idx - Math.PI/2;
    var val = scores[dims[idx].key];
    var r2 = R*(val/5);
    var x = cx + r2*Math.cos(angle);
    var y = cy + r2*Math.sin(angle);
    if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  }
  ctx.closePath();
  ctx.fillStyle='rgba(21,96,245,.15)';
  ctx.fill();
  ctx.strokeStyle='#1560F5';
  ctx.lineWidth=2.5;
  ctx.stroke();

  for(var i=0;i<n;i++){
    var angle = (Math.PI*2/n)*i - Math.PI/2;
    var val = scores[dims[i].key];
    var r2 = R*(val/5);
    var x = cx + r2*Math.cos(angle);
    var y = cy + r2*Math.sin(angle);
    ctx.beginPath();
    ctx.arc(x,y,4,0,Math.PI*2);
    ctx.fillStyle='#1560F5';
    ctx.fill();
    ctx.strokeStyle='#fff';
    ctx.lineWidth=2;
    ctx.stroke();

    var lx = cx + (R+28)*Math.cos(angle);
    var ly = cy + (R+28)*Math.sin(angle);
    ctx.font='600 11px Inter,sans-serif';
    ctx.fillStyle='#2A3A6A';
    ctx.textAlign = Math.cos(angle)<-0.1?'right':Math.cos(angle)>0.1?'left':'center';
    ctx.textBaseline = Math.sin(angle)<-0.1?'bottom':Math.sin(angle)>0.1?'top':'middle';
    ctx.fillText(dims[i].name, lx, ly);
    ctx.font='700 10px Inter,sans-serif';
    ctx.fillStyle='#1560F5';
    ctx.fillText(val.toFixed(1), lx, ly + 14*(Math.sin(angle)>0?1:-1));
  }
}

/* ===== PROMPT ===== */
function buildPrompt(scores, avg, level) {
  var empresa = document.getElementById('empresa').value || 'Não informado';
  var segmento = getFieldVal('segmento');
  var porte = document.getElementById('porte').value || 'Não informado';
  var software = getFieldVal('software');

  var answersDetail = '';
  DIMENSIONS.forEach(function(d){
    answersDetail += '\n## '+d.name+' (Nota: '+scores[d.key].toFixed(1)+'/5)\n';
    QUESTIONS.forEach(function(q,i){
      if(q.dim===d.key && answers[i]!==null){
        answersDetail += '- '+q.text+'\n  Resposta: '+q.options[answers[i]].label+' ('+q.options[answers[i]].score+'/5)\n';
      }
    });
  });

  promptGerado = 'Você é um consultor especialista em BIM 5D aplicado à construção civil brasileira.\n\n'
    +'Uma empresa acaba de realizar um diagnóstico de maturidade BIM 5D e precisa de um plano de evolução personalizado.\n\n'
    +'## PERFIL DA EMPRESA\n'
    +'- Empresa: '+empresa+'\n'
    +'- Segmento: '+segmento+'\n'
    +'- Porte: '+porte+'\n'
    +'- Software BIM: '+software+'\n\n'
    +'## RESULTADO DO DIAGNÓSTICO\n'
    +'- Nota geral: '+avg.toFixed(1)+'/5\n'
    +'- Classificação: '+level.title+'\n\n'
    +'## RESPOSTAS DETALHADAS\n'
    +answersDetail+'\n\n'
    +'## SUA TAREFA\n'
    +'Com base nesses dados, gere:\n\n'
    +'1. **Análise da situação atual** — resumo executivo do estágio de maturidade, pontos fortes e fragilidades críticas.\n\n'
    +'2. **Plano de evolução em 3 fases** (Curto prazo: 0–3 meses / Médio prazo: 3–9 meses / Longo prazo: 9–18 meses), com:\n'
    +'   - Ações concretas e específicas para o perfil da empresa\n'
    +'   - Ferramentas recomendadas (incluindo OrçaBIM para integração Revit/Civil 3D com orçamento)\n'
    +'   - Indicadores de sucesso (KPIs) para cada fase\n'
    +'   - Investimento estimado de tempo e recursos\n\n'
    +'3. **Quick wins** — 3 ações que podem ser implementadas esta semana com impacto imediato.\n\n'
    +'4. **Benchmark de mercado** — como empresas do mesmo segmento e porte estão em relação a BIM 5D no Brasil.\n\n'
    +'Seja prático, direto e específico. Use referências reais de mercado (SINAPI, ABDI, Decreto BIM, normas ISO 19650). Formate em Markdown com títulos e listas.';

  document.getElementById('prompt-box').textContent = promptGerado;
}

/* ===== AI SELECTION ===== */
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
      fallbackCopy(promptGerado);
      abrirIA();
    });
  } else {
    fallbackCopy(promptGerado);
    abrirIA();
  }
}

function fallbackCopy(text) {
  var ta = document.createElement('textarea');
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
}

/* ===== FORMAT AI RESULT ===== */
function formatarDiagnostico() {
  var texto = document.getElementById('diag-paste').value.trim();
  if (!texto) { showToast('Cole o resultado da IA antes de formatar.'); return; }

  var empresa = document.getElementById('empresa').value.trim() || 'Empresa';
  var segmento = getFieldVal('segmento');
  var scores = calcScores();
  var vals = DIMENSIONS.map(function(d){return scores[d.key]});
  var avg = vals.reduce(function(a,b){return a+b},0)/vals.length;
  var level = getLevel(avg);
  var dataHoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  // Scores panel HTML
  var scoresHtml = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:16px 0">';
  DIMENSIONS.forEach(function(d) {
    var s = scores[d.key];
    var col = s<2?'#E53935':s<3?'#E67E22':s<4?'#F4C542':s<4.5?'#27AE60':'#1560F5';
    var lvl = s<2?'Nível 1':s<3?'Nível 2':s<4?'Nível 3':s<4.5?'Nível 4':'Nível 5';
    var pct = (s/5*100).toFixed(0);
    scoresHtml += '<div style="border:1.5px solid #DDE4FF;border-radius:8px;padding:12px 14px;background:#fff">';
    scoresHtml += '<div style="font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:#6B7BAA;margin-bottom:5px">'+d.name+'</div>';
    scoresHtml += '<div style="font-size:22px;font-weight:800;color:'+col+'">'+s.toFixed(1)+'<span style="font-size:12px;color:#9CAAD4">/5</span></div>';
    scoresHtml += '<div style="height:5px;border-radius:3px;background:#DDE4FF;margin-top:6px"><div style="height:100%;border-radius:3px;background:'+col+';width:'+pct+'%"></div></div>';
    scoresHtml += '<div style="font-size:11px;font-weight:600;color:'+col+';margin-top:4px">'+lvl+'</div>';
    scoresHtml += '</div>';
  });
  scoresHtml += '<div style="border:1.5px solid #1560F5;border-radius:8px;padding:12px 14px;background:#F5F8FF;grid-column:1/-1">';
  scoresHtml += '<div style="font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:#6B7BAA;margin-bottom:5px">Score global de maturidade BIM 5D</div>';
  scoresHtml += '<div style="font-size:28px;font-weight:800;color:'+level.color+'">'+avg.toFixed(1)+'<span style="font-size:13px;color:#9CAAD4">/5 — '+level.title+'</span></div>';
  scoresHtml += '<div style="height:7px;border-radius:4px;background:#DDE4FF;margin-top:8px"><div style="height:100%;border-radius:4px;background:'+level.color+';width:'+(avg/5*100).toFixed(0)+'%"></div></div>';
  scoresHtml += '</div></div>';

  // Markdown to HTML
  var linhas = texto.split('\n');
  var htmlLinhas = [];
  linhas.forEach(function(linha) {
    var l = linha.trim();
    if (!l) { htmlLinhas.push('<br>'); return; }
    if (l.startsWith('### ')) { htmlLinhas.push('<h3>'+l.slice(4)+'</h3>'); return; }
    if (l.startsWith('## ')) { htmlLinhas.push('<h2>'+l.slice(3)+'</h2>'); return; }
    if (l.startsWith('# ')) { htmlLinhas.push('<h2>'+l.slice(2)+'</h2>'); return; }
    if (l.startsWith('- ') || l.startsWith('* ')) {
      htmlLinhas.push('<li>'+l.slice(2).replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')+'</li>');
      return;
    }
    if (/^\d+\.\s/.test(l)) {
      htmlLinhas.push('<li>'+l.replace(/^\d+\.\s/,'').replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')+'</li>');
      return;
    }
    l = l.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>');
    htmlLinhas.push('<p>'+l+'</p>');
  });

  var htmlFinal = '<h1 style="font-size:20px;font-weight:800;color:#0A1A5C;margin-bottom:4px">Diagnóstico de maturidade BIM 5D</h1>';
  htmlFinal += '<p style="font-size:12px;color:#6B7BAA;margin-bottom:2px"><strong>'+empresa+'</strong> — '+segmento+'</p>';
  htmlFinal += '<p style="font-size:12px;color:#6B7BAA;margin-bottom:2px">'+dataHoje+'</p>';
  htmlFinal += '<hr style="border:none;border-top:2px solid #DDE4FF;margin:14px 0">';
  htmlFinal += '<h2 style="font-size:14px;font-weight:700;color:#0A1A5C;margin-bottom:10px;border-bottom:2px solid #DDE4FF;padding-bottom:5px">Painel de maturidade</h2>';
  htmlFinal += scoresHtml;
  htmlFinal += '<hr style="border:none;border-top:2px solid #DDE4FF;margin:18px 0">';
  htmlFinal += htmlLinhas.join('\n');

  document.getElementById('doc-content').innerHTML = htmlFinal;
  show('section-report');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ===== EDITOR ===== */
function fmt(cmd) { document.execCommand(cmd, false, null); }
function fmtBlock(tag) { document.execCommand('formatBlock', false, tag); }

/* ===== SAVE HTML ===== */
function salvarHTML() {
  var doc = document.getElementById('doc-content').innerHTML;
  var empresa = document.getElementById('empresa').value.trim() || 'empresa';
  var slug = empresa.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g,'').slice(0,40);
  var html = '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">';
  html += '<title>Diagnostico BIM 5D — '+empresa+'</title>';
  html += '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">';
  html += '<style>body{font-family:"Inter",sans-serif;max-width:860px;margin:40px auto;padding:20px 32px;color:#0D1B4B;line-height:1.7}';
  html += 'h1{font-size:22px;font-weight:800;margin-bottom:4px}h2{font-size:16px;font-weight:700;color:#0A1A5C;margin-top:28px;margin-bottom:10px;padding-bottom:5px;border-bottom:2px solid #DDE4FF}';
  html += 'h3{font-size:14px;font-weight:700;margin-top:16px}p{margin-bottom:10px}ul,ol{margin:8px 0 12px 20px}li{margin-bottom:5px}';
  html += 'hr{border:none;border-top:2px solid #DDE4FF;margin:18px 0}';
  html += '@media print{body{margin:20px;padding:0}}</style></head><body>';
  html += doc;
  html += '</body></html>';
  var blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'diagnostico-bim5d-' + slug + '.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Relatório salvo como HTML!');
}

/* ===== NAV ===== */
function voltarResultado() {
  show('section-result');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function show(id) {
  var secs = document.querySelectorAll('.section');
  for(var i=0;i<secs.length;i++) secs[i].classList.remove('active');
  document.getElementById(id).classList.add('active');
}

function showToast(msg, dur) {
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(function(){t.classList.remove('show')}, dur||2500);
}

function resetAll() {
  currentQ = 0;
  answers = new Array(QUESTIONS.length).fill(null);
  selectedAI = '';
  promptGerado = '';
  document.getElementById('empresa').value = '';
  document.getElementById('segmento').value = '';
  document.getElementById('porte').value = '';
  document.getElementById('software').value = '';
  document.getElementById('segmento-outro').style.display = 'none';
  document.getElementById('segmento-outro').value = '';
  document.getElementById('software-outro').style.display = 'none';
  document.getElementById('software-outro').value = '';
  document.getElementById('diag-paste').value = '';
  document.getElementById('progressFill').style.width = '0%';
  document.getElementById('progressLabel').textContent = '0 / '+QUESTIONS.length;
  document.querySelectorAll('.ai-sel-btn').forEach(function(b){b.classList.remove('selected')});
  var hint = document.getElementById('ai-sel-hint');
  if(hint){hint.textContent='Selecione uma IA acima para continuar';hint.style.color='var(--muted-light)'}
  show('section-profile');
  window.scrollTo({top:0,behavior:'smooth'});
}
