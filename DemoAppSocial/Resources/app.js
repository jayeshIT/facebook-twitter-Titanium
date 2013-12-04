Ti.include('constants.js');
var win = Ti.UI.createWindow();
win.backgroundColor = 'teal';
function trimAll(sString) {
	while (sString.substring(0, 1) == ' ') {
		sString = sString.substring(1, sString.length);
	}
	while (sString.substring(sString.length - 1, sString.length) == ' ') {
		sString = sString.substring(0, sString.length - 1);
	}
	return sString;
}

var fb = require('facebook');

fb.appid = 219447704837733;
fb.permissions = ['publish_stream'];
fb.forceDialogAuth = true;

var login = Ti.UI.createButton({

	width : 100,
	height : 30,
	left : 10,
	top : 10
});
var mylbl = Ti.UI.createLabel({
	width : 250,
	height : 10,
	left : 10,
	top : 50,
	text : 'Enter Text for share on Fb/Twitter'
});
win.add(mylbl);
var logintt = Ti.UI.createButton({

	width : 100,
	height : 30,
	right : 10,
	top : 10,

});

var text = Ti.UI.createTextArea({
	width : 250,
	height : 50,
	left : 10,
	top : 70,

});
var chars = ( typeof (text) != 'undefined' && text != null) ? text.length : 0;

var textlengthlabel = Ti.UI.createLabel({

	width : 30,
	height : 30,
	right : 20,
	top : 70,
	color : 'black',
	//text : (parseInt((140 - chars)) + '')

});
text.addEventListener('change', function(e) {

	var chars = (140 - text.value.length);
	if (text.value.length > 140) {
		alert('More than 140 not allowd');

	}

	textlengthlabel.text = parseInt(chars);
});

var poststatus = Ti.UI.createButton({

	width : 100,
	height : 30,
	left : 10,
	top : 150,
	title : 'Post Status'
});

var postphoto = Ti.UI.createButton({

	width : 100,
	height : 30,
	left : 10,
	top : 200,
	title : 'Post photo'
});

var postdiaglog = Ti.UI.createButton({

	width : 100,
	height : 30,
	left : 10,
	top : 250,
	title : 'Post using dialog'
});

win.add(text);
win.add(textlengthlabel);
win.add(poststatus);
win.add(postphoto);
win.add(postdiaglog);

win.add(login);

//twitter start
Ti.include('/lib/birdhouse.js');
var BH = new BirdHouse({
	consumer_key : "ve08I0NlF2WzzTiOL5b3g",
	consumer_secret : "t01y1Xl4VoUfhg1YewgOXjOLHTVZnFNIRly8Vl8Q",
	callback_url : "http://www.dolphinwebsolution.com"
});

if (BH.authorized() == true) {
	logintt.title = 'logout from tt';
} else {

	logintt.title = 'login to tt';
}

logintt.addEventListener('click', function(e) {

	if (BH.authorized() == true) {

		BH.deauthorize(function(e) {
			if (e === true) {
				alert('Successfully deauthorized.');
				logintt.title = 'login to tt';
				Ti.App.Properties.removeProperty('ttname');
				Ti.App.Properties.removeProperty('ttid');
				Ti.App.Properties.removeProperty('ttimg');

			} else {
				alert('Failed to deauthorize.');
			}

		});
	} else {
		showIndicator(win);
		BH.authorize(function(e) {
			if (e === true) {
				hideIndicator(win);
				alert('Successfully authorized.');

				logintt.title = 'logout from tt';
			} else {
				hideIndicator(win);
				alert('Failed to authorize.');
			}

		});
	}

});
//twitter Ends

if (fb.loggedIn) {

	login.title = 'logout';

	//login.backgroundImage = 'images/LogoutFromFacebook.png'
} else {

	login.title = 'login Fb';
	//login.backgroundImage = 'images/connectwithfacebook.png';
}

login.addEventListener('click', function(e) {

	if (Ti.Network.online) {

		if (fb.loggedIn) {

			fb.logout();

			Ti.App.Properties.removeProperty('username');
			Ti.App.Properties.removeProperty('imageurl');
			Ti.App.Properties.removeProperty('usrid');

			alert('Successfully logout');
			login.title = 'login Fb';
			//login.backgroundImage = 'images/connectwithfacebook.png'
		} else {

			showIndicator(win);

			fb.authorize();

		}

	} else {
		Ti.UI.createAlertDialog({
			title : 'Demo App',
			message : 'No internet'
		}).show();
	}
});

