# Plano de Implementação: GPS Zoo Tracking

## Visão Geral

Implementação incremental do rastreamento GPS real no Animal Safari App. Os módulos são criados de forma isolada (tipos → dados → serviços → hook → UI) e integrados ao `ZooMap.tsx` existente sem remover nenhuma funcionalidade atual.

## Tarefas

- [x] 1. Criar tipos TypeScript e arquivos de configuração
  - Criar `src/types/gps.ts` com todos os tipos definidos no design: `GpsErrorType`, `GpsPosition`, `GpsResult`, `GpsError`, `ImagePosition`, `ImagePositionResult`, `ControlPoint`, `GpsOptions` e a constante `ACCURACY_THRESHOLD_METERS`
  - Criar `src/config/zoo-control-points.ts` com o array `ZOO_CONTROL_POINTS` contendo os 4 pontos de controle iniciais documentados com comentários de calibração
  - Criar `src/config/zoo-boundary.ts` com o array `ZOO_BOUNDARY_POLYGON` contendo os 4 vértices do perímetro estimado do zoo
  - _Requisitos: 3.2, 9.1, 9.2, 9.4_

- [x] 2. Implementar o GPS_Service
  - [x] 2.1 Criar `src/services/gpsService.ts` com as funções `getCurrentPosition`, `watchPosition` e `clearWatch`
    - Verificar suporte a `navigator.geolocation` e retornar `GEOLOCATION_NOT_SUPPORTED` se ausente
    - Mapear os códigos de erro da API do navegador para os tipos internos (`PERMISSION_DENIED`, `POSITION_UNAVAILABLE`, `TIMEOUT`)
    - Aplicar timeout padrão de 10 000 ms via `GpsOptions`
    - Sinalizar `isLowAccuracy: true` quando `accuracy > ACCURACY_THRESHOLD_METERS` (50 m)
    - _Requisitos: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.1, 2.3_

  - [x] 2.2 Escrever teste de propriedade P1 — Threshold de precisão GPS
    - **Propriedade 1: Para qualquer leitura GPS com `accuracy > 50`, `isLowAccuracy` deve ser `true`; com `accuracy ≤ 50`, deve ser `false`**
    - **Valida: Requisito 1.6**
    - Arquivo: `src/services/gpsService.test.ts`
    - Gerador: `fc.float({ min: 0, max: 200 })`

  - [x] 2.3 Escrever testes de exemplo para o GPS_Service
    - Testar cada tipo de erro com mocks de `navigator.geolocation`
    - Testar cleanup do `watchId` ao chamar `clearWatch`
    - _Requisitos: 1.3, 1.4, 1.5, 2.3_

