package com.financial.management.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record TransacaoRequestDTO(
    @NotNull UUID usuarioId,
    @NotNull UUID contaId,
    @NotNull UUID categoriaId,
    @NotNull @Positive BigDecimal valor,
    @NotNull LocalDate dataTransacao,
    @Size(max = 500) String descricao,
    @NotBlank @Size(max = 30) String status
) {
}