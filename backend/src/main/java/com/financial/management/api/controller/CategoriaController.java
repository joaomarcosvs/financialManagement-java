package com.financial.management.api.controller;

import com.financial.management.api.dto.CategoriaRequestDTO;
import com.financial.management.api.dto.CategoriaResponseDTO;
import com.financial.management.domain.entity.Categoria;
import com.financial.management.domain.entity.Usuario;
import com.financial.management.domain.service.CategoriaService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/categorias")
@RequiredArgsConstructor
public class CategoriaController {

    private final CategoriaService categoriaService;

    @GetMapping
    public ResponseEntity<List<CategoriaResponseDTO>> listarTodas(@AuthenticationPrincipal Usuario usuarioLogado) {
        List<CategoriaResponseDTO> response = categoriaService.listarPorUsuario(usuarioLogado.getId())
            .stream()
            .map(this::toResponseDTO)
            .toList();

        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<CategoriaResponseDTO> criar(
        @AuthenticationPrincipal Usuario usuarioLogado,
        @Valid @RequestBody CategoriaRequestDTO request
    ) {
        Categoria categoria = categoriaService.criarCategoria(usuarioLogado.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponseDTO(categoria));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoriaResponseDTO> atualizar(
        @PathVariable java.util.UUID id,
        @AuthenticationPrincipal Usuario usuarioLogado,
        @Valid @RequestBody CategoriaRequestDTO request
    ) {
        return ResponseEntity.ok(toResponseDTO(categoriaService.atualizarCategoria(id, usuarioLogado.getId(), request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable java.util.UUID id, @AuthenticationPrincipal Usuario usuarioLogado) {
        categoriaService.deletarCategoria(id, usuarioLogado.getId());
        return ResponseEntity.noContent().build();
    }

    private CategoriaResponseDTO toResponseDTO(Categoria categoria) {
        return new CategoriaResponseDTO(
            categoria.getId(),
            categoria.getNome(),
            categoria.getTipo(),
            categoria.getCor(),
            categoria.getUsuario() == null
        );
    }
}