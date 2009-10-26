function AppAssistant(appController) {

	this.depot = new TerminalDepot();

}

AppAssistant.prototype.handleLaunch = function(params) {

	if (this.depot.isFirstUseComplete() !== true) {
		//console.log("\n\n     FIRST RUN NOT COMPLETE     \n\n");
		var defaults = {
				'fontWidth': 8,
				'fontHeight': 8,
				'fgColor': 7,
				'bgColor': 0
		}
		this.depot.setPreferences(defaults);
		this.depot.setFirstUseComplete();
	} else {
		//console.log("\n\n     FIRST RUN IS COMPLETE     \n\n");
	}

	try {

		var launchParams = {};

		if (Object.isString(params)) {
			if (params.isJSON()) {
				launchParams = params.evalJSON();
			}
		} else {
			launchParams = params;
		}

		if (Mojo.Controller.appInfo.noWindow) {

			var f = function(stageController) {

				if (launchParams.target) {
					launchParams.target = launchParams.target.stripScripts().stripTags();
				}

				var sceneParams = {
						launchParams: launchParams
				};

				stageController.pushScene({name:'session'}, sceneParams);

			};

			var stageName = "session-" + Date.now();
			this.controller.createStageWithCallback({name: stageName, lightweight: true}, f);

		} else if(params.banner) {

			//Mojo.Log.warn("Notifications not yet implemented.");

		}

	} catch (e) {

		Mojo.Log.logException(e, "AppAssistant#handleLaunch");

	}

}

AppAssistant.prototype.cleanup = function() {

}