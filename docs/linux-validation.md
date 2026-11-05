# Validação da distribuição Linux — 1.3.1

Data: 05/11/2026. [Workflow concluído com sucesso](https://github.com/MarcWav/42-Examark/actions/runs/42020774284). [Release publicada](https://github.com/MarcWav/42-Examark/releases/tag/v1.3.1).

## Execução real

Em Ubuntu 22.04 x64 no GitHub Actions:

- 27 testes automatizados aprovados, incluindo persistência portátil AppImage/tar e compatibilidade com o perfil Windows.
- 949/949 casos das referências Python aprovados; algoritmos errados e memorizadores de exemplos reprovados.
- 127 rastreamentos, 3.457 eventos e 12 verificações didáticas aprovados.
- No Electron real com display virtual: 949/949 casos, 949 resultados transmitidos e 31 exemplos didáticos rastreados; armazenamento IndexedDB disponível, renderer sem Node e worker recuperado após loop infinito. Nove verificações aprovadas e nenhum erro de console registrado. [Relatório Linux](linux-desktop-validation.json).
- O **AppImage final x64** foi extraído/inspecionado e aberto pelo próprio runtime no modo extract-and-run, que dispensa FUSE. A versão tar.gz foi extraída e aberta pelo launcher. Ambos carregaram o armazenamento da interface em **42 Exam Trainer Dados** e permaneceram em execução até o encerramento controlado do teste. [Relatório dos pacotes](linux-package-smoke.json).

O Windows também executou as nove verificações desktop e os 949 casos antes do empacotamento.

## Pacotes e publicação

Foram gerados AppImage e tar.gz para Linux x64 e ARM64, além de portátil e instalador Windows x64. O workflow só publica depois de todas as etapas anteriores passarem.

Os quatro binários Linux tiveram formato ELF/arquitetura, runtime Python, licenças, launcher, marcador portátil e ausência de perfis/código de QA verificados. Os hashes dos seis downloads foram conferidos depois da publicação. Relatórios: [x64](linux-release-x64.json), [ARM64](linux-release-arm64.json), [Windows](windows-release.json).

O AppImage usa um AppRun próprio e argumentos de desktop vazios para preservar o sandbox. O teste inspeciona o AppRun efetivamente empacotado. Não foram alteradas proteções do sistema ou acrescentado --no-sandbox para executar os testes.

O código-fonte foi publicado sem node_modules, backups, dados pessoais ou perfis locais. Os executáveis ficam em Releases.

## Limites

A execução Linux foi validada em Ubuntu 22.04 x64, em ambiente automatizado com display virtual. Não houve teste físico em outra distribuição ou máquina ARM64; os pacotes ARM64 tiveram inspeção de estrutura/arquitetura. A distribuição precisa ter glibc e bibliotecas gráficas compatíveis e permitir o sandbox. AppImage exige permissão de execução e normalmente FUSE; o tar.gz dispensa FUSE.

Os arquivos Windows continuam sem certificado digital. As versões antigas locais foram preservadas. O [guia Linux](distribuicao-linux.md) explica qual pacote escolher e como transportar o progresso.
