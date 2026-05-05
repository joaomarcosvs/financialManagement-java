var app = angular.module('financialApp', ['ui.router']);

app.factory('AuthInterceptor', function($window) {
    return {
        request: function(config) {
            var token = $window.localStorage.getItem('jwt_token');

            if (token) {
                config.headers = config.headers || {};
                config.headers.Authorization = 'Bearer ' + token;
            }

            return config;
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
        .state('app.transacoes', {
            url: '/transacoes',
            templateUrl: 'app/views/transacoes.html'
        });
});