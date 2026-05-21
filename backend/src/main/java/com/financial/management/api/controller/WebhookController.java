package com.financial.management.api.controller;

import com.financial.management.api.dto.WebhookResponseDTO;
import com.financial.management.api.dto.WebhookTransacaoRequestDTO;
import com.financial.management.api.dto.WebhookTransacaoRequestDTO.WebhookTransacaoItemDTO;
import com.financial.management.domain.entity.Categoria;
import com.financial.management.domain.entity.Conta;
import com.financial.management.domain.entity.Transacao;
import com.financial.management.domain.entity.Usuario;
import com.financial.management.domain.repository.CategoriaRepository;
import com.financial.management.domain.repository.ContaRepository;
import com.financial.management.domain.repository.UsuarioRepository;
import com.financial.management.domain.service.TransacaoService;
import jakarta.validation.Valid;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/webhook")
@RequiredArgsConstructor
public class WebhookController {

    private final TransacaoService transacaoService;
    private final UsuarioRepository usuarioRepository;
    private final ContaRepository contaRepository;
    private final CategoriaRepository categoriaRepository;

    @PostMapping("/transacoes")
    public ResponseEntity<WebhookResponseDTO> importarTransacoes(
        @Valid @RequestBody WebhookTransacaoRequestDTO request
    ) {
        Usuario usuario = resolverUsuario(request);
        List<UUID> ids = new ArrayList<>();

        for (WebhookTransacaoItemDTO item : request.transacoes()) {
            Conta conta = contaRepository.findById(item.contaId())
                .orElseThrow(() -> new IllegalArgumentException("Conta não encontrada: " + item.contaId()));

            Categoria categoria = categoriaRepository.findById(item.categoriaId())
                .orElseThrow(() -> new IllegalArgumentException("Categoria não encontrada: " + item.categoriaId()));

            Transacao transacao = Transacao.builder()
                .conta(conta)
                .usuario(usuario)
                .categoria(categoria)
                .valor(item.valor())
                .dataTransacao(item.dataTransacao())
                .descricao(item.descricao())
                .status(item.status())
                .recorrente(false)
                .origem("WHATSAPP")
                .build();

            Transacao salva = transacaoService.salvarTransacao(transacao, null, null, null);
            ids.add(salva.getId());
        }

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(new WebhookResponseDTO(ids.size(), ids));
    }

    private Usuario resolverUsuario(WebhookTransacaoRequestDTO request) {
        if (request.userEmail() != null && !request.userEmail().isBlank()) {
            return usuarioRepository.findByEmail(request.userEmail())
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado para o email informado."));
        }

        if (request.userPhone() != null && !request.userPhone().isBlank()) {
            return usuarioRepository.findByTelefone(request.userPhone())
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado para o telefone informado."));
        }

        throw new IllegalArgumentException("Informe userPhone ou userEmail para identificar o usuário.");
    }
}
