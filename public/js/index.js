// Google Map x PostGis x Express x AngularJs
// index.js

(function(){

    // AngularJS module
    var myModule = angular.module('myModule', []);

    // GoogleMap Object
    var map;

    // Controller
    myModule.controller('GisController', function($scope, $http) {
        $http.get('/areas').success(function(data) {
            $scope.areas = data;
        });

        initializeMap();
    });


    /**
     * GoogleMapの初期化
     */
    function initializeMap(){
        // option
        var options = {
          center: new google.maps.LatLng(34.6943, 135.1907),
          zoom: 12,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        map = new google.maps.Map(document.getElementById("map_canvas"), options);
    }

})();
