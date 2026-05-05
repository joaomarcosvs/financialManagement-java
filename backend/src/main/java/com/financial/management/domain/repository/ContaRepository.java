package com.financial.management.domain.repository;

import com.financial.management.domain.entity.Conta;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ContaRepository extends JpaRepository<Conta, UUID> {

	@Query("""
		select distinct c
		from Conta c
		join c.contasUsuarios cu
		where cu.usuario.id = :usuarioId
		""")
	List<Conta> findAllByUsuarioId(@Param("usuarioId") UUID usuarioId);
}