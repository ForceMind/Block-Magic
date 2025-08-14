(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __decorateClass = (decorators, target, key, kind) => {
    var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
    for (var i = decorators.length - 1, decorator; i >= 0; i--)
      if (decorator = decorators[i])
        result = (kind ? decorator(target, key, result) : decorator(result)) || result;
    if (kind && result)
      __defProp(target, key, result);
    return result;
  };
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // src/Manager/EventMgr.ts
  var EventMgr = class {
    constructor() {
      this._listeners = /* @__PURE__ */ new Map();
      this._laterlisteners = /* @__PURE__ */ new Map();
    }
    // 注册消息
    on(eventName, target, callback, ...args) {
      if (!this._listeners.has(eventName)) {
        this._listeners.set(eventName, []);
      }
      this._listeners.get(eventName).push({ target, callback, args });
    }
    // 注册延迟消息
    onLater(eventName, target, callback, ...args) {
      if (!this._laterlisteners.has(eventName)) {
        this._laterlisteners.set(eventName, []);
      }
      this._laterlisteners.get(eventName).push({ target, callback, args });
    }
    // 反注册消息
    off(eventName, target) {
      this.offListener(this._listeners, eventName, target);
      this.offListener(this._laterlisteners, eventName, target);
    }
    // 发送消息
    call(eventName, ...args) {
      this.callListener(this._listeners, eventName, ...args);
      this.callListener(this._laterlisteners, eventName, ...args);
    }
    offListener(listeners, eventName, target) {
      if (!listeners.has(eventName))
        return;
      const updatedListeners = listeners.get(eventName).filter((listener) => listener.target !== target);
      if (updatedListeners.length > 0) {
        listeners.set(eventName, updatedListeners);
      } else {
        listeners.delete(eventName);
      }
    }
    callListener(listeners, eventName, ...args) {
      if (!listeners.has(eventName))
        return;
      for (const { target, callback, args: storedArgs } of listeners.get(eventName)) {
        const argArr = storedArgs.length > 0 ? [...storedArgs, ...args] : args;
        callback.apply(target, argArr);
      }
    }
    destroy() {
      this._listeners.clear();
      this._laterlisteners.clear();
    }
  };
  var EventMgr_default = new EventMgr();

  // src/Utils/Config.ts
  var _Config = class _Config {
    static get GameRes() {
      let sounResArr = [];
      for (let i = 0; i < this.soundRes.length; i++) {
        if (this.soundInitRes.indexOf(this.soundRes[i].url) >= 0) {
          sounResArr.push(this.soundRes[i]);
        }
      }
      let result = _Config.prefabRes.concat(_Config.atlasRes).concat(_Config.exlRes).concat(sounResArr);
      return result.concat(_Config.spineRes);
    }
  };
  _Config.loadingRes = [];
  _Config.atlasRes = [];
  _Config.exlRes = [];
  _Config.prefabRes = [];
  _Config.spineRes = [];
  _Config.soundRes = [];
  _Config.version = "";
  _Config.httpUrl = "";
  _Config.maxLimitWord = "";
  _Config.soundInitRes = [];
  _Config.evn = "";
  _Config.severVer = 1;
  var Config = _Config;

  // src/Manager/LocalMgr.ts
  var LocalMgr = class {
    constructor() {
      this._bgm = 0;
      this._sfx = 0;
      this._best = 0;
    }
    //private powArr: number[][] = [[1], [0.7, 0.3], [0.6, 0.3, 0.1], [0.5, 0.3, 0.15, 0.05], [0.5, 0.3, 0.1, 0.07, 0.03]];
    init() {
      this._bgm = this.initKey("bgm");
      this._sfx = this.initKey("sfx");
      this._best = this.initKey("best");
    }
    initKey(key, initValue = 0) {
      let keyStr = Laya.LocalStorage.getItem(key);
      let result = keyStr ? parseInt(keyStr) : initValue;
      return result;
    }
    setKey(key, value) {
      Laya.LocalStorage.setItem(key, value.toString());
    }
    set bgm(value) {
      if (this._bgm === value)
        return;
      this._bgm = value;
      this.setKey("bgm", value);
    }
    get bgm() {
      return this._bgm;
    }
    set best(value) {
      if (this._best === value)
        return;
      this._best = value;
      this.setKey("best", value);
    }
    get best() {
      return this._best;
    }
    set sfx(value) {
      if (this._sfx === value)
        return;
      this._sfx = value;
      this.setKey("sfx", value);
    }
    get sfx() {
      return this._sfx;
    }
    set lastGame(value) {
      this._lastGame = value;
      Laya.LocalStorage.setItem("lastGame", JSON.stringify(value));
    }
    get lastGame() {
      return this._lastGame;
    }
    set gameSteps(value) {
      if (!this._gameSteps) {
        this._gameSteps = [];
      }
      this._gameSteps.push(value);
      Laya.LocalStorage.setItem("gameSteps", JSON.stringify(this._gameSteps));
    }
    get gameSteps() {
      return this._gameSteps;
    }
  };
  var LocalMgr_default = new LocalMgr();

  // src/Manager/SoundManager.ts
  var SoundManager = class {
    constructor() {
      this.soundOpen = false;
      this.musicOpen = true;
      this.hasinit = false;
      this.focus = true;
      this.hasinitEvent = false;
    }
    init() {
      if (Laya.Browser.window.innerWidth == 1 && Laya.Browser.window.innerHeight == 1) {
        this.onBlur();
      }
      Laya.stage.on(Laya.Event.BLUR, this, this.onBlur);
      Laya.stage.on(Laya.Event.FOCUS, this, this.onFocus);
      Laya.stage.on(Laya.Event.VISIBILITY_CHANGE, this, this._visibilityChange);
      this.MusicOpen = LocalMgr_default.bgm == 100;
      this.SoundOpen = LocalMgr_default.sfx == 100;
    }
    onBlur() {
      this.focus = false;
      Laya.SoundManager.setSoundVolume(0);
      this.pauseMusic();
    }
    onFocus() {
      this.focus = true;
      Laya.SoundManager.setSoundVolume(1);
      this.playMusic();
    }
    _visibilityChange() {
      if (Laya.stage.isVisibility) {
        if (window.innerWidth > 10 && window.innerHeight > 10) {
          this.onFocus();
        }
      } else {
        this.onBlur();
      }
    }
    pauseMusic() {
      if (Laya.SoundManager._musicChannel) {
        Laya.SoundManager._musicChannel.pause();
      }
    }
    //停止背景音乐
    stopMusic() {
      Laya.SoundManager.stopMusic();
    }
    get MusicOpen() {
      return this.musicOpen;
    }
    //打开/关闭音乐
    set MusicOpen(boo) {
      this.musicOpen = boo;
      if (boo) {
        this.playMusic();
      } else {
        this.stopMusic();
      }
    }
    get SoundOpen() {
      return this.soundOpen;
    }
    //打开/关闭音乐
    set SoundOpen(boo) {
      this.soundOpen = boo;
      Laya.SoundManager.setSoundVolume(boo ? 1 : 0);
      if (boo) {
        if (!this.hasinit) {
          this.hasinit = true;
          Laya.loader.load(Config.soundRes);
        }
      }
    }
    //播放声音
    playSound(name, complete = null, loop = 1) {
      if (!this.SoundOpen) {
        return;
      }
      if (!this.focus) {
        return;
      }
      Laya.SoundManager.playSound("resources/MP3/" + name + ".mp3", loop, complete);
    }
    stopSound(name) {
      if (!this.SoundOpen) {
        return;
      }
      Laya.SoundManager.stopSound("resources/MP3/" + name + ".mp3");
      Laya.SoundManager.destroySound("resources/MP3/" + name + ".mp3");
    }
    //播放背景音乐
    playMusic() {
      if (!this.musicOpen) {
        return;
      }
      if (!this.focus) {
        return;
      }
      if (!this.nowMusicName) {
        return;
      }
      let music = "resources/MP3/" + this.nowMusicName + ".mp3";
      if (Laya.SoundManager._musicChannel && Laya.SoundManager._musicChannel.url == music && Laya.SoundManager._musicChannel.position > 0) {
        Laya.SoundManager._musicChannel.resume();
      } else {
        try {
          Laya.SoundManager.playMusic(music, 0);
        } catch (e) {
          console.warn(e);
        }
      }
    }
    // private onAudioEnd(e: any): void {
    //     if (this.musicObj) {
    //         this._playMic();
    //     }
    // }
    // private addAudioEvents(): void {
    //     if (!this.musicObj) {
    //         console.log("addAudioEvents:" + JSON.stringify(this));
    //         return;
    //     }
    //     this.musicObj.completeHandler = Laya.Handler.create(this, this.onAudioEnd);
    //     // let audio = this.musicObj['_audio'];
    //     // if (audio && !this.hasinitEvent) {
    //     //     this.hasinitEvent = true;
    //     //     audio.onplay = this.onAudioPlay.bind(this);
    //     //     audio.onended = this.onAudioEnd.bind(this);
    //     // }
    // }
    // private _playMic(startTime: number = 0): void {
    //     if (!this.nowMusicName) {
    //         return;
    //     }
    //     if (this.musicObj) {
    //         this.musicObj.stop();
    //     }
    //     this.musicObj = Laya.SoundManager.playMusic("resources/MP3/" + this.nowMusicName + ".mp3", Laya.SoundManager.useAudioMusic ? 1 : 0, null, startTime);
    //     console.log("_playMic:" + JSON.stringify(this.musicObj));
    //     this.addAudioEvents();
    // }
    changeMusic(name) {
      if (this.nowMusicName == name) {
        return;
      }
      this.nowMusicName = name;
      if (!this.MusicOpen) {
        return;
      }
      this.playMusic();
    }
    // private resumeMusci(sound: Laya.SoundChannel): void {
    //     if (!sound) {
    //         return;
    //     }
    //     let pos: number = 0;
    //     if (sound["position"] != undefined) {
    //         pos = sound.position;
    //         if (!pos) {
    //             pos = 0;
    //         } else if (pos >= sound.duration) {
    //             pos = pos % sound.duration;
    //         }
    //         this._playMic(pos);
    //     } else {
    //         pos = sound["_pauseTime"];
    //         sound["_pauseTime"] = pos % sound.duration;
    //         sound.resume();
    //     }
    // }
    clear() {
    }
  };
  var SoundManager_default = new SoundManager();

  // src/Component/NodeBase.ts
  var NodeBase = class extends Laya.Script {
    constructor() {
      super(...arguments);
      this._eventMap = {};
      this._tweenObjs = [];
    }
    get timer() {
      if (!this._timer) {
        this._timer = new Laya.Timer(true);
      }
      return this._timer;
    }
    //监听事件
    addEvent(event, callback, ...args) {
      EventMgr_default.on(event, this, callback, ...args);
      this._eventMap[event] = 1;
    }
    //延迟监听事件
    addLaterEvent(event, callback, ...args) {
      EventMgr_default.onLater(event, this, callback, ...args);
      this._eventMap[event] = 1;
    }
    //移除监听事件
    removeEvent(event) {
      EventMgr_default.off(event, this);
      delete this._eventMap[event];
    }
    //增加点击事件
    addClick(btn, hander, clickSound = true) {
      btn.on(Laya.Event.CLICK, this, this.onBtnClick, [hander, clickSound]);
    }
    removeAllClick(btn) {
      btn.offAll(Laya.Event.CLICK);
    }
    onBtnClick(hander, clickSound = true, e) {
      let tar = e.target;
      if (tar && !tar.mouseEnabled) {
        return;
      }
      hander.runWith(e);
      if (clickSound) {
        SoundManager_default.playSound("Button");
      }
    }
    onDisable() {
      this.clearEvents();
    }
    clearEvents() {
      for (let key in this._eventMap) {
        this.removeEvent(key);
      }
      this._eventMap = {};
      if (this._timer) {
        this._timer.clearAll(this);
      }
      this.clearTweenTo();
    }
    clearTweenTo() {
      if (this._tweenObjs) {
        for (let i = 0; i < this._tweenObjs.length; i++) {
          Laya.Tween.clearAll(this._tweenObjs[i]);
        }
        this._tweenObjs = [];
      }
    }
    clearTween(sp) {
      let index = this._tweenObjs.indexOf(sp);
      if (index) {
        this._tweenObjs.splice(index, 1);
      }
      Laya.Tween.clearAll(sp);
    }
    TweenTo(target, props, duration, complete, delay, ease) {
      if (this._tweenObjs.indexOf(target) == -1) {
        this._tweenObjs.push(target);
      }
      return Laya.Tween.to(target, props, duration, ease, complete, delay);
    }
    get Detla() {
      let delta = Laya.timer.delta;
      if (delta > 20) {
        delta = 20;
      }
      return delta;
    }
  };

  // src/Component/CircleTween.ts
  var { regClass, property } = Laya;
  var CircleTween = class extends NodeBase {
    constructor() {
      super(...arguments);
      this.during = 500;
    }
    //组件被激活后执行，此时所有节点和组件均已创建完毕，此方法只执行一次
    onAwake() {
      super.onAwake();
    }
    onEnable() {
      this.playTween(0);
    }
    playTween(index) {
      let nowIndex = index % this.tweenKeyList.length;
      let key = this.tweenKeyList[nowIndex];
      let value = this.tweenValueList[nowIndex];
      let obj = {};
      obj[key] = value;
      this.TweenTo(this.owner, obj, this.during, Laya.Handler.create(this, this.playTween, [index + 1]));
    }
  };
  __decorateClass([
    property({ type: [String], tips: "在列表参数Key之间循环tween" })
  ], CircleTween.prototype, "tweenKeyList", 2);
  __decorateClass([
    property({ type: [Number], tips: "在列表参数Value之间循环tween" })
  ], CircleTween.prototype, "tweenValueList", 2);
  __decorateClass([
    property({ type: Number, tips: "间隔" })
  ], CircleTween.prototype, "during", 2);
  CircleTween = __decorateClass([
    regClass("uJ2LcAa1RWusEUdMcLhjMQ")
  ], CircleTween);

  // src/Component/TouchBox.ts
  var { regClass: regClass2, property: property2 } = Laya;
  var TouchBox = class extends NodeBase {
    constructor() {
      super(...arguments);
      this.startPos = new Laya.Point();
      this.isDragging = false;
      this.dragThreshold = 10;
      this.longPressTime = 300;
      // 毫秒
      this.hasLongPressStarted = false;
    }
    onAwake() {
      this.owner.on(Laya.Event.MOUSE_DOWN, this, this.handleMouseDown);
    }
    handleMouseDown(e) {
      this.startPos.setTo(e.touches[0].pos.x, e.touches[0].pos.y);
      this.isDragging = false;
      this.hasLongPressStarted = false;
      this.timer.once(this.longPressTime, this, this.handleLongPress);
      Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.handleMouseMove);
      Laya.stage.on(Laya.Event.MOUSE_UP, this, this.handleMouseUp);
    }
    handleMouseMove(e) {
      const dx = e.touches[0].pos.x - this.startPos.x;
      const dy = e.touches[0].pos.y - this.startPos.y;
      const movedEnough = Math.sqrt(dx * dx + dy * dy) >= this.dragThreshold;
      if (!this.isDragging && movedEnough) {
        this.isDragging = true;
        this.hasLongPressStarted = true;
        this.timer.clear(this, this.handleLongPress);
        if (this.onDragStart) {
          this.onDragStart.run();
        }
      }
      if (this.isDragging && this.onDragging) {
        this.onDragging.runWith([dx, dy]);
      }
    }
    handleMouseUp(e) {
      Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.handleMouseMove);
      Laya.stage.off(Laya.Event.MOUSE_UP, this, this.handleMouseUp);
      this.timer.clear(this, this.handleLongPress);
      if (this.isDragging) {
        if (this.onDragEnd) {
          this.onDragEnd.run();
        }
      } else {
        if (this.onClick) {
          this.onClick.run();
        }
      }
    }
    handleLongPress() {
      if (!this.isDragging) {
        this.isDragging = true;
        this.hasLongPressStarted = true;
        if (this.onDragStart) {
          this.onDragStart.run();
        }
      }
    }
  };
  __decorateClass([
    property2({ type: Number, tips: "touch开始检测时间" })
  ], TouchBox.prototype, "longPressTime", 2);
  TouchBox = __decorateClass([
    regClass2("-azINvyiSBC1iOS-jvJ77Q")
  ], TouchBox);

  // src/Utils/PlayerData.ts
  var PlayerData = class {
    //解析html地址中的userId和roomId,在http请求时带上
    constructor() {
      this.uid = "";
      this.room = "";
      this.child = "";
      this.type = "";
      this.hall = 0;
      // 0 游戏大厅  1 直播间
      this.gameId = "1017";
      this.picMode = 0;
      // 0 avif  1 png  
      this.pow = 1;
      this.ig = "22222222";
      this.nickname = "";
      this.avatar = "";
    }
    /**
     * 获取参数
     */
    getQueryString(name) {
      var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
      var r = Laya.Browser.window.location.search.substring(1).match(reg);
      if (r != null && r[2]) {
        return r[2];
      }
      return null;
    }
  };
  var PlayerData_default = new PlayerData();

  // src/Component/adaptBox.ts
  var { regClass: regClass3, property: property3 } = Laya;
  var adaptBox = class extends NodeBase {
    constructor() {
      super(...arguments);
      this.change = 0;
      this.align = "y";
    }
    //组件被激活后执行，此时所有节点和组件均已创建完毕，此方法只执行一次
    onAwake() {
      super.onAwake();
      if (PlayerData_default.hall) {
        return;
      }
      if (this.owner["centerY"] != void 0) {
        this.align = "centerY";
      } else if (this.owner["bottom"] != void 0) {
        this.align = "bottom";
      } else if (this.owner["top"] != void 0) {
        this.align = "top";
      }
      let now = this.owner[this.align];
      let value = this.change * (PlayerData_default.pow - 1) + now;
      this.owner[this.align] = value;
    }
  };
  __decorateClass([
    property3({ type: Number, tips: "屏幕高宽比1到2之间需要变化的值" })
  ], adaptBox.prototype, "change", 2);
  adaptBox = __decorateClass([
    regClass3("T1co9t9WRayNg0wx2C9SZQ")
  ], adaptBox);

  // src/Manager/EventDef.ts
  var EventDef = class {
  };
  EventDef.coinUpdate = "coinUpdate";
  EventDef.socketClosed = "socketClosed";
  EventDef.onSceneOpend = "onSceneOpend";
  EventDef.onSlotsUpdate = "onSlotsUpdate";
  EventDef.onStartGame = "onStartGame";
  EventDef.beginEndGame = "beginEndGame";
  EventDef.gameInitComplete = "gameInitComplete";
  EventDef.onSeverHistory = "onSeverHistory";
  EventDef.onReStartGame = "onReStartGame";
  EventDef.onSoundChange = "onSoundChange";
  EventDef.stopSlotByLine = "stopSlotByLine";
  EventDef.onWinClose = "onWinClose";
  EventDef.onFreeWinClose = "onFreeWinClose";
  EventDef.onWinOpen = "onWinOpen";
  EventDef.onPlayBoom = "onPlayBoom";
  EventDef.onPlayBoom2 = "onPlayBoom2";
  EventDef.hideWinBack = "hideWinBack";
  EventDef.onTouchPlay = "onTouchPlay";
  EventDef.changeFreeState = "onFreeOpen";
  EventDef.onFreeClose = "onFreeClose";
  EventDef.onFreeClose2 = "onFreeClose2";
  EventDef.onResWheel = "onResWheel";
  EventDef.onStopAuto = "onStopAuto";
  EventDef.onStopAuto2 = "onStopAuto2";
  EventDef.onStopAuto3 = "onStopAuto3";
  EventDef.onWheelNum = "onWheelNum";
  EventDef.playSlotOver = "playSlotOver";
  EventDef.onClickStop = "onClickStop";
  EventDef.onWinIconShow = "onWinIconShow";
  EventDef.HttpMessComplete = "HttpMessComplete";
  EventDef.ClickPlay = "ClickPlay";
  EventDef.ShowSlotIcon = "ShowSlotIcon";
  EventDef.HideSlotIcon = "HideSlotIcon";
  EventDef.DimInSlotIcon = "DimInSlotIcon";
  EventDef.onSeverComble = "onSeverComble";
  EventDef.onCloseComble = "onCloseComble";
  EventDef.onClickTest = "onCloseTest";
  EventDef.setFreeScoreLab = "setFreeScoreLab";
  EventDef.updatePool = "updatePool";
  EventDef.onSeverFreeBtn = "onSeverFreeBtn";
  EventDef.changeJackPool = "changeJackPool";
  EventDef.playLighSpine = "playLighSpine";
  EventDef.showIconEffect = "showIconEffect";
  EventDef.onBuyPlay = "onBuyPlay";
  EventDef.onBalanceWayAdd = "onBalanceWayAdd";
  EventDef.changeIconAmount = "changeIconAmount";
  EventDef.resetGame = "resetGame";
  EventDef.updateExp = "updateExp";
  EventDef.onRevive = "onRevive";
  EventDef.onGameOver = "onGameOver";
  EventDef.onResGameOver = "onResGameOver";
  EventDef.onUseItemComplete = "onUseItemComplete";
  EventDef.showRank = "showRank";
  EventDef.closeReviveDialog = "closeReviveDialog";
  EventDef.updateTaskList = "updateTaskList";
  EventDef.onRankReward = "onRankReward";
  EventDef.updateCoin = "updateCoin";
  EventDef.onBlockMoving = "onBlockMoving";
  EventDef.onBlockEnd = "onBlockEnd";
  EventDef.playBoomSpine = "playBoomSpine";
  EventDef.onMergeComplete = "onMergeComplete";
  //平台交互消息
  EventDef.onRechargeSuccess = "onRechargeSuccess";

  // src/Manager/UIDef.ts
  var UILayer = /* @__PURE__ */ ((UILayer2) => {
    UILayer2[UILayer2["Scene"] = 0] = "Scene";
    UILayer2[UILayer2["Lower"] = 1] = "Lower";
    UILayer2[UILayer2["Normal"] = 2] = "Normal";
    UILayer2[UILayer2["Popup"] = 3] = "Popup";
    UILayer2[UILayer2["Popup2"] = 4] = "Popup2";
    UILayer2[UILayer2["Top"] = 5] = "Top";
    UILayer2[UILayer2["Top2"] = 6] = "Top2";
    UILayer2[UILayer2["Tips"] = 7] = "Tips";
    UILayer2[UILayer2["UILayer_Num"] = 8] = "UILayer_Num";
    return UILayer2;
  })(UILayer || {});

  // src/UI/UIBase.ts
  var { regClass: regClass4, property: property4 } = Laya;
  var startAniScale = new Laya.Vector3(0.5, 0.5);
  var endAniScale = new Laya.Vector3(1, 1);
  var UIBase = class extends NodeBase {
    constructor() {
      super(...arguments);
      this.layer = 3 /* Popup */;
      this.clickClose = false;
      this.soundShow = false;
      this.repeatOpen = false;
      this.tweenOpenTime = 100;
      this.closeAni = false;
      this.tweenCloseTime = 100;
      this.closing = false;
      this.forceShowAni = false;
    }
    onAwake() {
      super.onAwake();
      this._ui = this.owner;
      this._ui.on(Laya.Event.CLICK, this, this.autoClickClose);
      this.scaleBox = this._ui.getChildByName("scaleBox");
      if (!this.scaleBox) {
        this.scaleBox = this._ui;
      }
      let closeBtn = this._ui["closeBtn"];
      if (closeBtn) {
        this.addClick(closeBtn, new Laya.Handler(this, this.clickCloseBtn), false);
      }
      this.onInit();
    }
    clickCloseBtn() {
      SoundManager_default.playSound("Close");
      this.close();
    }
    //手动调用节点销毁时执行
    onDestroy() {
      super.onDestroy();
      this.onDestroyed();
    }
    //第一次执行update之前执行，只会执行一次
    // onStart(): void {
    // }
    onInit() {
    }
    onOpened(param = null) {
    }
    //打开动画完成时调用
    onOpenAniComplete() {
    }
    //关闭动画完成时调用
    onCloseAniComplete() {
      this.closing = false;
      UIMgr.inst.close(this.uiName);
    }
    onClosed() {
    }
    onDestroyed() {
    }
    //点击屏幕关闭界面的方法
    autoClickClose() {
      if (this.clickClose) {
        this.close();
      }
    }
    //关闭界面
    close() {
      if (this.closing) {
        return;
      }
      if (this.closeAni) {
        this.closing = true;
        this._showCloseAni();
      } else {
        UIMgr.inst.close(this.uiName);
      }
    }
    //显示界面
    show(params = null) {
      this.owner["visible"] = true;
      this._showAni();
      this._data = params;
      this.showSound();
      this.onOpened(params);
    }
    //显示界面打开时的声音
    showSound() {
      if (this.soundShow) {
        SoundManager_default.playSound("Popup");
      }
    }
    //管理类调用的关闭方法,外部不直接调用
    hide() {
      this.owner["visible"] = false;
      this._stopAllAni();
      this.onClosed();
    }
    //打开动画
    _showAni() {
      this._stopAllAni();
      if (this.layer == 3 /* Popup */ || this.layer == 4 /* Popup2 */ || this.forceShowAni) {
        this._showScaleAni();
      }
    }
    //关闭动画
    _showCloseAni() {
      this._stopAllAni();
      if (this.layer == 3 /* Popup */ || this.layer == 4 /* Popup2 */ || this.forceShowAni) {
        this._showCloseScaleAni();
      }
    }
    _showScaleAni() {
      if (this.tweenOpenTime <= 0) {
        return;
      }
      this.scaleBox["scaleX"] = startAniScale.x;
      this.scaleBox["scaleY"] = startAniScale.y;
      this.scaleBox["x"] = this.scaleBox["width"] / 2 * startAniScale.x;
      this.scaleBox["y"] = this.scaleBox["height"] / 2 * startAniScale.y;
      Laya.Tween.to(this.scaleBox, { scaleX: endAniScale.x, scaleY: endAniScale.y, x: 0, y: 0 }, this.tweenOpenTime, null, Laya.Handler.create(this, this.onOpenAniComplete));
    }
    _showCloseScaleAni() {
      this.scaleBox["scaleX"] = 1;
      this.scaleBox["scaleY"] = 1;
      this.scaleBox["x"] = 0;
      this.scaleBox["y"] = 0;
      Laya.Tween.to(this.scaleBox, { scaleX: 0, scaleY: 0, x: this.scaleBox["width"] / 2, y: this.scaleBox["height"] / 2 }, this.tweenCloseTime, null, Laya.Handler.create(this, this.onCloseAniComplete));
    }
    _stopAllAni() {
      Laya.Tween.clearAll(this.scaleBox);
    }
    //每帧更新时执行，尽量不要在这里写大循环逻辑或者使用getComponent方法
    //onUpdate(): void {}
    //每帧更新时执行，在update之后执行，尽量不要在这里写大循环逻辑或者使用getComponent方法
    //onLateUpdate(): void {}
    //鼠标点击后执行。与交互相关的还有onMouseDown等十多个函数，具体请参阅文档。
    //onMouseClick(): void {}
  };
  __decorateClass([
    property4({ type: UILayer })
  ], UIBase.prototype, "layer", 2);
  __decorateClass([
    property4({ type: Boolean })
  ], UIBase.prototype, "clickClose", 2);
  __decorateClass([
    property4({ type: Boolean })
  ], UIBase.prototype, "soundShow", 2);
  __decorateClass([
    property4({ type: Boolean })
  ], UIBase.prototype, "repeatOpen", 2);
  __decorateClass([
    property4({ type: Number })
  ], UIBase.prototype, "tweenOpenTime", 2);
  UIBase = __decorateClass([
    regClass4("IlkwvNoFQhOZH3dd-ubppQ")
  ], UIBase);

  // src/Manager/UIMgr.ts
  var UIMgr = class _UIMgr {
    constructor() {
      // 当前可用的UI Ctrl：正在显示或隐藏的，销毁的取不到ctrl
      this._ctrls = /* @__PURE__ */ new Map();
      this._states = /* @__PURE__ */ new Map();
      /** 在loading时需要给关闭处理的数组 */
      this._needCloseArr = [];
      this.uiLayers = [];
      this.uiQueue = [];
      let pow = Laya.Browser.clientHeight / Laya.Browser.clientWidth;
      PlayerData_default.pow = pow;
      this.uibox = new Laya.Panel();
      if (pow >= 1) {
        this.uibox.left = 0;
        this.uibox.right = 0;
        if (!PlayerData_default.hall) {
          this.uibox.top = 0;
          this.uibox.bottom = 0;
        } else {
          this.uibox.height = Laya.stage.designHeight + 20;
          this.uibox.bottom = 0;
        }
      } else {
        this.uibox.width = Laya.stage.designWidth;
        this.uibox.centerX = 0;
        this.uibox.top = 0;
        this.uibox.bottom = 0;
      }
      this.uibox.mouseEnabled = true;
      this.uibox.content.mouseEnabled = true;
      Laya.stage.addChild(this.uibox);
      for (let i = 0; i < 8 /* UILayer_Num */; i++) {
        let box = new Laya.Box();
        box.left = 0;
        box.right = 0;
        box.top = 0;
        box.bottom = 0;
        box.mouseEnabled = false;
        this.uibox.addChild(box);
        box.name = "layer" + i;
        this.uiLayers.push(box);
      }
    }
    static get inst() {
      if (null == this._inst) {
        this._inst = new _UIMgr();
      }
      return this._inst;
    }
    changeScene(fun) {
      this.open("blackView" /* blackView */, fun);
    }
    openBouns() {
      this.changeScene(() => {
        this.open("FreeWinView" /* FreeWinView */);
      });
    }
    openQueue(ui, params = null) {
      if (!this.uiQueue || this.uiQueue.length == 0) {
        this.uiQueue.push({ ui, params });
        this.open(ui, params);
        return;
      }
      this.uiQueue.push({ ui, params });
    }
    //点击按钮时发送请求,收到此请求再打开界面的方法
    openByEvent(ui, event, ...params) {
      EventMgr_default.on(event, this, this.onOpenEvent, ui, event, ...params);
    }
    onOpenEvent(ui, event, ...params) {
      EventMgr_default.off(event, this);
      this.open(ui, params);
    }
    //打开界面
    open(ui, params = null) {
      let state = this._getState(ui);
      if (1 /* Loading */ == state || 2 /* Showing */ == state) {
        if (2 /* Showing */ == state) {
          let ctr = this.getCtrl(ui);
          if (ctr && ctr.repeatOpen) {
            ctr["onOpened"](params);
            return;
          }
        }
        console.log(`[UIMgr] 不能重复打开同一个UI：${ui} => ${state}`);
        return;
      }
      switch (state) {
        case 0 /* None */:
          this._states.set(ui, 1 /* Loading */);
          let prefabName = ui.valueOf();
          Laya.loader.load("prefab/" + prefabName + ".lh").then((res) => {
            this._onUILoaded(res, ui, params);
          });
          return;
        case 3 /* Hide */:
          this._showUI(ui, params);
          break;
      }
    }
    //关闭界面
    close(ui) {
      let state = this._getState(ui);
      if (state != 2 /* Showing */) {
        if (state == 1 /* Loading */) {
          this._needCloseArr.push(ui);
        }
        return;
      }
      let ctrl = this._ctrls.get(ui);
      if (!ctrl) {
        return;
      }
      ctrl.hide();
      this._states.set(ui, 3 /* Hide */);
      let layer = this.uiLayers[ctrl.layer];
      layer.removeChild(ctrl.owner);
      if (layer.numChildren <= 0) {
        layer.mouseEnabled = false;
      }
      if (this.uiQueue && this.uiQueue.length > 0) {
        let queueNode = this.uiQueue[0];
        if (queueNode.ui == ui) {
          this.uiQueue.splice(0, 1);
          if (this.uiQueue && this.uiQueue.length > 0) {
            queueNode = this.uiQueue[0];
            this.open(queueNode.ui, queueNode.params);
          } else {
            if (this.uiQueueComplete) {
              this.uiQueueComplete.run();
              this.uiQueueComplete = null;
            }
          }
        }
      }
    }
    openGameView(param = false) {
      if (PlayerData_default.hall) {
        this.open("gameView2" /* gameView2 */, param);
      } else {
        this.open("gameView" /* gameView */, param);
      }
    }
    openStartView(param = false) {
      if (PlayerData_default.hall) {
        this.open("startView2" /* startView2 */, param);
      } else {
        this.open("startView" /* startView */, param);
      }
    }
    openGuideView(param = false) {
      if (PlayerData_default.hall) {
        this.open("guideView2" /* guideView2 */, param);
      } else {
        this.open("guideView" /* guideView */, param);
      }
    }
    //传入界面关闭界面的方法
    // public closeByScr(ui: UIBase) {
    //     for (let [key, value] of this._ctrls) {
    //         if (value == ui) {
    //             this.close(key);
    //             return;
    //         }
    //     }
    // }
    //关闭所有打开的界面
    closeAll() {
      for (let [key, value] of this._ctrls) {
        let state = this._states.get(key);
        if (state == 1 /* Loading */ || state == 2 /* Showing */) {
          this.close(key);
        }
      }
    }
    getCtrl(ui) {
      return this._ctrls.get(ui);
    }
    /** 判断UI是否正在显示 */
    isShowing(ui) {
      let state = this._getState(ui);
      return state == 2 /* Showing */ || state == 1 /* Loading */;
    }
    getUILayer(layer) {
      return this.uiLayers[layer];
    }
    _setLayer(ctrl, ui) {
      let layer = ctrl.layer;
      let layerNode = this.getUILayer(layer);
      this._setParent(ctrl.owner, layerNode);
    }
    _setParent(node, layerNode) {
      layerNode.addChild(node);
      layerNode.mouseEnabled = true;
    }
    //界面加载完的回调处理
    _onUILoaded(prefab, ui, params) {
      return __async(this, null, function* () {
        let index = this._needCloseArr.indexOf(ui);
        if (index >= 0) {
          this._needCloseArr.splice(index, 1);
          this._states.set(ui, 0 /* None */);
          return;
        }
        let uiNode = prefab.create();
        let url = Laya.URL.formatURL(prefab.url);
        delete Laya.Loader.preLoadedMap[url];
        Laya.loader.clearRes(prefab.url);
        prefab.destroy();
        prefab = null;
        let ctrl = uiNode.getComponent(UIBase);
        ctrl.uiName = ui;
        this._ctrls.set(ui, ctrl);
        this._showUI(ui, params);
      });
    }
    findDepends(node) {
      return __async(this, null, function* () {
        for (let i = 0; i < node.numChildren; i++) {
          let child = node.getChildAt(i);
          if (child instanceof Laya.Image) {
            if (child.skin) {
              yield Laya.loader.load(child.skin, Laya.Loader.IMAGE);
            }
          }
          yield this.findDepends(child);
        }
      });
    }
    _showUI(ui, params) {
      let ctrl = this._ctrls.get(ui);
      this._setLayer(ctrl, ui);
      this._states.set(ui, 2 /* Showing */);
      ctrl.show(params);
    }
    _getState(ui) {
      let state = this._states.get(ui);
      if (!state) {
        state = 0 /* None */;
      }
      return state;
    }
  };

  // src/Manager/StateManager.ts
  var StateManager = class {
    //初始化游戏,初始化数据类
    initGame() {
      MainModel_default.init();
    }
    //重新登录,返回loading
    reLogin() {
      TipsManager_default.clear();
      SoundManager_default.clear();
      UIMgr.inst.closeAll();
      EventMgr_default.call(EventDef.onReStartGame);
      EventMgr_default.destroy();
      this.initGame();
      UIMgr.inst.open("loadingView" /* loadingView */);
    }
  };
  var StateManager_default = new StateManager();

  // src/Manager/TipsManager.ts
  var TipsManager = class {
    constructor() {
      this.isRelogin = false;
      this.errorMesMap = /* @__PURE__ */ new Map();
    }
    //reloginType 0 不重登 1 3秒之后重登  2 3秒之后刷新浏览器  3  重试3次重登
    showTips(tip, reloginType = 0, act = "") {
      if (this.isRelogin) {
        return;
      }
      UIMgr.inst.open("tipsView" /* tipsView */, tip);
      if (reloginType == 1 || reloginType == 2) {
        this.isRelogin = true;
        if (reloginType == 1) {
          this.tipsTimer.once(3e3, this, this.onRelogin, null, false);
        } else if (reloginType == 2) {
          this.tipsTimer.once(3e3, this, this.onRefresh, null, false);
        }
      }
      if (reloginType == 3 && act) {
        let time = this.errorMesMap.get(act);
        if (!time) {
          time = 1;
        } else {
          time++;
        }
        this.errorMesMap.set(act, time);
        if (time > 3) {
          this.isRelogin = true;
          this.tipsTimer.once(3e3, this, this.onRelogin, null, false);
        }
      }
    }
    get tipsTimer() {
      if (!this._tipsTimer) {
        this._tipsTimer = new Laya.Timer(true);
      }
      return this._tipsTimer;
    }
    clear() {
      this.errorMesMap.clear();
    }
    onRelogin() {
      this.tipsTimer.clearAll(this);
      this.isRelogin = false;
      StateManager_default.reLogin();
    }
    onRefresh() {
      Laya.Browser.window.location.reload();
    }
  };
  var TipsManager_default = new TipsManager();

  // src/Manager/WaitMgr.ts
  var WaitMgr = class {
    constructor() {
      this.waitTimeOut = 5e3;
      this.sourceArr = /* @__PURE__ */ new Map();
    }
    //显示等待界面,得传入来源和是否在一段时间后自动关闭此界面
    showWait(source, autoCloseWait = false) {
      if (!MainModel_default.hasInit) {
        return;
      }
      console.log("showWait:" + source);
      this.sourceArr.set(source, 1);
      if (!this.timer) {
        this.timer = new Laya.Timer(true);
      }
      this._showWait(source, autoCloseWait);
    }
    showWaitOnly(source) {
      console.log("showWaitOnly:" + source);
      this.sourceArr.set(source, 1);
      this._showWait(source, false, true);
    }
    _showWait(source, autoCloseWait = false, only = false) {
      if (!UIMgr.inst.isShowing("waitView" /* waitView */)) {
        UIMgr.inst.open("waitView" /* waitView */, !only);
        if (!only) {
          if (autoCloseWait) {
            this.timer.once(this.waitTimeOut, this, this.onTimeOut, [source]);
          } else {
            this.timer.once(this.waitTimeOut, this, this.onTimeOutRelogin, [source]);
          }
        }
      }
    }
    //超时自动重新登录
    onTimeOutRelogin(source) {
      console.log("TimeOutRelogin:" + source);
      this.closeWait(source);
      TipsManager_default.showTips("Connection Timeout", 1);
    }
    onRelogin() {
      StateManager_default.reLogin();
    }
    onTimeOut(source) {
      console.log("TimeOut:" + source);
      this.closeWait(source);
      UIMgr.inst.open("tipsView" /* tipsView */, "Check Your Internet!");
    }
    logSourceArr() {
      StateManager_default.reLogin();
    }
    //关闭等待界面,得传入来源
    closeWait(source) {
      console.log("closeWait:" + source);
      this.sourceArr.delete(source);
      if (this.sourceArr.size <= 0) {
        if (this.timer) {
          this.timer.clearAll(this);
        }
        UIMgr.inst.close("waitView" /* waitView */);
      }
    }
    destroy() {
      this.sourceArr.clear();
      if (this.timer) {
        this.timer.clearAll(this);
      }
      this.closeWait("UI_Wait");
    }
  };
  var WaitMgr_default = new WaitMgr();

  // src/Utils/CommonPool.ts
  var CommonPool = class {
    constructor(ctor, dtor) {
      this.usingObjs = /* @__PURE__ */ new Set();
      // 使用 Set 存储正在使用的对象
      this.freeObjs = [];
      this.ctor = ctor;
      this.dtor = dtor;
    }
    // 拿一个对象
    take() {
      if (this.freeObjs.length > 0) {
        const obj2 = this.freeObjs.pop();
        this.usingObjs.add(obj2);
        return obj2;
      }
      const obj = this.ctor.run();
      this.usingObjs.add(obj);
      return obj;
    }
    // 塞回去一个对象
    put(obj) {
      if (this.usingObjs.has(obj)) {
        this.freeObjs.push(obj);
        this.usingObjs.delete(obj);
      }
    }
    resetUsings(fun) {
      for (const obj of this.usingObjs) {
        this.freeObjs.push(obj);
        fun.runWith(obj);
      }
      this.usingObjs.clear();
    }
    // 清空池
    destroy() {
      if (this.dtor) {
        for (const obj of this.usingObjs) {
          this.dtor.runWith(obj);
        }
        for (const obj of this.freeObjs) {
          this.dtor.runWith(obj);
        }
      }
      this.usingObjs.clear();
      this.freeObjs.length = 0;
    }
  };

  // src/Model/HttpReq.ts
  var HttpRequest = class extends Laya.HttpRequest {
    _onLoad(e) {
      var http = this._http;
      var status = http.status !== void 0 ? http.status : 200;
      if (status >= 200 && status < 300 || status === 0) {
        this.complete();
      } else {
        this.error("[" + http.status + "]" + http.statusText + ":" + http.responseURL);
      }
    }
  };

  // src/Model/WS.ts
  var httpSender = class {
    constructor() {
      this.http = new HttpRequest();
      this.http.on(Laya.Event.COMPLETE, this, this.completeHandler);
      this.http.on(Laya.Event.ERROR, this, this.errorHandler);
    }
    send(target, name, data2 = null, wait = true, lobby = false) {
      this.target = target;
      this.name = name;
      if (!data2) {
        data2 = {};
      }
      data2.uid = PlayerData_default.uid;
      data2.roomId = PlayerData_default.room;
      data2.roomType = PlayerData_default.type;
      data2.ig = PlayerData_default.ig;
      data2.version = Config.severVer;
      this.data = data2;
      if (wait) {
        WaitMgr_default.showWait(name);
      }
      if (lobby) {
        let url = Config.httpUrl.replace(/game\/[^/]+\//, "game/lobby/");
        this.http.send(url + name, data2, "post", "json");
      } else {
        this.http.send(Config.httpUrl + name, data2, "post", "json");
      }
    }
    //http请求错误回调
    errorHandler(error) {
      if (this.target["onError"]) {
        this.target["onError"](this.name, 999, error);
      }
      console.error("errorHandler:" + this.name + " " + error);
      EventMgr_default.call(EventDef.HttpMessComplete, this);
    }
    //http请求成功回调
    completeHandler(data2) {
      WaitMgr_default.closeWait(this.name);
      console.log(this.name + ":" + JSON.stringify(data2));
      this.sendRes(data2);
      EventMgr_default.call(EventDef.HttpMessComplete, this);
    }
    sendRes(data2) {
      let res = data2;
      if ((res == null ? void 0 : res.status) == -1e4) {
        TipsManager_default.showTips("Login Failed", 1);
        return;
      } else if ((res == null ? void 0 : res.status) == 500) {
        res.code = 500;
      } else if ((res == null ? void 0 : res.status) == 404) {
        res.code = 404;
      }
      if (res.code == 0) {
        if (this.target["OnRes" + this.name]) {
          this.target["OnRes" + this.name](res, this.data);
        }
      } else {
        if (this.target["onError"]) {
          this.target["onError"](this.name, res.code, JSON.stringify(res));
        }
      }
    }
  };
  var WSClass = class {
    constructor() {
      this.httpPool = new CommonPool(new Laya.Handler(this, this.creatSender));
      EventMgr_default.on(EventDef.HttpMessComplete, this, this.onMessComplete);
    }
    creatSender() {
      let http = new httpSender();
      return http;
    }
    onMessComplete(http) {
      if (this.httpPool) {
        this.httpPool.put(http);
      }
    }
    //发送http请求
    sendHttp(target, name, data2 = null, wait = true, lobby = false) {
      let http = this.httpPool.take();
      http.send(target, name, data2, wait, lobby);
    }
  };
  var WS = new WSClass();

  // src/Model/ModelBase.ts
  var ModelBase = class {
    constructor() {
      this._eventMap = {};
    }
    sendHttp(name, data2 = null, wait = true, lobby = false) {
      WS.sendHttp(this, name, data2, wait, lobby);
    }
    //错误处理
    onError(act, code, mess) {
      console.error(act + ":" + mess);
    }
    clear() {
      this.clearEvents();
      this.onClear();
    }
    //数据类销毁时调用
    onClear() {
    }
    init() {
      this.addEvent(EventDef.onReStartGame, this.clear);
      this.onInit();
    }
    //数据类初始化时调用
    onInit() {
    }
    //事件注册方法
    addEvent(event, callback, ...args) {
      EventMgr_default.on(event, this, callback, ...args);
      this._eventMap[event] = 1;
    }
    //事件注册方法
    addLaterEvent(event, callback, ...args) {
      EventMgr_default.onLater(event, this, callback, ...args);
      this._eventMap[event] = 1;
    }
    clearEvents() {
      for (let key in this._eventMap) {
        EventMgr_default.off(key, this);
      }
      this._eventMap = {};
    }
  };

  // src/Model/MainModel.ts
  var MainModel = class extends ModelBase {
    constructor() {
      super();
      this.hasInit = false;
      this.bestScore = 0;
      this.gameId = "";
      this.stepArr = [];
      this.stepId = 1;
      this.lastScore = 0;
    }
    onInit() {
      this.addEvent(EventDef.onRechargeSuccess, this.onRecharge);
      Laya.stage.on(Laya.Event.BLUR, this, this.onBlur);
      Laya.stage.on(Laya.Event.FOCUS, this, this.onFocus);
      Laya.stage.on(Laya.Event.VISIBILITY_CHANGE, this, this._visibilityChange);
    }
    //失去焦点
    onBlur() {
      console.log("==失去焦点==");
    }
    //取得焦点
    onFocus() {
      console.log("==取得焦点==");
    }
    _visibilityChange() {
      if (Laya.stage.isVisibility) {
        console.log("==onFocus==");
        this.onFocus();
      } else {
        console.log("==onBlur==");
        this.onBlur();
      }
    }
    onClear() {
      console.log("==onClear==");
      this.hasInit = false;
      this.stepArr = [];
      this.stepMessArr = [];
    }
    //平台充值回调
    onRecharge() {
    }
    hasGame() {
      return this.lastGame && this.lastGame.length > 0;
    }
    //初始化请求
    sendinit() {
      LocalMgr_default.init();
      SoundManager_default.init();
      this.bestScore = LocalMgr_default.best;
      this.hasInit = true;
      EventMgr_default.call(EventDef.gameInitComplete);
    }
    //初始化请求返回
    OnResinit(data2) {
      SoundManager_default.init();
      this.hasInit = true;
      this.bestScore = data2.data.topScore;
      if (PlayerData_default.hall) {
        SoundManager_default.SoundOpen = false;
        SoundManager_default.MusicOpen = false;
      } else {
        if (data2.data.bgm == null) {
          SoundManager_default.MusicOpen = true;
        } else {
          SoundManager_default.MusicOpen = data2.data.bgm ? true : false;
        }
        if (data2.data.sfx == null) {
          SoundManager_default.SoundOpen = true;
        } else {
          SoundManager_default.SoundOpen = data2.data.sfx ? true : false;
        }
      }
      this.handleLastGame(data2.data.table);
      this.lastScore = data2.data.score;
      this.gameId = data2.data.gameId;
      this.lastDownBlocks = data2.data.next;
      EventMgr_default.call(EventDef.gameInitComplete);
    }
    handleLastGame(datas) {
      this.lastGame = [];
      for (let i = 0; i < datas.length; i++) {
        let colorArr = datas[i];
        for (let j = 0; j < colorArr.length; j++) {
          if (colorArr[j]) {
            this.lastGame.push({ x: j, y: i, color: colorArr[j] });
          }
        }
      }
    }
    //开始游戏请求
    sendgameStart() {
      EventMgr_default.call(EventDef.onStartGame);
    }
    OnResgameStart(data2) {
      this.stepArr = [];
      this.stepMessArr = [];
      this.stepId = 1;
      this.gameId = data2.data.gameId;
      this.lastScore = 0;
      EventMgr_default.call(EventDef.onStartGame);
    }
    //结束游戏请求
    sendgameOver(score) {
      UIMgr.inst.open("gameOverView" /* gameOverView */, score);
    }
    OnResgameOver(data2, sendData) {
      UIMgr.inst.open("gameOverView" /* gameOverView */, sendData.score);
    }
    sendSound(music, sound) {
      let mcValue = music ? 100 : 0;
      let sdValue = sound ? 100 : 0;
      LocalMgr_default.bgm = mcValue;
      LocalMgr_default.sfx = sdValue;
      SoundManager_default.MusicOpen = music;
      SoundManager_default.SoundOpen = sound;
    }
    OnRessetting(data2, sendData) {
    }
    isGuide() {
      return false;
    }
    resetGame() {
      this.OnResgameRestart({ data: "" });
    }
    OnResgameRestart(data2) {
      this.stepArr = [];
      this.stepMessArr = [];
      this.stepId = 1;
      this.gameId = data2.data.gameId;
      this.lastGame = [];
      this.lastScore = 0;
      EventMgr_default.call(EventDef.resetGame);
    }
    sendplay(x, y, id, score, color, blocks2) {
    }
    _sendplay(x, y, id, score, color, blocks2) {
      let send = {};
      for (let i = 0; i < blocks2.length; i++) {
        let data2 = blocks2[i];
        send[data2.index + ""] = data2.id + "," + data2.color;
      }
      this.sendHttp("play", { pos: { x, y, color }, shapeId: id, score, next: send }, false);
    }
    sendFirstStep() {
      if (!this.stepMessArr || this.stepMessArr.length == 0) {
        return;
      }
      let data2 = this.stepMessArr[0];
      this._sendplay(data2.x, data2.y, data2.id, data2.score, data2.color, data2.blocks);
    }
    //-1 没找到，-2index不对，-3解析step失败，-4下一步的骰子不对，-5step错误，-6db update失败-7score不对
    OnResplay(data2) {
      this.stepMessArr.splice(0, 1);
      if (this.stepMessArr.length > 0) {
        this.sendFirstStep();
      }
    }
    sendrank() {
      this.sendHttp("rank");
    }
    OnResrank(data2) {
      EventMgr_default.call(EventDef.showRank, data2.data);
    }
    onError(act, code, mess) {
      let type = 1;
      if (act == "initReq" && !this.hasInit) {
        type = 3;
      }
      if (code == 1) {
        TipsManager_default.showTips("Operation Failed", type, act);
      } else if (code == 2) {
      } else if (code == 8) {
        TipsManager_default.showTips("Version Mismatch", 2);
      } else if (code == 9) {
        TipsManager_default.showTips("Data Error 9", 1);
      } else if (code == 404) {
        TipsManager_default.showTips("Connection Timeout", 3);
      } else if (code == 500) {
        TipsManager_default.showTips("Unknown Error", 3);
      } else if (code == 999) {
        TipsManager_default.showTips("Network Unavailable", type, act);
      } else {
        if (act == "playReq") {
          TipsManager_default.showTips("Data Error " + mess, 1);
        } else {
          TipsManager_default.showTips("Data Error " + mess, 3, act);
        }
      }
      if (act == "initReq" && type == 3) {
        Laya.timer.clear(this, this.sendinit);
        Laya.timer.loop(3e3, this, this.sendinit);
      }
      super.onError(act, code, mess);
    }
  };
  var data = new MainModel();
  var MainModel_default = data;

  // src/Utils/StringUtils.ts
  var StringUtil = class {
    //带逗号字符串拆分成多个数字的列表
    static SplitToIntArr(str, split = ",") {
      let result = [];
      let strArr = str.split(split);
      for (let i = 0; i < strArr.length; i++) {
        result.push(parseInt(strArr[i]));
      }
      return result;
    }
    static UnSplit(arr, split = ",") {
      let result = "";
      for (let i = 0; i < arr.length; i++) {
        result += arr[i];
        if (i != arr.length - 1) {
          result += split;
        }
      }
      return result;
    }
    //每3位加个逗号的货币显示格式
    static FormatNumToStr(num) {
      let result = "";
      let str = num.toString();
      for (let i = 0; i < str.length; i++) {
        if ((str.length - i) % 3 == 0 && i != 0) {
          result += ",";
        }
        result += str[i];
      }
      return result;
    }
    static reverseString(s) {
      return s.split("").reverse().join("");
    }
    // --超过一定数量转换单位（k，m，b）
    // fixNum:保留小数点的位数
    // startNum:开始缩减写法的最小值,小于这个值就显示原值
    static GetNum2ShortString(value, fixNum = 2, startNum = 1e4) {
      let str = "";
      if (value == null)
        return str;
      let pre = "";
      if (value < 0) {
        value = -value;
        pre = "-";
      }
      if (value < startNum)
        return pre + this.toFixNoZero(value, 0) + "";
      if (value >= Math.pow(10, 9)) {
        let num = this.toFixNoZero(value / Math.pow(10, 9), fixNum);
        str = String(num) + "B";
      } else if (value >= Math.pow(10, 6)) {
        let num = this.toFixNoZero(value / Math.pow(10, 6), fixNum);
        str = String(num) + "M";
      } else if (value >= Math.pow(10, 3)) {
        let num = this.toFixNoZero(value / Math.pow(10, 3), fixNum);
        str = String(num) + "K";
      } else {
        str = String(value);
      }
      return pre + str;
    }
    static toFixNoZero(value, fixNum) {
      let pre = Math.pow(10, fixNum);
      let result = Math.floor(value * pre) / pre;
      return result;
    }
    //把{d}替换成后面的参数
    static fomatSamply(str, ...params) {
      str = str.replace(/{\d}/g, this.changeParms.bind(this, params));
      return str;
    }
    static changeParms(params, str) {
      let num = parseInt(str.substring(1, str.length - 1));
      return params[num];
    }
  };

  // src/Utils/Dictionary.ts
  var Dictionary = class {
    constructor() {
      this._dic = /* @__PURE__ */ new Map();
      // 使用 Map 代替 any 提供类型安全
      this._posDic = /* @__PURE__ */ new Map();
      // 用于存储每个键的索引位置
      this._keys = [];
      this._values = [];
      this._size = 0;
    }
    get keys() {
      return this._keys;
    }
    get values() {
      return this._values;
    }
    get size() {
      return this._size;
    }
    // 插入或更新键值对
    set(key, value) {
      if (this._dic.has(key)) {
        let pos = this._posDic.get(key);
        this._values[pos] = value;
      } else {
        this._dic.set(key, value);
        this._keys.push(key);
        this._values.push(value);
        this._posDic.set(key, this._size);
        this._size++;
      }
    }
    // 获取值
    get(key) {
      return this._dic.get(key);
    }
    // 删除键值对
    delete(key) {
      if (!this._dic.has(key)) {
        return;
      }
      let pos = this._posDic.get(key);
      let lastKey = this._keys[this._size - 1];
      let lastValue = this._values[this._size - 1];
      this._keys[pos] = lastKey;
      this._values[pos] = lastValue;
      this._posDic.set(lastKey, pos);
      this._keys.pop();
      this._values.pop();
      this._dic.delete(key);
      this._posDic.delete(key);
      this._size--;
    }
    // 清空字典
    clear() {
      this._dic.clear();
      this._posDic.clear();
      this._keys = [];
      this._values = [];
      this._size = 0;
    }
  };

  // src/Utils/MathUtil.ts
  var MathUtil = class {
    static clampf(value, min, max) {
      return Math.min(Math.max(value, min), max);
    }
    //包含头尾
    static rand(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    static randRange(min, max) {
      return Math.random() * (max - min) + min;
    }
    static rad(angle) {
      return angle * Math.PI / 180;
    }
    static deg(radian) {
      return radian * 180 / Math.PI;
    }
    static smooth(num1, num2, elapsedTime, responseTime) {
      if (elapsedTime <= 0)
        return num1;
      return num1 + (num2 - num1) * (elapsedTime / (elapsedTime + responseTime));
    }
    static getBitLength(num) {
      let count = 0;
      while (num > 0) {
        count++;
        num >>= 1;
      }
      return count;
    }
  };

  // src/Manager/ExlMgr.ts
  var ExlMgr = class {
    constructor() {
      this.maxWeight = 0;
    }
    //解析单个表数据json
    parseJson(tab) {
      this.tables = {};
      let tabObj = tab.data;
      for (let key in tabObj) {
        let table = new Dictionary();
        let datas = tabObj[key];
        let titles = datas[0];
        let values = datas.slice(1);
        for (let j = 0; j < values.length; j++) {
          let obj = {};
          for (let i = 0; i < titles.length; i++) {
            obj[titles[i]] = values[j][i];
          }
          table.set(values[j][0], obj);
        }
        this.tables[key] = table;
      }
      Laya.loader.clearRes(tab.url);
      this.initBlock();
    }
    initBlock() {
      this.blockArr = [];
      let tab = this.tables["Block"];
      this.maxWeight = 0;
      for (let vlaue of tab.values) {
        this.maxWeight += vlaue.Weight;
        this.blockArr.push(vlaue);
      }
    }
    getRandomBlocks() {
      let result = [];
      let randGroup = MathUtil.rand(0, this.maxWeight);
      let nowWeigth = 0;
      let idArr = [];
      let colorArr = [1, 2, 3, 4, 5, 6, 7];
      for (let i = 0; i < this.blockArr.length; i++) {
        nowWeigth += this.blockArr[i].Weight;
        if (nowWeigth >= randGroup) {
          idArr = this.parseToNumberArray(this.blockArr[i].Block);
          break;
        }
      }
      for (let i = 0; i < 3; i++) {
        let idIndex = MathUtil.rand(0, idArr.length - 1);
        let colorIndex = MathUtil.rand(0, colorArr.length - 1);
        result.push({ id: idArr[idIndex], color: colorArr[colorIndex] });
        idArr.splice(idIndex, 1);
        colorArr.splice(colorIndex, 1);
      }
      return result;
    }
    parseToNumberArrays(str) {
      let strArr = this.parseToStringArray(str, ";");
      let result = [];
      for (let i = 0; i < strArr.length; i++) {
        let addArr = this.parseToNumberArray(strArr[i]);
        result.push(addArr);
      }
      return result;
    }
    parseToNumberArray(str, symbol = ",") {
      str = str + "";
      return this.parseToStringArray(str, symbol).map(Number);
    }
    parseToStringArray(str, symbol = ",") {
      if (!str) {
        return [];
      }
      return str.split(symbol);
    }
    getExl(tabname) {
      return this.tables[tabname];
    }
    //用表名和id获取一行表数据
    getExlData(tabname, key) {
      let table = this.tables[tabname];
      if (!table) {
        return null;
      }
      return table.get(key);
    }
    //用表名和id和key获取某个表数据的值
    getExlValueByKey(tabname, key1, key2) {
      let data2 = this.getExlData(tabname, key1);
      if (!data2) {
        return null;
      }
      return data2[key2];
    }
    //用表名和key1和key2获取某个表数据的值
    getExlValueByKey2(tabname, key1, key2, value) {
      let datas = this.getExl(tabname).values;
      for (let i = 0; i < datas.length; i++) {
        if (datas[i][key1] == value) {
          return datas[i][key2];
        }
      }
      return null;
    }
    //获取此表的所有key
    getExlKeys(tabname) {
      let table = this.tables[tabname];
      if (!table) {
        return [];
      }
      return table.keys;
    }
    //用表名和id和key获取某个表数据的值
    getExlValuesByKeyValue(tabname, key, value) {
      let result = [];
      let datas = this.getExl(tabname).values;
      for (let i = 0; i < datas.length; i++) {
        if (datas[i][key] == value) {
          result.push(datas[i]);
        }
      }
      return result;
    }
  };
  var ExlMgr_default = new ExlMgr();

  // src/Utils/UiUtils.ts
  var UiUtils = class {
    //disable控件
    static setDisable(node, boo) {
      node.mouseEnabled = !boo;
      this.setDisableFilter(node, boo);
    }
    //光变暗,不禁点击
    static setDisableFilter(node, boo) {
      if (boo) {
        if (!this.darkFilter) {
          this.darkFilter = new Laya.ColorFilter();
          this.darkFilter.adjustBrightness(-40);
          this.darkFilter.adjustContrast(-20);
        }
        node.filters = [this.darkFilter];
      } else {
        node.filters = [];
      }
    }
    //设置皮肤方法,理论上全局皮肤都该用此方法设置
    static setSkin(img, name, atlas = "images") {
      if (img) {
        if (name) {
          img.skin = "atlas/" + atlas + "/" + name + ".png";
        } else {
          img.skin = "";
        }
      }
    }
    //打开宝箱 或 使用钥匙 对应的道具//1ticket 2银宝箱 3银钥匙 4银钥匙（token) 5金宝箱 6金钥匙
    static getType(type) {
      let type2 = 1;
      if (type == 2) {
        type2 = 3;
      } else if (type == 3 || type == 4) {
        type2 = 2;
      } else if (type == 5) {
        type2 = 6;
      } else if (type == 6) {
        type2 = 5;
      }
      return type2;
    }
    //宝箱 或 钥匙 对应的提示
    static getNum(type) {
      let type2 = 4;
      if (type == 2) {
        type2 = 1;
      } else if (type == 3 || type == 4) {
        type2 = 3;
      } else if (type == 5) {
        type2 = 0;
      } else if (type == 6) {
        type2 = 2;
      } else if (type == 7) {
        type2 = 5;
      }
      return type2;
    }
    //判断仓库是否是满的
    static CheckFull(list) {
      let maxNum = 7;
      let num = 0;
      for (let i = 0; i < list.length; i++) {
        if (list[i].id > 0) {
          num += 1;
        }
        if (list[i].exp) {
          maxNum += 1;
        }
      }
      if (num < maxNum) {
        return false;
      } else {
        return true;
      }
    }
    //仓库数据扩展到10个
    static setItemList(list) {
      let num = list.length;
      let num2 = 10 - num;
      let num3 = num - 3;
      let list1 = [];
      for (let i = 0; i < num3; i++) {
        list1.push(list[i]);
      }
      for (let i = 0; i < num2; i++) {
        let data2 = {};
        data2.id = 0;
        list1.push(data2);
      }
      for (let i = num3; i < num; i++) {
        list1.push(list[i]);
      }
      return list1;
    }
    //disable控件
    static setVisibleAndActive(node, boo) {
      node.visible = boo;
      node.active = boo;
    }
    static getSlotId(id) {
      let lineMaxIndex = ExlMgr_default.getExl(MainModel_default.nowExlName).size;
      let result = id % lineMaxIndex;
      if (result < 1) {
        result = lineMaxIndex + result;
      }
      return result;
    }
    static getSlotType(id, line) {
      let slotId = this.getSlotId(id);
      return ExlMgr_default.getExlValueByKey(MainModel_default.nowExlName, slotId, "Reels" + line);
    }
    static getSlotTypes(id, line) {
      let result = [];
      let preType = this.getSlotType(id - 1, line);
      let nowType = this.getSlotType(id, line);
      let nextType = this.getSlotType(id + 1, line);
      result.push(preType);
      result.push(nowType);
      result.push(nextType);
      return result;
    }
    //设置皮肤方法,理论上全局皮肤都该用此方法设置
    static setSpineSkin(img, name) {
      if (img) {
        if (name) {
          let sp = img.getComponent(Laya.Spine2DRenderNode);
          if (!sp) {
            sp = img.addComponent(Laya.Spine2DRenderNode);
          }
          sp.templet = Laya.loader.getRes("resources/Spine/" + name + ".json", Laya.Loader.SPINE);
          return sp;
        }
      }
      return null;
    }
    static playSpine(sp, name, complete = null, loop = false) {
      if (complete) {
        sp.owner.offAll(Laya.Event.STOPPED);
        sp.owner.once(Laya.Event.STOPPED, () => {
          complete.run();
        });
      }
      if (!sp.templet) {
        let tmp;
        let map = Laya.AssetDb.inst.uuidMap;
        let uuid = sp.source;
        if (uuid.startsWith("res://")) {
          uuid = uuid.substring(6);
        }
        for (let key in map) {
          if (map.hasOwnProperty(key)) {
            let value = map[key];
            if (value == uuid) {
              tmp = Laya.loader.getRes(Laya.URL.basePath + key, Laya.Loader.SPINE);
              break;
            }
          }
        }
        if (tmp) {
          sp["init"](tmp);
        }
      }
      sp.play(name, loop);
    }
    static playSpineTrack(spine2, name, track) {
      return spine2["_state"].setAnimation(track, name, false);
    }
    static replaceAttachment(spineNode, imgName, slotName, attachName) {
      let skeleton = spineNode.getSkeleton();
      let slot = skeleton.findSlot(slotName);
      let attach = skeleton.getAttachmentByName(slotName, attachName);
      let iconName = "atlas/images/" + imgName + ".png";
      Laya.loader.load(iconName, Laya.Handler.create(this, (texture) => {
        let region = attach.region;
        let newRegion = new spine.TextureAtlasRegion();
        let page = {};
        page["name"] = region.page.name;
        page["uWrap"] = region.page.uWrap;
        page["vWrap"] = region.page.vWrap;
        page["texture"] = {};
        page["texture"]["realTexture"] = texture.bitmap;
        page["width"] = region.page.width;
        page["height"] = region.page.height;
        newRegion["page"] = page;
        newRegion.x = texture.uv[0] * texture.bitmap.width;
        newRegion.y = texture.uv[1] * texture.bitmap.height;
        newRegion.u = texture.uv[0];
        newRegion.v = texture.uv[1];
        newRegion.u2 = texture.uv[4];
        newRegion.v2 = texture.uv[5];
        newRegion.width = texture.width * 2;
        newRegion.height = texture.height * 2;
        newRegion.originalWidth = texture.width * 2;
        newRegion.originalHeight = texture.height * 2;
        newRegion["texture"] = {};
        newRegion["texture"].realTexture = texture.bitmap;
        attach.width = newRegion.width;
        attach.height = newRegion.height;
        attach.setRegion(newRegion);
        attach.updateOffset();
        slot.setAttachment(attach);
      }));
    }
    static resetSpineBones(skeleton) {
      const bones = skeleton.bones;
      for (let i = 0; i < bones.length; i++) {
        bones[i].rotation = bones[i].data.rotation;
        bones[i].x = bones[i].data.x;
        bones[i].y = bones[i].data.y;
        bones[i].scaleX = bones[i].data.scaleX;
        bones[i].scaleY = bones[i].data.scaleY;
      }
    }
    static setVisibleAndActive2(node, boo) {
      node.owner.visible = boo;
      node.owner.active = boo;
    }
    static normalize(x, y) {
      let len = Math.sqrt(x * x + y * y);
      return [x / len, y / len];
    }
  };
  UiUtils.darkFilter = null;

  // src/Component/annBox.ts
  var { regClass: regClass5, property: property5 } = Laya;
  var annBox = class extends NodeBase {
    constructor() {
      super(...arguments);
      this.speed = 0.15;
      this.dur = 0;
      this.endX = 0;
      this.nowTime = 0;
      this.spaceTime = 6e4;
      this.waitSendStamp = 0;
      this.isPlay = false;
    }
    //组件被激活后执行，此时所有节点和组件均已创建完毕，此方法只执行一次
    onAwake() {
      super.onAwake();
      this.box = this.owner;
      this.annItem = this.box.getChildByName("annItem");
      this.head = this.annItem.getChildByName("head");
      this.back = this.annItem.getChildByName("back");
      this.lab = this.annItem.getChildByName("lab");
    }
    onEnable() {
      this.annList = [];
      this.addEvent("updateApns", this.onUpdateApns);
      this.addEvent("addApns", this.onAddApns);
      this.annList = [];
      this.waitSendStamp = 0;
      this.isPlay = false;
      this.getGameApns();
      this.timer.loop(3e4, this, this.checkAnn);
    }
    checkAnn() {
      if (this.waitSendStamp && Date.now() - this.waitSendStamp > this.spaceTime + 1e4) {
        this.getGameApns();
      }
    }
    onAddApns(data2) {
      if (!this.annList) {
        this.annList = [];
      }
      this.annList.splice(0, 0, data2);
      if (!this.isPlay) {
        this.showAnn();
      }
    }
    onUpdateApns(datas) {
      this.annList = datas;
      this.showAnn();
    }
    getGameApns() {
      MainModel_default.getGameApns();
    }
    showAnn() {
      this.isPlay = false;
      if (!this.annList || this.annList.length == 0) {
        this.waitSendStamp = Date.now();
        this.timer.once(this.spaceTime, this, this.getGameApns);
        return;
      }
      this.waitSendStamp = 0;
      this.annItem.x = 800;
      this.nowTime = 0;
      this.isPlay = true;
      let ann = this.annList.shift();
      if (ann.avatar) {
        this.head.skin = "";
        this.head.skin = ann.avatar;
      } else {
        UiUtils.setSkin(this.head, "header_default");
      }
      if (ann.self) {
        UiUtils.setSkin(this.back, "notice2");
      } else {
        UiUtils.setSkin(this.back, "notice1");
      }
      this.lab.setVar("nick", ann.nickname);
      this.lab.setVar("amount", StringUtil.FormatNumToStr(ann.amount));
      let timeSpace = Math.floor(Math.random() * 8e3) + 2e3;
      this.timer.once(timeSpace, this, this.startTween);
    }
    onUpdate() {
      if (this.nowTime) {
        this.annItem.x = Laya.MathUtil.lerp(800, this.endX, (Date.now() - this.nowTime) / this.dur);
      }
    }
    startTween() {
      this.annItem.x = 800;
      this.endX = -this.annItem.width - 50;
      this.dur = (800 - this.endX) / this.speed;
      this.nowTime = Date.now();
      this.timer.once(this.dur, this, this.showAnn);
    }
  };
  annBox = __decorateClass([
    regClass5("BotQAbpuTpGkSpcbNJnf4w")
  ], annBox);

  // src/Component/blocks.ts
  var { regClass: regClass6, property: property6 } = Laya;
  var blocks = class extends NodeBase {
    constructor() {
      super(...arguments);
      this.type = 0;
      this.color = 0;
      this.size = 83;
      this.w = 0;
      this.h = 0;
      this.smallScale = 0.4;
    }
    onAwake() {
      this.box = this.owner;
      this.touchBox = this.box.getComponent(TouchBox);
      this.blockList = this.box.getChildByName("blockList");
      this.blockList.renderHandler = new Laya.Handler(this, this.RenderBlock);
      this.touchBox.onDragStart = new Laya.Handler(this, this.onTouchStart);
      this.touchBox.onDragging = new Laya.Handler(this, this.onTouchMove);
      this.touchBox.onDragEnd = new Laya.Handler(this, this.onTouchEnd);
      this.startPos = [this.box.x, this.box.y];
      this.movePos = [this.box.x, this.box.y - 150];
      if (PlayerData_default.pow > 1.5) {
        this.smallScale = 0.4 * ((PlayerData_default.pow - 1) / 2 + 1);
        let add = (PlayerData_default.pow - 1) * 50;
        this.box.y = this.box.y + add;
        this.lightSpine.owner["y"] = this.lightSpine.owner["y"] + add;
        this.startPos = [this.box.x, this.box.y];
        this.movePos = [this.box.x, this.box.y - 150];
      }
    }
    onTouchStart() {
      this.box.x = this.movePos[0];
      this.box.y = this.movePos[1];
      this.changeState(2);
      SoundManager_default.playSound("BlockHold");
    }
    onTouchMove(x, y) {
      this.box.x = this.movePos[0] + x;
      this.box.y = this.movePos[1] + y * 1.5;
      EventMgr_default.call(EventDef.onBlockMoving, this);
    }
    onTouchEnd() {
      this.box.pos(this.startPos[0], this.startPos[1]);
      this.changeState(1);
      EventMgr_default.call(EventDef.onBlockEnd, this);
      SoundManager_default.playSound("BlockSet");
    }
    RenderBlock(cell, index) {
      cell.visible = cell.dataSource;
      UiUtils.setSkin(cell, "game_" + (5 + this.color));
    }
    setData(type, color) {
      this.box.visible = true;
      this.color = color;
      this.type = type;
      let exlData = ExlMgr_default.getExlData("BlockType", type);
      let strs = ExlMgr_default.parseToStringArray(exlData.Data + "");
      this.h = strs.length;
      this.w = strs[0].length;
      this.blockList.repeatX = this.w;
      this.blockList.repeatY = this.h;
      this.blockList.width = this.size * this.w;
      this.blockList.height = this.size * this.h;
      this.datas = [];
      let listDatas = [];
      this.shape = [];
      for (let i = 0; i < this.h; i++) {
        this.datas.push([]);
        let str = strs[i];
        this.shape.push(parseInt(StringUtil.reverseString(str), 2));
        for (let j = 0; j < str.length; j++) {
          let num = Number(str[j]);
          this.datas[i].push(num);
          listDatas.push(num);
        }
      }
      this.blockList.dataSource = listDatas;
      this.tweenDisplay();
    }
    tweenDisplay() {
      this.blockList.scale(0.3, 0.3);
      this.blockList.alpha = 0.5;
      this.TweenTo(this.blockList, { scaleX: this.smallScale, scaleY: this.smallScale, alpha: 1 }, 200);
      this.timer.once(100, this, this.playLightSpine);
    }
    playLightSpine() {
      if (this.lightSpine) {
        this.lightSpine.owner["visible"] = true;
        this.lightSpine.owner["alpha"] = 1;
        UiUtils.playSpine(this.lightSpine, 0);
        this.timer.once(400, this, this.onLightSpineComplete);
      }
    }
    onLightSpineComplete() {
      if (this.lightSpine) {
        this.TweenTo(this.lightSpine.owner, { alpha: 0 }, 100);
      }
    }
    //1 小  2 大
    changeState(state) {
      if (state == 1) {
        this.blockList.scale(this.smallScale, this.smallScale);
      } else {
        this.blockList.scale(1, 1);
      }
    }
    hideLight() {
      this.lightSpine.owner["visible"] = false;
    }
  };
  __decorateClass([
    property6({ type: Laya.Spine2DRenderNode })
  ], blocks.prototype, "lightSpine", 2);
  blocks = __decorateClass([
    regClass6("4K4W4uWLRNC9KhNsNqVxLQ")
  ], blocks);

  // src/Component/clipWord.ts
  var { regClass: regClass7, property: property7 } = Laya;
  var ClipWord = class extends NodeBase {
    constructor() {
      super(...arguments);
      this.space = 0;
      this.showData = "";
    }
    //组件被激活后执行，此时所有节点和组件均已创建完毕，此方法只执行一次
    onAwake() {
      super.onAwake();
      this.box = this.owner;
      this.clipTmp.visible = false;
      this.clipPool = new CommonPool(new Laya.Handler(this, this.createClip));
    }
    createClip() {
      let clip = new Laya.Clip();
      this.box.addChild(clip);
      clip.width = this.clipTmp.width;
      clip.height = this.clipTmp.height;
      clip.skin = this.clipTmp.skin;
      clip.clipX = this.clipTmp.clipX;
      clip.clipY = this.clipTmp.clipY;
      clip.autoPlay = false;
      clip.centerY = 0;
      return clip;
    }
    onPutClip(obj) {
      obj.visible = false;
    }
    //设置文字
    set text(num) {
      this.showData = num + "";
      this.setNumStr(this.showData);
    }
    //设置文字,图片名和文字一一对应,标点符号单独处理
    setNumStr(str) {
      if (!str) {
        this.box.visible = false;
        return;
      } else {
        this.box.visible = true;
      }
      this.box.width = this.clipTmp.width * str.length + this.space * (str.length - 1);
      this.clipPool.resetUsings(new Laya.Handler(this, this.onPutClip));
      for (let i = 0; i < str.length; i++) {
        let clip = this.clipPool.take();
        clip.visible = true;
        let num = Number(str[i]);
        clip.index = num;
        clip.x = (this.clipTmp.width + this.space) * i;
      }
    }
  };
  __decorateClass([
    property7({ type: Number })
  ], ClipWord.prototype, "space", 2);
  __decorateClass([
    property7({ type: Laya.Clip })
  ], ClipWord.prototype, "clipTmp", 2);
  ClipWord = __decorateClass([
    regClass7("E7P29h05TPGCsIy3jNfmMg")
  ], ClipWord);

  // src/Platform/PlatformMgr.ts
  var PlatformMgr = class {
    init() {
      window["rechargeSuccess"] = this.onRechargeSuccess;
      window["music"] = this.onSoundStateChange;
      window.addEventListener("resize", this.onResizeChanged.bind(this));
      Laya.Browser.window.addEventListener("message", this.onEventBack.bind(this));
    }
    onEventBack(event) {
      let eventData = event.data;
      if (eventData == "rechargeSuccess") {
        this.onRechargeSuccess();
      }
    }
    onResizeChanged() {
      var width = window.innerWidth;
      var height = window.innerHeight;
      if (width == 1 && height == 1) {
        Laya.stage.event(Laya.Event.BLUR);
        this.evokeChangeBtnShow(false);
      } else {
        Laya.stage.event(Laya.Event.FOCUS);
        if (MainModel_default.hasInit && !UIMgr.inst.isShowing("loadingView" /* loadingView */)) {
          this.evokeChangeBtnShow(false);
        } else {
          this.evokeChangeBtnShow(true);
        }
      }
    }
    /**
     * 开关音乐接口
     */
    onSoundStateChange(data2) {
    }
    /**充值成功 */
    onRechargeSuccess() {
      EventMgr_default.call(EventDef.onRechargeSuccess);
    }
    //发平台消息
    evoke(messName, data2 = null) {
      if (data2 == null) {
        data2 = {};
      }
      let json = {
        url: "/evoke/" + messName,
        data: data2
      };
      if (PlayerData_default.child) {
        Laya.Browser.window.parent.postMessage(JSON.stringify(json), "*");
        return;
      }
      if (window["cocoAndroid"]) {
        if (window["cocoAndroid"]["gameCallBack"]) {
          window["cocoAndroid"]["gameCallBack"](JSON.stringify(json));
        }
      } else if (window["webkit"]) {
        window["webkit"]["messageHandlers"]["nativeCallback"].postMessage(JSON.stringify(json));
      } else {
        console.log(json);
      }
    }
    /**
     * 唤起充值界面
     */
    evokeRecharge() {
      this.evoke("recharge");
    }
    /**
    * 关闭游戏
    */
    evokeClose() {
      this.evoke("close");
    }
    evokeChangeBtnShow(show) {
      if (show) {
        if (window.innerWidth > 10 && window.innerHeight > 10) {
          this.evoke("changeBtnShow", true);
        }
      } else {
        this.evoke("changeBtnShow", false);
      }
    }
  };
  var PlatformMgr_default = new PlatformMgr();

  // src/Component/tweenNum.ts
  var { regClass: regClass8, property: property8 } = Laya;
  var TweenNum = class extends NodeBase {
    constructor() {
      super(...arguments);
      this.tweenType = 1;
      this.format = 0;
      this.trunTime = 1e3;
      this.needSound = false;
      this.needMul = false;
      this.runTimes = 0;
      this.currentGold = 0;
      // 当前金币数
      this.targetGold = 0;
      // 目标金币数
      this.speed = 1;
      // 增长速度
      this.needEffect = false;
      this.curNum = 0;
    }
    //组件被激活后执行，此时所有节点和组件均已创建完毕，此方法只执行一次
    onAwake() {
      super.onAwake();
      this.num = this.owner;
      if (this.num instanceof Laya.Label == false) {
        this.clip = this.num.getComponent(ClipWord);
      }
    }
    onDisable() {
      super.onDisable();
      this.stop();
    }
    stop() {
      if (this.needSound) {
        SoundManager_default.stopSound("fx-count-up");
      }
      this.timer.clearAll(this);
      Laya.Tween.clearAll(this.num);
      this.num.scale(1, 1);
      this.currentGold = 0;
      this.speed = 0;
      this.targetGold = 0;
      this.completeHandle = null;
    }
    /**加钱特效 */
    playTween(orgNum, targetNum, completeHandle = null) {
      if (!this.needMul && targetNum <= orgNum) {
        this.setNumShow(targetNum);
        if (completeHandle) {
          completeHandle.run();
        }
        return;
      }
      this.runTimes = Math.ceil(this.trunTime / 30);
      this.stop();
      this.setNumShow(orgNum);
      this.completeHandle = completeHandle;
      this.targetGold = targetNum;
      this.currentGold = orgNum;
      this.needEffect = false;
      if ((targetNum - orgNum) / this.trunTime >= 0.01) {
        this.needEffect = true;
      }
      if (this.needSound) {
        SoundManager_default.playSound("fx-count-up", null, 0);
      }
      if (this.tweenType == 2 || this.tweenType == 3) {
        this.num.scale(0.5, 0.5);
        Laya.Tween.to(this.num, { scaleX: 1.2, scaleY: 1.2 }, 200, Laya.Ease.quadIn);
      }
      this.speed = (targetNum - orgNum) / this.runTimes;
      this.timer.loop(30, this, this.updateGold);
    }
    playMultiplierTween(score, completeHandle = null) {
      this.setNumShow(score);
      this.num.scale(1, 1);
      Laya.Tween.to(this.num, { scaleX: 0.2, scaleY: 0.2 }, 200, Laya.Ease.quadIn, Laya.Handler.create(this, () => {
        if (this.needSound) {
          SoundManager_default.playSound("fx-multiplier-x3");
        }
        Laya.Tween.to(this.num, { scaleX: 1.5, scaleY: 1.5 }, 400, Laya.Ease.quadIn, Laya.Handler.create(this, () => {
          SoundManager_default.playSound("fx-win-normal");
          if (completeHandle) {
            this.timer.once(200, this, () => {
              completeHandle.run();
            });
          }
        }));
      }));
    }
    //设置文字显示
    setNumShow(num) {
      this.curNum = num;
      let lab = this.clip ? this.clip : this.num;
      num = Math.floor(num);
      if (this.format == 0) {
        lab["text"] = num.toFixed();
      } else if (this.format == 1) {
        lab["text"] = StringUtil.FormatNumToStr(num);
      }
    }
    //缓动停止后的处理
    TweenComplete() {
      this.setNumShow(this.targetGold);
      if (this.completeHandle) {
        this.completeHandle.run();
      }
      this.stop();
    }
    tweenEffect() {
      if (this.tweenType == 3 && this.needEffect) {
        Laya.Tween.to(this.num, { scaleX: 1.4, scaleY: 1.4 }, 100, Laya.Ease.sineOut, Laya.Handler.create(this, () => {
          Laya.Tween.to(this.num, { scaleX: 1.2, scaleY: 1.2 }, 100, Laya.Ease.sineIn);
        }));
      }
    }
    // 抖动效果
    startShakeEffect() {
      let shakeDuration = this.trunTime;
      let shakeAmplitude = 5;
      let shakeTimes = Math.floor(shakeDuration / 50);
      for (let i = 0; i < shakeTimes; i++) {
        this.timer.once(i * 50, this, () => {
          let offsetX = (Math.random() - 0.5) * shakeAmplitude * 2;
          let offsetY = (Math.random() - 0.5) * shakeAmplitude * 2;
          this.num.centerX = offsetX;
          this.num.centerY = offsetY;
        });
      }
      this.timer.once(shakeTimes * 50, this, () => {
        this.num.centerX = 0;
        this.num.centerY = 0;
      });
    }
    judgeTarget() {
      if (this.needMul) {
        return Math.abs(this.currentGold - this.targetGold) < Math.abs(this.speed);
      } else {
        return this.currentGold >= this.targetGold;
      }
    }
    // 更新金币数字
    updateGold() {
      if (!this.judgeTarget()) {
        this.currentGold += this.speed;
        if (!this.needMul && this.currentGold > this.targetGold) {
          this.currentGold = this.targetGold;
        }
        this.setNumShow(this.currentGold);
        this.tweenEffect();
      } else {
        if (this.needSound) {
          SoundManager_default.stopSound("fx-count-up");
          SoundManager_default.playSound("fx-count-up-end");
        }
        this.timer.clearAll(this);
        Laya.Tween.clearAll(this.num);
        if (this.tweenType == 2 || this.tweenType == 3) {
          this.setNumShow(this.targetGold);
          Laya.Tween.to(this.num, { scaleX: 0.5, scaleY: 0.5 }, 300, Laya.Ease.linearIn, Laya.Handler.create(this, () => {
            Laya.Tween.to(this.num, { scaleX: 1, scaleY: 1 }, 300, Laya.Ease.bounceOut, Laya.Handler.create(this, this.TweenComplete));
          }));
        } else {
          this.TweenComplete();
        }
      }
    }
  };
  __decorateClass([
    property8({ type: Number, tips: "1只有数字变化的动画 2数字变化加放大缩小 3数字抖动最后闪烁" })
  ], TweenNum.prototype, "tweenType", 2);
  __decorateClass([
    property8({ type: Number, tips: "0 正常显示 1 用逗号隔开" })
  ], TweenNum.prototype, "format", 2);
  __decorateClass([
    property8({ type: Number, tips: "缓动时间(毫秒)" })
  ], TweenNum.prototype, "trunTime", 2);
  __decorateClass([
    property8({ type: Boolean, tips: "是否播放声音" })
  ], TweenNum.prototype, "needSound", 2);
  __decorateClass([
    property8({ type: Boolean, tips: "是否支持减少缓动" })
  ], TweenNum.prototype, "needMul", 2);
  TweenNum = __decorateClass([
    regClass8("vIJNaNAeTeqCNGD9tSvOMQ")
  ], TweenNum);

  // src/Component/coinBox.ts
  var { regClass: regClass9, property: property9 } = Laya;
  var CoinBox = class extends NodeBase {
    constructor() {
      super(...arguments);
      this.auto = false;
      this.format = 0;
      this.coinType = 0;
      this.numValue = 0;
    }
    //组件被激活后执行，此时所有节点和组件均已创建完毕，此方法只执行一次
    onAwake() {
      super.onAwake();
      this.num = this.owner.getChildByName("num");
      this.tweenNum = this.num.getComponent(TweenNum);
      if (this.addBtn) {
        this.addClick(this.addBtn, new Laya.Handler(this, this.onClickAddBtn));
      }
    }
    onClickAddBtn() {
      if (this.coinType == 0) {
        UIMgr.inst.open("buyStarView" /* buyStarView */);
      } else {
        PlatformMgr_default.evokeRecharge();
      }
    }
    //组件被启用后执行，例如节点被添加到舞台后
    onEnable() {
      if (this.auto) {
        this.addEvent(EventDef.coinUpdate, this.onUpdateCoin);
        this.updateCoin();
      }
    }
    //设置货币数量,tween为true则让TweenNum组件播放货币增加缓动
    setCoinNum(num, tween = false) {
      if (tween && this.numValue < num) {
        this.tweenNum.playTween(this.numValue, num);
        this.numValue = num;
      } else {
        this.setNumShow(num);
      }
    }
    onUpdateCoin(tween, target) {
      if (this.auto) {
        if (tween) {
          this.tweenNum.playTween(this.numValue, target);
          this.numValue = target;
        } else {
          this.setCoinNum(target);
        }
      }
    }
    //设置货币显示
    setNumShow(num) {
      this.numValue = num;
      if (this.format == 0) {
        this.num.text = num.toString();
      } else if (this.format == 1) {
        this.num.text = StringUtil.FormatNumToStr(num);
      }
    }
    //auto为true时自动监听coin的变动
    updateCoin() {
    }
  };
  __decorateClass([
    property9({ type: Boolean })
  ], CoinBox.prototype, "auto", 2);
  __decorateClass([
    property9({ type: Number, tips: "0 正常显示 1 用逗号隔开" })
  ], CoinBox.prototype, "format", 2);
  __decorateClass([
    property9({ type: Number, tips: "0 星星 1 token" })
  ], CoinBox.prototype, "coinType", 2);
  __decorateClass([
    property9({ type: Laya.Box })
  ], CoinBox.prototype, "addBtn", 2);
  CoinBox = __decorateClass([
    regClass9("13H1JExIRw2MznY7d4wA7Q")
  ], CoinBox);

  // src/Component/hallScale.ts
  var { regClass: regClass10, property: property10 } = Laya;
  var hallScale = class extends NodeBase {
    constructor() {
      super(...arguments);
      this.squareScale = 1;
      this.rectScale = 1;
    }
    //组件被激活后执行，此时所有节点和组件均已创建完毕，此方法只执行一次
    onAwake() {
      super.onAwake();
      let scale = PlayerData_default.hall ? this.squareScale : this.rectScale;
      this.owner["scale"](scale, scale);
    }
  };
  __decorateClass([
    property10({ type: Number, tips: "方形屏的缩放" })
  ], hallScale.prototype, "squareScale", 2);
  __decorateClass([
    property10({ type: Number, tips: "竖屏的缩放" })
  ], hallScale.prototype, "rectScale", 2);
  hallScale = __decorateClass([
    regClass10("Mse7zTMnRIyeeva5iip3lw")
  ], hallScale);

  // src/Component/rankBox.ts
  var { regClass: regClass11, property: property11 } = Laya;
  var RankBox = class extends NodeBase {
    constructor() {
      super(...arguments);
      this.rankStrs = [];
      this.value = 0;
    }
    //组件被激活后执行，此时所有节点和组件均已创建完毕，此方法只执行一次
    onAwake() {
      super.onAwake();
      this.icon = this.owner.getChildByName("icon");
      this.rank = this.owner.getChildByName("rank");
    }
    //设置名次
    setRank(rank) {
      this.icon.visible = false;
      this.rank.visible = false;
      if (rank > this.rankStrs.length) {
        this.rank.visible = true;
        if (rank > 100) {
          this.rank.text = "Not\nRanked";
        } else {
          this.rank.text = rank.toString();
        }
      } else {
        this.icon.visible = true;
        UiUtils.setSkin(this.icon, this.rankStrs[rank - 1]);
      }
    }
  };
  __decorateClass([
    property11({ type: [String] })
  ], RankBox.prototype, "rankStrs", 2);
  RankBox = __decorateClass([
    regClass11("TcMYI2r8Slq2Ct1iqVygYw")
  ], RankBox);

  // src/Component/resizeBox.ts
  var { regClass: regClass12, property: property12 } = Laya;
  var ResizeBox = class extends NodeBase {
    constructor() {
      super(...arguments);
      this.space = 0;
    }
    //组件被激活后执行，此时所有节点和组件均已创建完毕，此方法只执行一次
    onAwake() {
      super.onAwake();
      this.box = this.owner;
      if (!this.childArr) {
        this.childArr = [];
        for (let i = 0; i < this.box.numChildren; i++) {
          let node = this.box.getChildAt(i);
          this.childArr.push(node);
        }
      }
      for (let i = 0; i < this.childArr.length; i++) {
        this.childArr[i].on(Laya.Event.RESIZE, this, this.onIconResize);
      }
    }
    //监听文字大小变化
    onIconResize() {
      Laya.timer.callLater(this, this.resizeIcon);
    }
    //监听大小变化
    resizeIcon() {
      if (!this.childArr || this.childArr.length == 0) {
        return;
      }
      let pos = 0;
      for (let i = 0; i < this.childArr.length; i++) {
        if (this.childArr[i].visible) {
          this.childArr[i].x = pos;
          pos += this.childArr[i].displayWidth + this.space;
          this.childArr[i].freshLayout();
        }
      }
      this.box.width = pos - this.space;
    }
  };
  __decorateClass([
    property12({ type: Number })
  ], ResizeBox.prototype, "space", 2);
  __decorateClass([
    property12({ type: [Laya.UIComponent] })
  ], ResizeBox.prototype, "childArr", 2);
  ResizeBox = __decorateClass([
    regClass12("nDc8CORcTHC2hQGuupwRNA")
  ], ResizeBox);

  // src/Component/spineNode.ts
  var { regClass: regClass13, property: property13 } = Laya;
  var SpineNode = class extends NodeBase {
    constructor() {
      super(...arguments);
      this.usePos = false;
      this.alwaysFindSlot = false;
      this.stopFindSlot = false;
      this.clearOrg = false;
      this.hasInit = false;
    }
    //组件被激活后执行，此时所有节点和组件均已创建完毕，此方法只执行一次
    onAwake() {
      super.onAwake();
      this.box = this.owner;
      this.orgParam = { centerX: this.box.centerX | 0, centerY: this.box.centerY | 0, scaleX: this.box.scaleX, scaleY: this.box.scaleY, alpha: this.box.alpha };
    }
    initSpine() {
      if (this.hasInit) {
        return;
      }
      this.skeleton = this.spineNode.getComponent(Laya.Spine2DRenderNode);
      this._resetBindSlot(this.slotName);
    }
    _resetBindSlot(slotName) {
      this.slotName = slotName;
      if (this.skeleton && slotName && this.skeleton.getSkeleton()) {
        this.slot = this.skeleton.getSlotByName(slotName);
        this.hasInit = true;
        if (this.clearOrg) {
          this.orgParam.centerY = 0;
        }
      }
    }
    resetBindSlot(slotName) {
      this._resetBindSlot(slotName);
      this.onUpdate();
    }
    onEnable() {
      this.initSpine();
    }
    changeParam(key, value) {
      this.orgParam[key] = value;
    }
    onUpdate() {
      this.initSpine();
      if (!this.skeleton || !this.stopFindSlot && this.skeleton.playState != Laya.Spine2DRenderNode.PLAYING || !this.skeleton.owner["visible"]) {
        return;
      }
      if (!this.slot && this.alwaysFindSlot) {
        this.hasInit = false;
        this.initSpine();
      }
      if (this.slot) {
        if (!this.slot.attachment) {
          this.box.alpha = 0;
          return;
        }
        if (this.alwaysFindSlot && this.slotName) {
          this.slot = this.skeleton.getSlotByName(this.slotName);
        }
        if (this.usePos) {
          this.box.x = this.slot.bone.worldX;
          this.box.y = -this.slot.bone.worldY;
        } else {
          if (!this.slot || !this.slot.bone) {
            return;
          }
          this.box.centerX = this.slot.bone.worldX + this.orgParam.centerX;
          this.box.centerY = -this.slot.bone.worldY + this.orgParam.centerY;
        }
        this.box.scaleX = this.slot.bone.getWorldScaleX() * this.orgParam.scaleX;
        this.box.scaleY = this.slot.bone.getWorldScaleY() * this.orgParam.scaleY;
        this.box.alpha = this.slot.color.a * this.orgParam.alpha;
      }
    }
  };
  __decorateClass([
    property13({ type: Laya.Sprite })
  ], SpineNode.prototype, "spineNode", 2);
  __decorateClass([
    property13({ type: String })
  ], SpineNode.prototype, "slotName", 2);
  __decorateClass([
    property13({ type: Boolean, tips: "true:使用世界坐标  false:使用centerX centerY" })
  ], SpineNode.prototype, "usePos", 2);
  __decorateClass([
    property13({ type: Boolean, tips: "是否每帧重新寻找slot,用来处理一些特殊情况" })
  ], SpineNode.prototype, "alwaysFindSlot", 2);
  __decorateClass([
    property13({ type: Boolean, tips: "是否动画停止时也寻找" })
  ], SpineNode.prototype, "stopFindSlot", 2);
  __decorateClass([
    property13({ type: Boolean, tips: "是否在成功init后清空orgParam" })
  ], SpineNode.prototype, "clearOrg", 2);
  SpineNode = __decorateClass([
    regClass13("0gk5H6lvQDCCgBlM5_zZIQ")
  ], SpineNode);

  // src/Component/winBox.ts
  var { regClass: regClass14, property: property14 } = Laya;
  var WinBox = class extends NodeBase {
    constructor() {
      super(...arguments);
      this.boomSpineNames = ["", "ClearGreen", "ClearPurple", "ClearOrange", "ClearRed", "ClearBlue", "ClearCyan", "ClearYellow"];
      this.tileSize = 83;
    }
    onAwake() {
      this.boomSpinePool = new CommonPool(new Laya.Handler(this, this.createBoomSpine));
    }
    onEnable() {
      super.onEnable();
      this.addEvent(EventDef.playBoomSpine, this.playBoomSpine);
    }
    //dir 0 横 1 竖 
    playBoomSpine(pos, dir, color) {
      let spNode = this.boomSpinePool.take();
      spNode.visible = true;
      let sp = UiUtils.setSpineSkin(spNode, this.boomSpineNames[color]);
      if (dir == 0) {
        spNode.rotation = 90;
        spNode.centerX = 0;
        spNode.y = this.tileSize / 2 + this.tileSize * pos;
      } else {
        spNode.rotation = 0;
        spNode.centerY = 0;
        spNode.x = this.tileSize / 2 + this.tileSize * pos;
      }
      UiUtils.playSpine(sp, 0);
      this.timer.once(500, this, this.BoomComplete, [spNode], false);
    }
    BoomComplete(spNode) {
      spNode.visible = false;
    }
    createBoomSpine() {
      let spineNode = new Laya.Box();
      spineNode.width = 1;
      spineNode.height = 1;
      spineNode.anchorX = 0.5;
      spineNode.anchorY = 0.5;
      this.boomBox.addChild(spineNode);
      spineNode.addComponent(Laya.Spine2DRenderNode);
      return spineNode;
    }
  };
  __decorateClass([
    property14({ type: Laya.Box })
  ], WinBox.prototype, "boomBox", 2);
  WinBox = __decorateClass([
    regClass14("2Q1bnPciQxWdNU_L6rP6QA")
  ], WinBox);

  // src/UI/DailyTaskViewUI.ts
  var { regClass: regClass15, property: property15 } = Laya;
  var DailyTaskViewUI = class extends UIBase {
    get ui() {
      return this._ui;
    }
    onInit() {
      this.ui.mainList.renderHandler = new Laya.Handler(this, this.onMainRender);
      this.ui.mainList.mouseHandler = new Laya.Handler(this, this.onMainMouse);
      if (PlayerData_default.hall == 0) {
        this.scaleBox.height = 1e3;
      }
    }
    onOpened(param) {
      this.addEvent(EventDef.updateTaskList, this.updateTask);
      this.ui.mainList.dataSource = MainModel_default.taskList;
      this.ui.mainList.scrollTo(0);
    }
    updateTask() {
      this.ui.mainList.refresh();
    }
    onMainMouse(e, index) {
      if (e.type != Laya.Event.CLICK || e.target.name != "getBtn") {
        return;
      }
      let id = MainModel_default.taskList[index];
      let data2 = ExlMgr_default.getExlData("Tasks", id);
      let rewardData = ExlMgr_default.getExlData("Reward", data2.Reward);
      MainModel_default.getReward(id, rewardData.Type);
    }
    //列表渲染
    onMainRender(cell, index) {
      let proBox = cell.getChildByName("proBox");
      let reward = cell.getChildByName("reward");
      let title = cell.getChildByName("title");
      let completeLab = cell.getChildByName("completeLab");
      let getBtn = cell.getChildByName("getBtn");
      let completeIcon = cell.getChildByName("completeIcon");
      let back = cell.getChildByName("back");
      let pro = proBox.getChildByName("pro");
      let proLab = proBox.getChildByName("proLab");
      let data2 = ExlMgr_default.getExlData("Tasks", cell.dataSource);
      let rewardData = ExlMgr_default.getExlData("Reward", data2.Reward);
      let proValue = MainModel_default.getTaskPro(rewardData.Type);
      let maxValue = rewardData.Reach;
      completeIcon.visible = false;
      completeLab.visible = false;
      proBox.visible = false;
      getBtn.visible = false;
      title.text = data2.Text;
      reward.text = "+" + rewardData.Reward;
      back.visible = index < MainModel_default.taskList.length - 1;
      if (MainModel_default.completeTaskList.indexOf(cell.dataSource) >= 0) {
        completeIcon.visible = true;
        completeLab.visible = true;
        return;
      }
      proBox.visible = true;
      if (proValue >= maxValue) {
        getBtn.visible = true;
        pro.width = 222;
        proLab.text = maxValue + " / " + maxValue;
      } else {
        pro.width = proValue / maxValue * 222;
        proLab.text = proValue + " / " + maxValue;
      }
    }
  };
  DailyTaskViewUI = __decorateClass([
    regClass15("bRJEIqTRTRet1C7tPyr1oQ")
  ], DailyTaskViewUI);

  // src/UI/FreeWinViewUI.ts
  var { regClass: regClass16, property: property16 } = Laya;
  var FreeWinViewUI = class extends UIBase {
    get ui() {
      return this._ui;
    }
    onInit() {
      this.addClick(this.ui.homeBtn, new Laya.Handler(this, this.onHome));
      this.addClick(this.ui.resetBtn, new Laya.Handler(this, this.onGameReset));
      this.addClick(this.ui.soundBtn, new Laya.Handler(this, this.onSound));
      this.addClick(this.ui.musicBtn, new Laya.Handler(this, this.onMusic));
      this.addClick(this.ui.exitBtn, new Laya.Handler(this, this.onExit));
    }
    onExit() {
      PlatformMgr_default.evokeClose();
      this.close();
    }
    onOpened(param) {
      if (param.state == 1) {
        this.ui.bottomBox.visible = false;
        this.ui.exitBtn.visible = true;
      } else {
        this.ui.bottomBox.visible = true;
        this.ui.exitBtn.visible = false;
      }
      this.updateShow();
    }
    onHome() {
      UIMgr.inst.close("gameView" /* gameView */);
      UIMgr.inst.close("gameView2" /* gameView2 */);
      UIMgr.inst.openStartView();
      this.close();
    }
    onGameReset() {
      MainModel_default.resetGame();
      this.close();
    }
    onSound() {
      SoundManager_default.SoundOpen = !SoundManager_default.SoundOpen;
      this.sendSound();
      this.updateShow();
    }
    onMusic() {
      SoundManager_default.MusicOpen = !SoundManager_default.MusicOpen;
      this.sendSound();
      this.updateShow();
    }
    sendSound() {
      MainModel_default.sendSound(SoundManager_default.MusicOpen, SoundManager_default.SoundOpen);
    }
    updateShow() {
      UiUtils.setSkin(this.ui.soundBtn, SoundManager_default.SoundOpen ? "game_210" : "game_211");
      UiUtils.setSkin(this.ui.musicBtn, SoundManager_default.MusicOpen ? "game_210" : "game_211");
    }
  };
  FreeWinViewUI = __decorateClass([
    regClass16("KrSuBsagTFG1i5ooCMkisw")
  ], FreeWinViewUI);

  // src/UI/GameOverViewUI.ts
  var { regClass: regClass17, property: property17 } = Laya;
  var GameOverViewUI = class extends UIBase {
    get ui() {
      return this._ui;
    }
    onInit() {
      this.addClick(this.ui.restartBtn, new Laya.Handler(this, this.onRestart));
    }
    onOpened(param) {
      SoundManager_default.playSound("Switch");
      this.addEvent(EventDef.onStartGame, this.close);
      this.ui.score.text = param + "";
      this.ui.best.text = MainModel_default.bestScore + "";
      WaitMgr_default.closeWait("dead");
    }
    onRestart() {
      MainModel_default.sendgameStart();
    }
    onClosed() {
      SoundManager_default.playMusic();
    }
  };
  GameOverViewUI = __decorateClass([
    regClass17("ztx8UsJtRZarcfNj42QZLg")
  ], GameOverViewUI);

  // src/UI/GameViewUI.ts
  var { regClass: regClass18, property: property18 } = Laya;
  var GameViewUI = class extends UIBase {
    constructor() {
      super(...arguments);
      this.ROWS = 8;
      this.COLS = 8;
      this.FULL_ROW_MASK = (1 << this.COLS) - 1;
      this.FULL_COL_MASK = (1 << this.ROWS) - 1;
      this.blockSize = 83;
      this.tmpPos = [];
      this.combNum = -1;
      this.combStep = 0;
      this.score = 0;
      this.nowScore = 0;
      this.nowColor = 0;
      this.scoreAni = ["Good", "Great", "Excellent", "Amazing", "Unbelievable"];
      this.scoreAniName = ["", "green", "purple", "orange", "red", "blue", "cyan", "yellow"];
    }
    get ui() {
      return this._ui;
    }
    onInit() {
      this.scoreTween = this.ui.score.getComponent(TweenNum);
      this.addClick(this.ui.settingBtn, new Laya.Handler(this, this.onSetting));
      this.blockPool = new CommonPool(new Laya.Handler(this, this.createBlock));
      this.blockArr = [];
      for (let i = 0; i < 3; i++) {
        this.blockArr.push(this.ui["block" + i].getComponent(blocks));
      }
      this.combClip = this.ui.combClip.getComponent(ClipWord);
      this.scoreClip = this.ui.scoreClip.getComponent(ClipWord);
      this.scoreSp = this.ui.scoreSp.getComponent(Laya.Spine2DRenderNode);
      this.ui.ver.text = Config.version;
      if (PlayerData_default.hall) {
        this.ui.topBox.scale(0.7, 0.7);
        this.ui.mainBox.scale(0.7, 0.7);
      }
    }
    onSetting() {
      UIMgr.inst.open("FreeWinView" /* FreeWinView */, { state: 2 });
    }
    set Score(value) {
      this.score = value;
      this.ui.score.text = value + "";
      this.updateBest();
    }
    updateBest() {
      if (this.score > MainModel_default.bestScore) {
        MainModel_default.bestScore = this.score;
        LocalMgr_default.best = this.score;
      }
      this.ui.best.text = MainModel_default.bestScore + "";
    }
    createBlock() {
      let block = new Laya.Image();
      block.width = 83;
      block.height = 83;
      this.ui.main.addChild(block);
      return block;
    }
    setCell(x, y, colorId) {
      this._setCell(x, y, colorId);
      this.updateBlockByDatas();
    }
    _setCell(x, y, colorId) {
      if (colorId == 0) {
        this.rowMask[y] &= ~(1 << x);
        this.colMask[x] &= ~(1 << y);
      } else {
        this.rowMask[y] |= 1 << x;
        this.colMask[x] |= 1 << y;
      }
      this.boardColor[y][x] = colorId;
    }
    updateBlockByDatas(isTmp = false) {
      this.resetPool();
      let fullData = isTmp ? this.getTmpFullData() : this.getFullData();
      for (let i = 0; i < this.boardColor.length; i++) {
        let colorArr = this.boardColor[i];
        for (let j = 0; j < colorArr.length; j++) {
          if (colorArr[j] > 0) {
            let block = this.blockPool.take();
            block.visible = true;
            let color = colorArr[j];
            if (isTmp && fullData) {
              if (fullData.delRow.indexOf(i) >= 0 || fullData.delCow.indexOf(j) >= 0) {
                color = this.nowColor;
              }
            }
            this.setBlock(block, j, i, color);
          }
        }
      }
      if (isTmp) {
        for (let i = 0; i < this.tmpBlockArr.length; i++) {
          let data2 = this.tmpBlockArr[i];
          let block = this.blockPool.take();
          block.visible = true;
          this.setBlock(block, data2.x, data2.y, data2.color, 0.5);
        }
      } else {
        this.judgeComb(fullData);
        if (fullData) {
          for (let i = 0; i < fullData.delRow.length; i++) {
            let index = fullData.delRow[i];
            for (let j = 0; j < this.COLS; j++) {
              this._setCell(j, index, 0);
            }
          }
          for (let i = 0; i < fullData.delCow.length; i++) {
            let index = fullData.delCow[i];
            for (let j = 0; j < this.ROWS; j++) {
              this._setCell(index, j, 0);
            }
          }
          this.playFullSpine(fullData.delRow, fullData.delCow);
          this.updateBlockByDatas();
        } else {
          this.checkDead();
        }
      }
    }
    judgeComb(fullData) {
      let full = fullData ? true : false;
      if (this.combNum >= 0) {
        this.combStep++;
      }
      if (this.combStep > (this.combNum + 1) * 3) {
        this.combNum = -1;
        this.combStep = 0;
      }
      if (full) {
        this.combNum++;
        let line = fullData.delRow.length + fullData.delCow.length;
        let score = line * 10 * (this.combNum + 1);
        this.nowScore += score;
        SoundManager_default.playSound("combo" + (this.combNum <= 9 ? this.combNum : 9));
        if (this.combNum >= 1) {
          this.showComb();
          this.timer.once(1500, this, this.playScoreAni, [score, line]);
        } else {
          this.playScoreAni(score, line);
        }
      }
    }
    playScoreAni(value, line = 0) {
      this.ui.scoreSp.visible = false;
      if (line >= 1) {
        this.scoreClip.text = value + "";
        if (line > 1) {
          this.ui.scoreSp.visible = true;
          UiUtils.setSpineSkin(this.ui.scoreSp, this.scoreAni[line - 2]);
          SoundManager_default.playSound(this.scoreAni[line - 2]);
          UiUtils.playSpine(this.scoreSp, this.scoreAniName[this.nowColor]);
          this.timer.once(1500, this, this.hideScoreAni);
        }
        this.playScoreTween();
      }
    }
    hideScoreAni() {
      this.ui.scoreSp.visible = false;
    }
    addScore(value, x, y, id, color) {
      this.scoreTween.playTween(this.score, this.score + value);
      this.score = this.score + value;
      this.updateBest();
      let blocks2 = [];
      for (let i = 0; i < this.blockArr.length; i++) {
        let block = this.blockArr[i];
        if (block.box.visible && block.shape) {
          blocks2.push({ id: block.type, color: block.color, index: i });
        }
      }
      MainModel_default.sendplay(x, y, id, value, color, blocks2);
    }
    playScoreTween() {
      this.clearTween(this.ui.scoreClip);
      this.ui.scoreClip.visible = true;
      this.ui.scoreClip.centerY = -150;
      this.TweenTo(this.ui.scoreClip, { centerY: -400 }, 400);
      this.timer.once(600, this, this.hideScoreClip);
    }
    hideScoreClip() {
      this.ui.scoreClip.visible = false;
    }
    showComb() {
      this.clearTween(this.ui.combBox);
      this.timer.clear(this, this.onCombNext2);
      this.ui.combBox.visible = true;
      let txt = this.combNum + "";
      if (this.combNum <= 0) {
        txt = "";
      }
      this.combClip.text = txt;
      this.ui.combBox.scale(0.5, 0.5);
      this.TweenTo(this.ui.combBox, { scaleX: 1.5, scaleY: 1.5 }, 600, Laya.Handler.create(this, this.onCombNext), 0, Laya.Ease.cubicIn);
    }
    onCombNext() {
      this.TweenTo(this.ui.combBox, { scaleX: 1, scaleY: 1 }, 300, null, 0, Laya.Ease.circOut);
      this.timer.once(500, this, this.onCombNext2);
    }
    onCombNext2() {
      this.TweenTo(this.ui.combBox, { scaleX: 0.1, scaleY: 0.1 }, 400, Laya.Handler.create(this, this.hideComb), 0, Laya.Ease.backIn);
    }
    hideComb() {
      this.ui.combBox.visible = false;
    }
    //pos dir color
    playFullSpine(delRow, delCow) {
      for (let i = 0; i < delRow.length; i++) {
        EventMgr_default.call(EventDef.playBoomSpine, delRow[i], 0, this.nowColor);
      }
      for (let i = 0; i < delCow.length; i++) {
        EventMgr_default.call(EventDef.playBoomSpine, delCow[i], 1, this.nowColor);
      }
    }
    getTmpFullData() {
      let rowMask = [].concat(this.rowMask);
      let colMask = [].concat(this.colMask);
      for (let i = 0; i < this.tmpBlockArr.length; i++) {
        let data2 = this.tmpBlockArr[i];
        rowMask[data2.y] = rowMask[data2.y] | 1 << data2.x;
        colMask[data2.x] = colMask[data2.x] | 1 << data2.y;
      }
      return this._getFullData(rowMask, colMask);
    }
    getFullData() {
      return this._getFullData(this.rowMask, this.colMask);
    }
    _getFullData(rowMask, colMask) {
      let delRow = [];
      let delCow = [];
      for (let i = 0; i < rowMask.length; i++) {
        if (rowMask[i] == this.FULL_ROW_MASK) {
          rowMask[i] = 0;
          delRow.push(i);
        }
      }
      for (let i = 0; i < colMask.length; i++) {
        if (colMask[i] == this.FULL_COL_MASK) {
          colMask[i] = 0;
          delCow.push(i);
        }
      }
      if (delRow.length == 0 && delCow.length == 0) {
        return null;
      }
      return { delRow, delCow };
    }
    checkDead() {
      console.log("--------checkDead---------");
      let num = 0;
      for (let i = 0; i < 3; i++) {
        let block = this.blockArr[i];
        if (!block.box.visible || !block.shape) {
          num++;
          if (num >= 3) {
            console.log("checkDead:false");
            return;
          }
          continue;
        }
        let boo = this.checkDeadByShape(block.shape, block.w, block.h);
        if (!boo) {
          console.log("checkDead:false");
          return;
        }
      }
      console.log("checkDead:true");
      this.timer.once(1e3, this, this.showDead);
      WaitMgr_default.showWaitOnly("dead");
      SoundManager_default.pauseMusic();
    }
    resetPool() {
      this.blockPool.resetUsings(new Laya.Handler(this, this.clearBlock));
    }
    showDead() {
      this.timer.once(1e3, this, this.fullTiles);
      this.timer.once(2200, this, this.clearView);
      TipsManager_default.showTips("No Space Left!");
      SoundManager_default.playSound("NoSpace");
      this.timer.once(2500, this, this.sendOver);
    }
    clearView() {
      this.resetPool();
      for (let i = 0; i < this.blockArr.length; i++) {
        this.blockArr[i].box.visible = false;
      }
    }
    sendOver() {
      SoundManager_default.playSound("GameOver");
      MainModel_default.sendgameOver(this.score);
    }
    fullTiles() {
      for (let i = 7; i >= 0; i--) {
        let colorArr = this.boardColor[i];
        for (let j = 0; j < 8; j++) {
          let color = colorArr[j];
          if (color == 0) {
            this.timer.once(50 * (7 - i), this, this.delayShowTile, [j, i], false);
          }
        }
      }
    }
    delayShowTile(x, y) {
      let block = this.blockPool.take();
      block.visible = true;
      let color = MathUtil.rand(1, 7);
      this.setBlock(block, x, y, color);
    }
    checkDeadByShape(shape, w, h) {
      for (let i = 0; i <= this.ROWS - w; i++) {
        for (let j = 0; j <= this.COLS - h; j++) {
          let boo = this.checkCanPut(shape, i, j);
          if (boo) {
            return false;
          }
        }
      }
      return true;
    }
    checkCanPut(shape, x, y) {
      for (let i = 0; i < shape.length; i++) {
        let checkValue = shape[i] << x;
        let tileValue = this.rowMask[y + i];
        if ((checkValue & tileValue) != 0) {
          return false;
        }
      }
      return true;
    }
    resetGame(boo = true) {
      this.ui.gameId.text = MainModel_default.gameId;
      this.colMask = new Array(this.ROWS).fill(0);
      this.rowMask = new Array(this.COLS).fill(0);
      this.boardColor = Array.from({ length: this.ROWS }, () => Array(this.COLS).fill(0));
      this.resetPool();
      this.tmpBlockArr = [];
      this.ui.combBox.visible = false;
      this.combNum = -1;
      this.combStep = 0;
      this.Score = MainModel_default.lastScore;
      this.updateBlockByDatas();
      if (boo) {
        this.randomBlocks();
      }
      SoundManager_default.playSound("Start");
    }
    setBlock(block, x, y, type, alpha = 1) {
      block.x = x * this.blockSize;
      block.y = y * this.blockSize;
      block.alpha = alpha;
      UiUtils.setSkin(block, "game_" + (5 + type));
    }
    clearBlock(block) {
      block.visible = false;
    }
    randomMusic() {
      let index = MathUtil.rand(0, 4);
      SoundManager_default.changeMusic("PlayBgm_" + index);
    }
    onOpened(param) {
      this.randomMusic();
      this.addEvent(EventDef.onBlockMoving, this.onBlockMoving);
      this.addEvent(EventDef.onBlockEnd, this.onBlockEnd);
      this.addEvent(EventDef.resetGame, this.resetGame);
      this.addEvent(EventDef.onStartGame, this.resetGame);
      this.resetGame(!MainModel_default.hasGame());
      if (MainModel_default.hasGame()) {
        for (let i = 0; i < MainModel_default.lastGame.length; i++) {
          this._setCell(MainModel_default.lastGame[i].x, MainModel_default.lastGame[i].y, MainModel_default.lastGame[i].color);
        }
        this.updateBlockByDatas();
        for (let i = 0; i < 3; i++) {
          let block = this.blockArr[i];
          let data2 = MainModel_default.lastDownBlocks[i];
          if (data2) {
            let arr = ExlMgr_default.parseToNumberArray(data2);
            block.setData(arr[0], arr[1]);
          } else {
            block.box.visible = false;
            block.hideLight();
          }
        }
      }
    }
    randomBlocks() {
      let blockDatas = ExlMgr_default.getRandomBlocks();
      for (let i = 0; i < this.blockArr.length; i++) {
        let data2 = blockDatas[i];
        console.log(data2.id);
        this.blockArr[i].setData(data2.id, data2.color);
      }
      this.checkDead();
    }
    onBlockEnd(block) {
      if (this.tmpBlockArr && this.tmpBlockArr.length > 0) {
        let type = block.type;
        let color = block.color;
        let posX = this.tmpPos[0];
        let posY = this.tmpPos[1];
        block.box.visible = false;
        for (let i = 0; i < this.tmpBlockArr.length; i++) {
          this._setCell(this.tmpBlockArr[i].x, this.tmpBlockArr[i].y, this.tmpBlockArr[i].color);
        }
        this.nowScore = this.tmpBlockArr.length;
        this.updateBlockByDatas();
        if (!this.ui.block0.visible && !this.ui.block1.visible && !this.ui.block2.visible) {
          this.randomBlocks();
        }
        this.addScore(this.nowScore, posX, posY, type, color);
      }
      this.tmpBlockArr = [];
    }
    onBlockMoving(block) {
      let offsetX = (block.w * block.size - block.box.width) / 2 + this.ui.main.x - block.size / 2;
      let offsetY = (block.h * block.size - block.box.height) / 2 + this.ui.main.y - block.size / 2;
      let posX = Math.floor((block.box.x - offsetX) / this.blockSize);
      let posY = Math.floor((block.box.y - offsetY) / this.blockSize);
      this.nowColor = block.color;
      this.tmpBlockArr = [];
      this.tmpPos = [posX, posY];
      if (posX < 0 || posX + block.w > this.ROWS || posY < 0 || posY + block.h > this.COLS) {
        this.updateBlockByDatas(true);
        return;
      }
      let checkArr = [];
      for (let i = 0; i < block.datas.length; i++) {
        let checkValue = block.shape[i];
        checkArr.push(checkValue << posX);
        let datas = block.datas[i];
        for (let j = 0; j < datas.length; j++) {
          let bit = datas[j];
          if (bit) {
            bit = block.color;
            this.tmpBlockArr.push({ x: posX + j, y: posY + i, color: bit });
          }
        }
      }
      for (let i = 0; i < checkArr.length; i++) {
        let vlaue = checkArr[i];
        let tileValue = this.rowMask[posY + i];
        if ((vlaue & tileValue) != 0) {
          this.tmpBlockArr = [];
          break;
        }
      }
      this.updateBlockByDatas(true);
    }
  };
  GameViewUI = __decorateClass([
    regClass18("W3pMTJZbQw-hP8ozDgWrJg")
  ], GameViewUI);

  // src/UI/GuideViewUI.ts
  var { regClass: regClass19, property: property19 } = Laya;
  var GuideViewUI = class extends GameViewUI {
    constructor() {
      super(...arguments);
      this.guideDiceArr = [];
      this.guideId = 0;
      this.guideStep = 0;
      this.orgHandPos = [300, 800];
    }
    get ui() {
      return this._ui;
    }
    onAwake() {
      super.onAwake();
      this.addClick(this.ui.playBtn, new Laya.Handler(this, this.onPlayGame));
      if (PlayerData_default.hall) {
        this.orgHandPos = [600, 375];
      }
    }
    onPlayGame() {
      MainModel_default.sendgameStart();
    }
    onStartGame() {
      this.close();
      UIMgr.inst.openGameView(true);
    }
    onOpened(param) {
      this.ui.startBox.visible = false;
      super.onOpened(param);
      this.playNextGuide();
      this.setInitDice();
      this.addEvent(EventDef.onStartGame, this.onStartGame);
    }
    setInitDice() {
      this.guideDiceArr = ExlMgr_default.parseToNumberArrays(this.guideData.initDic);
      for (let i = 0; i < this.guideDiceArr.length; i++) {
        let dice = this.guideDiceArr[i];
        let posArr = this.changePosToXY(dice[0]);
        let x = posArr[0];
        let y = posArr[1];
        let value = dice[1];
        this.mainArr[y][x] = value;
        let icon = this.iconArr[y][x];
        icon.visible = true;
        icon.setSkin(value);
      }
    }
    changePosToXY(_pos) {
      let pos = _pos - 1;
      let x = pos % 5;
      let y = Math.floor(pos / 5);
      return [x, y];
    }
    stopHand() {
      this.ui.touchBox.visible = false;
      this.clearTweenTo();
      this.ui.hand.alpha = 0;
      this.ui.guidePos1.visible = false;
      this.ui.guidePos2.visible = false;
      this.ui.topBox2.visible = false;
    }
    randomDice2() {
      this.ui.touchBox.visible = true;
      this.randomArr = ExlMgr_default.parseToNumberArray(this.stepData.RandomDice);
      this._randomDice();
    }
    addExp(addVlaue) {
    }
    showStartBox() {
      this.ui.startBox.visible = true;
      this.ui.startBox2.centerY = 500;
      this.TweenTo(this.ui.startBox2, { centerY: 0 }, 500, null, 0, Laya.Ease.backOut);
    }
    onNextGuide() {
      if (this.guideId >= 2) {
        this.timer.once(1500, this, this.showStartBox);
        return;
      }
      this.resetGame();
      this.playNextGuide();
      this.setInitDice();
    }
    playNextGuide() {
      this.guideId++;
      this.guideStep = -1;
      this.guideData = ExlMgr_default.getExlData("Guide", this.guideId);
      this.stepIds = ExlMgr_default.parseToNumberArray(this.guideData.steps);
      this.playStep();
    }
    playStep() {
      this.guideStep++;
      if (this.guideStep >= this.stepIds.length) {
        this.stopHand();
        this.timer.once(this.stepData.delay, this, this.onNextGuide);
        return;
      }
      this.stepData = ExlMgr_default.getExlData("GuideStep", this.stepIds[this.guideStep]);
      if (this.stepData.RandomDice) {
        this.randomDice2();
      }
      this.handleTweenData();
    }
    handleTweenData() {
      this.targetGrids = [];
      this.targetPos = [];
      this.ui.guidePos1.visible = false;
      this.ui.guidePos2.visible = false;
      if (this.stepData.type == 1) {
        let pointGrids = ExlMgr_default.parseToNumberArray(this.stepData.pointGrids);
        if (pointGrids.length == 1) {
          let posArr = this.changePosToXY(pointGrids[0]);
          let x = posArr[0];
          let y = posArr[1];
          let icon = this.getGrid(x, y);
          let tarX = icon.box.parent["x"] + this.blockSize;
          let tarY = icon.box.parent["y"] + this.blockSize;
          this.targetGrids.push({ x, y });
          this.targetPos = [tarX, tarY];
          this.ui.guidePos1.visible = true;
          this.ui.guidePos1.x = tarX;
          this.ui.guidePos1.y = tarY;
        } else {
          let tarX = 0;
          let tarY = 0;
          for (let i = 0; i < pointGrids.length; i++) {
            let posArr = this.changePosToXY(pointGrids[i]);
            let x = posArr[0];
            let y = posArr[1];
            let icon = this.getGrid(x, y);
            let posX = icon.box.parent["x"] + this.blockSize;
            ;
            let posY = icon.box.parent["y"] + this.blockSize;
            tarX += posX;
            tarY += posY;
            this.targetGrids.push({ x, y });
            let guideIcon = this.ui["guidePos" + (i + 1)];
            guideIcon.x = posX;
            guideIcon.y = posY;
            guideIcon.visible = true;
          }
          this.targetPos = [tarX / 2, tarY / 2];
        }
      } else {
        this.targetPos = this.orgHandPos;
      }
      this.ui.topBox2.visible = true;
      this.ui.guideTitle.text = this.stepData.guideTitle;
      this.ui.guideContent.text = this.stepData.guideContent;
      this.tweenHand();
    }
    onOneStepEnd(mergeRes = 0) {
    }
    tweenHand() {
      this.ui.hand.alpha = 1;
      if (this.stepData.type == 1) {
        this.ui.hand.x = this.orgHandPos[0];
        this.ui.hand.y = this.orgHandPos[1];
      } else {
        this.ui.hand.x = this.orgHandPos[0] + 100;
        this.ui.hand.y = this.orgHandPos[1] + 100;
      }
      this.clearTween(this.ui.hand);
      this.TweenTo(this.ui.hand, { x: this.targetPos[0], y: this.targetPos[1] }, 1e3, Laya.Handler.create(this, this.tweenHand2));
    }
    judgeGuidePos() {
      for (let i = 0; i < this.shadowArr.length; i++) {
        let hasSame = false;
        for (let j = 0; j < this.targetGrids.length; j++) {
          if (this.targetGrids[j].x == this.shadowArr[i].x && this.targetGrids[j].y == this.shadowArr[i].y) {
            hasSame = true;
            break;
          }
        }
        if (hasSame == false) {
          return false;
        }
      }
      return true;
    }
    tweenHand2() {
      this.TweenTo(this.ui.hand, { alpha: 0 }, 300, Laya.Handler.create(this, this.tweenHand), 300);
    }
    onTouchClick() {
      if (this.stepData.type == 2) {
        super.onTouchClick();
        this.playStep();
      }
    }
    onTouchStart() {
      if (this.stepData.type == 2) {
        return;
      }
      super.onTouchStart();
    }
    onTouchMove(x, y) {
      if (this.stepData.type == 2) {
        return;
      }
      super.onTouchMove(x, y);
    }
    onTouchEnd() {
      this.tmpShader = [].concat(this.shadowArr);
      if (this.shadowArr && this.shadowArr.length > 0 && this.judgeGuidePos()) {
        this.stopHand();
        for (let i = 0; i < this.shadowArr.length; i++) {
          let data2 = this.shadowArr[i];
          data2.icon.box.alpha = 1;
          this.mainArr[data2.y][data2.x] = data2.value;
        }
        this.onShadowDown();
        this.judgeDead();
        this.timer.once(this.stepData.delay, this, this.playStep);
      } else {
        this.ui.randomCircle.visible = this.randomArr.length > 1;
        this.clearShadow();
      }
      this.ui.touchBox.pos(this.startPos[0], this.startPos[1]);
    }
  };
  GuideViewUI = __decorateClass([
    regClass19("AuJNluhiRP6NaM2G05LbJA")
  ], GuideViewUI);

  // src/UI/JackViewUI.ts
  var { regClass: regClass20, property: property20 } = Laya;
  var JackViewUI = class extends UIBase {
    get ui() {
      return this._ui;
    }
    onInit() {
      this.winAni = UiUtils.setSpineSkin(this.ui.winAni, "animation_jackpot");
      this.winLab = this.ui.clipWord.getComponent(ClipWord);
      this.winTween = this.ui.clipWord.getComponent(TweenNum);
    }
    onOpened(param) {
      this.clickClose = false;
      this.winLab.text = param.win;
      SoundManager_default.changeMusic("Bgm-big-win");
      this.winTween.playTween(1, this._data.win);
      UiUtils.playSpine(this.winAni, "start", Laya.Handler.create(this, this.onNextAni));
      this.timer.once(this.winTween.trunTime + 3e3, this, this.onAniComplete);
    }
    onNextAni() {
      this.winAni.play("loop", true);
    }
    onAniComplete() {
      UiUtils.playSpine(this.winAni, "end", Laya.Handler.create(this, this.close));
    }
    onClosed() {
      SoundManager_default.changeMusic("Bgm-regular");
      EventMgr_default.call(EventDef.onWinClose);
    }
  };
  JackViewUI = __decorateClass([
    regClass20("mZbCVElBSMiZGTq29ytB9Q")
  ], JackViewUI);

  // src/UI/LoadingUI.ts
  var { regClass: regClass21, property: property21 } = Laya;
  var LoadingUI = class extends UIBase {
    constructor() {
      super(...arguments);
      this.nowPro = 0;
      this.tarPro = 0;
      this.speed = 0.05;
      this.loadingComplete = false;
      this.maxSize = 0;
      this.nowSize = 0;
      this.isError = false;
    }
    onInit() {
      this.ui.ver.text = Config.version;
    }
    //关闭loading显示主界面
    showMainScene() {
      if (MainModel_default.hasInit && this.loadingComplete) {
        Laya.timer.clearAll(this);
        this.openMain();
        PlatformMgr_default.evokeChangeBtnShow(false);
        console.log("showMainScene:true");
      } else {
        console.log("showMainScene:false");
      }
    }
    openMain() {
      this.close();
      if (MainModel_default.isGuide()) {
        UIMgr.inst.openGuideView();
      } else {
        UIMgr.inst.openStartView(true);
      }
    }
    get ui() {
      return this._ui;
    }
    //进度条变化
    onUpdate() {
      if (this.nowPro < this.tarPro) {
        this.nowPro += this.speed;
        if (this.nowPro > this.tarPro) {
          this.nowPro = this.tarPro;
        }
        this.setProgress(this.nowPro);
      }
    }
    setProgress(num) {
      this.ui.proIcon.width = 482 * num;
      this.ui.barLab.text = "LOADING " + Math.ceil(num * 100) + "%";
    }
    //服务器init消息返回后回调
    onGameInitComplete() {
      this.showMainScene();
    }
    onOpened(param) {
      if (Laya.Browser.window["hideMySplashScreen"]) {
        Laya.Browser.window["hideMySplashScreen"]();
      }
      if (window.innerWidth > 10 && window.innerHeight > 10) {
        PlatformMgr_default.evokeChangeBtnShow(true);
      }
      this.addEvent(EventDef.gameInitComplete, this.onGameInitComplete);
      this.loadSubpack();
    }
    loadSubpack() {
      let promises = [];
      promises.push(Laya.loader.loadPackage("resources/Spine"));
      promises.push(Laya.loader.loadPackage("resources/MP3"));
      Promise.all(promises).then(() => {
        this.loadRes();
      });
    }
    calculateMax() {
      this.maxSize = 0;
      for (let i = 0; i < this.loadingRes.length; i++) {
        this.maxSize += this.loadingRes[i].size;
      }
      console.log("maxSize:" + this.maxSize);
    }
    loadRes() {
      this.isError = false;
      this.loadingComplete = false;
      Laya.loader.retryNum = 2;
      Laya.loader.retryDelay = 500;
      this.setProgress(0);
      this.loadingRes = [];
      let resArr = Config.GameRes;
      for (let i = 0; i < resArr.length; i++) {
        let res = resArr[i];
        let obj = {};
        if (typeof res === "string") {
          obj = { url: res, size: 0 };
        } else {
          if (PlayerData_default.picMode == 1 && res.size2) {
            obj = { url: res.url, size: res.size2 };
          } else {
            obj = { url: res.url, size: res.size };
          }
          if (res.type) {
            obj["type"] = res.type;
          }
        }
        this.loadingRes.push(obj);
      }
      this.nowSize = 0;
      this.calculateMax();
      let promises = [];
      MainModel_default.sendinit();
      for (let i = 0; i < this.loadingRes.length; i++) {
        if (this.loadingRes[i].url.indexOf("exl/") != -1) {
          promises.push(Laya.loader.load(this.loadingRes[i], Laya.Handler.create(this, this.onExlLoaded, [this.loadingRes[i].size])));
        } else {
          promises.push(Laya.loader.load(this.loadingRes[i], Laya.Handler.create(this, this.onResLoaded, [this.loadingRes[i].size, this.loadingRes[i].url])));
        }
      }
      Promise.all(promises).then(() => {
        this.onComplete();
      });
    }
    onExlLoaded(size, prefab) {
      if (!ExlMgr_default.tables) {
        ExlMgr_default.parseJson(prefab);
      }
      this.onResLoaded(size, prefab.url, prefab);
    }
    clearRes(url) {
      Laya.loader.clearRes(url);
      if (!this.isError) {
        Laya.loader.retryNum = 0;
        Laya.loader.retryDelay = 0;
        this.isError = true;
      }
    }
    onResLoaded(size, url, prefab) {
      if (!prefab) {
        this.clearRes(url);
        return;
      }
      if (prefab instanceof Laya.SpineTemplet) {
        if (!prefab.mainTexture) {
          this.clearRes(url);
          let png = url.replace(".json", ".png");
          this.clearRes(png);
          return;
        }
      } else if (prefab instanceof Laya.AtlasResource) {
        if (!prefab.frames || prefab.frames.length == 0) {
          this.clearRes(url);
          let png = url.replace(".atlas", ".png");
          this.clearRes(png);
          return;
        }
      }
      this.nowSize += size;
      console.log(size);
      this.tarPro = this.nowSize / this.maxSize;
    }
    //完成加载
    onComplete() {
      if (this.isError) {
        TipsManager_default.showTips("Resource Load Failed", 1);
        return;
      }
      Laya.loader.retryNum = 1;
      Laya.loader.retryDelay = 0;
      this.loadingComplete = true;
      Laya.timer.once(100, this, this.showMainScene);
    }
  };
  LoadingUI = __decorateClass([
    regClass21("D0CLyeDTS8OziObi27rZVg")
  ], LoadingUI);

  // src/UI/LvupViewUI.ts
  var { regClass: regClass22, property: property22 } = Laya;
  var LvupViewUI = class extends UIBase {
    constructor() {
      super(...arguments);
      this.ang = 0;
      this.hasTween = false;
    }
    get ui() {
      return this._ui;
    }
    onInit() {
      this.addClick(this.ui.closeViewBtn, new Laya.Handler(this, this.closeView));
    }
    onUpdate() {
      if (this.ang >= 360) {
        if (this.hasTween == false) {
          this.hideLab();
        }
        this.hasTween = true;
        return;
      }
      this.ang += 5;
      this.ui.circleMask.graphics.clear();
      this.ui.circleMask.graphics.drawPie(171, 171, 171, 0, this.ang, "ffffff");
    }
    onOpened(param) {
      this.ang = 0;
      this.ui.lv.alpha = 1;
      this.ui.lv.text = MainModel_default.lv - 1 + "";
      this.hasTween = false;
      this.ui.closeViewBtn.visible = false;
      SoundManager_default.playSound("level_up");
    }
    closeView() {
      this.openWin();
      this.close();
    }
    openWin() {
      UIMgr.inst.open("winView" /* winView */, this._data);
    }
    hideLab() {
      this.TweenTo(this.ui.lv, { alpha: 0 }, 200, Laya.Handler.create(this, this.showLab));
    }
    showLab() {
      this.ui.closeViewBtn.visible = true;
      this.ui.closeViewBtn.alpha = 0;
      this.ui.lv.text = MainModel_default.lv + "";
      this.TweenTo(this.ui.lv, { alpha: 1 }, 200);
      this.TweenTo(this.ui.closeViewBtn, { alpha: 1 }, 200);
    }
  };
  LvupViewUI = __decorateClass([
    regClass22("4tdU2XR5TW6by8PQN9pCxQ")
  ], LvupViewUI);

  // src/Utils/FontLoader.ts
  var FontLoader = class {
    // 重试间隔，单位为毫秒
    /**
     * 并行加载多个字体
     * @param fontArr 字体文件路径数组
     */
    static loadFonts(fontArr) {
      return __async(this, null, function* () {
        const promises = fontArr.map((fontName) => this.loadFontWithRetry(fontName));
        yield Promise.all(promises);
        console.log("所有字体加载完成");
      });
    }
    /**
     * 重试加载单个字体
     * @param fontName 字体文件路径或字体名称
     */
    static loadFontWithRetry(fontName) {
      return __async(this, null, function* () {
        let retryCount = 0;
        while (retryCount < this.MAX_RETRY) {
          try {
            const res = yield Laya.loader.load(fontName, Laya.Loader.TTF);
            if (res) {
              console.log(`${fontName} 加载成功`);
              return;
            } else {
              Laya.loader.clearRes(fontName);
              retryCount++;
              console.warn(`${fontName} 加载返回空，正在重试 (${retryCount}/${this.MAX_RETRY})`);
            }
          } catch (error) {
            Laya.loader.clearRes(fontName);
            retryCount++;
            console.warn(`${fontName} 加载异常，正在重试 (${retryCount}/${this.MAX_RETRY})`, error);
          }
          yield this.delay(this.RETRY_DELAY);
        }
        console.error(`${fontName} 加载失败，重试次数已达上限`);
      });
    }
    /**
     * 延迟方法
     * @param ms 延迟时间，单位为毫秒
     */
    static delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
  };
  FontLoader.MAX_RETRY = 999;
  FontLoader.RETRY_DELAY = 1e3;

  // src/UI/MainUI.ts
  var { regClass: regClass23, property: property23 } = Laya;
  var MainUI = class extends UIBase {
    constructor() {
      super();
    }
    packJSON() {
      this.handleAllButtons();
      this.handleSpine();
      Laya.loader.load("resources/Config.json", Laya.Handler.create(this, this.parseConfig));
      return;
      let fileconfigVer = Laya.URL.version["fileconfig.json"];
      let jsonUrl = `all.json${fileconfigVer ? `?v=${fileconfigVer}` : ""}`;
      Laya.loader.fetch(jsonUrl, "json").then((jsonData) => {
        if (jsonData) {
          let preLoadedMap = Laya.Loader.preLoadedMap;
          for (let key in jsonData) {
            let filePath = Laya.URL.formatURL(key);
            filePath = this.getOriginalExt(filePath);
            preLoadedMap[filePath] = jsonData[key];
          }
        }
        Laya.loader.load("resources/Config.json", Laya.Handler.create(this, this.parseConfig));
      });
    }
    handleSpine() {
      const originalInit = Laya.Spine2DRenderNode.prototype["init"];
      Laya.Spine2DRenderNode.prototype["init"] = function(templet) {
        originalInit.call(this, templet);
        const customListeners = {
          complete: (entry) => {
            this.event(Laya.Event.END);
            if (entry.loop) {
              this.event(Laya.Event.COMPLETE);
            } else {
              this._currAniName = null;
              this.event(Laya.Event.STOPPED, entry);
            }
          },
          event: (entry, event) => {
            let eventData = {
              audioValue: event.data.audioPath,
              audioPath: event.data.audioPath,
              floatValue: event.floatValue,
              intValue: event.intValue,
              name: event.data.name,
              stringValue: event.stringValue,
              time: event.time * 1e3,
              balance: event.balance,
              volume: event.volume
            };
            this.event(Laya.Event.LABEL, [eventData, entry]);
            if (this._playAudio && eventData.audioValue) {
              let channel = Laya.SoundManager.playSound(templet.basePath + eventData.audioValue, 1, Laya.Handler.create(this, this._onAniSoundStoped), null, (this._currentPlayTime * 1e3 - eventData.time) / 1e3);
              Laya.SoundManager.playbackRate = this._playbackRate;
              channel && this._soundChannelArr.push(channel);
            }
          }
        };
        if (this._state) {
          this._state.clearListeners();
          this._state.addListener(customListeners);
        }
      };
    }
    handleFillText() {
      Object.defineProperty(Laya.Graphics.prototype, "fillText", {
        value: function(text, x, y, font, color, textAlign) {
          let size = this._sp ? this._sp.fontSize : 18;
          let offset = size / 18 * -2;
          return this.addCmd(Laya.FillTextCmd.create(text, x, y + offset, font, color, textAlign, 0, ""));
        }
      });
      Object.defineProperty(Laya.Graphics.prototype, "fillBorderText", {
        value: function(text, x, y, font, fillColor, textAlign, lineWidth, borderColor) {
          let size = this._sp ? this._sp.fontSize : 18;
          let offset = size / 18 * -2;
          return this.addCmd(Laya.FillTextCmd.create(text, x, y + offset, font, fillColor, textAlign, lineWidth, borderColor));
        }
      });
    }
    handleAllButtons() {
      Object.defineProperty(Laya.Button.prototype, "initialize", {
        value: function() {
          if (this._mouseState !== 1) {
            this.mouseEnabled = true;
            this._setBit(Laya.NodeFlags.HAS_MOUSE, true);
          }
          this.on(Laya.Event.MOUSE_OVER, this, this.onMouse);
          this.on(Laya.Event.MOUSE_OUT, this, this.onMouse);
          this.on(Laya.Event.MOUSE_DOWN, this, this.onMouse);
          this.on(Laya.Event.MOUSE_UP, this, this.onMouse);
          this.on(Laya.Event.CLICK, this, this.onMouse);
          this.on(Laya.Event.MOUSE_DOWN, this, () => {
            if (this.centerX != null) {
              this._orgXParm = "centerX";
            } else if (this.left != null) {
              this._orgXParm = "left";
            } else if (this.right != null) {
              this._orgXParm = "right";
            } else {
              this._orgXParm = "x";
            }
            if (this.centerY != null) {
              this._orgYParm = "centerY";
            } else if (this.top != null) {
              this._orgYParm = "top";
            } else if (this.bottom != null) {
              this._orgYParm = "bottom";
            } else {
              this._orgYParm = "y";
            }
            let _btnScale = 0.9;
            this._isDown = true;
            this._orgX = this[this._orgXParm];
            this._orgY = this[this._orgYParm];
            this._orgAnX = this.anchorX;
            this._orgAnY = this.anchorY;
            this.anchorX = 0.5;
            this.anchorY = 0.5;
            let powX = 1;
            if (this._orgXParm == "right") {
              powX = 1;
            } else if (this._orgXParm == "centerX") {
              powX = 0;
            }
            let powY = 1;
            if (this._orgYParm == "bottom") {
              powY = 1;
            } else if (this._orgYParm == "centerY") {
              powY = 0;
            }
            if (this._orgXParm == "x") {
              this[this._orgXParm] = this._orgX + this.width * (0.5 - this._orgAnX) * powX;
            } else {
              this[this._orgXParm] = this._orgX + this.width * (1 - _btnScale) * (0.5 - this._orgAnX) * powX;
            }
            if (this._orgYParm == "y") {
              this[this._orgYParm] = this._orgY + this.height * (0.5 - this._orgAnY) * powY;
            } else {
              this[this._orgYParm] = this._orgY + this.height * (1 - _btnScale) * (0.5 - this._orgAnY) * powY;
            }
            this.scale(_btnScale, _btnScale);
          });
          this._onScaleBtnOut = () => {
            if (!this._isDown) {
              return;
            }
            this.anchorX = this._orgAnX;
            this.anchorY = this._orgAnY;
            this[this._orgXParm] = this._orgX;
            this[this._orgYParm] = this._orgY;
            this.scale(1, 1);
          };
          this.on(Laya.Event.MOUSE_UP, this, this._onScaleBtnOut);
          Laya.stage.on(Laya.Event.MOUSE_UP, this, this._onScaleBtnOut);
        }
      });
    }
    getOriginalExt(filePath) {
      if (!filePath) {
        return "";
      }
      if (Laya.URL["hasExtOverrides"]) {
        let ext = Laya.Utils.getFileExtension(filePath);
        let overrideFileExts = Laya.URL["overrideFileExts"];
        if (!ext) {
          return filePath;
        }
        for (const key in overrideFileExts) {
          let fileExt = overrideFileExts[key];
          let index1 = filePath.lastIndexOf(`.${key}`);
          let index2 = filePath.lastIndexOf(`.${fileExt}`);
          if (index1 >= 0 && index2 >= 0) {
            filePath = `${filePath.substring(0, index2)}.${key}`;
            break;
          }
        }
      }
      return filePath;
    }
    onAwake() {
      PlatformMgr_default.init();
      Laya.SoundManager.autoReleaseSound = false;
      Laya.SoundManager.autoStopMusic = false;
      Laya.SoundManager.useAudioMusic = false;
      Laya.InputManager.multiTouchEnabled = false;
      StateManager_default.initGame();
      this.packJSON();
    }
    //解析Config.json文件
    parseConfig(config) {
      let cfg = config.data;
      Config.loadingRes = cfg.loadingRes;
      if (Laya.Browser.window.location.hostname != "localhost") {
        Config.atlasRes = cfg.atlasRes;
      } else {
        Config.loadingRes.splice(Config.loadingRes.length - 1, 1);
      }
      Config.prefabRes = cfg.prefabRes;
      Config.exlRes = cfg.exlRes;
      Config.soundRes = cfg.soundRes;
      Config.spineRes = cfg.spineRes;
      Config.httpUrl = cfg.httpUrl;
      Config.version = cfg.version;
      Config.maxLimitWord = cfg.maxLimitWord;
      Config.evn = cfg.evn;
      Config.severVer = cfg.severVer;
      if (!PlayerData_default.uid && cfg.testuid) {
        PlayerData_default.uid = cfg.testuid;
      }
      if (window["cocoAndroid"]) {
      } else if (window["webkit"] || window["conch"]) {
        this.handleFillText();
      }
      this.loadLoadingRes();
    }
    loadLoadingRes() {
      Laya.loader.retryNum = 999;
      Laya.loader.retryDelay = 500;
      let fontArr = [];
      let resArr = [];
      for (let i = 0; i < Config.loadingRes.length; i++) {
        let data2 = Config.loadingRes[i];
        if (typeof data2 == "string" && data2.endsWith(".ttf")) {
          fontArr.push(data2);
        } else {
          resArr.push(data2);
        }
      }
      FontLoader.loadFonts(fontArr).then(() => {
        Laya.loader.load(resArr, Laya.Handler.create(this, this.openLoading));
      });
    }
    checkAvif() {
      let splashPath = "resources/Spine/animation_splash.png";
      Laya.loader.load(splashPath).then((res) => {
        if (!res) {
          console.warn("checkAvif is not support");
          PlayerData_default.picMode = 1;
          Laya.loader.clearRes(splashPath);
          for (let key in Laya.Loader.preLoadedMap) {
            if (key.indexOf("/Spine/") >= 0 && key.indexOf(".atlas") >= 0) {
              let str = Laya.Loader.preLoadedMap[key];
              str = "png/" + str;
              Laya.Loader.preLoadedMap[key] = str;
            }
          }
        }
        this.loadLoadingRes();
      });
    }
    //显示loading界面
    openLoading() {
      Laya.loader.retryNum = 1;
      Laya.loader.retryDelay = 0;
      UIMgr.inst.open("loadingView" /* loadingView */);
    }
  };
  MainUI = __decorateClass([
    regClass23("t3951-V0QX-L4ZPGSj-pnA")
  ], MainUI);

  // src/UI/RankRewardViewUI.ts
  var { regClass: regClass24, property: property24 } = Laya;
  var RankRewardViewUI = class extends UIBase {
    onInit() {
      this.mainBox = this.scaleBox.getChildByName("mainBox");
      let closeBtn = this.mainBox.getChildByName("closeBtn");
      this.addClick(closeBtn, new Laya.Handler(this, this.close));
    }
    onOpened(param) {
      this.setCoin("coinBox1", MainModel_default.rankRewardList[1]);
      this.setCoin("coinBox2", MainModel_default.rankRewardList[2]);
      this.setCoin("coinBox3", MainModel_default.rankRewardList[3]);
      this.setCoin("coinBox4", MainModel_default.rankRewardList[4]);
      this.setCoin("coinBox5", MainModel_default.rankRewardList[11]);
      this.setCoin("coinBox6", MainModel_default.rankRewardList[21]);
    }
    setCoin(boxName, data2) {
      let box = this.mainBox.getChildByName(boxName);
      let icon = box.getChildByName("icon");
      let value = box.getChildByName("value");
      if (data2.type == 1) {
        UiUtils.setSkin(icon, "icon_coin");
      } else {
        UiUtils.setSkin(icon, "icon13");
      }
      value.text = data2.reward + "";
    }
  };
  RankRewardViewUI = __decorateClass([
    regClass24("Ts5L3RgET62Pklb_fvke2A")
  ], RankRewardViewUI);

  // src/UI/RankViewUI.ts
  var { regClass: regClass25, property: property25 } = Laya;
  var RankViewUI = class extends UIBase {
    get ui() {
      return this._ui;
    }
    onInit() {
      this.ui.mainList.repeatY = 0;
      this.ui.mainList.renderHandler = new Laya.Handler(this, this.onMainRender);
    }
    onOpened(param) {
      this.ui.mainList.dataSource = param[0].rankList;
      this.ui.mainList.scrollTo(0);
    }
    //列表渲染
    onMainRender(cell, index) {
      let playerBox = cell.getChildByName("playerBox");
      let name = playerBox.getChildByName("name");
      let score = cell.getChildByName("score");
      let icon = playerBox.getChildByName("icon");
      let rank = cell.getChildByName("rankBox").getComponent(RankBox);
      let data2 = cell.dataSource;
      name.text = data2.nickname;
      score.text = data2.score + "";
      icon.skin = "https://s3.amazonaws.com/voicecall/header_default.png";
      icon.skin = data2.avatar;
      rank.setRank(data2.rank);
    }
  };
  RankViewUI = __decorateClass([
    regClass25("tHv5NTvVQjyRIUYj6qwtGA")
  ], RankViewUI);

  // src/UI/RankWinViewUI.ts
  var { regClass: regClass26, property: property26 } = Laya;
  var RankWinViewUI = class extends UIBase {
    onInit() {
      this.mainBox = this.scaleBox.getChildByName("mainBox");
      let rewardBtn = this.mainBox.getChildByName("rewardBtn");
      this.rewardLab = this.mainBox.getChildByName("rewardLab");
      this.rewardIcon = this.mainBox.getChildByName("rewardIcon");
      this.addClick(rewardBtn, new Laya.Handler(this, this.close));
    }
    onOpened(param) {
      this.rewardData = param[0];
      this.setCoin("coinBox", this.rewardData);
      if (this.rewardData.rank > 3) {
        UiUtils.setSkin(this.rewardIcon, "icon75");
      } else {
        UiUtils.setSkin(this.rewardIcon, "icon" + (71 + this.rewardData.rank));
      }
      this.rewardLab.text = "You ranked #" + this.rewardData.rank + " last week.";
    }
    setCoin(boxName, data2) {
      let box = this.mainBox.getChildByName(boxName);
      let icon = box.getChildByName("icon");
      let value = box.getChildByName("value");
      if (data2.type == 1) {
        UiUtils.setSkin(icon, "icon_coin");
      } else {
        UiUtils.setSkin(icon, "icon13");
      }
      value.text = data2.star + "";
    }
    onClosed() {
      UIMgr.inst.open("winView" /* winView */, this.rewardData.star);
    }
  };
  RankWinViewUI = __decorateClass([
    regClass26("wYVLiynZTiOi7TSxX2lZjg")
  ], RankWinViewUI);

  // src/UI/StartViewUI.ts
  var { regClass: regClass27, property: property27 } = Laya;
  var StartViewUI = class extends UIBase {
    constructor() {
      super(...arguments);
      this.needSend = true;
    }
    get ui() {
      return this._ui;
    }
    onInit() {
      this.addClick(this.ui.playBtn, new Laya.Handler(this, this.onPlay));
      this.addClick(this.ui.settingBtn, new Laya.Handler(this, this.onSetting));
      this.addClick(this.ui.rankBtn, new Laya.Handler(this, this.onRank));
    }
    onRank() {
      UIMgr.inst.openByEvent("rankView" /* rankView */, EventDef.showRank);
      MainModel_default.sendrank();
    }
    randomMusic() {
      let index = MathUtil.rand(0, 2);
      SoundManager_default.changeMusic("HomeLobby_" + index);
    }
    onOpened(param) {
      this.randomMusic();
      this.addEvent(EventDef.onStartGame, this.onResStart);
      if (param) {
        this.needSend = true;
      } else {
        this.needSend = false;
      }
    }
    onSetting() {
      UIMgr.inst.open("FreeWinView" /* FreeWinView */, { state: 1 });
    }
    onPlay() {
      if (this.needSend && !MainModel_default.hasGame()) {
        MainModel_default.sendgameStart();
      } else {
        this.onResStart();
      }
    }
    onResStart() {
      this.close();
      UIMgr.inst.openGameView(this.needSend);
    }
  };
  StartViewUI = __decorateClass([
    regClass27("iHfhRgAYTN2Z7or87cJFLw")
  ], StartViewUI);

  // src/UI/TipsViewUI.ts
  var { regClass: regClass28, property: property28 } = Laya;
  var TipsViewUI = class extends UIBase {
    onInit() {
      this.tipsBox = this._ui.getChildByName("tipsBox");
      this.tips = this.tipsBox.getChildByName("tips");
      this.showStrArr = [];
    }
    onOpened(param) {
      if (this.showStrArr.indexOf(param) == -1) {
        this.showStrArr.push(param);
      }
      this.updateTween();
    }
    updateTween() {
      if (this.tween) {
        return;
      }
      this.tipsBox.alpha = 0;
      this.tips.text = this.showStrArr[0];
      this.tween = Laya.Tween.to(this.tipsBox, { alpha: 1 }, 200);
      Laya.Tween.to(this.tipsBox, { alpha: 0 }, 200, null, Laya.Handler.create(this, this.onTweenComplete), 1e3);
    }
    //上个tips缓动结束,如果是最后一个则关闭界面
    onTweenComplete() {
      this.showStrArr.splice(0, 1);
      if (this.showStrArr.length > 0) {
        this.tween = null;
        this.updateTween();
      } else {
        this.close();
      }
    }
    onClosed() {
      Laya.Tween.clearAll(this.tipsBox);
      this.showStrArr = [];
      this.tween = null;
    }
  };
  TipsViewUI = __decorateClass([
    regClass28("GCuusXtTQDul7bd1wYBD7Q")
  ], TipsViewUI);

  // src/UI/WaitViewUI.ts
  var { regClass: regClass29, property: property29 } = Laya;
  var WaitViewUI = class extends UIBase {
    onInit() {
      this.waitBox = this.owner.getChildByName("waitBox");
      this.wait = this.waitBox.getChildByName("wait");
    }
    onOpened(param) {
      this.waitBox.visible = false;
      Laya.timer.clearAll(this);
      if (param) {
        Laya.timer.once(3e3, this, this.showWait);
      }
    }
    showWait() {
      this.waitBox.visible = true;
    }
    onUpdate() {
      if (this.waitBox.visible) {
        this.wait.rotation = this.wait.rotation + 5;
      }
    }
    onClosed() {
      this.timer.clearAll(this);
    }
    onDestroyed() {
      if (this.timer) {
        this.timer.destroy();
      }
    }
  };
  WaitViewUI = __decorateClass([
    regClass29("oYez6NPYTYeV563nWMK3Nw")
  ], WaitViewUI);

  // src/UI/WinViewUI.ts
  var { regClass: regClass30, property: property30 } = Laya;
  var WinUI = class extends UIBase {
    get ui() {
      return this._ui;
    }
    onInit() {
      this.coinBox = this.ui.coinBox.getComponent(CoinBox);
      this.winAni = this.ui.starSp.getComponent(Laya.Spine2DRenderNode);
      let offset = -(Laya.stage.height - 1557) / 2;
      this.ui.starSp.centerY = PlayerData_default.hall ? 0 : offset;
    }
    onOpened(param) {
      SoundManager_default.playSound("gem_show");
      this.ui.winLab.visible = true;
      this.ui.winLab.text = param + "";
      this.winAni.enabled = false;
      this.ui.starIcon.visible = false;
      if (PlayerData_default.hall) {
        this.ui.coinBox.visible = false;
        this.ui.starIcon.visible = true;
        this.ui.starSp.alpha = 0;
        this.TweenTo(this.ui.starSp, { alpha: 1 }, 300);
        this.timer.once(1e4, this, this.close);
        this.clickClose = true;
      } else {
        this.coinBox.setCoinNum(MainModel_default.star - param);
        this.winAni.enabled = true;
        this.winAni.playbackRate(1.5);
        UiUtils.playSpine(this.winAni, "xx", Laya.Handler.create(this, this.close));
        this.timer.once(1e3, this, () => {
          this.ui.winLab.visible = false;
        }, [], false);
      }
      this.timer.once(1300, this, () => {
        MainModel_default.updateCoinShow();
        this.coinBox.setCoinNum(MainModel_default.star, true);
        SoundManager_default.playSound("score_count");
      }, [], false);
    }
    onClosed() {
      MainModel_default.updateCoinShow();
    }
  };
  WinUI = __decorateClass([
    regClass30("btJ8QlKaRMGbDAyXIVGq5A")
  ], WinUI);

  // src/View/FreeWinView.generated.ts
  var FreeWinViewBase = class extends Laya.Box {
  };

  // src/View/FreeWinView.ts
  var { regClass: regClass31 } = Laya;
  var FreeWinView = class extends FreeWinViewBase {
  };
  FreeWinView = __decorateClass([
    regClass31("KrQrowKRQMmM7o8o6viTag")
  ], FreeWinView);

  // src/View/GameView.generated.ts
  var GameViewBase = class extends Laya.Box {
  };

  // src/View/GameView.ts
  var { regClass: regClass32 } = Laya;
  var GameView = class extends GameViewBase {
  };
  GameView = __decorateClass([
    regClass32("My_5HTtRQnGt9mYvm_YFOg")
  ], GameView);

  // src/View/GuideView.generated.ts
  var GuideViewBase = class extends Laya.Box {
  };

  // src/View/GuideView.ts
  var { regClass: regClass33 } = Laya;
  var GuideView = class extends GuideViewBase {
  };
  GuideView = __decorateClass([
    regClass33("yFoIVArmQNOb-ddj5mU8ww")
  ], GuideView);

  // src/View/LoadingView.generated.ts
  var LoadingViewBase = class extends Laya.Box {
  };

  // src/View/LoadingView.ts
  var { regClass: regClass34 } = Laya;
  var LoadingView = class extends LoadingViewBase {
  };
  LoadingView = __decorateClass([
    regClass34("rSw2K51CTjGQfSfM5aDKlQ")
  ], LoadingView);

  // src/View/LvupView.generated.ts
  var LvupViewBase = class extends Laya.Box {
  };

  // src/View/LvupView.ts
  var { regClass: regClass35 } = Laya;
  var LvupView = class extends LvupViewBase {
  };
  LvupView = __decorateClass([
    regClass35("1O0A775yTfqTCF_xdK6RFw")
  ], LvupView);

  // src/View/Main.generated.ts
  var MainBase = class extends Laya.Scene {
  };

  // src/View/Main.ts
  var { regClass: regClass36 } = Laya;
  var Main = class extends MainBase {
  };
  Main = __decorateClass([
    regClass36("P8tRmVAQQsKgur_TjLuHPg")
  ], Main);

  // src/View/RankView.generated.ts
  var RankViewBase = class extends Laya.Box {
  };

  // src/View/RankView.ts
  var { regClass: regClass37 } = Laya;
  var RankView = class extends RankViewBase {
  };
  RankView = __decorateClass([
    regClass37("wBzKHSIMRoWrH4r3iDPStw")
  ], RankView);

  // src/View/ReviveView.generated.ts
  var ReviveViewBase = class extends Laya.Box {
  };

  // src/View/ReviveView.ts
  var { regClass: regClass38 } = Laya;
  var ReviveView = class extends ReviveViewBase {
  };
  ReviveView = __decorateClass([
    regClass38("N2-0HuUoQeGMPi9ScYvenQ")
  ], ReviveView);

  // src/View/StartView.generated.ts
  var StartViewBase = class extends Laya.Box {
  };

  // src/View/StartView.ts
  var { regClass: regClass39 } = Laya;
  var StartView = class extends StartViewBase {
  };
  StartView = __decorateClass([
    regClass39("rcrT7s4VRXyN-E9kzUlNvA")
  ], StartView);

  // src/View/WinView.generated.ts
  var WinViewBase = class extends Laya.Box {
  };

  // src/View/WinView.ts
  var { regClass: regClass40 } = Laya;
  var WinView = class extends WinViewBase {
  };
  WinView = __decorateClass([
    regClass40("UsdbKqoqR1ian1djBQqFHw")
  ], WinView);

  // src/View/buyStarView.generated.ts
  var buyStarViewBase = class extends Laya.Box {
  };

  // src/View/buyStarView.ts
  var { regClass: regClass41 } = Laya;
  var buyStarView = class extends buyStarViewBase {
  };
  buyStarView = __decorateClass([
    regClass41("uIxqFXIESTmlWLD_wCimyQ")
  ], buyStarView);

  // src/View/dailyTaskView.generated.ts
  var dailyTaskViewBase = class extends Laya.Box {
  };

  // src/View/dailyTaskView.ts
  var { regClass: regClass42 } = Laya;
  var dailyTaskView = class extends dailyTaskViewBase {
  };
  dailyTaskView = __decorateClass([
    regClass42("u9R2V85OQNGssbjaUURSsA")
  ], dailyTaskView);

  // src/View/gameOverView.generated.ts
  var gameOverViewBase = class extends Laya.Box {
  };

  // src/View/gameOverView.ts
  var { regClass: regClass43 } = Laya;
  var gameOverView = class extends gameOverViewBase {
  };
  gameOverView = __decorateClass([
    regClass43("NFXxBjt6SCG2ICn4QASPWg")
  ], gameOverView);

  // src/View/reviveDialogView.generated.ts
  var reviveDialogViewBase = class extends Laya.Box {
  };

  // src/View/reviveDialogView.ts
  var { regClass: regClass44 } = Laya;
  var reviveDialogView = class extends reviveDialogViewBase {
  };
  reviveDialogView = __decorateClass([
    regClass44("K-E2b_K7QV-8V8ELpaoxPA")
  ], reviveDialogView);
})();