- [x] 3. Implementar o Calibration_Engine
  - [x] 3.1 Criar `src/services/calibrationEngine.ts` com a função `createCalibrationEngine`
    - Validar que cada `ControlPoint` contém campos numéricos dentro dos intervalos válidos; retornar `INVALID_CONTROL_POINT` se inválido
    - Retornar `INSUFFICIENT_CONTROL_POINTS` se `points.length < 3`
    - Implementar `solveAffineTransform` por mínimos quadrados (matrizes 3×3, inversão analítica via fórmula de Cramer)
    - Implementar `toImagePosition` aplicando os coeficientes afins e fazendo clamping para `[0, 100]`; sinalizar `isOutOfBounds` quando o valor bruto estiver fora do intervalo
    - Implementar `isInsideZoo` usando o algoritmo ray casting sobre `ZOO_BOUNDARY_POLYGON`
    - _Requisitos: 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 6.1, 9.2, 9.3_

  - [x] 3.2 Escrever teste de propriedade P3 — Mínimo de pontos de controle
    - **Propriedade 3: Para qualquer array com `length < 3`, `createCalibrationEngine` deve retornar erro `INSUFFICIENT_CONTROL_POINTS`**
    - **Valida: Requisitos 3.1, 3.3**
    - Arquivo: `src/services/calibrationEngine.test.ts`
    - Gerador: `fc.array(controlPointArb, { maxLength: 2 })`

  - [x] 3.3 Escrever teste de propriedade P4 — Round-trip de calibração
    - **Propriedade 4: Para qualquer conjunto válido de N ≥ 3 pontos, `toImagePosition(cp.latitude, cp.longitude)` deve reproduzir `cp.imageX` e `cp.imageY` com erro ≤ 1%**
    - **Valida: Requisitos 3.4, 3.5, 4.1**
    - Arquivo: `src/services/calibrationEngine.test.ts`
    - Gerador: `fc.array(validControlPointArb, { minLength: 3, maxLength: 8 })`

  - [x] 3.4 Escrever teste de propriedade P5 — Invariante de intervalo da saída
    - **Propriedade 5: Para qualquer coordenada GPS de entrada, `x` e `y` retornados por `toImagePosition` devem estar em `[0, 100]`**
    - **Valida: Requisitos 4.2, 4.3**
    - Arquivo: `src/services/calibrationEngine.test.ts`
    - Gerador: `fc.record({ lat: fc.float(-90, 90), lng: fc.float(-180, 180) })`

  - [x] 3.5 Escrever teste de propriedade P6 — Injetividade dentro do Zoo_Boundary
    - **Propriedade 6: Para quaisquer dois pares GPS distintos dentro do `Zoo_Boundary`, as `ImagePositions` devem diferir em ≥ 0,5% em x ou y**
    - **Valida: Requisito 4.4**
    - Arquivo: `src/services/calibrationEngine.test.ts`
    - Gerador: dois `fc.record` com coordenadas dentro do polígono do zoo

  - [x] 3.6 Escrever teste de propriedade P7 — Corretude do ponto-em-polígono
    - **Propriedade 7: Para qualquer ponto geometricamente dentro do `ZOO_BOUNDARY_POLYGON`, `isInsideZoo` retorna `true`; fora, retorna `false`**
    - **Valida: Requisito 6.1**
    - Arquivo: `src/services/calibrationEngine.test.ts`
    - Gerador: pontos dentro/fora do polígono gerados geometricamente

  - [x] 3.7 Escrever teste de propriedade P8 — Validação de Control_Points inválidos
    - **Propriedade 8: Para qualquer `ControlPoint` com campos fora dos intervalos válidos, `createCalibrationEngine` deve retornar `INVALID_CONTROL_POINT`**
    - **Valida: Requisitos 9.2, 9.3**
    - Arquivo: `src/services/calibrationEngine.test.ts`
    - Gerador: `fc.record` com campos fora dos intervalos (latitude fora de [-90, 90], etc.)

  - [x] 3.8 Escrever testes de exemplo para o Calibration_Engine
    - Testar conversão com pontos de controle conhecidos e resultado esperado
    - Testar clamping de valores fora do intervalo
    - _Requisitos: 3.3, 4.2, 4.3, 9.3_

- [x] 4. Checkpoint — Garantir que todos os testes passam
  - Garantir que todos os testes passam, perguntar ao usuário se houver dúvidas.

