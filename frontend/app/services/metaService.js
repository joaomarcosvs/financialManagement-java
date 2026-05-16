app.factory('MetaService', function($http) {
    var apiUrl = 'http://localhost:8080/api/v1/metas';

    return {
        obterProgresso: function(mes, ano) {
            return $http.get(apiUrl + '/progresso', {
                params: {
                    mes: mes,
                    ano: ano
                }
            });
        },
        salvar: function(meta) {
            return $http.post(apiUrl, meta);
        },
        atualizar: function(metaId, meta) {
            return $http.put(apiUrl + '/' + metaId, meta);
        },
        excluir: function(metaId) {
            return $http.delete(apiUrl + '/' + metaId);
        }
    };
});