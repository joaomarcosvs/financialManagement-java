package com.financial.management.domain.service;

import com.financial.management.domain.entity.Conta;
import com.financial.management.domain.entity.Transacao;
import com.financial.management.domain.repository.ContaRepository;
import com.financial.management.domain.repository.TransacaoRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TransacaoService {

    private static final String DESPESA = "DESPESA";
    private static final String RECEITA = "RECEITA";

    private final TransacaoRepository transacaoRepository;
    private final ContaRepository contaRepository;

    @Transactional
    public Transacao salvarTransacao(Transacao transacao) {
        validarTransacao(transacao);

        Conta conta = buscarConta(transacao.getConta().getId());

        if (transacao.getId() != null) {
            transacaoRepository.findById(transacao.getId()).ifPresent(transacaoExistente -> {
                Conta contaAnterior = buscarConta(transacaoExistente.getConta().getId());
                estornarSaldo(contaAnterior, transacaoExistente);

                if (!contaAnterior.getId().equals(conta.getId())) {
                    contaRepository.save(contaAnterior);
                }
            });
        }

        aplicarSaldo(conta, transacao);
        contaRepository.save(conta);

        transacao.setConta(conta);
        return transacaoRepository.save(transacao);
    }

    @Transactional
    public void deletarTransacao(UUID id) {
        Transacao transacao = transacaoRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Transação não encontrada para o id: " + id));

        Conta conta = buscarConta(transacao.getConta().getId());
        estornarSaldo(conta, transacao);

        contaRepository.save(conta);
        transacaoRepository.delete(transacao);
    }

    @Transactional(readOnly = true)
    public List<Transacao> buscarPorUsuario(UUID id) {
        return transacaoRepository.findAllByUsuario_Id(id);
    }

    @Transactional(readOnly = true)
    public List<Transacao> buscarPorConta(UUID id) {
        return transacaoRepository.findAllByConta_Id(id);
    }

    private Conta buscarConta(UUID contaId) {
        if (contaId == null) {
            throw new IllegalArgumentException("A transação deve informar uma conta válida.");
        }

        return contaRepository.findById(contaId)
            .orElseThrow(() -> new IllegalArgumentException("Conta não encontrada para o id: " + contaId));
    }

    private void aplicarSaldo(Conta conta, Transacao transacao) {
        BigDecimal saldoAtual = obterSaldoAtual(conta);

        switch (obterTipoCategoria(transacao)) {
            case DESPESA -> conta.setSaldoAtual(saldoAtual.subtract(transacao.getValor()));
            case RECEITA -> conta.setSaldoAtual(saldoAtual.add(transacao.getValor()));
            default -> throw new IllegalArgumentException("Tipo de transação inválido para cálculo de saldo.");
        }
    }

    private void estornarSaldo(Conta conta, Transacao transacao) {
        BigDecimal saldoAtual = obterSaldoAtual(conta);

        switch (obterTipoCategoria(transacao)) {
            case DESPESA -> conta.setSaldoAtual(saldoAtual.add(transacao.getValor()));
            case RECEITA -> conta.setSaldoAtual(saldoAtual.subtract(transacao.getValor()));
            default -> throw new IllegalArgumentException("Tipo de transação inválido para estorno de saldo.");
        }
    }

    private BigDecimal obterSaldoAtual(Conta conta) {
        return conta.getSaldoAtual() != null ? conta.getSaldoAtual() : BigDecimal.ZERO;
    }

    private String obterTipoCategoria(Transacao transacao) {
        if (transacao.getCategoria() == null || transacao.getCategoria().getTipo() == null) {
            throw new IllegalArgumentException("A transação deve informar uma categoria com tipo válido.");
        }

        return transacao.getCategoria().getTipo().trim().toUpperCase(Locale.ROOT);
    }

    private void validarTransacao(Transacao transacao) {
        if (transacao == null) {
            throw new IllegalArgumentException("A transação informada não pode ser nula.");
        }

        if (transacao.getValor() == null) {
            throw new IllegalArgumentException("A transação deve informar um valor.");
        }

        if (transacao.getConta() == null || transacao.getConta().getId() == null) {
            throw new IllegalArgumentException("A transação deve informar uma conta válida.");
        }
    }
}