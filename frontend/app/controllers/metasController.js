app.controller('MetasController', function($q, $window, AuthService, CategoriaService, MetaService) {
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

    vm.usuarioLogado = AuthService.getUsuarioLogado();
    vm.mesAtual = dataAtual.getMonth() + 1;
    vm.anoAtual = dataAtual.getFullYear();
    vm.metas = [];
    vm.categoriasDespesa = [];
    vm.modalMetaAberto = false;
    vm.modalExclusaoAberto = false;
    vm.salvandoMeta = false;
    vm.excluindoMetaId = null;
    vm.metaEmEdicaoId = null;
    vm.metaPendenteExclusao = null;
    vm.mensagemErro = '';
    vm.mensagemExclusaoErro = '';
    vm.mensagemSucesso = '';
    vm.mensagemModalErro = '';
    vm.formMeta = {
        nome: '',
        categoriaId: null,
        valorLimite: null
    };
    vm.historicoMetas = [];
    vm.carregandoHistorico = false;

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

        vm.carregarMetas();
    };

    vm.proximoMes = function() {
        if (vm.mesAtual === 12) {
            vm.mesAtual = 1;
            vm.anoAtual += 1;
        } else {
            vm.mesAtual += 1;
        }

        vm.carregarMetas();
    };

    vm.carregarMetas = function() {
        vm.mensagemErro = '';

        MetaService.obterProgresso(vm.mesAtual, vm.anoAtual)
            .then(function(response) {
                vm.metas = response.data || [];
            })
            .catch(function(error) {
                vm.mensagemErro = extrairMensagemErro(error, 'Não foi possível carregar o progresso das metas.');
            });
    };

    vm.abrirModal = function(meta) {
        vm.mensagemErro = '';
        vm.mensagemModalErro = '';
        vm.salvandoMeta = false;
        vm.metaEmEdicaoId = meta && meta.metaId ? meta.metaId : null;

        CategoriaService.listarTodas()
            .then(function(response) {
                vm.categoriasDespesa = (response.data || []).filter(function(categoria) {
                    return categoria && categoria.tipo === 'DESPESA';
                });

                if (!vm.categoriasDespesa.length) {
                    vm.mensagemErro = 'Nenhuma categoria de despesa disponível para criar metas.';
                    return;
                }

                vm.formMeta = {
                    nome: meta && (meta.nomeMeta || meta.nomeCategoria) ? (meta.nomeMeta || meta.nomeCategoria) : '',
                    categoriaId: meta && meta.categoriaId ? meta.categoriaId : vm.categoriasDespesa[0].id,
                    valorLimite: meta && meta.valorLimite ? Number(meta.valorLimite) : null
                };
                vm.modalMetaAberto = true;
            })
            .catch(function(error) {
                vm.mensagemErro = extrairMensagemErro(error, 'Não foi possível carregar as categorias de despesa.');
            });
    };

    vm.fecharModal = function() {
        if (vm.salvandoMeta) {
            return;
        }

        vm.modalMetaAberto = false;
        vm.mensagemModalErro = '';
        vm.metaEmEdicaoId = null;
        vm.formMeta = {
            nome: '',
            categoriaId: null,
            valorLimite: null
        };
    };

    vm.fecharModalExclusao = function(forcarFechamento) {
        if (vm.excluindoMetaId && !forcarFechamento) {
            return;
        }

        vm.modalExclusaoAberto = false;
        vm.mensagemExclusaoErro = '';
        vm.metaPendenteExclusao = null;
    };

    vm.salvarMeta = function() {
        var payload;
        var requisicao;

        vm.mensagemModalErro = '';
        vm.mensagemSucesso = '';

        if (!vm.formMeta.categoriaId) {
            vm.mensagemModalErro = 'Selecione uma categoria para a meta.';
            return;
        }

        if (!vm.formMeta.nome || !vm.formMeta.nome.trim()) {
            vm.mensagemModalErro = 'Informe um nome para a meta.';
            return;
        }

        if (!Number(vm.formMeta.valorLimite || 0)) {
            vm.mensagemModalErro = 'Informe um valor limite válido.';
            return;
        }

        vm.salvandoMeta = true;
        payload = {
            nome: vm.formMeta.nome.trim(),
            categoriaId: vm.formMeta.categoriaId,
            valorLimite: Number(vm.formMeta.valorLimite)
        };

        requisicao = vm.metaEmEdicaoId
            ? MetaService.atualizar(vm.metaEmEdicaoId, payload)
            : MetaService.salvar(payload);

        requisicao
            .then(function() {
                vm.mensagemSucesso = vm.metaEmEdicaoId
                    ? 'Meta atualizada com sucesso.'
                    : 'Meta criada com sucesso.';
                vm.fecharModal();
                vm.carregarMetas();
            })
            .catch(function(error) {
                vm.mensagemModalErro = extrairMensagemErro(error, 'Não foi possível salvar a meta.');
            })
            .finally(function() {
                vm.salvandoMeta = false;
            });
    };

    vm.abrirModalExclusao = function(meta) {
        if (!meta || !meta.metaId || vm.excluindoMetaId) {
            return;
        }

        vm.mensagemExclusaoErro = '';
        vm.metaPendenteExclusao = meta;
        vm.modalExclusaoAberto = true;
    };

    vm.confirmarExclusao = function() {
        var meta = vm.metaPendenteExclusao;

        if (!meta || !meta.metaId || vm.excluindoMetaId) {
            return;
        }

        vm.mensagemErro = '';
        vm.mensagemSucesso = '';
        vm.mensagemExclusaoErro = '';
        vm.excluindoMetaId = meta.metaId;

        MetaService.excluir(meta.metaId)
            .then(function() {
                vm.mensagemSucesso = 'Meta excluída com sucesso.';
                vm.fecharModalExclusao(true);
                vm.carregarMetas();
            })
            .catch(function(error) {
                vm.mensagemErro = extrairMensagemErro(error, 'Não foi possível excluir a meta.');
                vm.mensagemExclusaoErro = vm.mensagemErro;
            })
            .finally(function() {
                vm.excluindoMetaId = null;
            });
    };

    vm.obterClasseProgresso = function(percentualGasto) {
        var percentual = Number(percentualGasto || 0);

        if (percentual < 80) {
            return 'bg-emerald-500';
        }

        if (percentual < 100) {
            return 'bg-amber-500';
        }

        return 'bg-rose-500';
    };

    vm.obterLarguraProgresso = function(percentualGasto) {
        var percentual = Math.max(Number(percentualGasto || 0), 0);
        return Math.min(percentual, 100) + '%';
    };

    vm.carregarHistoricoMetas = function() {
        var meses = [];
        var mesAux = dataAtual.getMonth() + 1;
        var anoAux = dataAtual.getFullYear();
        var i;

        for (i = 0; i < 6; i++) {
            mesAux -= 1;
            if (mesAux === 0) {
                mesAux = 12;
                anoAux -= 1;
            }
            meses.push({ mes: mesAux, ano: anoAux });
        }

        vm.carregandoHistorico = true;

        $q.all(meses.map(function(comp) {
            return MetaService.obterProgresso(comp.mes, comp.ano)
                .then(function(response) {
                    var lista = response.data || [];
                    return {
                        label: nomesMeses[comp.mes - 1] + ' ' + comp.ano,
                        totalMetas: lista.length,
                        estouradas: lista.filter(function(m) { return Number(m.percentualGasto || 0) >= 100; }).length,
                        emAlerta: lista.filter(function(m) {
                            var p = Number(m.percentualGasto || 0);
                            return p >= 80 && p < 100;
                        }).length
                    };
                })
                .catch(function() {
                    return { label: nomesMeses[comp.mes - 1] + ' ' + comp.ano, totalMetas: 0, estouradas: 0, emAlerta: 0 };
                });
        }))
        .then(function(resultados) {
            vm.historicoMetas = resultados;
        })
        .finally(function() {
            vm.carregandoHistorico = false;
        });
    };

    vm.carregarMetas();
    vm.carregarHistoricoMetas();

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