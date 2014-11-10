/*
 * spa.chat.js
 * SPAのチャット機能モジュール
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/

/* global $, spa */
spa.chat = (function () {
  // -------------------------------------
  //      Begin モジュールスコープ変数
  // -------------------------------------
  var
    configMap = {
      main_html : String()
        + '<div style="padding:1em; color:#fff;">'
        + 'Say hello to chat'
        + '</div>',
      settable_map : {}
    },
    stateMap = { $container : null },
    jqueryMap = {},

    setJqueryMap, configModule, initModule;
  // ------------------------------------
  //        End モジュールスコープ変数
  // ------------------------------------


  // ------------------------------------
  //        Begin ユーティリティメソッド
  // ------------------------------------

  // ------------------------------------
  //        End ユーティリティメソッド
  // ------------------------------------


  // ------------------------------------
  //        Begin DOMメソッド
  // ------------------------------------
  setJqueryMap = function () {
    var $container = stateMap.$container;
    jqueryMap = { $container : $container };
  };
  // ------------------------------------
  //        End DOMメソッド
  // ------------------------------------


  // ------------------------------------
  //        Begin イベントハンドラ
  // ------------------------------------

  // ------------------------------------
  //        End イベントハンドラ
  // ------------------------------------


  // ------------------------------------
  //        Begin パブリックメソッド
  // ------------------------------------
  configModule = function ( input_map ) {
    spa.util.setConfigMap({
      input_map    : input_map,
      settable_map : configMap.settable_map,
      config_map   : configMap
    });
    return true;
  };
  initModule = function ( $container ) {
    $container.html( configMap.main_html );
    stateMap.$container = $container;
    setJqueryMap();
    return true;
  };
  return {
    configModule : configModule,
    initModule   : initModule
  };
  // ------------------------------------
  //        End パブリックメソッド
  // ------------------------------------
}());
