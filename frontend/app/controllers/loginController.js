app.controller('LoginController', function(AuthService, $state) {
    var vm = this;

    vm.credenciais = {
        email: '',
        senha: ''
    };
    vm.mensagemErro = '';

    vm.fazerLogin = function() {
        vm.mensagemErro = '';

        AuthService.login(vm.credenciais)
            .then(function(response) {
                if (!response.data || !response.data.token) {
                    vm.mensagemErro = 'Credenciais inválidas';
                    return;
                }

                AuthService.salvarSessao(response.data);
                $state.go('app.dashboard');
            })
            .catch(function() {
                vm.mensagemErro = 'Credenciais inválidas';
            });
    };
});