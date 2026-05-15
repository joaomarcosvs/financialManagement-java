var app = angular.module('financialApp', ['ui.router']);

app.run(function($rootScope, $window) {
    $rootScope.modoPrivacidade = $window.localStorage.getItem('privacidade') === 'true';
});

app.factory('AuthInterceptor', function($q, $window) {
    function limparSessao() {
        $window.localStorage.removeItem('jwt_token');
        $window.localStorage.removeItem('usuario_id');
        $window.localStorage.removeItem('usuario_nome');
        $window.localStorage.removeItem('usuario_logado');
    }

    return {
        request: function(config) {
            var token = $window.localStorage.getItem('jwt_token');
            var isLoginRequest = config.url && config.url.indexOf('/api/v1/auth/login') !== -1;
            var isRegistroRequest = config.url && config.url.indexOf('/api/v1/usuarios') !== -1 && config.method === 'POST';

            if (token && !isLoginRequest && !isRegistroRequest) {
                config.headers = config.headers || {};
                config.headers.Authorization = 'Bearer ' + token;
            }

            return config;
        },
        responseError: function(rejection) {
            if (rejection && rejection.status === 401) {
                limparSessao();
            }

            return $q.reject(rejection);
        }
    };
});

app.config(function($stateProvider, $urlRouterProvider, $httpProvider) {

    $httpProvider.interceptors.push('AuthInterceptor');
    
    // Rota padrão caso o usuário digite algo inexistente
    $urlRouterProvider.otherwise('/login');

    $stateProvider
        .state('login', {
            url: '/login',
            templateUrl: 'app/views/login.html',
            controller: 'LoginController',
            controllerAs: 'vm' // O "vm" significa View Model (Padrão de mercado)
        })
        .state('registro', {
            url: '/registro',
            templateUrl: 'app/views/registro.html',
            controller: 'RegistroController',
            controllerAs: 'vm'
        })
        .state('app', {
            abstract: true,
            url: '/app',
            templateUrl: 'app/views/layout.html',
            controller: 'MainController',
            controllerAs: 'mainVm'
        })
        .state('app.dashboard', {
            url: '/dashboard',
            templateUrl: 'app/views/dashboard.html',
            controller: 'DashboardController',
            controllerAs: 'vm'
        })
        .state('app.perfil', {
            url: '/perfil',
            templateUrl: 'app/views/perfil.html',
            controller: 'PerfilController',
            controllerAs: 'vm'
        })
        .state('app.configuracoes', {
            url: '/configuracoes',
            templateUrl: 'app/views/configuracoes.html',
            controller: 'ConfiguracoesController',
            controllerAs: 'vm'
        })
        .state('app.contas', {
            url: '/contas',
            templateUrl: 'app/views/contas.html',
            controller: 'ContaController',
            controllerAs: 'vm'
        })
        .state('app.extrato', {
            url: '/extrato',
            templateUrl: 'app/views/extrato.html',
            controller: 'ExtratoController',
            controllerAs: 'vm'
        });
});