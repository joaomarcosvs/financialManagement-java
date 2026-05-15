package com.financial.management.domain.service;

import com.financial.management.api.dto.DashboardResponseDTO;
import com.financial.management.api.dto.GastosPorCategoriaDTO;
import com.financial.management.domain.entity.Transacao;
import com.financial.management.domain.repository.TransacaoRepository;
import java.math.BigDecimal;
import java.time.DateTimeException;
import java.time.LocalDate;
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
public class DashboardService {

    private final TransacaoRepository transacaoRepository;

    @Transactional(readOnly = true)
    public DashboardResponseDTO buscarDashboard(UUID usuarioId, Integer mes, Integer ano) {
        YearMonth competencia = criarCompetencia(mes, ano);
        LocalDate dataInicio = competencia.atDay(1);
        LocalDate dataFim = competencia.atEndOfMonth();
        List<Transacao> transacoes = transacaoRepository.findByUsuarioIdAndDataTransacaoBetween(usuarioId, dataInicio, dataFim);

        BigDecimal totalReceitas = somarPorTipo(transacoes, "RECEITA");
        BigDecimal totalDespesas = somarPorTipo(transacoes, "DESPESA");
        BigDecimal saldoAtualTotal = totalReceitas.subtract(totalDespesas);

        List<GastosPorCategoriaDTO> gastosPorCategoria = transacoes.stream()
            .filter(transacao -> tipoEh(transacao, "DESPESA"))
            .filter(transacao -> transacao.getCategoria() != null && transacao.getCategoria().getNome() != null)
            .collect(Collectors.groupingBy(
                transacao -> transacao.getCategoria().getNome(),
                Collectors.mapping(Transacao::getValor, Collectors.reducing(BigDecimal.ZERO, this::valorOuZero, BigDecimal::add))
            ))
            .entrySet()
            .stream()
            .sorted(Map.Entry.<String, BigDecimal>comparingByValue().reversed())
            .map(item -> new GastosPorCategoriaDTO(item.getKey(), valorOuZero(item.getValue())))
            .toList();

        return new DashboardResponseDTO(
            saldoAtualTotal,
            totalReceitas,
            totalDespesas,
            gastosPorCategoria
        );
    }

    private YearMonth criarCompetencia(Integer mes, Integer ano) {
        LocalDate hoje = LocalDate.now();
        int mesCompetencia = mes != null ? mes : hoje.getMonthValue();
        int anoCompetencia = ano != null ? ano : hoje.getYear();

        try {
            return YearMonth.of(anoCompetencia, mesCompetencia);
        } catch (DateTimeException exception) {
            throw new IllegalArgumentException("Mês ou ano inválido para o dashboard.", exception);
        }
    }

    private BigDecimal somarPorTipo(List<Transacao> transacoes, String tipo) {
        return transacoes.stream()
            .filter(transacao -> tipoEh(transacao, tipo))
            .map(Transacao::getValor)
            .filter(Objects::nonNull)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private boolean tipoEh(Transacao transacao, String tipo) {
        return transacao.getCategoria() != null
            && transacao.getCategoria().getTipo() != null
            && transacao.getCategoria().getTipo().trim().toUpperCase(Locale.ROOT).equals(tipo);
    }

    private BigDecimal valorOuZero(BigDecimal valor) {
        return valor != null ? valor : BigDecimal.ZERO;
    }
}