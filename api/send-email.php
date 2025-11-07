<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");

$data = json_decode(file_get_contents("php://input"), true);

$name = $data['name'];
$email = $data['email'];
$accountType = $data['accountType'];
$businessName = $data['businessName'];
$followers = $data['followers'];
$niche = $data['niche'];

$to = "alextashkov@gmail.com"; // 👈 change this to your email
$subject = "New Waitlist Signup - InfluLink";
$message = "
New signup from the waitlist:

Name: $name
Email: $email
Account Type: $accountType
Business: $businessName
Followers: $followers
Niche: $niche
";

$headers = "From: influlink@yourdomain.com\r\n" .
           "Reply-To: $email\r\n" .
           "Content-Type: text/plain; charset=UTF-8";

if (mail($to, $subject, $message, $headers)) {
  echo json_encode(["success" => true]);
} else {
  http_response_code(500);
  echo json_encode(["error" => "Mail not sent"]);
}
?>