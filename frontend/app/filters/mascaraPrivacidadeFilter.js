app.filter('mascaraPrivacidade', function($filter, $rootScope) {
    return function(valor) {
        if ($rootScope.modoPrivacidade) {
            return 'R$ ****';
        }

        return $filter('currency')(valor, 'R$ ');
    };
});