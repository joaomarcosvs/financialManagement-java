package com.financial.management.domain.repository;

import com.financial.management.domain.entity.Meta;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MetaRepository extends JpaRepository<Meta, UUID> {

    @Query("select m from Meta m join fetch m.categoria c where m.usuario.id = :usuarioId order by c.nome asc")
    List<Meta> findByUsuarioId(@Param("usuarioId") UUID usuarioId);

    @Query("select count(m) > 0 from Meta m where m.usuario.id = :usuarioId and m.categoria.id = :categoriaId")
    boolean existsByUsuarioIdAndCategoriaId(@Param("usuarioId") UUID usuarioId, @Param("categoriaId") UUID categoriaId);

    @Query("""
        select count(m) > 0
        from Meta m
        where m.usuario.id = :usuarioId
          and m.categoria.id = :categoriaId
          and m.id <> :metaId
        """)
    boolean existsByUsuarioIdAndCategoriaIdAndIdNot(
        @Param("usuarioId") UUID usuarioId,
        @Param("categoriaId") UUID categoriaId,
        @Param("metaId") UUID metaId
    );

    @Query("select m from Meta m where m.id = :metaId and m.usuario.id = :usuarioId")
    Optional<Meta> findByIdAndUsuarioId(@Param("metaId") UUID metaId, @Param("usuarioId") UUID usuarioId);
}