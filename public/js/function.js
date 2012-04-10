// set up the namespace
if(typeof twistles == 'undefined' || !twistles) { var twistles = {};}

// utilities
(function($) {
    $.toLink = function(text) {
    
        // find URL's in tweets
        String.prototype.parseURL = function(){
            return this.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&\?\/.=]+/, function(url) {
                return url.link(url);
            });
        };
        
        // find usernames in tweets (@username)
        String.prototype.parseUsername = function(){
            return this.replace(/[@]+[A-Za-z0-9-_]+/, function(u) {
                var username = u.replace("@","")
                return u.link("http://twitter.com/"+username);
            });
        };

        // find hastags in tweets (#hashtag)
        String.prototype.parseHashtag = function(){
            return this.replace(/[#]+[A-Za-z0-9-_]+/, function(t) {
                var tag = t.replace("#","%23")
                return t.link("http://search.twitter.com/search?q="+tag);
            });
        };
        
        // prase the tweet variable - order is important
        var newText = text.parseURL().parseUsername().parseHashtag();
        return newText;
    };
    
    jQuery.jQueryRandom = 0;
    jQuery.extend(jQuery.expr[":"], {
        random: function(a, i, m, r) {
            if (i == 0) {
                jQuery.jQueryRandom = Math.floor(Math.random() * r.length);
            };
            return i == jQuery.jQueryRandom;
        }
    });
    
})(jQuery);


/* TODO */

// make repeated searches work


// application init
twistles.init = function(){
    
    // check if the visitor has been here before
    listened = $.cookie("twistle_listen");
	debug = true
	
	function msg(text) {
		$('#msg ul').prepend('<li>'+text+'</li>');
	}
	
	msg('Chirp! Hello there. Twistles reporting for duty.');

    // hide the stage
    $('.wrap').hide();
	
	
            
    // return visitors, or just got "listened" go straight to the search form
    runApp = function(){
		
		if(debug == true) {
			$('#msg').fadeIn();
		}
        // set the cookie as having seen the "listen" message
        $.cookie("twistle_listen", "listened");

        // reveal the search from
        showStage = function(){
            $('.wrap').fadeIn('slow', function(){
                searchInit();
            });
        };
        
        // if the "listen" message is visible
        if($('#listen').is(':visible')) {
            $('#listen').fadeOut('slow', function(){
                showStage();
            });
        } else {
            showStage();
        };
    };

    searchInit = function(){
        msg('I\'m ready to fetch some tweets.');
        $('#twistle').focus();


    }
            
    // what to do if visitor is new
    runListen = function() {
        $('.wrap').hide();
        $('#listen').fadeIn('slow');
        document.getElementById('caucauphony').play();
        setTimeout(runApp, 2750);
    };
    
    if(listened == null) {
        runListen();
    } else {
        runApp();
    };
            
    
            
    $('.tweetable').hover(function(){
        targetChirp = $(this).attr('rel');
        document.getElementById('caucauphony').pause();
        document.getElementById('chirp-'+targetChirp).play();
    });
    $('.tweetable').hide();
    $('#twistle-submit').keyup(function(){
        $('.hitenter').fadeIn('slow');
    });
    $('#twistle-submit').submit(function(){
        query = $('#twistle').val();
        msg('Cool! Asking twitter for "'+query+'"');

        $('#tweets li').fadeOut('fast', function(){
            $('#tweets ul').empty();
        });
        $('.hitenter').fadeOut('slow', function(){
            $('.hitenter').remove();
        });
        
        twitterRequest = 'http://search.twitter.com/search.json?q='+encodeURIComponent(query)+'&result_type=mixed&rpp=20&callback=?'; 
        
		$.ajaxSetup({
		  timeout: 1000
		});
		
		var GALLERY = { delay: 1000,
		load: function() { var _gallery = this; $.ajax({
		type:"get",
		url: this.url,
		error: function(xhr, status) {
		      setTimeout(function() {
		        _gallery.load();
		      }, _gallery.delay);
		    }
		} });
		
        $.ajax(twitterRequest, {
			crossDomain: true,
            cache: false,
			dataType: "json",
            success:function(data, text, xhqr) {
                msg('Woah, they responded. '+data.results.length+' tweets too!');
                $.each(data.results, function(i, tweet) {
                    if(tweet.text !== undefined) {
                        msg('building a tweet');

                        // Calculate how many hours ago was the tweet posted
                        var date_tweet 		= new Date(tweet.created_at);
                        var date_now   		= new Date();
                        var date_diff  		= date_now - date_tweet;
                        var hours      		= Math.round(date_diff/(1000*60*60));
                        var authorPicture 	= tweet.profile_image_url;
                        var typeNumber 		= Math.floor(Math.random()*10);
                    
                        if(hours == 0) {
                            hours = 'less than 1';
                            timeIncrement = 'hour';
                        }
                              
                        if(hours == 1) {
                            timeIncrement = 'hour';
                        }
                              
                        if(hours > 1) {
                            timeIncrement = 'hours';
                        }
                              
                        // Build the html string for the current tweet
                        var tweet_html = '<li class="tweet_response"><span class="overlay type'+typeNumber+'"></span>';
                            tweet_html += '<a href="http://www.twitter.com">';
                            tweet_html += '<img rel="'+ tweet.from_user +'" width="20" height="20" src="' + authorPicture + '"\/><\/a>';
                            tweet_html += '<p rel="'+ hours +' '+ timeIncrement + ' ago" class="tweet_text">' + tweet.text + '<\/p><\/div>';
                            tweet_html += '<\/li>';
                     
                        // Append html string to tweet_container div
                        $('#tweets ul').append(tweet_html);
                    };

                    $('#tweets ul li').each(function(){
                        // create a new audio element at random and start playing it
                        chirp = $('.chirper:random');
                        chirpID = chirp.attr('id');
                        chirpPath = chirp.find('source').attr('src');
                        document.getElementById(chirpID).play();
                        //msg('song id = ' + chirpID + ', song path = ' + chirpPath);
                        
                    });
                });
            },
            error:function(xhr, status) {
				msg('woah, bummer dude. error');
			}

        })
        
        
        return false;
    });
            
    $('.brand').live('click', function(){
        $.cookie("twistle_listen", null);
        window.location.reload();
    });
            
    $('#tweets li').live('hover', function(){
        showTweetText = $(this).find('.tweet_text').text();
        showTweetText = $.toLink(showTweetText);
        showTweetTime = $(this).find('.tweet_text').attr('rel');
        showTweetAuthor = $(this).find('img').attr('rel');
        $('#tweet-single .tweet-text').html(showTweetText);
        $('#tweet-single .time').text(showTweetTime);
        $('#tweet-single .author').text('@' + showTweetAuthor).attr('href', 'http://twitter.com/' + showTweetAuthor);
    });
            
    $('#tweet-single a').live('click', function(){
        window.open($(this).attr("href"));
        return false;
    });
};