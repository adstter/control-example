var liveTv1Controller = angular.module('AppController.MainController', []);

liveTv1Controller.controller('MainController',
        ['$scope', '$ionicLoading', '$ionicPopup', '$timeout', '$state', '$cordovaInAppBrowser', '$ionicModal',
            '$cordovaAppAvailability', '$resource', '$ionicScrollDelegate',
            function ($scope, $ionicLoading, $ionicPopup, $timeout, $state, $cordovaInAppBrowser, $ionicModal,
                    $cordovaAppAvailability, $resource, $ionicScrollDelegate) {

                $scope.lastSelectedVideo = null;
                var apiKeys = ['AIzaSyA_2WblE4TLcywKj9QOqASqfOYbMX5hgh4', 'AIzaSyDFaryf0BgZ1onvh1m-_N9TN3mw_UbcMBY'];
                var musicController = null;
                var batchController = null;
                var socket = null;
                $scope.model = {
                    config: {
                        ads: [],
                        showCoaxialButton: false,
                        allowChannelChange: false,
                        showRCAButton: false,
                        coaxialLabel: 'Cable',
                        rcaLabel: 'RCA',
                        volume: 65535
                    },
                    useAdstterVideo: true,
                };
                $scope.live = false;

                var password = "7181";
                var options = {
                    location: 'no',
                    clearcache: 'no',
                    toolbar: 'yes'
                };

                $ionicModal.fromTemplateUrl('templates/channel-template.html', {
                    scope: $scope,
                    animation: 'slide-in-up'
                }).then(function (modal) {
                    $scope.modal = modal;
                });


                $ionicModal.fromTemplateUrl('templates/searching-connection.html', {
                    scope: $scope,
                    animation: 'slide-in-up'
                }).then(function (modal) {
                    $scope.searchingConnectionModal = modal;
                });

                $ionicModal.fromTemplateUrl('templates/advanced-configuration.html', {
                    scope: $scope,
                    animation: 'slide-in-up'
                }).then(function (modal) {
                    $scope.advancedConfigurationModal = modal;
                });

                $ionicModal.fromTemplateUrl('templates/volume-configuration.html', {
                    scope: $scope,
                    animation: 'slide-in-up'
                }).then(function (modal) {
                    $scope.volumeModal = modal;
                });

                $ionicModal.fromTemplateUrl('templates/youtube-selector.html', {
                    scope: $scope,
                    animation: 'slide-in-up'
                }).then(function (modal) {
                    $scope.youtubeModal = modal;
                });

                $ionicModal.fromTemplateUrl('templates/second-plane-music.html', {
                    scope: $scope,
                    animation: 'slide-in-up'
                }).then(function (modal) {
                    $scope.secondPlaneModal = modal;
                });

                $ionicModal.fromTemplateUrl('templates/advanced-password.html', {
                    scope: $scope,
                    animation: 'slide-in-up'
                }).then(function (modal) {
                    $scope.passwordModal = modal;
                });

                $scope.$on('modal.hidden', function () {
                    saveConfig();
                });

                $scope.model.refresh = function () {
                    $scope.$apply();
                };

                $scope.model.range = function (n) {
                    return new Array(n);
                };

                $scope.model.reloadScreenshot = function () {
                    musicController.loadScreenshot(function (screenshot) {
                        $scope.model.refresh();
                    });
                };

                $scope.model.reload = function () {
                    musicController.loadInformation();

                    musicController.loadConfiguration(function (config) {
                        $scope.hasPlaylists = false;
                        if (config.playlists && config.playlists.length > 0) {
                            $scope.hasPlaylists = true;
                            return;
                        }
                        if (config.components) {
                            for (var i = 0; i < config.components.length; i++) {
                                var component = config.components[i];
                                if (component.playlists && component.playlists.length > 0) {
                                    $scope.hasPlaylists = true;
                                    return;
                                }
                            }
                        }

                    });

                    batchController.loadInformation(function (arg) {
                        if (arg.message != null && arg.message.indexOf('change-channel.bat') >= 0) {
                            var lastBatch = arg.message;
                            var channel = lastBatch.replace("change-channel.bat ", "");
                            $scope.model.actualChannel = Number(channel);
                        }
                    });
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                };

                function saveConfig() {
                    if (typeof (localStorage) !== "undefined") {
                        localStorage.setItem("config", JSON.stringify($scope.model.config));
                    }
                }
                ;

                function loadConfig() {
                    if (typeof (localStorage) !== "undefined") {
                        var config = localStorage.getItem("config");
                        if (config) {
                            $scope.model.config = JSON.parse(config);
                            if (!$scope.model.config.volume) {
                                $scope.model.config.volume = 65535;
                            }
                            if ($scope.model.config.enablePlaylistsSelection == null) {
                                $scope.model.config.enablePlaylistsSelection = true;
                            }
                            if ($scope.model.config.ponmusicaCode && (
                                    $scope.model.config.ponmusicaCode.toUpperCase().indexOf("KLOSTER") >= 0 ||
                                    $scope.model.config.ponmusicaCode.toUpperCase().indexOf("WENDYS") >= 0 ||
                                    $scope.model.config.ponmusicaCode.toUpperCase().indexOf("WSZ7") >= 0 ||
                                    $scope.model.config.ponmusicaCode.toUpperCase().indexOf("atlantisz9") >= 0
                                    )) {
                                $scope.model.config.allowYoutube = false;
                                $scope.model.config.enablePlaylistsSelection = false;
                            }
                        }
                    }
                }
                ;

                function evaluateCron(cronExp) {
                    var parts = cronExp.split(" ");
                    var now = new Date();
                    var evaluation = [];
                    evaluation[0] = now.getMinutes();
                    evaluation[1] = now.getHours();
                    evaluation[2] = now.getDate();
                    evaluation[3] = now.getMonth() + 1;
                    evaluation[4] = now.getDay();
                    for (var i = 0; i < parts.length; i++) {
                        var subparts = parts[i].split(",");
                        var atleastOnce = false;
                        for (var j = 0; j < subparts.length; j++) {
                            if (parts[i] === "*" || subparts[j] === evaluation[i].toString()) {
                                atleastOnce = true;
                            }
                        }
                        if (!atleastOnce) {
                            return false;
                        }
                    }
                    return true;
                }

                function evaluateCrons(cronList) {
                    if (!cronList) {
                        return true;
                    }
                    for (var i = 0; i < cronList.length; i++) {
                        if (evaluateCron(cronList[i])) {
                            return true;
                        }
                    }
                    return false;
                }

                loadConfig();



                $scope.containsPlaylist = function (playlist, component) {
                    var key = component.id + "_playlists";
                    var value = $scope.model.musicController.info[key];
                    return value && value.indexOf(playlist.id) >= 0;
                }

                $scope.togglePlaylist = function (playlist, component) {
                    $scope.showLoading(250);
                    if ($scope.containsPlaylist(playlist, component)) {
                        $scope.model.musicController.deselectPlaylist(component.id, playlist.id);
                    } else {
                        $scope.model.musicController.selectPlaylist(component.id, playlist.id);
                    }
                }

                $scope.toggleAutomaticReproduction = function (component) {
                    var anySelected = $scope.isAnyPlaylistsSelected(component);
                    if (component.playlists) {
                        $scope.showLoading(2000);
                        for (var i = 0; i < component.playlists.length; i++) {
                            var playlist = component.playlists[i];
                            if (anySelected) {
                                if ($scope.containsPlaylist(playlist, component)) {
                                    $scope.model.musicController.deselectPlaylist(component.id, playlist.id);
                                }
                            } else {
                                if (evaluateCrons(playlist.crons)) {
                                    $scope.model.musicController.selectPlaylist(component.id, playlist.id);
                                }
                            }
                        }
                    }
                }

                $scope.getPlaylistClass = function (playlist, component) {
                    var anySelected = $scope.isAnyPlaylistsSelected(component);
                    var playlistClass = '';
                    if ($scope.containsPlaylist(playlist, component)) {
                        playlistClass = 'adstter-active';
                    }
                    if (!anySelected && evaluateCrons(playlist.crons)) {
                        playlistClass = 'adstter-active';
                    }
                    return playlistClass;

                }

                $scope.isAnyPlaylistsSelected = function (component) {
                    if (component.playlists) {
                        for (var i = 0; i < component.playlists.length; i++) {
                            var playlist = component.playlists[i];
                            if ($scope.containsPlaylist(playlist, component)) {
                                return true;
                            }
                        }
                    }
                    return false;
                }

                $scope.togglePause = function () {
                    $scope.showLoading();
                    if (musicController.onPause === 'false') {
                        musicController.pause($scope.model.config.pauseTime);
                    } else {
                        musicController.unpause();
                    }
                };



                $scope.showLoading = function (time) {
                    time = time ? time : 5000;
                    $ionicLoading.show({
                        template: 'Loading...',
                        duration: time
                    }).then(function () {
                    });
                };

                $scope.restartMusic = function () {
                    if (!$scope.model.batchController.socket.connected) {
                        return;
                    }
                    $scope.showLoading();
                    $scope.model.batchController.restartMusic();
                };

                $scope.restartSystem = function () {
                    if (!$scope.model.batchController.socket.connected) {
                        return;
                    }
                    $scope.showLoading();
                    $scope.model.batchController.restartSystem();
                };


                $scope.searchYoutube = function (retry = 0) {
                    var ApiKey = apiKeys[retry];
                    var params = {key: ApiKey, q: $scope.model.config.youtubeSearch};
                    if ($scope.live) {
                        params.eventType = 'live';
                    } else {
                        params.videoDefinition = 'high';
                    }
                    var result = $resource('https://www.googleapis.com/youtube/v3/search',
                            {
                                q: '@query', safeSearch: '@safeSearch', part: 'snippet',
                                type: 'video', videoSyndicated: '@videoSyndicated', key: '@key',
                                maxResults: 15,
                                videoDefinition: '@videoDefinition', videoEmbeddable: 'true', eventType: '@eventType'
                            }).get(params, function () {
                        $scope.model.youtubeResults = result.items;
                    }, function(){
                        if(retry < 1) {
                            $scope.searchYoutube(1);
                        }
                    });
                };



                var selectYoutubeVideo = function (youtubeVideo) {
                    $scope.youtubeVideo = youtubeVideo;
                    $scope.lastSelectedVideo = youtubeVideo;
                    document.getElementById('songVideo').src = 'https://www.youtube.com/embed/' + youtubeVideo.id.videoId + '?autoplay=1';
                }

                $scope.selectYoutubeVideo = function (youtubeVideo) {
                    if ($scope.model.musicController.hasForcedAd) {
                        var template = 'Ya existe un video en cola, ¿Deseas remplazarlo?';
                        if ($scope.lastSelectedVideo) {
                            template = 'Ya fue seleccionado el video: <br/><img src="' + youtubeVideo.snippet.thumbnails.default.url + '/> <br/>' + youtubeVideo.snippet.title + ' <br/>¿Deseas remplazarlo?';
                        }
                        var confirmPopup = $ionicPopup.confirm({
                            title: 'Video anterior',
                            template: template
                        });

                        confirmPopup.then(function (res) {
                            if (res) {
                                selectYoutubeVideo(youtubeVideo);
                            }
                        });
                    } else {
                        selectYoutubeVideo(youtubeVideo);
                    }
                };

                $scope.sendYoutubeVideo = function () {
                    var link = "https://ponmusica.com/youtube/" + $scope.youtubeVideo.id.videoId + "/";
                    var title = $scope.youtubeVideo.snippet.title;
                    var useAdstterVideo = $scope.model.useAdstterVideo;
                    if ($scope.live) {
                        link += "?isLive=true";
                        $scope.model.musicController.pause($scope.model.config.pauseTime);
                        $scope.model.batchController.openBrowser(link);
                    } else {

                        $scope.model.musicController.changeToYoutubeVideo($scope.model.config.playerCode, link, title, useAdstterVideo, function (arg1) {
                            $scope.model.refresh();
                            if (arg1.code) {
                                var alertPopup = $ionicPopup.alert({
                                    title: 'Notificación',
                                    template: arg1.message
                                });
                                alertPopup.then(function (res) {
                                });
                            }
                        });
                    }
                    document.getElementById('songVideo').src = "about:blank";
                    $scope.youtubeVideo = null;
                    $scope.youtubeModal.hide();

                };

                $scope.goToPonmusica = function () {
                    $cordovaInAppBrowser.open('https://ponmusica.com/location/' + $scope.model.config.ponmusicaCode + '/playlist', '_system', options);
                };

                $scope.toggleVolume = function () {
                    if (batchController.getLastBatch() === 'volume-tv.bat') {
                        batchController.mute();
                    } else {
                        batchController.volume();
                    }
                };

                $scope.toggleOffline = function () {
                    if (!notConnectedMessage()) {
                        return;
                    }
                    $scope.showLoading();
                    if (musicController.isOffline()) {
                        musicController.goOnline();
                    } else {
                        musicController.goOffline();
                    }
                }

                $scope.isOnSecondPlane = function () {
                    return $scope.model.batchController.getLastBatch().endsWith('start-cam.bat') ||
                            $scope.model.batchController.getLastBatch().indexOf('change-channel.bat') >= 0 ||
                            $scope.model.batchController.getLastBatch().endsWith('start-cable.bat');
                };

                $scope.viewMusic = function () {
                    if (!notConnectedMessage() || (!$scope.model.musicController.getOnPause() && !$scope.isOnSecondPlane())) {
                        return;
                    }
                    musicController.saveState('fullscreen', $scope.model.refresh);
                    batchController.closeMobdro();
                    batchController.closeBrowser();
                    musicController.unpause();
                    $timeout(function () {
                        batchController.stopTv();
                    }, 5000);
                    $scope.showLoading();
                };

                $scope.delayPause = function () {
                    $timeout(function () {
                        musicController.pause($scope.model.config.pauseTime);
                    }, 5000);
                };

                $scope.delayUnpause = function () {
                    $timeout(function () {
                        musicController.unpause();
                    }, 5000);
                }

                $scope.viewTv = function () {
                    if (!notConnectedMessage()) {
                        return;
                    }
                    $scope.secondPlaneModal.hide();
                    batchController.closeMobdro();
                    batchController.closeBrowser();
                    if (musicController.isFullscreen()) {
                        $scope.delayPause();
                    } else {
                        batchController.mute();
                    }
                    batchController.volume();
                    $scope.showLoading();
                };

                $scope.openMobdro = function () {
                    musicController.pause($scope.model.config.pauseTime);
                    batchController.openMobdro();
                    batchController.closeBrowser();
                    var scheme = 'com.necta.wifimousefree';
                    navigator.startApp.start(scheme, function (message) {  /* success */
                        console.log(message); // => OK
                    },
                            function (error) { /* error */
                                console.log(error);
                            });
                };

                $scope.viewExternalSourceWithMusic = function () {
                    if (!notConnectedMessage()) {
                        return;
                    }
                    batchController.mute();
                    $scope.secondPlaneModal.hide();
                    musicController.saveState('normalscreen', $scope.model.refresh);
                    batchController.closeMobdro();
                    batchController.closeBrowser();
                    $scope.showLoading();
                };

                $scope.viewExternalSource = function () {
                    if (!notConnectedMessage()) {
                        return;
                    }
                    batchController.closeMobdro();
                    batchController.closeBrowser();
                    $scope.secondPlaneModal.hide();
                    batchController.volume();
                    $scope.delayPause();
                    $scope.showLoading();
                };

                $scope.viewSecondCable = function () {
                    if (!notConnectedMessage()) {
                        return;
                    }
                    $scope.viewExternalSourceWithMusic();
                    batchController.viewCable();
                };

                $scope.viewSecondCam = function () {
                    if (!notConnectedMessage()) {
                        return;
                    }
                    $scope.viewExternalSourceWithMusic();
                    batchController.viewCam();
                };

                $scope.viewCable = function () {
                    if (!notConnectedMessage()) {
                        return;
                    }
                    if (musicController.isFullscreen()) {
                        $scope.viewExternalSource();
                    } else {
                        $scope.viewExternalSourceWithMusic();
                    }
                    batchController.viewCable();
                };

                $scope.viewCam = function () {
                    if (!notConnectedMessage()) {
                        return;
                    }
                    if (musicController.isFullscreen()) {
                        $scope.viewExternalSource();
                    } else {
                        $scope.viewExternalSourceWithMusic();
                    }
                    batchController.viewCam();
                };

                $scope.saveVolume = function () {
                    if (!notConnectedMessage()) {
                        return;
                    }
                    batchController.changeVolume($scope.model.config.volume, $scope.model.refresh);
                };

                $scope.showBirthday = function () {
                    if (!notConnectedMessage()) {
                        return;
                    }
                    musicController.changeAd(1688, '4954', $scope.model.refresh);
                    batchController.mute();
                    $scope.showLoading();
                };

                $scope.showAd = function (deviceCode, adCode) {
                    if (!notConnectedMessage()) {
                        return;
                    }
                    musicController.unpause();
                    batchController.closeBrowser();
                    musicController.saveState('fullscreen', $scope.model.refresh);
                    musicController.changeAd(deviceCode, adCode, $scope.model.refresh);
                    batchController.mute();
                    $scope.showLoading();
                };

                $scope.saveConfig = function (ipAddress) {
                    saveIpAddress(ipAddress);
                    $state.reload();
                };

                $scope.viewChannels = function () {
                    if (!notConnectedMessage()) {
                        return;
                    }
                    $scope.secondPlaneModal.hide();
                    $scope.modal.show();
                };

                $scope.viewAdvancedConfig = function () {
                    $scope.model.adDevice = $scope.model.config.playerCode;
                    $scope.passwordModal.show();
                };

                $scope.acceptPassword = function () {
                    if ($scope.model.password === '870507') {
                        $scope.model.password = '';
                        $scope.passwordModal.hide();
                        $scope.advancedConfigurationModal.show();
                    } else {
                        $scope.showLoading();
                    }
                };

                $scope.closePassword = function () {
                    $scope.passwordModal.hide();
                }

                $scope.startSecondPlaneMusic = function () {
                    if (!notConnectedMessage()) {
                        return;
                    }
                    $timeout(function () {
                        batchController.mute();
                        musicController.saveState('normalscreen', $scope.model.refresh);
                    }, 3000);
                    musicController.unpause();
                    $scope.showLoading();
                };

                $scope.viewYoutube = function (live) {
                    if (!notConnectedMessage()) {
                        return;
                    }
                    $scope.live = live;
                    $scope.youtubeVideo = null;
                    $scope.model.youtubeResults = {};
                    $scope.model.config.youtubeSearch = "";
                    $scope.youtubeModal.show();
                };

                $scope.viewVolume = function () {
                    if (!notConnectedMessage()) {
                        return;
                    }
                    $scope.volumeModal.show();
                };

                $scope.viewSecondPlaneDialog = function () {
                    if (!notConnectedMessage()) {
                        return;
                    }
                    if ($scope.model.musicController.isFullscreen()) {
                        $scope.secondPlaneModal.show();
                    } else {
                        musicController.saveState('fullscreen', $scope.model.refresh);
                        musicController.pause($scope.model.config.pauseTime);
                        batchController.volume();
                    }
                };

                $scope.nextAd = function () {
                    if (!notConnectedMessage()) {
                        return;
                    }
                    if (musicController.isFullscreen() && $scope.model.musicController.voteQueue) {
                        var confirmPopup = $ionicPopup.confirm({
                            title: 'Videos en cola de votación',
                            template: 'La canción actual fue votada ¿Estas seguro que deseas saltarla?'
                        });
                        confirmPopup.then(function (res) {
                            if (res) {
                                $scope.showLoading();
                                $scope.model.musicController.nextAd();
                            }
                        });
                    } else {
                        $scope.showLoading();
                        $scope.model.musicController.nextAd();
                    }
                };

                $scope.searchConnection = function () {
                    socket.disconnect();
                    $scope.searchingConnectionModal.show();
                    if ($scope.model.batchController) {
                        $scope.model.batchController.socket.disconnect();
                    }
                    if ($scope.model.musicController) {
                        $scope.model.musicController.socket.disconnect();
                    }
                    searchConnection($scope.model.config.playerAddress);
                };

                $scope.changeChannel = function (channel) {
                    if (!notConnectedMessage()) {
                        return;
                    }
                    $scope.showLoading();
                    $scope.secondPlaneModal.hide();
                    batchController.closeMobdro();
                    if (musicController.isFullscreen()) {
                        musicController.pause($scope.model.config.pauseTime);
                    } else {
                        batchController.mute();
                    }
                    $scope.model.actualChannel = channel;
                    batchController.changeChannel(channel, $scope.model.refresh);
                    $scope.modal.hide();
                    $ionicScrollDelegate.scrollBottom(true);
                };

                $scope.addAd = function () {
                    var ad = {};
                    ad.name = $scope.model.adName;
                    ad.code = $scope.model.adCode;
                    ad.device = $scope.model.adDevice;
                    $scope.model.config.ads.push(ad);
                    $scope.model.adName = null;
                    $scope.model.adCode = null;
                    $scope.model.adDevice = $scope.model.config.playerCode;
                    $scope.model.selectedAd = null;
                };

                $scope.closeConfiguration = function () {
                    saveConfig();
                    $scope.advancedConfigurationModal.hide();
                };

                $scope.saveAd = function () {
                    var ad = $scope.model.selectedAd;
                    ad.name = $scope.model.adName;
                    ad.code = $scope.model.adCode;
                    ad.device = $scope.model.adDevice;
                    $scope.model.adName = null;
                    $scope.model.adCode = null;
                    $scope.model.adDevice = $scope.model.config.playerCode;
                    $scope.model.selectedAd = null;
                };

                $scope.model.getPauseRemainingSeconds = function () {
                    if (!$scope.model.musicController.pausedDateTime) {
                        return "";
                    }
                    var executedTime = $scope.model.musicController.pausedDateTime;
                    var nowTime = new Date().getTime();
                    var difference = nowTime === executedTime ? 0 : (nowTime - executedTime) / 1000;
                    if (difference > $scope.model.config.pauseTime) {
                        return 0;
                    }
                    return ($scope.model.config.pauseTime - difference);
                };

                $scope.model.formatDateToHhMmSs = function (seconds) {
                    var date = new Date(null);
                    date.setSeconds(seconds); // specify value for SECONDS here
                    var result = date.toISOString().substr(11, 8);
                    return result;
                }

                $scope.model.getPauseRemainingPercentage = function () {
                    return ($scope.model.getPauseRemainingSeconds() * 100) / $scope.model.config.pauseTime;
                };


                $scope.model.getPauseProgressStyle = function () {
                    return {
                        'width': $scope.model.getPauseRemainingPercentage() + "%",
                        'background-color': '#FF8200',
                        'height': '10px',
                        'line-height': '10px'
                    };
                }

                $scope.removeAd = function () {
                    var index = $scope.model.config.ads.indexOf($scope.model.selectedAd);
                    if (index > -1) {
                        $scope.model.config.ads.splice(index, 1);
                    }
                    $scope.model.adName = null;
                    $scope.model.adCode = null;
                    $scope.model.adDevice = $scope.model.config.playerCode;
                    $scope.model.selectedAd = null;
                };

                $scope.selectAd = function (ad) {
                    $scope.model.selectedAd = ad;
                    $scope.model.adName = ad.name;
                    $scope.model.adCode = ad.code;
                    $scope.model.adDevice = ad.device;
                };

                function callReloadScreenshot() {
                    $scope.model.reloadScreenshot();
                    $timeout(function () {
                        callReloadScreenshot();
                    }, 1000);
                }

                function callReload() {
                    $scope.model.reload();
                    $timeout(function () {
                        callReload();
                    }, 5000);
                }
                ;

                function isConnected() {
                    return musicController.socket.connected && batchController.socket.connected;
                }

                function notConnectedMessage() {
                    var result = isConnected();
                    if (!result) {
                        var alertPopup = $ionicPopup.alert({
                            title: 'Sin conexión',
                            template: 'No hay conexión, verifique conexión de red'
                        });
                        alertPopup.then(function (res) {
                        });
                    }
                    return result;
                }
                ;

                function refreshConnection() {
                    $scope.model.musicController.connected = musicController.socket.connected;
                    $scope.model.batchController.connected = batchController.socket.connected;
                    $timeout(function () {
                        refreshConnection();
                    }, 1000);
                }

                function connect(address, successCallback, errorCallback, timeout) {
                    if (!timeout) {
                        timeout = 5000;
                    }
                    var errorCalled = false;
                    socket = io('http://' + address + ':7181', {timeout: timeout});
                    socket.on('connect_error', function () {
                        if (!errorCalled) {
                            errorCalled = true;
                            errorCallback(socket);
                        }
                    });
                    socket.on('reconnect_attempt', function () {

                    });
                    socket.on('connect', function () {
                        successCallback();
                        $scope.model.musicController = musicController = new ClientConnection($scope.model.config.playerAddress, $scope.model.config.playerCode, $scope.model.config.playerCode, $scope.model.reload);
                        $scope.model.batchController = batchController = new BatchExecuterConnection($scope.model.config.playerAddress, '7181', $scope.model.reload);
                        callReload();
                        if ($scope.model.config.allowChannelChange) {
                            callReloadScreenshot();
                        }
                        refreshConnection();
                    });
                }

                function searchConnection(address) {
                    var bytes = address.split(".");
                    var next = Number(bytes[3]) + 1;
                    if (next > 254) {
                        next = 0;
                    }
                    var newAddress = bytes[0] + "." + bytes[1] + "." + bytes[2] + "." + next;
                    $scope.model.searchingAddress = newAddress;
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                    connect(newAddress, function () {
                        $scope.model.config.playerAddress = newAddress;
                        $scope.searchingConnectionModal.hide();
                        saveConfig();
                    }, function (socket) {
                        if (!$scope.model.batchController || !$scope.model.batchController.socket.connected) {
                            socket.disconnect();
                            searchConnection(newAddress);
                        }
                    }, 1000)
                }

                function reconnect() {
                    if ($scope.model.musicController && $scope.model.batchController) {
                        $scope.model.musicController.socket.disconnect();
                        $scope.model.batchController.socket.disconnect();
                        $scope.model.batchController = null;
                        $scope.model.musicController = null;
                    }
                    connect($scope.model.config.playerAddress, function () { }, function () { });
                }

                function init() {
                    var deviceFound = false;
                    var retriesAttempts = 0;

                    if ($scope.model.config.playerAddress) {
                        connect($scope.model.config.playerAddress, function () { }, function () { });
                    }

                }

                init();

            }]);
