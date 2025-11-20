<?php
header("Content-Type: application/json; charset=utf-8");
require_once __DIR__ . "/db_connect.php";

// Read incoming data
$input = json_decode(file_get_contents("php://input"), true);

if (!$input) {
    echo json_encode(["status" => "error", "message" => "Invalid input."]);
    exit;
}

// Extract fields
$full_name     = trim($input["full_name"] ?? "");
$email         = trim($input["email"] ?? "");
$base_country  = trim($input["base_country"] ?? "");
$top_countries = $input["top_countries"] ?? [];
$niches        = $input["niches"] ?? [];
$collab_types  = $input["collab_types"] ?? [];
$primary_platform = trim($input["primary_platform"] ?? "");
$social_tag    = trim($input["social_tag"] ?? "");
$followers     = trim($input["followers"] ?? "");
$audience_description = trim($input["audience_description"] ?? "");

// Basic validation
if (!$full_name || !$email) {
    echo json_encode(["status" => "error", "message" => "Name and email required."]);
    exit;
}

// Convert arrays → JSON for storage
$top_countries_json = json_encode($top_countries, JSON_UNESCAPED_UNICODE);
$niches_json        = json_encode($niches, JSON_UNESCAPED_UNICODE);
$collabs_json       = json_encode($collab_types, JSON_UNESCAPED_UNICODE);

// Prepare SQL (safe)
$stmt = $conn->prepare("
    INSERT INTO creators 
    (full_name, email, base_country, top_countries, niches, collab_types, primary_platform, social_tag, followers, audience_description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
");

$stmt->bind_param(
    "ssssssssss",
    $full_name,
    $email,
    $base_country,
    $top_countries_json,
    $niches_json,
    $collabs_json,
    $primary_platform,
    $social_tag,
    $followers,
    $audience_description
);

if ($stmt->execute()) {
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "error", "message" => "Database error."]);
}

$stmt->close();
$conn->close();
?>
