Prefs = {}
Prefs.fontWidth=8;
Prefs.fontHeight=8;
Prefs.fgColor=7;
Prefs.bgColor=0;
Prefs.user = "root";

function SessionAssistant() {

	this.termplugin	= undefined;
	this.placeholder = undefined;
	this.headerHeight = undefined;
	this.footerHeight = undefined;
	this.terminalWidth = undefined;
	this.terminalHeight = undefined;
	this.scroller = undefined;

	//this._onKeyDownEventHandler = this._onKeyDownEvent.bind(this);
	this.keyStatesChanged = this._keyStatesChanged.bind(this);
	
}

SessionAssistant.prototype.prefsGet = function(val) {
	try {
		//Mojo.Log.info("SessionAssistant#prefsGet");
		if(val) {
			//Mojo.Log.info("got prefs from DB: fg:" + val.fgColor + ", Prefs.fgColor:" + Prefs.fgColor + ", bg:" + val.bgColor + ", Prefs.bgColor:" + Prefs.bgColor + ", Prefs.user:[" + Prefs.user + "]");
			Prefs = val;
			if(!Prefs.user)
				Prefs.user = "root";
			this.termplugin.setColors(Prefs.fgColor,Prefs.bgColor);
			this.termplugin.setFont(Prefs.fontWidth,Prefs.fontHeight);
			this.termplugin.setTerminalHeight(this.terminalHeight);
		} else {
			Mojo.Log.warn("Prefs get() has no val!");
		}
		this.termplugin.drawEnabled = true;
	} catch (e) {
		Mojo.Log.logException(e, 'SessionAssistant#prefsGet');
	}
	delete this.db;
}

SessionAssistant.prototype.prefsOpenReadOk = function() {
	try {
		//Mojo.Log.info("SessionAssistant#prefsOpenReadOk");
		this.db.get(
				"prefs",
				this.prefsGet.bind(this),
				function()
					{
					Mojo.Log.warn("Prefs get() FAILED!");
					this.termplugin.drawEnabled = true;
					}
				);
	} catch (e) {
		Mojo.Log.logException(e, 'SessionAssistant#prefsOpenReadOk');
	}
}
SessionAssistant.prototype.prefsRead = function() {
	try {
		//Mojo.Log.info("SessionAssistant#prefsRead");
		this.db = new Mojo.Depot(
			{ name:"terminalPrefs", version:1, estimatedSize:100, replace:false },
			this.prefsOpenReadOk.bind(this),
			function(result)
				{
				Mojo.log.warn("Can't open Prefs DB:", result);
				delete this.db;
				this.termplugin.drawEnabled = true;
				}
			);
	} catch (e) {
		Mojo.Log.logException(e, 'SessionAssistant#prefsRead');
	}
}
SessionAssistant.prototype.setup = function() {

	try {

		//Mojo.Log.info("SessionAssistant#setup");
		this.prefsRead();
		var targetWindow = this.controller.window;
		if (targetWindow.PalmSystem && targetWindow.PalmSystem.setWindowOrientation) {
			targetWindow.PalmSystem.setWindowOrientation("free");
		}
		delete targetWindow;

		var attributes = {
                omitDefaultItems: true
		}

		var model = {
				visible: true,
				items: [
			            {label: "New Session", command: 'do-newSession'},
			            {label: "Non-Obvious Keys...", command: 'do-keys'},
			            {label: "Preferences...", command: 'do-prefs'},
				        ]
		}
		
		this.controller.setupWidget(Mojo.Menu.appMenu, attributes, model);

		// Allow override of 'back' gesture in landscape mode.
		this.controller.useLandscapePageUpDown(true);

		//this.controller.enableFullScreenMode(true);

		this.scroller = this.controller.get('scrollerId');

		//this.controller.document.addEventListener("keydown", this._onKeyDownEventHandler, true);

		this.terminalWidth = this.controller.window.innerWidth;
		this.terminalHeight = this.controller.window.innerHeight;

		this.termplugin = this.controller.document.createElement('object');
		this.termplugin.setAttribute('type', 'application/x-webosinternals-termplugin');
		this.termplugin.setAttribute('width', this.terminalWidth);
		this.termplugin.setAttribute('height', 1000*8);
		//this.termplugin.setAttribute('style', 'padding-bottom: 44px;');

		//this.controller.document.addEventListener("keydown", this._onKeyDownEventHandler, true);

		this.placeholder = this.controller.get('install_object_here');
		this.placeholder.parentNode.replaceChild(this.termplugin, this.placeholder);
		this.termplugin.drawEnabled = false;		//	don't draw anything untill we read prefs
		//this.termplugin.setAttribute("x-palm-cache-plugin", true);
		this.termplugin.setAttribute(Mojo.Gesture.consumesEnterAttribute,true);


	} catch (e) {

		//Mojo.Log.logException(e, 'SessionAssistant#setup');

	}

	this.scroller.setStyle({'height':this.terminalHeight+5+'px'});

}