- [x] 5. Implementar o hook useGpsTracking
  - [x] 5.1 Criar `src/hooks/useGpsTracking.ts` orquestrando GPS_Service e Calibration_Engine
    - Inicializar o `CalibrationEngine` com `ZOO_CONTROL_POINTS` ao montar o hook
    - Implementar `requestSinglePosition` chamando `gpsService.getCurrentPosition` e atualizando `imagePosition`, `isLowAccuracy`, `isInsideZoo` e `error`
    - Implementar `startTracking` chamando `gpsService.watchPosition` e atualizando o estado a cada nova posição recebida
    - Implementar `stopTracking` chamando `gpsService.clearWatch` com o `watchId` ativo
    - Preservar a última `imagePosition` válida quando o erro for `POSITION_UNAVAILABLE`
    - Encerrar automaticamente o Watch_Mode no cleanup do `useEffect` (unmount)
    - Expor `hasPromptedForRoute` (inicialmente `false`) e `markRoutePrompted` (seta para `true`)
    - _Requisitos: 2.1, 2.3, 2.4, 2.5, 5.3, 6.2, 6.3, 10.4_

  - [x] 5.2 Escrever teste de propriedade P2 — Todas as posições do Watch_Mode são emitidas
    - **Propriedade 2: Para qualquer sequência de N posições GPS recebidas em Watch_Mode, o hook deve emitir exatamente N atualizações de `imagePosition`**
    - **Valida: Requisito 2.2**
    - Arquivo: `src/hooks/useGpsTracking.test.ts`
    - Gerador: `fc.array(fc.record({ lat, lng, accuracy }), { minLength: 1 })`

  - [x] 5.3 Escrever teste de propriedade P11 — Exibição única do diálogo de rota por sessão
    - **Propriedade 11: Para qualquer sequência de N posições fora do boundary após `hasPromptedForRoute = true`, `shouldShowRouteDialog` deve permanecer `false`**
    - **Valida: Requisito 10.4**
    - Arquivo: `src/hooks/useGpsTracking.test.ts`
    - Gerador: `fc.array(outsideBoundaryPositionArb, { minLength: 1 })`

  - [x] 5.4 Escrever testes de exemplo para o useGpsTracking
    - Testar cleanup do Watch_Mode no unmount do componente
    - Testar preservação da última posição válida em `POSITION_UNAVAILABLE`
    - _Requisitos: 2.4, 2.5_

- [x] 6. Criar componentes de UI do GPS
  - [x] 6.1 Criar `src/components/VisitorMarker.tsx`
    - Renderizar o marcador azul com animação de pulso na posição `(x%, y%)` recebida via props
    - Exibir indicador visual de baixa precisão (ícone de alerta ou círculo de incerteza) quando `isLowAccuracy` for `true`
    - _Requisitos: 5.1, 5.2, 5.4_

  - [x] 6.2 Escrever teste de propriedade P10 — Posição do VisitorMarker corresponde à ImagePosition
    - **Propriedade 10: Para qualquer `ImagePosition { x, y }` válida, o `VisitorMarker` deve ser renderizado com `style.left = x%` e `style.top = y%`**
    - **Valida: Requisito 5.1**
    - Arquivo: `src/components/VisitorMarker.test.tsx`
    - Gerador: `fc.record({ x: fc.float(0, 100), y: fc.float(0, 100) })`

  - [x] 6.3 Criar `src/components/GpsErrorMessage.tsx`
    - Mapear cada `GpsErrorType` para a mensagem de usuário definida nos requisitos
    - Ocultar o componente quando `errorType` for `null`
    - _Requisitos: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 6.4 Criar `src/services/mapsService.ts` com a função `openMapsWithRoute`
    - Construir o deep link `https://maps.google.com/maps?daddr=-29.8320,-51.1480` e abrir via `window.open`
    - Retornar `false` quando `window.open` retornar `null` (fallback para exibição manual das coordenadas)
    - _Requisitos: 10.2, 10.5_

  - [x] 6.5 Criar `src/components/RouteToZooDialog.tsx`
    - Usar o componente `AlertDialog` do shadcn/ui (`src/components/ui/alert-dialog.tsx`)
    - Exibir título "Você está fora do zoo" e pergunta de confirmação de rota
    - Botão de confirmação chama `onConfirm`; botão de cancelamento chama `onCancel`
    - Quando `openMapsWithRoute()` retornar `false`, exibir mensagem com as coordenadas `-29.8320, -51.1480` para inserção manual
    - _Requisitos: 10.1, 10.2, 10.3, 10.5_

  - [x] 6.6 Escrever testes de exemplo para o RouteToZooDialog
    - Confirmar que o botão de confirmação abre o deep link correto via `window.open`
    - Confirmar que o botão de cancelamento fecha o diálogo sem chamar `window.open`
    - Confirmar que quando `window.open` retorna `null`, a mensagem de fallback com as coordenadas é exibida
    - _Requisitos: 10.2, 10.3, 10.5_

