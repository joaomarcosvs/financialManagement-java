package com.financial.management.domain.repository;

import com.financial.management.domain.entity.ContaUsuario;
import com.financial.management.domain.entity.ContaUsuarioId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContaUsuarioRepository extends JpaRepository<ContaUsuario, ContaUsuarioId> {
}