fb.addEventListener('login', function(e) {

	if (e.success) {

		login.title = 'logout';
		//login.backgroundImage = 'images/LogoutFromFacebook.png'
		var username;
		var imageurl;
		var usrid;

		usrid = fb.uid;
		Ti.API.info(usrid);
		var xhr = Ti.Network.createHTTPClient();
		xhr.open("GET", 'https://graph.facebook.com/' + usrid);
		xhr.setTimeout(1000);
		xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
		xhr.send();
		xhr.onload = function() {

			var json = JSON.parse(this.responseText);
			username = json.name;
			imageurl = "https://graph.facebook.com/" + usrid + "/picture";

			//Ti.App.username = username;
			//Ti.App.imageurl = imageurl;
			//Ti.App.usrid = usrid;

			Ti.App.Properties.setString('username', username);
			Ti.App.Properties.setString('imageurl', imageurl);
			Ti.App.Properties.setString('usrid', usrid);

			hideIndicator(win);

		};
		xhr.onerror = function() {
			alert('erro in facebook');
			hideIndicator(win);

		};

	} else {
		if (e.error) {
			alert(e.error);
			hideIndicator(win);
		} else {
			alert("Unkown error while trying to login to facebook.");
			hideIndicator(win);
		}
	}
});

poststatus.addEventListener('click', function(e) {

	if (fb.loggedIn) {
		showIndicator(win);
		fb.requestWithGraphPath('me/feed', {
			message : text.value
		}, "POST", function(e) {
			if (e.success) {
				alert("Success!  From FB: " + e.result);
				hideIndicator(win);
				text.value = '';

			} else {
				if (e.error) {
					alert(e.error);
					hideIndicator(win);
				} else {
					alert("Unkown result");
					hideIndicator(win);
				}
			}
		});

	} else {
		alert('please login to facebook ');
	}
});
postphoto.addEventListener('click', function(e) {
	if (fb.loggedIn) {

		var dialog = Titanium.UI.createOptionDialog({
			options : ['Choose From Library', 'Take New Photo', 'Cancel'],

			cancel : 2,
		});
		dialog.show();

		dialog.addEventListener('click', function(e) {

			if (e.index == 0) {

				Titanium.Media.openPhotoGallery({
					success : function(event) {

						pic = event.media;
						var imageView = Titanium.UI.createImageView({
							image : pic,
							width : 200,
							height : 200
						});
						pic = imageView.toBlob();

						alert('Image selected From PhotoGallery');
						var data = {
							picture : pic
						};
						fb.requestWithGraphPath('me/photos', data, "POST", showRequestResult);
						showIndicator(win);
						/*showIndicator(win);

						 var xhr1 = Ti.Network.createHTTPClient();

						 xhr1.onload = function() {

						 hideIndicator(win);
						 alert('succesfull posted');
						 };
						 xhr1.open("POST", 'http://getmagento.info/emazingvideos/post_upload.php');
						 xhr1.setTimeout(1000);

						 xhr1.send({
						 username : Ti.App.Properties.getString('username'),
						 messageimage : pic,
						 textmessage : 'New image',
						 usrid : Ti.App.Properties.getString('usrid'),
						 imageurl : Ti.App.Properties.getString('imageurl'),

						 });

						 xhr1.onerror = function() {
						 hideIndicator(win);
						 xhr1.abort();
						 Ti.UI.createAlertDialog({
						 title : 'Error occurs ',
						 message : 'Please Try Again'
						 }).show();
						 };*/
					},
					cancel : function() {
						alert('You Canceled');
					},
					error : function(error) {

						alert('Erroe occurs');
					},
					mediaTypes : [Ti.Media.MEDIA_TYPE_PHOTO]
				});
			} else if (e.index == 1) {

				Titanium.Media.showCamera({

					success : function(event) {

						//imageViewMe.image = event.media;
						pic = event.media;
						var imageView = Titanium.UI.createImageView({
							image : pic,
							width : 200,
							height : 200
						});
						pic = imageView.toBlob();
						alert('Image selected taken From Camera');

						var data = {
							picture : pic
						};
						fb.requestWithGraphPath('me/photos', data, "POST", showRequestResult);
						showIndicator(win);
						/*showIndicator(win);
						 var xhr1 = Ti.Network.createHTTPClient();

						 xhr1.onload = function() {

						 hideIndicator(win);
						 alert('succesfull posted');
						 };
						 xhr1.open("POST", 'http://getmagento.info/emazingvideos/post_upload.php');
						 xhr1.setTimeout(1000);

						 xhr1.send({
						 username : Ti.App.Properties.getString('username'),
						 messageimage : pic,
						 textmessage : 'New image',
						 usrid : Ti.App.Properties.getString('usrid'),
						 imageurl : Ti.App.Properties.getString('imageurl'),

						 });

						 xhr1.onerror = function() {
						 hideIndicator(win);
						 xhr1.abort();
						 Ti.UI.createAlertDialog({
						 title : 'Error occurs ',
						 message : 'Please Try Again'
						 }).show();
						 };*/
					},
					cancel : function() {
						alert('You Canceled');

					},
					error : function(error) {
						// create alert

						var a = Titanium.UI.createAlertDialog({
							title : 'Camera'
						});

						// set message
						if (error.code == Titanium.Media.NO_CAMERA) {
							a.setMessage('No Camera detcted.');
						} else {
							a.setMessage('Unexpected error: ' + error.code);
						}

						// show alert
						a.show();
					},
					// saveToPhotoGallery : true,
					mediaTypes : Ti.Media.MEDIA_TYPE_PHOTO,
					showControls : true // don't show system controls
					// overlay : cameraView
				});

			}
		});

	} else {
		alert('login to facebook');
	}

});

