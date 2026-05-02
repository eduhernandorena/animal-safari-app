# Documento de Requisitos

## Introdução

Esta feature adiciona rastreamento GPS real ao Animal Safari App, substituindo a posição simulada do visitante por coordenadas geográficas reais obtidas via API de Geolocalização do navegador. O desafio central é converter coordenadas GPS (latitude/longitude) em posições percentuais (x%, y%) compatíveis com o mapa estático existente do Parque Zoológico de Sapucaia do Sul (RS), publicado pela SEMA-RS. A solução utiliza geo-referenciamento por pontos de controle — mapeando pares de coordenadas GPS conhecidas para posições na imagem — e aplica transformação afim bilinear para calcular a posição do visitante em tempo real enquanto ele caminha pelo zoo.

---

## Glossário

- **GPS_Service**: Módulo responsável por obter e monitorar a posição GPS do dispositivo via `navigator.geolocation`.
- **Calibration_Engine**: Módulo responsável por converter coordenadas GPS (latitude/longitude) em coordenadas percentuais de imagem (x%, y%) usando pontos de controle geo-referenciados.
- **Control_Point**: Par de valores que associa uma coordenada GPS real (latitude, longitude) a uma posição percentual conhecida na imagem do mapa (x%, y%).
- **Map_Image**: Imagem JPG estática do mapa oficial do Parque Zoológico de Sapucaia do Sul, publicada pela SEMA-RS.
- **Image_Position**: Coordenada percentual (x%, y%) relativa às dimensões da Map_Image, onde x=0% é a borda esquerda, x=100% é a borda direita, y=0% é o topo e y=100% é a base.
- **Zoo_Boundary**: Polígono geográfico que delimita a área física do Parque Zoológico de Sapucaia do Sul.
- **Visitor_Marker**: Indicador visual exibido na Map_Image representando a posição atual do visitante.
- **ZooMap**: Componente React existente (`ZooMap.tsx`) que exibe a Map_Image com marcadores de animais e o Visitor_Marker.
- **Accuracy_Threshold**: Valor máximo de imprecisão GPS aceitável, em metros, para que uma leitura seja considerada válida.
- **Watch_Mode**: Modo de monitoramento contínuo de posição GPS via `navigator.geolocation.watchPosition`.

---

## Requisitos

### Requisito 1: Obtenção da Posição GPS Real

**User Story:** Como visitante do zoológico, quero que o app use minha localização GPS real, para que eu possa me orientar com precisão no mapa físico do zoo.

#### Critérios de Aceitação

1. WHEN o visitante aciona a função de localização, THE GPS_Service SHALL solicitar permissão de acesso à geolocalização do dispositivo via `navigator.geolocation.getCurrentPosition`.
2. WHEN a permissão de geolocalização é concedida, THE GPS_Service SHALL retornar a latitude, longitude e precisão (em metros) da posição atual.
3. IF o navegador não suporta a API `navigator.geolocation`, THEN THE GPS_Service SHALL retornar um erro do tipo `GEOLOCATION_NOT_SUPPORTED`.
4. IF o visitante nega a permissão de geolocalização, THEN THE GPS_Service SHALL retornar um erro do tipo `PERMISSION_DENIED`.
5. IF a obtenção da posição GPS exceder 10 segundos sem resposta, THEN THE GPS_Service SHALL retornar um erro do tipo `TIMEOUT`.
6. IF a precisão GPS retornada for superior a 50 metros, THEN THE GPS_Service SHALL sinalizar a leitura como `LOW_ACCURACY` sem descartá-la.

---

### Requisito 2: Monitoramento Contínuo de Posição

**User Story:** Como visitante caminhando pelo zoo, quero que minha posição no mapa seja atualizada automaticamente enquanto me movo, para que eu não precise acionar manualmente a cada passo.

#### Critérios de Aceitação

1. WHEN o visitante ativa o rastreamento contínuo, THE GPS_Service SHALL iniciar Watch_Mode via `navigator.geolocation.watchPosition` e emitir atualizações de posição a cada nova leitura do dispositivo.
2. WHILE o Watch_Mode está ativo, THE GPS_Service SHALL emitir cada nova posição recebida do dispositivo sem filtrar por distância mínima percorrida.
3. WHEN o visitante desativa o rastreamento contínuo, THE GPS_Service SHALL encerrar o Watch_Mode via `navigator.geolocation.clearWatch` e parar de emitir atualizações.
4. WHEN o componente ZooMap é desmontado, THE GPS_Service SHALL encerrar automaticamente qualquer Watch_Mode ativo para liberar recursos do dispositivo.
5. IF o dispositivo perder sinal GPS durante o Watch_Mode, THEN THE GPS_Service SHALL emitir um erro do tipo `POSITION_UNAVAILABLE` e manter a última posição válida exibida no mapa.

