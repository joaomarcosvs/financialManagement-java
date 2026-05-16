package com.financial.management.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.UUID;

public record MetaRequestDTO(
    @NotBlank @Size(max = 150) String nome,
    @NotNull UUID categoriaId,
    @NotNull @DecimalMin(value = "0.01") BigDecimal valorLimite
) {
}