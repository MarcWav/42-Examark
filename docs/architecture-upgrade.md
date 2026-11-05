# Inspeção anterior à melhoria didática (1.1.0 → 1.2.0)

O projeto existente foi inspecionado antes das alterações. Uma cópia dos fontes 1.1.0 foi guardada em `.cache/backup-1.1.0`, sem alterar perfis de usuários.

| Parte existente | Localização | Integração prevista |
|---|---|---|
| 14 subjects e variantes | `src/content/catalog.ts`, `subjects.json` | Preservar contratos, fontes, assinaturas e exemplos |
| Dicas, estratégias e exemplos visuais | `src/content/lessons.ts` | Conteúdo educativo estruturado e específico em módulos próprios |
| Referências Python | `src/content/solutions.ts` | Preservar os algoritmos; associar explicações a cada linha exata |
| Exemplos públicos e testes extras | `catalog.ts`, `additional-tests.json`, `scripts/generate-tests.mjs` | Preservar as entradas/saídas; acrescentar IDs, categorias, objetivos e semente |
| Corretor | `src/python/evaluator.py` | Tipos/retornos estritos preservados; acrescentar duração, diagnósticos e rastreamento da referência |
| Executor isolado | `src/runner.ts`, `public/python-worker.js` | Reusar o mesmo worker/Pyodide para correção, repetição e visualização |
| Interface | `src/main.ts`, `style.css` | Manter layout, cores, editor e controles; extrair painéis didáticos reutilizáveis |
| Código, notas, progresso | `src/storage.ts`, chave `42-exam-trainer-v1` | Manter chave/esquema e migrar campos opcionais sem apagar dados |
| Simulado | `src/exam.ts` e integração em `main.ts` | Preservar progressão, cronômetro e códigos separados; revisar resultados só após terminar |
| Estatísticas | `src/statistics.ts` | Manter métricas, com compreensão em três estados |
| Distribuição | `iniciar.bat`, `electron/`, `scripts/desktop-release.mjs` | Manter web, portátil e instalador; gerar nova versão sem substituir a 1.1.0 |

Resultados detalhados podem exceder o limite do localStorage. O código/progresso continua no armazenamento atual; o histórico completo de correções passa a usar IndexedDB local, separado e exportável no mesmo JSON de backup. Não há serviços remotos.
