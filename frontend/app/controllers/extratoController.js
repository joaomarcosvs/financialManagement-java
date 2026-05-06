app.controller('ExtratoController', function(TransacaoService) {
    var vm = this;
    var usuarioId = 'eb5941ab-c615-49ef-8df4-1becfcc60c1c';

    vm.transacoes = [];
    vm.mensagemErro = '';

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

    vm.carregarTransacoes();
});