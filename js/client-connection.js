function createCommand(name, componentId, parameters) {
  var command = {
    '@class': 'com.adstter.tecun.services.integration.Command',
    'name': name,
    'componentId': componentId,
    'parameters': parameters
  };
  return command;
};

var ClientConnection = function (address, port, componentId, callback) {
  this.url = "http://" + address + ":" + port;
  this.componentId = componentId;
  this.socket = io(this.url);
  this.retries = 0;
  this.found = false;

  this.socket.on('complete', function (data) {
    this.executingAd = false;
    console.log(data);
    if (callback) {
      callback(data);
    }
  });

  this.volume = '0';
  this.fullscreen = true;
  this.channel = '0';
  this.executingAd = false;
  this.onPause = false;
  this.hasForcedAd = false;
};

ClientConnection.prototype.loadScreenshot = function (callback) {
  var command = createCommand('screenshot', this.componentId, { 'key': 'value' });
  var client = this;
  this.socket.emit('process-command', command, function (arg1) {
    if (arg1.result) {
      client.screenshot = arg1.result.screenshot;
    }
    if (callback) {
      callback(arg1);
    }
  });
}

ClientConnection.prototype.loadInformation = function (callback) {
  var command = createCommand('info', this.componentId, { 'key': 'value' });
  var client = this;
  this.socket.emit('process-command', command, function (arg1) {
    var volume = arg1.result.volume;
    var fullscreen = arg1.result.fullscreen === "true" ? true : false;
    var channel = arg1.result.channel;
    var onPause = arg1.result.onPause === "true" ? true : false;
    var offline = arg1.result.offline === "true" ? true : false;
    var hasForcedAd = arg1.result.hasForcedAd === "true" ? true : false;
    var voteQueue = arg1.result.voteQueue === "true" ? true : false;
    var pausedDateTime = arg1.result.pausedDateTime ? parseInt(arg1.result.pausedDateTime) : 0;
    client.volume = volume;
    client.fullscreen = fullscreen;
    client.channel = channel;
    client.onPause = onPause;
    client.offline = offline;
    client.hasForcedAd = hasForcedAd;
    client.voteQueue = voteQueue;
    client.info = arg1.result;
    client.pausedDateTime = pausedDateTime;
    console.log(client);
    if (callback) {
      callback(arg1);
    }
  });
};

ClientConnection.prototype.loadConfiguration = function (callback) {
  var command = createCommand('obtain-configuration', this.componentId, { 'key': 'value' });
  var client = this;
  this.socket.emit('process-command', command, function (arg1) {
    if (arg1.result) {
      client.configuration = JSON.parse(arg1.result.config);
      if (callback) {
        callback(client.configuration);
      }
    }
  });
};

ClientConnection.prototype.saveState = function (state, callback) {
  var command = createCommand(state, this.componentId, { 'state': state });
  console.log(command);
  var client = this;
  this.socket.emit('process-command', command, function (arg1) {
    var fullscreen = state === 'fullscreen' ? true : false;
    client.fullscreen = fullscreen;
    console.log(arg1);
    if (callback) {
      callback(arg1);
    }
  });
};

ClientConnection.prototype.changeChannel = function (channel, callback) {
  var command = createCommand('channel', this.componentId, { 'channel': channel });
  console.log(command);
  var client = this;
  this.socket.emit('process-command', command, function (arg1) {
    client.channel = channel;
    if (callback) {
      callback(arg1);
    }
  });
};

ClientConnection.prototype.saveVolume = function (volume, callback) {
  var command = createCommand('volume', this.componentId, { 'volume': volume });
  var client = this;
  console.log(command);
  console.log(this.socket);
  console.log(this.url);
  console.log(client);
  this.socket.emit('process-command', command, function (arg1) {
    client.volume = volume;
    console.log("RESPUESTA PROCESADA");
    console.log(client);
    if (callback) {
      callback(arg1);
    }
  });
};

ClientConnection.prototype.changeVolumeWithTimeout = function (volumeStart, volumeEnd, timeout, callback) {
  var command = createCommand('volume-timeout', this.componentId, { 'volume-start': volumeStart, 'volume-end': volumeEnd, 'timeout': timeout });
  var client = this;
  this.socket.emit('process-command', command, function (arg1) {
    client.volume = volumeStart;
    if (callback) {
      callback(arg1);
    }
  });
};

