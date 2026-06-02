# ⚡ Simulación de Circuito RLC Serie con Campo Magnético

Este módulo simula un **circuito RLC serie** alimentado por una fuente de voltaje variable, explorando la relación entre la corriente eléctrica y el campo magnético en el inductor. Permite visualizar respuestas transitorias y forzadas, además de la energía almacenada en el campo magnético.

---

## 📐 ¿Qué se simula?

- **Corriente I(t):** Evolución temporal en el circuito RLC bajo distintas condiciones de amortiguamiento y excitación.
- **Campo magnético B(t):** Calculado en el núcleo del inductor a partir de la inductancia y parámetros geométricos.
- **Energía magnética U_B(t)** *(opcional)*: Energía almacenada en el campo magnético a lo largo del tiempo.

---

## 📊 Visualizaciones

| Gráfica | Descripción |
|--------|-------------|
| **Gráfica 1** | Corriente en el circuito `I(t)` |
| **Gráfica 2** | Campo magnético `B(t)` en el núcleo del inductor |
| **Gráfica 3** *(opcional)* | Energía magnética almacenada `U_B(t)` |

---

## 🔄 Casos simulados

| Caso | Comportamiento |
|------|---------------|
| **Sobreamortiguado** | Decaimiento exponencial sin oscilaciones |
| **Amortiguamiento crítico** | Decaimiento más rápido posible sin oscilar |
| **Subamortiguado** | Oscilaciones amortiguadas |
| **Forzado (AC)** | Respuesta senoidal en régimen forzado con desfase respecto a la fuente |

---

## ⚙️ Implementación

**Complejidad:** Media — resolución numérica de una EDO lineal de segundo orden.

### Entradas configurables

| Parámetro | Descripción |
|-----------|-------------|
| `R`, `L`, `C` | Valores del circuito |
| Fuente de voltaje | Tipo (DC, pulso, AC), amplitud y frecuencia |
| `N`, `A`, `ℓ`, `μ_r` | Parámetros geométricos del inductor para calcular `B(t)` |

### Salidas

- Series temporales de `I(t)`, `B(t)` y `U_B(t)`
- Selección del caso de simulación (sobreamortiguado, crítico, subamortiguado, forzado)

### Notas de implementación

- Se recomienda usar métodos numéricos **Runge–Kutta (RK4)** para la resolución de la EDO.
- Comparar resultados numéricos con soluciones analíticas en casos homogéneos para validación.
- Mostrar el **desfase** entre tensión y corriente en régimen forzado (AC).

---

## 🧪 Sugerencias de uso

1. **Explorar los regímenes de amortiguamiento** variando `R`, `L` y `C` para observar la transición entre sobreamortiguado, crítico y subamortiguado.
2. **Validar** `B(t)` y `U_B(t)` contra fórmulas analíticas para el inductor.
3. **Usar ejemplos preconfigurados** con valores típicos de `R`, `L`, `C` para cada caso y facilitar las pruebas iniciales.

---
