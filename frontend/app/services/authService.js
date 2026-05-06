app.factory('AuthService', function($http, $window) {
    var tokenStorageKey = 'jwt_token';
    var userIdStorageKey = 'usuario_id';
    var userNameStorageKey = 'usuario_nome';

    function limparArmazenamento() {
        $window.localStorage.removeItem(tokenStorageKey);
        $window.localStorage.removeItem(userIdStorageKey);
        $window.localStorage.removeItem(userNameStorageKey);
    }

    return {
        login: function(credenciais) {
            return $http.post('http://localhost:8080/api/v1/auth/login', credenciais);
        },
        salvarToken: function(token) {
            $window.localStorage.setItem(tokenStorageKey, token);
        },
        salvarSessao: function(authData) {
            if (authData.token) {
                $window.localStorage.setItem(tokenStorageKey, authData.token);
            }

            if (authData.usuarioId) {
                $window.localStorage.setItem(userIdStorageKey, authData.usuarioId);
            }

            if (authData.nome) {
                $window.localStorage.setItem(userNameStorageKey, authData.nome);
            }
        },
        getToken: function() {
            return $window.localStorage.getItem(tokenStorageKey);
        },
        getUsuarioId: function() {
            return $window.localStorage.getItem(userIdStorageKey);
        },
        getUsuarioNome: function() {
            return $window.localStorage.getItem(userNameStorageKey);
        },
        limparToken: function() {
            limparArmazenamento();
        },
        limparSessao: function() {
            limparArmazenamento();
        }
    };
});