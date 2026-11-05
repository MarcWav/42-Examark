# Auditoria das fontes secundárias

Consulta: 2026-11-04. Esta auditoria compara materiais públicos comunitários; nenhuma evidência de publicação oficial da 42 foi encontrada. VERIFICADO significa confirmado diretamente no subject público da fonte indicada, e não autenticado pela escola. COMUNITÁRIO identifica inferências obtidas de soluções/relatos. NÃO CONFIRMADO identifica detalhes ausentes da documentação consultada.

## Material conservado

- Fonte inicial: [rank03.42exam.net](https://rank03.42exam.net/), HTML em `docs/rank03-source.html`, dados em `docs/rank03-data.js`. O próprio site declara ser não oficial. Os dados públicos são carregados por `js/data.js`; não é necessário inferir os subjects do HTML vazio.
- [xornic1229/EXAM-RANK-3](https://github.com/xornic1229/EXAM-RANK-3), árvore fixada no commit `a3b1222461b0e9cd9c86390ac97136dfc670b7f8`. Os 14 arquivos `.py` e README foram lidos; snapshots em `docs/sources/secondary/xornic/` com `/` substituído por `_`. O repositório contém soluções e descrições resumidas, sem subjects completos: COMUNITÁRIO.
- [examshell-python 0.1.12](https://pypi.org/project/examshell-python/0.1.12/). Wheel obtido via URL de distribuição do JSON público do PyPI; nenhum pacote Python foi instalado ou executado. SHA256 do wheel `b65b99068ff95cee04cd139a188075a7980b3c872588a4eed9b820d220d9c61d` coincide com o índice. Extraído em `docs/sources/secondary/examshell/`. O arquivo `examshell/data/rank3.json` contém 14 subjects completos, assinaturas, exemplos e campo `forbidden`.
- [Artigo de it_morning](https://note.com/it_morning/n/n070a3e238fe6?hl=en), publicado em 2026-10-12. A introdução e a tabela dos 14 problemas são públicas. O HTML confirma `isAccessibleForFree:false` e uma barreira de pagamento. Não foi tentado contorná-la. O artigo alega reproduzir subjects e descreve divergência em cryptic_sorter, mas as seções detalhadas não estão acessíveis: NÃO CONFIRMADO para seus enunciados completos. Snapshot HTML: `docs/sources/secondary/note.html`.

## Resultado da comparação do pacote

As 14 assinaturas e os 14 nomes de arquivo do examshell-python 0.1.12 são idênticos aos dados atuais do site. A descrição inglesa de 13 problemas também é idêntica; string_sculptor difere. Os exemplos de 12 problemas são idênticos. echo_validator tem exemplos adicionais no site atual, sem conflito. string_sculptor tem conflito real descrito abaixo. Essa coincidência não constitui confirmação independente: o próprio pacote documenta atualização dos dados a partir dos sites de treino.

| Nível | Função / assinatura (com `def` e `:` no subject) | Arquivo do subject no site e no pacote | xornic: arquivo e comparação | Restrição explícita no pacote |
|---|---|---|---|---|
| 1 | `bracket_validator(s: str) -> bool` | `py_bracket_validator.py` | `ex1/bracket_validator.py`; mesma assinatura | Nenhuma listada |
| 1 | `cryptic_sorter(strings: list[str]) -> list[str]` | `py_cryptic_sorter.py` | `ex1/cryptic_sorter.py`; mesma assinatura, algoritmo e desempate divergentes | `sorted()`, `.sort()` |
| 2 | `echo_validator(text: str) -> bool` | `py_echo_validator.py` | `ex2/echo_validator.py`; mesma assinatura | Nenhuma listada |
| 2 | `mirror_matrix(matrix: list[list[int]]) -> list[list[int]]` | `py_mirror_matrix.py` | `ex2/mirror_matrix.py`; mesma assinatura | Nenhuma listada |
| 3 | `hidenp(small: str, big: str) -> bool` | `py_hidenp.py` | `ex3/hidenp.py`; mesma assinatura | Nenhuma listada |
| 3 | `inter(s1: str, s2: str) -> str` | `py_inter.py` | `ex3/inter.py`; mesma assinatura | Nenhuma listada |
| 3 | `number_base_converter(number: str, from_base: int, to_base: int) -> str` | `py_number_base_converter.py` | `ex3/number_base_converter.py`; mesma assinatura | Nenhuma listada |
| 3 | `pattern_tracker(text: str) -> int` | `py_pattern_tracker.py` | `ex3/pattern_tracker.py`; mesma assinatura | Nenhuma listada |
| 4 | `anagram(s1: str, s2: str) -> bool` | `py_anagram.py` | `ex4/anagram.py`; mesma assinatura | Nenhuma listada |
| 4 | `shadow_merge(list1: list[int], list2: list[int]) -> list[int]` | `py_shadow_merge.py` | `ex4/shadow_merge.py`; mesma assinatura | Nenhuma listada |
| 4 | `string_permutation_checker(s1: str, s2: str) -> bool` | `py_string_permutation_checker.py` | `ex4/string_permutation_checker.py`; mesma assinatura | Nenhuma listada |
| 5 | `string_sculptor(text: str) -> str` | `py_string_sculptor.py` | **`ex5/string_sculpur.py` define `string_sculptor`** | Nenhuma listada |
| 5 | `twist_sequence(arr: list[int], k: int) -> list[int]` | `py_twist_sequence.py` | `ex5/twist_sequence.py`; mesma assinatura | Nenhuma listada |
| 6 | `whisper_cipher(text: str, shift: int) -> str` | `py_whisper_cipher.py` | **`ex6/whisper_checker.py` define `whisper_cipher`** | Nenhuma listada |

Os caminhos `ex1/` etc. pertencem à organização do repositório comunitário. O pacote documenta como seu próprio ambiente de prática `exam42/rendu/<task_name>/<task_name>.py`, por exemplo `exam42/rendu/py_whisper_cipher/py_whisper_cipher.py`. Esses caminhos não provam o layout de entrega do exame real. O site fornece nomes de arquivos, mas seu JSON não especifica pasta de entrega oficial.

## Divergência: cryptic_sorter

### Site atual e examshell-python 0.1.12 — VERIFICADO no subject público

Ordenação crescente por comprimento; depois ordem ASCII com letras comparadas sem distinguir maiúsculas; depois quantidade de vogais crescente quando os critérios anteriores empatam; empates mantêm a ordem de entrada. A contagem de vogais fica redundante quando as strings já são lexicamente iguais sem distinguir caixa, mas o critério deve ser documentado fielmente. O subject proíbe `sorted()` e `list.sort()`; o pacote registra `['sorted()', '.sort()']`.

Exemplo público que define o desempate:

```text
Entrada: cryptic_sorter(["aaa", "bbb", "AAA", "BBB"])
Retorno: ["aaa", "AAA", "bbb", "BBB"]
```

### xornic — COMUNITÁRIO

A função implementa `sorted(strings, key=sort_key)` e sua chave é `(len(word), word.lower(), count_vowels(word), word)`. O último elemento compara o valor original, fazendo maiúsculas precederem minúsculas, em vez de preservar empates da comparação anterior. A entrada acima produz, pela implementação lida, `["AAA", "aaa", "BBB", "bbb"]` (inferência direta da chave, sem executar Python nesta auditoria). Além de alterar a saída, usa uma função proibida pela outra versão. O README também descreve explicitamente o valor original como desempate. Não há subject do repositório documentando suas próprias proibições: não importar automaticamente a proibição do site para uma versão comunitária.

### Artigo — COMUNITÁRIO / NÃO CONFIRMADO

A introdução pública menciona saídas invertidas dependendo da versão e funções de ordenação proibidas. Os detalhes que permitiriam atribuir um critério exato a uma versão não estão disponíveis na parte pública. Não usar essa introdução para inventar uma terceira variante.

## Divergência: string_sculptor

Assinatura em todas as fontes com código: `def string_sculptor(text: str) -> str:`. O arquivo `string_sculpur.py` de xornic é uma grafia divergente de arquivo; **não existe função `string_sculpur` em seu conteúdo**.

| Fonte/versão | Regra no espaço | Exemplo `Hello World` | Evidência |
|---|---|---|---|
| rank03.42exam.net atual | Não reinicia; caracteres não alfabéticos não contam | `hElLo WoRlD` | Descrição e exemplo explícitos no JSON atual: VERIFICADO |
| examshell-python 0.1.12 | Reinicia; a próxima letra fica minúscula | `hElLo wOrLd` | Descrição inglesa contém a regra de reinício e exemplo explícito: VERIFICADO |
| xornic commit fixado | Contador global, sem reinício | `hElLo WoRlD` | Inferido da solução com `count` incrementado apenas em letras: COMUNITÁRIO |

Outros exemplos do pacote: `hello -> hElLo`, `abc123def -> aBc123DeF`, `Python3.9! -> pYtHoN3.9!`, vazio -> vazio. O site acrescenta espaços em volta de `hello`, preservados. A versão de reinício deve ter seus próprios testes; não basta trocar o rótulo.

## echo_validator: exemplos acrescentados, sem conflito

Mesma descrição, mesma assinatura, mesmo resultado vazio (`False`) no site e no pacote. O pacote possui sete exemplos; o site possui nove, acrescentando `madam -> True` e `Able was I ere I saw Elba -> True`. Não é necessária variante de comportamento para esta diferença. A solução xornic usa `isalpha()`, conversão para minúsculas e exige texto filtrado não vazio. O subject inglês diz caracteres alfabéticos sem delimitar ASCII versus Unicode: generalização para todos os alfabetos é NÃO CONFIRMADA. A tabela introdutória do artigo resume letras inglesas, mas não disponibiliza o subject completo para impor isso à fonte inicial.

## whisper_cipher / whisper_checker

O repositório xornic contém arquivo `ex6/whisper_checker.py`, mas declara **`def whisper_cipher(text: str, shift: int) -> str:`**. O README usa whisper_checker como nome do exercício. Isso verifica uma divergência no nome do arquivo/README; não comprova uma assinatura alternativa `whisper_checker`. O site e o pacote concordam no nome `py_whisper_cipher`, arquivo `py_whisper_cipher.py` e função `whisper_cipher`.

A solução de xornic usa `islower()/isupper()` e aritmética módulo 26 com bases ASCII. Isso pode transformar caracteres Unicode não ASCII indevidamente; não usar a solução comunitária como especificação do que fazer fora do domínio alfabético documentado. Deslocamentos negativos são explícitos no subject do site e do pacote.

## Restrições e detalhes sem confirmação

- Só cryptic_sorter lista funções proibidas no `rank3.json` do pacote. O campo `forbidden` está vazio nos outros 13. A ausência de lista não equivale à confirmação de que qualquer biblioteca é permitida no exame real.
- O artigo explica que suas soluções evitam `sorted`, `sort`, `set` e `Counter` como estratégia pessoal diante de variações. Essa frase não deve virar proibição global para todos os exercícios.
- As soluções xornic de anagram, shadow_merge e string_permutation_checker usam `sorted`; number_base_converter usa `int(number, from_base)`. São soluções comunitárias, sem confirmação de que esses recursos são permitidos ou proibidos em um subject não consultado.
- Bases 2–36 e retorno `ERROR` para entradas inválidas são explícitos em number_base_converter. O subject conciso não especifica exaustivamente sinais, espaços, caixa minúscula, tipos Python errados ou Unicode. Qualquer decisão local nesses pontos precisa ser identificada como política do treino, sem atribuição ao exame.
- Nenhuma das fontes dá acesso comprovado aos testes privados da 42. Os testes construídos para esta plataforma são locais.
