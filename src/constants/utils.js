var querystring = require('querystring');
var https = require('https');
var React = require('react');

module.exports = {
    formattedCurrentDate: function() {
        var options = {
            year: 'numeric', month: 'numeric', day: 'numeric',
            hour: 'numeric', minute: 'numeric', second: 'numeric',
            hour12: false
        };

        //Convert date into easy to read format
        return new Intl.DateTimeFormat('en-US', options).format(Date.now());

    },

    sendElasticEmail: function(route_trip, username, pickup_date, pickup_loc, drop_loc, to_email, user_action) {

        // Make sure to add your username and api_key below.
        const config = {
            admins: process.env.REACT_APP_ADMINS,
            contact_email: process.env.REACT_APP_CONTACT_EMAIL,
            contact_phone: process.env.REACT_APP_CONTACT_PHONE,
            business_name: process.env.REACT_APP_BUSINESS_NAME,
            email_login: process.env.REACT_APP_ELASTIC_EMAIL_USERNAME,
            email_key: process.env.REACT_APP_ELASTIC_EMAIL_API_KEY
        };

        //Create email text and subject based on user action
        var subject, textEmail;

//        switch (user_action) {
//            case 'CONFIRM_BOOKING':
                subject = "Confirmation --> " + pickup_date + " : " + pickup_loc + " : " + drop_loc + " : " + route_trip;
                textEmail = "Hi " + username + ",  \n\nThanks a lot for booking your seat with " + config.business_name + ". " + subject + ". \n\nIn case you have any questions related to this booking, please email us at " + config.contact_email + " or WhatsApp at " + config.contact_phone + "\n\nIn case you want to cancel this booking, you can do so in the Book My Seat --> Cancel booking page";
//            case 'CANCEL_BOOKING':
//                subject = "Cancellation --> " + pickup_date + " : " + pickup_loc + " : " + drop_loc + " : " + route_trip;
//                textEmail = "Hi " + username + ",  \n\nYour booking" + subject + " with us is cancelled. \n\nIn case you want to rebook, please go the web portal and book a new seat using Book My Seat page \n\n";
//            case 'NEW_USER':
//                subject = config.business_name + "welcomes you " + username + "!";
//                textEmail = "Hi " + username + ",  \n\nThanks a lot for registering with " + config.business_name + ". This booking portal helps you book seats in shuttles on various routes. In case you have any questions related, please email us at " + config.contact_email + " or WhatsApp at " + config.contact_phone;
//        }


        // const subject = "Confirmation --> " + pickup_date + " : " + pickup_loc + " : " + drop_loc + " : " + route_trip;

        // var textEmail = "Hi " + username + ",  \n\nThanks a lot for booking your seat with " + config.business_name + ". " + subject + ". \n\nIn case you have any questions related to this booking or if you want to cancel it, please email us at " + config.contact_email + " or WhatsApp at " + config.contact_phone + "\n\n";

        console.log(config.contact_email + config.business_name + to_email + subject + textEmail);

        // Prepare email to be sent
        var post_data = querystring.stringify({
            'username': config.email_login,
            'apikey': config.email_key,
            'from': config.contact_email,
            'fromName': config.business_name,
            'replyTo': config.contact_email,
            //'to': to_email,
            'msgTo': to_email,
            'msgCC': config.contact_email,
            'subject': subject,
            //'bodyHtml': htmlEmailEncoded
            'bodyText': textEmail
        });

        // Object of options.
        var post_options = {
            host: 'api.elasticemail.com',
            path: '/v2/email/send',
            //port: '443',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': post_data.length
            }
        };

        var result = '';
        // Create the request object.
        var post_req = https.request(post_options, function(res) {
            res.setEncoding('utf8');
            res.on('data', function(chunk) {
                result = chunk;
            });
            res.on('error', function(e) {
                result = 'Error: ' + e.message;
            });
        });

        //Post to Elastic Email
        post_req.write(post_data);
        post_req.end();
        return result;
    },

    encodeEmailIdForFirebaseKey: function(email_id) {
        //Using email id as Firebase key is creating problems due to special characters. Hence encoding it.
        var encodedEmail = email_id.replace(/\W/g, ',');
        
        return encodedEmail;
    },

    //Fetch the preferred pickup and drop location based on route trip used in previous booking by the user
    fetchPreferredLocationsForRoute: function(prefsList, route_trip) {
        var prefLocs = [];

        if (typeof prefsList !== 'undefined') {
            Object.keys(prefsList).forEach(function(key) {
                var prefPickDrop = prefsList[key][route_trip];
                if (typeof prefPickDrop !== 'undefined') {
                    var prefPickDropList = prefPickDrop.split(',');
                    prefLocs.pickup_loc = prefPickDropList[0];
                    prefLocs.drop_loc = prefPickDropList[1];
                } else {
                    console.log("## No pick/drop preferences for this route trip");
                }
            });
        } else {
            console.log("### Preferences list is empty for email id");
        }
    return prefLocs;
    }
}