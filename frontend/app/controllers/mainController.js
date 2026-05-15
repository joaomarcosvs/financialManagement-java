app.controller('MainController', function($scope, $state, AuthService) {
    var vm = this;

    vm.menuAberto = false;
    vm.sidebarAberta = true;
    vm.usuario = montarUsuario(AuthService.getUsuarioLogado());

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

    $scope.$on('usuario-logado-atualizado', function(event, usuarioAtualizado) {
        vm.usuario = montarUsuario(usuarioAtualizado);
    });

    function montarUsuario(usuarioLogadoAtual) {
        var nome = usuarioLogadoAtual && usuarioLogadoAtual.nome ? usuarioLogadoAtual.nome.trim() : '';

        if (!nome) {
            nome = 'Usuário';
        }

        return {
            nome: nome,
            iniciais: extrairIniciais(nome)
        };
    }

    function extrairIniciais(nomeCompleto) {
        var partesNome = (nomeCompleto || '')
            .trim()
            .split(/\s+/)
            .filter(Boolean);

        if (!partesNome.length) {
            return 'U';
        }

        if (partesNome.length === 1) {
            return partesNome[0].charAt(0).toUpperCase();
        }

        return (partesNome[0].charAt(0) + partesNome[1].charAt(0)).toUpperCase();
    }
});