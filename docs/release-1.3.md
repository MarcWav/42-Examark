# 42 Exam Trainer 1.3.1

Versão portátil para Linux, mantendo as melhorias didáticas da versão 1.2.

## Downloads

- **Windows x64:** Portatil.exe (sem instalação) ou Instalador.exe.
- **Linux x64:** AppImage (arquivo único) ou tar.gz (extraia e execute iniciar.sh, sem FUSE).
- **Linux ARM64:** AppImage ou tar.gz. Confira sua arquitetura com `uname -m`.

Os pacotes incluem Python e funcionam offline. Compartilhe apenas o pacote original para que outra pessoa comece com dados vazios. O progresso portátil fica em **42 Exam Trainer Dados** ao lado do AppImage/EXE ou dentro da pasta extraída.

## Mantido

14 exercícios de Python Rank 03 e duas variantes, editor, dicas em quatro etapas, solução explicada linha por linha, visualizações reais da referência, testes locais detalhados, histórico e simulados. Os subjects em C do Rank 02 permanecem separados.

## Verificação e limites

A publicação depende dos testes de catálogo/progresso, dos 949 casos Python, dos rastreamentos didáticos e do teste desktop em Linux x64; o Windows também passa pelo teste desktop. Os pacotes têm sua estrutura e arquitetura verificadas antes de publicar. ARM64 é empacotado e inspecionado, sem teste de execução em hardware ARM nesta release.

Compatível com desktops Linux atuais com glibc e bibliotecas gráficas adequadas, na arquitetura correta. O teste automatizado usa Ubuntu 22.04 x64. Não é uma promessa de execução em toda distribuição; Alpine/musl, sistemas antigos e políticas que bloqueiem o sandbox podem exigir adaptação. O tar.gz não requer FUSE. Os binários Windows não possuem certificado digital.

Os testes são de treinamento, não testes privados oficiais da 42. Consulte o guia Linux no repositório e o manifesto SHA256SUMS.txt desta release.
