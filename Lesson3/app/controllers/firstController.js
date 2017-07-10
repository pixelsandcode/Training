(function () {
    var firstController = function ($scope, $state) {
//        $scope.myStyle = 'primary';
//        $scope.isHidden = true;
//        $scope.inputText = 'nima';
        $scope.transfer = function () {

            if ($scope.inputText) {
                if (!$scope.isHidden) {
                    $scope.isHidden = true;
                }
                $scope.myStyle = 'success';
                $state.go('secondView', {
                    secondText: $scope.inputText,
                    secondStyle: $scope.myStyle
                });
            } else if (!$scope.inputText) {
                if ($scope.isHidden) {
                    $scope.isHidden = false;

                }
                $scope.myStyle = 'warning';
                $state.go('home');
            }
        };
    };

    firstController.$inject = ['$scope', '$state'];
    angular.module('myApp').controller('firstController', firstController);
}());
