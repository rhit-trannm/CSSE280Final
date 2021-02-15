var rhit = rhit || {};
rhit.FB_COLLECTION_USER = "Users"
rhit.FB_KEY_NAME = "name";
rhit.FB_KEY_HOURS = "hoursleft";
rhit.FB_KEY_RESERVED = "timereserve";
rhit.FB_KEY_PROFILEURL = "imgurl";
rhit.FB_KEY_FRIENDS = "friendUID";
rhit.fbUsersInfoManager = null;
rhit.FbAuthManager = null;


rhit.HomePageController = class {
	constructor() {
		$("#modal1").on("show.bs.modal", (event) => {
			// Pre animation
			document.querySelector("#inputQuote").value = "";
			document.querySelector("#inputMovie").value = "";
		});
		
		$("#modal1").on("shown.bs.modal", (event) => {
			// Post animation
			document.querySelector("#inputQuote").focus();
		});
		window.location.href = `home.html?uid=${rhit.FbAuthManager.uid}`;
	}

}
rhit.DetailPageController = class {
	constructor() {}
}

rhit.fbUsersInfoManager = class {
	constructor(uid) {
		this._uid = uid;
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_USER);
		this._unsubscribe = null;
	}
	add(name) {
		// Add a new document with a generated id.
		this._ref.add({
				[rhit.FB_KEY_AUTHOR]: rhit.FbAuthManager.uid,
				[rhit.FB_KEY_NAME]: name,
				[rhit.FB_KEY_HOURS]: null,
				[rhit.FB_KEY_RESERVED]: [],
				[rhit.FB_KEY_PROFILEURL]: "https://imgur.com/a/EmtYgj1",
				[rhit.FB_KEY_FRIENDS]: [],
				[rhit.FB_KEY_LAST_TOUCHED]: firebase.firestore.Timestamp.now(),
			})
			.then(function (docRef) {
				console.log("Document written with ID: ", docRef.id);
			})
			.catch(function (error) {
				console.error("Error adding document: ", error);
			});
	}
	update(profileurl, hours, reserved, friends) {
		this._ref.update({
			[rhit.FB_KEY_PROFILEURL]: profileurl,
			[rhit.FB_KEY_HOURS]: hours,
			[rhit.FB_KEY_RESERVED]: reserved,
			[rhit.FB_KEY_FRIENDS]: friends,
			[rhit.FB_KEY_LAST_TOUCHED]: firebase.firestore.Timestamp.now(),
			})
			.then(() => {
				console.log("Document successfully updated!");
			})
			.catch(function (error) {
				// The document probably doesn't exist.
				console.error("Error updating document: ", error);
			});
	}
	beginListening(changeListener) {

		this._unsubscribe = this._ref
			.orderBy(rhit.FB_KEY_LAST_TOUCHED, "desc")
			.limit(50)
			.onSnapshot((querySnapshot) => {
				this._documentSnapshots = querySnapshot.docs;
				changeListener();
			});
	}
	stopListening() {
		this._unsubscribe();
	}
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

		Rosefire.signIn("380438ad-b7cd-41b4-9e00-be53fbd7b491", (err, rfUser) => {
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

rhit.checkForRedirects = function(){
	if (document.querySelector("#loginPage") && rhit.FbAuthManager.isSignedIn) {
		window.location.href = `home.html?uid=${rhit.FbAuthManager.uid}`;
	
	}
}

rhit.intializePage = function(){
	const urlParams = new URLSearchParams(window.location.search);
	if (document.querySelector("#loginPage")) {
		console.log("You are on the login page.");
		new rhit.LoginPageController();
	}
	if (document.querySelector("#homepage")) {
		console.log("You are on the home page.");
		const uid = urlParams.get("uid");
		rhit.fbUsersInfoManager = new rhit.fbUsersInfoManager(uid);
		new rhit.HomePageController();
	}
}
rhit.main = function () {
	console.log("Ready");
	rhit.FbAuthManager = new rhit.FbAuthManager();
	rhit.FbAuthManager.beginListening(() => {
		console.log("isSignedIn = ", rhit.FbAuthManager.isSignedIn);
		rhit.checkForRedirects();
		rhit.intializePage();
	});
};

rhit.main();
