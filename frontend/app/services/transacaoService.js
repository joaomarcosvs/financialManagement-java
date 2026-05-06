app.factory('TransacaoService', function($http) {
    return {
        listarPorUsuario: function(usuarioId) {
            return $http.get('http://localhost:8080/api/v1/transacoes/usuario/' + usuarioId);
        }
    };
});