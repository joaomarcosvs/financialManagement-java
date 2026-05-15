app.factory('CategoriaService', function($http) {
    return {
        listarTodas: function() {
            return $http.get('http://localhost:8080/api/v1/categorias');
        },
        criar: function(categoria) {
            return $http.post('http://localhost:8080/api/v1/categorias', categoria);
        },
        atualizar: function(categoriaId, categoria) {
            return $http.put('http://localhost:8080/api/v1/categorias/' + categoriaId, categoria);
        },
        excluir: function(categoriaId) {
            return $http.delete('http://localhost:8080/api/v1/categorias/' + categoriaId);
        }
    };
});