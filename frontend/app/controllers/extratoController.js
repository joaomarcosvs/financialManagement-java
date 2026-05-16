app.controller('ExtratoController', function($document, $scope, AuthService, CategoriaService, ContaService, TransacaoService) {
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

        TransacaoService.criar(payload)
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
            tipo: transacao.tipo
        };
        vm.modalEdicaoAberto = true;
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