package com.financial.management.api.dto;

import java.math.BigDecimal;
import java.util.List;

public record DashboardResponseDTO(
    BigDecimal saldoAtualTotal,
    BigDecimal totalReceitas,
    BigDecimal totalDespesas,
    List<GastosPorCategoriaDTO> gastosPorCategoria
) {
}