package com.financial.management.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UsuarioPerfilRequestDTO(
    @NotBlank @Size(max = 150) String nome,
    @Size(max = 20) String telefone
) {
}