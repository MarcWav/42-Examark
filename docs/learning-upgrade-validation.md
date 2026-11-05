# Validação do aprendizado — 1.2.0

Concluída em 05/11/2026 no Windows 10 x64. O projeto existente foi preservado; o levantamento inicial está em [architecture-upgrade.md](architecture-upgrade.md). Instruções de uso e limites em [aprendizado-1.2.md](aprendizado-1.2.md).

## Verificações automatizadas executadas

- `npm test`: 24 testes aprovados. Cobrem catálogo, metadados dos 949 casos, IDs estáveis, geração reprodutível, conteúdo específico dos 14 exercícios e duas variantes, correspondência das linhas explicadas, curto-circuito, separação de modos, histórico, migração e protocolo desktop, incluindo a URL versionada do worker.
- `npm run test:python`: 949/949 casos de referência aprovados; 16 algoritmos errados e 16 memorizadores de exemplos rejeitados. [Relatório](python-validation.json).
- `npm run test:learning`: 127 execuções rastreadas, 3.457 eventos e 12 verificações específicas. Incluem a sequência real da pilha, curto-circuito de `or`/`and`, variantes separadas, tipos, exceções sem retorno inventado, sintaxe, falha interna e metadados. [Relatório](learning-validation.json).
- `npm run test:desktop`: interface de produção no Electron real em `trainer://app`, Python e fontes locais, 949/949 casos aprovados e 949 resultados transmitidos individualmente, 31 exemplos didáticos rastreados, IndexedDB, isolamento do renderer e encerramento/recuperação de worker com loop infinito. Nove verificações aprovadas; nenhum erro de console registrado nesse teste. [Relatório](desktop-validation.json) e [captura](desktop-validation.png).
- `npm run release:windows`: compilação TypeScript/Vite e geração dos executáveis portátil e instalador 1.2.0. Inspeção do pacote com 61 entradas: runtime, biblioteca padrão e licenças incluídos; sem código de QA, dependências de build ou progresso pessoal. [Metadados e hashes](windows-release.json).

## Verificações pela interface real

- Quatro etapas de dicas, confirmação antes da solução, seleção de linhas e explicação de `not stack or stack.pop()` observadas.
- Uma solução que só conta aberturas/fechamentos foi reprovada em 6 dos 63 casos de bracket_validator. Todos os 63 casos ficaram disponíveis, incluindo os 55 adicionais; `([)]` mostrou esperado `False`, obtido `True`, diferença e diagnóstico cauteloso.
- Entender um teste, enviar a entrada para a referência, reproduzir a tentativa completa e executar apenas um caso funcionaram. A revisão manteve o editor somente para leitura e o conjunto exato de casos salvo.
- Anterior, próximo, reinício, controle de posição, reprodução, pausa, velocidade e parâmetros personalizados foram exercitados. Os resultados finais das visualizações foram conferidos nos 14 exercícios e nas duas variantes.
- Durante o simulado, as dicas e os detalhes de casos ficaram ocultos. Depois do encerramento, a revisão mostrou os 63 casos. Reproduzir a tentativa não modificou o resultado histórico nem o código de estudo.
- Compreensão parcial persistiu após recarregar. Exportação JSON real incluiu seis tentativas e 255 resultados; importação/exportação preservou o conteúdo integral e os subconjuntos de replay.
- Timeout depois de um primeiro caso concluído preservou esse resultado; o segundo caso apareceu sem retorno disponível e os restantes sem execução. Cancelamento manual também não inventou `None`. O worker se recuperou e executou outro caso com sucesso.
- O progresso original do navegador foi exportado antes da verificação e restaurado pelo fluxo real de importação ao final. A conferência final mostrou o código original e o runtime pronto.

## Limites da validação

O instalador foi gerado, mas não foi instalado no perfil pessoal deste computador. A versão 1.2.0 foi executada no Electron real; o smoke test do invólucro portátil feito na versão 1.1.0 é histórico. Não houve teste físico em outro PC ou Windows 11. Os executáveis são Windows x64 e não têm certificado de assinatura digital.

O rastreamento mostra a referência, com até 800 eventos e entradas pequenas; não é um depurador do código do aluno. Tentativas anteriores à atualização não possuem detalhes retroativos. Os casos locais são de treinamento e não representam testes privados oficiais.
