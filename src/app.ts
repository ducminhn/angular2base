/// <reference path="../node_modules/angular2/bundles/typings/angular2/angular2.d.ts" />
import {Component, View, bootstrap, NgFor} from 'angular2/angular2';
import {FirebaseEventPipe} from './firebasepipe';
@Component({
	selector: 'display'
})
@View({
	template: `
	  	<div>
		  <button class="twitter" (click)="authWithTwitter()">Sign in with Twitter</button>
		  <span class="radio">
			  <span class="pref">American English <input type="radio" value="american" name="pref" (click)="getLanguage($event)")/></span>
			  <span class="pref">British English <input type="radio" value="british" name="pref" checked="checked" (click)="getLanguage($event)")/></span>
		  </span>
		</div>
	  <div class="message-input">
	  	<input #messagetext>
	  	<button (click)="addMessage(messagetext.value, authData.twitter.username)">Add Message</button>
	  </div>
	  <ul class="messages-list">
	  	<li <li *ng-for="#key of 'https://angular-connect.firebaseio.com/messages' | firebaseevent:'child_added'">
	  		<strong>{{ key.name }}</strong>: {{ key.text }}
	  	</li>
	  </ul>
	`,
	directives: [NgFor],
  	pipes: [FirebaseEventPipe]
})

class MessageList {
	messages: Dictionary;
	messagesRef: Firebase;
	authData: Object;
	langPref: string;
	constructor() {
		var self = this;
		self.messages = {};
		self.langPref = "british";
		self.messagesRef = new Firebase("https://angular-connect.firebaseio.com/messages");
		self.authData = null;
		self.messagesRef.on("child_added", function(snapshot) {
			var key = snapshot.key();
			self.messages[key] = snapshot.val();
		});
		self.messagesRef.onAuth(function(user) {
			if (user) {
				self.authData = user;
			}
		});
	}
	keys(): Array<string> {
		return Object.keys(this.messages);
	}
	translate(message: string): string {
		var translatedString = message;
		var startLang = this.langPref;
		var endLang;
		if (startLang === "british") {
			endLang = "american";
		} else {
			endLang = "british";
		}
		for (var word in translations) {
			var entry = translations[word];
			var wordToReplace = entry[startLang];
			var indexOfString = translatedString.indexOf(wordToReplace);
			if (indexOfString > -1) {
				var newTranslation = entry[endLang];
				var reg = new RegExp(wordToReplace, "gi");
				var newString = translatedString.replace(reg, newTranslation);
				translatedString = newString;
			}

		}
		return translatedString;
	}
	getLanguage($event) {
		var selectedLanguage = $event.target.value;
		this.langPref = selectedLanguage;
	}
	addMessage(message: string, user: string) {
		var newString = this.translate(message);
		this.messagesRef.push({
			name: user,
			text: newString
		});
	}
	doneTyping($event) {
		if ($event.which === 13) {
			this.addMessage($event.target.value);
			$event.target.value = null;
		}
	}
	authWithTwitter() {
		this.messagesRef.authWithOAuthPopup("twitter", function(error, user) {
			this.authData = user;
		});
	}
}

interface Dictionary {
	[ index: string ]: string
}

bootstrap(MessageList);