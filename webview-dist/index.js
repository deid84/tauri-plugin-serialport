function e(e,t,i,n){return new(i||(i=Promise))((function(r,s){function a(e){try{o(n.next(e))}catch(e){s(e)}}function l(e){try{o(n.throw(e))}catch(e){s(e)}}function o(e){var t;e.done?r(e.value):(t=e.value,t instanceof i?t:new i((function(e){e(t)}))).then(a,l)}o((n=n.apply(e,t||[])).next())}))}function t(e,t){var i,n,r,s,a={label:0,sent:function(){if(1&r[0])throw r[1];return r[1]},trys:[],ops:[]};return s={next:l(0),throw:l(1),return:l(2)},"function"==typeof Symbol&&(s[Symbol.iterator]=function(){return this}),s;function l(l){return function(o){return function(l){if(i)throw new TypeError("Generator is already executing.");for(;s&&(s=0,l[0]&&(a=0)),a;)try{if(i=1,n&&(r=2&l[0]?n.return:l[0]?n.throw||((r=n.return)&&r.call(n),0):n.next)&&!(r=r.call(n,l[1])).done)return r;switch(n=0,r&&(l=[2&l[0],r.value]),l[0]){case 0:case 1:r=l;break;case 4:return a.label++,{value:l[1],done:!1};case 5:a.label++,n=l[1],l=[0];continue;case 7:l=a.ops.pop(),a.trys.pop();continue;default:if(!(r=a.trys,(r=r.length>0&&r[r.length-1])||6!==l[0]&&2!==l[0])){a=0;continue}if(3===l[0]&&(!r||l[1]>r[0]&&l[1]<r[3])){a.label=l[1];break}if(6===l[0]&&a.label<r[1]){a.label=r[1],r=l;break}if(r&&a.label<r[2]){a.label=r[2],a.ops.push(l);break}r[2]&&a.ops.pop(),a.trys.pop();continue}l=t.call(e,a)}catch(e){l=[6,e],n=0}finally{i=r=0}if(5&l[0])throw l[1];return{value:l[0]?l[1]:void 0,done:!0}}([l,o])}}}function i(e,t=!1){return window.__TAURI_INTERNALS__.transformCallback(e,t)}async function n(e,t={},i){return window.__TAURI_INTERNALS__.invoke(e,t,i)}"function"==typeof SuppressedError&&SuppressedError,"function"==typeof SuppressedError&&SuppressedError;class r{constructor(e,t){this.type="Logical",this.width=e,this.height=t}}class s{constructor(e,t){this.type="Physical",this.width=e,this.height=t}toLogical(e){return new r(this.width/e,this.height/e)}}class a{constructor(e,t){this.type="Logical",this.x=e,this.y=t}}class l{constructor(e,t){this.type="Physical",this.x=e,this.y=t}toLogical(e){return new a(this.x/e,this.y/e)}}var o,u,c;async function h(e,t){await n("plugin:event|unlisten",{event:e,eventId:t})}async function p(e,t,r){return n("plugin:event|listen",{event:e,windowLabel:r?.target,handler:i(t)}).then((t=>async()=>h(e,t)))}!function(e){e.WINDOW_RESIZED="tauri://resize",e.WINDOW_MOVED="tauri://move",e.WINDOW_CLOSE_REQUESTED="tauri://close-requested",e.WINDOW_CREATED="tauri://window-created",e.WINDOW_DESTROYED="tauri://destroyed",e.WINDOW_FOCUS="tauri://focus",e.WINDOW_BLUR="tauri://blur",e.WINDOW_SCALE_FACTOR_CHANGED="tauri://scale-change",e.WINDOW_THEME_CHANGED="tauri://theme-changed",e.WINDOW_FILE_DROP="tauri://file-drop",e.WINDOW_FILE_DROP_HOVER="tauri://file-drop-hover",e.WINDOW_FILE_DROP_CANCELLED="tauri://file-drop-cancelled"}(o||(o={})),function(e){e[e.Critical=1]="Critical",e[e.Informational=2]="Informational"}(u||(u={}));class d{constructor(e){this._preventDefault=!1,this.event=e.event,this.windowLabel=e.windowLabel,this.id=e.id}preventDefault(){this._preventDefault=!0}isPreventDefault(){return this._preventDefault}}function w(){return new g(window.__TAURI_INTERNALS__.metadata.currentWindow.label,{skip:!0})}function b(){return window.__TAURI_INTERNALS__.metadata.windows.map((e=>new g(e.label,{skip:!0})))}!function(e){e.None="none",e.Normal="normal",e.Indeterminate="indeterminate",e.Paused="paused",e.Error="error"}(c||(c={}));const y=["tauri://created","tauri://error"];class g{constructor(e,t={}){this.label=e,this.listeners=Object.create(null),t?.skip||n("plugin:window|create",{options:{...t,label:e}}).then((async()=>this.emit("tauri://created"))).catch((async e=>this.emit("tauri://error",e)))}static getByLabel(e){return b().some((t=>t.label===e))?new g(e,{skip:!0}):null}static getCurrent(){return w()}static getAll(){return b()}static async getFocusedWindow(){for(const e of b())if(await e.isFocused())return e;return null}async listen(e,t){return this._handleTauriEvent(e,t)?Promise.resolve((()=>{const i=this.listeners[e];i.splice(i.indexOf(t),1)})):p(e,t,{target:this.label})}async once(e,t){return this._handleTauriEvent(e,t)?Promise.resolve((()=>{const i=this.listeners[e];i.splice(i.indexOf(t),1)})):async function(e,t,i){return p(e,(i=>{t(i),h(e,i.id).catch((()=>{}))}),i)}(e,t,{target:this.label})}async emit(e,t){if(y.includes(e)){for(const i of this.listeners[e]||[])i({event:e,id:-1,windowLabel:this.label,payload:t});return Promise.resolve()}return async function(e,t,i){await n("plugin:event|emit",{event:e,windowLabel:i?.target,payload:t})}(e,t,{target:this.label})}_handleTauriEvent(e,t){return!!y.includes(e)&&(e in this.listeners?this.listeners[e].push(t):this.listeners[e]=[t],!0)}async scaleFactor(){return n("plugin:window|scale_factor",{label:this.label})}async innerPosition(){return n("plugin:window|inner_position",{label:this.label}).then((({x:e,y:t})=>new l(e,t)))}async outerPosition(){return n("plugin:window|outer_position",{label:this.label}).then((({x:e,y:t})=>new l(e,t)))}async innerSize(){return n("plugin:window|inner_size",{label:this.label}).then((({width:e,height:t})=>new s(e,t)))}async outerSize(){return n("plugin:window|outer_size",{label:this.label}).then((({width:e,height:t})=>new s(e,t)))}async isFullscreen(){return n("plugin:window|is_fullscreen",{label:this.label})}async isMinimized(){return n("plugin:window|is_minimized",{label:this.label})}async isMaximized(){return n("plugin:window|is_maximized",{label:this.label})}async isFocused(){return n("plugin:window|is_focused",{label:this.label})}async isDecorated(){return n("plugin:window|is_decorated",{label:this.label})}async isResizable(){return n("plugin:window|is_resizable",{label:this.label})}async isMaximizable(){return n("plugin:window|is_maximizable",{label:this.label})}async isMinimizable(){return n("plugin:window|is_minimizable",{label:this.label})}async isClosable(){return n("plugin:window|is_closable",{label:this.label})}async isVisible(){return n("plugin:window|is_visible",{label:this.label})}async title(){return n("plugin:window|title",{label:this.label})}async theme(){return n("plugin:window|theme",{label:this.label})}async center(){return n("plugin:window|center",{label:this.label})}async requestUserAttention(e){let t=null;return e&&(t=e===u.Critical?{type:"Critical"}:{type:"Informational"}),n("plugin:window|request_user_attention",{label:this.label,value:t})}async setResizable(e){return n("plugin:window|set_resizable",{label:this.label,value:e})}async setMaximizable(e){return n("plugin:window|set_maximizable",{label:this.label,value:e})}async setMinimizable(e){return n("plugin:window|set_minimizable",{label:this.label,value:e})}async setClosable(e){return n("plugin:window|set_closable",{label:this.label,value:e})}async setTitle(e){return n("plugin:window|set_title",{label:this.label,value:e})}async maximize(){return n("plugin:window|maximize",{label:this.label})}async unmaximize(){return n("plugin:window|unmaximize",{label:this.label})}async toggleMaximize(){return n("plugin:window|toggle_maximize",{label:this.label})}async minimize(){return n("plugin:window|minimize",{label:this.label})}async unminimize(){return n("plugin:window|unminimize",{label:this.label})}async show(){return n("plugin:window|show",{label:this.label})}async hide(){return n("plugin:window|hide",{label:this.label})}async close(){return n("plugin:window|close",{label:this.label})}async setDecorations(e){return n("plugin:window|set_decorations",{label:this.label,value:e})}async setShadow(e){return n("plugin:window|set_shadow",{label:this.label,value:e})}async setEffects(e){return n("plugin:window|set_effects",{label:this.label,value:e})}async clearEffects(){return n("plugin:window|set_effects",{label:this.label,value:null})}async setAlwaysOnTop(e){return n("plugin:window|set_always_on_top",{label:this.label,value:e})}async setAlwaysOnBottom(e){return n("plugin:window|set_always_on_bottom",{label:this.label,value:e})}async setContentProtected(e){return n("plugin:window|set_content_protected",{label:this.label,value:e})}async setSize(e){if(!e||"Logical"!==e.type&&"Physical"!==e.type)throw new Error("the `size` argument must be either a LogicalSize or a PhysicalSize instance");return n("plugin:window|set_size",{label:this.label,value:{type:e.type,data:{width:e.width,height:e.height}}})}async setMinSize(e){if(e&&"Logical"!==e.type&&"Physical"!==e.type)throw new Error("the `size` argument must be either a LogicalSize or a PhysicalSize instance");return n("plugin:window|set_min_size",{label:this.label,value:e?{type:e.type,data:{width:e.width,height:e.height}}:null})}async setMaxSize(e){if(e&&"Logical"!==e.type&&"Physical"!==e.type)throw new Error("the `size` argument must be either a LogicalSize or a PhysicalSize instance");return n("plugin:window|set_max_size",{label:this.label,value:e?{type:e.type,data:{width:e.width,height:e.height}}:null})}async setPosition(e){if(!e||"Logical"!==e.type&&"Physical"!==e.type)throw new Error("the `position` argument must be either a LogicalPosition or a PhysicalPosition instance");return n("plugin:window|set_position",{label:this.label,value:{type:e.type,data:{x:e.x,y:e.y}}})}async setFullscreen(e){return n("plugin:window|set_fullscreen",{label:this.label,value:e})}async setFocus(){return n("plugin:window|set_focus",{label:this.label})}async setIcon(e){return n("plugin:window|set_icon",{label:this.label,value:"string"==typeof e?e:Array.from(e)})}async setSkipTaskbar(e){return n("plugin:window|set_skip_taskbar",{label:this.label,value:e})}async setCursorGrab(e){return n("plugin:window|set_cursor_grab",{label:this.label,value:e})}async setCursorVisible(e){return n("plugin:window|set_cursor_visible",{label:this.label,value:e})}async setCursorIcon(e){return n("plugin:window|set_cursor_icon",{label:this.label,value:e})}async setCursorPosition(e){if(!e||"Logical"!==e.type&&"Physical"!==e.type)throw new Error("the `position` argument must be either a LogicalPosition or a PhysicalPosition instance");return n("plugin:window|set_cursor_position",{label:this.label,value:{type:e.type,data:{x:e.x,y:e.y}}})}async setIgnoreCursorEvents(e){return n("plugin:window|set_ignore_cursor_events",{label:this.label,value:e})}async startDragging(){return n("plugin:window|start_dragging",{label:this.label})}async setProgressBar(e){return n("plugin:window|set_progress_bar",{label:this.label,value:e})}async onResized(e){return this.listen(o.WINDOW_RESIZED,(t=>{var i;t.payload=(i=t.payload,new s(i.width,i.height)),e(t)}))}async onMoved(e){return this.listen(o.WINDOW_MOVED,(t=>{t.payload=v(t.payload),e(t)}))}async onCloseRequested(e){return this.listen(o.WINDOW_CLOSE_REQUESTED,(t=>{const i=new d(t);Promise.resolve(e(i)).then((()=>{if(!i.isPreventDefault())return this.close()}))}))}async onFocusChanged(e){const t=await this.listen(o.WINDOW_FOCUS,(t=>{e({...t,payload:!0})})),i=await this.listen(o.WINDOW_BLUR,(t=>{e({...t,payload:!1})}));return()=>{t(),i()}}async onScaleChanged(e){return this.listen(o.WINDOW_SCALE_FACTOR_CHANGED,e)}async onFileDropEvent(e){const t=await this.listen(o.WINDOW_FILE_DROP,(t=>{e({...t,payload:{type:"drop",paths:t.payload.paths,position:v(t.payload.position)}})})),i=await this.listen(o.WINDOW_FILE_DROP_HOVER,(t=>{e({...t,payload:{type:"hover",paths:t.payload.paths,position:v(t.payload.position)}})})),n=await this.listen(o.WINDOW_FILE_DROP_CANCELLED,(t=>{e({...t,payload:{type:"cancel"}})}));return()=>{t(),i(),n()}}async onThemeChanged(e){return this.listen(o.WINDOW_THEME_CHANGED,e)}}var f,m;function v(e){return new l(e.x,e.y)}!function(e){e.AppearanceBased="appearanceBased",e.Light="light",e.Dark="dark",e.MediumLight="mediumLight",e.UltraDark="ultraDark",e.Titlebar="titlebar",e.Selection="selection",e.Menu="menu",e.Popover="popover",e.Sidebar="sidebar",e.HeaderView="headerView",e.Sheet="sheet",e.WindowBackground="windowBackground",e.HudWindow="hudWindow",e.FullScreenUI="fullScreenUI",e.Tooltip="tooltip",e.ContentBackground="contentBackground",e.UnderWindowBackground="underWindowBackground",e.UnderPageBackground="underPageBackground",e.Mica="mica",e.Blur="blur",e.Acrylic="acrylic",e.Tabbed="tabbed",e.TabbedDark="tabbedDark",e.TabbedLight="tabbedLight"}(f||(f={})),function(e){e.FollowsWindowActiveState="followsWindowActiveState",e.Active="active",e.Inactive="inactive"}(m||(m={}));var _=function(){function i(e){this.isOpen=!1,this.encoding=e.encoding||"utf-8",this.options={portName:e.portName,baudRate:e.baudRate,dataBits:e.dataBits||8,flowControl:e.flowControl||null,parity:e.parity||null,stopBits:e.stopBits||2,timeout:e.timeout||200},this.size=e.size||1024}return i.available_ports=function(){return e(this,void 0,void 0,(function(){var e;return t(this,(function(t){switch(t.label){case 0:return t.trys.push([0,2,,3]),[4,n("plugin:serialport|available_ports")];case 1:return[2,t.sent()];case 2:return e=t.sent(),[2,Promise.reject(e)];case 3:return[2]}}))}))},i.forceClose=function(i){return e(this,void 0,void 0,(function(){return t(this,(function(e){switch(e.label){case 0:return[4,n("plugin:serialport|force_close",{portName:i})];case 1:return[2,e.sent()]}}))}))},i.closeAll=function(){return e(this,void 0,void 0,(function(){return t(this,(function(e){switch(e.label){case 0:return[4,n("plugin:serialport|close_all")];case 1:return[2,e.sent()]}}))}))},i.prototype.cancelListen=function(){return e(this,void 0,void 0,(function(){return t(this,(function(e){try{return this.unListen&&(this.unListen(),this.unListen=void 0),[2]}catch(e){return[2,Promise.reject("Failed to cancel serial monitoring: "+e)]}return[2]}))}))},i.prototype.cancelRead=function(){return e(this,void 0,void 0,(function(){var e;return t(this,(function(t){switch(t.label){case 0:return t.trys.push([0,2,,3]),[4,n("plugin:serialport|cancel_read",{portName:this.options.portName})];case 1:return[2,t.sent()];case 2:return e=t.sent(),[2,Promise.reject(e)];case 3:return[2]}}))}))},i.prototype.change=function(i){return e(this,void 0,void 0,(function(){var e,n;return t(this,(function(t){switch(t.label){case 0:return t.trys.push([0,5,,6]),e=!1,this.isOpen?(e=!0,[4,this.close()]):[3,2];case 1:t.sent(),t.label=2;case 2:return i.portName&&(this.options.portName=i.portName),i.baudRate&&(this.options.baudRate=i.baudRate),e?[4,this.open()]:[3,4];case 3:t.sent(),t.label=4;case 4:return[2,Promise.resolve()];case 5:return n=t.sent(),[2,Promise.reject(n)];case 6:return[2]}}))}))},i.prototype.close=function(){return e(this,void 0,void 0,(function(){var e,i;return t(this,(function(t){switch(t.label){case 0:return t.trys.push([0,4,,5]),this.isOpen?[4,this.cancelRead()]:[2];case 1:return t.sent(),[4,n("plugin:serialport|close",{portName:this.options.portName})];case 2:return e=t.sent(),[4,this.cancelListen()];case 3:return t.sent(),this.isOpen=!1,[2,e];case 4:return i=t.sent(),[2,Promise.reject(i)];case 5:return[2]}}))}))},i.prototype.listen=function(i,n){return void 0===n&&(n=!0),e(this,void 0,void 0,(function(){var e,r,s,a,l=this;return t(this,(function(t){switch(t.label){case 0:return t.trys.push([0,3,,4]),e=w(),[4,this.cancelListen()];case 1:return t.sent(),r="plugin-serialport-read-"+this.options.portName,s=this,[4,e.listen(r,(function(e){var t=e.payload;try{if(n){var r=new TextDecoder(l.encoding).decode(new Uint8Array(t.data));i(r)}else i(new Uint8Array(t.data))}catch(e){console.error(e)}}))];case 2:return s.unListen=t.sent(),[2];case 3:return a=t.sent(),[2,Promise.reject("Failed to monitor serial port data: "+a)];case 4:return[2]}}))}))},i.prototype.open=function(){return e(this,void 0,void 0,(function(){var e,i;return t(this,(function(t){switch(t.label){case 0:return t.trys.push([0,2,,3]),this.options.portName?this.options.baudRate?this.isOpen?[2]:[4,n("plugin:serialport|open",{portName:this.options.portName,baudRate:this.options.baudRate,dataBits:this.options.dataBits,flowControl:this.options.flowControl,parity:this.options.parity,stopBits:this.options.stopBits,timeout:this.options.timeout})]:[2,Promise.reject("BaudRate can not be empty!")]:[2,Promise.reject("Port name can not be empty!")];case 1:return e=t.sent(),this.isOpen=!0,[2,Promise.resolve(e)];case 2:return i=t.sent(),[2,Promise.reject(i)];case 3:return[2]}}))}))},i.prototype.read=function(i){return e(this,void 0,void 0,(function(){var e;return t(this,(function(t){switch(t.label){case 0:return t.trys.push([0,2,,3]),[4,n("plugin:serialport|read",{portName:this.options.portName,timeout:(null==i?void 0:i.timeout)||this.options.timeout,size:(null==i?void 0:i.size)||this.size})];case 1:return[2,t.sent()];case 2:return e=t.sent(),[2,Promise.reject(e)];case 3:return[2]}}))}))},i.prototype.setBaudRate=function(i){return e(this,void 0,void 0,(function(){var e,n;return t(this,(function(t){switch(t.label){case 0:return t.trys.push([0,5,,6]),e=!1,this.isOpen?(e=!0,[4,this.close()]):[3,2];case 1:t.sent(),t.label=2;case 2:return this.options.baudRate=i,e?[4,this.open()]:[3,4];case 3:t.sent(),t.label=4;case 4:return[2,Promise.resolve()];case 5:return n=t.sent(),[2,Promise.reject(n)];case 6:return[2]}}))}))},i.prototype.setPortName=function(i){return e(this,void 0,void 0,(function(){var e,n;return t(this,(function(t){switch(t.label){case 0:return t.trys.push([0,5,,6]),e=!1,this.isOpen?(e=!0,[4,this.close()]):[3,2];case 1:t.sent(),t.label=2;case 2:return this.options.portName=i,e?[4,this.open()]:[3,4];case 3:t.sent(),t.label=4;case 4:return[2,Promise.resolve()];case 5:return n=t.sent(),[2,Promise.reject(n)];case 6:return[2]}}))}))},i.prototype.write=function(i){return e(this,void 0,void 0,(function(){var e;return t(this,(function(t){switch(t.label){case 0:return t.trys.push([0,2,,3]),this.isOpen?[4,n("plugin:serialport|write",{value:i,portName:this.options.portName})]:[2,Promise.reject("Serial port ".concat(this.options.portName," not opened!"))];case 1:return[2,t.sent()];case 2:return e=t.sent(),[2,Promise.reject(e)];case 3:return[2]}}))}))},i.prototype.writeBinary=function(i){return e(this,void 0,void 0,(function(){var e;return t(this,(function(t){switch(t.label){case 0:return t.trys.push([0,4,,5]),this.isOpen?i instanceof Uint8Array||i instanceof Array?[4,n("plugin:serialport|write_binary",{value:Array.from(i),portName:this.options.portName})]:[3,2]:[2,Promise.reject("Serial port ".concat(this.options.portName," not opened!"))];case 1:return[2,t.sent()];case 2:return[2,Promise.reject("value type not admitted! Expected type: string, Uint8Array, number[]")];case 3:return[3,5];case 4:return e=t.sent(),[2,Promise.reject(e)];case 5:return[2]}}))}))},i}();export{_ as Serialport};
