package com.financial.management.api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record WebhookTransacaoRequestDTO(
    String userPhone,
    String userEmail,

    @NotEmpty
    @Valid
    List<WebhookTransacaoItemDTO> transacoes
) {
    public record WebhookTransacaoItemDTO(
        @NotNull @Positive BigDecimal valor,
        @NotNull LocalDate dataTransacao,
        @Size(max = 500) String descricao,
        @NotNull String status,
        @NotNull UUID contaId,
        @NotNull UUID categoriaId
    ) {}
}
