import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

/*Custom */
import { SocialSharing } from '@ionic-native/social-sharing';
import { Device } from '@ionic-native/device';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Config } from '../../service/config.service';

/* Pages */
import { TermsPage } from '../terms/terms';
import { PrivacyPage } from '../privacy/privacy';
import { ContactPage } from '../contact/contact';
import { AboutPage } from '../about/about';

// Pipe
import { Static } from '../../pipes/static';


@Component({
	selector: 'page-help',
	templateUrl: 'help.html'
})
export class HelpPage {
    TermsPage = TermsPage;
	PrivacyPage = PrivacyPage;
	ContactPage = ContactPage;
	AboutPage = AboutPage;

    constructor(
        private config: Config,
        private SocialSharing: SocialSharing,
        private InAppBrowser: InAppBrowser,
        private Device: Device,
        private navCtrl: NavController
    ) {}
    
    shareApp() {
		if (this.Device.platform == 'Android')
			this.SocialSharing.share(null, null, null, new Static(this.config).transform('modern_share_rate_android'));
		else this.SocialSharing.share(null, null, null, new Static(this.config).transform('modern_share_rate_ios'));
	}
	rateApp() {
		if (this.Device.platform == 'Android') this.InAppBrowser.create(new Static(this.config).transform('modern_share_rate_android'), "_system");
		else this.InAppBrowser.create(new Static(this.config).transform('modern_share_rate_ios'), "_system");
    }
    goto(page: any) {
		
		if (!page) this.navCtrl.popToRoot();
		else {
			let previous = this.navCtrl.getPrevious();
			if (previous && previous.component == page) this.navCtrl.pop();
			else this.navCtrl.push(page);
		}
	
	}
}