package com.financial.management.api.controller;

import com.financial.management.api.dto.ContaRequestDTO;
import com.financial.management.api.dto.ContaResponseDTO;
import com.financial.management.domain.entity.Conta;
import com.financial.management.domain.service.ContaService;
import jakarta.validation.Valid;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/contas")
@RequiredArgsConstructor
public class ContaController {

    private final ContaService contaService;

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<ContaResponseDTO>> listarPorUsuario(@PathVariable UUID usuarioId) {
        List<ContaResponseDTO> response = contaService.listarPorUsuario(usuarioId)
            .stream()
            .sorted(Comparator.comparing(Conta::getNome, String.CASE_INSENSITIVE_ORDER))
            .map(this::toResponseDTO)
            .toList();

        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<ContaResponseDTO> criar(@Valid @RequestBody ContaRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponseDTO(contaService.criarConta(request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable UUID id) {
        contaService.deletarConta(id);
        return ResponseEntity.noContent().build();
    }

    private ContaResponseDTO toResponseDTO(Conta conta) {
        return new ContaResponseDTO(
            conta.getId(),
            conta.getNome(),
            conta.getTipo(),
            conta.getIcone(),
            conta.getSaldoAtual(),
            conta.getCriadoEm(),
            conta.getAtualizadoEm()
        );
    }
}