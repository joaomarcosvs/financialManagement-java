app.factory('AuthService', function($http, $window) {
    var tokenStorageKey = 'jwt_token';
    var userIdStorageKey = 'usuario_id';
    var userNameStorageKey = 'usuario_nome';
    var userStorageKey = 'usuario_logado';

    function salvarUsuarioLogado(authData) {
        var usuarioLogado = {
            id: authData.usuarioId || null,
            nome: authData.nome || ''
        };

        $window.localStorage.setItem(userStorageKey, JSON.stringify(usuarioLogado));
    }

    function limparArmazenamento() {
        $window.localStorage.removeItem(tokenStorageKey);
        $window.localStorage.removeItem(userIdStorageKey);
        $window.localStorage.removeItem(userNameStorageKey);
        $window.localStorage.removeItem(userStorageKey);
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

            if (authData.usuarioId || authData.nome) {
                salvarUsuarioLogado(authData);
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
        getUsuarioLogado: function() {
            var usuarioLogado = $window.localStorage.getItem(userStorageKey);

            if (usuarioLogado) {
                try {
                    return JSON.parse(usuarioLogado);
                } catch (error) {
                    $window.localStorage.removeItem(userStorageKey);
                }
            }

            if (!this.getUsuarioId() && !this.getUsuarioNome()) {
                return null;
            }

            return {
                id: this.getUsuarioId(),
                nome: this.getUsuarioNome() || ''
            };
        },
        limparToken: function() {
            limparArmazenamento();
        },
        limparSessao: function() {
            limparArmazenamento();
        }
    };
});