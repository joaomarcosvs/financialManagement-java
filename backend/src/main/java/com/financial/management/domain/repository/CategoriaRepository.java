package com.financial.management.domain.repository;

import com.financial.management.domain.entity.Categoria;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoriaRepository extends JpaRepository<Categoria, UUID> {

    List<Categoria> findByUsuario_IdOrUsuarioIsNull(UUID usuarioId);

    void deleteAllByUsuario_Id(UUID usuarioId);
}