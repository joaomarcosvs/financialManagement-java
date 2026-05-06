app.factory('DashboardService', function($http) {
    return {
        obterResumo: function(usuarioId, mes, ano) {
            return $http.get('http://localhost:8080/api/v1/dashboard/usuario/' + usuarioId + '?mes=' + mes + '&ano=' + ano);
        }
    };
});