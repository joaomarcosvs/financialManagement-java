app.factory('TransacaoService', function($http) {
    return {
        listarPorUsuario: function(usuarioId, mes, ano) {
            return $http.get('http://localhost:8080/api/v1/transacoes/usuario/' + usuarioId, {
                params: {
                    mes: mes,
                    ano: ano
                }
            });
        },
        criar: function(transacao) {
            return $http.post('http://localhost:8080/api/v1/transacoes', transacao);
        },
        atualizar: function(transacaoId, transacao) {
            return $http.put('http://localhost:8080/api/v1/transacoes/' + transacaoId, transacao);
        },
        deletar: function(transacaoId) {
            return $http.delete('http://localhost:8080/api/v1/transacoes/' + transacaoId);
        }
    };
});