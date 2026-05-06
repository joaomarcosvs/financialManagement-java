package com.financial.management.api.controller;

import com.financial.management.api.dto.TransacaoRequestDTO;
import com.financial.management.api.dto.TransacaoResponseDTO;
import com.financial.management.domain.entity.Categoria;
import com.financial.management.domain.entity.Conta;
import com.financial.management.domain.entity.Transacao;
import com.financial.management.domain.entity.Usuario;
import com.financial.management.domain.repository.CategoriaRepository;
import com.financial.management.domain.repository.ContaRepository;
import com.financial.management.domain.repository.UsuarioRepository;
import com.financial.management.domain.service.TransacaoService;
import jakarta.validation.Valid;
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
@RequestMapping("/api/v1/transacoes")
@RequiredArgsConstructor
public class TransacaoController {

    private final TransacaoService transacaoService;
    private final ContaRepository contaRepository;
    private final CategoriaRepository categoriaRepository;
    private final UsuarioRepository usuarioRepository;

    @PostMapping
    public ResponseEntity<TransacaoResponseDTO> criar(@Valid @RequestBody TransacaoRequestDTO request) {
        Conta conta = contaRepository.findById(request.contaId())
            .orElseThrow(() -> new IllegalArgumentException("Conta não encontrada para o id: " + request.contaId()));

        Categoria categoria = categoriaRepository.findById(request.categoriaId())
            .orElseThrow(() -> new IllegalArgumentException("Categoria não encontrada para o id: " + request.categoriaId()));

        Usuario usuario = usuarioRepository.findById(request.usuarioId())
            .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado para o id: " + request.usuarioId()));

        Transacao transacao = Transacao.builder()
            .conta(conta)
            .categoria(categoria)
            .usuario(usuario)
            .valor(request.valor())
            .dataTransacao(request.dataTransacao())
            .descricao(request.descricao())
            .status(request.status())
            .build();

        Transacao transacaoSalva = transacaoService.salvarTransacao(transacao);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponseDTO(transacaoSalva));
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<TransacaoResponseDTO>> buscarPorUsuario(@PathVariable UUID usuarioId) {
        List<TransacaoResponseDTO> response = transacaoService.buscarPorUsuario(usuarioId)
            .stream()
            .map(this::toResponseDTO)
            .toList();

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable UUID id) {
        transacaoService.deletarTransacao(id);
        return ResponseEntity.noContent().build();
    }

    private TransacaoResponseDTO toResponseDTO(Transacao transacao) {
        return new TransacaoResponseDTO(
            transacao.getId(),
            transacao.getValor(),
            transacao.getDataTransacao(),
            transacao.getDescricao(),
            transacao.getStatus(),
            transacao.getConta().getId(),
            transacao.getCategoria().getNome(),
            transacao.getCategoria().getCor(),
            transacao.getCategoria().getTipo()
        );
    }
}