package com.financial.management.api.controller;

import com.financial.management.api.dto.CategoriaResponseDTO;
import com.financial.management.domain.entity.Categoria;
import com.financial.management.domain.repository.CategoriaRepository;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/categorias")
@RequiredArgsConstructor
public class CategoriaController {

    private final CategoriaRepository categoriaRepository;

    @GetMapping
    public ResponseEntity<List<CategoriaResponseDTO>> listarTodas() {
        List<CategoriaResponseDTO> response = categoriaRepository.findAll()
            .stream()
            .sorted(
                Comparator.comparing(Categoria::getTipo, String.CASE_INSENSITIVE_ORDER)
                    .thenComparing(Categoria::getNome, String.CASE_INSENSITIVE_ORDER)
            )
            .map(this::toResponseDTO)
            .toList();

        return ResponseEntity.ok(response);
    }

    private CategoriaResponseDTO toResponseDTO(Categoria categoria) {
        return new CategoriaResponseDTO(
            categoria.getId(),
            categoria.getNome(),
            categoria.getTipo(),
            categoria.getCor()
        );
    }
}