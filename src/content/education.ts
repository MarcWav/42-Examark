import type {Exercise} from '../types.ts';
import {makeCall} from '../learning/literals.ts';
export interface TeachingExample {args:unknown[];expected:unknown;why:string}
export interface VariableGuide {name:string;purpose:string}
export interface LineNote {text:string;example?:{before:string;operation:string;after:string;value?:string};parts?:{token:string;meaning:string}[]}
export interface Education {goal:string;examples:TeachingExample[];strategy:string;model:string[];variables:VariableGuide[];loop:string;conditions:string[];pseudocode:string[];returnPlan:string;question:{text:string;answer:string}}
const example=(args:unknown[],expected:unknown,why:string):TeachingExample=>({args,expected,why});
const vars=(entries:[string,string][])=>entries.map(([name,purpose])=>({name,purpose}));
const lessons:Record<string,Omit<Education,'goal'|'strategy'>>={
bracket_validator:{examples:[example(['([{}])'],true,'As aberturas (, [ e { são fechadas na ordem inversa: }, ] e ). Nenhuma fica esperando.'),example(['([)]'],false,'Quando ) aparece, a última abertura ainda é [. Esse fechamento está fora de ordem.')],model:['Abriu (: pilha [] → ["("]','Abriu [: ["("] → ["(", "["]','Fechou ]: remove [ → ["("]','Fechou ): remove ( → []'],variables:vars([['stack','Lista das aberturas que ainda esperam fechamento. O último item é o próximo a fechar.'],['pairs','Dicionário que diz qual abertura corresponde a cada fechamento.'],['char','Caractere que o for está lendo agora.']]),loop:'for: visita cada caractere uma vez, na ordem do texto.',conditions:['O caractere é uma abertura?','É um fechamento reconhecido?','A pilha está vazia ou o topo é diferente do par esperado?'],pseudocode:['Comece com uma pilha vazia e um mapa de pares.','Leia um caractere por vez.','Se abrir um par, guarde na pilha.','Se fechar um par, confira se existe uma abertura e se o topo combina.','Se não combinar, termine com False.','Ao terminar o texto, confira se a pilha ficou vazia.'],returnPlan:'Um fechamento incorreto retorna False imediatamente. Depois do loop, retorne se não sobrou nenhuma abertura.',question:{text:'Pilha ["(", "["]: o que pop() devolve e o que fica na lista?',answer:'Devolve "[" e a pilha passa a ser ["("]. O último item que entrou é o primeiro que sai.'}},
cryptic_sorter:{examples:[example([['bbb','aaa','AAA']],['aaa','AAA','bbb'],'Todas têm tamanho 3. aaa vem antes de bbb sem diferenciar caixa. aaa e AAA empatam, então preservam a ordem de chegada.'),example([['longa','b','aa']],['b','aa','longa'],'O tamanho tem prioridade: 1, 2 e 5 caracteres.')],model:['Saída vazia → insira bbb.','aaa tem chave menor que bbb → entra antes.','AAA empata com aaa → entra depois de aaa.'],variables:vars([['result','Lista que já está ordenada.'],['word','Palavra que será inserida nesta rodada.'],['i','Posição candidata para inserir a palavra.'],['vowels','Quantidade de vogais da palavra; terceiro critério da chave.']]),loop:'for escolhe uma palavra; while recua pelas posições da saída enquanto a chave dela for menor.',conditions:['i ainda é maior que zero?','A chave da nova palavra é menor que a chave da palavra anterior?'],pseudocode:['Crie uma saída vazia.','Defina uma chave: tamanho, texto em minúsculas e quantidade de vogais.','Pegue cada palavra da entrada.','Comece procurando a partir do final da saída.','Recue enquanto a chave nova for estritamente menor.','Insira na posição encontrada e retorne a saída.'],returnPlan:'Retorne a lista ordenada. Não use sorted() nem .sort() na versão padrão.',question:{text:'Se duas palavras têm a mesma chave, devo trocar sua ordem?',answer:'Na versão padrão, não. A estabilidade mantém a ordem em que chegaram.'}},
echo_validator:{examples:[example(['A!b,a'],true,'Só as letras entram: a, b, a. As pontas são iguais.'),example(['ab'],false,'Depois da filtragem, a e b ficam nas pontas e são diferentes.')],model:['A!b,a → remova símbolos → Aba.','Converta a caixa → aba.','Compare índice 0 com 2; depois chegue ao centro.'],variables:vars([['letters','Novo texto só com letras em minúsculas.'],['char','Caractere que está sendo filtrado.'],['left / right','Índices das pontas que serão comparadas.']]),loop:'for filtra as letras; while aproxima os dois índices até o centro.',conditions:['char é uma letra?','Ficou alguma letra depois da filtragem?','As letras nas pontas são diferentes?'],pseudocode:['Monte uma string só de letras em minúsculas.','Se não houver letras, retorne False nesta versão.','Coloque um índice no começo e outro no final.','Compare as duas letras.','Se diferirem, retorne False; se coincidirem, aproxime os índices.','Se chegar ao centro sem diferença, retorne True.'],returnPlan:'False para vazio ou para o primeiro par diferente. True quando todos os pares coincidem.',question:{text:'Na entrada A!b,a, o ponto de exclamação participa da comparação?',answer:'Não. Apenas letras participam; o texto comparado é aba.'}},
mirror_matrix:{examples:[example([[[1,2,3],[4,5,6]]],[[3,2,1],[6,5,4]],'Cada linha troca suas colunas de lugar. A linha de cima continua em cima.'),example([[]],[],'Sem linhas, não há elementos para copiar. A saída é uma matriz vazia nova.')],model:['Linha [1,2,3] → leia índices 2,1,0 → [3,2,1].','Linha [4,5,6] → leia índices 2,1,0 → [6,5,4].'],variables:vars([['result','Matriz nova, onde entram as linhas prontas.'],['row','Linha original que está sendo espelhada.'],['mirrored','Cópia invertida da linha atual.'],['i','Índice que anda do final da linha até zero.']]),loop:'Dois for: o externo escolhe a linha; o interno visita os índices dela ao contrário.',conditions:['O intervalo de índices terminou? O próprio range controla isso.','A entrada não deve ser modificada.'],pseudocode:['Crie uma matriz de saída vazia.','Para cada linha, crie uma lista vazia.','Leia os valores da linha do último índice até zero.','Copie cada valor para a nova linha.','Adicione a nova linha à matriz de saída.','Retorne a nova matriz.'],returnPlan:'Retorne uma nova matriz, com as mesmas linhas em posição e suas colunas invertidas.',question:{text:'Espelhar uma matriz troca a primeira linha com a última?',answer:'Não. Neste subject, só os valores dentro de cada linha mudam de ordem.'}},
hidenp:{examples:[example(['abc','a1b2c'],true,'a, b e c aparecem nos índices 0, 2 e 4 da string maior, nessa ordem.'),example(['aec','abcde'],false,'Depois de encontrar e no final, não existe outro c adiante. Voltar no texto não vale.')],model:['Procure a em a1b2c → encontrou no índice 0.','Agora procure b → ignore 1; encontrou no índice 2.','Agora procure c → ignore 2; encontrou no índice 4.'],variables:vars([['small','Texto cujas letras precisam ser encontradas.'],['big','Texto que será percorrido sem voltar atrás.'],['i','Índice da próxima letra de small que falta encontrar.'],['char','Caractere atual de big.']]),loop:'for percorre big; i só avança quando char coincide com a próxima letra de small.',conditions:['Ainda existe alguma letra pendente em small?','small[i] é igual ao caractere atual de big?'],pseudocode:['Comece i em zero.','Leia cada caractere de big.','Se ainda faltar uma letra e ela for igual ao caractere atual, avance i.','Não avance i quando a letra for diferente.','No final, compare i com o tamanho de small.'],returnPlan:'Retorne True se todas as letras de small foram consumidas. small vazia já começa completa. A função Python retorna bool; não imprime 0/1.',question:{text:'As letras de small precisam estar juntas em big?',answer:'Não. Precisam apenas aparecer na mesma ordem. Isso é uma subsequência, não necessariamente uma substring.'}},
inter:{examples:[example(['hello','world'],'lo','l e o existem nas duas strings. O segundo l não é repetido na saída.'),example(['aaa','ab'],'a','Há vários a na primeira string, mas o caractere só entra uma vez.')],model:['h → não está em world → saída vazia.','l → está em world e ainda não saiu → saída l.','Próximo l → já saiu → ignore.','o → comum e novo → saída lo.'],variables:vars([['s1','Determina a ordem em que os caracteres entram na saída.'],['s2','Texto usado para verificar se o caractere é comum.'],['result','Saída parcial e registro dos caracteres já adicionados.'],['char','Caractere atual de s1.']]),loop:'for percorre s1, porque a ordem da primeira string deve ser preservada.',conditions:['O caractere existe em s2?','O caractere ainda não foi adicionado ao resultado?'],pseudocode:['Crie uma string de saída vazia.','Leia cada caractere da primeira string.','Confira se ele existe na segunda.','Confira se ainda não está na saída.','Só adicione se as duas condições forem verdadeiras.','Retorne a saída sem ordenar seus caracteres.'],returnPlan:'Retorne uma string, inclusive vazia quando não há caracteres comuns.',question:{text:'Se l aparece duas vezes em s1, quantos l podem aparecer no resultado?',answer:'Só um. O subject pede caracteres comuns sem repetição.'}},
number_base_converter:{examples:[example(['101',2,10],'5','Lendo da esquerda: 0×2+1=1; 1×2+0=2; 2×2+1=5.'),example(['G',16,10],'ERROR','Na base 16, os dígitos vão de 0 a F. G não é válido.')],model:['Ler 101 na base 2: acumulador 0 → 1 → 2 → 5.','Escrever 5 na base 10: resto 5; quociente 0 → terminou.'],variables:vars([['digits','Alfabeto 0–9 e A–Z: a posição de cada caractere é seu valor.'],['value','Valor inteiro que foi lido até agora.'],['digit','Valor do caractere atual na base de origem.'],['result','Dígitos da base de destino, construídos da direita para a esquerda.']]),loop:'for lê os dígitos; while repete as divisões até value chegar a zero.',conditions:['As duas bases estão entre 2 e 36?','O dígito existe e é menor que a base de origem?','value é zero? Ainda há um quociente para converter?'],pseudocode:['Valide as bases e a presença de dígitos.','Comece o valor em zero.','Para cada dígito válido, multiplique pela base e some seu valor.','Trate zero como a string "0".','Enquanto houver valor, coloque o resto da divisão na frente da saída e divida pelo destino.','Retorne a string, ou ERROR para entradas inválidas.'],returnPlan:'O retorno é sempre string: até "5" e "ERROR" precisam de aspas.',question:{text:'Na expressão value = value * 2 + digit, por que multiplicar por 2?',answer:'Porque os dígitos já lidos ganham uma posição à esquerda na base 2, antes de entrar o novo dígito.'}},
pattern_tracker:{examples:[example(['123'],2,'Os pares 12 e 23 contam. O dígito 2 participa dos dois pares.'),example(['90'],0,'Não existe volta de 9 para 0. Zero não é uma unidade maior que nove.')],model:['Janela nos índices 0 e 1: 12 → total 1.','Avance uma posição: índices 1 e 2: 23 → total 2.'],variables:vars([['count','Quantidade de pares válidos encontrados.'],['i','Índice do primeiro caractere da janela.'],['first / second','Caracteres nos índices i e i+1.']]),loop:'for passa por todas as posições até a penúltima. A janela anda uma posição por vez.',conditions:['Os dois caracteres são dígitos ASCII?','O valor do segundo é exatamente um maior que o primeiro?'],pseudocode:['Comece o contador em zero.','Percorra os índices até o penúltimo.','Pegue o caractere atual e o vizinho da direita.','Se os dois forem dígitos e o segundo for +1, some um.','Continue uma posição adiante, sem pular pares sobrepostos.','Retorne o contador.'],returnPlan:'Retorne um inteiro. Sem pares válidos, o contador permanece zero.',question:{text:'Depois de contar 12 em 123, devo pular o 2?',answer:'Não. A próxima janela é 23; avançar duas posições perderia esse par.'}},
anagram:{examples:[example(['Dormitory','Dirty Room'],true,'Depois de ignorar caixa e espaços, os dois textos têm as mesmas quantidades de cada letra.'),example(['aa','a'],false,'A primeira string possui dois a; a segunda, apenas um. Ter a mesma letra não basta.')],model:['aab → estoque {a:2, b:1}.','aba → estoque {a:2, b:1}.','Mesmos estoques → True, apesar da ordem diferente.'],variables:vars([['counts(text)','Função auxiliar que conta os caracteres de um texto.'],['result','Dicionário que relaciona caractere e quantidade.'],['char','Caractere já convertido para minúsculo.']]),loop:'for percorre o texto em minúsculas. Cada caractere diferente de espaço aumenta sua contagem.',conditions:['O caractere é diferente de espaço ASCII?','Os dois dicionários de frequência são iguais?'],pseudocode:['Crie uma rotina de contagem com um dicionário vazio.','Leia os caracteres em minúsculas.','Ignore espaços e some uma ocorrência dos demais.','Conte cada entrada separadamente.','Compare os dois dicionários completos.'],returnPlan:'Retorne se as frequências são iguais. Duas strings vazias produzem dois dicionários vazios, portanto True.',question:{text:'Um conjunto com as letras distintas resolve aa versus a?',answer:'Não. Ambos viram {a}; o conjunto perde a quantidade. Um dicionário preserva a contagem.'}},
shadow_merge:{examples:[example([[1,1,3],[1,2]],[1,1,1,2,3],'Compare os próximos valores e copie o menor. As três ocorrências de 1 precisam continuar na saída.'),example([[],[2]],[2],'Se uma lista já está vazia, copie toda a outra.')],model:['[1,3] e [2,4] → copie 1; avance só na primeira.','Compare 3 com 2 → copie 2; avance só na segunda.','Depois de copiar 3, a sobra [4] entra no final.'],variables:vars([['i / j','Próximas posições ainda não consumidas de list1 e list2.'],['result','Lista de saída crescente.'],['list1 / list2','Entradas que já chegam ordenadas.']]),loop:'while compara enquanto as duas listas ainda têm itens. Depois, copie as sobras.',conditions:['i e j estão dentro de suas listas?','O próximo item da primeira lista é menor ou igual ao da segunda?'],pseudocode:['Crie a saída e coloque os dois índices em zero.','Enquanto houver itens nas duas listas, compare os próximos valores.','Copie o menor e avance só o índice dele.','Quando uma lista acabar, pare a comparação.','Copie o restante da primeira e da segunda lista.','Retorne a saída preservando repetições.'],returnPlan:'Retorne uma lista com exatamente a soma das quantidades de itens das duas entradas.',question:{text:'Se copiar um item da primeira lista, qual índice deve avançar?',answer:'Só i. O próximo item da segunda lista ainda não foi consumido.'}},
string_permutation_checker:{examples:[example(['Aa','aA'],true,'As duas strings têm um A e um a; a ordem pode mudar.'),example(['Aa','aa'],false,'A diferença entre A e a conta neste subject. As frequências não são iguais.')],model:['aab → estoque {a:2,b:1}.','Leia aba: consuma a, depois b, depois a.','Cada letra encontrou uma cópia disponível → True.'],variables:vars([['counts','Estoque de caracteres ainda disponíveis na primeira string.'],['char','Caractere que está sendo contado ou consumido.'],['s1 / s2','Textos comparados exatamente, incluindo caixa, espaços e pontuação.']]),loop:'Um for conta s1; outro for consome as ocorrências pedidas por s2.',conditions:['Os comprimentos são diferentes?','O caractere de s2 tem quantidade disponível maior que zero?'],pseudocode:['Se os comprimentos forem diferentes, falhe.','Conte todos os caracteres da primeira string.','Leia cada caractere da segunda.','Se ele não existir no estoque, ou já tiver acabado, falhe.','Consuma uma ocorrência disponível.','Se todos puderem ser consumidos, retorne True.'],returnPlan:'Não remova espaços nem converta caixa. True só para frequências exatas iguais.',question:{text:'Posso usar a normalização do exercício anagram aqui?',answer:'Não. Em string_permutation_checker, caixa, espaços e pontuação contam como caracteres.'}},
string_sculptor:{examples:[example(['Hello World'],'hElLo WoRlD','Só letras avançam o contador. O espaço mantém a contagem: a sexta letra é W maiúsculo.'),example(['abc123def'],'aBc123DeF','Os números são copiados sem contar. d é a quarta letra, então fica maiúsculo.')],model:['a: contador 0 → minúsculo.','b: contador 1 → maiúsculo.','1,2,3: copie sem avançar o contador.','A próxima letra continua a alternância.'],variables:vars([['result','Texto de saída construído até agora.'],['index','Quantidade de letras já tratadas, independente da posição no texto.'],['char','Caractere atual da entrada.']]),loop:'for lê todos os caracteres; o contador só aumenta no caminho das letras.',conditions:['O caractere é alfabético?','O contador de letras é par ou ímpar?'],pseudocode:['Crie uma saída vazia e um contador de letras em zero.','Leia cada caractere.','Se for letra, aplique minúscula nos índices pares e maiúscula nos ímpares.','Aumente o contador somente depois de tratar uma letra.','Se não for letra, copie sem alterar a contagem.','Retorne a saída.'],returnPlan:'Retorne uma nova string. Na versão padrão, espaços também não reiniciam a contagem.',question:{text:'Em abc123def, os números mudam a caixa de d?',answer:'Não. Eles não entram na contagem. d continua sendo a quarta letra, em maiúsculo.'}},
twist_sequence:{examples:[example([[1,2,3,4,5],2],[4,5,1,2,3],'Os dois últimos itens, 4 e 5, vão para a frente na mesma ordem.'),example([[1,2,3],5],[2,3,1],'Uma volta completa usa três posições. Sobram duas: 5 % 3 = 2.')],model:['[1,2,3,4,5] → uma posição: [5,1,2,3,4].','Mais uma posição: [4,5,1,2,3].'],variables:vars([['arr','Lista recebida; sua ordem original serve de referência.'],['k','Quantidade de posições, reduzida pelo tamanho da lista.'],['i','Posição que está sendo preenchida na saída.'],['result','Nova lista rotacionada.']]),loop:'for percorre as posições de saída. Cada índice busca seu elemento de origem na lista circular.',conditions:['A lista é vazia?','De qual posição (i − k) % tamanho vem o item atual?'],pseudocode:['Se a lista for vazia, devolva [].','Reduza k pelo resto da divisão pelo tamanho.','Crie uma lista nova.','Para cada posição i da saída, calcule a origem circular i − k.','Copie o item dessa origem.','Retorne a nova lista.'],returnPlan:'Retorne uma lista, inclusive quando k é zero ou maior que o tamanho.',question:{text:'Uma lista de 3 itens muda depois de uma rotação de 3 posições?',answer:'Não. É uma volta completa; o deslocamento efetivo é zero.'}},
whisper_cipher:{examples:[example(['Zz!',1],'Aa!','Z e z dão a volta no alfabeto. A caixa é preservada; ! fica igual.'),example(['abc',-3],'xyz','Um deslocamento negativo anda para trás, com volta antes de a.')],model:['x ocupa a posição 23.','23 + 3 = 26 → 26 % 26 = 0 → a.','Pontuação é copiada sem mudar.'],variables:vars([['base','Código de A ou a, para preservar a caixa.'],['position','Posição da letra no alfabeto, de 0 a 25.'],['shift','Deslocamento informado, que pode ser negativo.'],['result','Texto cifrado construído até agora.']]),loop:'for trata um caractere por vez; continue pula o cálculo para símbolos e números.',conditions:['A letra está entre a e z?','Está entre A e Z?','Se não estiver em nenhum intervalo, copie sem deslocar.'],pseudocode:['Crie a saída vazia.','Para cada caractere, escolha o alfabeto maiúsculo ou minúsculo.','Se for símbolo, copie e vá para o próximo caractere.','Calcule a posição de 0 a 25.','Some o deslocamento e aplique módulo 26.','Transforme a posição de volta em letra e retorne o texto.'],returnPlan:'Retorne uma string mantendo a caixa e os caracteres fora de A–Z/a–z.',question:{text:'Por que usar % 26 ao somar o deslocamento?',answer:'O alfabeto tem 26 posições. O módulo mantém o resultado entre 0 e 25, inclusive quando o deslocamento é negativo.'}}
};

