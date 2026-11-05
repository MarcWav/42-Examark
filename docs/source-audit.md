# Auditoria dos subjects — Python Rank 03

Consulta em 04/11/2026. Este projeto foi construído a partir dos subjects públicos de Python, não de exercícios de C do Rank 02. A coincidência de nomes (por exemplo hidenp e inter) NÃO autoriza reutilizar o contrato de outra linguagem ou exame.

## Critérios de evidência

- **VERIFICADO**: informação lida diretamente no enunciado público da fonte indicada. Não significa autenticidade oficial da 42.
- **COMUNITÁRIO**: comportamento obtido de soluções ou descrições de terceiros, sem subject completo.
- **NÃO CONFIRMADO**: detalhe que não consta da documentação acessível.

Nenhuma das quatro fontes foi comprovada oficial. O site inicial declara explicitamente “Unofficial”. O pacote informa que atualiza dados a partir dos sites, então a coincidência dos subjects não é uma confirmação independente da escola.

## Tabela de contratos

| Exercício | Nível | Fonte do enunciado | Assinatura verificada | Restrições | Divergências | Status de verificação |
|---|---|---|---|---|---|---|
| bracket_validator | 1 | [subject público](https://rank03.42exam.net/js/data.js) · snapshot 1 | `def bracket_validator(s: str) -> bool:` | Nenhuma proibição explícita listada | Nenhum conflito identificado entre site e pacote; não comprova origem independente. | VERIFICADO no subject público, não oficial |
| cryptic_sorter | 1 | [subject público](https://rank03.42exam.net/js/data.js) · snapshot 2 | `def cryptic_sorter(strings: list[str]) -> list[str]:` | sorted() e list.sort() proibidos | Site e pacote: estável. Solução xornic: desempate pelo original e uso de sorted; variante comunitária separada. | VERIFICADO no subject público, não oficial |
| echo_validator | 2 | [subject público](https://rank03.42exam.net/js/data.js) · snapshot 3 | `def echo_validator(text: str) -> bool:` | Nenhuma proibição explícita listada | Site acrescenta dois exemplos; vazio retorna False em site e pacote. | VERIFICADO no subject público, não oficial |
| mirror_matrix | 2 | [subject público](https://rank03.42exam.net/js/data.js) · snapshot 4 | `def mirror_matrix(matrix: list[list[int]]) -> list[list[int]]:` | Nenhuma proibição explícita listada | Nenhum conflito identificado entre site e pacote; não comprova origem independente. | VERIFICADO no subject público, não oficial |
| hidenp | 3 | [subject público](https://rank03.42exam.net/js/data.js) · snapshot 5 | `def hidenp(small: str, big: str) -> bool:` | Nenhuma proibição explícita listada | Python Rank 03 nesta fonte; NÃO é o subject homônimo em C do Rank 02. Retorno bool, sem argv. | VERIFICADO no subject público, não oficial |
| inter | 3 | [subject público](https://rank03.42exam.net/js/data.js) · snapshot 6 | `def inter(s1: str, s2: str) -> str:` | Nenhuma proibição explícita listada | Nenhum conflito identificado entre site e pacote; não comprova origem independente. | VERIFICADO no subject público, não oficial |
| number_base_converter | 3 | [subject público](https://rank03.42exam.net/js/data.js) · snapshot 7 | `def number_base_converter(number: str, from_base: int, to_base: int) -> str:` | Nenhuma proibição explícita listada | Nenhum conflito identificado entre site e pacote; não comprova origem independente. | VERIFICADO no subject público, não oficial |
| pattern_tracker | 3 | [subject público](https://rank03.42exam.net/js/data.js) · snapshot 8 | `def pattern_tracker(text: str) -> int:` | Nenhuma proibição explícita listada | Nenhum conflito identificado entre site e pacote; não comprova origem independente. | VERIFICADO no subject público, não oficial |
| anagram | 4 | [subject público](https://rank03.42exam.net/js/data.js) · snapshot 9 | `def anagram(s1: str, s2: str) -> bool:` | Nenhuma proibição explícita listada | Nenhum conflito identificado entre site e pacote; não comprova origem independente. | VERIFICADO no subject público, não oficial |
| shadow_merge | 4 | [subject público](https://rank03.42exam.net/js/data.js) · snapshot 10 | `def shadow_merge(list1: list[int], list2: list[int]) -> list[int]:` | Nenhuma proibição explícita listada | Nenhum conflito identificado entre site e pacote; não comprova origem independente. | VERIFICADO no subject público, não oficial |
| string_permutation_checker | 4 | [subject público](https://rank03.42exam.net/js/data.js) · snapshot 11 | `def string_permutation_checker(s1: str, s2: str) -> bool:` | Nenhuma proibição explícita listada | Nenhum conflito identificado entre site e pacote; não comprova origem independente. | VERIFICADO no subject público, não oficial |
| string_sculptor | 5 | [subject público](https://rank03.42exam.net/js/data.js) · snapshot 12 | `def string_sculptor(text: str) -> str:` | Nenhuma proibição explícita listada | Site: contador global; pacote 0.1.12: espaço reinicia. Ambas selecionáveis. xornic: arquivo string_sculpur.py. | VERIFICADO no subject público, não oficial |
| twist_sequence | 5 | [subject público](https://rank03.42exam.net/js/data.js) · snapshot 13 | `def twist_sequence(arr: list[int], k: int) -> list[int]:` | Nenhuma proibição explícita listada | Nenhum conflito identificado entre site e pacote; não comprova origem independente. | VERIFICADO no subject público, não oficial |
| whisper_cipher | 6 | [subject público](https://rank03.42exam.net/js/data.js) · snapshot 14 | `def whisper_cipher(text: str, shift: int) -> str:` | Nenhuma proibição explícita listada | xornic: arquivo whisper_checker.py define whisper_cipher. Não há função whisper_checker. | VERIFICADO no subject público, não oficial |

Os parâmetros e tipos estão preservados nas assinaturas acima. Todos os 14 contratos pedem **valores retornados**, não programas de linha de comando. Cada exemplo público da versão praticada é incluído literalmente como entrada e valor esperado no avaliador.

## Arquivos e pastas

| Exercício | Nome do arquivo publicado no subject | Pasta oficial de entrega |
|---|---|---|
| bracket_validator | `py_bracket_validator.py` | NÃO CONFIRMADO |
| cryptic_sorter | `py_cryptic_sorter.py` | NÃO CONFIRMADO |
| echo_validator | `py_echo_validator.py` | NÃO CONFIRMADO |
| mirror_matrix | `py_mirror_matrix.py` | NÃO CONFIRMADO |
| hidenp | `py_hidenp.py` | NÃO CONFIRMADO |
| inter | `py_inter.py` | NÃO CONFIRMADO |
| number_base_converter | `py_number_base_converter.py` | NÃO CONFIRMADO |
| pattern_tracker | `py_pattern_tracker.py` | NÃO CONFIRMADO |
| anagram | `py_anagram.py` | NÃO CONFIRMADO |
| shadow_merge | `py_shadow_merge.py` | NÃO CONFIRMADO |
| string_permutation_checker | `py_string_permutation_checker.py` | NÃO CONFIRMADO |
| string_sculptor | `py_string_sculptor.py` | NÃO CONFIRMADO |
| twist_sequence | `py_twist_sequence.py` | NÃO CONFIRMADO |
| whisper_cipher | `py_whisper_cipher.py` | NÃO CONFIRMADO |

O app baixa arquivos com o nome da versão selecionada. A estrutura do examshell é `exam42/rendu/<task_name>/<task_name>.py`; é uma convenção do simulador, NÃO uma pasta oficial confirmada. As pastas ex1–ex6 são organização do repositório xornic.

## Versões efetivamente disponíveis

1. **rank03 · 04/11/2026**: padrão para os 14, com nomes `py_*.py`, assinaturas e todos os exemplos do snapshot.
2. **string_sculptor — examshell 0.1.12**: mesmo nome de função/arquivo; espaços ASCII reiniciam a alternância. `Hello World` produz `hElLo wOrLd`. No padrão produz `hElLo WoRlD`. A seleção troca os exemplos, casos adicionais, regras, dicas, visualização e referência.
3. **cryptic_sorter — xornic**: variante COMUNITÁRIA inferida da solução. A chave inclui o texto original após comprimento, minúsculas e vogais. `aaa, bbb, AAA, BBB` produz `AAA, aaa, BBB, bbb`; o padrão estável produz `aaa, AAA, bbb, BBB`. O código comunitário usa sorted. A proibição do subject padrão não é atribuída a essa variante sem enunciado. O app usa inserção manual na referência de ambas.

Os nomes `string_sculpur.py` e `whisper_checker.py` do xornic foram conferidos no código: definem `string_sculptor` e `whisper_cipher`. Não são tratados como novos exercícios.

## Regras e casos especiais

- **bracket_validator**: (), [] e {}; aninhamento; ignora texto; vazio válido.
- **cryptic_sorter**: tamanho, texto sem caixa e vogais ascendentes; estabilidade. A prioridade de vogais é redundante para textos iguais sem caixa, mas foi preservada.
- **echo_validator**: apenas letras, sem caixa; exemplo público vazio = False. Ausência de letras após filtragem usa False como convenção local explícita.
- **mirror_matrix**: nova matriz com cada linha invertida. Avaliamos também que a entrada não seja alterada sem impor identidade diferente a linhas que já sejam simétricas.
- **hidenp**: subsequência sensível à caixa; small vazio = True. Versão Python com retorno bool, independente do programa C Rank 02.
- **inter**: caracteres comuns sem repetição na ordem da primeira string; vazio retorna string vazia.
- **number_base_converter**: bases 2–36, dígitos 0–9/A–Z, saída string; bases/dígitos inválidos = ERROR. Zero e zeros iniciais são avaliados. Sinais, espaços, letras minúsculas e coerção de tipos não são especificados pelos exemplos; a referência escolhe ERROR para essas formas e não as exige nos testes de correção.
- **pattern_tracker**: dígitos adjacentes, segundo exatamente +1, sem volta 90; pares sobrepostos contam.
- **anagram**: ignora caixa e espaço ASCII; frequência importa. Pontuação, tabulações e detalhes de Unicode não estão definidos claramente; não são critérios adicionais impostos na correção. A referência conta os demais caracteres.
- **shadow_merge**: entradas ordenadas crescentes, preserva repetições. Listas desordenadas não são entradas testadas.
- **string_permutation_checker**: igualdade exata das frequências; caixa, espaços e pontuação contam; vazias = True.
- **string_sculptor**: começa em minúscula; só letras avançam a alternância; espaço segue a versão selecionada.
- **twist_sequence**: rotação à direita, k maior que tamanho e lista vazia estão nos exemplos; não impomos regra para k negativo.
- **whisper_cipher**: desloca letras, preserva caixa/símbolos, aceita negativo. Alfabeto local é A–Z/a–z. Unicode fora desse alfabeto é preservado pela referência, mas não tem comportamento exigido nos testes.

Para echo/sculptor, referências usam isalpha/lower/upper; testes adicionais usam ASCII. Não afirmamos um contrato universal de Unicode que a fonte não estabelece.

Nenhuma proibição global de set, Counter ou bibliotecas foi inventada. Só cryptic_sorter padrão tem sorted/list.sort explicitamente proibidos. A inspeção AST e o bloqueio de builtin são mecanismos de treinamento, não prova formal contra código deliberadamente ofuscado.

## Evidências preservadas

- HTML inicial: `docs/rank03-source.html` — aponta para js/data.js.
- JavaScript completo público: `docs/rank03-data.js` — SHA256 `a33b68ffa158eb08c518f83405939845ae678c022cceb353c10ce743ccaaec2c`.
- Extração sem executar código remoto no app: `src/content/subjects.json`.
- [Auditoria secundária](secondary-audit.md): pacote PyPI fixado, commit xornic, snippets e barreira de pagamento do artigo.
- Introdução de [note.com](https://note.com/it_morning/n/n070a3e238fe6?hl=en) acessível; subjects detalhados pagos: NÃO CONFIRMADO. Não foi contornada a barreira.

## Relação com os testes

Casos públicos vêm dos snapshots. Os adicionais são gerados por oráculos JavaScript em `scripts/generate-tests.mjs`; as referências são algoritmos Python escritos separadamente em `src/content/solutions.ts`. `npm run test:python` verifica todos no CPython WASM do Pyodide e rejeita implementações erradas e memorização de exemplos.

Os testes privados da 42 não estão disponíveis. A aprovação local NÃO garante aprovação oficial. Os testes adicionais são ocultos antes da execução na interface, mas podem ser inspecionados nos arquivos de uma aplicação local.
