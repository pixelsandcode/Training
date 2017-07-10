(function () {
    var secondController = function ($scope, $stateParams) {
        $scope.inputText = $stateParams.secondText;
        $scope.myStyle = $stateParams.secondStyle;
    };
    secondController.$inject = ['$scope', '$stateParams'];
    angular.module('myApp').controller('secondController', secondController);
}());