SessionAssistant.prototype._keyStatesChanged = function(gesture, red, sym, shift) {
//	0 - Off
//	1 - On
//	2 - Locked (on)
	try {
		//Mojo.Log.info("*** _keyStatesChanged: gesture:" + gesture + " red:" + red + " sym:" + sym + " shift:" + shift);
	} catch(e) {
		Mojo.Log.logException(e);
	}
}

SessionAssistant.prototype.activate = function(event) {
	try {
		//Mojo.Log.info("SessionAssistant#activate");
		//Mojo.Log.info("this.terminalWidth:" + this.terminalWidth + ", this.terminalHeight:" + this.terminalHeight);
		if ((typeof this.termplugin.setFont) == 'function') { // to test if the plugin is there
			this.termplugin.setFont(Prefs.fontWidth, Prefs.fontHeight);
			this.termplugin.setTerminalHeight(this.terminalHeight);
			this.termplugin.start(Prefs.user);
			//this.controller.document.addEventListener("keydown", this._onKeyDownEventHandler, true);
			this.termplugin.scroller = this.scroller; //	store the scroller object in plugin, so that plugin can scroll as needed
			this.termplugin.keyStatesParentObj = this;
			//Mojo.Log.info("setColors(" + Prefs.fgColor, Prefs.bgColor + ")");
			this.termplugin.setColors(Prefs.fgColor, Prefs.bgColor);
			this.termplugin.focus();
			this.scroller.mojo.revealBottom();
		} else {
			this.controller.showAlertDialog({
			    onChoose: function(value) {},
				allowHTMLMessage: true,
			    title: 'Terminal',
			    message: 'Termplugin is not installed. This app is unusable without it.',
			    choices:[{label:$L('Ok'), value:""}]
		    });
		}
	} catch (e) {
		Mojo.Log.logException(e, 'SessionAssistant#activate');
	}
}


SessionAssistant.prototype.deactivate = function(event) {
	//Mojo.Log.info("SessionAssistant#deactivate");
	this.termplugin.scroller = undefined;
	this.termplugin.keyStatesParentObj = undefined;
	//this.controller.document.removeEventListener("keydown", this._onKeyDownEventHandler, true);
	////Mojo.Event.stopListening(this._onKeyDownEventHandler, "keydown", );

}
SessionAssistant.prototype.orientationChanged = function(orientation) {
	//Mojo.Log.info("SessionAssistant#orientationChanged");
	this.terminalWidth = this.controller.window.innerWidth;
	this.terminalHeight = this.controller.window.innerHeight;
	this.termplugin.width = this.terminalWidth;
	this.scroller.setStyle({'height':this.terminalHeight+5+'px'});
	this.termplugin.setTerminalHeight(this.terminalHeight);
	//Mojo.Log.info("SessionAssistant#orientationChanged: this.terminalWidth:" + this.terminalWidth + ", this.terminalHeight:" + this.terminalHeight);
}

SessionAssistant.prototype.cleanup = function(event) {

	//Mojo.Log.info("SessionAssistant#cleanup");

}
/*
SessionAssistant.prototype._onKeyDownEvent = function(event) {

	if (event.keyCode==13) {
		this.termplugin.sendEnter();
	}

}
*/

SessionAssistant.prototype.newCard = function(scene, stagename)
{
	var appController = Mojo.Controller.getAppController();
	var stageController = appController.getStageController(stagename);
	if (stageController) {
		stageController.popScenesTo(scene);
		stageController.activate();
	} else {
		var f = function(stageController) {
			stageController.pushScene(scene);       
		};
		appController.createStageWithCallback({name: stagename, lightweight: true}, f);
	}
}

SessionAssistant.prototype.handleCommand = function(event) {

	if (event.type == Mojo.Event.command) {

		switch (event.command) {

		case 'do-newSession':
			this.newCard("session", "session-"+Date.now());
			break;

		case 'do-prefs':
			var appController = Mojo.Controller.getAppController();
			var stageController = appController.getActiveStageController();
			stageController.pushScene('prefs');
			//this.newCard("prefs", "prefs");
			break;

		case 'do-keys':
			this.newCard("keys", "keys");
			break;

		}

	}

}
