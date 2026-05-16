app.controller('DashboardController', function(AuthService, DashboardService, $rootScope, $timeout) {
    var vm = this;
    var gastosChart;
    var lineChart;
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
    vm.competenciaInicioTendencia = formatarCompetenciaNumerica(1, vm.anoAtual);
    vm.competenciaFimTendencia = formatarCompetenciaNumerica(vm.mesAtual, vm.anoAtual);
    vm.competenciaLabel = '';
    vm.intervaloTendenciasLabel = '';
    vm.semDadosGastos = false;
    vm.semDadosTendencias = false;
    vm.saldoAtual = 0;
    vm.dados = {
        saldoAtualTotal: 0,
        totalReceitas: 0,
        totalDespesas: 0,
        gastosPorCategoria: []
    };
    vm.lineLabels = [];
    vm.lineSeries = ['Receitas', 'Despesas'];
    vm.lineData = [[], []];
    vm.lineColors = ['#10b981', '#f43f5e'];
    vm.doughnutColors = ['#f43f5e', '#f59e0b', '#06b6d4', '#8b5cf6', '#3b82f6', '#10b981'];
    vm.lineOptions = {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        },
        elements: {
            line: {
                tension: 0.4
            }
        }
    };
    vm.mensagemErro = '';
    vm.mensagemErroTendencias = '';

    vm.formatarMesAtual = function() {
        return nomesMeses[vm.mesAtual - 1] + ' ' + vm.anoAtual;
    };

    vm.formatarCompetenciaAtual = function() {
        return String(vm.mesAtual).padStart(2, '0') + '-' + vm.anoAtual;
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

    vm.aoAlterarIntervaloTendencias = function(origem) {
        var competenciaInicio = normalizarCompetencia(vm.competenciaInicioTendencia);
        var competenciaFim = normalizarCompetencia(vm.competenciaFimTendencia);

        vm.mensagemErroTendencias = '';

        if (!competenciaEstaCompleta(vm.competenciaInicioTendencia) || !competenciaEstaCompleta(vm.competenciaFimTendencia)) {
            return;
        }

        if (!competenciaInicio || !competenciaFim) {
            vm.mensagemErroTendencias = 'Informe competências válidas no formato MM-yyyy.';
            return;
        }

        if (competenciaInicio.getTime() > competenciaFim.getTime()) {
            if (origem === 'inicio') {
                vm.competenciaFimTendencia = formatarCompetenciaMesAno(criarDataCompetencia(
                    competenciaInicio.getFullYear(),
                    competenciaInicio.getMonth() + 1
                ));
            } else {
                vm.competenciaInicioTendencia = formatarCompetenciaMesAno(criarDataCompetencia(
                    competenciaFim.getFullYear(),
                    competenciaFim.getMonth() + 1
                ));
            }
        }

        vm.carregarTendencias();
    };

    vm.carregarDashboard = function() {
        vm.mensagemErro = '';

        if (!vm.usuarioLogado || !vm.usuarioLogado.id) {
            vm.mensagemErro = 'Usuário não identificado na sessão atual.';
            return;
        }

        DashboardService.obterResumo(vm.usuarioLogado.id, vm.mesAtual, vm.anoAtual)
            .then(function(response) {
                var gastos = (response.data && response.data.gastosPorCategoria) || [];

                vm.dados = response.data;
                vm.saldoAtual = Number((vm.dados && vm.dados.saldoAtualTotal) || 0);
                vm.semDadosGastos = !possuiDadosDoughnut(gastos);

                $timeout(function() {
                    renderizarGrafico(gastos);
                });
            })
            .catch(function() {
                vm.mensagemErro = 'Não foi possível carregar o resumo do dashboard.';
                vm.semDadosGastos = true;
            });
    };

    vm.carregarTendencias = function() {
        var intervalo = obterIntervaloTendenciasSelecionado();

        vm.mensagemErroTendencias = '';

        if (!intervalo) {
            return;
        }

        vm.intervaloTendenciasLabel = intervalo.label;

        DashboardService.obterTendencias(intervalo.mesInicio, intervalo.anoInicio, intervalo.mesFim, intervalo.anoFim)
            .then(function(response) {
                var tendencias = response.data || [];

                vm.lineLabels = tendencias.map(function(item) {
                    return item.mes;
                });
                vm.lineData = [
                    tendencias.map(function(item) {
                        return Number(item.receitas || 0);
                    }),
                    tendencias.map(function(item) {
                        return Number(item.despesas || 0);
                    })
                ];
                vm.semDadosTendencias = !possuiDadosLinha(vm.lineData);

                $timeout(function() {
                    renderizarGraficoLinha();
                });
            })
            .catch(function() {
                vm.mensagemErroTendencias = 'Não foi possível carregar o acompanhamento financeiro.';
                vm.semDadosTendencias = true;
            });
    };

    vm.carregarDados = vm.carregarDashboard;

    function renderizarGrafico(gastos) {
        var canvas = document.getElementById('gastosChart');

        if (gastosChart) {
            gastosChart.destroy();
            gastosChart = null;
        }

        if (vm.semDadosGastos || !canvas || typeof Chart === 'undefined') {
            return;
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
                    backgroundColor: gastos.map(function(item, index) {
                        return item.cor || vm.doughnutColors[index % vm.doughnutColors.length];
                    }),
                    borderColor: '#0f172a',
                    borderWidth: 3,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    tooltip: {
                        enabled: !$rootScope.modoPrivacidade,
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + formatarMoeda(context.raw);
                            }
                        }
                    },
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

    function renderizarGraficoLinha() {
        var canvas = document.getElementById('line');
        var escalaY = calcularEscalaLinha();

        if (lineChart) {
            lineChart.destroy();
            lineChart = null;
        }

        if (vm.semDadosTendencias || !canvas || typeof Chart === 'undefined') {
            return;
        }

        lineChart = new Chart(canvas, {
            type: 'line',
            data: {
                labels: vm.lineLabels,
                datasets: vm.lineSeries.map(function(serie, index) {
                    return {
                        label: serie,
                        data: vm.lineData[index] || [],
                        borderColor: vm.lineColors[index],
                        backgroundColor: converterHexParaRgba(vm.lineColors[index], 0.16),
                        pointBackgroundColor: vm.lineColors[index],
                        pointBorderColor: '#020617',
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBorderWidth: 2,
                        fill: true,
                        borderWidth: 3,
                        tension: obterTensaoLinha()
                    };
                })
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#cbd5e1',
                            padding: 18,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        enabled: !$rootScope.modoPrivacidade,
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + formatarMoeda(context.raw);
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#94a3b8'
                        },
                        grid: {
                            color: 'rgba(148, 163, 184, 0.08)'
                        }
                    },
                    y: {
                        beginAtZero: false,
                        min: escalaY.min,
                        max: escalaY.max,
                        ticks: {
                            color: '#94a3b8',
                            callback: function(valor) {
                                return formatarMoeda(valor);
                            }
                        },
                        grid: {
                            color: 'rgba(148, 163, 184, 0.08)'
                        }
                    }
                }
            }
        });
    }

    atualizarCompetenciaLabel();
    vm.carregarDashboard();
    vm.carregarTendencias();

    function atualizarCompetenciaLabel() {
        vm.competenciaLabel = vm.formatarCompetenciaAtual();
    }

    function obterIntervaloTendenciasSelecionado() {
        var competenciaInicio = normalizarCompetencia(vm.competenciaInicioTendencia);
        var competenciaFim = normalizarCompetencia(vm.competenciaFimTendencia);

        if (!competenciaEstaCompleta(vm.competenciaInicioTendencia) || !competenciaEstaCompleta(vm.competenciaFimTendencia)) {
            return null;
        }

        if (!competenciaInicio || !competenciaFim) {
            vm.mensagemErroTendencias = 'Informe competências válidas no formato MM-yyyy.';
            return null;
        }

        if (competenciaInicio.getTime() > competenciaFim.getTime()) {
            vm.mensagemErroTendencias = 'A competência inicial deve ser menor ou igual à competência final.';
            return null;
        }

        return {
            mesInicio: competenciaInicio.getMonth() + 1,
            anoInicio: competenciaInicio.getFullYear(),
            mesFim: competenciaFim.getMonth() + 1,
            anoFim: competenciaFim.getFullYear(),
            label: formatarCompetenciaMesAno(competenciaInicio) + ' até ' + formatarCompetenciaMesAno(competenciaFim)
        };
    }

    function normalizarCompetencia(valor) {
        var partes;
        var ano;
        var mes;

        if (typeof valor === 'string' && /^\d{2}-\d{4}$/.test(valor)) {
            partes = valor.split('-');
            mes = Number(partes[0]);
            ano = Number(partes[1]);

            if (!ano || !mes || mes < 1 || mes > 12) {
                return null;
            }

            return criarDataCompetencia(ano, mes);
        }

        return null;
    }

    function criarDataCompetencia(ano, mes) {
        return new Date(ano, mes - 1, 1);
    }

    function formatarCompetenciaMesAno(data) {
        return formatarCompetenciaNumerica(data.getMonth() + 1, data.getFullYear());
    }

    function formatarCompetenciaNumerica(mes, ano) {
        return String(mes).padStart(2, '0') + '-' + ano;
    }

    function competenciaEstaCompleta(valor) {
        return typeof valor === 'string' && /^\d{2}-\d{4}$/.test(valor);
    }

    function formatarMoeda(valor) {
        return Number(valor || 0).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    }

    function obterInicioZeroLinha() {
        return !!(
            vm.lineOptions &&
            vm.lineOptions.scales &&
            vm.lineOptions.scales.yAxes &&
            vm.lineOptions.scales.yAxes[0] &&
            vm.lineOptions.scales.yAxes[0].ticks &&
            vm.lineOptions.scales.yAxes[0].ticks.beginAtZero
        );
    }

    function calcularEscalaLinha() {
        var valores = [];
        var menorValor;
        var maiorValor;
        var amplitude;
        var padding;
        var minimo;
        var maximo;

        (vm.lineData || []).forEach(function(serie) {
            (serie || []).forEach(function(valor) {
                valores.push(Number(valor || 0));
            });
        });

        if (!valores.length) {
            return {
                min: 0,
                max: 100
            };
        }

        menorValor = Math.min.apply(null, valores);
        maiorValor = Math.max.apply(null, valores);
        amplitude = maiorValor - menorValor;
        padding = amplitude > 0 ? amplitude * 0.18 : Math.max(maiorValor * 0.2, 100);

        minimo = menorValor > 0
            ? Math.max(0, menorValor - padding)
            : menorValor - padding;
        maximo = maiorValor + padding;

        if (minimo === maximo) {
            maximo = minimo + 100;
        }

        return {
            min: minimo,
            max: maximo
        };
    }

    function obterTensaoLinha() {
        return vm.lineOptions &&
            vm.lineOptions.elements &&
            vm.lineOptions.elements.line &&
            typeof vm.lineOptions.elements.line.tension === 'number'
            ? vm.lineOptions.elements.line.tension
            : 0.4;
    }

    function converterHexParaRgba(hex, alpha) {
        var valor = (hex || '').replace('#', '');
        var r;
        var g;
        var b;

        if (valor.length !== 6) {
            return 'rgba(16, 185, 129, ' + alpha + ')';
        }

        r = parseInt(valor.substring(0, 2), 16);
        g = parseInt(valor.substring(2, 4), 16);
        b = parseInt(valor.substring(4, 6), 16);

        return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
    }

    function possuiDadosLinha(series) {
        return (series || []).some(function(linha) {
            return (linha || []).some(function(valor) {
                return Number(valor || 0) > 0;
            });
        });
    }

    function possuiDadosDoughnut(gastos) {
        return (gastos || []).some(function(item) {
            return Number((item && item.valor) || 0) > 0;
        });
    }
});