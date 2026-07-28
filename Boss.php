<?php
require_once 'config.php';
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>👹 Boss Dokkan Battle - Caractéristiques</title>
    
    <meta name="description" content="Caractéristiques détaillées des boss de Dragon Ball Z Dokkan Battle">
    
    <link rel="icon" type="image/x-icon" href="assets/images/favicon.ico">
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet" crossorigin="anonymous" referrerpolicy="no-referrer">
    <link rel="stylesheet" href="assets/css/style.css">
    <!-- Le code de gestion des boss est défini plus bas dans cette page.
         (Les anciennes balises default_bosses.js / boss_manager.js pointaient
         vers des fichiers inexistants et provoquaient deux erreurs 404.) -->
    <style>
        .boss-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }

        .boss-header {
            text-align: center;
            margin-bottom: 40px;
        }

        .boss-header h1 {
            font-family: 'Orbitron', monospace;
            font-size: 3em;
            font-weight: 900;
            background: linear-gradient(135deg, #ffd700, #ff8c00, #ff4500);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
            margin-bottom: 10px;
        }

        .boss-header p {
            font-size: 1.3em;
            color: #ffd700;
            text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
        }

        .boss-card {
            background: linear-gradient(135deg, rgba(26, 26, 46, 0.95), rgba(22, 33, 62, 0.95));
            border: 3px solid rgba(255, 215, 0, 0.5);
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.5);
            position: relative;
            overflow: hidden;
        }

        .boss-card::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%);
            animation: rotate 10s linear infinite;
        }

        @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        .boss-main-content {
            display: grid;
            grid-template-columns: 250px 1fr 1fr;
            gap: 30px;
            position: relative;
            z-index: 1;
        }

        .boss-image-section {
            text-align: center;
        }

        .boss-image-wrapper {
            background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 140, 0, 0.2));
            border: 3px solid #ffd700;
            border-radius: 15px;
            padding: 10px;
            margin-bottom: 15px;
            position: relative;
            overflow: hidden;
        }

        .boss-image-wrapper::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
            animation: shine 3s ease-in-out infinite;
        }

        @keyframes shine {
            0%, 100% { left: -100%; }
            50% { left: 100%; }
        }

        .boss-image {
            width: 100%;
            height: auto;
            border-radius: 10px;
            display: block;
        }

        .boss-title {
            font-family: 'Orbitron', monospace;
            font-size: 1.3em;
            font-weight: 700;
            color: #ffd700;
            text-align: center;
            margin-top: 10px;
            text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
        }

        .boss-stats-section {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }

        .stat-row {
            display: flex;
            align-items: center;
            background: rgba(255, 215, 0, 0.1);
            padding: 12px 20px;
            border-radius: 10px;
            border-left: 4px solid #ffd700;
            transition: all 0.3s ease;
        }

        .stat-row:hover {
            background: rgba(255, 215, 0, 0.2);
            transform: translateX(5px);
            box-shadow: 0 5px 15px rgba(255, 215, 0, 0.3);
        }

        .stat-label {
            font-weight: 700;
            color: #ffd700;
            min-width: 120px;
            font-size: 1.1em;
        }

        .stat-value {
            color: #fff;
            font-size: 1.1em;
            font-weight: 500;
        }

        .boss-abilities-section {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        .ability-card {
            background: linear-gradient(135deg, rgba(255, 70, 0, 0.2), rgba(255, 140, 0, 0.2));
            border: 2px solid rgba(255, 140, 0, 0.5);
            border-radius: 15px;
            padding: 20px;
            transition: all 0.3s ease;
        }

        .ability-card:hover {
            border-color: #ff8c00;
            box-shadow: 0 10px 30px rgba(255, 140, 0, 0.3);
            transform: translateY(-5px);
        }

        .ability-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 15px;
        }

        .ability-name {
            font-family: 'Orbitron', monospace;
            font-size: 1.3em;
            font-weight: 700;
            color: #ff8c00;
        }

        .ability-percentage {
            background: linear-gradient(135deg, #ff8c00, #ff4500);
            color: white;
            padding: 8px 20px;
            border-radius: 20px;
            font-weight: 700;
            font-size: 1.1em;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .ability-percentage img {
            width: 30px;
            height: 30px;
        }

        .ability-description {
            color: #fff;
            line-height: 1.6;
            margin-bottom: 15px;
            font-size: 1.05em;
        }

        .ability-details {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin-top: 15px;
        }

        .ability-detail {
            display: flex;
            align-items: center;
            gap: 10px;
            color: #ffd700;
            font-weight: 600;
        }

        .ability-detail-label {
            color: #fff;
            opacity: 0.8;
        }

        .boss-passive-section {
            grid-column: 2 / 4;
            background: linear-gradient(135deg, rgba(138, 43, 226, 0.15), rgba(75, 0, 130, 0.15));
            border: 2px solid rgba(138, 43, 226, 0.5);
            border-radius: 15px;
            padding: 25px;
            margin-top: 20px;
        }

        .passive-effects-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }

        .passive-effect {
            display: flex;
            align-items: center;
            gap: 15px;
            background: rgba(255, 255, 255, 0.05);
            padding: 15px;
            border-radius: 10px;
            border-left: 4px solid #8b00ff;
            transition: all 0.3s ease;
        }

        .passive-effect:hover {
            background: rgba(255, 255, 255, 0.1);
            transform: translateX(5px);
        }

        .passive-icon {
            width: 50px;
            height: 50px;
            flex-shrink: 0;
        }

        .passive-text {
            color: #fff;
            line-height: 1.5;
            font-size: 1.05em;
        }

        .section-title {
            font-family: 'Orbitron', monospace;
            font-size: 1.5em;
            font-weight: 700;
            color: #8b00ff;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid rgba(138, 43, 226, 0.5);
        }

        .back-button {
            display: inline-block;
            background: linear-gradient(135deg, #2196f3, #42a5f5);
            color: white;
            padding: 15px 30px;
            border-radius: 10px;
            text-decoration: none;
            font-family: 'Orbitron', monospace;
            font-weight: 700;
            font-size: 1.1em;
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
            box-shadow: 0 5px 15px rgba(33, 150, 243, 0.3);
        }

        .back-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 25px rgba(33, 150, 243, 0.5);
            background: linear-gradient(135deg, #1976d2, #2196f3);
        }

        .type-icon-small {
            width: 35px;
            height: 35px;
            vertical-align: middle;
        }

        @media (max-width: 1200px) {
            .boss-main-content {
                grid-template-columns: 1fr;
            }

            .boss-passive-section {
                grid-column: 1;
            }
        }

        @media (max-width: 768px) {
            .ability-details {
                grid-template-columns: 1fr;
            }

            .passive-effects-grid {
                grid-template-columns: 1fr;
            }

            .boss-header h1 {
                font-size: 2em;
            }
        }

        /* Styles pour le modal d'ajout/modification */
        .boss-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            backdrop-filter: blur(10px);
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
            overflow-y: auto;
        }

        .boss-modal-content {
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            border: 3px solid #ffd700;
            border-radius: 20px;
            padding: 40px;
            max-width: 1400px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
            box-shadow: 0 20px 60px rgba(255, 215, 0, 0.4);
        }

        .boss-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid rgba(255, 215, 0, 0.5);
        }

        .boss-modal-header h2 {
            font-family: 'Orbitron', monospace;
            font-size: 2em;
            color: #ffd700;
            margin: 0;
        }

        .close-modal-btn {
            background: linear-gradient(135deg, #ff4500, #ff6347);
            border: none;
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            font-size: 1.5em;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .close-modal-btn:hover {
            transform: rotate(90deg) scale(1.1);
            box-shadow: 0 5px 20px rgba(255, 69, 0, 0.5);
        }

        .boss-form-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 30px;
            margin-bottom: 30px;
        }

        .boss-form-column h3 {
            font-family: 'Orbitron', monospace;
            color: #ffd700;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid rgba(255, 215, 0, 0.3);
        }

        .form-section {
            margin-bottom: 20px;
        }

        .form-section label {
            display: block;
            color: #ffd700;
            font-weight: 600;
            margin-bottom: 8px;
            font-size: 1.1em;
        }

        .boss-input {
            width: 100%;
            padding: 12px 15px;
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(255, 215, 0, 0.3);
            border-radius: 10px;
            color: white;
            font-size: 1em;
            transition: all 0.3s ease;
        }

        .boss-input:focus {
            outline: none;
            border-color: #ffd700;
            box-shadow: 0 0 15px rgba(255, 215, 0, 0.3);
        }

        .boss-input::placeholder {
            color: rgba(255, 255, 255, 0.5);
        }

        textarea.boss-input {
            resize: vertical;
            min-height: 80px;
            font-family: 'Roboto', sans-serif;
        }

        .boss-upload-label {
            cursor: pointer;
        }

        .boss-preview {
            width: 100%;
            height: 300px;
            border: 3px dashed rgba(255, 215, 0, 0.5);
            border-radius: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            transition: all 0.3s ease;
            background: rgba(255, 215, 0, 0.05);
        }

        .boss-preview:hover {
            border-color: #ffd700;
            background: rgba(255, 215, 0, 0.1);
        }

        .boss-preview img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
        }

        .boss-placeholder {
            color: rgba(255, 215, 0, 0.7);
            font-size: 1.1em;
            text-align: center;
        }

        .file-input {
            display: none;
        }

        .passive-form-section {
            background: rgba(138, 43, 226, 0.1);
            border: 2px solid rgba(138, 43, 226, 0.5);
            border-radius: 15px;
            padding: 25px;
            margin-bottom: 30px;
        }

        .passive-form-section h3 {
            font-family: 'Orbitron', monospace;
            color: #8b00ff;
            margin-bottom: 20px;
        }

        #passiveEffectsList {
            display: flex;
            flex-direction: column;
            gap: 15px;
            margin-bottom: 20px;
        }

        .passive-field {
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 15px;
            background: rgba(255, 255, 255, 0.05);
            padding: 15px;
            border-radius: 10px;
            border-left: 4px solid #8b00ff;
        }

        .passive-field input {
            width: 100%;
        }

        .remove-passive-btn {
            background: linear-gradient(135deg, #ff4500, #ff6347);
            border: none;
            color: white;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 700;
            transition: all 0.3s ease;
        }

        .remove-passive-btn:hover {
            transform: scale(1.05);
            box-shadow: 0 5px 15px rgba(255, 69, 0, 0.4);
        }

        .add-passive-btn {
            background: linear-gradient(135deg, #8b00ff, #9d4edd);
            border: none;
            color: white;
            padding: 12px 25px;
            border-radius: 10px;
            cursor: pointer;
            font-weight: 700;
            font-size: 1.1em;
            transition: all 0.3s ease;
            width: 100%;
        }

        .add-passive-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(139, 0, 255, 0.4);
        }

        .boss-form-actions {
            display: flex;
            gap: 20px;
            justify-content: center;
        }

        .save-boss-btn, .cancel-boss-btn {
            padding: 15px 40px;
            border: none;
            border-radius: 10px;
            font-family: 'Orbitron', monospace;
            font-weight: 700;
            font-size: 1.2em;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .save-boss-btn {
            background: linear-gradient(135deg, #00ff00, #00cc00);
            color: #1a1a2e;
        }

        .save-boss-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 25px rgba(0, 255, 0, 0.4);
        }

        .cancel-boss-btn {
            background: linear-gradient(135deg, #666, #888);
            color: white;
        }

        .cancel-boss-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
        }

        .boss-actions-overlay {
            position: absolute;
            top: 20px;
            right: 20px;
            display: flex;
            gap: 10px;
            opacity: 0;
            transition: all 0.3s ease;
            z-index: 10;
        }

        .boss-card:hover .boss-actions-overlay {
            opacity: 1;
        }

        .edit-boss-btn, .delete-boss-btn {
            background: rgba(0, 0, 0, 0.8);
            border: 2px solid;
            color: white;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 700;
            transition: all 0.3s ease;
        }

        .edit-boss-btn {
            border-color: #2196f3;
        }

        .edit-boss-btn:hover {
            background: #2196f3;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(33, 150, 243, 0.5);
        }

        .delete-boss-btn {
            border-color: #ff4500;
        }

        .delete-boss-btn:hover {
            background: #ff4500;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(255, 69, 0, 0.5);
        }

        @media (max-width: 1200px) {
            .boss-form-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="boss-container">
        <div class="boss-header">
            <h1>👹 GESTION DES BOSS</h1>
            <p>Ajoutez des boss personnalisés au graphique</p>
            <div style="margin-top: 15px; padding: 15px 25px; background: rgba(255, 69, 0, 0.2); border: 2px solid rgba(255, 69, 0, 0.5); border-radius: 15px; display: inline-block;">
                <p style="margin: 0; font-size: 1em; color: #ff8c00;">
                    🔒 <strong>Admin uniquement:</strong> Les boss ajoutés ici apparaîtront automatiquement dans le graphique du calculateur
                </p>
            </div>
        </div>

        <div style="margin-bottom: 20px; text-align: center;">
            <a href="index.php" class="back-button">← Retour au calculateur</a>
            <button class="back-button" onclick="showAddBossForm()" style="margin-left: 15px; background: linear-gradient(135deg, #ffd700, #ff8c00);">
                ➕ Ajouter un Boss personnalisé
            </button>
        </div>

        <!-- Boss par défaut du jeu -->
        <div style="margin-bottom: 40px;">
            <h2 style="font-family: 'Orbitron', monospace; font-size: 2em; color: #ffd700; text-align: center; margin-bottom: 25px; text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);">
                🎮 Boss par Défaut (Inclus dans le Graphique)
            </h2>
            <div id="defaultBossListContainer">
                <!-- Les boss par défaut seront chargés ici -->
            </div>
        </div>

        <!-- Boss personnalisés -->
        <div style="margin-bottom: 40px;">
            <h2 style="font-family: 'Orbitron', monospace; font-size: 2em; color: #ff8c00; text-align: center; margin-bottom: 25px; text-shadow: 0 0 20px rgba(255, 140, 0, 0.5);">
                👹 Boss Personnalisés
            </h2>
            <div id="bossListContainer">
                <!-- Les boss personnalisés seront chargés ici -->
            </div>
        </div>

        <!-- Formulaire d'ajout/modification de boss -->
        <div id="bossFormModal" class="boss-modal" style="display: none;">
            <div class="boss-modal-content" style="max-width: 600px;">
                <div class="boss-modal-header">
                    <h2 id="formTitle">➕ Ajouter un Boss Personnalisé</h2>
                    <button class="close-modal-btn" onclick="closeBossForm()">✖</button>
                </div>
                
                <div style="padding: 20px;">
                    <div class="form-section">
                        <label class="boss-upload-label" for="bossImageUpload">
                            📸 <strong>Image du Boss</strong>
                            <div class="boss-preview" id="bossPreview" style="margin-top: 15px;">
                                <img id="bossFormImage" src="" alt="Aperçu" style="display: none;">
                                <span class="boss-placeholder">Cliquez pour ajouter une image</span>
                            </div>
                        </label>
                        <input type="file" id="bossImageUpload" class="file-input" accept="image/*" onchange="handleBossImageUpload(event)">
                    </div>
                    
                    <div class="form-section" style="margin-top: 25px;">
                        <label>👹 Nom du Boss:</label>
                        <input type="text" id="formBossName" class="boss-input" placeholder="Ex: Super Broly">
                    </div>
                    
                    <div class="form-section" style="margin-top: 25px;">
                        <label>⚔️ Attaque du Boss:</label>
                        <input type="number" id="formBossATK" class="boss-input" placeholder="Ex: 12000000" min="0">
                        <p style="color: #aaa; font-size: 0.9em; margin-top: 5px;">💡 C'est cette valeur qui détermine la position du boss sur le graphique</p>
                    </div>
                </div>

                <!-- Boutons d'action -->
                <div class="boss-form-actions">
                    <button class="save-boss-btn" onclick="saveBoss()">💾 Enregistrer</button>
                    <button class="cancel-boss-btn" onclick="closeBossForm()">❌ Annuler</button>
                </div>
                <input type="hidden" id="editBossId" value="">
            </div>
        </div>

        <!-- Liste des boss -->
        <div id="bossListContainer">
            <!-- Les boss seront chargés ici dynamiquement -->
        </div>

        <div style="margin-top: 30px; text-align: center;">
            <a href="index.php" class="back-button">← Retour au calculateur</a>
        </div>
    </div>

    <script>
        // Gestion du localStorage pour les boss
        let passiveCounter = 0;

        // Boss par défaut du jeu
        const defaultBosses = [
            { name: "🔵 Vegeta Blue", attack: 4440000, image: "assets/images/imageBoss/vegeta_blue.png", isDefault: true },
            { name: "🔵 Goku Blue", attack: 4560000, image: "assets/images/imageBoss/goku_blue.png", isDefault: true },
            { name: "👹 Piccolo Daimaô", attack: 4800000, image: "assets/images/imageBoss/daimao.png", isDefault: true },
            { name: "👁️ Jiren", attack: 5740000, image: "assets/images/imageBoss/jiren.png", isDefault: true },
            { name: "🦋 Cell Max", attack: 6562500, image: "assets/images/imageBoss/cell_max.png", isDefault: true },
            { name: "⚔️ Trunks SoH", attack: 7700000, image: "assets/images/imageBoss/trunks.png", isDefault: true },
            { name: "🔥 Gogeta SSJ4", attack: 9360000, image: "assets/images/imageBoss/gogeta_ssj4.png", isDefault: true },
            { name: "👾 Black goku Rosé", attack: 19687500, image: "assets/images/imageBoss/black_goku_rose.png", isDefault: true }
        ];

        // Charger les boss au démarrage
        document.addEventListener('DOMContentLoaded', function() {
            loadDefaultBosses();
            loadBosses();
            animateCards();
        });

        // Animation au chargement
        function animateCards() {
            const cards = document.querySelectorAll('.boss-card');
            cards.forEach((card, index) => {
                setTimeout(() => {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(30px)';
                    card.style.transition = 'all 0.6s ease';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 50);
                }, index * 200);
            });
        }

        // Charger et afficher les boss par défaut
        function loadDefaultBosses() {
            const container = document.getElementById('defaultBossListContainer');
            const hiddenBosses = JSON.parse(localStorage.getItem('hiddenDefaultBosses') || '[]');
            let html = '';
            
            defaultBosses.forEach(boss => {
                // Ne pas afficher les boss masqués
                if (!hiddenBosses.includes(boss.name)) {
                    html += generateDefaultBossCard(boss);
                }
            });
            
            if (html === '') {
                container.innerHTML = `
                    <div style="text-align: center; padding: 40px 20px; background: rgba(33, 150, 243, 0.1); border: 2px dashed rgba(33, 150, 243, 0.5); border-radius: 20px;">
                        <p style="color: #42a5f5; font-size: 1.1em;">Tous les boss par défaut ont été masqués</p>
                    </div>
                `;
            } else {
                container.innerHTML = html;
            }
        }

        /**
         * Échappe le HTML avant insertion via innerHTML.
         * Les boss viennent du localStorage : leur contenu n'est pas fiable.
         */
        function escapeHtml(value) {
            return String(value ?? '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        /** N'autorise qu'un fichier image local du site ou une image base64. */
        function safeImageSrc(value, fallback = 'assets/images/imageBoss/unit.png') {
            const src = String(value ?? '');
            const isLocalFile = /^[\w./-]+\.(png|jpe?g|gif|webp|svg)$/i.test(src);
            const isSafeDataUrl = /^data:image\/(png|jpe?g|gif|webp);base64,[A-Za-z0-9+/=]+$/.test(src);
            return (isLocalFile || isSafeDataUrl) ? src : fallback;
        }

        /** Prépare une valeur pour être passée en argument dans un attribut onclick. */
        function jsArg(value) {
            return escapeHtml(JSON.stringify(String(value ?? '')));
        }

        // Générer le HTML d'une carte de boss par défaut (en lecture seule)
        function generateDefaultBossCard(boss) {
            return `
                <div class="boss-card" style="border-color: rgba(33, 150, 243, 0.5); position: relative;">
                    <div class="boss-actions-overlay">
                        <button class="edit-boss-btn" onclick="editDefaultBoss(${jsArg(boss.name)})">✏️ Modifier</button>
                        <button class="delete-boss-btn" onclick="deleteDefaultBoss(${jsArg(boss.name)})">🗑️ Masquer</button>
                    </div>
                    <div style="position: absolute; top: 15px; right: 15px; background: linear-gradient(135deg, #2196f3, #42a5f5); padding: 8px 20px; border-radius: 20px; font-weight: 700; color: white; z-index: 10;">
                        🎮 Boss du Jeu
                    </div>
                    <div class="boss-main-content" style="grid-template-columns: 300px 1fr; gap: 40px;">
                        <div class="boss-image-section">
                            <div class="boss-image-wrapper" style="border-color: #2196f3;">
                                <img src="${escapeHtml(safeImageSrc(boss.image))}" alt="${escapeHtml(boss.name)}" class="boss-image"
                                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDIwMCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyNTAiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSIxMDAiIHk9IjEzMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjYwIiBmaWxsPSIjZmZkNzAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn5G5PC90ZXh0Pjwvc3ZnPg=='">
                            </div>
                            <div class="boss-title">${escapeHtml(boss.name)}</div>
                        </div>

                        <div class="boss-stats-section" style="align-self: center;">
                            <div class="stat-row" style="border-left-color: #2196f3;">
                                <span class="stat-label">⚔️ ATK (Graphique):</span>
                                <span class="stat-value">${parseInt(boss.attack).toLocaleString()}</span>
                            </div>
                            <div style="margin-top: 20px; padding: 20px; background: rgba(33, 150, 243, 0.2); border: 2px solid rgba(33, 150, 243, 0.5); border-radius: 15px;">
                                <p style="margin: 0; color: #42a5f5; font-size: 1.1em;">
                                    ℹ️ Ce boss fait partie des boss par défaut du calculateur. Il est toujours visible sur le graphique.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        // Charger et afficher les boss
        function loadBosses() {
            const bosses = JSON.parse(localStorage.getItem('customBosses') || '[]');
            const container = document.getElementById('bossListContainer');
            
            if (bosses.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 60px 20px; background: rgba(255, 140, 0, 0.1); border: 2px dashed rgba(255, 140, 0, 0.5); border-radius: 20px;">
                        <div style="font-size: 5em; margin-bottom: 20px;">👹</div>
                        <h2 style="color: #ff8c00; font-family: 'Orbitron', monospace; margin-bottom: 15px;">Aucun boss personnalisé</h2>
                        <p style="color: #fff; font-size: 1.1em; margin-bottom: 25px;">Cliquez sur "Ajouter un Boss personnalisé" pour ajouter vos propres boss au graphique</p>
                        <button class="back-button" onclick="showAddBossForm()" style="background: linear-gradient(135deg, #ffd700, #ff8c00);">
                            ➕ Ajouter votre premier boss personnalisé
                        </button>
                    </div>
                `;
                return;
            }
            
            let html = '';
            bosses.forEach(boss => {
                html += generateBossCard(boss);
            });
            
            container.innerHTML = html;
        }

        // Générer le HTML d'une carte de boss personnalisé
        function generateBossCard(boss) {
            return `
                <div class="boss-card" data-boss-id="${escapeHtml(boss.id)}" style="border-color: rgba(255, 140, 0, 0.5);">
                    <div class="boss-actions-overlay">
                        <button class="edit-boss-btn" onclick="editBoss(${jsArg(boss.id)})">✏️ Modifier</button>
                        <button class="delete-boss-btn" onclick="deleteBoss(${jsArg(boss.id)})">🗑️ Supprimer</button>
                    </div>
                    <div style="position: absolute; top: 15px; right: 15px; background: linear-gradient(135deg, #ff8c00, #ff4500); padding: 8px 20px; border-radius: 20px; font-weight: 700; color: white; z-index: 5;">
                        🎨 Personnalisé
                    </div>
                    <div class="boss-main-content" style="grid-template-columns: 300px 1fr; gap: 40px;">
                        <div class="boss-image-section">
                            <div class="boss-image-wrapper" style="border-color: #ff8c00;">
                                <img src="${escapeHtml(safeImageSrc(boss.image))}" alt="${escapeHtml(boss.name)}" class="boss-image"
                                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDIwMCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyNTAiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSIxMDAiIHk9IjEzMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjYwIiBmaWxsPSIjZmZkNzAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn5G5PC90ZXh0Pjwvc3ZnPg=='">
                            </div>
                            <div class="boss-title">${escapeHtml(boss.name)}</div>
                        </div>

                        <div class="boss-stats-section" style="align-self: center;">
                            <div class="stat-row" style="border-left-color: #ff8c00;">
                                <span class="stat-label">⚔️ ATK (Graphique):</span>
                                <span class="stat-value">${parseInt(boss.attack).toLocaleString()}</span>
                            </div>
                            <div style="margin-top: 20px; padding: 20px; background: rgba(255, 140, 0, 0.2); border: 2px solid rgba(255, 140, 0, 0.5); border-radius: 15px;">
                                <p style="margin: 0; color: #ff8c00; font-size: 1.1em;">
                                    📊 Ce boss apparaît dans le graphique du calculateur à la position <strong>${parseInt(boss.attack).toLocaleString()}</strong> ATK
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        // Afficher le formulaire d'ajout
        function showAddBossForm() {
            document.getElementById('formTitle').textContent = '➕ Ajouter un Boss Personnalisé';
            document.getElementById('editBossId').value = '';
            clearForm();
            document.getElementById('bossFormModal').style.display = 'flex';
        }

        // Fermer le formulaire
        function closeBossForm() {
            document.getElementById('bossFormModal').style.display = 'none';
            clearForm();
        }

        // Gestion de l'upload d'image
        function handleBossImageUpload(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.getElementById('bossFormImage');
                const placeholder = document.querySelector('.boss-placeholder');
                
                img.src = e.target.result;
                img.style.display = 'block';
                if (placeholder) placeholder.style.display = 'none';
            };
            reader.readAsDataURL(file);
        }

        // Ajouter un champ d'effet passif
        function addPassiveField(value = '') {
            passiveCounter++;
            const container = document.getElementById('passiveEffectsList');
            const field = document.createElement('div');
            field.className = 'passive-field';
            field.id = `passive-${passiveCounter}`;
            field.innerHTML = `
                <input type="text" class="boss-input passive-input" placeholder="Ex: Disables ATK & DEF Reduction" value="${escapeHtml(value)}">
                <button class="remove-passive-btn" onclick="removePassiveField(${Number(passiveCounter) || 0})">🗑️</button>
            `;
            container.appendChild(field);
        }

        // Supprimer un champ d'effet passif
        function removePassiveField(id) {
            const field = document.getElementById(`passive-${id}`);
            if (field) field.remove();
        }

        // Enregistrer le boss
        function saveBoss() {
            const id = document.getElementById('editBossId').value || Date.now().toString();
            const name = document.getElementById('formBossName').value.trim();
            const attack = parseInt(document.getElementById('formBossATK').value);
            const image = document.getElementById('bossFormImage').src;

            // Validation
            if (!name) {
                alert('❌ Veuillez entrer un nom pour le boss');
                return;
            }

            if (!attack || attack <= 0) {
                alert('❌ Veuillez entrer une valeur d\'attaque valide');
                return;
            }

            if (!image || document.getElementById('bossFormImage').style.display === 'none') {
                alert('❌ Veuillez ajouter une image pour le boss');
                return;
            }

            // Vérifier si c'est une modification de boss par défaut
            if (id.startsWith('default_')) {
                const originalBossName = id.replace('default_', '');
                const boss = {
                    id: Date.now().toString(),
                    name: name,
                    attack: attack,
                    image: image
                };

                // Masquer le boss par défaut
                let hiddenBosses = JSON.parse(localStorage.getItem('hiddenDefaultBosses') || '[]');
                if (!hiddenBosses.includes(originalBossName)) {
                    hiddenBosses.push(originalBossName);
                    localStorage.setItem('hiddenDefaultBosses', JSON.stringify(hiddenBosses));
                }

                // Ajouter la version modifiée comme boss personnalisé
                let bosses = JSON.parse(localStorage.getItem('customBosses') || '[]');
                bosses.push(boss);
                localStorage.setItem('customBosses', JSON.stringify(bosses));

                alert('✅ Boss modifié avec succès ! L\'ancienne version a été masquée et la nouvelle apparaîtra dans le graphique.');
                closeBossForm();
                location.reload();
                return;
            }

            const boss = {
                id: id,
                name: name,
                attack: attack,
                image: image
            };

            // Sauvegarder dans customBosses (utilisé par le graphique)
            let bosses = JSON.parse(localStorage.getItem('customBosses') || '[]');
            const existingIndex = bosses.findIndex(b => b.id === id);
            
            if (existingIndex >= 0) {
                bosses[existingIndex] = boss;
                alert('✅ Boss modifié avec succès ! Il apparaîtra dans le graphique.');
            } else {
                bosses.push(boss);
                alert('✅ Boss ajouté avec succès ! Il apparaîtra dans le graphique.');
            }

            localStorage.setItem('customBosses', JSON.stringify(bosses));
            
            // Rafraîchir l'affichage
            closeBossForm();
            location.reload();
        }

        // Modifier un boss par défaut
        function editDefaultBoss(bossName) {
            const boss = defaultBosses.find(b => b.name === bossName);
            if (!boss) return;

            document.getElementById('formTitle').textContent = '✏️ Modifier le Boss';
            document.getElementById('editBossId').value = `default_${bossName}`;
            document.getElementById('formBossName').value = boss.name.replace(/^[^\s]+\s/, ''); // Enlever l'emoji
            document.getElementById('formBossATK').value = boss.attack;
            
            // Image
            const img = document.getElementById('bossFormImage');
            const placeholder = document.querySelector('.boss-placeholder');
            img.src = boss.image;
            img.style.display = 'block';
            if (placeholder) placeholder.style.display = 'none';

            document.getElementById('bossFormModal').style.display = 'flex';
        }

        // Masquer un boss par défaut du graphique
        function deleteDefaultBoss(bossName) {
            if (!confirm('⚠️ Voulez-vous masquer ce boss du graphique ?\n\nNote: Vous pourrez le réafficher en modifiant les boss par défaut.')) return;

            let hiddenBosses = JSON.parse(localStorage.getItem('hiddenDefaultBosses') || '[]');
            if (!hiddenBosses.includes(bossName)) {
                hiddenBosses.push(bossName);
                localStorage.setItem('hiddenDefaultBosses', JSON.stringify(hiddenBosses));
            }

            alert('✅ Boss masqué avec succès !');
            location.reload();
        }

        // Modifier un boss
        function editBoss(bossId) {
            const bosses = JSON.parse(localStorage.getItem('customBosses') || '[]');
            const boss = bosses.find(b => b.id === bossId);
            
            if (!boss) return;

            document.getElementById('formTitle').textContent = '✏️ Modifier le Boss';
            document.getElementById('editBossId').value = boss.id;
            document.getElementById('formBossName').value = boss.name;
            document.getElementById('formBossATK').value = boss.attack;
            
            // Image
            const img = document.getElementById('bossFormImage');
            const placeholder = document.querySelector('.boss-placeholder');
            img.src = boss.image;
            img.style.display = 'block';
            if (placeholder) placeholder.style.display = 'none';

            document.getElementById('bossFormModal').style.display = 'flex';
        }

        // Supprimer un boss
        function deleteBoss(bossId) {
            if (!confirm('⚠️ Êtes-vous sûr de vouloir supprimer ce boss ? Il disparaîtra du graphique.')) return;

            let bosses = JSON.parse(localStorage.getItem('customBosses') || '[]');
            bosses = bosses.filter(b => b.id !== bossId);
            localStorage.setItem('customBosses', JSON.stringify(bosses));

            alert('✅ Boss supprimé avec succès !');
            location.reload();
        }

        // Effacer le formulaire
        function clearForm() {
            document.getElementById('formBossName').value = '';
            document.getElementById('formBossATK').value = '';
            document.getElementById('bossImageUpload').value = '';
            
            const img = document.getElementById('bossFormImage');
            const placeholder = document.querySelector('.boss-placeholder');
            img.src = '';
            img.style.display = 'none';
            if (placeholder) placeholder.style.display = 'block';
        }
    </script>
</body>
</html>
