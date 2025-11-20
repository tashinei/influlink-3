<?php
$DB_HOST = "localhost";
$DB_USER = "your_user";
$DB_PASS = "your_password";
$DB_NAME = "your_database";

$conn = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);

if ($conn->connect_error) {
    die(json_encode([
        "status" => "error",
        "message" => "Database connection failed"
    ]));
}
?>
