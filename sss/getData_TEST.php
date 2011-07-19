<?php
error_reporting(E_ALL ^ E_NOTICE);

include "XML.php";

$c = "<movies lang='en-us'><movie lang='en-us' rating='R'><title>The Animatrix</title></movie></movies>";
//$c = "<movies lang='en-us'><movie lang='en-us' rating='R'><title>The Animatrix</title></movie><movie rating='PG-13'><title>Fido</title></movie></movies>";
//$c = "<movies lang='en-us'>blah</movies>";
//header('http_code: 404');
$parsedXML = new XML($c);
$c = "[".$parsedXML->toJSON()."]";
header('Content-Type: text/json');
//$c = '[{"in_reply_to_screen_name":null,"created_at":"Mon May 10 14:56:57 +0000 2010","truncated":false,"in_reply_to_status_id":null,"source":"<a href=\"http://ping.fm/\" rel=\"nofollow\">Ping.fm</a>","favorited":false,"place":null,"contributors":null,"geo":null,"user":{"followers_count":160,"description":"Code Monkey","lang":"en","statuses_count":1891,"profile_sidebar_fill_color":"C0DFEC","profile_background_image_url":"http://s.twimg.com/a/1273086425/images/themes/theme15/bg.png","created_at":"Thu Jun 14 17:27:50 +0000 2007","friends_count":168,"profile_image_url":"http://a3.twimg.com/profile_images/52602653/orange_team_twitter_normal.png","contributors_enabled":false,"profile_sidebar_border_color":"a8c7f7","following":false,"profile_background_tile":false,"favourites_count":35,"screen_name":"HokieGeek","url":"http://www.hokiegeek.net","geo_enabled":true,"profile_background_color":"022330","protected":false,"location":"Germantown, MD","verified":false,"profile_text_color":"333333","name":"Andr\u00e9s P\u00e9rez","notifications":false,"id":6816602,"time_zone":"Eastern Time (US & Canada)","utc_offset":-18000,"profile_link_color":"0084B4"},"in_reply_to_user_id":null,"coordinates":null,"id":13730854551,"text":"Good grief! The day is just dragging on!"}]';
//$c = '[{"in_reply_to_screen_name":null,"created_at":"Mon May 10 14:56:57 +0000 2010","truncated":false,"in_reply_to_status_id":null}]';
echo $c; // Return the parsed content
?>
