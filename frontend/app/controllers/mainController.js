app.controller('MainController', function($rootScope, $scope, $state, $window, AuthService, MetaService) {
    var vm = this;
    var dataAtual = new Date();

    vm.menuAberto = false;
    vm.sidebarAberta = true;
    vm.usuario = montarUsuario(AuthService.getUsuarioLogado());
    vm.metasEmAlerta = 0;

    vm.toggleMenu = function() {
        vm.menuAberto = !vm.menuAberto;
    };

    vm.toggleSidebar = function() {
        vm.sidebarAberta = !vm.sidebarAberta;
    };

    vm.togglePrivacidade = function() {
        $rootScope.modoPrivacidade = !$rootScope.modoPrivacidade;
        $window.localStorage.setItem('privacidade', $rootScope.modoPrivacidade ? 'true' : 'false');
    };

    vm.logout = function() {
        AuthService.limparToken();
        $state.go('login');
    };

    vm.carregarAlertasMetas = function() {
        var mes = dataAtual.getMonth() + 1;
        var ano = dataAtual.getFullYear();

        MetaService.obterProgresso(mes, ano)
            .then(function(response) {
                var metas = response.data || [];
                vm.metasEmAlerta = metas.filter(function(m) {
                    return Number(m.percentualGasto || 0) >= 80;
                }).length;
            })
            .catch(angular.noop);
    };

    vm.carregarAlertasMetas();

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