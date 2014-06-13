express-gis
=============

Google Map x PostGIS x Express x AngularJs

国土交通省の [国土数値情報　ダウンロードサービス](http://nlftp.mlit.go.jp/ksj/) からダウンロードしたデータを
Google Map上に重ねあわせて表示するWebアプリケーションのサンプルです。

空間データの管理に [PostGIS](http://postgis.net/) を使用しています。


アプリケーションの概要
-------

* 行政区域のリストから市区町村を選択すると、その市区町村にある小学校とその小学校区がGoogle Map上に表示されます。
* 小学校をクリックすると、その小学校名と住所が吹き出しで表示されます。


主要なモジュールのバージョン
-------

* [Google Maps API](https://developers.google.com/maps/documentation/javascript/?hl=ja) v3
* [PostgreSQL](http://www.postgresql.org/) v9.3
* [PostGIS](http://postgis.net/) v2.1.3
* [Express](http://expressjs.com/) v4.4.2
* [AngularJS](https://angularjs.org/) v1.2.17


注意事項
-----------

* `PostGIS`を使用したWebアプリケーション開発についての解説用に作成されたアプリケーションのため、セキュリティやエラーハンドリングについては全く考慮されていません。あらかじめご了承ください。


セットアップ手順
--------------

1. PostgreSQLをインストール
2. PostGISをインストール
3. PostgreSQLのbinにパスを通す (`psql`がコマンドラインから実行できればOK)

* 今回のアプリケーションでは User: `postgres`、 Database: `postgis_21_sample` を使用します。
  - DatabaseはPostGisのインストール過程で作成されます。


データ取り込み手順
--------------

* [国土数値情報　ダウンロードサービス](http://nlftp.mlit.go.jp/ksj/)から大阪府、兵庫県の行政区域データおよび小学校区データをダウンロードします。  
データ形式は`JPGIS2.1`を選択します。
  - A27-10_27_GML.zip
  - A27-10_28_GML.zip
  - N03-130401_27_GML.zip
  - N03-130401_28_GML.zip

* zip形式のため、適当なフォルダに解凍します。

* `shp2pgsql`を使用して、shpファイルからSQLを生成します。

```
shp2pgsql -s 4612 -D -i -I -W cp932 D:\dev\gis\gis_data\A27-10_27_GML\A27-10_27-g_PublicElementarySchool.shp A27-10_27-g_PublicElementarySchool > A27-10_27-g_PublicElementarySchool.sql
shp2pgsql -s 4612 -D -i -I -W cp932 D:\dev\gis\gis_data\A27-10_27_GML\A27-10_27-g_SchoolDistrict.shp A27-10_27-g_SchoolDistrict > A27-10_27-g_SchoolDistrict.sql
shp2pgsql -s 4612 -D -i -I -W cp932 D:\dev\gis\gis_data\A27-10_28_GML\A27-10_28-g_PublicElementarySchool.shp A27-10_28-g_PublicElementarySchool > A27-10_28-g_PublicElementarySchool.sql
shp2pgsql -s 4612 -D -i -I -W cp932 D:\dev\gis\gis_data\A27-10_28_GML\A27-10_28-g_SchoolDistrict.shp A27-10_28-g_SchoolDistrict > A27-10_28-g_SchoolDistrict.sql
shp2pgsql -s 4612 -D -i -I -W cp932 D:\dev\gis\gis_data\N03-130401_27_GML\N03-13_27_130401.shp N03-13_27_130401 > N03-13_27_130401.sql
shp2pgsql -s 4612 -D -i -I -W cp932 D:\dev\gis\gis_data\N03-130401_28_GML\N03-13_28_130401.shp N03-13_28_130401 > N03-13_28_130401.sql
```

* SQLを実行して、データベースにデータを取り込みます。

```
psql -U postgres -d postgis_21_sample -f A27-10_27-g_PublicElementarySchool.sql
psql -U postgres -d postgis_21_sample -f A27-10_27-g_SchoolDistrict.sql
psql -U postgres -d postgis_21_sample -f A27-10_28-g_PublicElementarySchool.sql
psql -U postgres -d postgis_21_sample -f A27-10_28-g_SchoolDistrict.sql
psql -U postgres -d postgis_21_sample -f N03-13_27_130401.sql
psql -U postgres -d postgis_21_sample -f N03-13_28_130401.sql
```

--------

テーブル定義の確認
---------------

データベースに6個のテーブルができているはずです。
それぞれのテーブルは以下の様な形です。


### a27-10_xx-g_publicelementaryschool

小学校の位置情報らしい。

| gid  | a27_001 | a27_002 | a27_003   | a27_004                  | geom |
|------|---------|---------|-----------|--------------------------|------|
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

小学校の校区。
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


--------

アプリケーションのインストール
-----------

### 前準備

* 当然ですが、[nodejs](http://nodejs.org/) が必須です。
* `node-postgres`のコンパイルのため、Python 2.7 および Visual Studio(Windowsの場合) が必要です。

```
> python -V
Python 2.7.6
```

* ライブラリ管理のため、`bower`を使用しています。

```
> npm install -g bower
```

### アプリケーションのインストール

```
$ git clone git@github.com:Kazunori-Kimura/express-gis.git
$ cd express-gis
$ npm install
$ bower install
```

### アプリケーションの起動

```
node app.js
```

### アプリケーションの終了

Ctrl+Cで強制終了してください。



アプリケーションの中身に関する解説は、Wikiを参照してください。

