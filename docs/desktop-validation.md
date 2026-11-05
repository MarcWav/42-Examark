# Validação da distribuição Windows 1.1.0

Registro histórico da versão 1.1.0. A validação atual da versão 1.2.0 está em [learning-upgrade-validation.md](learning-upgrade-validation.md); os relatórios JSON e a captura abaixo são regenerados pelas verificações atuais.

Data: 04/11/2026. Sistema usado: Windows 10 x64. Electron 45.2.2 e electron-builder 26.18.0.

- Build TypeScript/Vite concluído com fontes e runtime locais.
- 12 testes automatizados de catálogo, estado, estatísticas e protocolo desktop passaram.
- Dentro do Electron real, a interface de produção abriu em `trainer://app`, carregou Python e executou **949/949 casos** dos 14 exercícios e das duas variantes. O relatório está em [desktop-validation.json](desktop-validation.json).
- O renderer não expõe `require`/`process`; Node integration fica desativado, com context isolation e sandbox habilitados. Não foi desativado o sandbox para fazer o aplicativo funcionar.
- LocalStorage funcionou no protocolo estável do aplicativo. Um worker com loop infinito foi encerrado e outro executou a referência com sucesso.
- O renderer não registrou erros no teste automatizado. Uma captura da interface do Electron está em [desktop-validation.png](desktop-validation.png).
- O portátil final foi copiado para `.cache/portable-smoke` e aberto. A janela expôs os 14 exercícios, o editor e o status **Python 3.12 · pronto**. A pasta `42 Exam Trainer Dados` foi criada ao lado da cópia de teste.
- A captura nativa de janela pelo controle do computador expirou; a validação visual nativa ficou limitada à árvore de acessibilidade. A execução de todas as referências foi validada separadamente no renderer real do Electron.
- O instalador NSIS foi gerado com sucesso, com instalação por usuário e atalhos. Não foi feita uma instalação completa que alterasse os aplicativos registrados deste computador.
- O arquivo app.asar foi inspecionado: 61 entradas, sem node_modules, código de QA, perfis ou progresso pessoal. Inclui os arquivos WASM, biblioteca padrão Python e licenças.
- Pacotes finais: portátil com 131.422.668 bytes e instalador com 135.983.998 bytes. Checksums em `release/SHA256SUMS.txt`; metadados em [windows-release.json](windows-release.json).
- Os pacotes não estão assinados com certificado digital. O uso em outros PCs e no Windows 11 não foi testado fisicamente; a distribuição mira Windows 10/11 x64 suportado pelo Electron.

A versão web permanece disponível pelo fluxo npm/iniciar.bat. Seu progresso não é importado automaticamente para o desktop: use o JSON.