ClientConnection.prototype.changeAd = function (componentId, adId, callback) {
  var command = createCommand('ad-soft-change', componentId, { 'adId': adId });
  var client = this;
  this.executingMethod = true;
  this.socket.emit('process-command', command, function (arg1) {
    if (callback) {
      callback(arg1);
    }
  });
};

ClientConnection.prototype.selectPlaylist = function (componentId, playlistId, callback) {
  var command = createCommand('select-playlist', this.componentId, { 'player': componentId, 'playlist': playlistId });
  var client = this;
  this.executingMethod = true;
  this.socket.emit('process-command', command, function (arg1) {
    console.log(arg1);
    client.loadInformation();
    if (callback) {
      callback(arg1);
    }
  });
};

ClientConnection.prototype.deselectPlaylist = function (componentId, playlistId, callback) {
  var command = createCommand('deselect-playlist', this.componentId, { 'player': componentId, 'playlist': playlistId });
  var client = this;
  this.executingMethod = true;
  this.socket.emit('process-command', command, function (arg1) {
    console.log(arg1);
    client.loadInformation();
    if (callback) {
      callback(arg1);
    }
  });
};

ClientConnection.prototype.changeToYoutubeVideo = function (componentId, link, title, useAdstterVideo, callback) {
  var command = createCommand('youtube-video', componentId, { 'link': link, 'title': title, useAdstterVideo: useAdstterVideo });
  var client = this;
  this.executingMethod = true;
  this.socket.emit('process-command', command, function (arg1) {
    if (callback) {
      callback(arg1);
    }
  });
};

ClientConnection.prototype.pause = function (pauseTime, callback) {
  var command = createCommand('pause', this.componentId, { 'key': 'value', 'time': pauseTime });
  var client = this;
  client.onPause = true;
  client.pausedDateTime = new Date().getTime();
  this.socket.emit('process-command', command, function (arg1) {
    console.log(arg1);
    if (arg1.code === 0) {
      client.onPause = true;
    }
    if (callback) {
      callback(arg1);
    }
  });
};

ClientConnection.prototype.unpause = function (callback) {
  var command = createCommand('unpause', this.componentId, { 'key': 'value' });
  var client = this;
  client.onPause = false;
  this.socket.emit('process-command', command, function (arg1) {
    console.log(arg1);
    if (arg1.code === 0) {
      client.onPause = false;
    }
    if (callback) {
      callback(arg1);
    }
  });
};

ClientConnection.prototype.nextAd = function (callback) {
  var command = createCommand('next-ad', this.componentId, { 'key': 'value' });
  var client = this;
  this.socket.emit('process-command', command, function (arg1) {
    if (callback) {
      callback(arg1);
    }
  });
};

ClientConnection.prototype.goOffline = function (callback) {
  var command = createCommand('offline', this.componentId, { 'key': 'value' });
  var client = this;
  client.offline = true;
  this.socket.emit('process-command', command, function (arg1) {
    if (callback) {
      callback(arg1);
    }
  });
};

ClientConnection.prototype.goOnline = function (callback) {
  var command = createCommand('online', this.componentId, { 'key': 'value' });
  var client = this;
  client.offline = false;
  this.socket.emit('process-command', command, function (arg1) {
    if (callback) {
      callback(arg1);
    }
  });
};

ClientConnection.prototype.getOnPause = function () {
  return this.onPause;
};

ClientConnection.prototype.setVolume = function (volume) {
  this.volume = volume;
};

ClientConnection.prototype.getVolume = function () {
  return this.volume;
};

ClientConnection.prototype.isFullscreen = function () {
  return this.fullscreen;
};

ClientConnection.prototype.isOffline = function () {
  return this.offline;
};


ClientConnection.prototype.setFullscreen = function (fullscreen) {
  this.fullscreen = fullscreen;
};

ClientConnection.prototype.getChannel = function () {
  return this.channel;
};

ClientConnection.prototype.setChannel = function (channel) {
  this.channel = channel;
};
