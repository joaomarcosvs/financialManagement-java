app.controller('PerfilController', function($state, $window, AuthService, UsuarioService) {
    var vm = this;

    vm.usuario = {
        nome: '',
        email: '',
        telefone: ''
    };
    vm.senhas = {
        senhaAtual: '',
        novaSenha: '',
        confirmarNovaSenha: ''
    };
    vm.carregandoPerfil = false;
    vm.salvandoPerfil = false;
    vm.salvandoSenha = false;
    vm.mensagemPerfilErro = '';
    vm.mensagemPerfilSucesso = '';
    vm.mensagemSenhaErro = '';
    vm.mensagemSenhaSucesso = '';
    vm.mensagemZonaPerigoErro = '';

    vm.carregarPerfil = function() {
        if (!AuthService.getUsuarioId()) {
            $state.go('login');
            return;
        }

        vm.carregandoPerfil = true;
        vm.mensagemPerfilErro = '';

        UsuarioService.buscarPerfil()
            .then(function(response) {
                vm.usuario = response.data || vm.usuario;
                AuthService.atualizarUsuarioLogado(vm.usuario);
            })
            .catch(function(error) {
                vm.mensagemPerfilErro = extrairMensagemErro(error, 'Não foi possível carregar os dados do perfil.');
            })
            .finally(function() {
                vm.carregandoPerfil = false;
            });
    };

    vm.salvarPerfil = function() {
        vm.mensagemPerfilErro = '';
        vm.mensagemPerfilSucesso = '';

        if (!vm.usuario.nome || !vm.usuario.nome.trim()) {
            vm.mensagemPerfilErro = 'Informe o nome do usuário.';
            return;
        }

        vm.salvandoPerfil = true;

        UsuarioService.atualizarPerfil(vm.usuario)
            .then(function(response) {
                vm.usuario = response.data || vm.usuario;
                AuthService.atualizarUsuarioLogado(vm.usuario);
                vm.mensagemPerfilSucesso = 'Perfil atualizado com sucesso.';
            })
            .catch(function(error) {
                vm.mensagemPerfilErro = extrairMensagemErro(error, 'Não foi possível atualizar o perfil.');
            })
            .finally(function() {
                vm.salvandoPerfil = false;
            });
    };

    vm.salvarNovaSenha = function() {
        vm.mensagemSenhaErro = '';
        vm.mensagemSenhaSucesso = '';

        if (!vm.senhas.senhaAtual || !vm.senhas.novaSenha || !vm.senhas.confirmarNovaSenha) {
            vm.mensagemSenhaErro = 'Preencha todos os campos de senha.';
            return;
        }

        if (vm.senhas.novaSenha.length < 6) {
            vm.mensagemSenhaErro = 'A nova senha deve ter pelo menos 6 caracteres.';
            return;
        }

        if (vm.senhas.novaSenha !== vm.senhas.confirmarNovaSenha) {
            vm.mensagemSenhaErro = 'A confirmação da nova senha não confere.';
            return;
        }

        vm.salvandoSenha = true;

        UsuarioService.alterarSenha({
            senhaAtual: vm.senhas.senhaAtual,
            novaSenha: vm.senhas.novaSenha
        })
            .then(function() {
                vm.senhas = {
                    senhaAtual: '',
                    novaSenha: '',
                    confirmarNovaSenha: ''
                };
                vm.mensagemSenhaSucesso = 'Senha atualizada com sucesso.';
            })
            .catch(function(error) {
                vm.mensagemSenhaErro = extrairMensagemErro(error, 'Não foi possível atualizar a senha.');
            })
            .finally(function() {
                vm.salvandoSenha = false;
            });
    };

    vm.confirmarExclusao = function() {
        vm.mensagemZonaPerigoErro = '';

        if (!$window.confirm('Deseja realmente excluir sua conta? Esta ação é permanente.')) {
            return;
        }

        UsuarioService.excluirConta()
            .then(function() {
                AuthService.limparSessao();
                $state.go('login');
            })
            .catch(function(error) {
                vm.mensagemZonaPerigoErro = extrairMensagemErro(error, 'Não foi possível excluir a conta.');
            });
    };

    function extrairMensagemErro(error, fallback) {
        if (error && error.data) {
            if (typeof error.data === 'string') {
                return error.data;
            }

            if (error.data.status) {
                return error.data.status;
            }

            return Object.values(error.data).join(' ');
        }

        return fallback;
    }

    vm.carregarPerfil();
});