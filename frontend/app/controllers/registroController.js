app.controller('RegistroController', function(AuthService, $state) {
    var vm = this;

    vm.usuario = {
        nome: '',
        email: '',
        telefone: '',
        senha: ''
    };
    vm.mensagemErro = '';
    vm.processandoCadastro = false;

    vm.cadastrar = function() {
        vm.mensagemErro = '';
        vm.processandoCadastro = true;

        AuthService.registrar(vm.usuario)
            .then(function() {
                AuthService.salvarMensagemRegistro('Conta criada com sucesso. Faça login para acessar a plataforma.');
                $state.go('login');
            })
            .catch(function(error) {
                if (error && error.data) {
                    if (typeof error.data === 'string') {
                        vm.mensagemErro = error.data;
                    } else if (error.data.status) {
                        vm.mensagemErro = error.data.status;
                    } else {
                        vm.mensagemErro = Object.values(error.data).join(' ');
                    }
                } else {
                    vm.mensagemErro = 'Não foi possível criar a conta.';
                }
            })
            .finally(function() {
                vm.processandoCadastro = false;
            });
    };
});