app.controller('MainController', function($state) {
    var vm = this;

    vm.usuarioNome = 'Carlos Securo';

    vm.logout = function() {
        $state.go('login');
    };
});