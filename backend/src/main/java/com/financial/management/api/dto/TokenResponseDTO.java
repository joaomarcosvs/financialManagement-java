package com.financial.management.api.dto;

import java.util.UUID;

public record TokenResponseDTO(
	String token,
	UUID usuarioId,
	String nome
) {
}