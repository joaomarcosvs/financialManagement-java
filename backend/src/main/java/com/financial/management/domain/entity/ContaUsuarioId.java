package com.financial.management.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode
public class ContaUsuarioId implements Serializable {

    private static final long serialVersionUID = 1L;

    @Column(name = "conta_id", nullable = false)
    private UUID contaId;

    @Column(name = "usuario_id", nullable = false)
    private UUID usuarioId;
}