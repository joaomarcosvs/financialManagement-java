package com.financial.management.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UsuarioSenhaRequestDTO(
    @NotBlank String senhaAtual,
    @NotBlank @Size(min = 6) String novaSenha
) {
}