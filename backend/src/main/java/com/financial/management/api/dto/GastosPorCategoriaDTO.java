package com.financial.management.api.dto;

import java.math.BigDecimal;

public record GastosPorCategoriaDTO(
    String categoria,
    BigDecimal valor,
    String cor
) {
}