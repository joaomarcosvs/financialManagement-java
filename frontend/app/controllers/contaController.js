app.controller('ContaController', function(AuthService, ContaService) {
    var vm = this;
    var iconesDisponiveis = ['itau', 'nubank', 'picpay', 'n8n'];

    vm.usuarioLogado = null;
    vm.contas = [];
    vm.mensagemErro = '';
    vm.mensagemModalErro = '';
    vm.mensagemExclusaoErro = '';
    vm.modalAberto = false;
    vm.modalExclusaoAberto = false;
    vm.salvandoConta = false;
    vm.excluindoContaId = null;
    vm.contaPendenteExclusao = null;
    vm.tiposConta = ['DEBITO', 'CREDITO', 'POUPANCA'];
    vm.bancosDisponiveis = [
        { slug: 'itau', nome: 'Itaú' },
        { slug: 'nubank', nome: 'Nubank' },
        { slug: 'picpay', nome: 'PicPay' },
        { slug: 'n8n', nome: 'n8n' }
    ];

    vm.getIcone = function(slug) {
        var slugNormalizado = (slug || '').toString().trim().toLowerCase();

        if (iconesDisponiveis.indexOf(slugNormalizado) !== -1) {
            return 'assets/images/' + slugNormalizado + '.svg';
        }

        return 'fa-solid fa-wallet';
    };

    vm.ehImagemIcone = function(icone) {
        return typeof icone === 'string' && icone.indexOf('assets/images/') === 0;
    };

    vm.abrirModal = function() {
        vm.mensagemErro = '';
        vm.mensagemModalErro = '';

        if (!vm.usuarioLogado || !vm.usuarioLogado.id) {
            vm.mensagemErro = 'Usuário não identificado na sessão atual.';
            return;
        }

        vm.novaConta = {
            tipo: vm.tiposConta[0],
            icone: vm.bancosDisponiveis[0].slug
        };
        vm.modalAberto = true;
    };

    vm.fecharModal = function(forcarFechamento) {
        if (vm.salvandoConta && !forcarFechamento) {
            return;
        }

        vm.modalAberto = false;
        vm.mensagemModalErro = '';
        vm.novaConta = null;
    };

    vm.abrirModalExclusao = function(conta) {
        if (!conta || !conta.id || vm.excluindoContaId) {
            return;
        }

        vm.mensagemExclusaoErro = '';
        vm.contaPendenteExclusao = conta;
        vm.modalExclusaoAberto = true;
    };

    vm.fecharModalExclusao = function(forcarFechamento) {
        if (vm.excluindoContaId && !forcarFechamento) {
            return;
        }

        vm.modalExclusaoAberto = false;
        vm.mensagemExclusaoErro = '';
        vm.contaPendenteExclusao = null;
    };

    vm.carregarContas = function() {
        if (!vm.usuarioLogado || !vm.usuarioLogado.id) {
            vm.mensagemErro = 'Usuário não identificado na sessão atual.';
            return;
        }

        vm.mensagemErro = '';

        ContaService.listarPorUsuario(vm.usuarioLogado.id)
            .then(function(response) {
                vm.contas = response.data || [];
            })
            .catch(function() {
                vm.mensagemErro = 'Não foi possível carregar as contas do usuário.';
            });
    };

    vm.salvarConta = function() {
        var payload;

        vm.mensagemModalErro = '';

        if (!vm.usuarioLogado || !vm.usuarioLogado.id) {
            vm.mensagemModalErro = 'Usuário não identificado na sessão atual.';
            return;
        }

        payload = {
            usuarioId: vm.usuarioLogado.id,
            nome: vm.novaConta.nome,
            tipo: vm.novaConta.tipo,
            icone: vm.novaConta.icone
        };

        vm.salvandoConta = true;

        ContaService.criar(payload)
            .then(function(response) {
                vm.contas = [response.data].concat(vm.contas);
                vm.fecharModal(true);
            })
            .catch(function(error) {
                vm.mensagemModalErro = extrairMensagemErro(error, 'Não foi possível salvar a conta.');
            })
            .finally(function() {
                vm.salvandoConta = false;
            });
    };

    vm.confirmarExclusao = function() {
        var conta = vm.contaPendenteExclusao;
        var mensagemErro;

        if (!conta || !conta.id || vm.excluindoContaId) {
            return;
        }

        vm.mensagemErro = '';
        vm.mensagemExclusaoErro = '';
        vm.excluindoContaId = conta.id;

        ContaService.excluir(conta.id)
            .then(function() {
                vm.contas = vm.contas.filter(function(item) {
                    return item.id !== conta.id;
                });

                vm.fecharModalExclusao(true);
            })
            .catch(function(error) {
                mensagemErro = extrairMensagemErro(error, 'Não foi possível excluir a conta.');
                vm.mensagemErro = mensagemErro;
                vm.mensagemExclusaoErro = mensagemErro;
            })
            .finally(function() {
                vm.excluindoContaId = null;
            });
    };

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

    vm.usuarioLogado = AuthService.getUsuarioLogado();

    if (!vm.usuarioLogado || !vm.usuarioLogado.id) {
        vm.mensagemErro = 'Usuário não identificado na sessão atual.';
        return;
    }

    vm.carregarContas();
});