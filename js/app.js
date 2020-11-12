var app=angular.module('app-controller', 
                       ['ionic', 
                        'ngSanitize',
                        'ngCordova',
                        'ngResource',
                        'btford.socket-io', 
                        'AppController.MainController', 
                        'AppController.LiveTv1Controller', 
                        'AppController.LiveTv2Controller', 
                        'AppController.MenuBoardController',
                        'AppController.SocketService'])

    .run(function($ionicPlatform) {
      $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if(window.cordova && window.cordova.plugins.Keyboard) {
          cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if(window.StatusBar) {
          StatusBar.styleDefault();
        }
      });
    })
    .config(function($stateProvider, $urlRouterProvider)
    {

      $stateProvider
      .state('menu-board', {
        url: "/menu-board",
        templateUrl: "templates/menu-board/menu-board.html"
      })
      .state('live-tv1', {
        url: "/live-tv1",
        templateUrl: "templates/live-tv1/live-tv1.html"
      })
      .state('live-tv2', {
        url: "/live-tv2",
        templateUrl: "templates/live-tv2/live-tv2.html"
      })
      .state('main', {
        url: "/",
        templateUrl: "templates/main.html"
      });

      $urlRouterProvider.otherwise('/');
    })