export function getEducation(e:Exercise):Education{
 const base=lessons[e.name];if(!base)throw Error('Conteúdo didático ausente: '+e.name);
 const value:Education={...base,goal:e.summary,strategy:e.strategy};
 if(e.id==='cryptic_sorter_xornic')return {...value,examples:[example([['bbb','aaa','AAA']],['AAA','aaa','bbb'],'Nesta variante comunitária, o texto original desempata. A maiúscula vem antes da minúscula em ASCII.')],model:['Compare comprimento, texto sem caixa e vogais.','Se ainda empatar, compare o texto original: AAA < aaa.'],conditions:[...base.conditions,'A chave desta variante possui um quarto item: o texto original.'],pseudocode:base.pseudocode.map(s=>s.includes('Defina uma chave')?'Defina a chave: tamanho, minúsculas, vogais e texto original.':s),returnPlan:'Retorne a lista com o desempate pelo texto original. A proibição de sorted do subject padrão não é atribuída a esta solução comunitária.',question:{text:'AAA e aaa empatam nesta variante?',answer:'Não no último critério: o texto original desempata, e AAA vem antes de aaa.'}};
 if(e.id==='string_sculptor_examshell')return {...value,examples:[example(['Hello World'],'hElLo wOrLd','O espaço reinicia o contador nesta versão; a primeira letra de World volta a ser minúscula.'),base.examples[1]],model:[...base.model,'Se encontrar espaço ASCII, reinicie o contador em zero.'],conditions:[...base.conditions,'O caractere atual é espaço ASCII? Se sim, zere o contador.'],pseudocode:base.pseudocode.map(s=>s.startsWith('Se não for letra')?'Se não for letra, copie; se for espaço ASCII, reinicie o contador.':s),returnPlan:'Retorne a nova string. Nesta variante, espaço ASCII reinicia a alternância.',question:{text:'Depois do espaço em Hello World, qual é a caixa de w?',answer:'Minúscula. A versão examshell 0.1.12 reinicia o contador no espaço.'}};
 return value;
}
export const teachingCall=(e:Exercise,index=0)=>makeCall(e.name,getEducation(e).examples[index].args);

