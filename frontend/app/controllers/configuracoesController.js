app.controller('ConfiguracoesController', function($rootScope, $window, AuthService, CategoriaService, TransacaoService) {
    var vm = this;
    var hoje = new Date();

    vm.usuarioLogado = AuthService.getUsuarioLogado();
    vm.modoPrivacidade = !!$rootScope.modoPrivacidade;
    vm.mesAtual = hoje.getMonth() + 1;
    vm.anoAtual = hoje.getFullYear();
    vm.categorias = [];
    vm.minhasCategorias = [];
    vm.modalCategoriaAberto = false;
    vm.salvandoCategoria = false;
    vm.mensagemErro = '';
    vm.mensagemSucesso = '';
    vm.mensagemCategoriaErro = '';
    vm.categoriaEmEdicaoId = null;
    vm.tiposCategoria = ['RECEITA', 'DESPESA'];

    vm.formCategoria = {
        nome: '',
        tipo: 'DESPESA',
        cor: '#10B981'
    };

    vm.alternarPrivacidade = function() {
        vm.modoPrivacidade = !vm.modoPrivacidade;
        $rootScope.modoPrivacidade = vm.modoPrivacidade;
        $window.localStorage.setItem('privacidade', vm.modoPrivacidade ? 'true' : 'false');
    };

    vm.carregarCategorias = function() {
        vm.mensagemErro = '';

        CategoriaService.listarTodas()
            .then(function(response) {
                vm.categorias = response.data || [];
                vm.minhasCategorias = vm.categorias.filter(function(categoria) {
                    return !categoria.global;
                });
            })
            .catch(function(error) {
                vm.mensagemErro = extrairMensagemErro(error, 'Não foi possível carregar suas categorias.');
            });
    };

    vm.abrirModalCategoria = function(categoria) {
        vm.mensagemCategoriaErro = '';
        vm.categoriaEmEdicaoId = categoria ? categoria.id : null;
        vm.formCategoria = {
            nome: categoria ? categoria.nome : '',
            tipo: categoria ? categoria.tipo : 'DESPESA',
            cor: categoria && categoria.cor ? categoria.cor : '#10B981'
        };
        vm.modalCategoriaAberto = true;
    };

    vm.fecharModalCategoria = function() {
        if (vm.salvandoCategoria) {
            return;
        }

        vm.modalCategoriaAberto = false;
        vm.mensagemCategoriaErro = '';
        vm.categoriaEmEdicaoId = null;
        vm.formCategoria = {
            nome: '',
            tipo: 'DESPESA',
            cor: '#10B981'
        };
    };

    vm.salvarCategoria = function() {
        var requisicao;

        vm.mensagemCategoriaErro = '';
        vm.mensagemSucesso = '';

        if (!vm.formCategoria.nome || !vm.formCategoria.nome.trim()) {
            vm.mensagemCategoriaErro = 'Informe o nome da categoria.';
            return;
        }

        vm.salvandoCategoria = true;

        requisicao = vm.categoriaEmEdicaoId
            ? CategoriaService.atualizar(vm.categoriaEmEdicaoId, vm.formCategoria)
            : CategoriaService.criar(vm.formCategoria);

        requisicao
            .then(function() {
                vm.mensagemSucesso = vm.categoriaEmEdicaoId
                    ? 'Categoria atualizada com sucesso.'
                    : 'Categoria criada com sucesso.';
                vm.fecharModalCategoria();
                vm.carregarCategorias();
            })
            .catch(function(error) {
                vm.mensagemCategoriaErro = extrairMensagemErro(error, 'Não foi possível salvar a categoria.');
            })
            .finally(function() {
                vm.salvandoCategoria = false;
            });
    };

    vm.excluirCategoria = function(categoria) {
        if (!categoria || !categoria.id) {
            return;
        }

        if (!$window.confirm('Deseja realmente excluir esta categoria personalizada?')) {
            return;
        }

        vm.mensagemErro = '';
        vm.mensagemSucesso = '';

        CategoriaService.excluir(categoria.id)
            .then(function() {
                vm.mensagemSucesso = 'Categoria excluída com sucesso.';
                vm.carregarCategorias();
            })
            .catch(function(error) {
                vm.mensagemErro = extrairMensagemErro(error, 'Não foi possível excluir a categoria.');
            });
    };

    vm.exportarCSV = function() {
        var url;

        if (!vm.usuarioLogado || !vm.usuarioLogado.id) {
            vm.mensagemErro = 'Usuário não identificado na sessão atual.';
            return;
        }

        vm.mensagemErro = '';
        vm.mensagemSucesso = '';

        TransacaoService.listarPorUsuario(vm.usuarioLogado.id, vm.mesAtual, vm.anoAtual)
            .then(function(response) {
                var transacoes = response.data || [];
                var linhas = ['Data;Descrição;Categoria;Tipo;Valor'];
                var blob;
                var link;

                transacoes.forEach(function(transacao) {
                    linhas.push([
                        escaparCsv(formatarData(transacao.dataTransacao)),
                        escaparCsv(transacao.descricao || ''),
                        escaparCsv(transacao.categoriaNome || ''),
                        escaparCsv(transacao.tipo || ''),
                        escaparCsv(formatarValor(transacao.valor))
                    ].join(';'));
                });

                blob = new Blob(['\uFEFF' + linhas.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
                url = $window.URL.createObjectURL(blob);
                link = $window.document.createElement('a');
                link.href = url;
                link.download = 'extrato.csv';
                $window.document.body.appendChild(link);
                link.click();
                $window.document.body.removeChild(link);
                $window.URL.revokeObjectURL(url);
                vm.mensagemSucesso = 'Extrato exportado com sucesso.';
            })
            .catch(function(error) {
                vm.mensagemErro = extrairMensagemErro(error, 'Não foi possível exportar o extrato.');
            });
    };

    vm.carregarCategorias();

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

    function formatarData(data) {
        if (!data) {
            return '';
        }

        return data.split('-').reverse().join('/');
    }

    function formatarValor(valor) {
        return Number(valor || 0).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    function escaparCsv(valor) {
        return '"' + (valor || '').toString().replace(/"/g, '""') + '"';
    }
});