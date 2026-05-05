package com.financial.management.api.dto;

import java.util.UUID;

public record UsuarioResponseDTO(
    UUID id,
    String nome,
    String email,
    String telefone
) {
}