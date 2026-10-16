# Regras de harmonização — motor determinístico (sem LLM)

Escala sensorial: todos os eixos 1–5. Score final 0–100, apresentado como heurística do sistema, nunca como verdade científica.

## Pesos (total 100)
| Critério | Peso | Regra |
|---|---|---|
| Equilíbrio de intensidade | 30 | `30 - 7 × \|intA − intB\|` (clamp ≥ 0). Dois produtos a 1 de distância ainda ganham 23. |
| Complemento corpo×textura | 20 | Assinaturas valem 20: café corpo ≥ 4 + queijo cremoso; vinho corpo ≥ 4 + queijo intensidade ≥ 4; café+vinho ambos corpo ≥ 4. Senão proporcional pela diferença de corpo: 0→20, 1→15, 2→10, 3→5, ≥4→0. |
| Acidez em harmonia | 15 | diferença ≤ 1 = 15; = 2 → 8; ≥ 3 → 0. Se algum produto não tem acidez cadastrada (queijo sem `acidity`) → neutro 7. |
| Notas em comum | 20 | interseção de `notes` normalizadas (minúsculas, 2–40 chars): cada nota comum = 7, teto 20. |
| Contraste (por combinação) | 10 | café×queijo: café doce (`melado/caramelo/rapadura/doce/mel/açúcar`) + queijo curado (style `curad` ou maturação ≥ 60 dias) ou gorduroso = 10. café×vinho: doce + tanino ≥ 3 = 10. vinho×queijo: queijo gorduroso/curado + (tanino ≥ 3 ou acidez ≥ 4) = 10. |
| Restrição prática | 5 | ambos `available=true` = 5; se algum indisponível, `displayable=false` (não exibida). |

Trio café+queijo+vinho: média dos 3 pares × 0,9 + 10 se houver ≥ 1 nota em comum aos três (teto 100); `displayable=false` se qualquer item estiver indisponível.

Eixos sensoriais em `Product.sensory`: queijo usa `intensity` como proxy de `body`; vinho usa `body` como `intensity`; `acidity` pode ser `null`.

## Editorial vs calculada
- `EDITORIAL`: cadastrada e revisada, score fixo com justificativa humana.
- `CALCULATED`: gerada pelo motor; exibe `criteria: [{ rule, points, detail }]` para explicar cada parcela.
- `Explicação por IA` (quando houver): apenas reescreve os critérios já calculados — nunca inventa score.

## Exemplos deseed
1. Brasil (int 3) + queijo meia-cura amanteigado (int 3) → ~82, editorial.
2. Cubano (int 4) + queijo curado intenso (int 4) + tinto corpo 4 → ~85, calculada.
3. Papua (corpo 2, frutado) + queijo fresco leve → ~78, calculada.
