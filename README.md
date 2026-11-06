# 42 Examark

Treinamento local, em português, dos 14 subjects públicos conhecidos de Python Rank 03. Material comunitário, **não oficial**. Os testes locais não reproduzem os testes privados da 42.

## Versão 1.4.1

A interface foi compactada e recebeu explicações simples, gabaritos com duas soluções por exercício, comparação entre abordagens e visualização da implementação escolhida. A versão 1.4.1 inclui esta revisão nos novos executáveis, com linguagem objetiva e sem slogans. A publicação verifica tanto as telas quanto a interface empacotada.

No Windows x64, envie **42-Examark-1.4.1-Windows-x64-Portatil.exe** para outra pessoa testar. Para executar pelo código-fonte, use `npm ci` e `npm run dev`, ou `npm run desktop`. O nome visível passou a **42 Examark**; chaves e pastas de dados anteriores foram mantidas para preservar o progresso.

[Detalhes e validação da revisão](docs/interface-revision.md).

## Baixar e usar

Os executáveis estão em **[Releases — baixar a versão mais recente](https://github.com/MarcWav/42-Examark/releases/latest)**.

| Sistema | Arquivo | Como abrir |
|---|---|---|
| Windows x64 | Portatil.exe | Dois cliques, sem instalar |
| Windows x64 | Instalador.exe | Instalação por usuário e atalhos |
| Linux x64 ou ARM64 | Portatil.AppImage | Permita execução e abra o arquivo |
| Linux x64 ou ARM64 | Portatil.tar.gz | Extraia e execute iniciar.sh; dispensa FUSE |

Todos incluem o editor, Python WASM, exercícios e fontes para uso offline, sem instalar Node.js/Python. Escolha a arquitetura correta. Linux usa glibc e bibliotecas gráficas do sistema; não há garantia para toda distribuição. Execução validada automaticamente em Ubuntu 22.04 x64; ARM64 tem verificação de empacotamento, sem execução em hardware ARM nesta release.

O progresso portátil fica em **42 Exam Trainer Dados** ao lado do EXE/AppImage ou dentro da pasta extraída. Para transportar, feche o aplicativo e leve também essa pasta. Para compartilhar uma cópia limpa, envie somente o pacote original. Se o local não permitir gravação, o app avisa e usa o perfil do usuário do sistema. **Arquivo → Abrir pasta do progresso** mostra a localização efetiva.

Use Exportar/Importar JSON para transferir dados entre Windows, Linux e navegador. Os executáveis Windows não possuem certificado digital.

Guias: [Windows](docs/distribuicao-windows.md) · [Linux portátil](docs/distribuicao-linux.md) · [Interface e aprendizado atuais](docs/interface-revision.md).

### Executar pelo código-fonte

1. Instale **Node.js 22 LTS ou superior** (inclui npm).
2. Clique duas vezes em **iniciar.bat**.
3. O aplicativo abre em **http://127.0.0.1:5173/**. Mantenha a janela do servidor aberta.

Não precisa instalar Python. A primeira instalação de dependências requer internet; depois o runtime Pyodide e as fontes tipográficas são servidos pelo próprio projeto.

Também é possível executar pelo terminal:

```powershell
npm install
npm run setup:runtime
npm run dev -- --open
```

## Usar

Veja o guia atual em [Interface e aprendizado](docs/interface-revision.md). O documento de [aprendizado 1.2](docs/aprendizado-1.2.md) descreve a implementação anterior.

- Escolha um exercício, implemente a assinatura e use **Ctrl+Enter** para rodar o exemplo selecionado. Escolha “Código livre” para executar apenas seu script, com stdout/stderr.
- **Corrigir** avalia todos os exemplos públicos e os casos adicionais da versão selecionada. A comparação preserva tipos: `True` não equivale a `1`; imprimir não substitui retornar. Saídas extras são reportadas como saída extra no console.
- Abra dicas progressivas e visualizações da referência. Na aba Gabarito, clique uma vez em Ver gabarito e selecione a solução desejada. Isso não substitui seu código.
- Registre notas e marque Ainda não entendi, Entendi parcialmente ou Entendi, separadamente da aprovação nos testes.
- Progresso, códigos e notas continuam no **localStorage deste navegador/origem**. Os resultados detalhados ficam no **IndexedDB local**, para não esgotar o limite do localStorage. O JSON exportado inclui os dois. A importação aceita backups anteriores e pede confirmação antes de substituir os dados.
- O simulado sorteia um exercício por nível e usa códigos separados do Aprendizado. O prazo continua ao atualizar a página. O histórico conserva os códigos de cada tentativa.
- O painel de fontes mostra a versão selecionada. Há variantes de `cryptic_sorter` e `string_sculptor`; a seleção muda testes, solução e regras.

## Verificações

```powershell
npm test
npm run test:python
npm run test:learning
npm run test:answers
npm run build
npm run preview
```

Para reconstruir os executáveis no Windows:

```powershell
npm install
npm run release:windows
```

Para gerar AppImage e tar.gz em Linux:

```sh
npm ci
npm run release:linux -- x64
npm run release:linux -- arm64
```

Para validar a versão desktop com um perfil de teste separado:

```powershell
npm run test:desktop
```

O empacotamento usa Electron 45.2.2 e electron-builder 26.18.0. Pode precisar de internet para obter os binários oficiais na primeira geração. Não publica nem envia arquivos automaticamente.

`test:python` executa CPython real em WASM, verifica referências, mutantes, memorização de exemplos, tipos, captura de erros, isolamento de namespace e recuperação de um worker após loop infinito. Não depende de Python do sistema.

## Organização

| Pasta/arquivo | Responsabilidade |
|---|---|
| `src/content/subjects.json` | Snapshot íntegro dos subjects públicos |
| `src/content/catalog.ts` | Contratos e versões selecionáveis |
| `src/content/lessons.ts` | Dicas, estratégias, conceitos e passos visuais |
| `src/content/solutions.ts` | Referências Python preservadas |
| `src/content/explanations.ts` | Explicações simples, parâmetros e regras |
| `src/content/answer-key.ts`, `answer-validation.json` | Soluções por versão, notas por linha e validação real |
| `src/ui/subject.ts`, `overview.ts`, `education.ts` | Enunciado, progresso, simulado e gabarito |
| `src/ui/compact.css` | Ajustes de densidade e responsividade |
| `src/content/additional-tests.json` | Casos adicionais gerados por oráculos JS independentes |
| `src/runner.ts`, `public/python-worker.js` | Executor, timeout, cancelamento e reinicialização |
| `src/python/evaluator.py` | Comparação estrita e restrições de treino |
| `src/storage.ts`, `src/exam.ts` | Persistência e simulados |
| `src/statistics.ts` | Métricas e priorização da revisão |
| `tests/`, `scripts/` | Testes de estado, catálogo e execução real |
| `docs/source-audit.md` | Auditoria principal e limitações das regras consultadas |
| `docs/secondary-audit.md` | Evidências e conflitos nas fontes secundárias |
| `docs/validation.md` | Verificações efetivamente realizadas |

## Limites importantes

Não é uma sandbox de segurança para código não confiável. O worker mantém a interface responsiva; timeout/cancelamento encerram o interpretador inteiro. Cada job usa um worker novo e cada caso recria o namespace do usuário. A limitação de stdout é de 20.000 caracteres por fluxo. Código malicioso pode contornar verificações de treino; não há promessa de isolamento de segurança ou acesso aos testes privados.

No **Aprendizado**, todos os casos executados podem ser inspecionados com entrada, esperado, obtido, tipos, duração e diagnóstico. No **Simulado**, os casos adicionais ficam ocultos durante a tentativa e aparecem na revisão depois de encerrar. A detecção de `sorted`/`.sort` cobre uso e aliases diretos via AST e bloqueio de builtin; não é uma análise formal contra ofuscação.

O cache do runtime usa Service Worker/Cache Storage quando o navegador permite. Cache não é necessário para executar: os arquivos WASM e a biblioteca padrão já estão em `public/runtime`. O app precisa de servidor HTTP local; não abra `index.html` diretamente.
