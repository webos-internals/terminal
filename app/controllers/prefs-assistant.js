function PrefsAssistant() {

}

PrefsAssistant.prototype.prefsWriteDB = function() {
	try {
		this.db.removeAll(function() {Mojo.Log.info("Prefs removed!");}, function() {Mojo.Log.warn("Prefs NOT removed!");});
		//Mojo.Log.info("prefsWriteDB: Write to DB: fg:" + Prefs.fgColor + ", bg:" + Prefs.bgColor);
		this.db.add(
					"prefs",
					Prefs,
					function() {Mojo.Log.info("prefsWriteDB - Prefs saved!");},
					function() {Mojo.Log.warn("prefsWriteDB - Prefs NOT saved!");}
					);
	} catch (e) {
		Mojo.Log.logException(e, 'PrefsAssistant#prefsWriteDB');
	}
	delete this.db;
}
PrefsAssistant.prototype.prefsWrite = function() {
	try {
		//Mojo.Log.info("PrefsAssistant#prefsWrite");
		if(this.db) {
			this.prefsWriteDB();
		} else {
			this.db = new Mojo.Depot(
				{ name:"terminalPrefs", version:1, estimatedSize:100, replace:true },
				this.prefsWriteDB.bind(this),
				function(result)
					{
					Mojo.log.warn("Can't open Prefs DB:", result);
					delete this.db;
					}
				);
		}
	} catch (e) {
		Mojo.Log.logException(e, 'PrefsAssistant#prefsWrite');
	}
}

PrefsAssistant.prototype.setup = function() {
	
	this.fontChoices = [
	                    {label: '6x10', value: '6x10'},
	                    {label: '8x8', value: '8x8'},
	                    {label: '5x7', value: '5x7'},
	                    {label: '4x6', value: '4x6'},
	                    ];
	this.fontModel = {
			value: '8x8',
			disabled: false
	};
	if (Prefs.fontWidth==8) {
		this.fontModel.value = '8x8';
	} else if (Prefs.fontWidth==4) {
		this.fontModel.value = '4x6';
	} else if (Prefs.fontWidth==5) {
		this.fontModel.value = '5x7';
	} else if (Prefs.fontWidth==6) {
		this.fontModel.value = '6x10';
	}
	this.controller.setupWidget(
			'fontSelector',
			{
				label: "Size",
				choices: this.fontChoices,
			},
			this.fontModel
	);
	fontSelector = this.controller.get('fontSelector');
	Mojo.Event.listen(fontSelector, Mojo.Event.propertyChange, this.updateFont.bind(this))


	this.colorChoices = [
	                     {label: 'Black',   value:0},
	                     {label: 'Red',     value:1},
	                     {label: 'Green',   value:2},
	                     {label: 'Yellow',  value:3},
	                     {label: 'Blue',    value:4},
	                     {label: 'Magenta', value:5},
	                     {label: 'Cyan',    value:6},
	                     {label: 'White',   value:7}
	                     ];


	this.bgColorModel = { value: Prefs.bgColor, disabled: false };
	this.controller.setupWidget('bgColorSelector',	{ label: "Background", choices: this.colorChoices, }, this.bgColorModel);
	bgColorSelector = this.controller.get('bgColorSelector');
	Mojo.Event.listen(bgColorSelector, Mojo.Event.propertyChange, this.updateBgColor.bind(this));

	this.fgColorModel = { value:Prefs.fgColor, disabled: false };
	this.controller.setupWidget('fgColorSelector',	{ label: "Foreground", choices: this.colorChoices, }, this.fgColorModel);
	fgColorSelector = this.controller.get('fgColorSelector');
	Mojo.Event.listen(fgColorSelector, Mojo.Event.propertyChange, this.updateFgColor.bind(this));
	
}
/*
PrefsAssistant.prototype.deactivate = function(event) {
	Mojo.Log.info("PrefsAssistant#deactivate");
}
PrefsAssistant.prototype.cleanup = function(event) {

	Mojo.Log.info("PrefsAssistant#cleanup");
}

PrefsAssistant.prototype.handleCommand = function(event) {
	Mojo.Log.info("PrefsAssistant#handleCommand");
	if(event)
	{
		Mojo.Log.info("PrefsAssistant#handleCommand: event.type:[" + event.type + "]");
		if(event.type == Mojo.Event.back)
			Mojo.Log.info("PrefsAssistant#handleCommand: BACK");
	}
	else
		Mojo.Log.warn("PrefsAssistant#handleCommand: !event");
}
*/
PrefsAssistant.prototype.updateFont = function(event) {

	if (this.fontModel.value=='8x8') {
		Prefs.fontWidth=8;
		Prefs.fontHeight=8;
	} else if (this.fontModel.value=='4x6') {
		Prefs.fontWidth=4;
		Prefs.fontHeight=6;
	} else if (this.fontModel.value=='5x7') {
		Prefs.fontWidth=5;
		Prefs.fontHeight=7;
	} else if (this.fontModel.value=='6x10') {
		Prefs.fontWidth=6;
		Prefs.fontHeight=10;
	}
	this.prefsWrite();
}

PrefsAssistant.prototype.updateBgColor = function(event) {
	
	Prefs.bgColor = this.bgColorModel.value;
	this.prefsWrite();
}

PrefsAssistant.prototype.updateFgColor = function(event) {
	
	Prefs.fgColor = this.fgColorModel.value;
	this.prefsWrite();
}
