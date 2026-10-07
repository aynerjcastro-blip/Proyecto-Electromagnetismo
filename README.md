# ⚡ Simulador Interactivo de Circuitos RLC Acoplados Magnéticamente

Simulador interactivo que modela dos circuitos RLC acoplados mediante inductancia mutua. Permite visualizar en tiempo real la transferencia de energía electromagnética, el campo magnético generado, el flujo enlazado y la FEM inducida entre bobinas.

---

## 📐 ¿Qué se simula?

- **Corrientes I₁(t) e I₂(t):** Evolución temporal en ambos circuitos bajo distintas condiciones de acoplamiento y excitación.
- **Inductancia mutua M = k√(L₁L₂):** Acoplamiento magnético configurable entre bobina primaria y secundaria.
- **Campo magnético B(t):** Calculado en el núcleo del inductor primario a partir de la corriente y parámetros geométricos.
- **Flujo magnético Φ(t):** Flujo enlazado entre ambas bobinas según el coeficiente de acoplamiento k.
- **FEM inducida ε(t):** Fuerza electromotriz generada en el circuito secundario por variación del flujo.
- **Energía magnética y eléctrica:** Distribución en tiempo real entre inductores y capacitores de ambos circuitos.

---

## 📊 Visualizaciones

| Panel | Descripción |
|-------|-------------|
| **Panel 1 — Circuito Animado** | Diagrama de ambos circuitos con flujo de corriente y zona de acoplamiento |
| **Panel 2 — Campo Magnético** | Líneas de campo, intensidad y dirección actualizadas en tiempo real |
| **Panel 3 — Gráficas Temporales** | I(t), B(t), Φ(t), ε(t) y voltajes en capacitores |
| **Panel 4 — Energía** | Distribución de energía entre L₁, L₂, C₁ y C₂ con barras dinámicas |

---

## 🔄 Casos de estudio

| Caso | k | Comportamiento |
|------|---|----------------|
| **Acoplamiento débil** | 0.2 | Poca transferencia energética entre circuitos |
| **Acoplamiento medio** | 0.5 | Transferencia moderada |
| **Acoplamiento fuerte** | 0.9 | Comportamiento similar a transformador ideal |
| **Resonancia** | 0.7 | Transferencia máxima de energía entre circuitos |
| **Excitación DC** | 0.6 | Respuesta transitoria al escalón de voltaje |

---

## ⚙️ Implementación

**Complejidad:** Media-Alta — resolución numérica de un sistema de EDOs acopladas de segundo orden.

### Modelo matemático

El sistema se resuelve como cuatro ecuaciones de primer orden en las variables de estado `[I₁, I₂, V_C1, V_C2]`:

### Parámetros configurables

| Parámetro | Descripción |
|-----------|-------------|
| `R₁`, `R₂` | Resistencias de cada circuito (0.1 – 50 Ω) |
| `L₁`, `L₂` | Inductancias (1 – 100 mH) |
| `C₁`, `C₂` | Capacitancias (10 – 1000 µF) |
| `k` | Coeficiente de acoplamiento (0 – 0.99) |
| `N₁`, `N₂` | Número de espiras de cada bobina |
| `V₀` | Amplitud de la fuente (1 – 50 V) |
| `f` | Frecuencia de excitación AC (10 – 1000 Hz) |
| Modo | DC o AC |

### Método numérico

- **Runge–Kutta de orden 4 (RK4)** para integración del sistema de EDOs.
- 1500 pasos de integración por simulación; 500 puntos renderizados en gráficas.
- Tiempo de simulación adaptativo: `t_max = max(0.05, 5/f)` en modo AC.

---

## 🧪 Sugerencias de uso

1. **Explorar los regímenes de acoplamiento** usando los presets para observar cómo varía la transferencia de energía con k.
2. **Ajustar L₁ = L₂ y C₁ = C₂** a la frecuencia de resonancia `f₀ = 1/(2π√(LC))` para maximizar la transferencia.
3. **Comparar modos DC y AC** para observar la diferencia entre respuesta transitoria y régimen forzado.
4. **Observar la cadena electromagnética:** Corriente → Campo B → Flujo Φ → FEM ε → Transferencia de energía.

---

## 🧰 Tecnologías

| Herramienta | Uso |
|-------------|-----|
| React + Vite | Interfaz y reactividad |
| Recharts | Gráficas temporales |
| SVG dinámico | Diagrama de circuito y campo magnético |
| RK4 (JS nativo) | Solver numérico |