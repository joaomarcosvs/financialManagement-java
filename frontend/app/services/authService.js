app.factory('AuthService', function($http, $window) {
    var storageKey = 'jwt_token';

    return {
        login: function(credenciais) {
            return $http.post('http://localhost:8080/api/v1/auth/login', credenciais);
        },
        salvarToken: function(token) {
            $window.localStorage.setItem(storageKey, token);
        },
        getToken: function() {
            return $window.localStorage.getItem(storageKey);
        }
    };
});