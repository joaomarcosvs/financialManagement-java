var app = angular.module('financialApp', ['ui.router']);

app.config(function($stateProvider, $urlRouterProvider) {
    
    // Rota padrão caso o usuário digite algo inexistente
    $urlRouterProvider.otherwise('/login');

    $stateProvider
        .state('login', {
            url: '/login',
            templateUrl: 'app/views/login.html',
            controller: 'LoginController',
            controllerAs: 'vm' // O "vm" significa View Model (Padrão de mercado)
        })
        .state('dashboard', {
            url: '/dashboard',
            templateUrl: 'app/views/dashboard.html',
            controller: 'DashboardController',
            controllerAs: 'vm'
        });
});

// Exemplo de Controller usando o padrão "Sênior" (sem depender de $scope para tudo)
app.controller('MainController', function() {
    var vm = this; // Capturamos o contexto do controller
    vm.titulo = "Bem-vindo ao Financial System";
});