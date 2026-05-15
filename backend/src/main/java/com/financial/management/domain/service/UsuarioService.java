package com.financial.management.domain.service;

import com.financial.management.api.dto.UsuarioPerfilRequestDTO;
import com.financial.management.api.dto.UsuarioRequestDTO;
import com.financial.management.api.dto.UsuarioSenhaRequestDTO;
import com.financial.management.domain.entity.Conta;
import com.financial.management.domain.entity.Usuario;
import com.financial.management.domain.repository.ContaRepository;
import com.financial.management.domain.repository.ContaUsuarioRepository;
import com.financial.management.domain.repository.TransacaoRepository;
import com.financial.management.domain.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final ContaRepository contaRepository;
    private final ContaUsuarioRepository contaUsuarioRepository;
    private final TransacaoRepository transacaoRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public Usuario salvarUsuario(UsuarioRequestDTO dto) {
        usuarioRepository.findByEmail(dto.email()).ifPresent(usuario -> {
            throw new DataIntegrityViolationException("E-mail já cadastrado");
        });

        OffsetDateTime agora = OffsetDateTime.now();

        Usuario usuario = Usuario.builder()
            .nome(normalizarTextoObrigatorio(dto.nome()))
            .email(normalizarTextoObrigatorio(dto.email()))
            .senhaHash(passwordEncoder.encode(dto.senha()))
            .telefone(normalizarTelefone(dto.telefone()))
            .criadoEm(agora)
            .atualizadoEm(agora)
            .build();

        return usuarioRepository.save(usuario);
    }

    @Transactional
    public Usuario atualizarPerfil(UUID id, UsuarioPerfilRequestDTO dto) {
        Usuario usuario = buscarPorId(id);

        usuario.setNome(normalizarTextoObrigatorio(dto.nome()));
        usuario.setTelefone(normalizarTelefone(dto.telefone()));
        usuario.setAtualizadoEm(OffsetDateTime.now());

        return usuarioRepository.save(usuario);
    }

    @Transactional
    public void alterarSenha(UUID id, UsuarioSenhaRequestDTO dto) {
        Usuario usuario = buscarPorId(id);

        if (!passwordEncoder.matches(dto.senhaAtual(), usuario.getSenhaHash())) {
            throw new IllegalArgumentException("A senha atual informada é inválida.");
        }

        usuario.setSenhaHash(passwordEncoder.encode(dto.novaSenha()));
        usuario.setAtualizadoEm(OffsetDateTime.now());
        usuarioRepository.save(usuario);
    }

    @Transactional
    public void excluirConta(UUID id) {
        Usuario usuario = buscarPorId(id);
        List<Conta> contasDoUsuario = contaRepository.findAllByUsuarioId(id);
        List<UUID> contasParaExcluir = new ArrayList<>();

        contasDoUsuario.forEach(conta -> {
            long totalUsuariosVinculados = contaUsuarioRepository.countByConta_Id(conta.getId());

            if (totalUsuariosVinculados == 1) {
                contasParaExcluir.add(conta.getId());
            }
        });

        transacaoRepository.deleteAllByUsuarioId(id);

        contaUsuarioRepository.deleteAllByUsuarioId(id);

        usuarioRepository.delete(usuario);

        contasParaExcluir.forEach(contaId -> {
            if (contaUsuarioRepository.countByConta_Id(contaId) == 0 && !transacaoRepository.existsByConta_Id(contaId)) {
                contaRepository.deleteById(contaId);
            }
        });
    }

    @Transactional(readOnly = true)
    public Usuario buscarPorId(UUID id) {
        return usuarioRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado para o id: " + id));
    }

    private String normalizarTextoObrigatorio(String valor) {
        if (valor == null || valor.isBlank()) {
            throw new IllegalArgumentException("O valor informado não pode ser vazio.");
        }

        return valor.trim();
    }

    private String normalizarTelefone(String telefone) {
        if (telefone == null || telefone.isBlank()) {
            return null;
        }

        return telefone.trim();
    }
}