# Distribuir o 42 Examark para Windows

Versão: 1.4.1 · Windows 10/11 de 64 bits (Intel/AMD x64).

## Qual arquivo enviar

- **Portátil:** `release/42-Examark-1.4.1-Windows-x64-Portatil.exe`. Envie esse arquivo. O outro estudante abre com dois cliques; não precisa instalar Node.js, Python, navegador separado nem baixar bibliotecas.
- **Instalador:** `release/42-Examark-1.4.1-Windows-x64-Instalador.exe`. Para quem prefere instalar e ter atalhos no menu Iniciar e na área de trabalho. A instalação é por usuário.

Não é necessário enviar o código-fonte, node_modules, iniciar.bat ou a pasta win-unpacked. O uso não exige cadastro.

## Uso offline

Os pacotes incluem a interface, os 14 exercícios, variantes, CodeMirror, Pyodide/CPython, Chromium e fontes tipográficas. Estudar, executar e corrigir não requerem internet. Os links para consultar as fontes externas precisam de internet e abrem no navegador padrão.

## Levar o progresso

O portátil cria **42 Exam Trainer Dados** ao lado do executável. Feche o aplicativo antes de copiar essa pasta para outro computador. Para enviar uma cópia limpa a outra pessoa, envie apenas o `.exe`, sem a pasta de dados.

Se o local do portátil estiver protegido contra gravação, o aplicativo avisa e usa o perfil do usuário do Windows. O menu **Arquivo → Abrir pasta do progresso** mostra a localização efetiva.

Na versão instalada, cada usuário do Windows possui seu próprio perfil. Para transferir entre navegador, versão instalada e portátil, use **Exportar JSON** e **Importar JSON** nas configurações.

O desinstalador não foi configurado para apagar os dados de estudo. Mesmo assim, exporte seu JSON antes de reinstalar, trocar de computador ou remover arquivos manualmente.

## Compatibilidade e assinatura

Estes pacotes são para Windows x64. Não são executáveis para macOS/Linux, Windows de 32 bits ou um pacote ARM64 nativo. Foram construídos e verificados no Windows 10 x64; não há garantia de execução em todo computador ou em políticas corporativas restritivas.

Os executáveis estão sem certificado de assinatura digital. O Windows pode mostrar “editor desconhecido”. A distribuição assinada exigiria um certificado próprio; não foi usado certificado de terceiros.

## Recriar os pacotes

```powershell
npm install
npm test
npm run test:python
npm run test:desktop
npm run release:windows
```

A primeira geração baixa binários oficiais do Electron e as ferramentas de criação do instalador. A distribuição final não inclui dependências de build, perfis pessoais ou dados de QA. As licenças dos componentes ficam no pacote.

Os subjects continuam comunitários e não oficiais. A separação entre Python Rank 03 e C Rank 02 e as divergências auditadas permanecem as mesmas da versão web.
