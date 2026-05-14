app.controller('ExtratoController', function(TransacaoService) {
    var vm = this;
    var usuarioId = 'eb5941ab-c615-49ef-8df4-1becfcc60c1c';
    var categoriaIds = {
        SALARIO: '11111111-2222-3333-4444-555555555555',
        ALIMENTACAO: '22222222-3333-4444-5555-666666666666',
        TRANSPORTE: '33333333-4444-5555-6666-777777777777',
        LAZER: '44444444-5555-6666-7777-888888888888',
        OUTROS: '22222222-3333-4444-5555-666666666666'
    };

    vm.transacoes = [];
    vm.mensagemErro = '';
    vm.mensagemModalErro = '';
    vm.modalAberto = false;
    vm.modalExclusaoAberto = false;
    vm.mensagemExclusaoErro = '';
    vm.transacaoPendenteExclusao = null;
    vm.excluindoTransacaoId = null;
    vm.categorias = ['ALIMENTACAO', 'TRANSPORTE', 'SALARIO', 'LAZER', 'OUTROS'];

    vm.abrirModal = function() {
        vm.novaTransacao = {
            tipo: 'DESPESA',
            categoria: vm.categorias[0]
        };
        vm.mensagemModalErro = '';
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
        vm.mensagemErro = '';

        TransacaoService.listarPorUsuario(usuarioId)
            .then(function(response) {
                vm.transacoes = response.data || [];
            })
            .catch(function() {
                vm.mensagemErro = 'Não foi possível carregar o histórico de transações.';
            });
    };

    vm.salvarTransacao = function() {
        var dataTransacao = vm.novaTransacao.dataTransacao;
        var payload;
        var mensagemErro = 'Não foi possível salvar a transação.';

        vm.mensagemModalErro = '';

        if (dataTransacao instanceof Date) {
            dataTransacao = dataTransacao.toISOString().slice(0, 10);
        }

        payload = {
            usuarioId: usuarioId,
            contaId: 'b5fd9db9-605d-4e74-bdd5-e4b6a5c9f34f',
            categoriaId: categoriaIds[vm.novaTransacao.categoria],
            valor: parseFloat(vm.novaTransacao.valor),
            dataTransacao: dataTransacao,
            descricao: vm.novaTransacao.descricao,
            status: vm.novaTransacao.tipo
        };

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

    vm.carregarTransacoes();
});