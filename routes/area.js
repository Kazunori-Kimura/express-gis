// routes/area.js
var pg = require('pg');
var here = require('here').here;

var cs = 'tcp://postgres:1qaz2wsx@localhost:5432/postgis_21_sample';

module.exports = {
    // findAll
    findAll: function(req, res){
        // 市区町村を取得
        var sql = here(/*
select
    n03_007 as code,
    n03_001 || coalesce(n03_003, '') || coalesce(n03_004, '') as city
from "n03-13_27_130401"
UNION
select
    n03_007 as code,
    n03_001 || coalesce(n03_003, '') || coalesce(n03_004, '') as city
from "n03-13_28_130401"
order by
    code
*/).valueOf();

        // postgres接続
        pg.connect(cs, function(err, client){
            if(err){
                // connection error
            }else{
                // sql実行
                client.query(sql, function(err, result){
                    console.log('row count= %d', result.rows.length);

                    client.end();

                    res.send(result.rows);
                });
            }
        });
    },

    find: function(req, res){
        console.log('area#find( code= %s )', req.params.code);

        // 市区町村を取得
        var sqlCity = here(/*
select
    n03_007 as code,
    n03_001 || coalesce(n03_003, '') || coalesce(n03_004, '') as city
from "n03-13_27_130401"
where
    n03_007 = $1
UNION
select
    n03_007 as code,
    n03_001 || coalesce(n03_003, '') || coalesce(n03_004, '') as city
from "n03-13_28_130401"
where
    n03_007 = $1
limit 1
*/).valueOf();

        // polygonを取得
        var sqlPolygon = here(/*
select
    n03_007 as code
    , ST_AsGeoJSON(ST_Centroid(ST_Union(geom))) as center
    , ST_AsGeoJSON(ST_Union(geom)) as geojson
from "n03-13_27_130401"
where n03_007 = $1
group by n03_007
union all
select
    n03_007 as code
    , ST_AsGeoJSON(ST_Centroid(ST_Union(geom))) as center
    , ST_AsGeoJSON(ST_Union(geom)) as geojson
from "n03-13_28_130401"
where n03_007 = $1
group by n03_007
*/).valueOf();

        var ret = {};

        // postgres接続
        pg.connect(cs, function(err, client){
            if(err){
                // connection error
            }

            // 市区町村取得
            client.query(sqlCity, [req.params.code], function(err, result){
                if(err){
                    // query error
                }

                if(result.rows.length == 0){
                    // データなし
                }

                // コード、市区町村名保持
                ret.code = result.rows[0].code;
                ret.city = result.rows[0].city;

                // polygon取得
                client.query(sqlPolygon, [req.params.code], function(err, result){
                    if(err){
                        // query error
                    }

                    if(result.rows.length == 0){
                        // データなし
                    }

                    // ポリゴンデータ
                    ret.center = result.rows[0].center;
                    ret.geojson = result.rows[0].geojson;

                    client.end();

                    // レスポンスを返す
                    res.send(ret);
                });
            });
        });
    }
};
