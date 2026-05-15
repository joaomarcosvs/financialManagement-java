app.factory('UsuarioService', function($http, AuthService) {
    function obterUsuarioId() {
        return AuthService.getUsuarioId();
    }

    return {
        buscarPerfil: function() {
            return $http.get('http://localhost:8080/api/v1/usuarios/' + obterUsuarioId());
        },
        atualizarPerfil: function(usuario) {
            return $http.put('http://localhost:8080/api/v1/usuarios/' + obterUsuarioId(), {
                nome: usuario.nome,
                telefone: usuario.telefone
            });
        },
        alterarSenha: function(dadosSenha) {
            return $http.put('http://localhost:8080/api/v1/usuarios/' + obterUsuarioId() + '/senha', dadosSenha);
        },
        excluirConta: function() {
            return $http.delete('http://localhost:8080/api/v1/usuarios/' + obterUsuarioId());
        }
    };
});