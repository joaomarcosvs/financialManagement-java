package com.financial.management.api.controller;

import com.financial.management.api.dto.MetaProgressoDTO;
import com.financial.management.api.dto.MetaRequestDTO;
import com.financial.management.domain.entity.Usuario;
import com.financial.management.domain.service.MetaService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/metas")
@RequiredArgsConstructor
public class MetaController {

    private final MetaService metaService;

    @GetMapping("/progresso")
    public ResponseEntity<List<MetaProgressoDTO>> obterProgresso(
        @AuthenticationPrincipal Usuario usuarioLogado,
        @RequestParam(required = false) Integer mes,
        @RequestParam(required = false) Integer ano
    ) {
        return ResponseEntity.ok(metaService.obterProgressoMetas(usuarioLogado.getId(), mes, ano));
    }

    @PostMapping
    public ResponseEntity<Void> criar(
        @AuthenticationPrincipal Usuario usuarioLogado,
        @Valid @RequestBody MetaRequestDTO request
    ) {
        metaService.criarMeta(usuarioLogado.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> atualizar(
        @PathVariable UUID id,
        @AuthenticationPrincipal Usuario usuarioLogado,
        @Valid @RequestBody MetaRequestDTO request
    ) {
        metaService.atualizarMeta(id, usuarioLogado.getId(), request);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable UUID id, @AuthenticationPrincipal Usuario usuarioLogado) {
        metaService.deletarMeta(id, usuarioLogado.getId());
        return ResponseEntity.noContent().build();
    }
}