const n=(text:string,example?:LineNote['example'],parts?:LineNote['parts']):LineNote=>({text,example,parts});
const change=(before:string,operation:string,after:string,value?:string)=>({before,operation,after,value});
const notes:Record<string,LineNote[]>={
bracket_validator:[
n('Define uma função que recebe a string s e devolve um booleano: True ou False. A anotação indica os tipos esperados; ela não converte os valores.'),
n('Cria a lista stack vazia. Ela vai guardar somente as aberturas que ainda não foram fechadas.',change('não havia stack','stack = []','stack: []')),
n('Cria um dicionário: cada fechamento é uma chave e sua abertura correspondente é o valor. pairs["]"] devolve "[".'),
n('O for lê s da esquerda para a direita. char recebe um caractere diferente em cada repetição.',change('s: "([])"','for char in s','char: "(", depois "[", "]", ")"'),[{token:'for',meaning:'Inicia uma repetição.'},{token:'char',meaning:'Variável que recebe o caractere desta rodada.'},{token:'in s',meaning:'Os valores vêm da string s.'}]),
n('Confere se char é uma das três aberturas. Um caractere como a não entra neste bloco.'),
n('Adiciona a abertura atual ao final da pilha. A abertura mais recente passa a ser o topo.',change('["("]','append("[")','["(", "["]','append retorna None; a mudança ocorre na lista.')),
n('Se não era abertura, confere se char é uma chave de pairs, ou seja, um fechamento conhecido.'),
n('Falha se não existe uma abertura, ou se o topo removido é diferente do par exigido pelo fechamento. O or evita chamar pop() quando a pilha está vazia.',change('["(", "["] e char = "]"','not stack or stack.pop() != pairs[char]','stack: ["("]; condição False','pop devolveu "["'),[{token:'not stack',meaning:'É True quando a lista está vazia.'},{token:'or',meaning:'Se a esquerda já for True, a direita não é executada: curto-circuito.'},{token:'stack.pop()',meaning:'Remove e devolve o último item. Só é avaliado quando a pilha não está vazia.'},{token:'pairs[char]',meaning:'Busca a abertura esperada para este fechamento.'},{token:'!=',meaning:'Pergunta se os dois símbolos são diferentes.'}]),
n('Encerra a função com False assim que o fechamento é inválido. As próximas letras nem precisam ser lidas.'),
n('Depois do loop, verifica se restou alguma abertura. len(stack) é a quantidade de itens; comparar com zero produz o bool retornado.',change('stack: []','len(stack) == 0','True'))],
cryptic_sorter:[
n('Recebe uma lista de strings e devolve outra lista de strings ordenada pelos critérios desta versão.'),
n('Cria result vazia. Cada palavra será inserida nela sem usar sorted nem .sort.'),
n('Define key como função auxiliar: ela recebe uma palavra e calcula os valores usados na comparação.'),
n('Converte a palavra para minúsculas e soma 1 para cada caractere em aeiou. Consoantes e símbolos não somam.',change('word: "Apple"','contar a, e','vowels: 2')),
n('Devolve uma tupla. Python compara o primeiro item; só consulta o seguinte se houver empate. No padrão: tamanho, texto sem caixa, vogais.'),
n('Escolhe cada palavra da entrada, mantendo a ordem em que ela chegou.'),
n('Começa a busca no final da saída. i representa a posição onde a nova palavra pode entrar.',change('result: ["aaa", "bbb"]','i = len(result)','i: 2')),
n('Enquanto houver uma palavra à esquerda e a chave nova for menor, ainda precisamos recuar. O and evita acessar i−1 quando i é zero.'),
n('Recua uma posição na saída. Não remove nenhuma palavra: apenas muda o índice candidato.',change('i: 2','i -= 1','i: 1')),
n('Insere word na posição i e desloca os itens seguintes. Nos empates da versão padrão, a comparação estrita mantém a ordem de chegada.'),
n('Retorna a lista que foi construída por inserção.')],
echo_validator:[
n('Recebe text e devolve um bool que indica se as letras formam um palíndromo.'),
n('Cria uma string vazia para acumular só as letras em minúsculas.'),
n('Lê um caractere de text por repetição; símbolos também são lidos, mas podem ser ignorados.'),
n('isalpha() devolve se o caractere é uma letra. Nos testes locais extras, usamos ASCII.'),
n('Converte a letra atual para minúscula e concatena à string letters.',change('letters: "a"; char: "B"','letters += char.lower()','letters: "ab"')),
n('Pergunta se a filtragem não encontrou nenhuma letra. not de uma string vazia é True.'),
n('Retorna False para ausência de letras, seguindo o exemplo público vazio e a convenção local documentada.'),
n('Cria dois índices: left começa em zero e right no último caractere de letters.',change('letters: "aba"','left, right = 0, len(letters) - 1','left: 0; right: 2')),
n('Compara as pontas enquanto elas não se encontraram nem se cruzaram.'),
n('Lê a letra em cada índice e testa se são diferentes. Uma diferença já prova que não é palíndromo.'),
n('Sai com False no primeiro par diferente; os demais pares não precisam ser testados.'),
n('Move o índice da esquerda uma posição em direção ao centro.',change('left: 0','left += 1','left: 1')),
n('Move o índice da direita uma posição em direção ao centro.',change('right: 2','right -= 1','right: 1')),
n('Se chegou aqui, todos os pares comparados eram iguais. Retorna True.')],
mirror_matrix:[
n('Recebe uma lista de linhas de inteiros e devolve uma matriz espelhada.'),
n('Cria a matriz externa de saída, separada da recebida.'),
n('row recebe uma linha original por repetição. A ordem das linhas não muda.'),
n('Cria uma lista vazia para copiar a linha atual ao contrário.'),
n('range começa no último índice, para antes de −1 e anda de −1 em −1. Assim visita até o índice zero.',change('row: [1,2,3]','range(2, -1, -1)','índices: 2, 1, 0')),
n('Lê o valor row[i] e adiciona ao final da linha nova. A linha original não é alterada.',change('mirrored: []; i: 2','append(row[2])','mirrored: [3]')),
n('Adiciona a linha já invertida à matriz de saída. O próximo ciclo começa outra linha vazia.'),
n('Devolve a nova matriz. Não devolve a própria lista externa matrix.')],
hidenp:[
n('Define o hidenp Python: small e big são strings; o retorno é bool. Este não é o programa de linha de comando em C.'),
n('i começa em zero: precisamos primeiro da letra small[0]. Também representa quantas letras já foram encontradas.'),
n('Percorre big uma vez. char recebe o próximo caractere da string maior.'),
n('Só acessa small[i] se i ainda estiver dentro da string. O and para a avaliação se a primeira condição for False.',undefined,[{token:'i < len(small)',meaning:'Ainda há uma letra pendente; evita índice fora do limite.'},{token:'and',meaning:'A comparação seguinte só ocorre se a condição anterior for True.'},{token:'small[i] == char',meaning:'Compara exatamente, preservando maiúsculas e minúsculas.'}]),
n('Uma letra esperada foi encontrada. Avança para a próxima letra de small.',change('small: "abc"; i: 0; char: "a"','i += 1','i: 1; próxima letra: "b"')),
n('Retorna se o total encontrado é igual ao tamanho de small. Para small vazia, 0 == 0 é True.')],
inter:[
n('Recebe duas strings e devolve os caracteres comuns como uma string sem repetições.'),
n('Cria result vazia. Além de guardar a saída, ela informa quais caracteres já foram usados.'),
n('Percorre s1 para preservar exatamente a ordem da primeira entrada.'),
n('As duas exigências precisam ser verdadeiras: estar em s2 e ainda não estar em result. Se não estiver em s2, o and nem testa a segunda parte.'),
n('Concatena o caractere comum que ainda não foi usado.',change('result: "l"; char: "o"','result += char','result: "lo"')),
n('Entrega a string acumulada, inclusive vazia se não houver interseção.')],
number_base_converter:[
n('Recebe o número como texto, a base de origem e a base de destino. O retorno também é texto.'),
n('Guarda os 36 símbolos permitidos. A posição de A é 10 e a de Z é 35.'),
n('Rejeita bases fora de 2–36 ou texto vazio. Cada or só avalia a próxima parte se ainda não encontrou um motivo para rejeitar.'),
n('Encerra com a string ERROR ao detectar uma dessas entradas inválidas.'),
n('Começa o valor posicional em zero, antes de ler qualquer dígito.'),
n('Lê cada símbolo do número da esquerda para a direita.'),
n('find devolve a posição do símbolo em digits; devolve −1 se não encontrar.',change('char: "F"','digits.find(char)','digit: 15')),
n('Um símbolo ausente ou com valor maior/igual à base não é um dígito válido nessa base.'),
n('Retorna ERROR para esse dígito inválido, sem continuar a conversão.'),
n('Multiplica o valor já lido pela base e adiciona o novo dígito.',change('value: 2; from_base: 2; digit: 1','value * from_base + digit','value: 5')),
n('Confere se o valor inteiro é zero. Sem este caso, o while abaixo não produziria nenhum dígito.'),
n('Devolve a string "0", e não o inteiro 0.'),
n('Cria uma string vazia para os dígitos na base de destino.'),
n('Continua enquanto value não for zero. Em Python, um inteiro zero tem valor booleano False.'),
n('O resto escolhe o próximo dígito. Ele é colocado na frente porque os restos saem do menos significativo para o mais significativo.',change('value: 10; to_base: 2; result: ""','digits[10 % 2] + result','result: "0"')),
n('Descarta a parte já convertida por divisão inteira. // não produz a parte fracionária.',change('value: 10; to_base: 2','value //= to_base','value: 5')),
n('Retorna a string completa na base de destino.')],
pattern_tracker:[
n('Recebe o texto e devolve um inteiro com o número de pares adjacentes válidos.'),
n('Inicializa o total em zero. Cada par válido somará uma unidade.'),
n('Visita de zero até o penúltimo índice, para que i+1 sempre exista. O passo padrão é um.'),
n('Lê os dois caracteres vizinhos. first é text[i]; second é text[i+1].'),
n('Só entra se ambos forem dígitos ASCII. Símbolos não são removidos, pois isso alteraria quem é vizinho.'),
n('ord fornece o código do caractere. Os dígitos ASCII estão em sequência; por isso diferença +1 indica 12, 23 etc. 90 não passa.'),
n('Acrescenta um ao contador. O for seguirá só uma posição adiante, permitindo sobreposição.',change('text: "123"; count: 1; par: "23"','count += 1','count: 2')),
n('Retorna o total acumulado. Texto com zero ou um caractere produz zero.')],
anagram:[
n('Define a comparação que ignora caixa e espaços; o resultado é bool.'),
n('Define uma função auxiliar de contagem. Ela será chamada uma vez para cada texto.'),
n('Cria um dicionário novo em cada chamada da contagem, evitando misturar os dois estoques.'),
n('Converte o texto para minúsculas e lê um caractere por vez.'),
n('Pula apenas o espaço ASCII. Não aplica a regra de filtragem de letras do echo_validator.'),
n('get(char, 0) lê a quantidade anterior ou zero quando a chave ainda não existe. Somar um registra a nova ocorrência.',change('result: {"a":1}; char: "a"','result[char] = result.get(char,0) + 1','result: {"a":2}')),
n('Termina a rotina auxiliar e devolve o dicionário de frequências do texto recebido.'),
n('Conta os dois textos separadamente e compara os dicionários. A ordem das chaves não importa, mas os valores precisam ser iguais.')],
shadow_merge:[
n('Recebe duas listas de inteiros já ordenadas e retorna uma lista com todos os valores.'),
n('Cria result como uma lista vazia. Ela receberá, em ordem, os itens consumidos das duas entradas.'),
n('Os dois índices começam no primeiro item de cada entrada.'),
n('Só compara enquanto ambos os índices estão dentro de suas listas. O and evita continuar quando uma já acabou.'),
n('Compara os próximos valores. Em empate, copia o da primeira lista; nenhuma ocorrência é descartada.'),
n('Acrescenta o próximo valor da primeira lista à saída.',change('list1: [1,3]; i:0; result:[]','result.append(list1[i])','result:[1]')),
n('Consome somente o item da primeira lista. j fica no mesmo lugar.'),
n('Este caminho é escolhido quando o próximo valor da segunda lista é menor.'),
n('Copia o valor da segunda lista sem mudar a primeira.'),
n('Avança só j, pois foi a segunda lista que forneceu o último item.'),
n('A fatia list1[i:] contém todos os itens ainda não consumidos. extend adiciona cada item, sem criar uma lista dentro da saída.'),
n('Faz o mesmo com a sobra de list2. Uma das duas sobras pode estar vazia.'),
n('Retorna a mescla completa, com duplicatas e negativos preservados.')],
string_permutation_checker:[
n('Define a comparação exata de caracteres. Diferente de anagram, não normaliza espaços nem caixa.'),
n('Compara os tamanhos. Se forem diferentes, as quantidades totais já impedem uma permutação.'),
n('Sai com False sem contar nada, porque o tamanho já não confere.'),
n('Cria o estoque de caracteres da primeira string.'),
n('Visita cada ocorrência de s1, inclusive espaços e letras maiúsculas.'),
n('Soma uma ocorrência ao estoque desse caractere.',change('counts: {}; char:"a"','counts[char] = counts.get(char,0) + 1','counts: {"a":1}')),
n('Percorre s2 para consumir as ocorrências disponíveis.'),
n('Uma chave ausente usa zero; uma chave já consumida também pode valer zero. Nos dois casos, não há cópia disponível.'),
n('Retorna False ao encontrar um caractere sem estoque.'),
n('Subtrai uma ocorrência do caractere que acabou de ser atendido.',change('counts:{"a":2}; char:"a"','counts[char] -= 1','counts:{"a":1}')),
n('Como os comprimentos eram iguais e cada caractere consumiu uma ocorrência, os estoques correspondem. Retorna True.')],
string_sculptor:[
n('Recebe text e devolve uma nova string com alternância de caixa nas letras.'),
n('Começa a saída vazia; strings não são alteradas por índice nesta referência.'),
n('index conta letras tratadas, não todos os caracteres. Zero representa a primeira letra.'),
n('Percorre todos os caracteres, incluindo números, espaços e pontuação.'),
n('Escolhe o caminho das letras. Nos exemplos extras usamos ASCII, sem impor um contrato Unicode não confirmado.'),
n('A expressão condicional escolhe minúscula quando o contador é par, e maiúscula quando é ímpar. Só um dos dois ramos é executado.',change('index:1; char:"b"; result:"a"','index % 2 == 0 é False','result:"aB"'),[{token:'index % 2',meaning:'Resto da divisão por dois: 0 para par, 1 para ímpar.'},{token:'A if condição else B',meaning:'Calcula A quando a condição é True; caso contrário, calcula B.'}]),
n('Avança o contador depois de tratar uma letra. Este incremento não acontece para números ou símbolos.'),
n('Segue o caminho dos caracteres não alfabéticos.'),
n('Copia o caractere sem mudar sua forma nem o contador na versão padrão.'),
n('Retorna a string construída. O texto de entrada permanece igual.')],
twist_sequence:[
n('Recebe uma lista e uma quantidade de posições para girar à direita.'),
n('Uma lista vazia tem valor booleano False; not arr fica True.'),
n('Retorna [] antes de dividir pelo tamanho, evitando módulo por zero.'),
n('Reduz o deslocamento às posições que sobram depois de voltas completas.',change('k:5; len(arr):3','k %= len(arr)','k:2')),
n('Cria uma lista nova para a saída.'),
n('i visita cada posição que precisa ser preenchida, de zero até o último índice.'),
n('Para a posição i da saída, busca a posição de origem i−k, com volta circular pelo módulo.',change('arr:[1,2,3,4,5]; k:2; i:0','arr[(0 - 2) % 5]','result recebe 4','(−2) % 5 é 3 em Python.')),
n('Devolve a nova lista com os itens deslocados para a direita.')],
whisper_cipher:[
n('Recebe o texto e um deslocamento inteiro; devolve o texto cifrado.'),
n('Inicializa uma nova string para o resultado.'),
n('Lê cada caractere sem alterar o texto original.'),
n('Compara o caractere com os limites minúsculos de a até z. As comparações encadeadas exigem os dois limites.'),
n('Escolhe o código de a como base, para reconstruir uma letra minúscula.'),
n('Se não era minúscula, testa o intervalo maiúsculo A até Z.'),
n('Escolhe o código de A como base, preservando maiúsculas.'),
n('Um caractere que não está em nenhum dos dois alfabetos segue este caminho.'),
n('Copia o símbolo ou número exatamente como chegou.',change('result:"Aa"; char:"!"','result += char','result:"Aa!"')),
n('continue pula o resto desta rodada e vai ao próximo caractere. Assim, símbolos não usam uma base inexistente.'),
n('Subtrai a base do código da letra, obtendo uma posição entre 0 e 25.',change('char:"z"; base:97','ord(char) - base','position:25')),
n('Soma shift à posição, aplica %26, soma a base e usa chr para voltar a um caractere. O módulo em Python dá a volta também com shift negativo.',change('char:"z"; shift:1','chr(97 + (25+1) % 26)','result recebe "a"')),
n('Retorna o texto cifrado completo, incluindo os símbolos preservados.')]
};

export function getLineNotes(e:Exercise):{line:number;code:string;note:LineNote}[]{
 let rows=notes[e.name];
 if(e.id==='cryptic_sorter_xornic')rows=rows.map((note,i)=>i===4?n('Devolve a chave com quatro critérios: tamanho, texto sem caixa, vogais e texto original. O último item distingue AAA de aaa.'):i===9?n('Insere na posição encontrada pela chave desta variante, que desempata pelo texto original.'):note);
 if(e.id==='string_sculptor_examshell')rows=[...rows.slice(0,2),n('Conta letras desde o último espaço ASCII nesta variante.'),...rows.slice(3,8),n('Confere se o caractere não alfabético atual é espaço ASCII.'),n('Zera o contador: a próxima letra volta a minúscula.',change('index:5; char:" "','index = 0','index:0')),n('Copia o símbolo, espaço ou número sem alterar sua forma.'),rows[9]];
 const lines=e.solution.trimEnd().split('\n');
 if(rows.length!==lines.length)throw Error(`Explicações desalinhadas em ${e.id}: ${rows.length} para ${lines.length} linhas.`);
 return lines.map((code,i)=>({line:i+1,code,note:rows[i]}));
}
