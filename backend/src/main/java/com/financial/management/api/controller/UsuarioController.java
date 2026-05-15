package com.financial.management.api.controller;

import com.financial.management.api.dto.UsuarioPerfilRequestDTO;
import com.financial.management.api.dto.UsuarioRequestDTO;
import com.financial.management.api.dto.UsuarioResponseDTO;
import com.financial.management.api.dto.UsuarioSenhaRequestDTO;
import com.financial.management.domain.entity.Usuario;
import com.financial.management.domain.service.UsuarioService;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @PostMapping
    public ResponseEntity<UsuarioResponseDTO> criar(@Valid @RequestBody UsuarioRequestDTO request) {
        Usuario usuario = usuarioService.salvarUsuario(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponseDTO(usuario));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponseDTO> buscarPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(toResponseDTO(usuarioService.buscarPorId(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponseDTO> atualizarPerfil(
        @PathVariable UUID id,
        @Valid @RequestBody UsuarioPerfilRequestDTO request
    ) {
        return ResponseEntity.ok(toResponseDTO(usuarioService.atualizarPerfil(id, request)));
    }

    @PutMapping("/{id}/senha")
    public ResponseEntity<Void> alterarSenha(@PathVariable UUID id, @Valid @RequestBody UsuarioSenhaRequestDTO request) {
        usuarioService.alterarSenha(id, request);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluirConta(@PathVariable UUID id) {
        usuarioService.excluirConta(id);
        return ResponseEntity.noContent().build();
    }

    private UsuarioResponseDTO toResponseDTO(Usuario usuario) {
        return new UsuarioResponseDTO(
            usuario.getId(),
            usuario.getNome(),
            usuario.getEmail(),
            usuario.getTelefone()
        );
    }
}