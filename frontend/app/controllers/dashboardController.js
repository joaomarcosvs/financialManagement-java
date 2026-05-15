app.controller('DashboardController', function(AuthService, DashboardService, $timeout) {
    var vm = this;
    var gastosChart;
    var agora = new Date();
    var nomesMeses = [
        'Janeiro',
        'Fevereiro',
        'Marco',
        'Abril',
        'Maio',
        'Junho',
        'Julho',
        'Agosto',
        'Setembro',
        'Outubro',
        'Novembro',
        'Dezembro'
    ];

    vm.usuarioLogado = AuthService.getUsuarioLogado();
    vm.mesAtual = agora.getMonth() + 1;
    vm.anoAtual = agora.getFullYear();
    vm.competenciaLabel = '';
    vm.saldoAtual = 0;
    vm.dados = {
        saldoAtualTotal: 0,
        totalReceitas: 0,
        totalDespesas: 0,
        gastosPorCategoria: []
    };
    vm.mensagemErro = '';

    vm.formatarMesAtual = function() {
        return nomesMeses[vm.mesAtual - 1] + ' ' + vm.anoAtual;
    };

    vm.mesAnterior = function() {
        if (vm.mesAtual === 1) {
            vm.mesAtual = 12;
            vm.anoAtual -= 1;
        } else {
            vm.mesAtual -= 1;
        }

        atualizarCompetenciaLabel();
        vm.carregarDashboard();
    };

    vm.proximoMes = function() {
        if (vm.mesAtual === 12) {
            vm.mesAtual = 1;
            vm.anoAtual += 1;
        } else {
            vm.mesAtual += 1;
        }

        atualizarCompetenciaLabel();
        vm.carregarDashboard();
    };

    vm.carregarDashboard = function() {
        vm.mensagemErro = '';

        if (!vm.usuarioLogado || !vm.usuarioLogado.id) {
            vm.mensagemErro = 'Usuário não identificado na sessão atual.';
            return;
        }

        DashboardService.obterResumo(vm.usuarioLogado.id, vm.mesAtual, vm.anoAtual)
            .then(function(response) {
                vm.dados = response.data;
                vm.saldoAtual = Number((vm.dados && vm.dados.saldoAtualTotal) || 0);

                $timeout(function() {
                    renderizarGrafico(vm.dados.gastosPorCategoria || []);
                });
            })
            .catch(function() {
                vm.mensagemErro = 'Não foi possível carregar o resumo do dashboard.';
            });
    };

            vm.carregarDados = vm.carregarDashboard;

    function renderizarGrafico(gastos) {
        var canvas = document.getElementById('gastosChart');

        if (!canvas || typeof Chart === 'undefined') {
            return;
        }

        if (gastosChart) {
            gastosChart.destroy();
        }

        gastosChart = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: gastos.map(function(item) {
                    return item.categoria;
                }),
                datasets: [{
                    data: gastos.map(function(item) {
                        return Number(item.valor);
                    }),
                    backgroundColor: [
                        '#10b981',
                        '#34d399',
                        '#6ee7b7',
                        '#059669',
                        '#047857',
                        '#a7f3d0'
                    ],
                    borderColor: '#0f172a',
                    borderWidth: 3,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#cbd5e1',
                            padding: 18,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }

    atualizarCompetenciaLabel();
    vm.carregarDashboard();

    function atualizarCompetenciaLabel() {
        vm.competenciaLabel = vm.formatarMesAtual();
    }
});