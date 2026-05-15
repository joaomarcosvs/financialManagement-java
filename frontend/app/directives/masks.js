app.directive('maskTelefone', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, ngModelCtrl) {
            ngModelCtrl.$formatters.push(formatarTelefone);
            ngModelCtrl.$parsers.push(formatarTelefone);

            ngModelCtrl.$render = function() {
                element.val(ngModelCtrl.$viewValue || '');
            };

            element.on('input', aoDigitar);

            scope.$on('$destroy', function() {
                element.off('input', aoDigitar);
            });

            function aoDigitar() {
                var valorFormatado = formatarTelefone(element.val());

                scope.$applyAsync(function() {
                    ngModelCtrl.$setViewValue(valorFormatado);
                    ngModelCtrl.$render();
                });
            }

            function formatarTelefone(valor) {
                var digitos = (valor || '').toString().replace(/\D/g, '').slice(0, 11);

                if (!digitos) {
                    return '';
                }

                if (digitos.length <= 2) {
                    return '(' + digitos;
                }

                if (digitos.length <= 6) {
                    return '(' + digitos.slice(0, 2) + ') ' + digitos.slice(2);
                }

                if (digitos.length <= 10) {
                    return '(' + digitos.slice(0, 2) + ') ' + digitos.slice(2, 6) + '-' + digitos.slice(6);
                }

                return '(' + digitos.slice(0, 2) + ') ' + digitos.slice(2, 7) + '-' + digitos.slice(7);
            }
        }
    };
});

app.directive('maskMoeda', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, ngModelCtrl) {
            ngModelCtrl.$parsers.push(parseValorMonetario);
            ngModelCtrl.$formatters.push(formatarValorMonetario);

            ngModelCtrl.$render = function() {
                element.val(ngModelCtrl.$viewValue || '');
            };

            element.on('input', aoDigitar);
            element.on('blur', aoPerderFoco);

            scope.$on('$destroy', function() {
                element.off('input', aoDigitar);
                element.off('blur', aoPerderFoco);
            });

            function aoDigitar() {
                var valorFormatado = formatarValorDigitado(element.val());

                scope.$applyAsync(function() {
                    ngModelCtrl.$setViewValue(valorFormatado);
                    ngModelCtrl.$render();
                });
            }

            function aoPerderFoco() {
                if (!element.val()) {
                    return;
                }

                aoDigitar();
            }

            function parseValorMonetario(valor) {
                if (!valor) {
                    return null;
                }

                var valorNormalizado = valor.toString().replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '');
                var numero = parseFloat(valorNormalizado);

                return Number.isNaN(numero) ? null : numero;
            }

            function formatarValorMonetario(valor) {
                if (valor === null || valor === undefined || valor === '') {
                    return '';
                }

                return formatarNumeroComoMoeda(Number(valor));
            }

            function formatarValorDigitado(valor) {
                var digitos = (valor || '').toString().replace(/\D/g, '');

                if (!digitos) {
                    return '';
                }

                return formatarNumeroComoMoeda(parseInt(digitos, 10) / 100);
            }

            function formatarNumeroComoMoeda(valor) {
                if (valor === null || valor === undefined || Number.isNaN(valor)) {
                    return '';
                }

                var partes = Number(valor).toFixed(2).split('.');
                var inteiro = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');

                return inteiro + ',' + partes[1];
            }
        }
    };
});