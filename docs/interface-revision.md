# Revisão de interface e aprendizado — 42 Examark

Trabalho aplicado ao projeto existente em 05/11/2026. O escopo continua sendo **Python Exam Rank 03**, com 14 exercícios e duas variantes. Não foram implementados os Exams 04 ou 05.

Esta revisão está no código-fonte da branch main do repositório. O envio do código foi autorizado em 06/11/2026. A geração e a publicação de novos executáveis foram autorizadas em 06/11/2026, na versão 1.4.0. Os executáveis 1.3.1 correspondem à interface anterior; consulte as [notas da versão 1.4.0](releases/1.4.0.md).

## Mudanças no uso

- O nome visível passou a **42 Examark**. Slogans e frases motivacionais foram retirados do cabeçalho, navegação, console, configurações, simulado e progresso.
- O enunciado começa pela explicação em português, seguida do original em inglês, início da função, regras e poucos exemplos. Todos os exemplos continuam acessíveis ao expandir. Fonte e versão ficam em uma seção compacta.
- A variante comunitária de cryptic_sorter informa que não há enunciado completo em inglês nessa fonte; seu texto não é apresentado como confirmação oficial da 42.
- As dicas mantêm quatro etapas. As três primeiras orientam sem mostrar a implementação completa. A quarta leva ao gabarito.
- **Gabarito → Ver gabarito** revela o conteúdo com um clique. A seleção mostra uma única implementação por vez, com explicação por linha, estratégia, comparação e limites. O código do editor é preservado. Ao trocar de exercício ou versão, o gabarito volta a ficar oculto.
- A visualização acompanha a implementação selecionada e seus valores reais no Python. A solução simples mantém os gráficos específicos existentes; as alternativas exibem as estruturas e variáveis que realmente existem em seus próprios passos. Algumas funções prontas produzem poucos eventos visíveis.
- Resultados mostram a contagem e o diagnóstico principal antes dos detalhes. Todos os casos, entradas, saídas, tipos, tempos, semente, origem e erros técnicos continuam expansíveis.
- Simulado tem duração e comportamento ao errar, com os mesmos cronômetro, códigos separados e histórico. Durante a tentativa, dicas, gabaritos e casos de avaliação ficam ocultos. Após encerrar, a revisão não modifica o resultado histórico.
- Progresso tem quatro indicadores, barras por nível, revisões relevantes e histórico. Exercícios nunca tentados não aparecem como falhas. Exercícios aprovados e compreendidos saem da lista de revisão, mesmo que tenham erros antigos.

## Soluções disponíveis e verificadas

Cada linha abaixo possui **duas implementações**. A contagem de casos é aplicada separadamente a cada uma.

| Exercício ou versão | Solução simples | Segunda abordagem | Casos por solução |
|---|---|---|---:|
| bracket_validator | Pilha de aberturas | Remover pares completos | 63 |
| cryptic_sorter, rank03 | Inserção estável, sem sorted/.sort | Divisão e mescla manual | 57 |
| echo_validator | Comparar dois índices | Comparar com texto invertido | 63 |
| mirror_matrix | Copiar valores por índice | Fatiar cada linha ao contrário | 57 |
| hidenp, Python | Percorrer big e avançar em small | Buscar cada letra com find | 62 |
| inter | Acumular sem repetir | Chaves únicas e filtragem | 58 |
| number_base_converter | Leitura e escrita manuais | Validação, int e divmod | 63 |
| pattern_tracker | Janela de dois caracteres | Contar os nove pares permitidos | 62 |
| anagram | Dicionários de contagem | Ordenar textos normalizados | 59 |
| shadow_merge | Dois índices nas listas ordenadas | Ordenar a concatenação, mantendo repetições | 57 |
| string_permutation_checker | Consumir ocorrências | Ordenar os caracteres exatos | 61 |
| string_sculptor, rank03 | Contador global de letras | Alternar funções com cycle | 59 |
| twist_sequence | Índices circulares | Juntar duas fatias | 59 |
| whisper_cipher | Posições com ord/chr | Tabela de tradução | 59 |
| cryptic_sorter, xornic | Inserção com quarto desempate | Mescla com quarto desempate | 52 |
| string_sculptor, examshell | Contador reiniciado no espaço ASCII | Transformar trechos separados pelo espaço ASCII | 58 |

Total: **32 soluções**, **1.898 casos executados** e **192 rastreamentos** de exemplos públicos. Todas passaram no avaliador Pyodide existente, inclusive as proibições de sorted()/.sort() na versão rank03 de cryptic_sorter, a matriz nova e a preservação de entrada em mirror_matrix. Não houve alteração dos valores esperados dos 949 casos originais.

