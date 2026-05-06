app.controller('MainController', function($state, AuthService) {
    var vm = this;

    vm.menuAberto = false;
    vm.sidebarAberta = true;
    vm.usuario = {
        nome: 'Carlos Securo',
        iniciais: 'CS'
    };

    vm.toggleMenu = function() {
        vm.menuAberto = !vm.menuAberto;
    };

    vm.toggleSidebar = function() {
        vm.sidebarAberta = !vm.sidebarAberta;
    };

    vm.logout = function() {
        AuthService.limparToken();
        $state.go('login');
    };
});