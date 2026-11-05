# Aprendizado didático — versão 1.2.0

Esta melhoria foi integrada ao projeto existente, mantendo Vite/TypeScript, CodeMirror, Pyodide/Web Worker, o tema escuro, os 14 subjects, suas variantes, estatísticas, simulados e distribuição Windows.

## Como experimentar

1. Abra `iniciar.bat` ou o executável **1.2.0** da pasta `release`.
2. Escolha um exercício e abra **Dicas**. As quatro etapas incluem exemplos com justificativa, estratégia, variáveis e pseudocódigo. A solução completa depende de confirmação.
3. Na solução, clique nas linhas numeradas. Use **Linha anterior**, **Próxima linha** e **Reiniciar explicação**. Expressões como `not stack or stack.pop()` são divididas em partes, incluindo curto-circuito.
4. Abra **Visualizar**. Escolha um exemplo ou altere a lista JSON de parâmetros. Use Anterior/Próximo, reprodução, pausa, velocidade, reinício e o controle de posição.
5. Clique em **Corrigir**. Expanda os grupos de exemplos públicos, adicionais, bordas e restrições. Cada caso mostra ID, objetivo, entrada exata, esperado, obtido, tipo, duração, versão, semente e diagnóstico.
6. Em um caso, use **Entender este teste**, **Executar esta entrada** ou **Visualizar referência**. O replay usa o código atual; no histórico, usa o código salvo da tentativa.
7. Use **Histórico** para abrir uma correção anterior. O editor da revisão é somente para leitura. Reproduzir não altera o resultado original.
8. Em **Notas**, marque Ainda não entendi, Entendi parcialmente ou Entendi. Isso não muda a aprovação nos testes.
9. Depois de encerrar um simulado, abra **Meu progresso → Revisar resultados**. Durante a tentativa, as dicas, soluções e detalhes de avaliação permanecem bloqueados.

## O que a visualização realmente mostra

Os passos são obtidos por `sys.settrace` na **solução de referência Python**, executada pelo mesmo worker do aplicativo. Não são uma interpretação do código do aluno. Cada evento de linha mostra o estado **antes** dessa linha executar; o evento seguinte permite observar a mudança.

As condições instrumentadas são avaliadas uma única vez, preservando `and`/`or`, efeitos de `pop()` e os ramos da expressão condicional. Os retornos e as variáveis vêm do Python real. Funções auxiliares possuem escopos próprios. A posição de varredura de loops sem um índice explícito é indicada como derivada dos passos do `for`.

Cada um dos 14 exercícios possui sua própria representação: pilha; chaves de ordenação; duas pontas; matriz; subsequência; interseção; conversão posicional; janela de pares; frequências; mescla; estoque de caracteres; alternância; rotação; alfabeto circular. As duas variantes têm referências e explicações correspondentes.

## Dados e reprodutibilidade

- A chave de progresso `42-exam-trainer-v1` e o esquema 1 foram mantidos. A compreensão booleana antiga migra para o novo estado sem apagar código, notas, contadores ou simulados.
- As correções detalhadas usam IndexedDB local. Cada registro conserva o código executado, a versão do exercício, o conjunto exato de casos, os resultados e os horários. Não há limite artificial de “últimas cinco tentativas”.
- A exportação JSON inclui o histórico detalhado. Se o armazenamento do histórico não estiver disponível, o app informa que ele ficou somente na sessão e oferece o JSON para guardá-lo.
- Os casos adicionais existentes foram preservados. O gerador continua determinístico, com semente 4203. Cada caso registra os parâmetros efetivos e um ID estável, inclusive para entradas repetidas.
- Timeout/interrupção preservam os casos que já retornaram ao processo principal. O caso interrompido e os ainda não executados não recebem retornos inventados.
- Uma inspeção AST de restrição é exibida como verificação própria, com o resultado observado e a linha indicada. Não foram criadas proibições novas para os outros subjects.

## Limitações reais

- A referência é rastreada; o código do aluno não possui depurador passo a passo nesta versão.
- A visualização aceita exemplos pequenos e limita o registro a 800 eventos. Quando o registro é cortado, a interface avisa. Não afirma exibir os passos omitidos.
- Detalhes de tentativas feitas antes desta versão não foram gravados pelo app antigo. Seus totais e códigos continuam preservados; não foram reconstruídos resultados retroativos.
- A causa exata de uma falha não é deduzida apenas pela saída. Diagnósticos usam “pode indicar” e identificam a regra violada e a primeira diferença observada.
- A inspeção de restrições é de treinamento, não análise formal contra ofuscação. O app não é uma sandbox de segurança para código hostil.
- Os testes locais não são os testes privados da 42, e aprovação local não garante aprovação na prova oficial.
