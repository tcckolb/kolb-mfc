# Kolb-MFC

Aplicativo web (PWA) para personalização do ensino na preceptoria em Medicina de Família e Comunidade. O residente responde a 12 situações da prática, o app calcula as pontuações nos quatro modos do ciclo de Kolb (EC, OR, CA, EA), mostra o estilo predominante, sugere estratégias de ensino e ajuda a montar um plano de ensino individualizado com o preceptor.

O questionário é autoral, baseado no modelo de aprendizagem experiencial de Kolb (1984). Não é o Learning Style Inventory (LSI) oficial.

Acesse: **https://tcckolb.github.io/kolb-mfc/**

## Código aberto

O Kolb-MFC é o produto técnico de um trabalho de conclusão de curso da Especialização em Preceptoria em Medicina de Família e Comunidade. O código é livre, sob a [licença MIT](LICENSE): qualquer pessoa ou programa de residência pode usar, copiar, adaptar e redistribuir, inclusive o questionário e as recomendações, desde que mantenha o aviso de licença. Para adaptar, faça um fork deste repositório e publique a sua versão no GitHub Pages.

## Arquivos

```
kolb-mfc/
├── index.html      telas do aplicativo
├── style.css       complementos visuais (o restante usa Tailwind CSS)
├── app.js          toda a lógica em um só arquivo (questionário, cálculo, telas, Firebase opcional)
├── manifest.json   instalação como app (PWA)
├── sw.js           funcionamento offline (precisa ser um arquivo separado)
├── LICENSE         licença MIT
└── images/         ícones 192 e 512 px
```

## Bibliotecas

A interface usa Tailwind CSS (cdn.tailwindcss.com/3.4.17) e o gráfico de quadrantes usa Chart.js 3.7.0 (cdnjs). Elas são baixadas no primeiro acesso com internet e depois ficam guardadas pelo service worker para uso offline.

## Publicar no GitHub Pages

1. Crie um repositório (por exemplo, `kolb-mfc`) e envie todos os arquivos desta pasta para a raiz dele.
2. No repositório, abra **Settings > Pages**, escolha **Deploy from a branch**, branch `main`, pasta `/ (root)` e salve.
3. O app está publicado em https://tcckolb.github.io/kolb-mfc/. No celular, use "Adicionar à tela inicial" para instalar.

## Testar no computador

O service worker só funciona via servidor (não abrindo o arquivo direto). Na pasta do projeto:

```
python -m http.server 8000
```

e acesse `http://localhost:8000`.

## Firebase (opcional)

Por padrão, cada residente (nome, ano, preceptor, unidade, estilo, escores e plano) fica salvo só no aparelho (localStorage) e nada é enviado para a internet, de acordo com a LGPD. Para guardar uma cópia no Firebase Realtime Database, preencha o objeto `firebaseConfig` no início do `app.js`. O SDK é carregado automaticamente só quando a configuração estiver preenchida. Antes de usar com residentes reais, configure regras de segurança e autenticação no Firebase e atualize a seção de metodologia do trabalho, que hoje descreve armazenamento apenas local.

## Atualizações

Ao alterar qualquer arquivo, aumente o número em `CACHE_NAME` no `sw.js` (por exemplo, `kolb-mfc-v2`) para que os aparelhos baixem a versão nova.
