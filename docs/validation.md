# Validação executada

Registro histórico da implementação inicial. Para os resultados da melhoria 1.2.0, consulte [learning-upgrade-validation.md](learning-upgrade-validation.md). Os relatórios JSON são regenerados pelas verificações atuais.

Ambiente: Windows, Node.js 22.15.1, Vite 6.4.5, TypeScript, Pyodide 0.27.7 / CPython 3.12.7 em WASM. Consulta e execução em 04/11/2026.

## Fontes

- Os 14 subjects foram extraídos do JavaScript público indicado pelo HTML de rank03.42exam.net.
- As 14 assinaturas e arquivos foram comparados com examshell-python 0.1.12 e as soluções do commit xornic registrado na auditoria.
- As diferenças de string_sculptor e cryptic_sorter foram preservadas em variantes selecionáveis.
- O artigo note.com foi lido apenas até o conteúdo acessível; a parte paga não foi inferida.
- Catálogo e hidenp identificados explicitamente como Python Rank 03. Nenhum subject ou teste de C Rank 02 foi importado.

## Execução automatizada efetiva

`npm test`: **10 testes passaram**. Verificam catálogo completo, exemplos públicos da versão correta, separação das variantes, exportação/importação, localStorage, dados inválidos/corrompidos, seleção por nível, isolamento de códigos do simulado, cronômetro, preservação do histórico e estatísticas/revisão independentes da compreensão.

`npm run test:python`: **949/949 casos da referência passaram**, somando 14 exercícios e 2 variantes. A bateria adicional foi gerada por algoritmos JavaScript separados dos algoritmos Python de referência.

| Versão | Casos aprovados |
|---|---:|
| bracket_validator | 63 |
| cryptic_sorter padrão | 57 |
| echo_validator | 63 |
| mirror_matrix | 57 |
| hidenp Python | 62 |
| inter Python | 58 |
| number_base_converter | 63 |
| pattern_tracker | 62 |
| anagram | 59 |
| shadow_merge | 57 |
| string_permutation_checker | 61 |
| string_sculptor padrão | 59 |
| twist_sequence | 59 |
| whisper_cipher | 59 |
| cryptic_sorter xornic | 52 |
| string_sculptor examshell | 58 |

Também foram executados e rejeitados **16 algoritmos propositalmente errados e 16 memorizadores de exemplos públicos**. Verificações extras: bool diferente de int, print não substitui retorno, exceções capturadas, stdout/stderr separados, namespace novo por caso, aliases diretos de sorted proibidos, encerramento de loop infinito pelo proprietário do worker e recuperação do interpretador em um worker novo.

Os resultados estruturados estão em [python-validation.json](python-validation.json). O teste de encerramento automatizado usa worker_threads do Node com o mesmo interpretador WASM; os controles reais do browser também foram verificados separadamente.

`npm run build`: TypeScript e build de produção aprovados. CodeMirror separado em um chunk próprio. Runtime copiado para dist/runtime pelo build.

## Verificação pela interface real

Aplicativo aberto no navegador integrado em http://127.0.0.1:5173/:

- Os **14 exercícios e as 2 variantes** foram selecionados, com consulta da solução por confirmação, código inserido no CodeMirror e correção real via Web Worker. Todos mostraram aprovação completa nas contagens da tabela.
- Código e anotação com acentos foram salvos e continuaram presentes após atualizar a página. Marcação de compreensão foi exercitada.
- O fluxo de confirmação da solução foi observado; não houve resposta no código inicial.
- Simulado completo: cryptic_sorter → mirror_matrix → hidenp → string_permutation_checker → twist_sequence → whisper_cipher. Resultado exibido: **6/6 níveis, concluído**. Começou com corpo pass separado do código de estudo. Não havia abas de dicas e o acesso ao Aprendizado foi bloqueado durante a tentativa.
- Botão Interromper encerrou while True e exibiu mensagem de reinicialização do worker.
- Timeout automático encerrou while True, exibiu “Tempo excedido” e permitiu nova correção de bracket_validator com 63/63 casos aprovados.
- Ctrl+Enter executou o exemplo público. A verificação detectou e corrigiu um conflito de prioridade com o atalho padrão do CodeMirror.
- Busca por whisper e filtro de nível 6 exibiram somente whisper_cipher.
- Exportação gerou JSON baixável. O mesmo arquivo foi importado pelo seletor real, com confirmação, preservando códigos, 14 aprovações e histórico. Uma cópia local dos dados de QA foi guardada fora da distribuição.
- Um simulado foi atualizado durante a execução e reapareceu no mesmo exercício com prazo preservado. Após encerrá-lo, o código de estudo continuou intacto.
- Controles Anterior/Próximo/Reiniciar da visualização foram exercitados; a pilha avançou à etapa 2 e voltou à etapa 1.
- Ampliar/Reduzir editor e redimensionamento pelo teclado funcionaram; o separador mudou de 48% para 50%.
- O console do navegador não registrou erros nem avisos ao fim da verificação.
- O progresso de QA foi removido da sessão por importação de um estado inicial validado. A entrega inicia com 0/14 e código vazio com pass.
- Capturas reais: [app-preview.jpg](app-preview.jpg) e [progress-preview.jpg](progress-preview.jpg).

## Limites da verificação

Não foram usados testes privados da 42. Nenhuma aprovação local é apresentada como aprovação oficial. O layout oficial de entrega e detalhes de Unicode não presentes nos subjects continuam não confirmados. Não foi feita auditoria de segurança de código hostil. O lançador .bat é fornecido com verificação de Node/npm e falhas de instalação; a inicialização equivalente pelo npm foi efetivamente executada.
