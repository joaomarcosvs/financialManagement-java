package com.financial.management.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record ContaRequestDTO(
    @NotNull UUID usuarioId,
    @NotBlank @Size(max = 120) String nome,
    @NotBlank @Size(max = 30) String tipo,
    @Size(max = 20) String modalidade,
    @Size(max = 50) String icone
) {
}