var iter = 0;
postdiaglog.addEventListener('click', function(e) {

	if (fb.loggedIn) {

		iter++;
		var data = {
			link : "http://www.dws.com",
			name : "My demo of Titanium (iteration " + iter + ")",
			message : "Awesome SDKs for building desktop and mobile apps",
			caption : "My demo of Titanium (iteration " + iter + ")",
			picture : "http://developer.appcelerator.com/assets/img/DEV_titmobile_image.png",
			description : "You've got the ideas, now you've got the power. Titanium translates your hard won web skills..."
		};
		fb.dialog("feed", data, showRequestResult);
		showIndicator(win);
	} else {
		alert('please login to Facebook');
	}
});

function showRequestResult(e) {

	var s = '';
	if (e.success) {
		s = "SUCCESS";
		if (e.result) {
			s += "; " + e.result;
		}
		if (e.data) {
			s += "; " + e.data;
		}
		if (!e.result && !e.data) {
			s = '"success", but no data from FB.  I am guessing you cancelled the dialog.';
		}
	} else if (e.cancelled) {
		s = "CANCELLED";
	} else {
		s = "FAIL";
		if (e.error) {
			s += "; " + e.error;
		}
	}
	hideIndicator(win);
	alert(s);
}

// Twitter

var poststatustt = Ti.UI.createButton({

	width : 100,
	height : 30,
	right : 10,
	top : 150,
	title : 'Post Status'
});

var postphotott = Ti.UI.createButton({

	width : 100,
	height : 30,
	right : 10,
	top : 200,
	title : 'Post photo'
});

win.add(poststatustt);
win.add(postphotott);
poststatustt.addEventListener('click', function(e) {

	//	BH.send_tweet("status=" + text.value);

	if (Ti.Network.online) {
		if (BH.authorized() == true) {
			if (text.value.length < 140) {

				showIndicator(win);

				/*BH.send_tweet('status=' + text.value, function(resp) {
				 if (resp === true) {
				 text.value = '';
				 textlengthlabel.text = '';
				 } else {

				 }
				 });*/

				BH.send_tweet('status=' + 'Loved #apple' + '&' + 'entities=hashtags[{"text": "apple","indices" : [0,6],}]', function(resp) {
					if (resp === true) {
						text.value = '';
						textlengthlabel.text = '';
					} else {

					}
				});

			} else {
				alert('Please  enter text lessW than 140');
			}
		} else {
			alert('please login to twitter ');
		}
	}

});
postphotott.addEventListener('click', function(e) {

	if (BH.authorized() == true) {
		var dialog2 = Titanium.UI.createOptionDialog({
			options : ['Choose From Library', 'Take New Photo', 'Cancel'],

			cancel : 2,
		});
		dialog2.show();

		dialog2.addEventListener('click', function(e) {

			if (e.index == 0) {

				Titanium.Media.openPhotoGallery({
					success : function(event) {

						pic = event.media;
						var imageView = Titanium.UI.createImageView({
							image : pic,
							width : 200,
							height : 200
						});
						pic = imageView.toBlob();

						alert('Image selected from galarry is Taken');
						showIndicator(win);
						BH.sendTwitterImage({
							'status' : text.value,
							'media' : pic
						});

					},
					cancel : function() {
						alert('You Canceled');
					},
					error : function(error) {

						alert('Erroe occurs');
					},
					mediaTypes : [Ti.Media.MEDIA_TYPE_PHOTO]
				});

			} else if (e.index == 1) {
				Titanium.Media.showCamera({

					success : function(event) {

						//imageViewMe.image = event.media;
						pic = event.media;
						var imageView = Titanium.UI.createImageView({
							image : pic,
							width : 200,
							height : 200
						});
						pic = imageView.toBlob();
						alert('Image selected taken From Camera');
						showIndicator(win);
						BH.sendTwitterImage({
							'status' : 'This is ',
							'media' : pic
						});

					},
					cancel : function() {
						alert('You Canceled');

					},
					error : function(error) {
						// create alert

						var a = Titanium.UI.createAlertDialog({
							title : 'Camera'
						});

						// set message
						if (error.code == Titanium.Media.NO_CAMERA) {
							a.setMessage('No Camera detcted.');
						} else {
							a.setMessage('Unexpected error: ' + error.code);
						}

						// show alert
						a.show();
					},
					// saveToPhotoGallery : true,
					mediaTypes : Ti.Media.MEDIA_TYPE_PHOTO,
					showControls : true // don't show system controls
					// overlay : cameraView
				});

			}
		});
	} else {
		alert('login to Twitter');
	}
});

win.add(logintt);
win.open();
