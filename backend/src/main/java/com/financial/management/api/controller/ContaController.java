package com.financial.management.api.controller;

import com.financial.management.api.dto.ContaResponseDTO;
import com.financial.management.domain.entity.Conta;
import com.financial.management.domain.repository.ContaRepository;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/contas")
@RequiredArgsConstructor
public class ContaController {

    private final ContaRepository contaRepository;

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<ContaResponseDTO>> listarPorUsuario(@PathVariable UUID usuarioId) {
        List<ContaResponseDTO> response = contaRepository.findAllByUsuarioId(usuarioId)
            .stream()
            .sorted(Comparator.comparing(Conta::getNome, String.CASE_INSENSITIVE_ORDER))
            .map(this::toResponseDTO)
            .toList();

        return ResponseEntity.ok(response);
    }

    private ContaResponseDTO toResponseDTO(Conta conta) {
        return new ContaResponseDTO(
            conta.getId(),
            conta.getNome(),
            conta.getTipo(),
            conta.getSaldoAtual(),
            conta.getCriadoEm(),
            conta.getAtualizadoEm()
        );
    }
}