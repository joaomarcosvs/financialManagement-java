package com.financial.management.domain.service;

import com.financial.management.api.dto.UsuarioRequestDTO;
import com.financial.management.domain.entity.Usuario;
import com.financial.management.domain.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    @Transactional
    public Usuario salvarUsuario(UsuarioRequestDTO dto) {
        usuarioRepository.findByEmail(dto.email()).ifPresent(usuario -> {
            throw new DataIntegrityViolationException("E-mail já cadastrado");
        });

        OffsetDateTime agora = OffsetDateTime.now();

        Usuario usuario = Usuario.builder()
            .nome(dto.nome())
            .email(dto.email())
            // TODO: Encriptar com BCrypt na Issue #11
            .senhaHash(dto.senha())
            .telefone(dto.telefone())
            .criadoEm(agora)
            .atualizadoEm(agora)
            .build();

        return usuarioRepository.save(usuario);
    }

    @Transactional(readOnly = true)
    public Usuario buscarPorId(UUID id) {
        return usuarioRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado para o id: " + id));
    }
}