package com.financial.management.api.dto;

import java.util.UUID;

public record CategoriaResponseDTO(
    UUID id,
    String nome,
    String tipo,
    String cor
) {
}