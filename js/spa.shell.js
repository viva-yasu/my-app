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
      anchor_schema_map : {
        chat  : { open : true, closed : true }
      },
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
      anchor_map : {},
      is_chat_retracted : true
    },
    jqueryMap = {},

    copyAnchorMap,    setJqueryMap,   toggleChat,
    changeAnchorPart, onHashchange,
    onClickChat,      initModule;
  //----------------- END モジュールスコープ変数 ---------------

  //-------------------- BEGIN ユーティリティメソッド -----------------
  // 格納したアンカーマップのコピーを返す
  copyAnchorMap = function () {
    return $.extend( true, {}, stateMap.anchor_map );
  };
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

  // Begin changeAnchorPart
  // 目的 : URIアンカー要素部分を変更する
  // 引数 :
  //   * arg_map - 変更したいURIアンカー部分を表すマップ
  // 戻り値 : boolean
  //   * true - URIのアンカー部分が更新された
  //   * false - URIのアンカー部分を更新できなかった
  // 動作 :
  //   現在のアンカーをstateMap.anchor_mapに格納
  //   このメソッドで
  //     * copyAnchorMap()を使って子のマップのコピーを作成
  //     * arg_mapを使ってキーバリューを修正
  //     * エンコーディングの独立値と従属値の区別を管理
  //     * uriAnchorを使ってURIの変更を試す
  //     * 成功時にはtrue、失敗時にはfalseを返す
  //
  changeAnchorPart = function ( arg_map ) {
    var
      anchor_map_revise = copyAnchorMap(),
      bool_return       = true,
      key_name, key_name_dep;

    // Begin アンカーマップへ変更を統合
    KEYVAL:
    for ( key_name in arg_map ) {
      if ( arg_map.hasOwnProperty( key_name ) ) {

        // 従属キーはスキップ
        if ( key_name.indexOf( '_' ) === 0 ) { continue KEYVAL; }

        // 独立キー値を更新する
        anchor_map_revise[key_name] = arg_map[key_name];

        // マッチした独立キーを更新
        key_name_dep = '_' + key_name;
        if ( arg_map[key_name_dep] ) {
          anchor_map_revise[key_name_dep] = arg_map[key_name_dep];
        }
        else {
          delete anchor_map_revise[key_name_dep];
          delete anchor_map_revise['_s' + key_name_dep];
        }
      }
    }
    // End アンカーマップへ変更を統合

    // Begin URIの更新、成功しなければ元に戻す
    try {
      $.uriAnchor.setAnchor( anchor_map_revise );
    }
    catch ( error ) {
      // URIを既存の状態に置き換える
      $.uriAnchor.setAnchor( stateMap.anchor_map,null,true );
      bool_return = false;
    }
    // End URIの更新

    return bool_return;
  };
  // End changeAnchorPart
  //--------------------- END DOMメソッド ----------------------

  //------------------- BEGIN イベントハンドラ -------------------
  // Begin onHashchange
  // 目的 : hashChangeイベントを処理
  // 引数 :
  //   * event - jQueryイベントオブジェクト
  // 設定 : なし
  // 戻り値 : false
  // 動作 :
  //   * URIアンカー要素を解析
  //   * 提示されたアプリケーション状態と現在の状態を比較
  //   * 提示された状態が既存の状態と異なる場合のみアプリケーションを調整する
  //
  onHashchange = function ( event ) {
    var
      anchor_map_previous = copyAnchorMap(),
      anchor_map_proposed,
      _s_chat_previous, _s_chat_proposed,
      s_chat_proposed;

    // アンカーの解析
    try { anchor_map_proposed = $.uriAnchor.makeAnchorMap(); }
    catch ( error ) {
      $.uriAnchor.setAnchor( anchor_map_previous, null, true );
      return false;
    }
    stateMap.anchor_map = anchor_map_proposed;

    // 便利な変数
    _s_chat_previous = anchor_map_previous._s_chat;
    _s_chat_proposed = anchor_map_proposed._s_chat;

    // Begin 変更されている場合にチャットコンポーネントを調整
    if ( ! anchor_map_previous
     || _s_chat_previous !== _s_chat_proposed
    ) {
      s_chat_proposed = anchor_map_proposed.chat;
      switch ( s_chat_proposed ) {
        case 'open'   :
          toggleChat( true );
        break;
        case 'closed' :
          toggleChat( false );
        break;
        default  :
          toggleChat( false );
          delete anchor_map_proposed.chat;
          $.uriAnchor.setAnchor( anchor_map_proposed, null, true );
      }
    }
    // End 変更されている場合にチャットコンポーネントを調整

    return false;
  };
  // End onHashchange

  // Begin onClickChat
  onClickChat = function ( event ) {
    changeAnchorPart({
      chat : ( stateMap.is_chat_retracted ? 'open' : 'closed' )
    });
    return false;
  };
  // End onClickChat
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

    // スキーマを使うようにuriAnchorを設定
    $.uriAnchor.configModule({
      schema_map : configMap.anchor_schema_map
    });

    // URIアンカー変更イベントを処理
    // すべての機能モジュールを設定して初期化した後に行う
    // でなければ、トリガーイベントを処理できる状態になっていない
    // トリガーイベントはアンカーがロード状態と見なせることを保証するために使う
    //
    $(window)
      .bind( 'hashchange', onHashchange )
      .trigger( 'hashchange' );

  };
  // End initModule

  return { initModule : initModule };
  //------------------- END パブリックメソッド ---------------------
}());
















