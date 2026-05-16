package com.financial.management.api.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record MetaProgressoDTO(
    UUID metaId,
    String nomeMeta,
    UUID categoriaId,
    String nomeCategoria,
    BigDecimal valorLimite,
    BigDecimal valorGasto,
    Double percentualGasto
) {
}