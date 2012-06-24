'use strict';

function dbCurrencyToUser(value){
    if(value == '/' || isNaN(value - 0) || value == null){
        return '/';
    }
    var pval = Number(value);
    var digs = 4;
    if(pval.toFixed(2) == pval){
        digs = 2;
    }
    var erg = Math.floor(pval);
    var rest = Number(pval - erg).toFixed(digs);
    return erg + ',' + rest.substr(2,4);
}

function dbCurrencyFromUser(input){
    if(input == '/' || input == null){
        return '/';
    }
    var parts= input.split(',');
    var digs = 2;
    var sum = Number(parts[0]);
    if(parts[1]){
        var rest = "0." + parts[1];
        var sum = sum + Number(rest);
        digs = Math.max(2, parts[1].length);
    }
    return sum.toFixed(digs);
}

// Declare app level module which depends on filters, and services
angular.module('myApp', ['myApp.filters', 'myApp.services', 'myApp.directives']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/details', {templateUrl: 'partials/details.html', controller: DetailCtrl});
    $routeProvider.otherwise({redirectTo: '/details'});
  }]).
  directive('waehrung', function() {
    return {
      restrict: 'A', // only activate on element attribute
      require: '?ngModel', // get a hold of NgModelController

      link: function(scope, element, attrs, ngModel) {
        if(!ngModel) return; // do nothing if no ng-model

        // Specify how UI should be updated
        ngModel.$render = function() {
          ngModel.$viewValue = dbCurrencyToUser(ngModel.$modelValue);
          element.val(ngModel.$viewValue);
        };


        ngModel.$parsers.push(dbCurrencyFromUser);

      }
    };
  });
