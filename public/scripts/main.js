var rhit = rhit || {};
rhit.FB_KEY_NAME = "name";
rhit.FB_KEY_HOURS = "hoursleft";
rhit.FB_KEY_RESERVED = "timereserve";
rhit.FB_KEY_FRIENDS = "friendUID";
rhit.fbUsersInfoManager = null;
hit.FbAuthManager = null;


rhit.ListPageController = class {
	constructor() {}
}
rhit.DetailPageController = class {
	constructor() {}
}

rhit.fbUsersInfoManager = class {
	constructor(uid) {}
}
rhit.LoginPageController = class {
	constructor() {
		document.querySelector("#roseFireButton").onclick = (event) => {
			rhit.FbAuthManager.signIn();
		};
	}
}

rhit.FbAuthManager = class {
	constructor() {
		this._user = null;
	}
	beginListening(changeListener) {
		firebase.auth().onAuthStateChanged((user) => {
			this._user = user;
			changeListener();
		});
	}
	signIn() {
		console.log("TODO: sign in with roseFire");

		Rosefire.signIn("9b38b98c-a1b8-4aa0-87a8-f0d958a62326", (err, rfUser) => {
			if (err) {
				console.log("Rosefire error!", err);
				return;
			}
			console.log("Rosefire success!", rfUser);

			firebase.auth().signInWithCustomToken(rfUser.token).catch((error) => {
				var errorCode = error.code;
				var errorMessage = error.message;
				if (errorCode === 'auth/invalid-custom-token') {
				  alert('The token you provided is not valid.');
				} else {
				  console.error(error);
				}
			  });
			


		});

	}
	signOut() {
		firebase.auth().signOut().catch((error) => {
			console.log("Sign out error");
		});

	}
	get isSignedIn() {
		return !!this._user;
	}
	get uid() {
		return this._user.uid;
	}
}

rhit.checkForRedirects = function(){}



rhit.main = function () {
	console.log("Ready");
};

rhit.main();
