# Gerador de Proposta de Obra — OrçaFascio

Ferramenta web para gerar escopos de serviços de obras em formato profissional usando IAs gratuitas (ChatGPT, Claude e Gemini). Roda inteiramente no navegador — sem servidor, sem instalação, sem dependências externas além de fontes e uma biblioteca opcional de PPTX.

---

## Estrutura de arquivos

```
ferramenta-01-gerador-de-proposta.html   — toda a interface (markup + lógica de layout)
app.js                                    — toda a lógica da aplicação
styles.css                                — estilos, tema, responsividade e impressão
```

---

## Como usar

1. Abra `ferramenta-01-gerador-de-proposta.html` diretamente no navegador (duplo clique).
2. Siga os 5 passos do assistente.
3. Copie o prompt gerado, cole em uma IA e traga o texto de volta para formatar.

Não requer servidor web, Node.js ou qualquer instalação.

---

## Fluxo em 5 etapas

### Etapa 1 — Identificação
Coleta as informações de identidade da proposta:

- **Logos**: upload de imagem (PNG/JPG/SVG, até 2 MB) para o Contratado e o Contratante. Convertidas para Base64 e embutidas diretamente no documento.
- **Identidade visual**: duas cores (primária e secundária) aplicadas nos títulos e no cabeçalho. Seletor de cor nativo sincronizado com campo de texto hexadecimal (`#RRGGBB`).
- **Responsáveis**: Razão social, CNPJ/CPF, representante, e-mail, telefone e cidade do Contratado; nome e representante do Contratante.
- **Data e validade da proposta**: data do documento e prazo de validade (em dias, semanas ou meses).
- **Identificação da obra**: tipo (com chips de sugestão rápida), regime de execução, local, área, valor estimado, data de início e descrição do objeto.

**Validação**: obrigatório pelo menos um tipo de obra e um regime antes de avançar.

---

### Etapa 2 — Serviços
Define o escopo técnico da obra:

- **Grid de serviços**: 22 itens pré-definidos (estrutura, instalações elétricas, hidrossanitárias, revestimentos, etc.) em checkboxes visuais.
- **Serviços personalizados**: campo de texto livre para adicionar itens fora da lista padrão.
- **Prazo de execução**: número + unidade (horas, dias corridos, dias úteis, semanas, meses, anos ou texto livre). Campo "Outro…" revelado dinamicamente.
- **Forma de pagamento/medição**: lista livre com chips de sugestão (medição mensal, por etapas, 30%+70%, etc.).
- **Reajuste de preço**: lista livre com opções INCC, IPCA, CUB ou sem reajuste.

**Validação**: obrigatório ao menos um serviço selecionado, prazo preenchido e uma forma de pagamento.

---

### Etapa 3 — Condições
Personaliza cláusulas de proteção jurídica:

- **Exclusões do escopo**: campo de tags (Enter ou vírgula para adicionar). 13 sugestões rápidas em chips (mobiliário, paisagismo, elevadores, etc.).
- **Premissas e condições**: lista livre com 10 chips pré-definidos (alvará, projetos executivos, acesso à obra, ART/RRT, seguro, etc.).
- **Observações adicionais**: campo de texto livre para qualquer complemento.
- **Rodapé do documento**: texto de papel timbrado exibido no final do escopo (CNPJ, endereço, slogan, etc.).

Ao clicar em **"Montar prompt"**, a aplicação monta o texto completo do prompt e avança para a etapa 4.

---

### Etapa 4 — Prompt pronto
Exibe o prompt gerado e coordena o envio para a IA:

- **Seletor de IA**: botões para ChatGPT, Claude e Gemini.
  - ChatGPT e Gemini: o prompt é enviado direto via URL (`?q=…`) e o chat abre preenchido.
  - Claude: o chat abre em branco; o prompt já está copiado para a área de transferência (Ctrl+V).
- **Caixa do prompt**: exibe o texto gerado em `<pre>` com scroll, para leitura ou cópia manual.
- **Campo "Colar e formatar"**: após a IA responder, cole o texto aqui e clique em **"Colar e formatar"** para gerar o documento final na etapa 5.

---

### Etapa 5 — Escopo final
Documento formatado, editável e pronto para download:

- **Cabeçalho do documento**: logos lado a lado, título "Proposta de serviços", subtítulo com tipo de obra e bloco "Att:" com dados do Contratante.
- **Corpo do documento**: texto da IA convertido de Markdown para HTML com tratamento especial de headings, listas, tabelas e orientações.
- **Orientações `[[assim]]`**: trechos entre `[[duplos colchetes]]` gerados pela IA aparecem destacados em laranja com botão de remoção individual. Botão "Remover orientações" remove todas de uma vez.
- **Rodapé do documento**: dados do Contratado e Contratante em colunas, data e validade da proposta, e texto de papel timbrado.
- **Editor rico**: barra de ferramentas com negrito, itálico, sublinhado, H1/H2/H3, parágrafo, listas com bullets, lista numerada, desfazer/refazer. O conteúdo é `contenteditable`.

