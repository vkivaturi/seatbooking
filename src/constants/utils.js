var querystring = require('querystring');
var https = require('https');
var React = require('react');

module.exports = {
    sendElasticEmail: function(route_trip, username, pickup_date, pickup_loc, drop_loc, to_email) {

        // Make sure to add your username and api_key below.
        console.log("to_email + " + to_email);
        const config = {
            admins: process.env.REACT_APP_ADMINS,
            contact_email: process.env.REACT_APP_CONTACT_EMAIL,
            contact_phone: process.env.REACT_APP_CONTACT_PHONE,
            business_name: process.env.REACT_APP_BUSINESS_NAME,
            email_login: process.env.REACT_APP_ELASTIC_EMAIL_USERNAME,
            email_key: process.env.REACT_APP_ELASTIC_EMAIL_API_KEY
        };

        //Create subject line
        const subject = "Booking confirmation : " + pickup_date + "-" + pickup_loc + "-" + drop_loc + "-" + route_trip;

        var textEmail = "Hi " + username + ", thanks a lot for booking your seat with " + config.business_name + ". Your booking details are : " + subject + ". In case you have any questions related to this booking or if you want to cancel it, please email us at " + config.contact_email + " or WhatsApp at " + config.contact_phone;

        const htmlEmailEncoded = "&#x3C;html&#x3E;&#x3C;p&#x3E;Hi &#x3C;strong&#x3E;{username}&#x3C;/strong&#x3E;,&#x3C;/p&#x3E; &#x3C;p&#x3E;Thanks a lot for booking your seat with {config.business_name}. Please find below the details of your confirmed booking.&#x3C;/p&#x3E; &#x3C;table style=&#x22;height: 93px; width: 455px;&#x22; border=&#x22;1&#x22;&#x3E; &#x3C;tbody&#x3E; &#x3C;tr&#x3E; &#x3C;td style=&#x22;width: 122px;&#x22;&#x3E;Pickup date&#x3C;/td&#x3E; &#x3C;td style=&#x22;width: 319px;&#x22;&#x3E;{pickup_date}&#x3C;/td&#x3E; &#x3C;/tr&#x3E; &#x3C;tr&#x3E; &#x3C;td style=&#x22;width: 122px;&#x22;&#x3E;Trip details&#x3C;/td&#x3E; &#x3C;td style=&#x22;width: 319px;&#x22;&#x3E;{route_trip}&#x3C;/td&#x3E; &#x3C;/tr&#x3E; &#x3C;tr&#x3E; &#x3C;td style=&#x22;width: 122px;&#x22;&#x3E;Pickup location&#x3C;/td&#x3E; &#x3C;td style=&#x22;width: 319px;&#x22;&#x3E;{pickup_loc}&#x3C;/td&#x3E; &#x3C;/tr&#x3E; &#x3C;tr&#x3E;  &#x3C;td style=&#x22;width: 122px;&#x22;&#x3E;Drop location&#x3C;/td&#x3E; &#x3C;td style=&#x22;width: 319px;&#x22;&#x3E;{drop_loc}&#x3C;/td&#x3E; &#x3C;/tr&#x3E; &#x3C;/tbody&#x3E; &#x3C;/table&#x3E; &#x3C;p&#x3E;In case you have any questions related to this booking or if you want to cancel it, please email us at {config.contact_email} or WhatsApp at {config.contact_phone}.&#x3C;/p&#x3E; &#x3C;p&#x3E;Enjoy your ride!&#x3C;/p&#x3E; &#x3C;p&#x3E;Thank you.&#x3C;/p&#x3E; &#x3C;p&#x3E;Team {config.business_name}&#x3C;/p&#x3E;&#x3C;/html&#x3E";       //Create email body html
        
        const htmlEmail = <html><p>Hi <strong>{username}</strong>,</p>
            <p>Thanks a lot for booking your seat with {config.business_name}. Please find below the details of your confirmed booking.</p>
            <table style="height: 93px; width: 455px;" border="1">
                <tbody>
                    <tr>
                        <td style="width: 122px;">Pickup date</td>
                        <td style="width: 319px;">{pickup_date}</td>
                    </tr>
                    <tr>
                        <td style="width: 122px;">Trip details</td>
                        <td style="width: 319px;">{route_trip}</td>
                    </tr>
                    <tr>
                        <td style="width: 122px;">Pickup location</td>
                        <td style="width: 319px;">{pickup_loc}</td>
                    </tr>
                    <tr>
                        <td style="width: 122px;">Drop location</td>
                        <td style="width: 319px;">{drop_loc}</td>
                    </tr>
                </tbody>
            </table>
            <p>In case you have any questions related to this booking or if you want to cancel it, please email us at {config.contact_email} or WhatsApp at {config.contact_phone}.</p>
            <p>Enjoy your ride!</p>
            <p>Thank you.</p>
            <p>Team {config.business_name}</p></html>;

        console.log(config.email_login + config.email_key + config.contact_email + config.business_name + to_email + subject + textEmail);

        // Prepare email to be sent
        var post_data = querystring.stringify({
            'username': config.email_login,
            'api_key': config.email_key,
            'from': config.contact_email,
            'from_name': config.business_name,
            'to': to_email,
            'subject': subject,
            'body_html': htmlEmailEncoded
            //'body_text': textEmail
        });

        // Object of options.
        var post_options = {
            host: 'api.elasticemail.com',
            path: '/mailer/send',
            port: '443',
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

        // Post to Elastic Email
        post_req.write(post_data);
        post_req.end();
        return result;
    },

}