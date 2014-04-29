'strict';

require('angular');
require('angular-route');

angular.module('app', [ "ngRoute" ])

    .controller('MainCtrl', ['$scope', function ($scope) {
       $scope.say = "Hello World!";
    }]);
