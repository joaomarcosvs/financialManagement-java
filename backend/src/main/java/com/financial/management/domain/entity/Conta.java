package com.financial.management.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Builder.Default;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "contas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Conta {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    @EqualsAndHashCode.Include
    private UUID id;

    @Column(name = "nome", nullable = false, length = 120)
    private String nome;

    @Column(name = "tipo", nullable = false, length = 30)
    private String tipo;

    @Column(name = "saldo_atual", nullable = false, precision = 19, scale = 2)
    private BigDecimal saldoAtual;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private OffsetDateTime criadoEm;

    @Default
    @OneToMany(mappedBy = "conta", fetch = FetchType.LAZY)
    private Set<ContaUsuario> contasUsuarios = new HashSet<>();

    @Default
    @OneToMany(mappedBy = "conta", fetch = FetchType.LAZY)
    private Set<Transacao> transacoes = new HashSet<>();
}