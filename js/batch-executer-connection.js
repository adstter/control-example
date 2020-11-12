
function createBatchInfo(location, name){
    var command = {
        '@class': 'com.adstter.batch.executor.BatchInfo', 
        'location': location,
        'name' : name        
    };
    return command;
};

var BatchExecuterConnection = function(address, port, callback){
    this.url = "http://" + address + ":" + port;
    this.socket = io.connect(this.url);
    this.lastBatch = "none";
};

BatchExecuterConnection.prototype.loadInformation = function(callback){
    var defaultInfo = createBatchInfo('status', 'status');
    var client = this;
    this.socket.emit('status', defaultInfo, function(arg1) {
        console.log(arg1);
        if(arg1.code ===0){
            client.lastBatch = arg1.message;
        }
        if (callback) {
            callback(arg1);
        }
    });
};

BatchExecuterConnection.prototype.execute = function(location, name, callback){
    var info = createBatchInfo(location, name);
    console.log(info);
    var client = this;
    client.lastBatch = name;
    this.socket.emit('batch-execute', info, function(arg1) {                
        console.log(arg1);
        if(arg1.code === 0) {
            client.lastBatch = arg1.message;
        }
        if(callback){            
            callback(arg1);
        }
    });
};

BatchExecuterConnection.prototype.restartMusic = function(callback){
   this.execute('', 'restart-player.bat', callback);
};

BatchExecuterConnection.prototype.restartSystem = function(callback){
    this.execute('', 'reboot.bat', callback);
};

BatchExecuterConnection.prototype.viewCable = function(callback){
    this.execute('', 'start-cable.bat', callback);
};

BatchExecuterConnection.prototype.viewCam = function(callback){
    this.execute('', 'start-cam.bat', callback);
};

BatchExecuterConnection.prototype.openMobdro = function(callback){
    this.execute('', 'start-mobdro.bat', callback);
};

BatchExecuterConnection.prototype.closeMobdro = function(callback){
    this.execute('', 'stop-mobdro.bat', callback);
};


BatchExecuterConnection.prototype.changeChannel = function(channel, callback){
    this.execute('', 'change-channel.bat ' + channel, callback);
};

BatchExecuterConnection.prototype.openBrowser = function(link, callback){
    this.execute('', 'open-browser.bat "' + link + '"', callback);
};

BatchExecuterConnection.prototype.closeBrowser = function(link, callback){
    this.execute('', 'close-browser.bat', callback);
};
    
BatchExecuterConnection.prototype.volume = function(callback){
    this.execute('', 'volume-tv.bat ' + this.lastBatch, callback);
};

BatchExecuterConnection.prototype.mute = function(callback){
    this.execute('', 'mute-tv.bat ' + this.lastBatch, callback);
};

BatchExecuterConnection.prototype.stopTv = function(callback){
    this.execute('', 'stop-tv.bat', callback);
};

BatchExecuterConnection.prototype.changeVolume = function(volume, callback){
    this.execute('', 'change-volume.bat ' + volume, callback);
};


BatchExecuterConnection.prototype.getLastBatch = function(){
    return this.lastBatch;
};
