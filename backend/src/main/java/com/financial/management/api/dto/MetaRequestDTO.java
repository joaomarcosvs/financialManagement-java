package com.financial.management.api.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public record MetaRequestDTO(
    @NotNull UUID categoriaId,
    @NotNull @DecimalMin(value = "0.01") BigDecimal valorLimite
) {
}