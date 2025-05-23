CLI_ACCEPT_COOKIE_NAME =(typeof CLI_ACCEPT_COOKIE_NAME !== 'undefined' ? CLI_ACCEPT_COOKIE_NAME : 'viewed_cookie_policy');
CLI_PREFERNCE_COOKIE =(typeof CLI_PREFERNCE_COOKIE !== 'undefined' ? CLI_PREFERNCE_COOKIE : 'CookieLawInfoConsent');
CLI_ACCEPT_COOKIE_EXPIRE =(typeof CLI_ACCEPT_COOKIE_EXPIRE !== 'undefined' ? CLI_ACCEPT_COOKIE_EXPIRE : 365);
CLI_COOKIEBAR_AS_POPUP=(typeof CLI_COOKIEBAR_AS_POPUP !== 'undefined' ? CLI_COOKIEBAR_AS_POPUP : false);
var CLI_Cookie={
	set: function (name, value, days) {
		var secure = "";
		if ( true === Boolean( Cli_Data.secure_cookies ) ) secure = ";secure";
		var domain = ( Cli_Data.cookieDomain !== '' ? ";domain=" + Cli_Data.cookieDomain : '' );
		var date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		var expires = ";expires=" + date.toGMTString();
		if( days < 1 ){
			this.eraseCookie(name,expires);
		} else {
			document.cookie = name + "=" + value + secure + expires + domain + ";path=/";
		}
    },
    read: function (name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1, c.length);
            }
            if (c.indexOf(nameEQ) === 0) {
                return c.substring(nameEQ.length, c.length);
            }
        }
        return null;
    },
    erase: function (name) {
        this.set(name, "", -10);
	},
	eraseCookie: function( name, expires, index ){
		
		if( this.cookieExist(name) === false ) {
			return false;
		}
		var _hostname =	window.location.hostname;
		var value = "";
		if (typeof index === 'undefined') {
			index = 0;
		} 
		if( index === 0 ){
			_hostname = _hostname.substring(_hostname.lastIndexOf(".", _hostname.lastIndexOf(".")-1));
		}
		else if( index === 1 ){
			_hostname = ( Cli_Data.cookieDomain !== '' ? Cli_Data.cookieDomain : '' );
		} 
		else if( index === 2 ) {
			if(_hostname.indexOf("www") != 1)
			{  
				_hostname = _hostname.replace('www','');
			}
		}
		index = index + 1;
		document.cookie = name + "=" + value + expires + ";domain="+ _hostname + ";path=/";
		if (index <= 2 ) {
			this.eraseCookie( name, expires, index);
		}
	},
    exists: function (name) {
        return (this.read(name) !== null);
    },
    getallcookies:function() 
    {	
	    var pairs = document.cookie.split(";");
	    var cookieslist = {};
	    for (var i = 0; i < pairs.length; i++) {
	        var pair = pairs[i].split("=");
	        cookieslist[(pair[0] + '').trim()] = unescape(pair[1]);
	    }
	    return cookieslist;
	},
	cookieExist: function( name ){
		cookie_pattern = new RegExp("^(.*;)?\\s*"+name+"\\s*=\\s*[^;]+(.*)?$");
		if(!document.cookie.match(cookie_pattern)) {
			return false;
		}
		return true;
	}
}
var CLI=
{
	bar_config:{},
  	consent:{},	
	ref: window.cookielawinfo,
	allowedCategories:[],
	showagain_config:{},
	set:function(args)
	{	
		if(typeof JSON.parse !== "function") 
		{
	        console.log("CookieLawInfo requires JSON.parse but your browser doesn't support it");
	        return;
	    }
	    if(typeof args.settings!=='object')
	    {
	    	this.settings = JSON.parse(args.settings);
	    }else
	    {
	    	this.settings = args.settings;
	    }
	    this.bar_elm=jQuery(this.settings.notify_div_id);
		this.showagain_elm = jQuery(this.settings.showagain_div_id);
		this.banner_heading = jQuery('#wt-cli-cookie-banner-title');

        //buttons
        this.main_button = jQuery('.cli-plugin-main-button');
        this.main_link = jQuery('.cli-plugin-main-link');
        this.reject_link = jQuery('.cookie_action_close_header_reject');
        this.settings_link = jQuery('.cli_settings_button');
        this.delete_link=jQuery(".cookielawinfo-cookie-delete");
		this.accept_all_button = jQuery('.wt-cli-accept-all-btn');
		this.save_my_prefer_button = jQuery('.wt-cli-save-preferences-btn');
		
        if(this.settings.cookie_bar_as=='popup')
    	{
    		CLI_COOKIEBAR_AS_POPUP=true;
		}
		this.mayBeSetPreferenceCookie();
		this.cliRenewConsent();
        this.configBar();
        this.toggleBar();
        this.attachDelete();
        this.attachEvents();
        this.configButtons();
        this.addStyleAttribute();
		this.settingsPopUp();
		this.cookieLawInfoRunCallBacks();
		this.acceptPageNavigation();
		var cli_hidebar_on_readmore=this.hideBarInReadMoreLink();
        if(this.settings.scroll_close===true && cli_hidebar_on_readmore===false) 
        {
        	window.addEventListener("scroll",CLI.closeOnScroll, false);
    	}
	},
	hideBarInReadMoreLink:function()
	{	
		if(CLI.settings.button_2_hidebar===true && this.main_link.length>0 && this.main_link.hasClass('cli-minimize-bar'))
		{	
			jQuery('.wt-cli-cookie-bar-container').addClass('wt-cli-hide-bar');
			this.hideHeader();
			this.showagain_elm.slideDown(this.settings.animate_speed_show);
			return true;
		}
		return false;
	},
	settingsPopUp:function()
	{	
		jQuery(document).on('click keypress','.cli_settings_button',function(e){
			var key = e.which;
			e.preventDefault();
			if(key === 1 || key === 13) {
				if(CLI.settings.cookie_setting_popup==true) {	
					CLI.TogglePreference();
				}
				else {	
					CLI.TogglePreference(true);
				}
			}
	        
	    });
		jQuery('#cliModalClose').click(function(){
			CLI.settingsPopUpClose();
		});
		jQuery('#cliModalClose').keydown(function(e) {
			var key = e.which
			if(key === 9) {
				if(e.shiftKey === true) {
					e.preventDefault()
					jQuery('#wt-cli-privacy-save-btn').focus()
				}
			}
		});
		document.addEventListener('keydown', function(e) {
			var key = e.which;
			if(key === 27 && jQuery('#cliSettingsPopup').hasClass('cli-show')) {
				CLI.settingsPopUpClose();
			}
		});
		jQuery("#cliSettingsPopup").click(function(e){
			if(!(document.getElementsByClassName('cli-modal-dialog')[0].contains(e.target)))
			{
				CLI.settingsPopUpClose();
			}
		});
		jQuery('.cli_enable_all_btn').click(function(){
			var cli_toggle_btn = jQuery(this);
			var enable_text = cli_toggle_btn.attr('data-enable-text');
			var disable_text= cli_toggle_btn.attr('data-disable-text');
			if(cli_toggle_btn.hasClass('cli-enabled')){
				CLI.disableAllCookies();
				cli_toggle_btn.html(enable_text);
			}
			else
			{
				CLI.enableAllCookies();
				cli_toggle_btn.html(disable_text);

			}
			jQuery(this).toggleClass('cli-enabled');
		});
		this.settingsTabbedAccordion();
		this.toggleUserPreferenceCheckBox();
		this.privacyReadmore();
	},
	settingsTabbedAccordion:function()
	{	
		jQuery(document).on('click keypress','.cli-tab-header',function(e){
			if (!(jQuery(e.target).hasClass('cli-slider') || jQuery(e.target).hasClass('cli-user-preference-checkbox') || jQuery(e.target).hasClass('cli-iab-checkbox'))) {
				var key = e.which;
				e.preventDefault();
				if (key === 1 || key === 13) {
					var currentElement = jQuery(this);
					var tabLink = currentElement.closest('.cli-tab-header').find('.cli-nav-link');
					if (currentElement.hasClass("cli-tab-active")) {
						currentElement.removeClass("cli-tab-active");
						currentElement.siblings(".cli-tab-content").slideUp(200);
						tabLink.attr('aria-expanded', false);
					} else {
						jQuery(".cli-tab-header").removeClass("cli-tab-active");
						currentElement.addClass("cli-tab-active");
						jQuery(".cli-tab-content").slideUp(200);
						currentElement.siblings(".cli-tab-content").slideDown(200);
						tabLink.attr('aria-expanded', true);
					}
				}
			}	
		});
		jQuery(document).on('click keypress','.cli-sub-tab-header',function(e){
			if (!(jQuery(e.target).hasClass('cli-slider') || jQuery(e.target).hasClass('cli-iab-checkbox'))) {
				var key = e.which;
				e.preventDefault();
				if (key === 1 || key === 13) {
					var currentElement = jQuery(this);
					var tabLink = currentElement.closest('.cli-sub-tab-header').find('.cli-nav-link');
					if (currentElement.hasClass("cli-tab-active")) {
						currentElement.removeClass("cli-tab-active");
						currentElement.siblings(".cli-sub-tab-content").slideUp(200);
						tabLink.attr('aria-expanded', false);
					} else {

						jQuery(".cli-sub-tab-header").removeClass("cli-tab-active");
						currentElement.addClass("cli-tab-active");
						jQuery(".cli-sub-tab-content").slideUp(200);
						currentElement.siblings(".cli-sub-tab-content").slideDown(200);
						tabLink.attr('aria-expanded', true);
					}
				}
			}	
		});
	},
	settingsPopUpClose:function()
	{
		jQuery('#cliSettingsPopup').removeClass('cli-show');
		jQuery('#cliSettingsPopup').addClass('cli-out');
		jQuery('#cliSettingsPopup').attr('aria-hidden', true);
		jQuery('body').removeClass("cli-modal-open");
        jQuery(".cli-settings-overlay").removeClass("cli-show");
		jQuery("#cookie-law-info-bar").css({'opacity':1});
		jQuery("#cookie-law-info-bar .cli_settings_button").focus();
	},
	toggleUserPreferenceCheckBox:function()
	{	
		
    	jQuery('.cli-user-preference-checkbox').each(function(){

			var categoryCookie = 'cookielawinfo-'+jQuery(this).attr('data-id');
			var categoryCookieValue = CLI_Cookie.read(categoryCookie);
			if( categoryCookieValue == null )
			{
				if(jQuery(this).is(':checked') || 'ccpa' === Cli_Data.ccpaType)
					{
					CLI_Cookie.set(categoryCookie,'yes',CLI_ACCEPT_COOKIE_EXPIRE);
				}else
				{
					CLI_Cookie.set(categoryCookie,'no',CLI_ACCEPT_COOKIE_EXPIRE);	
				}
			}
			else
			{	
				if(categoryCookieValue == "yes")
				{
					jQuery(this).prop("checked",true);
				}
				else
				{
					jQuery(this).prop("checked",false);
				}

			}
			
        });
    	jQuery('.cli-user-preference-checkbox').click(function(){
			var dataID = jQuery(this).attr('data-id');
			var currentToggleElm = jQuery('.cli-user-preference-checkbox[data-id='+dataID+']');
        	if(jQuery(this).is(':checked'))
        	{	
        		CLI_Cookie.set('cookielawinfo-'+dataID,'yes',CLI_ACCEPT_COOKIE_EXPIRE);
				currentToggleElm.prop('checked',true);
			}else
        	{
				CLI_Cookie.set('cookielawinfo-'+dataID,'no',CLI_ACCEPT_COOKIE_EXPIRE);	
				currentToggleElm.prop('checked',false);				
			}
			CLI.checkCategories();
			CLI.generate_user_preference_cookie();
			CLI.generateConsent();
        });
	},
	attachEvents:function()
	{	
		jQuery(document).on('click keypress','.wt-cli-privacy-btn',function(e){
			var key = e.which;
			e.preventDefault();
			if(key === 1 || key === 13) {
				const action = jQuery(this).attr('data-cli-action');
				if( action === 'accept_all') {
					CLI.ConsentAction('accept');
				} else {
					CLI.ConsentAction('custom');
				}
			}
		});
		jQuery(document).on('click keypress','#wt-cli-save-preferences-btn',function(e){
			var key = e.which;
			e.preventDefault();
			if(key === 1 || key === 13) {
				CLI.ConsentAction('custom');
			}
		});
		jQuery('.wt-cli-privacy-overview-actions').find('a').last().keydown(function(e) {
			var key = e.which
			if(key === 9) {
				if(e.shiftKey === false) {
					e.preventDefault()
					jQuery('#cliModalClose').focus()
				}
			}
		});
		jQuery(document).on('click keypress','.cli_action_button',function(e){
			let choice = 'all';
			var key = e.which;
			e.preventDefault();
			if(key === 1 || key === 13) {
				var elm=jQuery(this);
				var button_action=elm.attr('data-cli_action');
				var open_link=elm[0].hasAttribute("href") && elm.attr("href").charAt(0) !== '#' ? true : false;
				var new_window=false;
				
				if(button_action=='accept')
				{
					if (e.originalEvent !== undefined) {

						if(CLI.settings.accept_all==true)
						{
							CLI.enableAllCookies();
						}
						
					}
					else
					{	
						CLI.settingsPopUpClose();
						choice = 'custom';
					}
					CLI.accept_close();
					new_window=CLI.settings.button_1_new_win ? true : false;
				} 
				else if( button_action == 'accept_all') {
					CLI.enableAllCookies();
					CLI.accept_close();
					new_window=CLI.settings.button_7_new_win ? true : false;
				}
				else if(button_action=='reject')
				{	
					CLI.disableAllCookies();
					CLI.reject_close();
					new_window=CLI.settings.button_3_new_win ? true : false;
					choice = 'reject';
				}
				CLI.saveLog(button_action);
				if(open_link)
				{
					if(new_window)
					{
						window.open(elm.attr("href"),'_blank');
					}else
					{
						window.location.href =elm.attr("href");
					}  
				}
				CLI.MaybeClosePreference(jQuery(this));
				CLI.AfterConsent(choice);
			}
		});
		jQuery(document).on('click','.cli_cookie_close_button',function(e){
			e.preventDefault();
			var elm=jQuery(this);
			var button_action=elm.attr('data-cli_action');
			if(CLI.settings.accept_all==true)
			{
				CLI.enableAllCookies();
			}
			CLI.accept_close();
			CLI.saveLog(button_action);
		});
	},
	saveLog: function(button_action = 'ccpaOptOut') {
		if (CLI.settings.logging_on) {
			var ccpaOptedOut = cliBlocker.ccpaOptedOut();
			var cookies = CLI_Cookie.getallcookies(); // Default: Get all cookies
			cookies.ccpaOptout = ccpaOptedOut;
			jQuery.ajax({
				url: log_object.ajax_url,
				type: 'POST',
				data: {
					action: 'wt_log_visitor_action',
					wt_clicked_button_id: '',
					wt_user_action: button_action,
					cookie_list: cookies
				},
				success: function(response) {
	
				}
			});
		}
	},
	attachDelete:function()
	{
		this.delete_link.click(function () {
	        CLI_Cookie.erase(CLI_ACCEPT_COOKIE_NAME);
	        for(var k in Cli_Data.nn_cookie_ids) 
	        {
	            CLI_Cookie.erase(Cli_Data.nn_cookie_ids[k]);
	        }
			CLI.generate_user_preference_cookie();
			CLI.generateConsent();
	        window.location.reload();	
	        return false;
	    });
	},
	configButtons:function()
	{
	    //[cookie_button]
	    this.main_button.css('color',this.settings.button_1_link_colour);
	    if(this.settings.button_1_as_button) 
	    {
	        this.main_button.css('background-color',this.settings.button_1_button_colour);
	        this.main_button.hover(function () {
	            jQuery(this).css('background-color',CLI.settings.button_1_button_hover);
	        },function (){
	            jQuery(this).css('background-color',CLI.settings.button_1_button_colour);
	        });
	    }

	    //[cookie_link]	    
	    this.main_link.css('color',this.settings.button_2_link_colour);
	    if(this.settings.button_2_as_button) 
	    {
	        this.main_link.css('background-color',this.settings.button_2_button_colour);
	        this.main_link.hover(function () {
	            jQuery(this).css('background-color',CLI.settings.button_2_button_hover);
	        },function (){
                jQuery(this).css('background-color',CLI.settings.button_2_button_colour);
            });
	    }


	    //[cookie_reject]	    
	    this.reject_link.css('color',this.settings.button_3_link_colour);
	    if(this.settings.button_3_as_button) 
	    {
	        this.reject_link.css('background-color',this.settings.button_3_button_colour);
	        this.reject_link.hover(function () {
	            jQuery(this).css('background-color',CLI.settings.button_3_button_hover);
	        },function () {
	            jQuery(this).css('background-color',CLI.settings.button_3_button_colour);
	        });
	    }

	    //[cookie_settings]
	    this.settings_link.css('color',this.settings.button_4_link_colour);
	    if(this.settings.button_4_as_button)
	    {
	        this.settings_link.css('background-color',this.settings.button_4_button_colour);
	        this.settings_link.hover(function () {
	            jQuery(this).css('background-color',CLI.settings.button_4_button_hover);
	        },function () {
	            jQuery(this).css('background-color',CLI.settings.button_4_button_colour);
	        });
		}

		//[cookie_accept_all]
		this.accept_all_button.css('color',this.settings.button_7_link_colour);
		if(this.settings.button_7_as_button) 
		{
			this.accept_all_button.css('background-color',this.settings.button_7_button_colour);
			this.accept_all_button.hover(function () {
				jQuery(this).css('background-color',CLI.settings.button_7_button_hover);
			},function (){
				jQuery(this).css('background-color',CLI.settings.button_7_button_colour);
			});
		}
		//[cookie_save_preferences]
		this.save_my_prefer_button.css('color',this.settings.button_8_link_colour);
		if(this.settings.button_8_as_button) 
		{
			this.save_my_prefer_button.css('background-color',this.settings.button_8_button_colour);
			this.save_my_prefer_button.hover(function () {
				jQuery(this).css('background-color',CLI.settings.button_8_button_hover);
			},function (){
				jQuery(this).css('background-color',CLI.settings.button_8_button_colour);
			});
		}
		
	},
	toggleBar:function()
	{	
		if(CLI_COOKIEBAR_AS_POPUP)
		{
			this.barAsPopUp(1);
		}
		if(CLI.settings.cookie_bar_as=='widget')
		{
			this.barAsWidget(1);
		}
	    if(this.settings.show_once_yn) 
	    {	
			
	        setTimeout(function(){
			if(!CLI_Cookie.read(CLI_ACCEPT_COOKIE_NAME))
			{
				CLI.close_header();
				CLI.BannerStatus('hidden');
			}
			},CLI.settings.show_once);
		}
		this.showagain_elm.on('click keypress', function (e) {
			var key = e.which;
	 		if(key === 1 || key === 13) {
					e.preventDefault();
				CLI.showagain_elm.slideUp(CLI.settings.animate_speed_hide, function() {
					CLI.BannerStatus('revisit');
					CLI.bar_elm.slideDown(CLI.settings.animate_speed_show);
					CLI.refocusElement();
					if(CLI_COOKIEBAR_AS_POPUP) {
						CLI.showPopupOverlay();
					}
				});
			}
	    });
	},
	configShowAgain:function()
	{
		this.showagain_config = {
	        'background-color': this.settings.background,
	        'color':this.settings.text,
	        'position': 'fixed',
	        'font-family': this.settings.font_family
	    };
	    if(this.settings.border_on) 
	    {
	        var border_to_hide = 'border-' + this.settings.notify_position_vertical;
	        this.showagain_config['border'] = '1px solid ' + this.l1hs(this.settings.border);
	        this.showagain_config[border_to_hide] = 'none';
	    }
	    var cli_win=jQuery(window);
    	var cli_winw=cli_win.width();
    	var showagain_x_pos=this.settings.showagain_x_position;
    	if(cli_winw<300)
    	{
    		showagain_x_pos=10;
    		this.showagain_config.width=cli_winw-20;
    	}else
    	{
    		this.showagain_config.width='auto';
    	}
	    var cli_defw=cli_winw>400 ? 500 : cli_winw-20;
	    if(CLI_COOKIEBAR_AS_POPUP) //cookie bar as popup
	    {
	    	var sa_pos=this.settings.popup_showagain_position;
	    	var sa_pos_arr=sa_pos.split('-');
	    	if(sa_pos_arr[1]=='left')
	    	{
	    		this.showagain_config.left=showagain_x_pos;
	    	}else if(sa_pos_arr[1]=='right')
	    	{	
	    		this.showagain_config.right=showagain_x_pos;
	    	}
	    	if(sa_pos_arr[0]=='top')
	    	{
	    		this.showagain_config.top=0;

	    	}else if(sa_pos_arr[0]=='bottom')
	    	{	
	    		this.showagain_config.bottom=0;
	    	}
	    	this.bar_config['position'] = 'fixed';

	    }else if(this.settings.cookie_bar_as=='widget')
	    {
	    	this.showagain_config.bottom=0;
	    	if(this.settings.widget_position=='left')
	    	{
	    		this.showagain_config.left=showagain_x_pos;
	    	}else if(this.settings.widget_position=='right')
	    	{	
	    		this.showagain_config.right=showagain_x_pos;
	    	}
	    }
	    else
	    {
	    	if(this.settings.notify_position_vertical == "top") 
		    {
		        this.showagain_config.top = '0';
		    }
		    else if(this.settings.notify_position_vertical == "bottom") 
		    {
		        this.bar_config['position'] = 'fixed';
		        this.bar_config['bottom'] = '0';
		        this.showagain_config.bottom = '0';
		    }
		    if(this.settings.notify_position_horizontal == "left") 
		    {
		        this.showagain_config.left =showagain_x_pos;
		    }else if(this.settings.notify_position_horizontal == "right") 
		    {
		        this.showagain_config.right =showagain_x_pos;
		    }
	    } 
	    this.showagain_elm.css(this.showagain_config);
	},
	configBar:function()
	{	
		var templateID = '';
		this.bar_config = {
	        'background-color':this.settings.background,
	        'color':this.settings.text,
	        'font-family':this.settings.font_family
		};
		if (jQuery(".wt-cli-template")[0])
		{		
				var templateElm = jQuery(".wt-cli-template");
				var templateClasses = templateElm.attr('class');
				var templateClasses = templateClasses.split(" ");
				var matchingID = templateClasses.filter(function (value) {

					return value.match(/\bcli-style/);
					
				});
				templateID = matchingID[0];
				this.bar_elm.attr('data-template-id',templateID);
		} 
		if(jQuery(".wt-cli-category-widget")[0])
		{
			this.bar_elm.addClass('wt-cli-category-widget-active');
		}
		if(this.settings.cookie_setting_popup===false)
		{
			this.barPopupStyle();
		}
	    if(this.settings.notify_position_vertical=="top") 
	    {
	        this.bar_config['top'] = '0';
	        if(this.settings.header_fix === true) 
	        {
	            this.bar_config['position'] = 'fixed';
	        }
	    }else 
	    {
	        this.bar_config['bottom'] = '0';
	    }
	    this.configShowAgain();
		this.bar_elm.css(this.bar_config).hide();
	},
	l1hs:function(str) 
	{
	    if (str.charAt(0) == "#") {
	        str = str.substring(1, str.length);
	    } else {
	        return "#" + str;
	    }
	    return this.l1hs(str);
	},
	close_header:function() 
	{	
		CLI_Cookie.set(CLI_ACCEPT_COOKIE_NAME,'yes',CLI_ACCEPT_COOKIE_EXPIRE);
		if(CLI.settings.accept_all==true)
		{
			CLI.enableAllCookies();
		}
		CLI.accept_close();
		this.hideHeader();
		CLI.saveLog('accept');
		
    },
	accept_close:function() 
    {   
		
			this.hidePopupOverlay();
			CLI_Cookie.set(CLI_ACCEPT_COOKIE_NAME,'yes',CLI_ACCEPT_COOKIE_EXPIRE);
			if(this.settings.notify_animate_hide) 
			{
				this.bar_elm.slideUp(this.settings.animate_speed_hide,cliBlocker.runScripts);
			}else 
			{
				this.bar_elm.hide(0,cliBlocker.runScripts);
			}
			if(this.settings.showagain_tab) 
			{
				this.showagain_elm.slideDown(this.settings.animate_speed_show);
			}
			this.generate_user_preference_cookie();
			this.generateConsent();
			CLI.cookieLawInfoRunCallBacks();
			if(this.settings.accept_close_reload === true) 
			{
				this.reload_current_page();
			}	
			CLI.BannerStatus('hidden');
        return false;
    },
	reject_close:function() 
    {	
        this.hidePopupOverlay();
        for(var k in Cli_Data.nn_cookie_ids) 
        {
            CLI_Cookie.erase(Cli_Data.nn_cookie_ids[k]);
        }
        CLI_Cookie.set(CLI_ACCEPT_COOKIE_NAME,'no',CLI_ACCEPT_COOKIE_EXPIRE);
        if(this.settings.notify_animate_hide) 
        {
            this.bar_elm.slideUp(this.settings.animate_speed_hide,cliBlocker.runScripts);
        }else 
        {
            this.bar_elm.hide(0,cliBlocker.runScripts);
        }
        if(this.settings.showagain_tab) 
        {
			this.showagain_elm.slideDown(this.settings.animate_speed_show);
        }
		this.generate_user_preference_cookie();
		CLI.generateConsent();
        if(this.settings.reject_close_reload === true) 
        {
            this.reload_current_page();
        }
		CLI.BannerStatus('hidden');
		if(CLI_Cookie.read(CLI_ACCEPT_COOKIE_NAME)=='no') {	
			this.checkCategories();
			if("function" == typeof CookieLawInfo_Reject_Callback){
				CookieLawInfo_Reject_Callback(); 
			}
		}
        return false;
    },
    generate_user_preference_cookie:function()
    {
    	var cli_user_preference_arr=new Array();
    	var cli_user_preference_val='';
    	if(CLI_Cookie.read(CLI_ACCEPT_COOKIE_NAME))
    	{
    		cli_user_preference_arr.push('cli-'+CLI_Cookie.read(CLI_ACCEPT_COOKIE_NAME));
    	}
    	jQuery('.cli-user-preference-checkbox').each(function(){
    		if(jQuery(this).is(':checked'))
        	{
        		cli_user_preference_arr.push(jQuery(this).attr('data-id')+'-yes');
        	}else
        	{
        	    cli_user_preference_arr.push(jQuery(this).attr('data-id')+'-no');	
        	}
    	});
    	if(cli_user_preference_arr.length>0)
    	{
			cli_user_preference_val=Cli_Data.current_lang+'-'+cli_user_preference_arr.join('-');
    	}
    	CLI_Cookie.set('cli_user_preference',cli_user_preference_val,CLI_ACCEPT_COOKIE_EXPIRE);
	},
	isBase64:function(str) {
		if (str ==='' || str.trim() ===''){ return false; }
		try {
			return btoa(atob(str)) == str;
		} catch (err) {
			return false;
		}
	},
	generateConsent:function()
	{	
		var preferenceCookie = CLI_Cookie.read(CLI_PREFERNCE_COOKIE);
		cliConsent = {};
		if(preferenceCookie !== null) {
			if(CLI.isBase64(preferenceCookie))
			{
				cliConsent = window.atob(preferenceCookie);
			}
			else
			{
				cliConsent = decodeURIComponent(preferenceCookie);
			}
			cliConsent = JSON.parse(cliConsent);
		}
		cliConsent.ver = Cli_Data.consentVersion;
		categories = [];
		jQuery('.cli-user-preference-checkbox').each(function(){
			categoryVal = '';
			cli_chkbox_data_id = jQuery(this).attr('data-id');
			cli_chkbox_data_id = cli_chkbox_data_id.replace('checkbox-','');
			if(jQuery(this).is(':checked'))
        	{	
				categoryVal = 'true';
			}
			else	
        	{		
				categoryVal = 'false';
			}
			cliConsent[cli_chkbox_data_id] = categoryVal;
				
		});
		cliConsent = JSON.stringify(cliConsent);
		cliConsent = window.btoa(cliConsent);
		CLI_Cookie.set(CLI_PREFERNCE_COOKIE,cliConsent,CLI_ACCEPT_COOKIE_EXPIRE);
	},
	cliRenewConsent:function()
	{	
		var preferenceCookie = CLI_Cookie.read(CLI_PREFERNCE_COOKIE);
		if(preferenceCookie !== null)
		{	
			if(CLI.isBase64(preferenceCookie))
			{
				cliConsent = window.atob(preferenceCookie);
			}
			else
			{
				cliConsent = decodeURIComponent(preferenceCookie);
			}
			cliConsent = JSON.parse(cliConsent);
			consentCurrentVersion = parseInt(cliConsent.ver);
			consentRenewVersion = parseInt(Cli_Data.consentVersion);
			if( typeof(cliConsent.ver) !== 'undefined') {
				if(cliConsent.ver !== Cli_Data.consentVersion)
				{	
					CLI_Cookie.erase(CLI_ACCEPT_COOKIE_NAME);
					CLI_Cookie.erase(CLI_PREFERNCE_COOKIE);
					CLI_Cookie.erase('cli_user_preference');
					for(var k in Cli_Data.nn_cookie_ids) 
					{
						CLI_Cookie.erase(Cli_Data.nn_cookie_ids[k]);
					}
				}
			}
		}
		
		
	},
    reload_current_page:function()
    {	
		window.location.reload();
    },
    add_clear_cache_url_query:function()
    {
    	var cli_rand=new Date().getTime()/1000;
    	var cli_url=window.location.href;
    	var cli_hash_arr=cli_url.split('#');
    	var cli_urlparts= cli_hash_arr[0].split('?');
    	if(cli_urlparts.length>=2) 
    	{
    		var cli_url_arr=cli_urlparts[1].split('&');
    		cli_url_temp_arr=new Array();
    		for(var cli_i=0; cli_i<cli_url_arr.length; cli_i++)
    		{   			
    			var cli_temp_url_arr=cli_url_arr[cli_i].split('=');
    			if(cli_temp_url_arr[0]=='cli_action')
    			{

    			}else
    			{
    				cli_url_temp_arr.push(cli_url_arr[cli_i]);
    			}
    		}
    		cli_urlparts[1]=cli_url_temp_arr.join('&');
    		cli_url=cli_urlparts.join('?')+(cli_url_temp_arr.length>0 ? '&': '')+'cli_action=';
    	}else
    	{
    		cli_url=cli_hash_arr[0]+'?cli_action=';
    	}
    	cli_url+=cli_rand;
    	if(cli_hash_arr.length>1)
    	{
    		cli_url+='#'+cli_hash_arr[1];
    	}
    	return cli_url;
    },
	closeOnScroll:function() 
	{
        if(window.pageYOffset > 100 && !CLI_Cookie.read(CLI_ACCEPT_COOKIE_NAME)) 
        {	
			if(CLI.settings.accept_all==true)
			{
				CLI.enableAllCookies();
			}
			CLI.accept_close();
			CLI.saveLog('accept');
            if(CLI.settings.scroll_close_reload === true) 
            {
                window.location.reload();
            }
            window.removeEventListener("scroll",CLI.closeOnScroll,false);
        }
    },
    displayHeader:function() 
    {        
        if(this.settings.notify_animate_show) 
        {
            this.bar_elm.slideDown(this.settings.animate_speed_show);
        }else 
        {
			this.bar_elm.show();
			CLI.refocusElement();
        }
        this.showagain_elm.hide();
        if(CLI_COOKIEBAR_AS_POPUP)
		{
			this.showPopupOverlay();
		}    
		CLI.BannerStatus('visible');
    },
    hideHeader:function()
    {      
        if(this.settings.showagain_tab) 
        {
	        if(this.settings.notify_animate_show) 
	        {
	            this.showagain_elm.slideDown(this.settings.animate_speed_show);
	        } else {
	            this.showagain_elm.show();
	        }
    	}else
    	{
    		this.showagain_elm.hide();
    	}
        this.bar_elm.slideUp(this.settings.animate_speed_show);
        this.hidePopupOverlay();
		CLI.BannerStatus('hidden');
    },
    hidePopupOverlay:function()
    {	
		
        jQuery('body').removeClass("cli-barmodal-open");
        jQuery(".cli-popupbar-overlay").removeClass("cli-show");
    },
    showPopupOverlay:function()
    {	
		if( this.bar_elm.length ) {
			if(this.settings.popup_overlay)
			{	
				
				if(  ! ( this.main_link.hasClass('cli-minimize-bar') )) {
					jQuery('body').addClass("cli-barmodal-open");
					jQuery(".cli-popupbar-overlay").addClass("cli-show");
				}	
				
			}
		}
        
    },
    barAsWidget:function(a)
    {
		var cli_elm=this.bar_elm;
		cli_elm.attr('data-cli-type','widget');
	    var cli_win=jQuery(window);
	    var cli_winh=cli_win.height()-40;
	    var cli_winw=cli_win.width();
	    var cli_defw=cli_winw>465 ? 445 : cli_winw-60;
	    cli_elm.css({
	        'width':cli_defw,'height':'auto','max-height':cli_winh,'overflow':'auto','position':'fixed','box-shadow':'rgba(0,0,0,.5) 0px 5px 10px','box-sizing':'border-box'
	    });
	    if(this.settings.widget_position=='left')
	    {
	    	cli_elm.css({
	        	'left':'30px','right':'auto','bottom':'30px','top':'auto'
	    	});
	    }else
	    {
	    	cli_elm.css({
	        	'left':'auto','right':'30px','bottom':'30px','top':'auto'
	    	});
	    }
	    if(a)
	    {
	    	this.setResize();
		}
    },
    barAsPopUp:function(a)
    {
    	if(typeof cookie_law_info_bar_as_popup==='function')
    	{
    		return false;
    	}
		var cli_elm=this.bar_elm;
		cli_elm.attr('data-cli-type','popup');
	    var cli_win=jQuery(window);
		var cli_winh=cli_win.height();
		var cli_defh = cli_winh > 500 ? 500 : cli_winh;
	    var cli_winw=cli_win.width();
	    var cli_defw=cli_winw>700 ? 500 : cli_winw-20;
	    //var cli_defw=cli_defw<500 ? 500 : cli_defw;
	    cli_elm.css({
	        'width':cli_defw,'height':'auto','max-height':cli_defh,'bottom':'','top':'50%','left':'50%','transform':'translate(-50%, -50%)','overflow':'auto'
	    });
	    if(a)
	    {
	    	this.setResize();
		}
    },
    setResize:function()
	{
		var resizeTmr=null;
		jQuery(window).resize(function() {
			clearTimeout(resizeTmr);
			resizeTmr=setTimeout(function()
			{
				if(CLI_COOKIEBAR_AS_POPUP)
				{
					CLI.barAsPopUp();
				}
				if(CLI.settings.cookie_bar_as=='widget')
				{
					CLI.barAsWidget();
				}
				CLI.configShowAgain();
			},500);
		});		
	},
	isValidHex:function(color) {
		if(!color || typeof color !== 'string') return false;
	
		// Validate hex values
		if(color.substring(0, 1) === '#') color = color.substring(1);
	
		switch(color.length) {
		  case 3: return /^[0-9A-F]{3}$/i.test(color);
		  case 6: return /^[0-9A-F]{6}$/i.test(color);
		  case 8: return /^[0-9A-F]{8}$/i.test(color);
		  default: return false;
		}
		return false;
	},
	ColorLuminance:function(hex, lum) {
        // validate hex string
        hex = String(hex).replace(/[^0-9a-f]/gi, '');
        if (hex.length < 6) {
            hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
        }
        lum = lum || 0;
        // convert to decimal and change luminosity
		var rgb = "#", c, i;
        for (i = 0; i < 3; i++) {
            c = parseInt(hex.substr(i*2,2), 16);
            c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
            rgb += ("00"+c).substr(c.length);
        }
        return rgb;
	},
	rgb2hex:function(rgb){
		rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
		return (rgb && rgb.length === 4) ? "#" +
		 ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
		 ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
		 ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
	   },
	lightOrDark:function(color) {

		// Variables for red, green, blue values
		var r, g, b, hsp;
		
		// Check the format of the color, HEX or RGB?
		if (color.match(/^rgb/)) {
	
			// If HEX --> store the red, green, blue values in separate variables
			color = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);
			
			r = color[1];
			g = color[2];
			b = color[3];
		} 
		else {
			
			// If RGB --> Convert it to HEX: http://gist.github.com/983661
			color = +("0x" + color.slice(1).replace( 
			color.length < 5 && /./g, '$&$&'));
	
			r = color >> 16;
			g = color >> 8 & 255;
			b = color & 255;
		}
		
		// HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
		hsp = Math.sqrt(
		0.299 * (r * r) +
		0.587 * (g * g) +
		0.114 * (b * b)
		);
	
		// Using the HSP value, determine whether the color is light or dark
		if (hsp>127.5) {
	
			return 'light';
		} 
		else {
	
			return 'dark';
		}
	},
	barPopupStyle:function()
	{
		var acceptBtn = jQuery('.cli_action_button[data-cli_action=accept]');
		var primaryColor = this.settings.button_1_button_colour;
		var primaryLinkColor = this.settings.button_1_link_colour;
		var barColor = this.settings.background;
		var extractedStyle = '';
		var primaryBtnStyle = this.settings.button_1_style;
		Object.keys(primaryBtnStyle).forEach(function(element) {
			extractedStyle+=primaryBtnStyle[element][0]+':'+primaryBtnStyle[element][1]+';';
		  });
		var shadeColor;
		if(!CLI.isValidHex(barColor))
		{
			barColor=CLI.rgb2hex(barColor);
		}
		if(barColor=="#000000")
		{
			shadeColor='#191919';
		}
		else
		{	
			var intensity=CLI.lightOrDark(barColor);
			if(intensity=='light')
			{
				shadeColor = CLI.ColorLuminance(barColor, -0.05);
			}
			else
			{
				shadeColor = CLI.ColorLuminance(barColor, 0.4);
			}
		}
		jQuery("<style>")
		.prop("type", "text/css")
		.html("\
		#cookie-law-info-bar .cli-switch input:checked + .cli-slider{\
			background-color: "+primaryColor+";\
		}\
		#cookie-law-info-bar  .cli-tab-header{\
			background-color: "+shadeColor+"\
		}\
		#cookie-law-info-bar .cli-switch .cli-slider:before{\
			background-color: "+barColor+";\
		}\
		#cookie-law-info-bar .cli-tab-footer .cli-btn{\
			background-color:"+primaryColor+";"+extractedStyle+"\
		}\
		").appendTo("head");
			
	},
	enableAllCookies:function()
    {	
		
    	jQuery('.cli-user-preference-checkbox').each(function(){
			var cli_chkbox_elm=jQuery(this);
			var cli_chkbox_data_id=cli_chkbox_elm.attr('data-id');
			if(cli_chkbox_data_id!='checkbox-necessary')
			{
				cli_chkbox_elm.prop('checked',true);
				CLI_Cookie.set('cookielawinfo-'+cli_chkbox_data_id,'yes',CLI_ACCEPT_COOKIE_EXPIRE);
			}
		});
	},
	disableAllCookies:function()
    {	
    	jQuery('.cli-user-preference-checkbox').each(function(){

			var cli_chkbox_elm=jQuery(this);
			var cli_chkbox_data_id=cli_chkbox_elm.attr('data-id');
			cliCategorySlug = cli_chkbox_data_id.replace('checkbox-','');			
			if(Cli_Data.strictlyEnabled.indexOf(cliCategorySlug) === -1)
			{
				cli_chkbox_elm.prop('checked',false);
				CLI_Cookie.set('cookielawinfo-'+cli_chkbox_data_id,'no',CLI_ACCEPT_COOKIE_EXPIRE);
			}
		});
	},
	privacyReadmore:function()
	{	
		var originalHtml = '';

		Trunc = {
			addReadmore:function(textBlock)
			{	
				if(textBlock.html().length > Cli_Data.privacy_length)
				{
					jQuery('.cli-privacy-readmore').show();
				}
				else
				{
					jQuery('.cli-privacy-readmore').hide();
				}
			},
			truncateText : function( textBlock ) {   
				var strippedText = jQuery('<div />').html(textBlock.html()); 
				strippedText.find('table').remove();        
				textBlock.html(strippedText.html());
				currentText = textBlock.text();
				if(currentText.trim().length > Cli_Data.privacy_length){
					var newStr = currentText.substring(0, Cli_Data.privacy_length);
					textBlock.empty().html(newStr).append('...');
				}
			},     
			replaceText: function ( textBlock, original ){
				return textBlock.html(original);      
			}  
		};
		
		jQuery('.cli-privacy-content .cli-privacy-content-text').each(function () {
			var el = jQuery(this);
			var clone = el.clone();
			originalHtml = clone.html();
			Trunc.addReadmore(el);
			Trunc.truncateText(el);
		});
	
		jQuery(document).on('click keypress','a.cli-privacy-readmore',function(e){
			var key = e.which;
			e.preventDefault();
			if (key === 1 || key === 13) {
				
				var currentElement = jQuery(this);
				var privacyElement = currentElement.closest('.cli-privacy-overview');
				var privacyContent = privacyElement.find('.cli-privacy-content-text');

				if ( privacyElement.hasClass('cli-collapsed') ) {
					Trunc.truncateText(privacyContent);
					privacyElement.removeClass('cli-collapsed');
					privacyContent.css('height', '100%');
				}
				else {
					privacyElement.addClass('cli-collapsed');
					Trunc.replaceText(privacyContent, originalHtml);
				}
			}
		});
	},
  	checkCategories:function()
	{	
		var cliAllowedCategories =  [];
		var cli_categories = {};
		jQuery('.cli-user-preference-checkbox').each(function()
		{	var status=false;
			cli_chkbox_elm=jQuery(this);
			cli_chkbox_data_id=cli_chkbox_elm.attr('data-id');
			cli_chkbox_data_id=cli_chkbox_data_id.replace('checkbox-','');
			//cli_chkbox_data_id_trimmed=cli_chkbox_data_id.replace('-','_')
    		if(jQuery(cli_chkbox_elm).is(':checked'))
        	{
				status=true;
				cliAllowedCategories.push(cli_chkbox_data_id);
			}
			
			cli_categories[cli_chkbox_data_id]= status;
		});
		CLI.allowedCategories = cliAllowedCategories;
		CLI.consent=cli_categories;
	},
	cookieLawInfoRunCallBacks:function()
	{		
		this.checkCategories();
		if(CLI_Cookie.read(CLI_ACCEPT_COOKIE_NAME)=='yes')		
    	{	
			if("function" == typeof CookieLawInfo_Accept_Callback){
				CookieLawInfo_Accept_Callback(); 
			}
		}
	},
	addStyleAttribute:function()
	{
		var bar=this.bar_elm;
		var styleClass='';
		if(jQuery(bar).find('.cli-bar-container').length > 0)
		{
			styleClass=jQuery('.cli-bar-container').attr('class');
			styleClass=jQuery.trim(styleClass.replace('cli-bar-container',''));
			jQuery(bar).attr('data-cli-style',styleClass);
		}
	},
	getParameterByName: function( name, url ) {
		if (!url) url = window.location.href;
		name = name.replace(/[\[\]]/g, '\\$&');
		var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
			results = regex.exec(url);
		if (!results) return null;
		if (!results[2]) return '';
		return decodeURIComponent(results[2].replace(/\+/g, ' '));
	},
	acceptPageNavigation: function() {
		if( Boolean( this.settings.accept_close_page_navigation ) === true  && !CLI_Cookie.read(CLI_ACCEPT_COOKIE_NAME)) {
			jQuery(document).on('click','a', function () {
				var href = jQuery(this).attr('href');
				if( href !== undefined ) {
					CLI.close_header();
				}
			});
		}
	},
	refocusElement: function() {
		if( this.banner_heading.length > 0 ) {
			this.banner_heading.focus();
		} else {
			this.bar_elm.find('a').first().focus();
		}
	},
	mayBeSetPreferenceCookie: function() {
		if( CLI.getParameterByName('cli_bypass') === "1" ) {
			CLI.generateConsent();
		}
	},
	AfterConsent: function( status) {
		const consentCategories = { accepted: [], rejected: [] };
		document.querySelectorAll(".cli-user-preference-checkbox").forEach(function (item) {
			if( !item ) return;
			const category  = item.getAttribute("data-id").replace("checkbox-", "");
			if(item.checked) consentCategories.accepted.push(category)
			else consentCategories.rejected.push(category)
		});
	
		const consentUpdate = new CustomEvent('cli_consent_update', {
			detail: {
				status: status,
				categories: consentCategories
			},
		});
		document.dispatchEvent(consentUpdate);
	},
	ConsentAction: function( choice = 'accept') {
		if( choice === 'accept') {
			CLI.enableAllCookies();
		}
		if( choice != 'reject' ) {
			CLI.accept_close();
		} else {
			CLI.reject_close();
		}
		CLI.saveLog(choice);
		CLI.settingsPopUpClose();
		CLI.AfterConsent(choice);
	},
	TogglePreference: function(slide = false ) {
		if( slide == true ) {
			jQuery('#cookie-law-info-bar .cli-tab-container').slideToggle(CLI.settings.animate_speed_show);
		} else {
			jQuery('#cliSettingsPopup').addClass("cli-show").css({'opacity':0}).animate({'opacity':1});
			jQuery('#cliSettingsPopup').removeClass('cli-blowup cli-out').addClass("cli-blowup");
			jQuery('#cliSettingsPopup').attr('aria-hidden', false);
			jQuery('body').addClass("cli-modal-open");
			jQuery(".cli-settings-overlay").addClass("cli-show");
			jQuery("#cookie-law-info-bar").css({'opacity':.1});
			jQuery("#cliModalClose").focus();
			if(!jQuery('.cli-settings-mobile').is(':visible'))
			{
				jQuery('#cliSettingsPopup').find('.cli-nav-link:eq(0)').click();
			}
		}
	},
	MaybeClosePreference: function( element ) {
		if (element.parent().hasClass('cli-preference-btn-wrapper')) {
			CLI.settingsPopUpClose();
		}
	},
	async BannerStatus(status = 'visible') {
	    if (CLI.ref && typeof CLI.ref._cliIABStatusUpdate === 'function') {
	        if (status == 'visible') {
	            CLI.ref._cliIABStatusUpdate(true, true);
	        } 
	        else if (status == 'revisit') {
	            CLI.ref._cliIABStatusUpdate(true);
	        } 
	        else {
	            CLI.ref._cliIABStatusUpdate(false);
	        }
	    }
	}
}
var cliBlocker = 
{   
	blockingStatus: true,
	geoIP: false,
	scriptsLoaded: false,
	ccpaEnabled : false,
	ccpaRegionBased : false,
	ccpaApplicable : false,
	ccpaBarEnabled: false,
	cliShowBar: true ,
	isBypassEnabled: CLI.getParameterByName('cli_bypass'),
    checkPluginStatus:function(callbackA , callbackB )
	{	
		
		cliBlocker.ccpaEnabled = Boolean( Cli_Data.ccpaEnabled );
		cliBlocker.ccpaRegionBased = Boolean( Cli_Data.ccpaRegionBased );
		cliBlocker.ccpaBarEnabled = Boolean( Cli_Data.ccpaBarEnabled );
		if( cliBlocker.ccpaEnabled === true ) {
			cliBlocker.ccpaApplicable = true;
			if( Cli_Data.ccpaType === 'ccpa') {
				cliBlocker.blockingStatus = false;
				cliBlocker.cliShowBar = false;
				if( cliBlocker.ccpaBarEnabled === true ) {
					cliBlocker.cliShowBar = true;
					cliBlocker.blockingStatus = true;	
				}
			}
		}
		
		if(Cli_Data.geoIP === 'enabled' || (cliBlocker.ccpaEnabled === true && cliBlocker.ccpaRegionBased === true ) )
		{	
			if( Boolean( Cli_Data.use_custom_geolocation_api ) === true  ) {

				cliBlocker.tryCustomGeoLocationService( callbackA, callbackB );

			} else {
				jQuery.getJSON('https://ipapi.co/json/', function(data)
				{	
					cliBlocker.geolocationHandler( data, callbackA, callbackB );

				}).fail(function() {

					cliBlocker.tryCustomGeoLocationService( callbackA, callbackB );

				});
			}
			
		} else {
			if ( cliBlocker.isBypassEnabled === "1") {
				cliBlocker.blockingStatus = false;
			}
			callbackA();
			callbackB();
		}
		
	},
	tryCustomGeoLocationService: function( callbackA, callbackB ) {
		jQuery.getJSON(Cli_Data.custom_geolocation_api, function(data) {
			cliBlocker.geolocationHandler( data, callbackA, callbackB );
		});
	},
	geolocationHandler:function( data, callbackA, callbackB ){
		var euCountries = Cli_Data.eu_countries;
		if( (data.in_eu === false ) && (euCountries.indexOf(data.country) === -1))
		{	
			if( Cli_Data.geoIP === 'enabled' ) {
				cliBlocker.blockingStatus = false;	
				cliBlocker.cliShowBar = false;
			}
			else {
				if( Cli_Data.ccpaType !== 'ccpa' ) {
					cliBlocker.blockingStatus = true;	
					cliBlocker.cliShowBar = true;
				}
			}
		}
		else
		{	
			jQuery('body').addClass('wt-cli-geoip-on wt-cli-eu-country');
		}
		if( cliBlocker.ccpaEnabled === true ) { 
			if( cliBlocker.ccpaRegionBased === true && data.region_code !== 'CA' ) {
				cliBlocker.ccpaApplicable = false;	
				if( Cli_Data.ccpaType === 'ccpa') {
					cliBlocker.cliShowBar = false;
					cliBlocker.blockingStatus = false;	
				}
				jQuery('.wt-cli-ccpa-opt-out,.wt-cli-ccpa-checkbox,.wt-cli-ccpa-element').remove();
			} 
			else {
				cliBlocker.ccpaApplicable = true;	
				if( cliBlocker.ccpaBarEnabled === true ) {
					cliBlocker.cliShowBar = true;
				}
			}
			
		}
		if( cliBlocker.blockingStatus === false ) {
			
			if("function" == typeof CookieLawInfo_Accept_Callback){
				CookieLawInfo_Accept_Callback(); 
			}
			jQuery('body').addClass('wt-cli-geoip-on wt-cli-non-eu-country');
			CLI.hidePopupOverlay();
			if( cliBlocker.ccpaApplicable !== true ) {
				cliBlocker.removeAllPreferenceCookies();
				jQuery('.wt-cli-geoip-on.wt-cli-non-eu-country').find('.wt-cli-element').remove();

			}
		}	
		callbackA();
		callbackB();
	},
	cookieBar: function()
	{			
		if( cliBlocker.cliShowBar === false )
		{	
			jQuery('.wt-cli-cookie-bar-container').remove();
			CLI.BannerStatus('hidden');
		}	
		else
		{
			jQuery('.wt-cli-cookie-bar-container').show();
			if(!CLI_Cookie.exists(CLI_ACCEPT_COOKIE_NAME)) 
			{
				CLI.displayHeader();

			}
			else
			{
				CLI.hideHeader();
			}
		}
		// Dispatch event to notify banner visibility
		var bannerVisibilityEvent = new CustomEvent('cliBannerVisibility', {
			detail: {
				visible: cliBlocker.cliShowBar
			}
		});
		document.dispatchEvent(bannerVisibilityEvent);
	},
	removeAllPreferenceCookies : function()
	{	
		cliPreferenceCookies = Cli_Data.cookielist;
		for (var key in cliPreferenceCookies ) {
			CLI_Cookie.erase('cookielawinfo-checkbox-'+key);
		}
	},
	removeCookieByCategory : function() 
	{	

		if(cliBlocker.blockingStatus === true)
		{	
			if(CLI_Cookie.read(CLI_ACCEPT_COOKIE_NAME) !== null)
			{
				var non_necessary_cookies = Cli_Data.non_necessary_cookies;
				for (var key in non_necessary_cookies) {
					currentCategory = key;
					if(CLI.allowedCategories.indexOf(currentCategory) === -1)
					{	
						var nonNecessaryCookies = non_necessary_cookies[currentCategory];
						for(var i=0; i < nonNecessaryCookies.length; i++)
						{	
							if(CLI_Cookie.read(nonNecessaryCookies[i]) !== null)
							{	
								CLI_Cookie.erase(nonNecessaryCookies[i]);
							}

						}
					}
				}
			}
		}
	},
    runScripts:function()
	{	
		srcReplaceableElms = ['iframe','IFRAME','EMBED','embed','OBJECT','object','IMG','img','SOURCE','source'];
		var genericFuncs = 
		{	
			
			renderByElement: function(callback)
			{	
				cliScriptFuncs.renderScripts();
				cliHtmlElmFuncs.renderSrcElement();
				callback();
				cliBlocker.scriptsLoaded = true;
			},
			reviewConsent : function()
			{	
				jQuery(document).on('click','.cli_manage_current_consent,.wt-cli-manage-consent-link',function(){
					CLI.bar_elm.slideDown(CLI.settings.animate_speed_show);
				});
			}

		};
		var cliScriptFuncs = 
		{
			// trigger DOMContentLoaded
			scriptsDone:function() 
			{	
				if( Boolean( Cli_Data.triggerDomRefresh ) === true ) 
				{
					var DOMContentLoadedEvent = document.createEvent('Event')
					DOMContentLoadedEvent.initEvent('DOMContentLoaded', true, true)
					window.document.dispatchEvent(DOMContentLoadedEvent)
				}
			},
			seq :function(arr, callback, index) {
				// first call, without an index
				if (typeof index === 'undefined') {
				  index = 0
				}
			  
				arr[index](function () {
				  index++
				  if (index === arr.length) {
					callback()
				  } else {
					cliScriptFuncs.seq(arr, callback, index)
				  }
				})
			  },
			/* script runner */
			insertScript:function($script,callback) {
				
				var s ='';
				var allowedAttributes = [
					'data-cli-class',
					'data-cli-label',
					'data-cli-placeholder',
					'data-cli-script-type',
					'data-cli-src'
				];
				var scriptType = $script.getAttribute('data-cli-script-type');
				var elementPosition = $script.getAttribute('data-cli-element-position');
				var isBlock = $script.getAttribute('data-cli-block');
				var blockIfCCPA = $script.getAttribute('data-cli-block-if-ccpa-optout');
				var s = document.createElement('script');
				var ccpaOptedOut = cliBlocker.ccpaOptedOut();
				s.type = 'text/plain';
				if($script.async)
				{
					s.async = $script.async;
				}
				if($script.defer)
				{
					s.defer = $script.defer;
				}
				if ($script.src) { 
					s.onload = callback
					s.onerror = callback
					s.src = $script.src
				} else {
					s.textContent = $script.innerText
				}
				if( $script.hasAttribute('data-cli-id') ) {
					s.id = $script.getAttribute('data-cli-id');
				}
				var attrs = jQuery($script).prop("attributes");
				for (var ii = 0; ii < attrs.length; ++ii) {
					if (attrs[ii].nodeName === 'id' && s.id)
						continue;
					s.setAttribute(attrs[ii].nodeName,attrs[ii].value);
				}
				
				if(cliBlocker.blockingStatus === true)
				{	
					
					if(( CLI_Cookie.read(CLI_ACCEPT_COOKIE_NAME) ==='yes' && CLI.allowedCategories.indexOf(scriptType) !== -1 ) || ( CLI_Cookie.read(CLI_ACCEPT_COOKIE_NAME) == null && isBlock==='false') || (Cli_Data.strictlyEnabled.indexOf(scriptType) !== -1 && isBlock==='false') )					{		
						s.setAttribute('data-cli-consent','accepted');
						s.type = 'text/javascript';
						
					}
					if( Cli_Data.ccpaType === 'ccpa' && blockIfCCPA !== 'true') 
					{
						s.type = 'text/javascript';
					}
				}
				else
				{	
					s.type = 'text/javascript';
				}
				if( cliBlocker.ccpaApplicable === true && blockIfCCPA === 'true' ) {
					if( ccpaOptedOut === true || CLI_Cookie.read(CLI_ACCEPT_COOKIE_NAME) == null ) {
						s.type = 'text/plain';
					}
				}
				
				if($script && $script.type != s.type && $script.parentNode)
				{
					$script.parentNode.insertBefore(s,$script);
					if (!$script.src) 
					{
						callback()
					}		
					$script.parentNode.removeChild($script);
				}
				else {
					callback();
				}
			},
			renderScripts:function()
			{	
				var $scripts = document.querySelectorAll('script[data-cli-class="cli-blocker-script"]');
				if($scripts.length > 0)
				{
					var runList = []
					var typeAttr
					Array.prototype.forEach.call($scripts, function ($script) {
						
						// only run script tags without the type attribute
						// or with a javascript mime attribute value
						typeAttr = $script.getAttribute('type')
						var elmType = $script.tagName;
						runList.push(function (callback) {
							cliScriptFuncs.insertScript($script, callback)
						})
					})
					cliScriptFuncs.seq(runList, cliScriptFuncs.scriptsDone);
				}
			}
		};
		var cliHtmlElmFuncs = {
			renderSrcElement: function()
			{	
				var blockingElms = document.querySelectorAll('[data-cli-class="cli-blocker-script"]');
				var ccpaOptedOut = cliBlocker.ccpaOptedOut();
				for (var i = 0; i < blockingElms.length; i++) 
				{	
					var currentElm = blockingElms[i]; 
					var elmType = currentElm.tagName;
					if(srcReplaceableElms.indexOf(elmType) !== -1)
					{	
						var elmCategory = currentElm.getAttribute('data-cli-script-type');
						var isBlock = currentElm.getAttribute('data-cli-block');
						var blockIfCCPA = currentElm.getAttribute('data-cli-block-if-ccpa-optout');
						if( cliBlocker.blockingStatus === true )
						{	
							if(('yes' === CLI_Cookie.read(CLI_ACCEPT_COOKIE_NAME) && CLI.allowedCategories.indexOf(elmCategory) !== -1 ) || ( CLI_Cookie.read(CLI_ACCEPT_COOKIE_NAME) == null  && 'false' === isBlock ) || 'ccpa' === Cli_Data.ccpaType)
								{	
								if( cliBlocker.ccpaApplicable == true && blockIfCCPA === 'true' && ccpaOptedOut === true) {
									this.addPlaceholder(currentElm);
								}
								else {
									this.replaceSrc(currentElm);
								}
							}
							else
							{	
								if( Cli_Data.ccpaType === 'ccpa' && blockIfCCPA !== 'true') 
								{
									this.replaceSrc(currentElm);
								} 
								else {
									this.addPlaceholder(currentElm);
								}	

							}
							
						}
						else
						{	
							if( cliBlocker.ccpaApplicable == true && blockIfCCPA === 'true' ) {
								if( ccpaOptedOut === true || CLI_Cookie.read(CLI_ACCEPT_COOKIE_NAME) == null ) {
									this.addPlaceholder(currentElm);
								} else {
									this.replaceSrc(currentElm);
								}
								
							}
							else {
								this.replaceSrc(currentElm);
							}
						}
						
					}
				}
				
			},
			addPlaceholder:function(htmlElm)
			{	
				if(jQuery(htmlElm).prev('.wt-cli-iframe-placeholder').length === 0)
				{	
					var htmlElemName = htmlElm.getAttribute('data-cli-label');
					var htmlElemType = htmlElm.getAttribute('data-cli-placeholder');
					var htmlElemWidth = htmlElm.getAttribute('width');
					var htmlElemHeight = htmlElm.getAttribute('height');
					if(htmlElemWidth == null)
					{
						htmlElemWidth = htmlElm.offsetWidth;
					}
					if(htmlElemHeight == null)
					{
						htmlElemHeight = htmlElm.offsetHeight;
					}
					pixelPattern = /px/;
					htmlElemWidth = ((pixelPattern.test(htmlElemWidth)) ? htmlElemWidth : htmlElemWidth+'px');
                    htmlElemHeight = ((pixelPattern.test(htmlElemHeight)) ? htmlElemHeight : htmlElemHeight+'px');
                    var addPlaceholder = '<div style="width:'+htmlElemWidth+'; height:'+htmlElemHeight+';" class="wt-cli-iframe-placeholder"><div class="wt-cli-inner-text">'+htmlElemType+'</div></div>';
					addPlaceholder.width = htmlElemWidth;
					addPlaceholder.height = htmlElemHeight;
					if(htmlElm.tagName !== 'IMG')
					{
						jQuery(addPlaceholder).insertBefore(htmlElm);
					}
					htmlElm.removeAttribute('src');
					htmlElm.style.display = 'none';
				}
			},
			replaceSrc: function(htmlElm)
			{	
				if(!htmlElm.hasAttribute('src'))
				{
					var htmlElemSrc = htmlElm.getAttribute('data-cli-src');
					htmlElm.setAttribute('src',htmlElemSrc);
					if(jQuery(htmlElm).prev('.wt-cli-iframe-placeholder').length > 0)
					{
						jQuery(htmlElm).prev('.wt-cli-iframe-placeholder').remove();
					}
					htmlElm.style.display = 'block';
				}
			}
		};
		
		genericFuncs.reviewConsent();
		genericFuncs.renderByElement(cliBlocker.removeCookieByCategory);
	},
	ccpaOptedOut: function () {
		var ccpaOptedOut = false;
		var preferenceCookie = CLI_Cookie.read(CLI_PREFERNCE_COOKIE);
		if( preferenceCookie !== null ) {
			if(CLI.isBase64(preferenceCookie))
			{
				cliConsent = window.atob(preferenceCookie);
			}
			else
			{
				cliConsent = decodeURIComponent(preferenceCookie);
			}
            cliConsent = JSON.parse(cliConsent);
           if( typeof cliConsent.ccpaOptout !== 'undefined') {
			ccpaOptedOut =  cliConsent.ccpaOptout;
		   }
		}
		return ccpaOptedOut;
	}
}
jQuery(document).ready(function() {
    if(typeof cli_cookiebar_settings!='undefined')
    {
	    CLI.set({
	      settings:cli_cookiebar_settings
		});
		cliBlocker.checkPluginStatus(cliBlocker.cookieBar,cliBlocker.runScripts);
	}
	else
	{
		var data = {
        	action: 'cli_get_settings_json',
    	};
		jQuery.ajax({
	        url: Cli_Data.ajax_url,
	        data: data,
	        dataType: 'json',
	        type: 'GET',
	        success: function (response) {
	            CLI.set({
			      settings:response
				});
				cliBlocker.checkPluginStatus(cliBlocker.cookieBar,cliBlocker.runScripts);
	        }
	    });
	}
});