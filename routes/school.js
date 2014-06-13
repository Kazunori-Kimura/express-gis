// routes/school.js
var pg = require('pg'),
    here = require('here').here;

// load environment data
var env = require('../env.json');
var cs = env.connection_string;

module.exports = {
    /**
     * 指定された市区町村にある小学校を取得
     */
    find: function(req, res){
        console.log('school#find( code= %s )', req.params.code);

        var sql = here(/*
select
    coalesce(a27_002, '') || ' ' || coalesce(a27_003, '') as school
    , a27_004 as address
    , ST_AsGeoJSON(geom) as point 
from
    "a27-10_27-g_publicelementaryschool" 
where
    a27_001 = $1 
UNION ALL 
select
    coalesce(a27_002, '') || ' ' || coalesce(a27_003, '') as school
    , a27_004 as address
    , ST_AsGeoJSON(geom) as point 
from
    "a27-10_28-g_publicelementaryschool" 
where
    a27_001 = $1 
order by
    school
*/).valueOf();

        // postgres接続
        pg.connect(cs, function(err, client){
            if(err){
                // connection error
            }else{
                // sql実行
                client.query(sql, [req.params.code], function(err, result){
                    console.log('row count= %d', result.rows.length);

                    // 接続終了
                    client.end();

                    res.send(result.rows);
                });
            }
        });
    }
};
