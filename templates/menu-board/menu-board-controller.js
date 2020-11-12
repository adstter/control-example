var menuBoardController = angular.module('AppController.MenuBoardController', []);

menuBoardController.controller('MenuBoardController', ['$scope', '$ionicLoading', function($scope, $ionicLoading) {
    var screen1 = io.connect('http://192.168.200.11:1480');
    var screen2 = io.connect('http://192.168.200.12:1481');
    var screen3 = io.connect('http://192.168.200.13:1482');
    var screen4 = io.connect('http://192.168.200.14:1483');
    
    var animations = [
        [
            {'player': '1480', 'adId':'2776', 'connection': screen1},
            {'player': '1481', 'adId':'2777', 'connection': screen2},
            {'player': '1482', 'adId':'2778', 'connection': screen3},
            {'player': '1483', 'adId':'2779', 'connection': screen4}    
        ],
        [
            {'player': '1480', 'adId':'2776', 'connection': screen1},
            {'player': '1481', 'adId':'2777', 'connection': screen2},
            {'player': '1482', 'adId':'2778', 'connection': screen3},
            {'player': '1483', 'adId':'2779', 'connection': screen4}
        ]
    ];
    
    var counter = 0;
    var animationPlaying = null;
    
    $scope.playAnimation = function(index){
        animationPlaying = index;
        var animation = animations[index];
        for (var i = 0; i < animation.length; i++){
            var part = animation[i];
            if (!part.connection.connected){
                alert('No se puede ejecutar esta animacion, no conectado: ' + part.player);
                return;
            }
            var command = {
                '@class': 'com.adstter.tecun.services.integration.Command', 
                'name': 'ad',
                'componentId' : part.player,
                'parameters': {'adId': part.adid, 'state': 'START'}
            };
            console.log("Llamando a: " + part.player + "Parametros: " + command.parameters);
            part.connection.emit('process-command', command, function(arg1, arg2) {
            
            });
            part.connection.on('ready', function(data, ackServerCallback, arg1) {
                console.log("Client Ready");
                console.log(data);
                checkAnimation(index);
            });
        }
    };
    
    function checkAnimation (index) {
        counter++;
        if(counter >= animations[index].length){
            startVideo(index);
        }
    };
    
    function startVideo (index) {
        var animation = animations[index];
        for (var i = 0; i < animation.length; i++) {
            var part = animation[i];
            if (!part.connection.connected){
                alert('No se puede ejecutar esta animacion, no conectado: ' + part.player);
                return;
            }
            var command = {
                '@class': 'com.adstter.tecun.services.integration.Command', 
                'name': 'ad',
                'componentId' : part.player,
                'parameters': {'adId': part.adid, 'state': 'INIT-AD'}
            };
            part.connection.emit('process-command', command, function(arg1, arg2) {
               console.log("Iniciando video");
               console.log(arg1);
               console.log(arg2); 
            });
        }
    };
    
}]);