A badge de aprovação depende da correspondência entre código, versão, conjunto de testes e restrições. Se algum deles mudar, um relatório antigo deixa de ser apresentado como validação atual. Execute `npm run test:answers` para regenerar o relatório após validar de verdade.

[Relatório completo das soluções](answer-validation.json).

## Arquivos principais

- `src/content/explanations.ts`: texto simples, parâmetros e regras dos 14 exercícios e variantes.
- `src/content/answer-key.ts`: segunda implementação, explicações por linha e comparação entre abordagens.
- `src/ui/subject.ts`: nova ordem do enunciado e exemplos expansíveis.
- `src/ui/education.ts`, `visualization.ts`, `results.ts`: dicas, gabarito, rastreamento selecionado e diagnóstico.
- `src/ui/overview.ts`, `src/statistics.ts`: simulado, progresso e revisões sem falsos erros em exercícios nunca tentados.
- `src/ui/compact.css`, `src/main.ts`: integração, densidade, teclado, foco e rolagem.
- `electron/main.cjs`: novo nome visível e manutenção explícita do perfil instalado anterior.
- `scripts/validate-answers.mjs`, `tests/revision.test.ts`, `electron/revision-qa.cjs`: novas verificações.

## Preservação dos dados e plataformas

Não foram alterados `42-exam-trainer-v1`, o esquema 1, o banco `42-exam-trainer-history`, o protocolo `trainer://app`, o appId ou o nome interno do executável Linux. A pasta portátil **42 Exam Trainer Dados** foi mantida. O perfil instalado também continua em sua localização anterior, mesmo com o novo nome visível.

Importação/exportação JSON, códigos, notas, compreensão, histórico, tempo e simulados continuam compatíveis. Os testes desktop usam perfis novos e isolados; o perfil pessoal não foi substituído. Não foram adicionadas dependências nem reduzidos sandbox, isolamento de contexto ou restrições de navegação.

Os scripts de empacotamento continuam preparados para Windows x64, Linux x64 e ARM64, usando o nome Examark em builds futuros. Nenhum pacote ou arquivo de release antiga foi renomeado.

## Validação executada

- `npm test`: **36 testes aprovados**.
- `npm run test:answers`: **32/32 soluções**, 1.898 casos, 192 rastreamentos.
- `npm run test:python`: **949/949 casos**, 16 algoritmos errados e 16 memorizadores de exemplos reprovados.
- `npm run test:learning`: **127 rastreamentos**, 3.457 eventos e 12 verificações didáticas.
- `npm run test:desktop`: nove verificações de execução existentes, 949 resultados transmitidos, 31 exemplos rastreados e seis grupos de verificações da interface revisada. Incluem seleção das 32 soluções, ocultação do gabarito, preservação do código, diagnóstico de tipo, histórico, persistência após recarregar, interrupção, timeout, recuperação, simulado e replay sem alterar o histórico.
- Resoluções efetivamente verificadas: **1920×1080, 1280×720, 900×650 e 540×800**, sem rolagem horizontal da página e com editor utilizável. Abas também navegadas pelo teclado.
- `npm run build`: TypeScript e produção Vite aprovados.

[Relatório desktop](desktop-validation.json). Capturas: [progresso](revision-progress.png), [simulado](revision-exam.png), [janela menor](revision-compact.png) e [layout móvel](revision-mobile.png).

## Limites e pendências

A validação desktop desta revisão foi executada no Windows. A tentativa de reutilizar o runtime Linux no Ubuntu/WSL local encontrou ausência de `libnspr4.so`; não foi declarada aprovação de execução Linux desta revisão nem feita alteração no sistema para contornar isso. A validação anterior dos pacotes Linux 1.3.1 permanece documentada separadamente. Não houve execução em hardware ARM64.

Uma captura de 1920×1080 do Electron encontrou erro transitório de captura gráfica. A verificação de layout nessa resolução passou; o erro de captura está registrado no relatório, separado dos resultados funcionais. As outras capturas e a conferência visual no navegador foram realizadas.

O rastreamento continua limitado a 800 eventos e entradas pequenas, e acompanha referências, não o código do estudante. Funções prontas podem executar seu trabalho dentro de uma única linha. Os resultados locais não garantem aprovação na prova oficial.

Não há funcionalidades solicitadas deixadas como placeholders. A versão 1.4.0 gera os novos executáveis desta revisão, com autorização de 06/11/2026 e verificação da ausência das frases antigas nos arquivos empacotados.

## Experimentar

No workspace atual, use `npm run dev` ou `npm run desktop` (ou `iniciar.bat` para a versão web). Abra um exercício, consulte o original, expanda os exemplos e vá a **Gabarito → Ver gabarito**. Troque a solução e clique nas linhas. Em **Visualizar**, a mesma seleção determina qual código é rastreado.
