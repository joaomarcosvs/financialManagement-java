app.factory('TransacaoService', function($http) {
    return {
        listarPorUsuario: function(usuarioId) {
            return $http.get('http://localhost:8080/api/v1/transacoes/usuario/' + usuarioId);
        },
        criar: function(transacao) {
            return $http.post('http://localhost:8080/api/v1/transacoes', transacao);
        },
        deletar: function(transacaoId) {
            return $http.delete('http://localhost:8080/api/v1/transacoes/' + transacaoId);
        }
    };
});