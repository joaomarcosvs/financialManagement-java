package com.financial.management.api.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record TransacaoResponseDTO(
    UUID id,
    BigDecimal valor,
    LocalDate dataTransacao,
    String descricao,
    String status,
    UUID contaId,
    UUID categoriaId,
    String categoriaNome,
    String categoriaCor,
    String tipo
) {
}