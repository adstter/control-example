var SocketService = angular.module('AppController.SocketService', []);

SocketService.factory('socket', function(socketFactory){
    //Create socket and connect to http://chat.socket.io 
    /*var menuBoard1 = io.connect('http://192.168.200.11');
    var menuBoard2 = io.connect('http://192.168.200.12');
    var menuBoard3 = io.connect('http://192.168.200.13');
    var menuBoard4 = io.connect('http://192.168.200.14');
    
    var liveTv1 = io.connect('http://192.168.200.15');
    var musicTv1 = io.connect('http://192.168.200.15');
    
    var liveTv2 = io.connect('http://192.168.200.16');
    var musicTv2 = io.connect('http://192.168.200.16');
    */
    var testTv = io.connect('http://localhost:1464');
    
    testTv.on('connect', function() {
			console.log("Test TV Connected");
		});
    
    var command = {
            '@class': 'com.adstter.tecun.services.integration.Command', 
            'name': 'Comando'
        };

        testTv.emit('process-command', command, function(arg1, arg2) {
            alert("ack from server! arg1: " + arg1 + ", arg2: " + arg2);
        });
    
    testTvSocket = socketFactory({
        testTv: testTv
    });
    var result = {
        testTv: testTvSocket
    };

    return testTvSocket;
});