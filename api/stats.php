<?php
/**
 * stats.php — 记录每次访问，返回 PV/UV
 */
header('Content-Type: application/json; charset=utf-8');
$file  = __DIR__ . '/../data/stats.json';
$data  = json_decode(@file_get_contents($file), true) ?: ['pv'=>0,'uv'=>[],'pages'=>[]];
$page  = $_GET['page'] ?? ($_POST['page'] ?? 'unknown');
$ip    = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$ua    = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';

$data['pv']++;
$data['uv'][$ip] = $ua;          // 去重 UV
$data['pages'][$page] = ($data['pages'][$page] ?? 0) + 1;

@file_put_contents($file . '.tmp', json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
rename($file . '.tmp', $file);

echo json_encode([
  'pv'   => $data['pv'],
  'uv'   => count($data['uv']),
  'page' => $page,
]);
?>
