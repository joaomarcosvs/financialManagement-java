package com.financial.management.api.dto;

import java.util.List;
import java.util.UUID;

public record WebhookResponseDTO(
    int transacoesCriadas,
    List<UUID> ids
) {}
