app.directive('financialSelect', function($document, $timeout) {
    return {
        restrict: 'E',
        scope: {
            items: '<',
            ngModel: '=',
            placeholder: '@?',
            searchable: '<?',
            disabled: '<?',
            emptyMessage: '@?',
            searchPlaceholder: '@?',
            inputId: '@?',
            optionLabel: '&?',
            optionValue: '&?',
            onChange: '&?'
        },
        template: [
            '<div class="relative" ng-class="{\'z-[70]\': dropdownAberto}">',
            '    <button',
            '        type="button"',
            '        ng-attr-id="{{ inputId }}"',
            '        ng-disabled="disabled"',
            '        ng-click="toggleDropdown()"',
            '        class="flex w-full items-center justify-between gap-3 rounded-xl border border-[#10b981]/15 bg-black/30 px-4 py-3 text-left outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"',
            '    >',
            '        <span class="min-w-0 truncate text-sm" ng-class="{\'text-zinc-500\': !selectedLabel, \'text-zinc-100\': selectedLabel}">{{ selectedLabel || placeholderText }}</span>',
            '        <i class="fa-solid fa-chevron-down text-xs transition" ng-class="{\'rotate-180 text-emerald-400\': dropdownAberto, \'text-zinc-500\': !dropdownAberto}"></i>',
            '    </button>',
            '    <div ng-if="dropdownAberto" class="financial-select-panel absolute left-0 right-0 top-full z-[80] mt-2 overflow-hidden rounded-2xl border border-[#10b981]/20 bg-[#07100c] shadow-2xl shadow-black/40">',
            '        <div ng-if="searchable" class="border-b border-[#10b981]/10 p-3">',
            '            <div class="financial-select-search flex items-center gap-3 rounded-xl border border-[#10b981]/15 bg-black/30 px-3 py-2.5">',
            '                <i class="fa-solid fa-magnifying-glass text-sm text-emerald-400"></i>',
            '                <input',
            '                    type="text"',
            '                    ng-model="ui.searchTerm"',
            '                    ng-keydown="handleSearchKeydown($event)"',
            '                    placeholder="{{ searchPlaceholderText }}"',
            '                    class="w-full bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-500"',
            '                >',
            '            </div>',
            '        </div>',
            '        <div class="financial-scrollbar max-h-64 overflow-y-auto py-2">',
            '            <button',
            '                type="button"',
            '                ng-repeat="item in visibleItems track by $index"',
            '                ng-click="selectItem(item)"',
            '                class="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm transition"',
            '                ng-class="{\'bg-[#10b981]/10 text-emerald-300\': isSelected(item), \'text-zinc-300 hover:bg-white/5 hover:text-zinc-100\': !isSelected(item)}"',
            '            >',
            '                <span class="truncate">{{ getLabel(item) }}</span>',
            '                <i ng-if="isSelected(item)" class="fa-solid fa-check text-xs text-emerald-400"></i>',
            '            </button>',
            '            <div ng-if="!visibleItems.length" class="px-4 py-6 text-center text-sm text-zinc-500">{{ emptyMessageText }}</div>',
            '        </div>',
            '    </div>',
            '</div>'
        ].join(''),
        link: function(scope, element) {
            scope.searchable = scope.searchable === true || scope.searchable === 'true';
            scope.placeholderText = scope.placeholder || 'Selecione uma opção';
            scope.emptyMessageText = scope.emptyMessage || 'Nenhum item encontrado.';
            scope.searchPlaceholderText = scope.searchPlaceholder || 'Pesquisar...';
            scope.dropdownAberto = false;
            scope.ui = {
                searchTerm: ''
            };
            scope.selectedLabel = '';
            scope.visibleItems = [];

            scope.toggleDropdown = function() {
                if (scope.disabled) {
                    return;
                }

                if (scope.dropdownAberto) {
                    closeDropdown();
                    return;
                }

                openDropdown();
            };

            scope.getLabel = function(item) {
                var label;

                if (scope.optionLabel) {
                    label = scope.optionLabel({ item: item });
                }

                if (angular.isDefined(label) && label !== null) {
                    return label.toString();
                }

                if (angular.isObject(item)) {
                    if (angular.isDefined(item.nome)) {
                        return item.nome.toString();
                    }

                    if (angular.isDefined(item.name)) {
                        return item.name.toString();
                    }

                    if (angular.isDefined(item.label)) {
                        return item.label.toString();
                    }
                }

                return angular.isDefined(item) && item !== null ? item.toString() : '';
            };

            scope.getValue = function(item) {
                var valor;

                if (scope.optionValue) {
                    valor = scope.optionValue({ item: item });
                }

                if (angular.isDefined(valor)) {
                    return valor;
                }

                if (angular.isObject(item)) {
                    if (angular.isDefined(item.id)) {
                        return item.id;
                    }

                    if (angular.isDefined(item.value)) {
                        return item.value;
                    }

                    if (angular.isDefined(item.code)) {
                        return item.code;
                    }
                }

                return item;
            };

            scope.selectItem = function(item) {
                scope.ngModel = scope.getValue(item);
                scope.selectedLabel = scope.getLabel(item);
                scope.ui.searchTerm = '';
                closeDropdown();

                if (scope.onChange) {
                    scope.onChange();
                }
            };

            scope.isSelected = function(item) {
                return valuesEqual(scope.getValue(item), scope.ngModel);
            };

            scope.handleSearchKeydown = function(event) {
                if (event.key === 'Escape') {
                    closeDropdown();
                }
            };

            scope.$watch('ngModel', syncSelectedLabel);
            scope.$watchCollection('items', syncSelectedLabel);
            scope.$watchCollection('items', syncVisibleItems);
            scope.$watch('ui.searchTerm', syncVisibleItems);
            scope.$watch('disabled', function(disabled) {
                if (disabled) {
                    closeDropdown();
                }
            });

            $document.on('click', handleDocumentClick);

            scope.$on('$destroy', function() {
                $document.off('click', handleDocumentClick);
            });

            function openDropdown() {
                scope.dropdownAberto = true;
                scope.ui.searchTerm = '';
                syncVisibleItems();

                if (scope.searchable) {
                    $timeout(focusSearchInput);
                }
            }

            function closeDropdown() {
                scope.dropdownAberto = false;
                scope.ui.searchTerm = '';
            }

            function focusSearchInput() {
                var input = element[0].querySelector('.financial-select-search input');

                if (input) {
                    input.focus();
                }
            }

            function handleDocumentClick(event) {
                if (element[0].contains(event.target)) {
                    return;
                }

                scope.$applyAsync(function() {
                    closeDropdown();
                });
            }

            function syncSelectedLabel() {
                var itens = angular.isArray(scope.items) ? scope.items : [];
                var itemSelecionado = null;

                itens.some(function(item) {
                    if (valuesEqual(scope.getValue(item), scope.ngModel)) {
                        itemSelecionado = item;
                        return true;
                    }

                    return false;
                });

                scope.selectedLabel = itemSelecionado ? scope.getLabel(itemSelecionado) : '';
            }

            function syncVisibleItems() {
                var itens = angular.isArray(scope.items) ? scope.items.slice() : [];
                var termo = normalizarTextoBusca(scope.ui.searchTerm);

                if (!scope.searchable || !termo) {
                    scope.visibleItems = itens;
                    return;
                }

                scope.visibleItems = itens.filter(function(item) {
                    return normalizarTextoBusca(scope.getLabel(item)).indexOf(termo) !== -1;
                });
            }

            function normalizarTextoBusca(texto) {
                return (texto || '')
                    .toString()
                    .trim()
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '');
            }

            function valuesEqual(primeiroValor, segundoValor) {
                if (primeiroValor === segundoValor) {
                    return true;
                }

                if (!angular.isDefined(primeiroValor) || !angular.isDefined(segundoValor) || primeiroValor === null || segundoValor === null) {
                    return false;
                }

                return primeiroValor.toString() === segundoValor.toString();
            }

            syncVisibleItems();
        }
    };
});