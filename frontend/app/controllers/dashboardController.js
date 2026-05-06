app.controller('DashboardController', function(DashboardService, $timeout) {
    var vm = this;
    var gastosChart;
    var agora = new Date();
    var mes = agora.getMonth() + 1;
    var ano = agora.getFullYear();
    var usuarioId = localStorage.getItem('usuario_id');

    vm.competenciaLabel = ('0' + mes).slice(-2) + '/' + ano;
    vm.dados = {
        saldoAtualTotal: 0,
        totalReceitas: 0,
        totalDespesas: 0,
        gastosPorCategoria: []
    };
    vm.mensagemErro = '';

    vm.carregarDados = function() {
        var usuarioIdFixo = 'eb5941ab-c615-49ef-8df4-1becfcc60c1c'; // Cole aqui o UUID real do seu banco
        var mes = 5;
        var ano = 2026;
        vm.mensagemErro = '';

        if (!usuarioId) {
            vm.mensagemErro = 'Usuário não identificado na sessão atual.';
            return;
        }

        DashboardService.obterResumo(usuarioId, mes, ano)
            .then(function(response) {
                vm.dados = response.data;

                $timeout(function() {
                    renderizarGrafico(vm.dados.gastosPorCategoria || []);
                });
            })
            .catch(function() {
                vm.mensagemErro = 'Não foi possível carregar o resumo do dashboard.';
            });
    };

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

    vm.carregarDados();
});