package com.financial.management.domain.repository;

import com.financial.management.domain.entity.Usuario;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, UUID> {
}