package com.financial.management.domain.service;

import com.financial.management.domain.entity.Conta;
import com.financial.management.domain.entity.Transacao;
import com.financial.management.domain.repository.ContaRepository;
import com.financial.management.domain.repository.TransacaoRepository;
import java.math.BigDecimal;
import java.time.DateTimeException;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
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
    public Transacao salvarTransacao(
        Transacao transacao,
        String frequencia,
        Integer mesFimRecorrencia,
        Integer anoFimRecorrencia
    ) {
        validarTransacao(transacao);
        validarConfiguracaoRecorrencia(transacao, mesFimRecorrencia, anoFimRecorrencia);

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

        if (deveGerarRecorrencias(transacao)) {
            return salvarTransacoesRecorrentes(transacao, conta, frequencia, mesFimRecorrencia, anoFimRecorrencia);
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

    @Transactional
    public Transacao atualizarTransacao(UUID id, Transacao dadosAtualizados) {
        Transacao transacaoExistente = transacaoRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Transação não encontrada para o id: " + id));

        validarTransacao(dadosAtualizados);

        Conta contaAnterior = buscarConta(transacaoExistente.getConta().getId());
        Conta contaAtualizada = buscarConta(dadosAtualizados.getConta().getId());

        estornarSaldo(contaAnterior, transacaoExistente);

        transacaoExistente.setConta(contaAtualizada);
        transacaoExistente.setCategoria(dadosAtualizados.getCategoria());
        transacaoExistente.setUsuario(dadosAtualizados.getUsuario());
        transacaoExistente.setValor(dadosAtualizados.getValor());
        transacaoExistente.setDataTransacao(dadosAtualizados.getDataTransacao());
        transacaoExistente.setDescricao(dadosAtualizados.getDescricao());
        transacaoExistente.setStatus(dadosAtualizados.getStatus());

        aplicarSaldo(contaAtualizada, transacaoExistente);

        if (!contaAnterior.getId().equals(contaAtualizada.getId())) {
            contaRepository.save(contaAnterior);
        }

        contaRepository.save(contaAtualizada);
        return transacaoRepository.save(transacaoExistente);
    }

    @Transactional(readOnly = true)
    public List<Transacao> buscarPorUsuario(UUID id, Integer mes, Integer ano) {
        YearMonth competencia = criarCompetencia(mes, ano);

        return transacaoRepository.findByUsuarioIdAndDataTransacaoBetweenComTags(
            id,
            competencia.atDay(1),
            competencia.atEndOfMonth()
        );
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

    private boolean deveGerarRecorrencias(Transacao transacao) {
        return transacao.getId() == null && transacao.isRecorrente();
    }

    private void validarConfiguracaoRecorrencia(Transacao transacao, Integer mesFimRecorrencia, Integer anoFimRecorrencia) {
        if (!transacao.isRecorrente()) {
            return;
        }

        if (mesFimRecorrencia == null || mesFimRecorrencia < 1 || mesFimRecorrencia > 12 || anoFimRecorrencia == null) {
            throw new IllegalArgumentException("Informe um mês e ano válidos para o fim da recorrência.");
        }

        LocalDate dataLimite = construirDataLimiteRecorrencia(mesFimRecorrencia, anoFimRecorrencia);

        if (dataLimite.isBefore(transacao.getDataTransacao())) {
            throw new IllegalArgumentException("O período final da recorrência deve ser igual ou posterior à data da transação.");
        }
    }

    private Transacao salvarTransacoesRecorrentes(
        Transacao transacao,
        Conta conta,
        String frequencia,
        Integer mesFimRecorrencia,
        Integer anoFimRecorrencia
    ) {
        LocalDate dataLimite = construirDataLimiteRecorrencia(mesFimRecorrencia, anoFimRecorrencia);
        List<Transacao> transacoes = new ArrayList<>();
        LocalDate dataRecorrencia = transacao.getDataTransacao();

        while (!dataRecorrencia.isAfter(dataLimite)) {
            Transacao transacaoRecorrente = Transacao.builder()
                .conta(conta)
                .categoria(transacao.getCategoria())
                .usuario(transacao.getUsuario())
                .valor(transacao.getValor())
                .dataTransacao(dataRecorrencia)
                .descricao(transacao.getDescricao())
                .status(transacao.getStatus())
                .recorrente(true)
                .build();

            aplicarSaldo(conta, transacaoRecorrente);
            transacoes.add(transacaoRecorrente);
            dataRecorrencia = calcularProximaDataRecorrente(dataRecorrencia, frequencia);
        }

        contaRepository.save(conta);

        return transacaoRepository.saveAll(transacoes).get(0);
    }

    private LocalDate construirDataLimiteRecorrencia(Integer mesFimRecorrencia, Integer anoFimRecorrencia) {
        return YearMonth.of(anoFimRecorrencia, mesFimRecorrencia).atEndOfMonth();
    }

    private LocalDate calcularProximaDataRecorrente(LocalDate dataBase, String frequencia) {
        String frequenciaNormalizada = (frequencia == null || frequencia.isBlank())
            ? "MENSAL"
            : frequencia.trim().toUpperCase(Locale.ROOT);

        return switch (frequenciaNormalizada) {
            case "DIARIA" -> dataBase.plusDays(1);
            case "SEMANAL" -> dataBase.plusWeeks(1);
            case "TRIMESTRAL" -> dataBase.plusMonths(3);
            case "SEMESTRAL" -> dataBase.plusMonths(6);
            case "ANUAL" -> dataBase.plusYears(1);
            case "MENSAL" -> dataBase.plusMonths(1);
            default -> throw new IllegalArgumentException("Frequência de recorrência inválida.");
        };
    }

    private YearMonth criarCompetencia(Integer mes, Integer ano) {
        LocalDate hoje = LocalDate.now();
        int mesCompetencia = mes != null ? mes : hoje.getMonthValue();
        int anoCompetencia = ano != null ? ano : hoje.getYear();

        try {
            return YearMonth.of(anoCompetencia, mesCompetencia);
        } catch (DateTimeException exception) {
            throw new IllegalArgumentException("Mês ou ano inválido para o extrato.", exception);
        }
    }
}