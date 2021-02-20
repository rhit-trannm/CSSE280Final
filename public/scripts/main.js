var rhit = rhit || {};
rhit.FB_COLLECTION_USER = "Users"
rhit.FB_KEY_NAME = "name";
rhit.FB_KEY_HOURS = "hoursleft";
rhit.FB_KEY_RESERVED = "timereserve";
rhit.FB_KEY_PROFILEURL = "imgurl";
rhit.FB_KEY_FRIENDS = "friendUID";
rhit.fbUsersInfoManager = null;
rhit.FbAuthManager = null;




rhit.ReservePageController = class {
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
		this._ref.doc(`${rhit.FbAuthManager.uid}`).set({
				[rhit.FB_KEY_AUTHOR]: rhit.FbAuthManager.uid,
				[rhit.FB_KEY_NAME]: name,
				[rhit.FB_KEY_HOURS]: 10,
				[rhit.FB_KEY_RESERVED]: [],
				[rhit.FB_KEY_PROFILEURL]: "https://i.imgur.com/jz5VaXc.png",
				[rhit.FB_KEY_FRIENDS]: [],
				[rhit.FB_KEY_LAST_TOUCHED]: firebase.firestore.Timestamp.now(),
			})
			.then(function (docRef) {

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
rhit.Users = class {
	constructor() {}
}
//////////////////////////////////////////////////////////////////////////////////////////////////
// rhit.FB_COLLECTION_POST = "Posts";
// rhit.FB_KEY_PURPOSE = "Purpose";
// rhit.FB_KEY_GAME = "Game";
// rhit.FB_KEY_TIME = "Time";
// rhit.FB_KEY_LAST_TOUCHED = "lastTouched";
// rhit.FB_KEY_AUTHOR = "author";
// rhit.PostManager = null;

rhit.FB_COLLECTION_POST = "Posts";
rhit.FB_KEY_PURPOSE = "Purpose";
rhit.FB_KEY_GAME = "Game";
rhit.FB_KEY_TIME = "Time";
rhit.FB_KEY_LAST_TOUCHED = "lastTouched";
rhit.FB_KEY_AUTHOR = "author";
rhit.fbPostManager = null;

function htmlToElement(html) {
	var template = document.createElement('template');
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
}


rhit.ListPageController = class {
	constructor() {
		document.querySelector("#submitAddQuote").addEventListener("click", (event) => {
			const quote = document.querySelector("#inputQuote").value;
			const movie = document.querySelector("#inputMovie").value;
			const time = document.querySelector("#inputTime").value;
			rhit.fbPostManager.add(quote, movie, time);
		});
		document.querySelector("#menuSignOut").addEventListener("click", (event) => {
			rhit.FbAuthManager.signOut();
		});

		$("#addQuoteDialog").on("show.bs.modal", (event) => {
			// Pre animation
			document.querySelector("#inputQuote").value = "";
			document.querySelector("#inputMovie").value = "";
			document.querySelector("#inputTime").value = "";
		});
		$("#addQuoteDialog").on("shown.bs.modal", (event) => {
			// Post animation
			document.querySelector("#inputQuote").focus();
		});

		// Start listening!
		rhit.fbPostManager.beginListening(this.updateList.bind(this));

	}


	updateList() {
		
		// console.log("Example quote = ", rhit.fbMovieQuotesManager.getMovieQuoteAtIndex(0));

		// Make a new quoteListContainer
		const newList = htmlToElement('<div id="quoteListContainer"></div>');
		// Fill the quoteListContainer with quote cards using a loop
		for (let i = 0; i < rhit.fbPostManager.length; i++) {
			const mq = rhit.fbPostManager.getPostIndex(i);
			const newCard = this._createCard(mq);
			newCard.onclick = (event) => {
				//console.log(`You clicked on ${mq.id}`);
				// rhit.storage.setMovieQuoteId(mq.id);
				window.location.href = `/moviequote.html?id=${mq.id}`;
			};
			newList.appendChild(newCard);
		}


		// Remove the old quoteListContainer
		const oldList = document.querySelector("#quoteListContainer");
		oldList.removeAttribute("id");
		oldList.hidden = true;
		// Put in the new quoteListContainer
		oldList.parentElement.appendChild(newList);
	}

	_createCard(movieQuote) {
		return htmlToElement(`<div class="card">
		<div class="card-body rounded">
			<h5 class="card-title">${movieQuote.quote}</h5>
			<h6 class="card-subtitle mb-2 text-muted">${movieQuote.movie}</h6>
			<h6 class="card-subtitle mb-2 text-muted">${movieQuote.time}</h6>
		</div>
	</div>`);
	}

}

rhit.MovieQuote = class {
	constructor(id, quote, movie, time) {
		this.id = id;
		this.quote = quote;
		this.movie = movie;
		this.time = time;
	}
}

rhit.fbPostManager = class {
	constructor(uid) {
		this._uid = uid;
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_POST);
		this._unsubscribe = null;
	}

	add(quote, movie, time) {
		// Add a new document with a generated id.
		this._ref.add({
				[rhit.FB_KEY_PURPOSE]: quote,
				[rhit.FB_KEY_GAME]: movie,
				[rhit.FB_KEY_TIME]: time,
				[rhit.FB_KEY_AUTHOR]: rhit.FbAuthManager.uid,
				[rhit.FB_KEY_LAST_TOUCHED]: firebase.firestore.Timestamp.now(),
			})
			.then(function (docRef) {
				console.log("Document written with ID: ", docRef.id);
			})
			.catch(function (error) {
				console.error("Error adding document: ", error);
			});
	}

	beginListening(changeListener) {

		let query = this._ref.orderBy(rhit.FB_KEY_LAST_TOUCHED, "desc").limit(50);
		if (this._uid) {
			query = query.where(rhit.FB_KEY_AUTHOR, "==", this._uid);
		}
		this._unsubscribe = query.onSnapshot((querySnapshot) => {
			console.log("MovieQuote update!");
			this._documentSnapshots = querySnapshot.docs;
			// querySnapshot.forEach((doc) => {
			// 	console.log(doc.data());
			// });
			changeListener();
		});
	}

	stopListening() {
		this._unsubscribe();
	}

	// update(id, quote, movie) {}
	// delete(id) {}
	get length() {
		return this._documentSnapshots.length;
	}

	getPostIndex(index) {
		const docSnapshot = this._documentSnapshots[index];
		const mq = new rhit.MovieQuote(docSnapshot.id,
			docSnapshot.get(rhit.FB_KEY_PURPOSE),
			docSnapshot.get(rhit.FB_KEY_GAME),
			docSnapshot.get(rhit.FB_KEY_TIME));
		return mq;
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////////

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

rhit.checkForRedirects = function () {
	if (document.querySelector("#loginPage") && rhit.FbAuthManager.isSignedIn) {
		window.location.href = `home.html?uid=${rhit.FbAuthManager.uid}`;

	}
}

rhit.intializePage = function () {
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
	if (document.querySelector("#listPage")) {
		console.log("You are on the list page.");
		const uid = urlParams.get("uid");
		rhit.fbPostManager = new rhit.fbPostManager(uid);
		new rhit.ListPageController();
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




var x, i, j, l, ll, selElmnt, a, b, c;
/* Look for any elements with the class "custom-select": */
x = document.getElementsByClassName("custom-select");
l = x.length;
for (i = 0; i < l; i++) {
  selElmnt = x[i].getElementsByTagName("select")[0];
  ll = selElmnt.length;
  /* For each element, create a new DIV that will act as the selected item: */
  a = document.createElement("DIV");
  a.setAttribute("class", "select-selected");
  a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
  x[i].appendChild(a);
  /* For each element, create a new DIV that will contain the option list: */
  b = document.createElement("DIV");
  b.setAttribute("class", "select-items select-hide");
  for (j = 1; j < ll; j++) {
    /* For each option in the original select element,
    create a new DIV that will act as an option item: */
    c = document.createElement("DIV");
    c.innerHTML = selElmnt.options[j].innerHTML;
    c.addEventListener("click", function(e) {
        /* When an item is clicked, update the original select box,
        and the selected item: */
        var y, i, k, s, h, sl, yl;
        s = this.parentNode.parentNode.getElementsByTagName("select")[0];
        sl = s.length;
        h = this.parentNode.previousSibling;
        for (i = 0; i < sl; i++) {
          if (s.options[i].innerHTML == this.innerHTML) {
            s.selectedIndex = i;
            h.innerHTML = this.innerHTML;
            y = this.parentNode.getElementsByClassName("same-as-selected");
            yl = y.length;
            for (k = 0; k < yl; k++) {
              y[k].removeAttribute("class");
            }
            this.setAttribute("class", "same-as-selected");
            break;
          }
        }
        h.click();
    });
    b.appendChild(c);
  }
  x[i].appendChild(b);
  a.addEventListener("click", function(e) {
    /* When the select box is clicked, close any other select boxes,
    and open/close the current select box: */
    e.stopPropagation();
    closeAllSelect(this);
    this.nextSibling.classList.toggle("select-hide");
    this.classList.toggle("select-arrow-active");
  });
}

function closeAllSelect(elmnt) {
  /* A function that will close all select boxes in the document,
  except the current select box: */
  var x, y, i, xl, yl, arrNo = [];
  x = document.getElementsByClassName("select-items");
  y = document.getElementsByClassName("select-selected");
  xl = x.length;
  yl = y.length;
  for (i = 0; i < yl; i++) {
    if (elmnt == y[i]) {
      arrNo.push(i)
    } else {
      y[i].classList.remove("select-arrow-active");
    }
  }
  for (i = 0; i < xl; i++) {
    if (arrNo.indexOf(i)) {
      x[i].classList.add("select-hide");
    }
  }
}

/* If the user clicks anywhere outside the select box,
then close all select boxes: */
document.addEventListener("click", closeAllSelect);
// rhit.FB_COLLECTION_POST = "Posts";
// rhit.FB_KEY_PURPOSE = "Purpose";
// rhit.FB_KEY_GAME = "Game";
// rhit.FB_KEY_TIME = "Time";
// rhit.FB_KEY_LAST_TOUCHED = "lastTouched";
// rhit.FB_KEY_AUTHOR = "author";
// rhit.PostManager = null;

rhit.HomePageController = class {
	constructor(uid) {
		document.querySelector("#menuSignOut").addEventListener("click", (event) => {
			rhit.FbAuthManager.signOut();
		});
		var ok = {};
		const usersRef = firebase.firestore().collection('Users').doc(`${rhit.FbAuthManager.uid}`);
		usersRef.get()
			.then((docSnapshot) => {
				if (docSnapshot.exists) {
					usersRef.onSnapshot((doc) => {});
				} else {
					console.log(usersRef);
					rhit.fbUsersInfoManager.add(`${rhit.FbAuthManager.uid}`) // create the document
				}
			});

		usersRef.get().then((doc) => {
			if (doc.exists) {
				console.log("Document data:", doc.data());
				console.log(doc.get(rhit.FB_KEY_NAME))
				document.querySelector("#profpic").src = doc.get(rhit.FB_KEY_PROFILEURL);
				document.querySelector("#usersName").innerHTML = doc.get(rhit.FB_KEY_NAME);
				document.querySelector("#usrdata").innerHTML = doc.get(rhit.FB_KEY_HOURS) + " hours";
				document.querySelector("#usrdata1").innerHTML = doc.get(rhit.FB_KEY_RESERVED);
				ok = doc;
				console.log(ok.get(rhit.FB_KEY_HOURS) + "Hello2")

				document.querySelector("#submitAddQuote").addEventListener("click", (event) => {
					const adc = document.querySelector("#inputAddress").value;
					rhit.fbUsersInfoManager.update(adc,doc.get(rhit.FB_KEY_HOURS),doc.get(rhit.FB_KEY_RESERVED),doc.get(rhit.FB_KEY_FRIENDS));
				});
			} else {
				// doc.data() will be undefined in this case
				console.log("No such document!");
			}
		}).catch((error) => {
			console.log("Error getting document:", error);
		});
		
		//document.querySelector("#userName").innerHTML = this.ok.get(rhit.FB_KEY_NAME);

	}
	
}


rhit.main();