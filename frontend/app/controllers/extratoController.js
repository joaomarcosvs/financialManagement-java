app.controller('ExtratoController', function(AuthService, CategoriaService, ContaService, TransacaoService) {
    var vm = this;

    vm.usuarioLogado = null;
    vm.transacoes = [];
    vm.contas = [];
    vm.listaCategoriasReais = [];
    vm.mensagemErro = '';
    vm.mensagemModalErro = '';
    vm.modalAberto = false;
    vm.modalExclusaoAberto = false;
    vm.mensagemExclusaoErro = '';
    vm.transacaoPendenteExclusao = null;
    vm.excluindoTransacaoId = null;

    vm.abrirModal = function() {
        vm.mensagemErro = '';
        vm.mensagemModalErro = '';

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

        vm.novaTransacao = {
            tipo: 'DESPESA',
            contaId: vm.contas[0].id,
            categoriaId: vm.listaCategoriasReais[0].id
        };
        vm.modalAberto = true;
    };

    vm.fecharModal = function() {
        vm.modalAberto = false;
        vm.mensagemModalErro = '';
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

        TransacaoService.listarPorUsuario(vm.usuarioLogado.id)
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
            status: vm.novaTransacao.tipo
        };

        if (!payload.contaId || !payload.categoriaId) {
            vm.mensagemModalErro = 'Selecione uma conta e uma categoria válidas.';
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
                    if (typeof error.data === 'string') {
                        mensagemErro = error.data;
                    } else if (error.data.status) {
                        mensagemErro = error.data.status;
                    } else {
                        mensagemErro = Object.values(error.data).join(' ');
                    }
                }

                vm.mensagemErro = mensagemErro;
                vm.mensagemExclusaoErro = mensagemErro;
            })
            .finally(function() {
                vm.excluindoTransacaoId = null;
            });
    };

    vm.usuarioLogado = AuthService.getUsuarioLogado();

    if (!vm.usuarioLogado || !vm.usuarioLogado.id) {
        vm.mensagemErro = 'Usuário não identificado na sessão atual.';
        return;
    }

    vm.carregarTransacoes();
    vm.carregarContas();
    vm.carregarCategorias();
});