---

### Requisito 3: Geo-referenciamento por Pontos de Controle

**User Story:** Como desenvolvedor, quero definir pontos de controle que associem coordenadas GPS reais a posições na imagem do mapa, para que a conversão de GPS para posição na imagem seja precisa.

#### Critérios de Aceitação

1. THE Calibration_Engine SHALL aceitar um conjunto de no mínimo 3 Control_Points para calcular a transformação entre coordenadas GPS e Image_Position.
2. THE Calibration_Engine SHALL armazenar os Control_Points como constantes no código-fonte, com latitude, longitude, x% e y% explicitamente documentados.
3. WHEN o Calibration_Engine recebe um conjunto de Control_Points com menos de 3 entradas, THE Calibration_Engine SHALL retornar um erro do tipo `INSUFFICIENT_CONTROL_POINTS`.
4. THE Calibration_Engine SHALL aplicar transformação afim bilinear usando os Control_Points para converter coordenadas GPS em Image_Position.
5. FOR ALL Control_Points fornecidos, THE Calibration_Engine SHALL converter a coordenada GPS do Control_Point de volta para Image_Position com erro máximo de 1% em x e 1% em y (propriedade de round-trip de calibração).

---

### Requisito 4: Conversão de Coordenadas GPS para Posição na Imagem

**User Story:** Como visitante, quero que minha posição GPS seja convertida corretamente para o mapa estático, para que o marcador apareça no lugar certo da imagem.

#### Critérios de Aceitação

1. WHEN o GPS_Service fornece uma posição GPS válida, THE Calibration_Engine SHALL converter a latitude e longitude em uma Image_Position (x%, y%) usando os Control_Points configurados.
2. THE Calibration_Engine SHALL retornar valores de x% e y% no intervalo de 0% a 100%.
3. IF a posição GPS convertida resultar em x% ou y% fora do intervalo [0%, 100%], THEN THE Calibration_Engine SHALL limitar (clamp) o valor ao intervalo válido e sinalizar a posição como `OUT_OF_BOUNDS`.
4. FOR ALL pares de coordenadas GPS dentro do Zoo_Boundary, THE Calibration_Engine SHALL produzir Image_Positions distintas para entradas distintas — duas coordenadas GPS diferentes não devem mapear para a mesma Image_Position com diferença menor que 0,5% em x ou y.

---

### Requisito 5: Exibição da Posição Real no Mapa

**User Story:** Como visitante, quero ver minha posição real exibida no mapa do zoo, para que eu saiba onde estou em relação aos recintos dos animais.

#### Critérios de Aceitação

1. WHEN uma Image_Position válida é calculada, THE ZooMap SHALL renderizar o Visitor_Marker na posição correspondente sobre a Map_Image.
2. THE ZooMap SHALL diferenciar visualmente o Visitor_Marker dos marcadores de animais, usando cor azul e animação de pulso para o Visitor_Marker.
3. WHILE o Watch_Mode está ativo, THE ZooMap SHALL atualizar a posição do Visitor_Marker a cada nova Image_Position recebida sem recarregar a Map_Image.
4. WHEN a posição GPS é sinalizada como `LOW_ACCURACY`, THE ZooMap SHALL exibir um indicador visual de baixa precisão junto ao Visitor_Marker (ex.: círculo de incerteza ou ícone de alerta).
5. WHEN a posição GPS é sinalizada como `OUT_OF_BOUNDS`, THE ZooMap SHALL exibir uma mensagem informando que o visitante está fora da área do zoo.

---

### Requisito 6: Detecção de Presença na Área do Zoo

**User Story:** Como visitante, quero que o app identifique quando estou fisicamente dentro do zoo, para que o rastreamento seja ativado apenas quando relevante.

#### Critérios de Aceitação

1. THE Calibration_Engine SHALL disponibilizar uma função que recebe latitude e longitude e retorna um booleano indicando se a posição está dentro do Zoo_Boundary.
2. WHEN a posição GPS do visitante está dentro do Zoo_Boundary, THE ZooMap SHALL exibir o Visitor_Marker e habilitar o rastreamento contínuo.
3. WHEN a posição GPS do visitante está fora do Zoo_Boundary, THE ZooMap SHALL exibir uma mensagem informando que o visitante não está na área do zoo e ocultar o Visitor_Marker.
4. THE Zoo_Boundary SHALL ser definido como um polígono de coordenadas GPS correspondente ao perímetro do Parque Zoológico de Sapucaia do Sul.

---

### Requisito 7: Tratamento de Erros e Feedback ao Usuário

**User Story:** Como visitante, quero receber mensagens claras quando o GPS não funcionar corretamente, para que eu entenda o problema e saiba como resolvê-lo.

#### Critérios de Aceitação

