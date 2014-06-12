
データ取り込み
--------------

* SQLを生成する

```
shp2pgsql -s 4612 -D -i -I -W cp932 D:\dev\gis\gis_data\A27-10_27_GML\A27-10_27-g_PublicElementarySchool.shp A27-10_27-g_PublicElementarySchool > A27-10_27-g_PublicElementarySchool.sql
shp2pgsql -s 4612 -D -i -I -W cp932 D:\dev\gis\gis_data\A27-10_27_GML\A27-10_27-g_SchoolDistrict.shp A27-10_27-g_SchoolDistrict > A27-10_27-g_SchoolDistrict.sql
shp2pgsql -s 4612 -D -i -I -W cp932 D:\dev\gis\gis_data\A27-10_28_GML\A27-10_28-g_PublicElementarySchool.shp A27-10_28-g_PublicElementarySchool > A27-10_28-g_PublicElementarySchool.sql
shp2pgsql -s 4612 -D -i -I -W cp932 D:\dev\gis\gis_data\A27-10_28_GML\A27-10_28-g_SchoolDistrict.shp A27-10_28-g_SchoolDistrict > A27-10_28-g_SchoolDistrict.sql
shp2pgsql -s 4612 -D -i -I -W cp932 D:\dev\gis\gis_data\N03-130401_27_GML\N03-13_27_130401.shp N03-13_27_130401 > N03-13_27_130401.sql
shp2pgsql -s 4612 -D -i -I -W cp932 D:\dev\gis\gis_data\N03-130401_28_GML\N03-13_28_130401.shp N03-13_28_130401 > N03-13_28_130401.sql
```

* SQLを取り込む

```
psql -U postgres -d postgis_21_sample -f A27-10_27-g_PublicElementarySchool.sql
psql -U postgres -d postgis_21_sample -f A27-10_27-g_SchoolDistrict.sql
psql -U postgres -d postgis_21_sample -f A27-10_28-g_PublicElementarySchool.sql
psql -U postgres -d postgis_21_sample -f A27-10_28-g_SchoolDistrict.sql
psql -U postgres -d postgis_21_sample -f N03-13_27_130401.sql
psql -U postgres -d postgis_21_sample -f N03-13_28_130401.sql
```

テーブル名に`-`はマズイっぽい...しくった。


テーブル定義
---------------

### a27-10_xx-g_publicelementaryschool

小学校の位置情報らしい。
試しにデータ取得

```sql
select *
from "a27-10_27-g_publicelementaryschool"
order by a27_001
offset 0 limit 3;
```


| gid  | a27_001 | a27_002 | a27_003   | a27_004                  | geom |
|------|---------|---------|-----------|--------------------------|-|
|1014  |27102    | 大阪市立 | 都島小学校 | 大阪市都島区都島本通3-10-3 | |
|1016  |27102    | 大阪市立 | 大東小学校 | 大阪市都島区毛馬町2-11-111 | |
|1015  |27102    | 大阪市立 | 中野小学校 | 大阪市都島区中野町3-10-5   | |

* gid: key
* a27_001: JIS5
* a27_002: 設置主体
* a27_003: 学校名
* a27_004: 住所
* geom: Point


### a27-10_xx-g_schooldistrict

残念ながら`gid`は`g_publicelementaryschool`のものとは別物。

| gid | a27_005 | a27_006 | a27_007 | a27_008 | geom |
|-----|---------|---------|---------|---------|------|
| 1 | 27141 | 堺市立 | 三宝小学校 | 堺市堺区三宝町5丁286 | |
| 2 | 27141 | 堺市立 | 市小学校 | 堺市堺区市之町西3丁1-14 | |
| 3 | 27141 | 堺市立 | 英彰小学校 | 堺市堺区寺地町西4丁1-1 | |

* gid: key
* a27_005: JIS5
* a27_006: 設置主体
* a27_007: 学校名
* a27_008: 住所
* geom: MultiPolygon


### "n03-13_xx_130401"

行政区域データ

| gid | n03_001 | n03_002 | n03_003 | n03_004 | n03_007 | geom |
|-----|---------|---------|---------|---------|---------|------|
| 1 | 大阪府 | | | 豊能郡 | 能勢町 | 27322 | |
| 2 | 大阪府 | | |        | 高槻市 | 27207 | |
| 3 | 大阪府 | | | 豊能郡 | 豊能町 | 27321 | |



