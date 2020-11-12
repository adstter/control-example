var liveTv1Controller = angular.module('AppController.LiveTv1Controller', []);

liveTv1Controller.controller('LiveTv1Controller', ['$scope', '$ionicLoading', function($scope, $ionicLoading) {
    
    var musicSocket = io.connect('http://192.168.10.15:1496');
    
    var tvSocket = io.connect('http://192.168.10.15:1495');
    
    $scope.musicVolume = false;
    $scope.tvVolume = false;
    $scope.model = {};
    $scope.model.musicVolume = true;
    $scope.model.tvVolume = false;
    $scope.model.liveTv = false;
    
    $scope.saveMusicVolume = function(){
        var musicVolume = $scope.model.musicVolume ? "100" : "0";
        var command = {
            '@class': 'com.adstter.tecun.services.integration.Command', 
            'name': 'volume',
            'componentId' : '1496',
            'parameters': {'volume': musicVolume}
        };
        musicSocket.emit('process-command', command, function(arg1, arg2) {
            
        });
    };
    
    $scope.saveTvVolume = function(){
        var musicVolume = $scope.model.tvVolume ? "100" : "0";
        var command = {
            '@class': 'com.adstter.tecun.services.integration.Command', 
            'name': 'volume',
            'componentId' : 'Player_5486176504905728',
            'parameters': {'volume': musicVolume}
        };
        tvSocket.emit('process-command', command, function(arg1, arg2) {
            
        });
    };
    
    $scope.saveTvState = function(){
        var screenState = $scope.model.liveTv? "normalscreen" : "fullscreen";
        var command = {
            '@class': 'com.adstter.tecun.services.integration.Command', 
            'name': screenState,
            'componentId' : 'Player_5486176504905728',
            'parameters': {'state': screenState}
        };
        tvSocket.emit('process-command', command, function(arg1, arg2) {
        
        });
    };
    
    function requestTvState(){
        var command = {
            '@class': 'com.adstter.tecun.services.integration.Command', 
            'name': 'info',
            'componentId' : 'Player_5486176504905728',
            'parameters': {'key': 'value'}
        };
        tvSocket.emit('process-command', command, function(arg1) {
            $scope.model.tvVolume = arg1.result.volume === "100"? true: false;
            $scope.model.liveTv = arg1.result.fullscreen === "true"? false: true;
        });
    };
    
    function requestMusicVolumeState(){
        var command = {
            '@class': 'com.adstter.tecun.services.integration.Command', 
            'name': 'info',
            'componentId' : '1496',
            'parameters': {'key': 'value'}
        };
        musicSocket.emit('process-command', command, function(arg1) {
            $scope.model.musicVolume = arg1.result.volume === "100"? true: false;
        });
    };
    
    $scope.init = function(){
        requestTvState();
        requestMusicVolumeState();
    };
    
    $scope.init();
    
}]);