app.controller('ContaController', function($http, AuthService, ContaService) {
    var vm = this;
    var iconesDisponiveis = ['itau', 'nubank', 'picpay', 'n8n'];
    var mapaIconesPorCodigo = {
        '0341': 'itau',
        '0260': 'nubank',
        '0380': 'picpay'
    };

    vm.usuarioLogado = null;
    vm.contas = [];
    vm.bancosBrasil = [];
    vm.mensagemErro = '';
    vm.mensagemSucesso = '';
    vm.mensagemModalErro = '';
    vm.mensagemExclusaoErro = '';
    vm.modalAberto = false;
    vm.modalExclusaoAberto = false;
    vm.salvandoConta = false;
    vm.carregandoBancos = false;
    vm.excluindoContaId = null;
    vm.contaPendenteExclusao = null;
    vm.tiposConta = ['CORRENTE', 'POUPANCA'];
    vm.modalidades = [
        { valor: 'DEBITO',        nome: 'Débito' },
        { valor: 'CREDITO',       nome: 'Crédito' },
        { valor: 'DEBITO_CREDITO', nome: 'Débito + Crédito' }
    ];
    vm.labelsModalidade = { DEBITO: 'Débito', CREDITO: 'Crédito', DEBITO_CREDITO: 'Débito + Crédito' };
    vm.formatarBanco = function(banco) {
        return banco.code + ' - ' + banco.name;
    };

    vm.getIcone = function(slug) {
        var slugNormalizado = (slug || '').toString().trim().toLowerCase();

        if (iconesDisponiveis.indexOf(slugNormalizado) !== -1) {
            return 'assets/images/' + slugNormalizado + '.svg';
        }

        return 'fa-solid fa-building-columns';
    };

    vm.ehImagemIcone = function(icone) {
        return typeof icone === 'string' && icone.indexOf('assets/images/') === 0;
    };

    vm.carregarBancos = function() {
        vm.carregandoBancos = true;

        return $http.get('https://brasilapi.com.br/api/banks/v1')
            .then(function(response) {
                vm.bancosBrasil = (response.data || [])
                    .filter(function(banco) {
                        return banco &&
                            typeof banco.name === 'string' &&
                            banco.name.trim() &&
                            banco.code !== null &&
                            banco.code !== undefined &&
                            banco.code.toString().trim();
                    })
                    .map(function(banco) {
                        return {
                            code: normalizarCodigoBanco(banco.code),
                            name: banco.name.trim()
                        };
                    })
                    .sort(function(primeiroBanco, segundoBanco) {
                        return primeiroBanco.name.localeCompare(segundoBanco.name, 'pt-BR', { sensitivity: 'base' });
                    });

                if (vm.novaConta && !vm.novaConta.codigoBanco && vm.bancosBrasil.length) {
                    vm.novaConta.codigoBanco = vm.bancosBrasil[0].code;
                    vm.atualizarPreview();
                }
            })
            .catch(function() {
                vm.bancosBrasil = [];
                if (vm.modalAberto) {
                    vm.mensagemModalErro = 'Não foi possível carregar a lista de bancos da Brasil API.';
                }
            })
            .finally(function() {
                vm.carregandoBancos = false;
            });
    };

    vm.atualizarPreview = function() {
        var codigoBanco;

        if (!vm.novaConta) {
            return;
        }

        codigoBanco = normalizarCodigoBanco(vm.novaConta.codigoBanco);
        vm.novaConta.codigoBanco = codigoBanco;
        vm.novaConta.icone = mapaIconesPorCodigo[codigoBanco] || 'generic';
    };

    vm.abrirModal = function() {
        vm.mensagemErro = '';
        vm.mensagemSucesso = '';
        vm.mensagemModalErro = '';

        if (!vm.usuarioLogado || !vm.usuarioLogado.id) {
            vm.mensagemErro = 'Usuário não identificado na sessão atual.';
            return;
        }

        vm.novaConta = {
            tipo: 'CORRENTE',
            modalidade: 'DEBITO',
            codigoBanco: vm.bancosBrasil.length ? vm.bancosBrasil[0].code : '',
            icone: 'generic'
        };

        vm.atualizarPreview();
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
        var mensagemValidacao;

        vm.mensagemModalErro = '';
        vm.mensagemSucesso = '';

        if (!vm.usuarioLogado || !vm.usuarioLogado.id) {
            vm.mensagemModalErro = 'Usuário não identificado na sessão atual.';
            return;
        }

        mensagemValidacao = validarNovaConta();

        if (mensagemValidacao) {
            vm.mensagemModalErro = mensagemValidacao;
            return;
        }

        vm.atualizarPreview();

        payload = {
            usuarioId: vm.usuarioLogado.id,
            nome: vm.novaConta.nome,
            tipo: vm.novaConta.tipo,
            modalidade: vm.novaConta.tipo === 'CORRENTE' ? vm.novaConta.modalidade : null,
            icone: vm.novaConta.icone
        };

        vm.salvandoConta = true;

        ContaService.criar(payload)
            .then(function(response) {
                vm.contas = [response.data].concat(vm.contas);
                vm.mensagemSucesso = 'Conta criada com sucesso.';
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

    function validarNovaConta() {
        if (!vm.novaConta || !vm.novaConta.nome || !vm.novaConta.nome.trim()) {
            return 'Informe o nome da conta.';
        }

        if (!vm.novaConta.tipo) {
            return 'Selecione o tipo da conta.';
        }

        if (vm.novaConta.tipo === 'CORRENTE' && !vm.novaConta.modalidade) {
            return 'Selecione a modalidade da conta corrente.';
        }

        if (!vm.novaConta.codigoBanco) {
            return 'Selecione um banco para a conta.';
        }

        return '';
    }

    function normalizarCodigoBanco(codigoBanco) {
        var codigoNormalizado;

        if (codigoBanco === null || codigoBanco === undefined) {
            return '';
        }

        codigoNormalizado = codigoBanco.toString().trim();

        if (!codigoNormalizado) {
            return '';
        }

        return ('0000' + codigoNormalizado).slice(-4);
    }

    vm.usuarioLogado = AuthService.getUsuarioLogado();

    if (!vm.usuarioLogado || !vm.usuarioLogado.id) {
        vm.mensagemErro = 'Usuário não identificado na sessão atual.';
        return;
    }

    vm.carregarBancos();
    vm.carregarContas();
});