angular.module("myApp", []);


(function () {
    var myController = function ($scope) {
        $scope.isHidden = true;
        $scope.myStyle = 'danger';
        $scope.checkContent = function () {
            if ($scope.myName) {
                if ($scope.isHidden) {
                    $scope.isHidden = !$scope.isHidden;
                }
                $scope.myStyle = 'success';
            } else if (!$scope.myName) {
                if (!$scope.isHidden) {
                    $scope.isHidden = !$scope.isHidden;
                }
                $scope.myStyle = 'danger';
            }
        };

    };
    myController.$inject = ['$scope'];
    angular.module('myApp').controller('myController', myController);
}());
