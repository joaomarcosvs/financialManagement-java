app.factory('CategoriaService', function($http) {
    return {
        listarTodas: function() {
            return $http.get('http://localhost:8080/api/v1/categorias');
        }
    };
});