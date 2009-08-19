function TerminalDepot() {

	this.firstUseComplete = undefined;
	
	this.depot = new Mojo.Depot({ name: "org.webosinternals.terminal", version: 1 },
			this._depotReady.bind(this));

}

TerminalDepot.prototype.isFirstUseComplete = function() {
	return this.firstUseComplete;
}

TerminalDepot.prototype.setFirstUseComplete = function() {
	this.firstUseComplete = true;
	this.depot.simpleAdd('firstUseComplete', true);
}

TerminalDepot.prototype.setPreferences = function(prefs) {
	this.depot.simpleAdd('preferences', prefs);
}

TerminalDepot.prototype.getPreferences = function(callback) {
	this.depot.simpleGet('preferences', callback);
}

TerminalDepot.prototype._depotReady = function() {
	this.depot.simpleGet('firstUseComplete', function(firstUseComplete) {
		Mojo.Log.info("firstUseComplete = "+firstUseComplete);
		this.firstUseComplete = firstUseComplete;
	}.bind(this));
}