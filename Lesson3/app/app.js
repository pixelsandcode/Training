(function () {

    var ls3App = angular.module('myApp', ['ui.router']);

    ls3App.config(function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('');
        $stateProvider
            .state('home', {
                url: '',
                controller: 'firstController',
                templateUrl: 'app/views/first.html'
            })
            .state('secondView', {
                //                url: '/secondView/:secondText/:secondStyle',
                url: '/secondView',
                params: {
                    secondText: null,
                    secondStyle: null
                },
                controller: 'secondController',
                templateUrl: 'app/views/second.html'
            });
    });
}());
