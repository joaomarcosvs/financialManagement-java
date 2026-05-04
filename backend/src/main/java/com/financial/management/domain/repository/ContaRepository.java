package com.financial.management.domain.repository;

import com.financial.management.domain.entity.Conta;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContaRepository extends JpaRepository<Conta, UUID> {
}