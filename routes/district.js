// routes/district.js
var pg = require('pg'),
    here = require('here').here;

// load environment data
var env = require('../env.json');
var cs = env.connection_string;

module.exports = {
    find: function(req, res){
        console.log('district#find( code= %s )', req.params.code);

        var sql = here(/*
select
    coalesce(a27_006, '') || ' ' || coalesce(a27_007, '') as school
    , ST_AsGeoJSON(ST_Union(geom)) as district 
from
    "a27-10_27-g_schooldistrict" 
where
    a27_005 = $1 
group by
    a27_006
    , a27_007 
UNION ALL 
select
    coalesce(a27_006, '') || ' ' || coalesce(a27_007, '') as school
    , ST_AsGeoJSON(ST_Union(geom)) as district 
from
    "a27-10_28-g_schooldistrict" 
where
    a27_005 = $1 
group by
    a27_006
    , a27_007
*/).valueOf();

        // postgres接続
        pg.connect(cs, function(err, client){
            if(err){
                // connection error
            }else{
                // sql実行
                client.query(sql, [req.params.code], function(err, result){
                    console.log('row count= %d', result.rows.length);

                    client.end();

                    res.send(result.rows);
                });
            }
        });
    }
};
