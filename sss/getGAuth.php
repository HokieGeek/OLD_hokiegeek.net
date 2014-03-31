<?php
include "GoogleServiceAuth.php";

// Retrieve the service
if (array_key_exists("s", $_GET)) {
    $s = urldecode($_GET["s"]); // Google service
    echo GetGoogleServiceAuth($s);
} else {
    echo format_error("No service provided");
}

?>
