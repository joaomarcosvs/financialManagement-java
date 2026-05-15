package com.financial.management.domain.repository;

import com.financial.management.domain.entity.Transacao;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TransacaoRepository extends JpaRepository<Transacao, UUID> {

    interface GastosPorCategoriaProjection {

        String getCategoria();

        BigDecimal getValor();
    }

    List<Transacao> findAllByUsuario_Id(UUID usuarioId);

    List<Transacao> findByUsuarioIdAndDataTransacaoBetween(UUID usuarioId, LocalDate dataInicial, LocalDate dataFinal);

    List<Transacao> findAllByConta_Id(UUID contaId);

    boolean existsByConta_Id(UUID contaId);

    boolean existsByCategoria_Id(UUID categoriaId);

    @Modifying
    @Query("delete from Transacao t where t.usuario.id = :usuarioId")
    void deleteAllByUsuarioId(@Param("usuarioId") UUID usuarioId);

    List<Transacao> findAllByDataTransacaoBetween(LocalDate dataInicio, LocalDate dataFim);

    List<Transacao> findAllByStatus(String status);

    @Query("""
        select coalesce(sum(t.valor), 0)
        from Transacao t
        where t.usuario.id = :usuarioId
          and t.dataTransacao between :dataInicio and :dataFim
          and t.categoria.tipo = 'RECEITA'
        """)
    BigDecimal somarReceitasPorUsuarioEPeriodo(
        @Param("usuarioId") UUID usuarioId,
        @Param("dataInicio") LocalDate dataInicio,
        @Param("dataFim") LocalDate dataFim
    );

    @Query("""
        select coalesce(sum(t.valor), 0)
        from Transacao t
        where t.usuario.id = :usuarioId
          and t.dataTransacao between :dataInicio and :dataFim
          and t.categoria.tipo = 'DESPESA'
        """)
    BigDecimal somarDespesasPorUsuarioEPeriodo(
        @Param("usuarioId") UUID usuarioId,
        @Param("dataInicio") LocalDate dataInicio,
        @Param("dataFim") LocalDate dataFim
    );

    @Query("""
        select c.nome as categoria, coalesce(sum(t.valor), 0) as valor
        from Transacao t
        join t.categoria c
        where t.usuario.id = :usuarioId
          and t.dataTransacao between :dataInicio and :dataFim
          and c.tipo = 'DESPESA'
        group by c.nome
        order by sum(t.valor) desc
        """)
    List<GastosPorCategoriaProjection> somarDespesasPorCategoriaPorUsuarioEPeriodo(
        @Param("usuarioId") UUID usuarioId,
        @Param("dataInicio") LocalDate dataInicio,
        @Param("dataFim") LocalDate dataFim
    );
}