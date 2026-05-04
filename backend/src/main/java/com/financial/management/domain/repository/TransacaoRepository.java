package com.financial.management.domain.repository;

import com.financial.management.domain.entity.Transacao;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransacaoRepository extends JpaRepository<Transacao, UUID> {

    List<Transacao> findAllByUsuario_Id(UUID usuarioId);

    List<Transacao> findAllByConta_Id(UUID contaId);

    List<Transacao> findAllByDataTransacaoBetween(LocalDate dataInicio, LocalDate dataFim);

    List<Transacao> findAllByStatus(String status);
}