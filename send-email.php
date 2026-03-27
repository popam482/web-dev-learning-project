<?php

if($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Bad Request']);
    exit;
}

$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$message = trim($_POST['message'] ?? '');

if(empty($name) || empty($email) || empty($message)) {
    echo json_encode(['success' => false, 'error' => 'All fields are required.']);
    exit;
}

$to = "popamaria482@gmail.com";
$subject = "New message from $name";
$body = "Name: $name\nEmail: $email\n\nMessage:\n$message";
$headers = "From: " . $email . "\r\nReply-To: " . $email;

$result = mail($to, $subject, $body, $headers);

if($result) {
    echo json_encode(['success' => true, 'message' => 'Email sent successfully!']);
} else {
    echo json_encode(['success' => false, 'error' => 'Failed to send email']);
}

?>