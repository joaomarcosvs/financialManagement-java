package com.financial.management.domain.service;

import com.financial.management.api.dto.DashboardResponseDTO;
import com.financial.management.api.dto.GastosPorCategoriaDTO;
import com.financial.management.domain.entity.Conta;
import com.financial.management.domain.repository.ContaRepository;
import com.financial.management.domain.repository.TransacaoRepository;
import java.math.BigDecimal;
import java.time.DateTimeException;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ContaRepository contaRepository;
    private final TransacaoRepository transacaoRepository;

    @Transactional(readOnly = true)
    public DashboardResponseDTO buscarDashboard(UUID usuarioId, int mes, int ano) {
        YearMonth competencia = criarCompetencia(mes, ano);
        LocalDate dataInicio = competencia.atDay(1);
        LocalDate dataFim = competencia.atEndOfMonth();

        BigDecimal saldoAtualTotal = contaRepository.findAllByUsuarioId(usuarioId)
            .stream()
            .map(Conta::getSaldoAtual)
            .filter(java.util.Objects::nonNull)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalReceitas = valorOuZero(
            transacaoRepository.somarReceitasPorUsuarioEPeriodo(usuarioId, dataInicio, dataFim)
        );

        BigDecimal totalDespesas = valorOuZero(
            transacaoRepository.somarDespesasPorUsuarioEPeriodo(usuarioId, dataInicio, dataFim)
        );

        List<GastosPorCategoriaDTO> gastosPorCategoria = transacaoRepository
            .somarDespesasPorCategoriaPorUsuarioEPeriodo(usuarioId, dataInicio, dataFim)
            .stream()
            .map(item -> new GastosPorCategoriaDTO(item.getCategoria(), valorOuZero(item.getValor())))
            .toList();

        return new DashboardResponseDTO(
            saldoAtualTotal,
            totalReceitas,
            totalDespesas,
            gastosPorCategoria
        );
    }

    private YearMonth criarCompetencia(int mes, int ano) {
        try {
            return YearMonth.of(ano, mes);
        } catch (DateTimeException exception) {
            throw new IllegalArgumentException("Mês ou ano inválido para o dashboard.", exception);
        }
    }

    private BigDecimal valorOuZero(BigDecimal valor) {
        return valor != null ? valor : BigDecimal.ZERO;
    }
}