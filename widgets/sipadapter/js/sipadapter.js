"use strict";

console.log("start widget");

vis.binds.sipadapter = {
	version: "0.9.0",
    init: function (adapterInstance) {
		vis.binds.sipadapter.adapterInstance = adapterInstance;

		console.log("Passed init method");
	},
	initSIP: function(audioElement) {
		if(!vis.editMode) {
			vis.conn.getStates(null, (error, data) => {
				console.log("Start initSIP method");
				vis.updateStates(data);

				audioElement.volume = 0.5;

				vis.binds.sipadapter.sipAccount = new SIPWebRTCAccount();

				if (vis.binds.sipadapter.sipAccount.IsCorrectInitialized()) {
                    vis.binds.sipadapter.sipCommunication = new SIPWebRTCCommunication(vis.binds.sipadapter.sipAccount, audioElement);
                    vis.binds.sipadapter.sipCommunication.onCallIncoming = vis.binds.sipadapter.onCallIncoming;
					vis.binds.sipadapter.sipCommunication.onCallTerminated = vis.binds.sipadapter.onCallTerminated;
					vis.binds.sipadapter.sipCommunication.onCallConnected = vis.binds.sipadapter.onCallConnected;										
				} else {
					vis.binds.sipadapter.requestAsteriskAccountData(audioElement);
				}

				console.log("Passed initSIP method");
			});
		}
	},
	onCallIncoming: function() {
		console.log("call incoming");
		var remoteFriendlyName = vis.binds.sipadapter.sipCommunication.getRemoteFriendlyName();
		document.getElementById("callFromLabel").innerText = "Eingehender Anruf von " + remoteFriendlyName;
		vis.binds.sipadapter.showContainer("incomingCallContainer");
	},
	onCallTerminated: function() {
		console.log("call terminated");
		vis.binds.sipadapter.showContainer("makeCallContainer");		
	},
	onCallConnected: function() {
		var remoteFriendlyName = vis.binds.sipadapter.sipCommunication.getRemoteFriendlyName();
		document.getElementById("inCallLabel").innerText = "In Anruf mit " + remoteFriendlyName;
		vis.binds.sipadapter.showContainer("inCallContainer");
	},
	makeCall: function() {
		console.log("make call");
		var telephoneNumberInput = document.getElementById("telephone-number-input");
		var telephoneNumber = telephoneNumberInput.value;
		vis.binds.sipadapter.sipCommunication.makeCall(telephoneNumber);
		document.getElementById("inCallLabel").innerText = "Anruf an " + telephoneNumber;
		vis.binds.sipadapter.showContainer("inCallContainer");
	},
	acceptCall: function() {
		console.log("accept call");
		vis.binds.sipadapter.sipCommunication.acceptCall();
	},
	declineCall: function() {
		console.log("decline call");
		vis.binds.sipadapter.sipCommunication.declineCall();
	},
	endCall: function() {
		console.log("end call");
		vis.binds.sipadapter.sipCommunication.endCall();
	},
	showContainer : function(container) {
		document.getElementById("makeCallContainer").classList.add("hidden");	
		document.getElementById("incomingCallContainer").classList.add("hidden");	
		document.getElementById("inCallContainer").classList.add("hidden");	
		document.getElementById(container).classList.remove("hidden");		
	},	
	volumeDown: function() {
		console.log("volume down");
		var audioElement = document.getElementById("audioRemote");
		var volumeSlider = document.getElementById("volume-slider");
		var volume = Math.max(audioElement.volume - 0.1, 0.1);
		audioElement.volume = volume;
		volumeSlider.value = volume;
	},
	volumeUp: function() {
		console.log("volume up");
		var audioElement = document.getElementById("audioRemote");
		var volumeSlider = document.getElementById("volume-slider");
		var volume = Math.min(audioElement.volume + 0.1, 1.0);;
		audioElement.volume = volume;
		volumeSlider.value = volume;
	},
	onVolumeChanged: function() {
		var audioElement = document.getElementById("audioRemote");
		var volumeSlider = document.getElementById("volume-slider");
		audioElement.volume = volumeSlider.value;
	},
	requestAsteriskAccountData: function (audioElement) {
		console.log("Open dialog for asterisk account data.")
		const accountDataDialog = document.getElementById("sipAccountDataDialog");
        var cancelButton = document.getElementById('cancel');
        var confirmButton = document.getElementById('confirm');

        cancelButton.addEventListener('click', function() {
            accountDataDialog.close();
        });

        confirmButton.addEventListener('click', function() {
            vis.binds.sipadapter.onAccountDataDialogSubmit(audioElement);
            accountDataDialog.close();
        });

		accountDataDialog.showModal();
	},
    onAccountDataDialogSubmit(audioElement){
        const privateIdentityElement = document.getElementById("accountDataDialogPrivateIdentity");
        const publicIdentityElement = document.getElementById("accountDataDialogPublicIdentity");
        const passwordElement = document.getElementById("accountDataDialogPassword");
		const displayNameElement = document.getElementById("accountDataDialogDisplayName");
		const websocketProxyUrlElement = document.getElementById("accountDataDialogWebsocketProxyURL");
		const realmElement = document.getElementById("accountDataDialogRealm");

        const privateIdentity = privateIdentityElement.value;
        const publicIdentity = publicIdentityElement.value;
        const password = passwordElement.value;
		const displayName = displayNameElement.value;
		const websocket_proxy_url = websocketProxyUrlElement.value;
		const realm = realmElement.value;

        vis.binds.sipadapter.sipAccount.setAccountData(privateIdentity, publicIdentity, password, displayName, websocket_proxy_url, realm);

        vis.binds.sipadapter.sipCommunication = new SIPWebRTCCommunication(vis.binds.sipadapter.sipAccount, audioElement);
        vis.binds.sipadapter.sipCommunication.onCallIncoming = vis.binds.sipadapter.onCallIncoming;
		vis.binds.sipadapter.sipCommunication.onCallTerminated = vis.binds.sipadapter.onCallTerminated;
    }
};