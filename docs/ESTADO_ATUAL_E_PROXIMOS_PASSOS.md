# Estado atual do ZooExplorer (abril/2026)

## Resumo executivo
O app já está em um **MVP funcional de front-end** com foco em experiência visual e navegação básica do visitante.

- Interface principal com abas para **Mapa**, **Animais** e **Informações**.
- Mapa interativo com marcadores clicáveis de recintos.
- Catálogo de animais com busca e filtro por tipo.
- Tela de detalhes por animal com dados educativos.
- Página informativa do zoológico (horários, ingressos, eventos e contato).

## O que já está pronto

### 1) Estrutura e stack
- Projeto React + TypeScript com Vite.
- UI baseada em Tailwind + shadcn/ui.
- Roteamento básico (`/` e fallback 404).

### 2) Jornada principal do usuário
- Visitante abre o app e vê o header do ZooExplorer.
- Na aba **Mapa**, pode clicar em recintos e abrir um animal.
- Na aba **Animais**, pode pesquisar, filtrar e abrir detalhes.
- Na aba **Informações**, acessa conteúdo institucional.

### 3) Funcionalidade de mapa
- Renderização visual em SVG com caminhos/áreas.
- Marcadores de animais com tooltip simples.
- Indicador de localização do usuário **simulado**.
- Botão de geolocalização existente, mas sem integração real com coordenadas do parque.
- **Layout fullscreen no mobile**: quando a aba Mapa está ativa em telas pequenas, o mapa ocupa toda a tela (estilo Google Maps) — o header é ocultado e a barra de navegação inferior fica flutuante com fundo semitransparente (`bg-white/90` + `backdrop-blur`). Em telas `sm` e maiores o layout padrão é mantido.

### 4) Dados de animais e conteúdo
- Dados embutidos no código (arrays/objetos estáticos).
- Status de conservação, habitat, horário de alimentação etc.
- Conteúdo descritivo consistente para demo e validação de UX.

## Modelo de dados — Animal

O tipo `Animal` (em `src/types/animal.ts`) possui dois sistemas de coordenadas distintos:

| Campo | Tipo | Descrição |
|---|---|---|
| `mapPosition` | `{ x, y }` (%) | Posição percentual no mapa-imagem — definida manualmente |
| `gpsPosition?` | `GpsCoords` (`{ lat, lng }`) | Coordenadas GPS reais do recinto, medidas in loco (opcional) |

`GpsCoords` é uma interface separada exportada de `src/types/animal.ts`. O campo `gpsPosition` é opcional; animais sem medição GPS continuam funcionando normalmente com `mapPosition`.

## Limitações atuais (gaps para produção)

1. **Sem backend/API**: tudo é estático no front-end.
2. **Sem persistência**: favoritos, rota visitada e preferências não são salvos.
3. **Mapa georreferenciado parcialmente**: `mapPosition` usa percentuais; `gpsPosition` (quando preenchido) armazena coordenadas reais, mas a conversão GPS→imagem depende dos pontos de controle em `zoo-control-points.ts`.
4. **Geolocalização parcial**: usa `navigator.geolocation`, mas apenas para log/simulação.
5. **Sem autenticação e papéis**: inexistente para visitantes/admin.
6. **Sem testes automatizados**: não há suíte de testes no projeto.
7. **Sem acessibilidade validada**: faltam auditorias formais (teclado, contraste, screen reader).
8. **Dados duplicados**: informações de animais estão espalhadas em múltiplos componentes.

## Próximos passos recomendados

## Fase 1 — Consolidação técnica (1–2 semanas)
1. Centralizar modelos e dados em `src/data` e `src/types`.
2. Criar camada de serviços (`src/services`) para abstrair futura API.
3. Adicionar tratamento de erro/loading para ações principais.
4. Configurar testes mínimos:
   - unitários (Vitest + Testing Library),
   - smoke test de render da home.

## Fase 2 — Mapa realmente útil (2–4 semanas)
1. Definir um **mapa oficial do zoológico** (imagem vetorial/planta).
2. Criar sistema de coordenadas consistente por recinto.
3. Implementar “**Como chegar ao animal**” com rota simples no mapa.
4. Exibir sua posição com atualização controlada (fallback sem GPS).

## Fase 3 — Dados e operação real (3–6 semanas)
1. Integrar backend (ex.: Supabase/Firebase/Node).
2. CRUD de animais, recintos, horários e eventos.
3. Painel administrativo para equipe do zoo atualizar informações.
4. Versionamento de conteúdo e publicação programada.

## Fase 4 — Produto e crescimento (contínuo)
1. Acessibilidade (WCAG 2.2 AA).
2. i18n (PT/EN/ES), SEO e analytics.
3. Recursos de engajamento: favoritos, trilhas temáticas, notificações de alimentação.
4. Observabilidade: monitoramento de erros/performance.

## Backlog priorizado (curto prazo)
1. Unificar fonte de dados dos animais (evitar duplicação).
2. Melhorar ligação Mapa -> Detalhes (navegação e estado).
3. Implementar estado de loading/erro e toasts para ações de geolocalização/compartilhamento.
4. Adicionar testes de regressão para busca/filtro/listagem.
5. Preparar contrato de API (`/animals`, `/enclosures`, `/events`).

## Critérios de “pronto para beta”
- Dados dinâmicos vindos de API.
- Mapa com recintos reais e navegação básica confiável.
- Testes cobrindo fluxos críticos.
- Telemetria mínima (erros + eventos de uso).
- Acessibilidade com auditoria inicial aprovada.
