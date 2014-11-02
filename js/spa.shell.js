/*
 * spa.shell.js
 * Shell module for SPA
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/
/*global $, spa */

spa.shell = (function () {
  //---------------- BEGIN モジュールスコープ変数 --------------
  var
    configMap = {
      main_html : String()
        + '<div class="spa-shell-head">'
        + '<div class="spa-shell-head-logo"></div>'
        + '<div class="spa-shell-head-acct"></div>'
        + '<div class="spa-shell-head-search"></div>'
        + '</div>'
        + '<div class="spa-shell-main">'
        + '<div class="spa-shell-main-nav"></div>'
        + '<div class="spa-shell-main-content"></div>'
        + '</div>'
        + '<div class="spa-shell-foot"></div>'
        + '<div class="spa-shell-chat"></div>'
        + '<div class="spa-shell-modal"></div>',
      chat_extend_time : 1000,
      chat_retract_time : 300,
      chat_extend_height : 450,
      chat_retract_height : 15,
      chat_extended_title : '格納する',
      chat_retracted_title : '拡大する'
    },
    stateMap = {
      $container : null,
      is_chat_retracted : true
    },
    jqueryMap = {},

    setJqueryMap, toggleChat, initModule;
  //----------------- END モジュールスコープ変数 ---------------

  //-------------------- BEGIN ユーティリティメソッド -----------------
  //--------------------- END ユーティリティメソッド ------------------

  //--------------------- BEGIN DOMメソッド --------------------
  // Begin setJqueryMap
  setJqueryMap = function () {
    var $container = stateMap.$container;

    jqueryMap = {
      $container : $container,
      $chat : $container.find( '.spa-shell-chat' )
    };
  };
  // End setJqueryMap

  // Begin toggleChat
  // 目的 : スライダーの拡大、格納
  // 引数 :
  //   * do_extend - if true, 拡大; if false 格納
  //   * callback  - コールバック関数(アニメーション終了時)
  // 設定 :
  //   * chat_extend_time, chat_retract_time
  //   * chat_extend_height, chat_retract_height
  // 戻り値 : boolean
  //   * true - 成功
  //   * false - 失敗
  // 状態 : stateMap.is_chat_retractedを設定
  //   * true - スライダー格納時
  //   * false - スライダー拡大時
  //
  toggleChat = function ( do_extend, callback ) {
    var
      px_chat_ht = jqueryMap.$chat.height(),
      is_open = px_chat_ht === configMap.chat_extend_height,
      is_closed = px_chat_ht === configMap.chat_retract_height,
      is_sliding = ! is_open && ! is_closed;

    // 競合状態を回避
    if ( is_sliding ){ return false; }

    // Begin スライダー拡大
    if ( do_extend ) {
      jqueryMap.$chat.animate(
        { height : configMap.chat_extend_height },
        configMap.chat_extend_time,
        function () {
          jqueryMap.$chat.attr(
            'title', configMap.chat_extended_title
          );
          stateMap.is_chat_retracted = false;
          if ( callback ){ callback( jqueryMap.$chat ); }
        }
      );
      return true;
    }
    // End スライダー拡大

    // Begin スライダー格納
    jqueryMap.$chat.animate(
      { height : configMap.chat_retract_height },
      configMap.chat_retract_time,
      function () {
        jqueryMap.$chat.attr(
          'title', configMap.chat_retracted_title
        );
        stateMap.is_chat_retracted = true;
        if ( callback ){ callback( jqueryMap.$chat ); }
      }
    );
    return true;
    // End スライダー格納
  };
  // End toggleChat
  //--------------------- END DOMメソッド ----------------------

  //------------------- BEGIN イベントハンドラ -------------------
  onClickChat = function ( event ) {
    toggleChat( stateMap.is_chat_retracted );
    return false;
  };
  //-------------------- END イベントハンドラ --------------------

  //------------------- BEGIN パブリックメソッド -------------------
  // Begin initModule
  initModule = function ( $container ){
    // HTMLをロード jQuery collectionsのマッピング
    stateMap.$container = $container;
    $container.html( configMap.main_html );
    setJqueryMap();

    // スライダー初期化、クリックハンドラをバインド
    stateMap.is_chat_retracted = true;
    jqueryMap.$chat
      .attr( 'title', configMap.chat_retracted_title )
      .click( onClickChat );
  };
  // End initModule

  return { initModule : initModule };
  //------------------- END パブリックメソッド ---------------------
}());
















