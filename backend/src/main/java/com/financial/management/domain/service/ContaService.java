package com.financial.management.domain.service;

import com.financial.management.api.dto.ContaRequestDTO;
import com.financial.management.domain.entity.Conta;
import com.financial.management.domain.entity.ContaUsuario;
import com.financial.management.domain.entity.ContaUsuarioId;
import com.financial.management.domain.entity.Transacao;
import com.financial.management.domain.entity.Usuario;
import com.financial.management.domain.repository.ContaRepository;
import com.financial.management.domain.repository.ContaUsuarioRepository;
import com.financial.management.domain.repository.TransacaoRepository;
import com.financial.management.domain.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ContaService {

    private static final String PERMISSAO_PROPRIETARIO = "PROPRIETARIO";
    private static final String RECEITA = "RECEITA";
    private static final String DESPESA = "DESPESA";

    private final ContaRepository contaRepository;
    private final ContaUsuarioRepository contaUsuarioRepository;
    private final UsuarioRepository usuarioRepository;
    private final TransacaoRepository transacaoRepository;

    @Transactional(readOnly = true)
    public List<Conta> listarPorUsuario(UUID usuarioId) {
        Map<UUID, BigDecimal> saldoMesAtualPorConta = calcularSaldoMesAtualPorConta(usuarioId);

        return contaRepository.findAllByUsuarioId(usuarioId)
            .stream()
            .map(conta -> Conta.builder()
                .id(conta.getId())
                .nome(conta.getNome())
                .tipo(conta.getTipo())
                .icone(conta.getIcone())
                .saldoAtual(saldoMesAtualPorConta.getOrDefault(conta.getId(), BigDecimal.ZERO))
                .criadoEm(conta.getCriadoEm())
                .atualizadoEm(conta.getAtualizadoEm())
                .build())
            .toList();
    }

    @Transactional
    public Conta criarConta(ContaRequestDTO request) {
        Usuario usuario = usuarioRepository.findById(request.usuarioId())
            .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado para o id: " + request.usuarioId()));

        Conta conta = Conta.builder()
            .nome(normalizarTextoObrigatorio(request.nome()))
            .tipo(normalizarTextoObrigatorio(request.tipo()).toUpperCase(Locale.ROOT))
            .icone(normalizarIcone(request.icone()))
            .saldoAtual(BigDecimal.ZERO)
            .build();

        Conta contaSalva = contaRepository.save(conta);

        ContaUsuario vinculo = ContaUsuario.builder()
            .id(ContaUsuarioId.builder().contaId(contaSalva.getId()).usuarioId(usuario.getId()).build())
            .conta(contaSalva)
            .usuario(usuario)
            .permissao(PERMISSAO_PROPRIETARIO)
            .build();

        contaUsuarioRepository.save(vinculo);

        return contaSalva;
    }

    @Transactional
    public void deletarConta(UUID contaId) {
        Conta conta = contaRepository.findById(contaId)
            .orElseThrow(() -> new EntityNotFoundException("Conta não encontrada para o id: " + contaId));

        if (transacaoRepository.existsByConta_Id(contaId)) {
            throw new IllegalArgumentException("Não é possível excluir uma conta que já possui transações vinculadas.");
        }

        contaRepository.delete(conta);
    }

    private String normalizarTextoObrigatorio(String valor) {
        if (valor == null || valor.isBlank()) {
            throw new IllegalArgumentException("O valor informado não pode ser vazio.");
        }

        return valor.trim();
    }

    private String normalizarIcone(String icone) {
        if (icone == null || icone.isBlank()) {
            return null;
        }

        return icone.trim().toLowerCase(Locale.ROOT);
    }

    private Map<UUID, BigDecimal> calcularSaldoMesAtualPorConta(UUID usuarioId) {
        YearMonth competenciaAtual = YearMonth.now();

        return transacaoRepository.findByUsuarioIdAndDataTransacaoBetween(
            usuarioId,
            competenciaAtual.atDay(1),
            competenciaAtual.atEndOfMonth()
        )
            .stream()
            .filter(transacao -> transacao.getConta() != null && transacao.getConta().getId() != null)
            .collect(Collectors.groupingBy(
                transacao -> transacao.getConta().getId(),
                Collectors.reducing(BigDecimal.ZERO, this::obterValorAssinado, BigDecimal::add)
            ));
    }

    private BigDecimal obterValorAssinado(Transacao transacao) {
        BigDecimal valor = transacao.getValor() != null ? transacao.getValor() : BigDecimal.ZERO;
        String tipo = normalizarTipoTransacao(transacao);

        if (RECEITA.equals(tipo)) {
            return valor;
        }

        if (DESPESA.equals(tipo)) {
            return valor.negate();
        }

        return BigDecimal.ZERO;
    }

    private String normalizarTipoTransacao(Transacao transacao) {
        if (transacao == null || transacao.getStatus() == null) {
            return "";
        }

        return transacao.getStatus().trim().toUpperCase(Locale.ROOT);
    }
}