app.factory('ContaService', function($http) {
    return {
        listarPorUsuario: function(usuarioId) {
            return $http.get('http://localhost:8080/api/v1/contas/usuario/' + usuarioId);
        },
        criar: function(conta) {
            return $http.post('http://localhost:8080/api/v1/contas', conta);
        },
        excluir: function(contaId) {
            return $http.delete('http://localhost:8080/api/v1/contas/' + contaId);
        }
    };
});