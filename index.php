<?php
// filepath: c:\wamp64\www\Bippert\calculateur dokkan battle\index.php
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🐉 Calculateur Dokkan Battle - Def            <div class="damage-curve-analysis">
                <h3>📈 COURBE DE DÉGÂTS DÉFENSIFS</h3>
                
                <!-- Section des boss avec images -->
                <div class="boss-indicators" id="bossIndicators">
                    <!-- Les indicateurs de boss seront générés ici -->
                </div>
                
                <div class="chart-container">
                    <div id="damageChart" style="width:100%;height:400px;"></div>
                </div>Calculator</title>
    <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
    <script src="java.js"></script>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🐉 DOKKAN BATTLE</h1>
            <p>🛡️ Calculateur de Défense Ultime 🛡️</p>
        </div>

        <div class="main-grid">
        <div class="main-container">
            <!-- Panel de gauche : Personnage + Défense + Calculateur -->
            <div class="left-panel">
                <!-- Section personnage calculé -->
                <div class="character-display">
                    <h3>🎯 Personnage Calculé</h3>
                    <div class="character-image-container">
                        <img id="characterImage" src="imageBoss/unit.png" alt="Personnage" class="character-image" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSI1MCIgeT0iNTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI0MCIgZmlsbD0iI2ZmZDcwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Pz88L3RleHQ+PC9zdmc+'">
                    </div>
                    <br>
                    <button class="upload-btn" onclick="document.getElementById('imageUpload').click()">📷 CHANGER IMAGE</button>
                    <input type="file" id="imageUpload" class="file-input" accept="image/*" onchange="handleImageUpload(event)">
                    <input type="text" id="characterName" class="character-name" placeholder="Nom du personnage" value="Personnage Mystère">
                </div>

                <!-- Affichage de la défense -->
                <div class="defense-display">
                    <div class="defense-content">
                        <h3>🛡️ DÉFENSE CALCULÉE</h3>
                        <div class="defense-value" id="defenseValue">0</div>
                        <p>Points de défense</p>
                    </div>
                </div>
            </div>

            <!-- Panel de droite : Paramètres -->
            <div class="right-panel">
                <div class="parameters-grid">
                    <!-- Paramètres de base -->
                    <div class="param-group">
                        <h3>📊 Statistiques de Base</h3>
                        <div class="form-row">
                            <label>🛡️ DÉF de base:</label>
                            <input type="number" id="baseDef" value="9338" min="0">
                        </div>
                        <div class="form-row">
                            <label>⚒️ Équipements:</label>
                            <input type="number" id="equips" value="0" min="0">
                        </div>
                        <div class="form-row">
                            <label>🎯 Type:</label>
                            <select id="typeSelection">
                                <option value="TEC">🔥 TEC</option>
                                <option value="AGI">💨 AGI</option>
                                <option value="PUI">💪 PUI</option>
                                <option value="END">🛡️ END</option>
                                <option value="INT">🧠 INT</option>
                            </select>
                        </div>
                        <div class="checkbox-group">
                            <input type="checkbox" id="rankS">
                            <label for="rankS">⭐ Rang S (+40%)</label>
                        </div>
                        <div class="checkbox-group">
                            <input type="checkbox" id="f2p">
                            <label for="f2p">💎 F2P (-40%)</label>
                        </div>
                    </div>

                <!-- Leader et boosts -->
                <div class="param-group">
                    <h3>👑 Leader & Boosts</h3>
                    <div class="form-row">
                        <label>👑 Leader (%):</label>
                        <input type="number" id="leader" value="220" min="0" max="500">
                    </div>
                    <div class="form-row">
                        <label>🌳 Complétion arbre:</label>
                        <select id="treeCompletion">
                            <option value="0">2000</option>
                            <option value="1">3700</option>
                            <option value="2">4000</option>
                            <option value="3">4310</option>
                            <option value="4">5000</option>
                        </select>
                    </div>
                    <div class="form-row">
                        <label>📈 Base (%):</label>
                        <input type="number" id="base" value="0" min="0">
                    </div>
                    <div class="form-row">
                        <label>🤝 Support (%):</label>
                        <input type="number" id="support" value="0" min="0">
                    </div>
                    <div class="form-row">
                        <label>🔗 Liens (%):</label>
                        <input type="number" id="links" value="0" min="0" max="50">
                    </div>
                </div>

                <!-- Boosts multiplicatifs -->
                <div class="param-group">
                    <h3>⚡ Boosts Multiplicatifs</h3>
                    <div class="form-row">
                        <label>⚡ Boost Mult. 1 (%):</label>
                        <input type="number" id="mb1" value="0" min="0">
                        <div class="checkbox-group">
                            <input type="checkbox" id="mb1Active">
                            <label for="mb1Active">Activé</label>
                        </div>
                    </div>
                    <div class="form-row">
                        <label>⚡ Boost Mult. 2 (%):</label>
                        <input type="number" id="mb2" value="0" min="0">
                        <div class="checkbox-group">
                            <input type="checkbox" id="mb2Active">
                            <label for="mb2Active">Activé</label>
                        </div>
                    </div>
                    <div class="form-row">
                        <label>🌟 Active Skill (%):</label>
                        <input type="number" id="activeSkill" value="0" min="0">
                        <div class="checkbox-group">
                            <input type="checkbox" id="asActive">
                            <label for="asActive">Activé</label>
                        </div>
                    </div>
                    <div class="form-row">
                        <label>💊 Item (%):</label>
                        <input type="number" id="item" value="0" min="0">
                        <div class="checkbox-group">
                            <input type="checkbox" id="itemActive">
                            <label for="itemActive">Activé</label>
                        </div>
                    </div>
                </div>

                <!-- Stacks et défense -->
                <div class="param-group">
                    <h3>📈 Stacks & Défense</h3>
                    <div class="form-row">
                        <label>📊 Stack 1 valeur (%):</label>
                        <input type="number" id="stackValue1" value="30" min="0">
                    </div>
                    <div class="form-row">
                        <label>🔢 Stack 1 nombre:</label>
                        <input type="number" id="stack1" value="0" min="0">
                    </div>
                    <div class="form-row">
                        <label>📊 Stack 2 valeur (%):</label>
                        <input type="number" id="stackValue2" value="30" min="0">
                    </div>
                    <div class="form-row">
                        <label>🔢 Stack 2 nombre:</label>
                        <input type="number" id="stack2" value="0" min="0">
                    </div>
                    <div class="form-row">
                        <label>🛡️ Réduction dégâts (%):</label>
                        <input type="number" id="damageReduction" value="0" min="0" max="100">
                    </div>
                    <div class="form-row">
                        <label>🎯 Défense type:</label>
                        <select id="typeDefense">
                            <option value="5">5</option>
                            <option value="6">6</option>
                            <option value="7">7</option>
                            <option value="8">8</option>
                            <option value="10">10</option>
                            <option value="15">15</option>
                        </select>
                    </div>
                </div>

                <!-- Classe & Type -->
                <div class="param-group">
                    <h3>🔢 Classe & Type</h3>
                    <div class="form-row">
                        <label>⚔️ Situation:</label>
                        <select id="guardSelection">
                            <option value="0">Même classe & désavantage type (+25%)</option>
                            <option value="1">Classe opposée & désavantage type (+43.75%)</option>
                            <option value="2" selected>Même classe & neutre en type</option>
                            <option value="3">Classe opposée & neutre en type (+15%)</option>
                            <option value="4">Même classe & avantage type (-25%)</option>
                            <option value="5">Classe opposée & avantage type (-13.75%)</option>
                        </select>
                    </div>
                    <div class="checkbox-group">
                        <input type="checkbox" id="guardActive">
                        <label for="guardActive">🛡️ Garde passive activée</label>
                    </div>
                </div>

                <!-- PV de la team -->
                <div class="param-group">
                    <h3>❤️ PV de la Team</h3>
                    <div class="form-row">
                        <label>💚 Points de vie:</label>
                        <input type="number" id="teamHP" value="850000" min="1" max="2000000" step="1000">
                    </div>
                    <div class="form-description">
                        <small>🎯 Modifie le seuil de mort selon vos PV</small>
                    </div>
                </div>
                </div>
            </div>
        </div>

        <!-- Interface d'analyse de seuils -->
        <div class="threshold-analysis">
            <div class="analysis-header">
                <h2>📊 ANALYSE DE SEUILS DÉFENSIFS</h2>
                <div class="character-summary">
                    <div class="summary-card">
                        <span class="label">🛡️ Défense:</span>
                        <span class="value" id="summaryDefense">0</span>
                    </div>
                    <div class="summary-card">
                        <span class="label">🔰 Réduction:</span>
                        <span class="value" id="summaryReduction">0%</span>
                    </div>
                    <div class="summary-card">
                        <span class="label">⚔️ Situation:</span>
                        <span class="value" id="summarySituation">-</span>
                    </div>
                </div>
            </div>

            <div class="thresholds-container">
                <div class="threshold-card immunity">
                    <div class="threshold-icon">🛡️</div>
                    <div class="threshold-info">
                        <h3>SEUIL D'IMMUNITÉ</h3>
                        <div class="threshold-value" id="immunityThreshold">Calcul en cours...</div>
                        <p>Valeur max où vous prenez 0 dégâts</p>
                    </div>
                </div>

                <div class="threshold-card death">
                    <div class="threshold-icon">💀</div>
                    <div class="threshold-info">
                        <h3>SEUIL DE MORT</h3>
                        <div class="threshold-value" id="deathThreshold">Calcul en cours...</div>
                        <p>Valeur où vous mourrez en 1 coup avec <span id="displayTeamHP">850,000</span> HP</p>
                    </div>
                </div>
            </div>

            <div class="damage-curve-analysis">
                <h3>📉 COURBE DE DÉGÂTS SUBIS</h3>
                
                <!-- Section des boss avec images -->
                <div class="boss-images-section">
                    <h4>🎯 Positionnement des Boss</h4>
                    <div id="bossImagesContainer" class="boss-images-container">
                        <!-- Les images des boss seront ajoutées ici par JavaScript -->
                    </div>
                </div>
                
                <div class="chart-container">
                    <div id="damageChart" style="width:100%;height:400px;"></div>
                </div>
                <div class="chart-legend">
                    <div class="legend-item">
                        <span class="legend-color immunity"></span>
                        <span>Zone d'immunité (0 dégâts)</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color survival"></span>
                        <span>Zone de survie</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color danger"></span>
                        <span>Zone de mort</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="action-buttons">
            <button class="btn" onclick="saveConfiguration()">💾 SAUVEGARDER</button>
            <button class="btn" onclick="loadConfiguration()">📁 CHARGER</button>
            <button class="btn" onclick="exportConfiguration()">📤 EXPORTER FICHE</button>
            <button class="btn" onclick="importConfiguration()">📥 IMPORTER FICHE</button>
            <button class="btn" onclick="shareConfiguration()">🔗 PARTAGER</button>
            <button class="btn" onclick="resetAll()">🔄 RESET</button>
        </div>
    </div>
</body>
</html>