package com.financial.management.api.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record ContaResponseDTO(
    UUID id,
    String nome,
    String tipo,
    BigDecimal saldoAtual,
    LocalDateTime criadoEm,
    LocalDateTime atualizadoEm
) {
}