app.controller('MainController', function($state, AuthService) {
    var vm = this;
    var usuarioLogado = AuthService.getUsuarioLogado();

    vm.menuAberto = false;
    vm.sidebarAberta = true;
    vm.usuario = montarUsuario(usuarioLogado);

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