<?php
/**
 * Configuration centrale du site
 * Fichier à inclure dans tous les autres fichiers pour gérer les URLs
 */

// Configuration de l'environnement
$http_host = $_SERVER['HTTP_HOST'] ?? '';
$request_uri = $_SERVER['REQUEST_URI'] ?? '';
$is_local = (
    strpos($http_host, 'localhost') !== false || 
    strpos($http_host, '127.0.0.1') !== false ||
    empty($http_host) || // Ligne de commande
    strpos($request_uri, '/Bippert/calculateur_dokkan') !== false // Chemin WAMP local
);

// URLs de base
if ($is_local) {
    // Configuration locale
    define('BASE_URL', 'http://localhost/Bippert/calculateur_dokkan%20battle');
    define('SITE_URL', 'http://localhost/Bippert/calculateur_dokkan%20battle');
} else {
    // Configuration production
    define('BASE_URL', 'https://dokkanbattle-calculateurdef.page.gd');
    define('SITE_URL', 'https://dokkanbattle-calculateurdef.page.gd');
}

// URLs spécifiques
define('ASSETS_URL', BASE_URL . '/assets');

// Chemins pour les fichiers
define('ROOT_PATH', __DIR__);
define('ASSETS_PATH', ROOT_PATH . '/assets');

// Configuration de l'environnement
define('IS_LOCAL', $is_local);
define('IS_PRODUCTION', !$is_local);

/**
 * Fonction helper pour générer des URLs
 */
function url($path = '') {
    return BASE_URL . ($path ? '/' . ltrim($path, '/') : '');
}

/**
 * Fonction helper pour les assets
 */
function asset($path) {
    return ASSETS_URL . '/' . ltrim($path, '/');
}

?>
