# Linux portátil — 1.4.1

Baixe os arquivos em [Releases](https://github.com/MarcWav/42-Examark/releases/latest). O aplicativo inclui Chromium, Python/Pyodide, exercícios e fontes; estudar e corrigir funcionam offline.

## Escolher a arquitetura

Execute `uname -m` no terminal:
- `x86_64`: baixe **Linux-x64** (PCs Intel/AMD de 64 bits).
- `aarch64` ou `arm64`: baixe **Linux-arm64** (Linux ARM de 64 bits).

Os binários ARM64 são empacotados e inspecionados, mas o teste de execução desta release usa Linux x64. Eles não são para ARM de 32 bits.

## AppImage: arquivo único

Depois de baixar:

```sh
chmod +x 42-Examark-1.4.1-Linux-x64-Portatil.AppImage
./42-Examark-1.4.1-Linux-x64-Portatil.AppImage
```

Para ARM64, use o nome do arquivo ARM64. Não use sudo.

## tar.gz: opção sem FUSE

Se a distribuição não tiver FUSE compatível com AppImage, prefira o arquivo `.tar.gz`. Extraia pelo gerenciador de arquivos e abra `iniciar.sh`, ou use:

```sh
tar -xzf 42-Examark-1.4.1-Linux-x64-Portatil.tar.gz
cd 42-Examark-1.4.1-Linux-x64-Portatil
./iniciar.sh
```

O nome da pasta extraída pode ser consultado com `tar -tzf arquivo.tar.gz`. Mantenha todos os arquivos da pasta juntos; enviar apenas o launcher não é suficiente.

## Progresso portátil

A pasta **42 Exam Trainer Dados** é criada ao lado do AppImage ou dentro da pasta extraída. Feche o app antes de transportar os arquivos e essa pasta. Para compartilhar uma cópia limpa, compartilhe somente o AppImage ou o tar.gz original.

Se esse local não permitir gravação, o app avisa e usa o perfil do usuário do sistema. **Arquivo → Abrir pasta do progresso** mostra a localização efetiva. Use Exportar/Importar JSON para transferir progresso entre Windows, Linux e navegador.

## Compatibilidade real

Nenhum binário Electron funciona literalmente em toda distribuição Linux. Estes pacotes destinam-se a desktops Linux atuais com **glibc**, GTK/NSS, áudio e bibliotecas gráficas compatíveis, na arquitetura escolhida. A verificação automatizada de execução usa **Ubuntu 22.04 x64**, display virtual, renderer com sandbox e Python real no worker.

Alpine/musl, sistemas antigos, Linux sem ambiente gráfico e distribuições com configuração especial como NixOS podem exigir adaptação e não estão cobertos pela promessa de execução direta. A política do sistema também precisa permitir o sandbox do Chromium. O programa não desativa essa proteção.

A alternativa tar.gz elimina a dependência de FUSE; não elimina as bibliotecas do sistema ou diferenças de arquitetura. O AppImage e o tar.gz não instalam Node.js nem Python no computador.

## Recriar e validar

Em Linux com Node.js 22 e as dependências gráficas do Electron:

```sh
npm ci
npm test
npm run test:python
npm run test:learning
npm run test:desktop
npm run release:linux -- x64
npm run release:linux -- arm64
```

Em uma sessão sem display, o teste desktop pode usar `xvfb-run -a npm run test:desktop`. Gere uma arquitetura por vez: o staging é compartilhado.

O workflow [Build and release](../.github/workflows/release.yml) executa as verificações antes de empacotar os binários. Uma tag que corresponda à versão do package.json publica os seis pacotes (Windows x64, Linux x64 e ARM64) e um manifesto SHA-256. O código-fonte não inclui seu perfil, backups locais, node_modules ou executáveis; os binários ficam em Releases.
