app.controller('ExtratoController', function($document, $scope, AuthService, CategoriaService, ContaService, MetaService, TransacaoService) {
    var vm = this;
    var dataAtual = new Date();
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

    vm.usuarioLogado = null;
    vm.transacoes = [];
    vm.contas = [];
    vm.listaCategoriasReais = [];
    vm.mesAtual = dataAtual.getMonth() + 1;
    vm.anoAtual = dataAtual.getFullYear();
    vm.tiposTransacao = ['RECEITA', 'DESPESA'];
    vm.frequenciasRecorrencia = [
        { valor: 'DIARIA', nome: 'Diariamente' },
        { valor: 'SEMANAL', nome: 'Semanalmente' },
        { valor: 'MENSAL', nome: 'Mensal' },
        { valor: 'TRIMESTRAL', nome: 'Trimestral' },
        { valor: 'SEMESTRAL', nome: 'Semestral' },
        { valor: 'ANUAL', nome: 'Anual' }
    ];
    vm.mesesRecorrencia = [
        { valor: 1, nome: 'Janeiro' },
        { valor: 2, nome: 'Fevereiro' },
        { valor: 3, nome: 'Marco' },
        { valor: 4, nome: 'Abril' },
        { valor: 5, nome: 'Maio' },
        { valor: 6, nome: 'Junho' },
        { valor: 7, nome: 'Julho' },
        { valor: 8, nome: 'Agosto' },
        { valor: 9, nome: 'Setembro' },
        { valor: 10, nome: 'Outubro' },
        { valor: 11, nome: 'Novembro' },
        { valor: 12, nome: 'Dezembro' }
    ];
    vm.anosRecorrencia = construirAnosRecorrencia();
    vm.mensagemErro = '';
    vm.mensagemModalErro = '';
    vm.modalAberto = false;
    vm.modalEdicaoAberto = false;
    vm.modalExclusaoAberto = false;
    vm.mensagemEdicaoErro = '';
    vm.mensagemExclusaoErro = '';
    vm.transacaoPendenteExclusao = null;
    vm.transacaoEmEdicao = {};
    vm.excluindoTransacaoId = null;
    vm.confirmacaoEdicaoAberta = false;
    vm.transacaoPendenteEdicao = null;
    vm.filtro = { tipo: '', categoriaId: '', descricao: '', tag: '' };
    vm.avisoMetaAberto = false;
    vm.avisoMetaInfo = null;
    vm.payloadPendenteMeta = null;

    vm.obterCategoriasPorTipo = function(tipo) {
        if (!tipo) {
            return vm.listaCategoriasReais.slice();
        }

        return vm.listaCategoriasReais.filter(function(categoria) {
            return categoria && categoria.tipo === tipo;
        });
    };

    vm.aoAlterarTipoTransacao = function() {
        if (!vm.novaTransacao) {
            return;
        }

        vm.novaTransacao.categoriaId = null;
    };

    vm.aoAlterarRecorrencia = function() {
        if (!vm.novaTransacao) {
            return;
        }

        if (!vm.novaTransacao.recorrente) {
            vm.novaTransacao.frequencia = 'MENSAL';
            aplicarLimiteRecorrenciaPadrao();
            return;
        }

        aplicarLimiteRecorrenciaPadrao();
    };

    vm.aoAlterarTipoTransacaoEdicao = function() {
        if (!vm.transacaoEmEdicao) {
            return;
        }

        vm.transacaoEmEdicao.categoriaId = null;
    };

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

        vm.carregarTransacoes();
    };

    vm.proximoMes = function() {
        if (vm.mesAtual === 12) {
            vm.mesAtual = 1;
            vm.anoAtual += 1;
        } else {
            vm.mesAtual += 1;
        }

        vm.carregarTransacoes();
    };

    vm.abrirModal = function() {
        vm.mensagemErro = '';
        vm.mensagemModalErro = '';
        var categoriasPadrao;

        if (!vm.usuarioLogado || !vm.usuarioLogado.id) {
            vm.mensagemErro = 'Usuário não identificado na sessão atual.';
            return;
        }

        if (!vm.contas.length) {
            vm.mensagemErro = 'Nenhuma conta disponível para o usuário logado.';
            return;
        }

        if (!vm.listaCategoriasReais.length) {
            vm.mensagemErro = 'Nenhuma categoria disponível para nova transação.';
            return;
        }

        categoriasPadrao = vm.obterCategoriasPorTipo('DESPESA');

        vm.novaTransacao = {
            tipo: 'DESPESA',
            contaId: vm.contas[0].id,
            categoriaId: categoriasPadrao.length ? categoriasPadrao[0].id : null,
            recorrente: false,
            frequencia: 'MENSAL'
        };

        aplicarLimiteRecorrenciaPadrao();
        vm.modalAberto = true;
    };

    vm.fecharModal = function() {
        vm.modalAberto = false;
        vm.mensagemModalErro = '';
        vm.novaTransacao = {};
    };

    vm.fecharModalEdicao = function() {
        vm.modalEdicaoAberto = false;
        vm.mensagemEdicaoErro = '';
        vm.transacaoEmEdicao = {};
    };

    vm.fecharModalExclusao = function(forcarFechamento) {
        if (vm.excluindoTransacaoId && !forcarFechamento) {
            return;
        }

        vm.modalExclusaoAberto = false;
        vm.mensagemExclusaoErro = '';
        vm.transacaoPendenteExclusao = null;
    };

    vm.carregarTransacoes = function() {
        if (!vm.usuarioLogado || !vm.usuarioLogado.id) {
            vm.mensagemErro = 'Usuário não identificado na sessão atual.';
            return;
        }

        vm.mensagemErro = '';

        TransacaoService.listarPorUsuario(vm.usuarioLogado.id, vm.mesAtual, vm.anoAtual)
            .then(function(response) {
                vm.transacoes = response.data || [];
            })
            .catch(function() {
                vm.mensagemErro = 'Não foi possível carregar o histórico de transações.';
            });
    };

    vm.carregarContas = function() {
        if (!vm.usuarioLogado || !vm.usuarioLogado.id) {
            return;
        }

        ContaService.listarPorUsuario(vm.usuarioLogado.id)
            .then(function(response) {
                vm.contas = response.data || [];
            })
            .catch(function() {
                vm.mensagemErro = 'Não foi possível carregar as contas do usuário logado.';
            });
    };

    vm.carregarCategorias = function() {
        CategoriaService.listarTodas()
            .then(function(response) {
                vm.listaCategoriasReais = response.data || [];
            })
            .catch(function() {
                vm.mensagemErro = 'Não foi possível carregar as categorias.';
            });
    };

    vm.salvarTransacao = function() {
        var dataTransacao = vm.novaTransacao.dataTransacao;
        var payload;
        var mensagemErro = 'Não foi possível salvar a transação.';
        var dataBase;
        var mesTransacao;
        var anoTransacao;

        vm.mensagemModalErro = '';

        if (!vm.usuarioLogado || !vm.usuarioLogado.id) {
            vm.mensagemModalErro = 'Usuário não identificado na sessão atual.';
            return;
        }

        if (dataTransacao instanceof Date) {
            dataTransacao = dataTransacao.toISOString().slice(0, 10);
        }

        payload = {
            usuarioId: vm.usuarioLogado.id,
            contaId: vm.novaTransacao.contaId,
            categoriaId: vm.novaTransacao.categoriaId,
            valor: parseFloat(vm.novaTransacao.valor),
            dataTransacao: dataTransacao,
            descricao: vm.novaTransacao.descricao,
            status: vm.novaTransacao.tipo,
            recorrente: !!vm.novaTransacao.recorrente,
            frequencia: vm.novaTransacao.recorrente ? vm.novaTransacao.frequencia : null,
            mesFimRecorrencia: vm.novaTransacao.recorrente ? parseInt(vm.novaTransacao.mesFimRecorrencia, 10) : null,
            anoFimRecorrencia: vm.novaTransacao.recorrente ? parseInt(vm.novaTransacao.anoFimRecorrencia, 10) : null
        };

        if (!payload.contaId || !payload.categoriaId) {
            vm.mensagemModalErro = 'Selecione uma conta e uma categoria válidas.';
            return;
        }

        if (payload.recorrente && (!payload.frequencia || !payload.mesFimRecorrencia || !payload.anoFimRecorrencia)) {
            vm.mensagemModalErro = 'Informe a frequência e até quando a transação deve se repetir.';
            return;
        }

        if (payload.recorrente && !limiteRecorrenciaEhValido(dataTransacao, payload.mesFimRecorrencia, payload.anoFimRecorrencia)) {
            vm.mensagemModalErro = 'O período final da recorrência deve ser igual ou posterior à data da transação.';
            return;
        }

        if (vm.novaTransacao.tipo === 'DESPESA' && !isNaN(payload.valor) && payload.valor > 0) {
            dataBase = typeof dataTransacao === 'string' ? new Date(dataTransacao + 'T00:00:00') : dataTransacao;
            mesTransacao = dataBase.getMonth() + 1;
            anoTransacao = dataBase.getFullYear();

            MetaService.obterProgresso(mesTransacao, anoTransacao)
                .then(function(response) {
                    var metas = response.data || [];
                    var metaAfetada = metas.find(function(m) {
                        return m.categoriaId === payload.categoriaId;
                    });

                    if (metaAfetada) {
                        var novoTotal = Number(metaAfetada.valorGasto || 0) + payload.valor;
                        var limite = Number(metaAfetada.valorLimite || 0);

                        if (novoTotal > limite) {
                            vm.avisoMetaInfo = {
                                nomeMeta: metaAfetada.nomeMeta,
                                nomeCategoria: metaAfetada.nomeCategoria,
                                valorGasto: Number(metaAfetada.valorGasto || 0),
                                valorLimite: limite,
                                novoTotal: novoTotal
                            };
                            vm.payloadPendenteMeta = payload;
                            vm.avisoMetaAberto = true;
                            return;
                        }
                    }

                    executarCriarTransacao(payload);
                })
                .catch(function() {
                    executarCriarTransacao(payload);
                });
        } else {
            executarCriarTransacao(payload);
        }

        function executarCriarTransacao(p) {
            TransacaoService.criar(p)
                .then(function() {
                    vm.fecharModal();
                    vm.novaTransacao = {};
                    vm.carregarTransacoes();
                })
                .catch(function(error) {
                    if (error && error.data) {
                        if (typeof error.data === 'string') {
                            mensagemErro = error.data;
                        } else if (error.data.status) {
                            mensagemErro = error.data.status;
                        } else {
                            mensagemErro = Object.values(error.data).join(' ');
                        }
                    }

                    vm.mensagemModalErro = mensagemErro;
                });
        }
    };

    vm.confirmarSalvarComAvisoMeta = function() {
        var payload = vm.payloadPendenteMeta;
        vm.avisoMetaAberto = false;
        vm.avisoMetaInfo = null;
        vm.payloadPendenteMeta = null;

        if (!payload) {
            return;
        }

        TransacaoService.criar(payload)
            .then(function() {
                vm.fecharModal();
                vm.novaTransacao = {};
                vm.carregarTransacoes();
            })
            .catch(function(error) {
                vm.mensagemModalErro = extrairMensagemErro(error, 'Não foi possível salvar a transação.');
            });
    };

    vm.cancelarAvisoMeta = function() {
        vm.avisoMetaAberto = false;
        vm.avisoMetaInfo = null;
        vm.payloadPendenteMeta = null;
    };

    vm.excluirTransacao = function(transacao) {
        if (!transacao || !transacao.id || vm.excluindoTransacaoId) {
            return;
        }

        vm.mensagemExclusaoErro = '';
        vm.transacaoPendenteExclusao = transacao;
        vm.modalExclusaoAberto = true;
    };

    vm.visualizarTransacao = angular.noop;
    vm.editarTransacao = function(transacao) {
        if (!transacao || !transacao.id) {
            return;
        }

        if (transacao.origem === 'WHATSAPP') {
            vm.transacaoPendenteEdicao = transacao;
            vm.confirmacaoEdicaoAberta = true;
            return;
        }

        abrirModalEdicao(transacao);
    };

    vm.confirmarAberturaEdicao = function() {
        var transacao = vm.transacaoPendenteEdicao;
        vm.confirmacaoEdicaoAberta = false;
        vm.transacaoPendenteEdicao = null;

        if (transacao) {
            abrirModalEdicao(transacao);
        }
    };

    vm.cancelarConfirmacaoEdicao = function() {
        vm.confirmacaoEdicaoAberta = false;
        vm.transacaoPendenteEdicao = null;
    };

    vm.transacoesFiltradas = function() {
        return vm.transacoes.filter(function(t) {
            var passaTipo = !vm.filtro.tipo || t.tipo === vm.filtro.tipo;
            var passaCategoria = !vm.filtro.categoriaId || t.categoriaId === vm.filtro.categoriaId;
            var passaDescricao = !vm.filtro.descricao ||
                (t.descricao || '').toLowerCase().indexOf(vm.filtro.descricao.toLowerCase()) !== -1;
            var tagBusca = vm.filtro.tag ? vm.filtro.tag.toLowerCase() : '';
            var passaTag = !tagBusca || (
                Array.isArray(t.tags) && t.tags.some(function(tag) {
                    return (tag || '').toLowerCase().indexOf(tagBusca) !== -1;
                })
            );
            return passaTipo && passaCategoria && passaDescricao && passaTag;
        });
    };

    vm.limparFiltros = function() {
        vm.filtro = { tipo: '', categoriaId: '', descricao: '', tag: '' };
    };

    vm.exportarCSV = function() {
        if (!vm.transacoes || !vm.transacoes.length) {
            return;
        }

        var cabecalho = ['Data', 'Descricao', 'Categoria', 'Tipo', 'Valor', 'Origem'];
        var linhas = vm.transacoesFiltradas().map(function(t) {
            return [
                t.dataTransacao,
                '"' + (t.descricao || '').replace(/"/g, '""') + '"',
                '"' + (t.categoriaNome || '') + '"',
                t.tipo,
                Number(t.valor).toFixed(2).replace('.', ','),
                t.origem || 'MANUAL'
            ].join(';');
        });

        var conteudo = [cabecalho.join(';')].concat(linhas).join('\n');
        var blob = new Blob(['﻿' + conteudo], { type: 'text/csv;charset=utf-8;' });
        var url = URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = url;
        link.download = 'extrato-' + vm.anoAtual + '-' + String(vm.mesAtual).padStart(2, '0') + '.csv';
        link.click();
        URL.revokeObjectURL(url);
    };

    vm.exportarPDF = function() {
        var transacoes;
        var doc;
        var totalReceitas;
        var totalDespesas;
        var rows;
        var today;

        if (!vm.transacoes || !vm.transacoes.length) {
            return;
        }

        if (!window.jspdf || !window.jspdf.jsPDF) {
            vm.mensagemErro = 'Biblioteca de PDF não disponível. Tente novamente.';
            return;
        }

        transacoes = vm.transacoesFiltradas();

        if (!transacoes.length) {
            return;
        }

        doc = new window.jspdf.jsPDF();
        today = new Date().toLocaleDateString('pt-BR');

        totalReceitas = transacoes
            .filter(function(t) { return t.tipo === 'RECEITA'; })
            .reduce(function(sum, t) { return sum + Number(t.valor || 0); }, 0);
        totalDespesas = transacoes
            .filter(function(t) { return t.tipo === 'DESPESA'; })
            .reduce(function(sum, t) { return sum + Number(t.valor || 0); }, 0);

        doc.setTextColor(16, 185, 129);
        doc.setFontSize(20);
        doc.setFont(undefined, 'bold');
        doc.text('Extrato Financeiro', 14, 20);

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.setFont(undefined, 'normal');
        doc.text(vm.formatarMesAtual() + '  ·  Gerado em ' + today, 14, 28);

        doc.setFontSize(9);
        doc.setTextColor(20, 150, 90);
        doc.text('Receitas: R$ ' + totalReceitas.toFixed(2).replace('.', ','), 14, 38);
        doc.setTextColor(200, 50, 50);
        doc.text('Despesas: R$ ' + totalDespesas.toFixed(2).replace('.', ','), 70, 38);
        doc.setTextColor(40, 40, 40);
        doc.text('Saldo: R$ ' + (totalReceitas - totalDespesas).toFixed(2).replace('.', ','), 135, 38);

        rows = transacoes.map(function(t) {
            return [
                new Date(t.dataTransacao + 'T00:00:00').toLocaleDateString('pt-BR'),
                (t.descricao || '-').substring(0, 38),
                (t.categoriaNome || '-').substring(0, 20),
                t.tipo,
                'R$ ' + Number(t.valor).toFixed(2).replace('.', ',')
            ];
        });

        doc.autoTable({
            startY: 44,
            head: [['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor']],
            body: rows,
            headStyles: {
                fillColor: [16, 185, 129],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 8
            },
            bodyStyles: {
                fontSize: 8,
                textColor: [40, 40, 40]
            },
            alternateRowStyles: {
                fillColor: [242, 250, 246]
            },
            columnStyles: {
                0: { cellWidth: 22 },
                1: { cellWidth: 68 },
                2: { cellWidth: 38 },
                3: { cellWidth: 22 },
                4: { cellWidth: 32, halign: 'right' }
            },
            margin: { left: 14, right: 14 }
        });

        doc.save('extrato-' + vm.anoAtual + '-' + String(vm.mesAtual).padStart(2, '0') + '.pdf');
    };

    vm.salvarEdicaoTransacao = function() {
        var dataTransacao = vm.transacaoEmEdicao.dataTransacao;
        var payload;
        var mensagemErro = 'Não foi possível atualizar a transação.';

        vm.mensagemEdicaoErro = '';

        if (!vm.usuarioLogado || !vm.usuarioLogado.id) {
            vm.mensagemEdicaoErro = 'Usuário não identificado na sessão atual.';
            return;
        }

        if (!vm.transacaoEmEdicao || !vm.transacaoEmEdicao.id) {
            vm.mensagemEdicaoErro = 'Transação inválida para edição.';
            return;
        }

        if (dataTransacao instanceof Date) {
            dataTransacao = dataTransacao.toISOString().slice(0, 10);
        }

        payload = {
            usuarioId: vm.usuarioLogado.id,
            contaId: vm.transacaoEmEdicao.contaId,
            categoriaId: vm.transacaoEmEdicao.categoriaId,
            valor: parseFloat(vm.transacaoEmEdicao.valor),
            dataTransacao: dataTransacao,
            descricao: vm.transacaoEmEdicao.descricao,
            status: vm.transacaoEmEdicao.tipo,
            recorrente: false,
            frequencia: null,
            mesFimRecorrencia: null,
            anoFimRecorrencia: null
        };

        if (!payload.contaId || !payload.categoriaId) {
            vm.mensagemEdicaoErro = 'Selecione uma conta e uma categoria válidas.';
            return;
        }

        TransacaoService.atualizar(vm.transacaoEmEdicao.id, payload)
            .then(function() {
                vm.fecharModalEdicao();
                vm.carregarTransacoes();
            })
            .catch(function(error) {
                vm.mensagemEdicaoErro = extrairMensagemErro(error, mensagemErro);
            });
    };

    vm.confirmarExclusao = function() {
        var mensagemErro = 'Não foi possível excluir a transação.';
        var transacao = vm.transacaoPendenteExclusao;

        if (!transacao || !transacao.id || vm.excluindoTransacaoId) {
            return;
        }

        vm.mensagemErro = '';
        vm.mensagemExclusaoErro = '';
        vm.excluindoTransacaoId = transacao.id;

        TransacaoService.deletar(transacao.id)
            .then(function() {
                vm.transacoes = vm.transacoes.filter(function(item) {
                    return item.id !== transacao.id;
                });

                vm.fecharModalExclusao(true);
            })
            .catch(function(error) {
                if (error && error.data) {
                    mensagemErro = extrairMensagemErro(error, mensagemErro);
                }

                vm.mensagemErro = mensagemErro;
                vm.mensagemExclusaoErro = mensagemErro;
            })
            .finally(function() {
                vm.excluindoTransacaoId = null;
            });
    };

    vm.usuarioLogado = AuthService.getUsuarioLogado();

    $document.on('keydown', handleKeydown);

    $scope.$on('$destroy', function() {
        $document.off('keydown', handleKeydown);
    });

    if (!vm.usuarioLogado || !vm.usuarioLogado.id) {
        vm.mensagemErro = 'Usuário não identificado na sessão atual.';
        return;
    }

    vm.carregarTransacoes();
    vm.carregarContas();
    vm.carregarCategorias();

    function handleKeydown(event) {
        if (event.key !== 'Escape') {
            return;
        }

        $scope.$applyAsync(function() {
            if (vm.avisoMetaAberto) {
                vm.cancelarAvisoMeta();
                return;
            }

            if (vm.confirmacaoEdicaoAberta) {
                vm.cancelarConfirmacaoEdicao();
                return;
            }

            if (vm.modalExclusaoAberto) {
                vm.fecharModalExclusao();
                return;
            }

            if (vm.modalEdicaoAberto) {
                vm.fecharModalEdicao();
                return;
            }

            if (vm.modalAberto) {
                vm.fecharModal();
            }
        });
    }

    function abrirModalEdicao(transacao) {
        vm.mensagemErro = '';
        vm.mensagemEdicaoErro = '';

        if (!vm.contas.length) {
            vm.mensagemErro = 'Nenhuma conta disponível para edição.';
            return;
        }

        if (!vm.listaCategoriasReais.length) {
            vm.mensagemErro = 'Nenhuma categoria disponível para edição.';
            return;
        }

        vm.transacaoEmEdicao = {
            id: transacao.id,
            descricao: transacao.descricao || '',
            valor: Number(transacao.valor || 0),
            dataTransacao: transacao.dataTransacao,
            contaId: transacao.contaId,
            categoriaId: transacao.categoriaId || encontrarCategoriaIdPorNomeETipo(transacao.categoriaNome, transacao.tipo),
            tipo: transacao.tipo,
            origem: transacao.origem || 'MANUAL'
        };
        vm.modalEdicaoAberto = true;
    }

    function aplicarLimiteRecorrenciaPadrao() {
        var dataBase = obterDataBaseRecorrencia();

        vm.novaTransacao.mesFimRecorrencia = dataBase.getMonth() + 1;
        vm.novaTransacao.anoFimRecorrencia = dataBase.getFullYear();
    }

    function obterDataBaseRecorrencia() {
        if (vm.novaTransacao && vm.novaTransacao.dataTransacao) {
            if (vm.novaTransacao.dataTransacao instanceof Date) {
                return vm.novaTransacao.dataTransacao;
            }

            return new Date(vm.novaTransacao.dataTransacao + 'T00:00:00');
        }

        return dataAtual;
    }

    function limiteRecorrenciaEhValido(dataTransacao, mesFim, anoFim) {
        var dataBase = dataTransacao instanceof Date
            ? new Date(dataTransacao.getTime())
            : new Date(dataTransacao + 'T00:00:00');
        var limite = new Date(anoFim, mesFim, 0);

        return !isNaN(dataBase.getTime()) && !isNaN(limite.getTime()) && limite >= dataBase;
    }

    function construirAnosRecorrencia() {
        var anoInicial = dataAtual.getFullYear();
        var anos = [];
        var indice;

        for (indice = 0; indice < 11; indice += 1) {
            anos.push({
                valor: anoInicial + indice,
                nome: (anoInicial + indice).toString()
            });
        }

        return anos;
    }

    function encontrarCategoriaIdPorNomeETipo(nomeCategoria, tipo) {
        var categoriaEncontrada = vm.listaCategoriasReais.find(function(categoria) {
            return categoria && categoria.nome === nomeCategoria && categoria.tipo === tipo;
        });

        return categoriaEncontrada ? categoriaEncontrada.id : null;
    }

    function extrairMensagemErro(error, fallback) {
        if (error && error.data) {
            if (typeof error.data === 'string') {
                return error.data;
            }

            if (error.data.status) {
                return error.data.status;
            }

            return Object.values(error.data).join(' ');
        }

        return fallback;
    }
});