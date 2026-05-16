package com.financial.management.domain.service;

import com.financial.management.api.dto.MetaProgressoDTO;
import com.financial.management.api.dto.MetaRequestDTO;
import com.financial.management.domain.entity.Categoria;
import com.financial.management.domain.entity.Meta;
import com.financial.management.domain.entity.Usuario;
import com.financial.management.domain.repository.CategoriaRepository;
import com.financial.management.domain.repository.MetaRepository;
import com.financial.management.domain.repository.TransacaoRepository;
import com.financial.management.domain.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DateTimeException;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MetaService {

    private final MetaRepository metaRepository;
    private final UsuarioRepository usuarioRepository;
    private final CategoriaRepository categoriaRepository;
    private final TransacaoRepository transacaoRepository;

    @Transactional
    public Meta criarMeta(UUID usuarioId, MetaRequestDTO request) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
            .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado para o id: " + usuarioId));
        Categoria categoria = categoriaRepository.findById(request.categoriaId())
            .orElseThrow(() -> new EntityNotFoundException("Categoria não encontrada para o id: " + request.categoriaId()));

        validarCategoriaDaMeta(categoria, usuarioId);

        if (metaRepository.existsByUsuarioIdAndCategoriaId(usuarioId, request.categoriaId())) {
            throw new IllegalArgumentException("Já existe uma meta cadastrada para esta categoria.");
        }

        Meta meta = Meta.builder()
            .usuario(usuario)
            .categoria(categoria)
            .nome(normalizarNome(request.nome()))
            .valorLimite(normalizarValorLimite(request.valorLimite()))
            .build();

        return metaRepository.save(meta);
    }

    @Transactional
    public Meta atualizarMeta(UUID metaId, UUID usuarioId, MetaRequestDTO request) {
        Meta meta = metaRepository.findByIdAndUsuarioId(metaId, usuarioId)
            .orElseThrow(() -> new EntityNotFoundException("Meta não encontrada para o usuário informado."));
        Categoria categoria = categoriaRepository.findById(request.categoriaId())
            .orElseThrow(() -> new EntityNotFoundException("Categoria não encontrada para o id: " + request.categoriaId()));

        validarCategoriaDaMeta(categoria, usuarioId);

        if (metaRepository.existsByUsuarioIdAndCategoriaIdAndIdNot(usuarioId, request.categoriaId(), metaId)) {
            throw new IllegalArgumentException("Já existe uma meta cadastrada para esta categoria.");
        }

        meta.setNome(normalizarNome(request.nome()));
        meta.setCategoria(categoria);
        meta.setValorLimite(normalizarValorLimite(request.valorLimite()));

        return metaRepository.save(meta);
    }

    @Transactional
    public void deletarMeta(UUID metaId, UUID usuarioId) {
        Meta meta = metaRepository.findByIdAndUsuarioId(metaId, usuarioId)
            .orElseThrow(() -> new EntityNotFoundException("Meta não encontrada para o usuário informado."));

        metaRepository.delete(meta);
    }

    @Transactional(readOnly = true)
    public List<MetaProgressoDTO> obterProgressoMetas(UUID usuarioId, Integer mes, Integer ano) {
        YearMonth competencia = criarCompetencia(mes, ano);
        LocalDate dataInicio = competencia.atDay(1);
        LocalDate dataFim = competencia.atEndOfMonth();

        return metaRepository.findByUsuarioId(usuarioId)
            .stream()
            .map(meta -> criarMetaProgresso(meta, usuarioId, dataInicio, dataFim))
            .toList();
    }

    private MetaProgressoDTO criarMetaProgresso(Meta meta, UUID usuarioId, LocalDate dataInicio, LocalDate dataFim) {
        BigDecimal valorLimite = valorOuZero(meta.getValorLimite());
        BigDecimal valorGasto = valorOuZero(
            transacaoRepository.somarDespesasPorUsuarioCategoriaEPeriodo(
                usuarioId,
                meta.getCategoria().getId(),
                dataInicio,
                dataFim
            )
        );

        return new MetaProgressoDTO(
            meta.getId(),
            meta.getNome(),
            meta.getCategoria().getId(),
            meta.getCategoria().getNome(),
            valorLimite,
            valorGasto,
            calcularPercentual(valorGasto, valorLimite)
        );
    }

    private void validarCategoriaDaMeta(Categoria categoria, UUID usuarioId) {
        String tipoCategoria = categoria.getTipo() != null ? categoria.getTipo().trim().toUpperCase(Locale.ROOT) : "";

        if (!"DESPESA".equals(tipoCategoria)) {
            throw new IllegalArgumentException("Metas só podem ser definidas para categorias de despesa.");
        }

        if (categoria.getUsuario() != null && !categoria.getUsuario().getId().equals(usuarioId)) {
            throw new EntityNotFoundException("Categoria não encontrada para o usuário informado.");
        }
    }

    private BigDecimal normalizarValorLimite(BigDecimal valorLimite) {
        BigDecimal valorNormalizado = valorOuZero(valorLimite);

        if (valorNormalizado.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("O valor limite da meta deve ser maior que zero.");
        }

        return valorNormalizado.setScale(2, RoundingMode.HALF_UP);
    }

    private String normalizarNome(String nome) {
        if (nome == null || nome.isBlank()) {
            throw new IllegalArgumentException("O nome da meta é obrigatório.");
        }

        return nome.trim();
    }

    private Double calcularPercentual(BigDecimal valorGasto, BigDecimal valorLimite) {
        if (valorLimite == null || valorLimite.compareTo(BigDecimal.ZERO) <= 0) {
            return 0D;
        }

        return valorGasto.multiply(BigDecimal.valueOf(100))
            .divide(valorLimite, 2, RoundingMode.HALF_UP)
            .doubleValue();
    }

    private YearMonth criarCompetencia(Integer mes, Integer ano) {
        LocalDate hoje = LocalDate.now();
        int mesCompetencia = mes != null ? mes : hoje.getMonthValue();
        int anoCompetencia = ano != null ? ano : hoje.getYear();

        try {
            return YearMonth.of(anoCompetencia, mesCompetencia);
        } catch (DateTimeException exception) {
            throw new IllegalArgumentException("Mês ou ano inválido para consultar metas.", exception);
        }
    }

    private BigDecimal valorOuZero(BigDecimal valor) {
        return valor != null ? valor : BigDecimal.ZERO;
    }
}