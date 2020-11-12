<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="initial-scale=1, maximum-scale=1, user-scalable=no, width=device-width">
    <title></title>

    <link href="lib/ionic/css/ionic.css" rel="stylesheet">
    <link href="css/style.css" rel="stylesheet">

    <!-- IF using Sass (run gulp sass first), then uncomment below and remove the CSS includes above
    <link href="css/ionic.app.css" rel="stylesheet">
    -->

    <!-- ionic/angularjs js -->
    <script src="lib/ionic/js/ionic.bundle.js?v=2020110800"></script>

    <!-- cordova script (this will be a 404 during development) -->
    <script src="lib/ngCordova/dist/ng-cordova.min.js?v=2020110800"></script>
    <script src="cordova.js?v=2020110800"></script>
    <!-- Other Libraries-->
    <script src="lib/angular-sanitize/angular-sanitize.min.js?v=2020110800"></script>
    <script src="lib/angular/angular-resource.min.js?v=2020110800"></script>
    
    <script src="js/socket.io/socket.io.js?v=2020110800"></script>
    <script src="lib/angular-socket-io/socket.js?v=2020110800"></script>
      
    <!-- main -->
    <script src="templates/main.js?v=2020110800"></script>
    <script src="templates/main-controller.js?v=2020110800"></script>
    <!-- tv 1 -->
    <script src="templates/live-tv1/live-tv1-controller.js?v=2020110800"></script>
    <script src="templates/live-tv1/live-tv1.js?v=2020110800"></script>
    <!-- tv 2 -->
    <script src="templates/live-tv2/live-tv2-controller.js?v=2020110800"></script>
    <script src="templates/live-tv2/live-tv2.js?v=2020110800"></script>
    <!-- Menu board -->
    <script src="templates/menu-board/menu-board-controller.js?v=2020110800"></script>
    <script src="templates/menu-board/menu-board.js?v=2020110800"></script>  
    <!-- Services -->
    <script src="js/client-connection.js?v=2020110800"></script>
    <script src="js/batch-executer-connection.js?v=2020110800"></script>
    <script src="js/service.js?v=2020110800"></script>
    <script src="js/app.js?v=2020110800"></script>
  </head>
  <body ng-app="app-controller" class="platform-browser platform-cordova platform-webview">
      <ion-nav-view></ion-nav-view>
  </body>
</html>