- [x] 7. Integrar GPS ao ZooMap.tsx
  - [x] 7.1 Modificar `src/components/ZooMap.tsx` para consumir o hook `useGpsTracking`
    - Importar e chamar `useGpsTracking` no topo do componente
    - Remover o `setUserLocation({ x: 8, y: 52 })` (posição simulada) e derivar `userLocation` de `imagePosition`
    - Substituir a lógica de `updateVisitorLocation` para chamar `requestSinglePosition()` do hook
    - Manter a prop `onAnimalSelect`, a exibição da `Map_Image` oficial e todos os marcadores de animais intactos
    - _Requisitos: 8.1, 8.2, 8.3, 8.4_

  - [x] 7.2 Adicionar renderização condicional dos novos componentes no ZooMap.tsx
    - Renderizar `<VisitorMarker>` apenas quando `isInsideZoo && imagePosition !== null`
    - Renderizar `<GpsErrorMessage>` quando `error !== null`
    - Renderizar mensagem "fora do zoo" quando `!isInsideZoo && !error && imagePosition !== null`
    - Renderizar `<RouteToZooDialog>` quando `!isInsideZoo && !error && imagePosition !== null && !hasPromptedForRoute`; chamar `markRoutePrompted()` nos callbacks `onConfirm` e `onCancel`
    - _Requisitos: 5.1, 5.3, 5.4, 5.5, 6.2, 6.3, 7.1, 7.2, 7.3, 7.4, 10.1, 10.4_

  - [x] 7.3 Escrever teste de propriedade P9 — Marcadores de animais preservados
    - **Propriedade 9: Para qualquer lista de animais com posições percentuais válidas, o `ZooMap` deve renderizar um marcador para cada animal, independentemente do estado do GPS**
    - **Valida: Requisito 8.2**
    - Arquivo: `src/components/ZooMap.test.tsx`
    - Gerador: `fc.array(animalArb, { minLength: 1 })`

  - [x] 7.4 Escrever testes de exemplo para o ZooMap integrado
    - Testar que a `Map_Image` oficial da SEMA-RS continua sendo exibida
    - Testar que a prop `onAnimalSelect` continua funcionando
    - Testar exibição das mensagens de erro GPS
    - Testar ausência do `VisitorMarker` quando não há posição GPS válida
    - _Requisitos: 8.1, 8.3, 8.4, 7.1, 7.2, 7.3, 7.4_

- [x] 8. Configurar ambiente de testes
  - Instalar dependências de teste: `vitest`, `@vitest/coverage-v8`, `fast-check`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`
  - Criar `vitest.config.ts` com `environment: 'jsdom'`, `globals: true` e `setupFiles: ['./src/test/setup.ts']`
  - Criar `src/test/setup.ts` com a configuração do `@testing-library/jest-dom`
  - _Requisitos: (infraestrutura de testes para todos os requisitos)_

- [x] 9. Checkpoint final — Garantir que todos os testes passam
  - Garantir que todos os testes passam, perguntar ao usuário se houver dúvidas.

## Notas

- Tarefas marcadas com `*` são opcionais e podem ser puladas para um MVP mais rápido
- Cada tarefa referencia os requisitos específicos para rastreabilidade
- Os checkpoints garantem validação incremental
- Os testes de propriedade validam invariantes universais do Calibration_Engine e GPS_Service
- Os testes de exemplo validam casos específicos e condições de erro
- Os pontos de controle em `zoo-control-points.ts` são estimativas iniciais — devem ser calibrados em campo com medições GPS reais
