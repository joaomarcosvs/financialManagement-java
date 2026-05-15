package com.financial.management.domain.repository;

import com.financial.management.domain.entity.ContaUsuario;
import com.financial.management.domain.entity.ContaUsuarioId;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ContaUsuarioRepository extends JpaRepository<ContaUsuario, ContaUsuarioId> {

	long countByConta_Id(UUID contaId);

	@Modifying
	@Query("delete from ContaUsuario cu where cu.usuario.id = :usuarioId")
	void deleteAllByUsuarioId(@Param("usuarioId") UUID usuarioId);
}