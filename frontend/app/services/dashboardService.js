app.factory('DashboardService', function($http) {
    var apiUrl = 'http://localhost:8080/api/v1/dashboard';

    return {
        obterResumo: function(usuarioId, mes, ano) {
            return $http.get(apiUrl + '/usuario/' + usuarioId, {
                params: {
                    mes: mes,
                    ano: ano
                }
            });
        },
        obterTendencias: function() {
            return $http.get(apiUrl + '/tendencias');
        }
    };
});