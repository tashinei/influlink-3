<?php
header("Content-Type: application/json; charset=utf-8");
require_once __DIR__ . "/db_connect.php";

$input = json_decode(file_get_contents("php://input"), true);

if (!$input) {
    echo json_encode(["status" => "error", "message" => "Invalid input."]);
    exit;
}

// Extract fields
$full_name     = trim($input["full_name"] ?? "");
$email         = trim($input["email"] ?? "");
$base_country  = trim($input["base_country"] ?? "");
$target_countries = $input["target_countries"] ?? [];
$categories    = $input["categories"] ?? [];
$collab_types  = $input["collab_types"] ?? [];
$ideal_client_description = trim($input["ideal_client_description"] ?? "");

// Validation
if (!$full_name || !$email) {
    echo json_encode(["status" => "error", "message" => "Name and email required."]);
    exit;
}

// Arrays → JSON
$targets_json  = json_encode($target_countries, JSON_UNESCAPED_UNICODE);
$categories_json = json_encode($categories, JSON_UNESCAPED_UNICODE);
$collabs_json  = json_encode($collab_types, JSON_UNESCAPED_UNICODE);

// SQL (secure)
$stmt = $conn->prepare("
    INSERT INTO brands 
    (full_name, email, base_country, target_countries, categories, collab_types, ideal_client_description)
    VALUES (?, ?, ?, ?, ?, ?, ?)
");

$stmt->bind_param(
    "sssssss",
    $full_name,
    $email,
    $base_country,
    $targets_json,
    $categories_json,
    $collabs_json,
    $ideal_client_description
);

if ($stmt->execute()) {
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" =>]()_