---

## Downloads disponíveis

| Botão | Formato | Mecanismo |
|---|---|---|
| Salvar (.html) | `.html` | Emite o HTML da página inteira com o estado da proposta embutido em `<script type="application/json">`. Permite reimportar depois. |
| PDF / Imprimir | PDF | `window.print()` com `@media print` que oculta UI e formata para A4. |
| Word (.docx) | `.doc` | Gera um HTML com namespace Office (`xmlns:w`) e faz download via Blob. Pode ser aberto e salvo como `.docx` no Word. |
| PowerPoint (.pptx) | `.pptx` / `.html` | Carrega `PptxGenJS` via CDN. Se o CDN falhar, gera um HTML de slides como fallback. |

---

## Salvar e importar projetos

- **Salvar**: emite o HTML da aplicação com o estado completo serializado em JSON (campos, checkboxes, logos, prompt, HTML do escopo, página atual). O nome do arquivo inclui o nome do Contratado e a data.
- **Importar**: lê o arquivo `.html` salvo anteriormente, extrai o JSON embutido e restaura todo o estado — inclusive logos e conteúdo do editor.

---

## Conversão Markdown → HTML (`md2html`)

A função `md2html` em [app.js](app.js) converte o texto bruto da IA para HTML antes de exibir no documento. Ela aplica os seguintes tratamentos em ordem:

1. Detecta `[[texto]]` e converte em blocos `.orientacao` destacados em laranja.
2. Remove separadores (`---`, `***`), datas de rodapé, título "ESCOPO DE SERVIÇOS", "Fim do Escopo", seção de alertas, referências bibliográficas (`[1]: https://…`) e frases introdutórias genéricas da IA.
3. Renomeia "Objeto do Contrato" para "Objeto da Proposta".
4. Converte headings (`#`, `##`, `###`), listas (`-`, `*`, `1.`), tabelas (`|col|col|`) e parágrafos para seus equivalentes HTML.
5. Aplica `titleCase` nos headings `##`, preservando siglas (ABNT, CNPJ, ART, INCC, etc.) em maiúsculas e preposições/artigos em minúsculas.
6. Aplica formatação inline: `**negrito**`, `*itálico*`, `` `código` ``.

---

## Máscaras de campo

| Campo | Função | Formato |
|---|---|---|
| Telefone / WhatsApp | `mascaraTel` | `(00) 00000-0000` (celular) ou `(00) 0000-0000` (fixo) |
| CNPJ / CPF | `mascaraCNPJ` | `00.000.000/0001-00` ou `000.000.000-00` conforme quantidade de dígitos |
| Valor estimado | `mascaraValor` | `R$ 0.000,00` (BRL) |

---

## Sistema de listas dinâmicas (elist)

Campos como "Tipo de obra", "Regime de execução", "Pagamento" e "Premissas" usam um padrão de lista gerenciável:

- `ea(id)` — adiciona o valor digitado no input à lista.
- `es(id, valor)` — adiciona um valor pré-definido (chips de sugestão).
- `edel(id, índice)` — remove um item pelo índice.
- `er(id)` — re-renderiza o HTML da lista.

Todos os dados ficam no objeto `elistData` e são incluídos na serialização do estado salvo.

---

## Identidade visual dinâmica

As cores escolhidas na Etapa 1 são aplicadas ao documento via variáveis CSS:

```js
docEl.style.setProperty("--doc-primary", cores.primaria);
docEl.style.setProperty("--doc-secondary", cores.secundaria);
```

No export Word, as cores são interpoladas diretamente no CSS inline do arquivo gerado.

---

## Responsividade e impressão

- Layout responsivo com breakpoint em `540px` (formulário em coluna única) e `600px` (padding reduzido).
- `@media print` oculta toda a UI (header, steps, botões, toolbar, CTA) e formata apenas o `.result-doc` para folha A4 com margens de 2 cm.
- `print-color-adjust: exact` preserva cores de fundo e bordas no PDF.

---

## Dependências externas

| Recurso | Origem | Obrigatório |
|---|---|---|
| Fonte Inter | Google Fonts CDN | Não (cai para `system-ui`) |
| Logo OrçaFascio | Website Files CDN | Não (SVG inline como fallback) |
| PptxGenJS 3.12 | jsDelivr CDN | Não (fallback para HTML de slides) |

A ferramenta funciona offline para todas as funcionalidades exceto o download de PPTX nativo.
