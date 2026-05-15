package com.financial.management.api.controller;

import com.financial.management.api.dto.DashboardResponseDTO;
import com.financial.management.domain.service.DashboardService;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<DashboardResponseDTO> buscarDashboard(
        @PathVariable UUID usuarioId,
        @RequestParam(required = false) Integer mes,
        @RequestParam(required = false) Integer ano
    ) {
        return ResponseEntity.ok(dashboardService.buscarDashboard(usuarioId, mes, ano));
    }
}