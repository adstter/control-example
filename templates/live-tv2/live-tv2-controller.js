var liveTv2Controller = angular.module('AppController.LiveTv2Controller', []);

liveTv2Controller.controller('LiveTv2Controller', ['$scope', '$ionicLoading', function($scope, $ionicLoading) {
    var musicSocket = io.connect('http://192.168.10.16:1497');
    var musicComponentId = '1497';
    var tvSocket = io.connect('http://192.168.10.16:1485');
    var tvComponentId = 'Player_6523130323402752';
    
    $scope.musicVolume = false;
    $scope.tvVolume = false;
    $scope.model = {};
    $scope.model.musicVolume = true;
    $scope.model.tvVolume = false;
    
    
    $scope.saveMusicVolume = function(){
        var musicVolume = $scope.model.musicVolume ? "100" : "0";
        var command = getCommand('volume', musicComponentId, {'volume': musicVolume});
        musicSocket.emit('process-command', command, function(arg1, arg2) {
            
        });
    };
    
    $scope.saveTvVolume = function(){
        var musicVolume = $scope.model.tvVolume ? "100" : "0";
        var command = getCommand('volume', tvComponentId, {'volume': musicVolume});
        tvSocket.emit('process-command', command, function(arg1, arg2) {
            
        });
    };
    
    $scope.saveTvState = function(){
        var screenState = $scope.model.liveTv? "normalscreen" : "fullscreen";
        var command = getCommand(screenState, tvComponentId, {'state': screenState});
        tvSocket.emit('process-command', command, function(arg1, arg2) {
        
        });
    };
    
    $scope.changeChannel = function(){
        var command = getCommand('channel', tvComponentId, {'channel': $scope.model.channel});
        tvSocket.emit('process-command', command, function(arg1, arg2) {
        
        });
    };
    
    function requestTvState(){
        var command = getCommand('info', tvComponentId, {'key': 'value'});
        tvSocket.emit('process-command', command, function(arg1) {
            $scope.model.tvVolume = arg1.result.volume === "100"? true: false;
            $scope.model.liveTv = arg1.result.fullscreen === "true"? false: true;
        });
    };
    
    function requestMusicVolumeState(){
        var command = getCommand('info', musicComponentId, {'key': 'value'});
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