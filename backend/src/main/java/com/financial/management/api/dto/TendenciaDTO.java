package com.financial.management.api.dto;

import java.math.BigDecimal;

public record TendenciaDTO(
    String mes,
    BigDecimal receitas,
    BigDecimal despesas
) {
}