// Google Map x PostGis x Express x AngularJs
// index.js
(function(){

    // AngularJS module
    var myModule = angular.module('myModule', []);

    // GoogleMap Object
    var map;

    // Controller
    myModule.controller('GisController', function($scope, $http) {

        // 選択中のJIS5
        $scope.selectedCode = '';

        // 選択中の項目かどうかの判定
        $scope.isSelected = function(code){
            return $scope.selectedCode == code;
        }

        // リストクリック時の処理
        $scope.clicker = function(code){
            // 選択アイテムのJIS5を保持
            $scope.selectedCode = code;

            // 市区町村情報取得
            // GET: /areas/:code
            var url = '/areas/' + code;
            $http.get(url).success(function(data){

                // map表示中の要素を削除
                map.data.forEach(function(feature){
                    map.data.remove(feature);
                });

                // 選択された市区町村の中心点を取得
                // ST_Centroid で返される Point の coordinates の座標が google.maps.LatLng の
                // コンストラクタに渡す順番と逆転しているので注意。
                var center = JSON.parse(data.center);
                var centerLatlang = new google.maps.LatLng(
                    floor(center.coordinates[1], 4),
                    floor(center.coordinates[0], 4));

                // GoogleMapに表示するGeoJSON(FeatureCollection)の定義。
                // http://geojson.org/
                var geojson = {
                    type: 'FeatureCollection',
                    features: []
                };

                // 市区町村のGeoJSON
                // ST_AsGeoJSON は GoogleMapsAPI の addGeoJsonに必要な Feature の
                // geometry 部分のみになっているので、不足部分を補う
                var featureArea = {
                    type: 'Feature',
                    geometry: JSON.parse(data.geojson),
                    properties: {
                        type: 'area',
                        code: data.code,
                        name: data.city
                    }
                };

                // FeatureCollectionに市区町村を追加
                geojson.features.push(featureArea);

                // 学校情報の取得
                // GET: /areas/:code/schools
                $http.get(url + '/schools').success(function(schools){

                    // 学校情報をFeatureCollectionにセット
                    angular.forEach(schools, function(school){

                        // 学校のGeoJSON
                        var featureSchool = {
                            type: 'Feature',
                            geometry: JSON.parse(school.point),
                            properties: {
                                type: 'school',
                                name: school.school,
                                address: school.address
                            }
                        };

                        // FeatureCollectionに学校を追加
                        geojson.features.push(featureSchool);
                    });

                    // 校区情報の取得
                    // GET: /areas/:code/districts
                    $http.get(url + '/districts').success(function(districts){

                        // 校区情報をFeatureCollectionにセット
                        angular.forEach(districts, function(district){

                            // 校区のGeoJSON
                            var featureDistrict = {
                                type: 'Feature',
                                geometry: JSON.parse(district.district),
                                properties: {
                                    type: 'district',
                                    name: district.school
                                }
                            };

                            // FeatureCollectionに校区を追加
                            geojson.features.push(featureDistrict);
                        });

                        // GeoJsonをセット
                        map.data.addGeoJson(geojson);

                        // Style設定
                        // https://developers.google.com/maps/documentation/javascript/datalayer?hl=ja#style_geojson_data
                        map.data.setStyle(function(feature){
                            if(feature.getProperty('type') == 'area'){

                                // areaはPolygon
                                return {
                                    clickable: false,
                                    strokeWeight: 2,
                                    strokeColor: 'blue',
                                    zIndex: 4,
                                    fillColor: '#45A1CF',
                                    fillOpacity: 0.4,
                                    visible: true
                                };

                            }else if(feature.getProperty('type') == 'school'){

                                // schoolはPoint
                                return {
                                    icon: {
                                        path: google.maps.SymbolPath.CIRCLE,
                                        scale: 5,
                                        strokeWeight: 0,
                                        fillColor: 'red',
                                        fillOpacity: 0.8
                                    },
                                    zIndex: 12,
                                    visible: true
                                };

                            }else if(feature.getProperty('type') == 'district'){

                                // districtはPolygon
                                return {
                                    clickable: false,
                                    strokeWeight: 1,
                                    strokeColor: 'green',
                                    zIndex: 8,
                                    fillColor: '#3eba2b',
                                    fillOpacity: 0.4,
                                    visible: true
                                };

                            }
                        });

                        // 中心点を移動
                        map.setCenter(centerLatlang);
                    });
                });
            });
        };

        // 市区町村リスト取得処理
        $http.get('/areas').success(function(data){
            $scope.areas = data;
        });

        // GoogleMapの初期化
        initializeMap();
    });


    /**
     * GoogleMapの初期化
     */
    function initializeMap(){
        // option
        var options = {
            // 神戸市
            center: new google.maps.LatLng(34.6943, 135.1907),
            zoom: 13,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        // map生成
        map = new google.maps.Map(document.getElementById("map_canvas"), options);

        // 吹き出し保持用のプロパティを定義
        map.infoWindow = false;

        // クリック時のイベント設定
        // https://developers.google.com/maps/documentation/javascript/datalayer?hl=ja#add_event_handlers
        map.data.addListener('click', function(event){

            if(event.feature){

                // 小学校をクリックされた場合
                if(event.feature.getProperty('type') == 'school'){

                    // 表示中の吹き出しがある場合は閉じる
                    if(map.infoWindow){
                        map.infoWindow.close();
                        map.infoWindow = false;
                    }

                    // 吹き出しを表示する
                    var point = event.feature.getGeometry().get();
                    var content = '<strong>' +
                        event.feature.getProperty('name') + 
                        '</strong><br>' +
                        event.feature.getProperty('address');

                    map.infoWindow = new google.maps.InfoWindow({
                        content: content,
                        position: point,
                        zIndex: 20
                    });

                    map.infoWindow.open(map);
                }
            }
        });
    }

    /**
     * 小数点桁数切り捨て
     * @param Number num 切り捨て対象の数値
     * @param Number digit 小数点以下桁数
     */
    function floor(num, digit){
        var a = num * Math.pow(10, digit);
        a = Math.floor(a);
        return a / Math.pow(10, digit);
    }

})();