1. WHEN o GPS_Service retorna um erro do tipo `GEOLOCATION_NOT_SUPPORTED`, THE ZooMap SHALL exibir a mensagem: "Seu dispositivo não suporta geolocalização."
2. WHEN o GPS_Service retorna um erro do tipo `PERMISSION_DENIED`, THE ZooMap SHALL exibir a mensagem: "Permissão de localização negada. Habilite o GPS nas configurações do dispositivo."
3. WHEN o GPS_Service retorna um erro do tipo `TIMEOUT`, THE ZooMap SHALL exibir a mensagem: "Não foi possível obter sua localização. Verifique o sinal GPS e tente novamente."
4. WHEN o GPS_Service retorna um erro do tipo `POSITION_UNAVAILABLE`, THE ZooMap SHALL exibir a mensagem: "Sinal GPS perdido. Última posição conhecida mantida no mapa."
5. IF nenhuma posição GPS válida foi obtida ainda e ocorre um erro, THEN THE ZooMap SHALL ocultar o Visitor_Marker e exibir apenas a mensagem de erro correspondente.

---

### Requisito 8: Compatibilidade com o Mapa Estático Existente

**User Story:** Como desenvolvedor, quero que o rastreamento GPS seja integrado ao componente ZooMap existente sem substituir a Map_Image atual, para que o mapa oficial da SEMA-RS continue sendo exibido.

#### Critérios de Aceitação

1. THE ZooMap SHALL continuar exibindo a Map_Image oficial da SEMA-RS como base visual após a integração do GPS.
2. THE ZooMap SHALL continuar exibindo os marcadores de animais com suas posições percentuais existentes após a integração do GPS.
3. WHEN o GPS real não está disponível ou o visitante está fora do Zoo_Boundary, THE ZooMap SHALL operar sem exibir o Visitor_Marker, mantendo todas as demais funcionalidades intactas.
4. THE ZooMap SHALL manter compatibilidade com a prop `onAnimalSelect` existente após a integração do GPS.

---

### Requisito 9: Persistência e Configuração dos Pontos de Controle

**User Story:** Como desenvolvedor, quero que os pontos de controle de geo-referenciamento sejam configuráveis e documentados, para que possam ser ajustados conforme o mapa for calibrado em campo.

#### Critérios de Aceitação

1. THE Calibration_Engine SHALL ler os Control_Points de um arquivo de configuração dedicado separado do código de lógica de conversão.
2. THE Calibration_Engine SHALL validar que cada Control_Point contém latitude, longitude, x% e y% com tipos numéricos ao ser inicializado.
3. IF um Control_Point contiver valores não numéricos ou fora dos intervalos válidos (latitude: -90 a 90, longitude: -180 a 180, x%: 0 a 100, y%: 0 a 100), THEN THE Calibration_Engine SHALL retornar um erro do tipo `INVALID_CONTROL_POINT`.
4. THE Calibration_Engine SHALL incluir no arquivo de configuração comentários documentando como cada Control_Point foi obtido (ex.: coordenada GPS medida na entrada principal, no lago, etc.).

---

### Requisito 10: Rota até o Zoo para Visitantes Externos

**User Story:** Como visitante que ainda não está no zoológico, quero que o app me ofereça a opção de abrir o aplicativo de mapas do meu dispositivo com a rota até o Parque Zoológico de Sapucaia do Sul, para que eu possa me deslocar até lá com facilidade.

#### Critérios de Aceitação

1. WHEN a posição GPS do visitante está fora do Zoo_Boundary, THE ZooMap SHALL exibir um diálogo de confirmação perguntando se o visitante deseja obter a rota até o Parque Zoológico de Sapucaia do Sul.
2. WHEN o visitante confirma a solicitação de rota no diálogo, THE ZooMap SHALL abrir o aplicativo de mapas nativo do dispositivo com o destino definido como o Parque Zoológico de Sapucaia do Sul (coordenadas: -29.8320, -51.1480), usando o deep link `https://maps.google.com/maps?daddr=-29.8320,-51.1480`.
3. WHEN o visitante recusa a solicitação de rota no diálogo, THE ZooMap SHALL fechar o diálogo e manter a mensagem informando que o visitante está fora da área do zoo, sem nenhuma ação adicional.
4. THE ZooMap SHALL exibir o diálogo de rota apenas uma vez por sessão de detecção de posição fora do Zoo_Boundary — ou seja, o diálogo não deve reaparecer automaticamente enquanto o visitante permanecer fora do zoo após já ter respondido ao prompt.
5. IF o dispositivo não suportar a abertura de deep links externos, THEN THE ZooMap SHALL exibir uma mensagem informando as coordenadas do zoo (-29.8320, -51.1480) para que o visitante possa inserir manualmente no aplicativo de mapas de sua preferência.
