// Dokkan Battle Defense Calculator - JavaScript Functions

/**
 * Journalisation de développement.
 *
 * Les messages de diagnostic sont désactivés par défaut : certaines fonctions
 * (le calcul des dégâts notamment) sont appelées plusieurs milliers de fois
 * pour tracer le graphique, et écrire dans la console à chaque appel coûtait
 * plusieurs secondes à chaque modification d'un paramètre.
 *
 * Pour réafficher les messages pendant un débogage, taper dans la console :
 *     DokkanDebug.activer()
 * puis recharger un calcul. DokkanDebug.desactiver() les coupe à nouveau.
 *
 * Les erreurs (console.error / console.warn) restent toujours visibles.
 */
let DEBUG_LOGS = false;
function log(...args) {
    if (DEBUG_LOGS) console.log(...args);
}
window.DokkanDebug = {
    activer() { DEBUG_LOGS = true; console.log('🔧 Messages de diagnostic activés'); },
    desactiver() { DEBUG_LOGS = false; console.log('🔇 Messages de diagnostic désactivés'); },
    get actif() { return DEBUG_LOGS; }
};

/**
 * Échappe les caractères HTML dangereux avant toute insertion via innerHTML.
 * Indispensable : les noms de personnages/boss viennent du localStorage, des
 * fichiers importés et du paramètre d'URL ?config=, donc d'une source non fiable.
 */
function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * Ne laisse passer que les sources d'images sûres (fichier local du site ou
 * image encodée en base64), afin qu'un lien partagé ne puisse pas injecter
 * une URL distante ou un SVG piégé.
 */
function safeImageSrc(value, fallback = 'assets/images/imageBoss/unit.png') {
    const src = String(value ?? '');
    const isLocalFile = /^[\w./-]+\.(png|jpe?g|gif|webp|svg)$/i.test(src);
    const isSafeDataUrl = /^data:image\/(png|jpe?g|gif|webp);base64,[A-Za-z0-9+/=]+$/.test(src);
    return (isLocalFile || isSafeDataUrl) ? src : fallback;
}

// Fonction pour ouvrir la calculatrice en popup
function openCalculatorPopup() {
    // Calculer les dimensions en fonction de l'écran disponible
    const maxWidth = Math.min(500, screen.width * 0.9);
    const maxHeight = Math.min(800, screen.height * 0.85);
    const left = (screen.width / 2) - (maxWidth / 2);
    const top = (screen.height / 2) - (maxHeight / 2);
    
    const popup = window.open(
        'calculatricePopup.php',
        'CalculatricePopup',
        `width=${maxWidth},height=${maxHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
    
    if (popup) {
        popup.focus();
    } else {
        alert('Veuillez autoriser les popups pour ce site afin d\'ouvrir la calculatrice.');
    }
}

// Données des arbres
const trees = {
    "TEC": [2000, 3700, 4000, 4310, 5000],
    "AGI": [2000, 4100, 4400, 4710, 5400],
    "PUI": [2000, 3300, 3600, 3910, 4600],
    "END": [2000, 3300, 3600, 3910, 4600],
    "INT": [2000, 3700, 4000, 4310, 5000]
};

// Multiplicateurs de classe & type selon le README
const classTypeMultipliers = [
    {"multiplier": 1.25, "description": "Même classe & désavantage type"},      // +25% dégâts
    {"multiplier": 1.4375, "description": "Classe opposée & désavantage type"}, // +15% * +25% = 1.4375
    {"multiplier": 1.0, "description": "Même classe & neutre en type"},         // Neutre
    {"multiplier": 1.15, "description": "Classe opposée & neutre en type"},     // +15% dégâts  
    {"multiplier": 0.75, "description": "Même classe & avantage type"},         // -25% dégâts
    {"multiplier": 0.8625, "description": "Classe opposée & avantage type"}     // +15% * -25% = 0.8625
];

// Bosses pour l'analyse de seuils (classés par ordre croissant d'attaque)
const defaultBosses = [
    { name: "🔵 Vegeta Blue", attack: 4440000, image: "imageBoss/vegeta_blue.png" },
    { name: "🔵 Goku Blue", attack: 4560000, image: "imageBoss/goku_blue.png" },
    { name: "👹 Piccolo Daimaô", attack: 4800000, image: "imageBoss/daimao.png" },
    { name: "👁️ Jiren", attack: 5740000, image: "imageBoss/jiren.png" },
    { name: "🦋 Cell Max", attack: 6562500, image: "imageBoss/cell_max.png" },
    { name: "⚔️ Trunks SoH", attack: 7700000, image: "imageBoss/trunks.png" },
    { name: "🔥 Gogeta SSJ4", attack: 9360000, image: "imageBoss/gogeta_ssj4.png" },
    { name: "👾 Black goku Rosé", attack: 19687500, image: "imageBoss/black_goku_rose.png" }
];

// Fonction pour obtenir tous les boss (par défaut + personnalisés) triés par attaque
function getAllBosses() {
    const customBosses = JSON.parse(localStorage.getItem('customBosses') || '[]');
    
    // Convertir les boss personnalisés au format standard
    const formattedCustomBosses = customBosses.map(boss => ({
        name: `👹 ${boss.name}`,
        attack: boss.attack,
        image: boss.image,
        isCustom: true
    }));
    
    // Combiner et trier par attaque croissante
    const allBosses = [...defaultBosses, ...formattedCustomBosses];
    return allBosses.sort((a, b) => a.attack - b.attack);
}

// Variable dynamique qui sera mise à jour
let bosses = getAllBosses();

// Interface de jeu - Boss data (classés par ordre croissant d'attaque)
const bossData = {
    'Vegeta Blue': { attack: 4440000, image: 'imageBoss/vegeta_blue.png', difficulty: 'FACILE' },
    'Goku Blue': { attack: 4560000, image: 'imageBoss/goku_blue.png', difficulty: 'FACILE' },
    'Piccolo Daimaô': { attack: 4800000, image: 'imageBoss/daimao.png', difficulty: 'FACILE' },
    'Jiren': { attack: 5740000, image: 'imageBoss/jiren.png', difficulty: 'MOYEN' },
    'Cell Max': { attack: 6562500, image: 'imageBoss/cell_max.png', difficulty: 'DIFFICILE' },
    'Trunks SoH': { attack: 7700000, image: 'imageBoss/trunks.png', difficulty: 'EXTRÊME' },
    'Gogeta SSJ4': { attack: 9360000, image: 'imageBoss/gogeta_ssj4.png', difficulty: 'LÉGENDAIRE' },
    'Black goku Rosé': { attack: 19687500, image: 'imageBoss/black_goku_rose.png', difficulty: 'CAUCHEMAR' }
};

// Variables globales
let selectedBoss = null;
let updateTimeout;
let isUpdating = false;

// **FONCTION HELPER : CALCUL DE LA DÉFENSE AVEC UN ARBRE SPÉCIFIQUE**
function calculateDefenseWithTree(treeCompletionValue) {
    const baseDef = parseInt(document.getElementById('baseDef')?.value) || 0;
    const equips = parseInt(document.getElementById('equips')?.value) || 0;
    const leader = parseInt(document.getElementById('leader')?.value) || 0;
    const base = parseInt(document.getElementById('base')?.value) || 0;
    const support = parseInt(document.getElementById('support')?.value) || 0;
    const links = parseInt(document.getElementById('links')?.value) || 0;
    const mb1 = parseInt(document.getElementById('mb1')?.value) || 0;
    const mb1Active = document.getElementById('mb1Active')?.checked || false;
    const mb2 = parseInt(document.getElementById('mb2')?.value) || 0;
    const mb2Active = document.getElementById('mb2Active')?.checked || false;
    const activeSkill = parseInt(document.getElementById('activeSkill')?.value) || 0;
    const asActive = document.getElementById('asActive')?.checked || false;
    const terrain = parseInt(document.getElementById('terrain')?.value) || 0;
    const terrainActive = document.getElementById('terrainActive')?.checked || false;
    const item = parseInt(document.getElementById('item')?.value) || 0;
    const itemActive = document.getElementById('itemActive')?.checked || false;
    const stackValue1 = parseInt(document.getElementById('stackValue1')?.value) || 0;
    const stack1 = parseInt(document.getElementById('stack1')?.value) || 0;
    const stackValue2 = parseInt(document.getElementById('stackValue2')?.value) || 0;
    const stack2 = parseInt(document.getElementById('stack2')?.value) || 0;
    
    // Calcul avec floor à chaque étape (comme Python)
    let defense = baseDef + equips + treeCompletionValue;
    defense = Math.floor(defense * (1 + leader * 2 / 100));
    defense = Math.floor(defense * (1 + base / 100 + support / 100));
    defense = Math.floor(defense * (1 + item / 100 * (itemActive ? 1 : 0)));
    defense = Math.floor(defense * (1 + activeSkill / 100 * (asActive ? 1 : 0)));
    defense = Math.floor(defense * (1 + terrain / 100 * (terrainActive ? 1 : 0)));
    defense = Math.floor(defense * (1 + links / 100));
    defense = Math.floor(defense * (1 + mb1 / 100 * (mb1Active ? 1 : 0) + mb2 / 100 * (mb2Active ? 1 : 0)));
    defense = Math.floor(defense * (1 + stackValue1 / 100 * stack1 + stackValue2 / 100 * stack2));
    
    return defense;
}

// **FONCTION PRINCIPALE : CALCUL DE LA DÉFENSE**
function calculateDefense() {
    try {
        log('🔧 Calcul de la défense en cours...');
        
        // Récupération des valeurs depuis les inputs
        const baseDef = parseInt(document.getElementById('baseDef').value) || 0;
        const equips = parseInt(document.getElementById('equips').value) || 0;
        const typeSelection = document.getElementById('typeSelection').value;
        const treeCompletionIndex = parseInt(document.getElementById('treeCompletion').value);
        const rankS = document.getElementById('rankS').checked;
        const f2p = document.getElementById('f2p').checked;
        const leader = parseInt(document.getElementById('leader').value) || 0;
        const base = parseInt(document.getElementById('base').value) || 0;
        const support = parseInt(document.getElementById('support').value) || 0;
        const links = parseInt(document.getElementById('links').value) || 0;
        const mb1 = parseInt(document.getElementById('mb1').value) || 0;
        const mb1Active = document.getElementById('mb1Active').checked;
        const mb2 = parseInt(document.getElementById('mb2').value) || 0;
        const mb2Active = document.getElementById('mb2Active').checked;
        const activeSkill = parseInt(document.getElementById('activeSkill').value) || 0;
        const asActive = document.getElementById('asActive').checked;
        const terrain = parseInt(document.getElementById('terrain').value) || 0;
        const terrainActive = document.getElementById('terrainActive').checked;
        const item = parseInt(document.getElementById('item').value) || 0;
        const itemActive = document.getElementById('itemActive').checked;
        const stackValue1 = parseInt(document.getElementById('stackValue1').value) || 0;
        const stack1 = parseInt(document.getElementById('stack1').value) || 0;
        const stackValue2 = parseInt(document.getElementById('stackValue2').value) || 0;
        const stack2 = parseInt(document.getElementById('stack2').value) || 0;

        log(`📊 Valeurs de base: DEF=${baseDef}, Équips=${equips}, Type=${typeSelection}`);

        // Calcul de la complétion de l'arbre
        let treeCompletion = trees[typeSelection][treeCompletionIndex];
        if (rankS) treeCompletion = Math.floor(treeCompletion * 1.4);
        if (f2p) treeCompletion = Math.floor(treeCompletion * 0.6);

        log(`🌳 Arbre: ${treeCompletion} (base: ${trees[typeSelection][treeCompletionIndex]}, RankS: ${rankS}, F2P: ${f2p})`);

        // Calcul de la défense selon la formule Python (floor à chaque étape)
        let defense = baseDef + equips + treeCompletion;
        defense = Math.floor(defense * (1 + leader * 2 / 100));
        defense = Math.floor(defense * (1 + base / 100 + support / 100));
        defense = Math.floor(defense * (1 + item / 100 * (itemActive ? 1 : 0)));
        defense = Math.floor(defense * (1 + activeSkill / 100 * (asActive ? 1 : 0)));
        defense = Math.floor(defense * (1 + terrain / 100 * (terrainActive ? 1 : 0)));
        defense = Math.floor(defense * (1 + links / 100));
        defense = Math.floor(defense * (1 + mb1 / 100 * (mb1Active ? 1 : 0) + mb2 / 100 * (mb2Active ? 1 : 0)));
        defense = Math.floor(defense * (1 + stackValue1 / 100 * stack1 + stackValue2 / 100 * stack2));

        log(`🛡️ DÉFENSE CALCULÉE: ${defense.toLocaleString()}`);

        // **MISE À JOUR DE L'AFFICHAGE**
        const defenseElement = document.getElementById('defenseValue');
        if (defenseElement) {
            defenseElement.textContent = defense.toLocaleString();
            log('✅ Affichage de la défense mis à jour');
        } else {
            console.error('❌ Élément defenseValue introuvable');
        }
        
        // **FORCER LA MISE À JOUR IMMÉDIATE DE TOUS LES ÉLÉMENTS**
        // Utiliser requestAnimationFrame pour s'assurer que le DOM est mis à jour
        requestAnimationFrame(() => {
            log('🔄 Mise à jour forcée de tous les éléments...');
            updateThresholdAnalysis(defense); // Passer la valeur calculée directement
            updateCharacterDisplay();
            updateChart();
        });
        
        return defense;
    } catch (error) {
        console.error('❌ Erreur dans calculateDefense:', error);
        return 0;
    }
}

// **FONCTION : MISE À JOUR DE L'ANALYSE DE SEUILS**
function updateThresholdAnalysis(defenseValue = null) {
    try {
        log('📊 Mise à jour de l\'analyse de seuils...');
        updateCharacterSummary(defenseValue);
        calculateThresholds(defenseValue);
        generateRecommendations();
        log('✅ Analyse de seuils mise à jour');
    } catch (error) {
        console.error('❌ Erreur dans updateThresholdAnalysis:', error);
    }
}

function updateCharacterSummary(defenseValue = null) {
    const defense = defenseValue || parseInt(document.getElementById('defenseValue').textContent.replace(/,/g, '')) || 0;
    const damageReduction = parseInt(document.getElementById('damageReduction')?.value) || 0;
    const typeSituation = getTypeSituation();
    
    log(`📊 Mise à jour résumé: DEF=${defense.toLocaleString()}, Réduction=${damageReduction}%`);
    
    const summaryDefenseEl = document.getElementById('summaryDefense');
    const summaryReductionEl = document.getElementById('summaryReduction');
    const summarySituationEl = document.getElementById('summarySituation');
    
    if (summaryDefenseEl) {
        summaryDefenseEl.textContent = defense.toLocaleString();
        log(`✅ Défense mise à jour dans résumé: ${defense.toLocaleString()}`);
    } else {
        console.error('❌ Élément summaryDefense introuvable');
    }
    if (summaryReductionEl) summaryReductionEl.textContent = damageReduction + '%';
    if (summarySituationEl) summarySituationEl.textContent = typeSituation;
}

function getTypeSituation() {
    const guardSelection = parseInt(document.getElementById('guardSelection')?.value) || 2;
    const situations = {
        0: "Même classe & désavantage type (+25%)",
        1: "Classe opposée & désavantage type (+43.75%)", 
        2: "Même classe & neutre en type",
        3: "Classe opposée & neutre en type (+15%)",
        4: "Même classe & avantage type (-25%)",
        5: "Classe opposée & avantage type (-13.75%)"
    };
    return situations[guardSelection] || "Non défini";
}

function calculateThresholds(defenseValue = null) {
    try {
        const defense = defenseValue || parseInt(document.getElementById('defenseValue').textContent.replace(/,/g, '')) || 0;
        const damageReduction = parseInt(document.getElementById('damageReduction')?.value) || 0;
        const guardSelection = parseInt(document.getElementById('guardSelection')?.value) || 2;
        const guardActive = document.getElementById('guardActive')?.checked || false;
        const typeDefense = parseInt(document.getElementById('typeDefense')?.value) || 5;
        
        log(`🔍 Calcul seuils: DEF=${defense.toLocaleString()}, Réduction=${damageReduction}%, Guard Selection=${guardSelection}, Garde Active=${guardActive}`);
        
        // Vérifier que la défense est bien récupérée
        if (defense === 0) {
            console.error('❌ Défense = 0, problème de récupération de la valeur calculée');
            // Si pas de valeur passée en paramètre, essayer de forcer le recalcul
            if (!defenseValue) {
                calculateDefense();
                return;
            }
        }
        
        // **APPLIQUER LES MULTIPLICATEURS CLASSE & TYPE selon le README**
        let classTypeMultiplier = 1.0;
        
        // Déterminer si on a un avantage de type AVANT de modifier pour la garde
        const hasTypeAdvantageBeforeGuard = (guardSelection === 4 || guardSelection === 5);
        
        // Appliquer le multiplicateur selon la situation sélectionnée
        // NOTE: Même si garde active, on garde le multiplicateur normal
        // car le 0.8 de la garde s'applique séparément dans la formule
        if (guardSelection >= 0 && guardSelection < classTypeMultipliers.length) {
            classTypeMultiplier = classTypeMultipliers[guardSelection].multiplier;
            log(`⚔️ Situation "${classTypeMultipliers[guardSelection].description}": multiplicateur ${classTypeMultiplier} pour les seuils`);
        }
        
        if (guardActive) {
            log(`🛡️ Garde passive activée pour seuils: 0.8 sera appliqué dans la formule`);
        }
        
        // **BONUS DE DÉFENSE DE TYPE (comme Python)**
        // S'applique UNIQUEMENT si avantage de type ET si garde NON activée
        const typeDefenseBonus = (hasTypeAdvantageBeforeGuard && !guardActive) ? (typeDefense * 0.01) : 0;
        
        if (hasTypeAdvantageBeforeGuard && !guardActive) {
            log(`🎯 Avantage de type détecté pour seuils: bonus de défense type = ${typeDefense}% (${typeDefenseBonus})`);
        } else if (hasTypeAdvantageBeforeGuard && guardActive) {
            log(`🛡️ Garde active: bonus de défense type ignoré dans les seuils`);
        }
        
        // Appliquer le bonus de défense de type au multiplicateur
        const finalTypeMultiplier = classTypeMultiplier - typeDefenseBonus;
        
        const reductionMultiplier = (1 - damageReduction / 100); // 70% réduction = 0.3
        
        // Variance moyenne (comme Python)
        const variance = 1.015;
        
        // **CALCUL DES SEUILS SELON LA FORMULE CORRECTE avec multiplicateurs classe & type**
        // Récupérer les PV de la team
        const teamHP = parseInt(document.getElementById('teamHP')?.value) || 850000;
        log(`❤️ PV de la team: ${teamHP.toLocaleString()}`);
        
        let immunityThreshold, deathThreshold;
        
        // DEBUG: Afficher toutes les valeurs avant calcul
        log(`🔧 DEBUG CALCUL - Valeurs d'entrée:`);
        log(`   Defense: ${defense} (type: ${typeof defense})`);
        log(`   ClassTypeMultiplier: ${classTypeMultiplier} (type: ${typeof classTypeMultiplier})`);
        log(`   TypeDefenseBonus: ${typeDefenseBonus}`);
        log(`   FinalTypeMultiplier: ${finalTypeMultiplier}`);
        log(`   ReductionMultiplier: ${reductionMultiplier} (type: ${typeof reductionMultiplier})`);
        log(`   Variance: ${variance}`);
        log(`   GuardActive: ${guardActive} (type: ${typeof guardActive})`);
        log(`   TeamHP: ${teamHP} (type: ${typeof teamHP})`);
        
        if (guardActive) {
            // Avec garde activée: ((attaque * variance * type_multi * réduction * 0.8) - défense) / 2 = dégâts
            // Pour seuil immunité : dégâts = 150
            // Résolution: attaque = ((150 * 2) + défense) / (variance * type_multi * réduction * 0.8)
            immunityThreshold = ((150 * 2) + defense) / (variance * finalTypeMultiplier * reductionMultiplier * 0.8);
            
            // Pour seuil de mort : dégâts = teamHP
            // Résolution: attaque = ((teamHP * 2) + défense) / (variance * type_multi * réduction * 0.8)
            deathThreshold = ((teamHP * 2) + defense) / (variance * finalTypeMultiplier * reductionMultiplier * 0.8);
            
            log(`🔧 DEBUG CALCUL AVEC GARDE:`);
            log(`   Formule: ((dégâts * 2) + défense) / (variance * type_multi * réduction * 0.8)`);
            log(`   Immunité: ((150 * 2) + ${defense}) / (${variance} * ${finalTypeMultiplier} * ${reductionMultiplier} * 0.8)`);
            log(`   Immunité: ${(150 * 2) + defense} / ${variance * finalTypeMultiplier * reductionMultiplier * 0.8}`);
            log(`   Immunité: ${immunityThreshold}`);
            log(`   Mort: ((${teamHP} * 2) + ${defense}) / (${variance} * ${finalTypeMultiplier} * ${reductionMultiplier} * 0.8)`);
            log(`   Mort: ${(teamHP * 2) + defense} / ${variance * finalTypeMultiplier * reductionMultiplier * 0.8}`);
            log(`   Mort: ${deathThreshold}`);
        } else {
            // Sans garde: (attaque * variance * type_multi * réduction) - défense = dégâts
            // Pour seuil immunité : dégâts = 150
            // Résolution: attaque = (150 + défense) / (variance * type_multi * réduction)
            immunityThreshold = (150 + defense) / (variance * finalTypeMultiplier * reductionMultiplier);
            
            // Pour seuil de mort : dégâts = teamHP
            // Résolution: attaque = (teamHP + défense) / (variance * type_multi * réduction)
            deathThreshold = (teamHP + defense) / (variance * finalTypeMultiplier * reductionMultiplier);
            
            log(`🔧 DEBUG CALCUL SANS GARDE:`);
            log(`   Formule: (dégâts + défense) / (variance * type_multi * réduction)`);
            log(`   Immunité: (150 + ${defense}) / (${variance} * ${finalTypeMultiplier} * ${reductionMultiplier})`);
            log(`   Immunité: ${150 + defense} / ${variance * finalTypeMultiplier * reductionMultiplier}`);
            log(`   Immunité: ${immunityThreshold}`);
            log(`   Mort: (${teamHP} + ${defense}) / (${variance} * ${finalTypeMultiplier} * ${reductionMultiplier})`);
            log(`   Mort: ${teamHP + defense} / ${variance * finalTypeMultiplier * reductionMultiplier}`);
            log(`   Mort: ${deathThreshold}`);
        }
        
        log(`📊 Calcul seuils détaillé:`);
        log(`   Multiplicateur Classe/Type: ${classTypeMultiplier}`);
        log(`   Bonus Défense Type: ${typeDefenseBonus}`);
        log(`   Multiplicateur Final: ${finalTypeMultiplier}`);
        log(`   Multiplicateur Réduction: ${reductionMultiplier}`);
        log(`   Variance: ${variance} (utilisée dans le calcul des seuils)`);
        log(`   Garde activée: ${guardActive}`);
        log(`   Situation sélectionnée: ${guardSelection} (${classTypeMultipliers[guardSelection]?.description || 'inconnue'})`);
        log(`   Formule immunité: ${guardActive ? '((150 * 2) + défense) / (variance * type_multi * réduction * 0.8)' : '(150 + défense) / (variance * type_multi * réduction)'}`);
        log(`   Formule mort: ${guardActive ? '((teamHP * 2) + défense) / (variance * type_multi * réduction * 0.8)' : '(teamHP + défense) / (variance * type_multi * réduction)'}`);
        log(`   Calcul immunité: ${guardActive ? `((150 * 2) + ${defense}) / (${variance} * ${finalTypeMultiplier} * ${reductionMultiplier} * 0.8) = ${immunityThreshold}` : `(150 + ${defense}) / (${variance} * ${finalTypeMultiplier} * ${reductionMultiplier}) = ${immunityThreshold}`}`);
        log(`   Calcul mort: ${guardActive ? `((${teamHP} * 2) + ${defense}) / (${variance} * ${finalTypeMultiplier} * ${reductionMultiplier} * 0.8) = ${deathThreshold}` : `(${teamHP} + ${defense}) / (${variance} * ${finalTypeMultiplier} * ${reductionMultiplier}) = ${deathThreshold}`}`);
        // Affichage des seuils
        const immunityEl = document.getElementById('immunityThreshold');
        const deathEl = document.getElementById('deathThreshold');
        
        if (immunityEl) {
            immunityEl.textContent = Math.round(immunityThreshold).toLocaleString() + ' ATT';
        }
        if (deathEl) {
            const deathWithVariance = Math.round(deathThreshold * variance);
            deathEl.textContent = Math.round(deathThreshold).toLocaleString() + ' ATT (' + deathWithVariance.toLocaleString() + ')';
        }
        
        log(`📊 Seuils: Immunité=${Math.round(immunityThreshold).toLocaleString()}, Mort=${Math.round(deathThreshold).toLocaleString()}`);
        
        // **VÉRIFICATION DES CALCULS**
        log(`🔍 Vérification immunité à ${Math.round(immunityThreshold).toLocaleString()}:`);
        const verifyImmunity = calculateBattleDamage(immunityThreshold, defense, damageReduction, guardSelection, guardActive, typeDefense);
        log(`   Dégâts calculés: ${verifyImmunity}`);
        
        log(`🔍 Vérification mort à ${Math.round(deathThreshold).toLocaleString()}:`);
        const verifyDeath = calculateBattleDamage(deathThreshold, defense, damageReduction, guardSelection, guardActive, typeDefense);
        log(`   Dégâts calculés: ${verifyDeath}`);
        
        // Mettre à jour l'affichage des PV dans le seuil de mort
        const displayTeamHPEl = document.getElementById('displayTeamHP');
        if (displayTeamHPEl) {
            displayTeamHPEl.textContent = teamHP.toLocaleString();
        }
        
        // Générer le graphique de courbe de dégâts
        generateDamageCurveChart(immunityThreshold, deathThreshold, defense, damageReduction, guardSelection, guardActive, typeDefense, teamHP);
    } catch (error) {
        console.error('❌ Erreur dans calculateThresholds:', error);
    }
}

function generateDamageCurveChart(immunityThreshold, deathThreshold, defense, damageReduction, guardSelection, guardActive, typeDefense, teamHP) {
    try {
        log('📈 Génération du graphique de courbe de dégâts...');
        
        // Configuration adaptative selon la taille d'écran
        const isMobile = window.innerWidth < 768;
        const isSmallMobile = window.innerWidth < 480;
        
        // Calculer la plage de valeurs d'attaque à analyser
        // Inclure tous les boss dans la plage
        const allBossAttacks = bosses.map(boss => boss.attack);
        const minBossAttack = Math.min(...allBossAttacks);
        const maxBossAttack = Math.max(...allBossAttacks);
        
        // Stratégie intelligente pour définir la plage du graphique
        // On veut voir : zone d'immunité, tous les boss, et seuil de mort avec une petite marge
        
        // Début : un peu avant le seuil d'annulation ou le boss le plus faible
        const minAttack = Math.max(0, Math.min(
            immunityThreshold * 0.85,  // 15% avant l'immunité
            minBossAttack - 1000000     // Ou 1M avant le boss le plus faible
        ));
        
        // Fin : légèrement après le seuil de mort OU le boss le plus fort, sans exagérer
        const maxAttack = Math.max(
            deathThreshold * 1.1,       // 10% après le seuil de mort
            maxBossAttack * 1.05        // Ou 5% après le boss le plus fort
        );
        
        const step = (maxAttack - minAttack) / (isMobile ? 300 : 1000); // Beaucoup plus de points pour éviter les points visibles en zoom
        
        // Générer les données de la courbe principale
        const attackValues = [];
        const damageValues = [];
        const colors = [];
        
        for (let attack = minAttack; attack <= maxAttack; attack += step) {
            const damage = calculateBattleDamage(attack, defense, damageReduction, guardSelection, guardActive, typeDefense);
            
            attackValues.push(Math.round(attack));
            damageValues.push(Math.max(0, damage)); // Pas de dégâts négatifs
            
            // Définir la couleur selon la zone
            if (damage <= 150) {
                colors.push('#28a745'); // Vert - Zone d'immunité
            } else if (damage < teamHP) {
                colors.push('#ffc107'); // Jaune - Zone de survie
            } else {
                colors.push('#dc3545'); // Rouge - Zone de mort
            }
        }
        
        // Préparer les traces pour les zones de variation de l'arbre
        const treeTraces = [];
        
        // Récupérer les valeurs de l'arbre actuel
        const typeSelection = document.getElementById('typeSelection')?.value || 'TEC';
        const rankS = document.getElementById('rankS')?.checked || false;
        const f2p = document.getElementById('f2p')?.checked || false;
        
        let treeValues = [...trees[typeSelection]]; // Copie du tableau
        if (rankS) treeValues = treeValues.map(v => Math.floor(v * 1.4));
        if (f2p) treeValues = treeValues.map(v => Math.floor(v * 0.6));
        
        // Couleurs pour les zones (plus visibles avec opacité augmentée)
        const fillColors = [
            'rgba(255, 152, 0, 0.5)',    // Orange vif
            'rgba(33, 150, 243, 0.5)',   // Bleu vif
            'rgba(76, 175, 80, 0.5)',    // Vert vif
            'rgba(233, 30, 99, 0.5)'     // Rose vif
        ];
        
        // Créer les zones remplies entre chaque niveau d'arbre
        for (let i = 0; i < treeValues.length - 1; i++) {
            const tree1 = treeValues[i];
            const tree2 = treeValues[i + 1];
            
            // Calculer les dégâts pour chaque niveau d'arbre
            const damages1 = [];
            const damages2 = [];
            
            for (let attack = minAttack; attack <= maxAttack; attack += step) {
                // Recalculer la défense avec tree1
                const def1 = calculateDefenseWithTree(tree1);
                const dmg1 = Math.max(0, calculateBattleDamage(attack, def1, damageReduction, guardSelection, guardActive, typeDefense));
                damages1.push(dmg1);
                
                // Recalculer la défense avec tree2
                const def2 = calculateDefenseWithTree(tree2);
                const dmg2 = Math.max(0, calculateBattleDamage(attack, def2, damageReduction, guardSelection, guardActive, typeDefense));
                damages2.push(dmg2);
            }
            
            // Créer la zone remplie
            const xFill = [...attackValues, ...attackValues.slice().reverse()];
            const yFill = [...damages1, ...damages2.slice().reverse()];
            
            treeTraces.push({
                x: xFill,
                y: yFill,
                type: 'scatter',
                mode: 'lines',
                fill: 'toself',
                fillcolor: fillColors[i % fillColors.length],
                line: { color: 'rgba(255,255,255,0)' },
                showlegend: false,
                hoverinfo: 'skip'
            });
        }
        
        // Créer le graphique avec Plotly - Configuration mobile adaptée
        const trace = {
            x: attackValues,
            y: damageValues,
            type: 'scatter',
            mode: 'lines', // Seulement la ligne, pas de marqueurs
            name: 'Dégâts encaissés',
            line: {
                color: '#007bff',
                width: isMobile ? 2 : 3 // Ligne plus fine sur mobile
            },
            fill: 'none',
            hoveron: 'points+fills', // Active le hover sur toute la courbe
            hovertemplate: 
                '<b>🎯 Attaque Adverse:</b> %{x:,.0f}<br>' +
                '<b>💥 Dégâts Subis:</b> %{y:,.0f}<br>' +
                '<extra></extra>'
        };
        
        // Ajouter les lignes de seuils - Adaptées mobile
        const immunityLine = {
            x: [minAttack, maxAttack],
            y: [150, 150],
            type: 'scatter',
            mode: 'lines',
            name: isMobile ? 'Annulation' : 'Seuil d\'annulation',
            line: {
                color: '#28a745',
                width: isMobile ? 1.5 : 2,
                dash: 'dash'
            },
            hovertemplate: 
                '<b>🛡️ Seuil Annulation:</b> 150 dégâts max<br>' +
                '<extra></extra>'
        };
        
        const deathLine = {
            x: [minAttack, maxAttack],
            y: [teamHP, teamHP],
            type: 'scatter',
            mode: 'lines',
            name: isMobile ? `Mort (${(teamHP/1000).toFixed(0)}k HP)` : `Seuil de mort (${teamHP.toLocaleString()} HP)`,
            line: {
                color: '#dc3545',
                width: isMobile ? 1.5 : 2,
                dash: 'dash'
            },
            hovertemplate: 
                `<b>💀 Seuil de Mort:</b> ${teamHP.toLocaleString()} dégâts<br>` +
                '<extra></extra>'
        };
        
        // Calculer la hauteur maximale pour les marqueurs verticaux
        const maxDamageForMarkers = Math.max(...damageValues, teamHP * 1.1);
        
        // Ajouter des marqueurs verticaux pour les seuils - Simplifiés mobile
        const immunityMarker = {
            x: [immunityThreshold, immunityThreshold],
            y: [0, maxDamageForMarkers],
            type: 'scatter',
            mode: 'lines',
            name: isMobile ? `Ann. (${(immunityThreshold/1000000).toFixed(1)}M)` : `Annulation (${Math.round(immunityThreshold).toLocaleString()} ATT)`,
            line: {
                color: '#28a745',
                width: isMobile ? 2 : 3,
                dash: 'dot'
            },
            hovertemplate: 
                `<b>🛡️ Limite Annulation:</b> ${Math.round(immunityThreshold).toLocaleString()} ATT<br>` +
                '<extra></extra>'
        };
        
        const deathMarker = {
            x: [deathThreshold, deathThreshold],
            y: [0, maxDamageForMarkers],
            type: 'scatter',
            mode: 'lines',
            name: isMobile ? `Mort (${(deathThreshold/1000000).toFixed(1)}M)` : `Mort (${Math.round(deathThreshold).toLocaleString()} ATT)`,
            line: {
                color: '#dc3545',
                width: isMobile ? 2 : 3,
                dash: 'dot'
            },
            hovertemplate: 
                `<b>💀 Limite Mort:</b> ${Math.round(deathThreshold).toLocaleString()} ATT<br>` +
                '<extra></extra>'
        };
        
        // Créer les traces pour les boss avec des marqueurs spéciaux
        const bossAttacks = [];
        const bossDamages = [];
        const bossNames = [];
        const bossColors = [];
        
        // Générer la section des images de boss
        const bossImagesContainer = document.getElementById('bossImagesContainer');
        if (bossImagesContainer) {
            bossImagesContainer.innerHTML = '';
            
            bosses.forEach((boss, index) => {
                const damage = calculateBattleDamage(boss.attack, defense, damageReduction, guardSelection, guardActive, typeDefense);
                const cleanName = boss.name.replace(/[🎯👹💪🦋💙⚔️🔥]/g, '').trim();
                
                // Couleur selon la zone de danger
                let color = '#28a745'; // Vert par défaut (immunité)
                let statusClass = 'immunity';
                let statusText = 'Annulation';
                
                if (damage > 150 && damage < teamHP) {
                    color = '#ffc107'; // Jaune (survie)
                    statusClass = 'survival';
                    statusText = 'Survie';
                } else if (damage >= teamHP) {
                    color = '#dc3545'; // Rouge (danger)
                    statusClass = 'danger';
                    statusText = 'Danger';
                }
                
                bossAttacks.push(boss.attack);
                bossDamages.push(Math.max(0, damage));
                bossNames.push(cleanName);
                bossColors.push(color);
                
                // Afficher la situation classe & type dans les stats du boss
                const situationText = getTypeSituation();
                const guardText = guardActive ? " (Garde)" : "";
                
                // Créer l'élément image pour le boss
                const bossImageItem = document.createElement('div');
                bossImageItem.className = `boss-image-item ${statusClass}`;
                
                bossImageItem.innerHTML = `
                    <img src="assets/images/${escapeHtml(safeImageSrc(boss.image, 'imageBoss/unit.png'))}" alt="${escapeHtml(cleanName)}" onerror="this.src='assets/images/imageBoss/unit.png'">
                    <div class="boss-name">${escapeHtml(cleanName)}</div>
                    <div class="boss-stats">
                        ${(boss.attack / 1000000).toFixed(1)}M ATT<br>
                        ${Math.round(damage).toLocaleString()} DMG<br>
                        <small style="color: #666;">${situationText}${guardText}</small><br>
                        <strong style="color: ${color};">${statusText}</strong>
                    </div>
                    <div class="boss-arrow ${statusClass}"></div>
                `;
                
                bossImagesContainer.appendChild(bossImageItem);
            });
        }
        
        // Créer une trace séparée pour les boss sur le graphique - Adaptée mobile
        const bossTrace = {
            x: bossAttacks,
            y: bossDamages,
            type: 'scatter',
            mode: 'markers',
            name: 'Boss',
            marker: {
                color: bossColors,
                size: isMobile ? 10 : 15, // Plus petits sur mobile
                line: {
                    color: '#ffffff',
                    width: isMobile ? 2 : 3
                },
                symbol: isMobile ? 'circle' : 'diamond' // Cercles plus simples sur mobile
            },
            hovertemplate: 
                '<b>👹 Boss:</b> %{text}<br>' +
                '<b>⚔️ Attaque:</b> %{x:,.0f}<br>' +
                '<b>💥 Dégâts Reçus:</b> %{y:,.0f}<br>' +
                '<extra></extra>',
            text: bossNames
        };
        
        const layout = {
            title: {
                text: isMobile ? 'Dégâts Subis' : 'Courbe de Progression des Dégâts Subis',
                font: { 
                    size: isSmallMobile ? 12 : (isMobile ? 14 : 20), 
                    color: '#ffd700',
                    family: 'Orbitron, sans-serif',
                    weight: 700
                },
                x: 0.5,
                xanchor: 'center'
            },
            xaxis: {
                title: {
                    text: isMobile ? 'ATT Adverse' : 'Valeur d\'Attaque Adverse',
                    font: { 
                        size: isSmallMobile ? 9 : (isMobile ? 10 : 14),
                        color: '#ffd700',
                        family: 'Orbitron, sans-serif'
                    }
                },
                tickformat: isMobile ? ',.1s' : ',.0f',
                gridcolor: 'rgba(255, 215, 0, 0.15)',
                tickfont: { 
                    size: isSmallMobile ? 7 : (isMobile ? 8 : 11),
                    color: '#ffffff'
                },
                tickangle: isMobile ? -45 : 0,
                nticks: isMobile ? 5 : 10,
                range: [minAttack, maxAttack],
                fixedrange: false,
                autorange: false,
                zerolinecolor: 'rgba(255, 215, 0, 0.3)',
                zerolinewidth: 2
            },
            yaxis: {
                title: {
                    text: isMobile ? 'Dégâts' : 'Dégâts Encaissés',
                    font: { 
                        size: isSmallMobile ? 9 : (isMobile ? 10 : 14),
                        color: '#ffd700',
                        family: 'Orbitron, sans-serif'
                    }
                },
                tickformat: isMobile ? ',.1s' : ',.0f',
                gridcolor: 'rgba(255, 215, 0, 0.15)',
                tickfont: { 
                    size: isSmallMobile ? 7 : (isMobile ? 8 : 11),
                    color: '#ffffff'
                },
                nticks: isMobile ? 6 : 10,
                zerolinecolor: 'rgba(255, 215, 0, 0.3)',
                zerolinewidth: 2
            },
            plot_bgcolor: 'rgba(26, 26, 46, 0.95)',
            paper_bgcolor: 'rgba(22, 33, 62, 0.98)',
            hovermode: 'x unified',
            showlegend: !isMobile,
            legend: {
                x: 0.02,
                y: 0.98,
                bgcolor: 'rgba(26, 26, 46, 0.9)',
                bordercolor: '#ffd700',
                borderwidth: 2,
                font: { 
                    size: 11,
                    color: '#ffffff',
                    family: 'Roboto, sans-serif'
                },
                orientation: isMobile ? 'h' : 'v'
            },
            annotations: [],
            hoverlabel: {
                bgcolor: 'rgba(26, 26, 46, 0.95)',
                bordercolor: '#ffd700',
                borderwidth: 3,
                font: {
                    color: '#ffd700',
                    size: 13,
                    family: 'Roboto, sans-serif',
                    weight: 'bold'
                }
            },
            margin: {
                l: isSmallMobile ? 40 : (isMobile ? 50 : 80),
                r: isSmallMobile ? 20 : (isMobile ? 25 : 50),
                t: isSmallMobile ? 40 : (isMobile ? 50 : 80),
                b: isSmallMobile ? 45 : (isMobile ? 55 : 80)
            },
            height: isMobile ? (isSmallMobile ? 320 : 350) : 500,
            autosize: true,
            width: null
        };
        
        // Ajouter les annotations de texte
        const annotations = [];
        
        // Annotation : Valeur de DEF
        annotations.push({
            xref: 'paper',
            yref: 'paper',
            x: 0.01,
            y: 1.18,
            xanchor: 'left',
            yanchor: 'top',
            text: `🛡️ Valeur de DEF: ${defense.toLocaleString()}`,
            showarrow: false,
            font: { 
                size: 14, 
                color: '#ffd700', 
                family: 'Orbitron, sans-serif',
                weight: 'bold'
            },
            bgcolor: 'rgba(26, 26, 46, 0.9)',
            bordercolor: '#ffd700',
            borderwidth: 2,
            borderpad: 6
        });
        
        // Annotation : Pente de la courbe
        const x1 = 100000000;
        const p1 = calculateBattleDamage(x1, defense, damageReduction, guardSelection, guardActive, typeDefense);
        const x2 = 101000000;
        const p2 = calculateBattleDamage(x2, defense, damageReduction, guardSelection, guardActive, typeDefense);
        const slope = Math.round(p2 - p1);
        
        annotations.push({
            xref: 'paper',
            yref: 'paper',
            x: 0.01,
            y: 1.10,
            xanchor: 'left',
            yanchor: 'top',
            text: `📈 Pente : +${slope.toLocaleString()} dégâts / +${(x2-x1).toLocaleString()} ATT`,
            showarrow: false,
            font: { 
                size: 14, 
                color: '#ff8c00', 
                family: 'Orbitron, sans-serif',
                weight: 'bold'
            },
            bgcolor: 'rgba(26, 26, 46, 0.9)',
            bordercolor: '#ff8c00',
            borderwidth: 2,
            borderpad: 6
        });
        
        // Annotation : Impact maximal de l'arbre (si zones d'arbre présentes)
        if (treeTraces.length > 0) {
            // Calculer l'impact de l'arbre
            const minTreeValue = treeValues[0];
            const maxTreeValue = treeValues[treeValues.length - 1];
            
            // Trouver l'impact maximal (différence entre défense min et max de l'arbre)
            let maxTreeImpact = 0;
            for (let attack = minAttack; attack <= maxAttack; attack += step) {
                const defMin = calculateDefenseWithTree(minTreeValue);
                const defMax = calculateDefenseWithTree(maxTreeValue);
                const dmgMin = Math.max(0, calculateBattleDamage(attack, defMin, damageReduction, guardSelection, guardActive, typeDefense));
                const dmgMax = Math.max(0, calculateBattleDamage(attack, defMax, damageReduction, guardSelection, guardActive, typeDefense));
                
                // L'impact est la différence de dégâts (on prend la première valeur où les deux sont > 0)
                if (dmgMin > 0 && dmgMax > 0) {
                    maxTreeImpact = Math.round(dmgMin - dmgMax);
                    break;
                }
            }
            
            annotations.push({
                xref: 'paper',
                yref: 'paper',
                x: 0.01,
                y: 1.02,
                xanchor: 'left',
                yanchor: 'top',
                text: `🌳 Impact maximal de l'arbre : ${maxTreeImpact.toLocaleString()}`,
                showarrow: false,
                font: { 
                    size: 14, 
                    color: '#00ff88', 
                    family: 'Orbitron, sans-serif',
                    weight: 'bold'
                },
                bgcolor: 'rgba(26, 26, 46, 0.9)',
                bordercolor: '#00ff88',
                borderwidth: 2,
                borderpad: 6
            });
        }
        
        layout.annotations = annotations;
        
        const config = {
            responsive: true,
            displayModeBar: true, // Toujours afficher la barre d'outils
            modeBarButtonsToRemove: isMobile ? 
                ['lasso2d', 'select2d', 'autoScale2d'] : // Moins de boutons sur mobile
                ['lasso2d', 'select2d'], // Garder plus de fonctions sur desktop
            displaylogo: false,
            scrollZoom: true, // Zoom disponible partout
            doubleClick: 'reset+autosize', // Double-click/tap pour reset
            staticPlot: false, // Interactions disponibles partout
            showTips: false,
            locale: 'fr', // Interface française
            // Configuration spéciale pour mobile
            ...(isMobile && {
                modeBarStyle: {
                    height: '30px', // Barre plus compacte sur mobile
                    fontSize: '12px'
                }
            })
        };
        
        // Afficher le graphique avec configuration optimisée mobile - Inclure les zones d'arbre
        const allTraces = [...treeTraces, trace, immunityLine, deathLine, immunityMarker, deathMarker, bossTrace];

        // Plotly.react met à jour un graphique déjà tracé en ne redessinant que
        // ce qui a changé, là où newPlot le reconstruit intégralement. Au premier
        // affichage seulement, on passe par newPlot.
        const chartDiv = document.getElementById('damageChart');
        const dejaTrace = chartDiv && chartDiv.data;
        if (dejaTrace && typeof Plotly.react === 'function') {
            Plotly.react('damageChart', allTraces, layout, config);
        } else {
            Plotly.newPlot('damageChart', allTraces, layout, config);
        }
        
        // Forcer le graphique à rester dans son conteneur (pas de scroll)
        const chartElement = document.getElementById('damageChart');
        if (chartElement) {
            chartElement.style.width = '100%';
            chartElement.style.maxWidth = '100%';
            chartElement.style.overflowX = 'hidden';
        }
        
        // Optimisations spécifiques mobiles post-rendu
        if (isMobile) {
            if (chartElement) {
                // Forcer la taille du graphique
                chartElement.style.height = isSmallMobile ? '320px' : '350px';
                chartElement.style.width = '100%';
                chartElement.style.maxWidth = '100%';
                
                // Ajouter une classe CSS pour le style mobile
                chartElement.classList.add('mobile-chart');
                
                // Permettre les interactions tactiles sur mobile
                chartElement.style.touchAction = 'pan-x pan-y';
                chartElement.style.userSelect = 'none';
            }
        }
        
        // Ajouter un gestionnaire de redimensionnement amélioré
        let resizeTimeout;
        const resizeHandler = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const currentIsMobile = window.innerWidth < 768;
                const currentIsSmallMobile = window.innerWidth < 480;
                
                // Si le type d'appareil a changé, régénérer complètement le graphique
                if (currentIsMobile !== isMobile) {
                    generateDamageCurveChart(immunityThreshold, deathThreshold, defense, damageReduction, guardSelection, guardActive, typeDefense, teamHP);
                } else {
                    // Sinon juste redimensionner
                    Plotly.Plots.resize('damageChart');
                }
            }, 250);
        };
        
        window.addEventListener('resize', resizeHandler);
        
        // Gestionnaire pour l'orientation mobile amélioré
        if (window.screen && window.screen.orientation) {
            window.screen.orientation.addEventListener('change', () => {
                setTimeout(() => {
                    const chartElement = document.getElementById('damageChart');
                    if (chartElement && window.innerWidth < 768) {
                        chartElement.style.height = window.innerWidth < 480 ? '320px' : '350px';
                    }
                    Plotly.Plots.resize('damageChart');
                }, 300);
            });
        }
        
        // Fallback pour les navigateurs qui ne supportent pas screen.orientation
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                if (document.getElementById('damageChart')) {
                    Plotly.Plots.resize('damageChart');
                }
            }, 300);
        });
        
        log('✅ Graphique de courbe de dégâts généré avec succès');
    } catch (error) {
        console.error('❌ Erreur dans generateDamageCurveChart:', error);
    }
}

function calculateBattleDamage(attack, defense, damageReduction, guardSelection, guardActive, typeDefense) {
    try {
        if (DEBUG_LOGS) log(`🔍 Calcul dégâts: ATT=${attack.toLocaleString()}, DEF=${defense.toLocaleString()}, Réduction=${damageReduction}%, Garde=${guardActive}, Situation=${guardSelection}, TypeDef=${typeDefense}`);
        
        // **APPLIQUER LES MULTIPLICATEURS CLASSE & TYPE selon le README**
        // Récupérer le multiplicateur selon la situation
        let classTypeMultiplier = 1.0;
        
        // Déterminer si on a un avantage de type AVANT de modifier pour la garde
        const hasTypeAdvantageBeforeGuard = (guardSelection === 4 || guardSelection === 5);
        
        // Appliquer le multiplicateur selon la situation sélectionnée
        // NOTE: Quand garde active, on garde le multiplicateur normal (pas de remplacement par 0.8)
        // car le 0.8 de la garde s'applique dans la formule elle-même
        if (guardSelection >= 0 && guardSelection < classTypeMultipliers.length) {
            classTypeMultiplier = classTypeMultipliers[guardSelection].multiplier;
            if (DEBUG_LOGS) log(`⚔️ Situation "${classTypeMultipliers[guardSelection].description}": multiplicateur ${classTypeMultiplier}`);
        }
        
        if (guardActive) {
            if (DEBUG_LOGS) log(`🛡️ Garde passive activée: 0.8 sera appliqué dans la formule (pas dans le multiplicateur)`);
        }
        
        // **BONUS DE DÉFENSE DE TYPE (comme Python)**
        // S'applique UNIQUEMENT si avantage de type ET si garde NON activée
        // Quand garde active, on ignore complètement les effets de type/classe
        const typeDefenseBonus = (hasTypeAdvantageBeforeGuard && !guardActive) ? (typeDefense * 0.01) : 0;
        
        if (hasTypeAdvantageBeforeGuard && !guardActive) {
            if (DEBUG_LOGS) log(`🎯 Avantage de type détecté: bonus de défense type = ${typeDefense}% (${typeDefenseBonus})`);
        } else if (hasTypeAdvantageBeforeGuard && guardActive) {
            if (DEBUG_LOGS) log(`🛡️ Garde active: bonus de défense type ignoré (personnage immunisé aux effets de type/classe)`);
        }
        
        // Appliquer le bonus de défense de type au multiplicateur
        const finalTypeMultiplier = classTypeMultiplier - typeDefenseBonus;
        
        // Réduction de dégâts
        const reductionMultiplier = (1 - damageReduction / 100); // 70% réduction = 0.3
        
        // Variance moyenne (comme Python)
        const variance = 1.015;
        
        if (DEBUG_LOGS) log(`📊 Multiplicateurs: Classe/Type=${classTypeMultiplier}, TypeDefBonus=${typeDefenseBonus}, Final=${finalTypeMultiplier}, Réduction=${reductionMultiplier}, Variance=${variance}`);
        
        let damage;
        
        if (guardActive) {
            // **CALCUL AVEC GARDE ACTIVÉE**
            // Formule: ((attaque * variance * classe_type * réduction * 0.8) - défense) / 2
            let step1 = attack * variance * finalTypeMultiplier * reductionMultiplier * 0.8;
            if (DEBUG_LOGS) log(`🛡️ Étape 1 garde: ${attack.toLocaleString()} * ${variance} * ${finalTypeMultiplier} * ${reductionMultiplier} * 0.8 = ${step1.toLocaleString()}`);
            
            // Étape 2: Soustraire la défense
            let step2 = step1 - defense;
            if (DEBUG_LOGS) log(`🛡️ Étape 2: ${step1.toLocaleString()} - ${defense.toLocaleString()} = ${step2.toLocaleString()}`);
            
            // Étape 3: Diviser par 2 (deuxième étape garde)
            damage = step2 / 2;
            if (DEBUG_LOGS) log(`🛡️ Étape 3: ${step2.toLocaleString()} / 2 = ${damage.toLocaleString()}`);
        } else {
            // **CALCUL SANS GARDE ACTIVÉE**
            // Formule: (attaque * variance * (classe_type - bonus_type_def) * réduction) - défense
            damage = (attack * variance * finalTypeMultiplier * reductionMultiplier) - defense;
            if (DEBUG_LOGS) log(`⚔️ Sans garde: (${attack.toLocaleString()} * ${variance} * ${finalTypeMultiplier} * ${reductionMultiplier}) - ${defense.toLocaleString()} = ${damage.toLocaleString()}`);
        }
        
        // Dégâts minimum (<=150 devient 0)
        if (damage <= 150) {
            if (DEBUG_LOGS) log(`🛡️ Dégâts ≤ 150, immunité totale!`);
            return 0;
        }

        const finalDamage = Math.max(0, Math.floor(damage));
        if (DEBUG_LOGS) log(`🎯 RÉSULTAT FINAL: ${finalDamage.toLocaleString()}`);
        return finalDamage;
    } catch (error) {
        console.error('❌ Erreur dans calculateBattleDamage:', error);
        return 0;
    }
}

function generateRecommendations() {
    try {
        const recommendationList = document.getElementById('recommendationList');
        if (!recommendationList) return;
        
        recommendationList.innerHTML = '';
        
        const defense = parseInt(document.getElementById('defenseValue').textContent.replace(/,/g, '')) || 0;
        const damageReduction = parseInt(document.getElementById('damageReduction')?.value) || 0;
        
        const recommendations = [];
        
        // Analyse de la défense
        if (defense < 200000) {
            recommendations.push("🔥 Priorité CRITIQUE: Augmentez votre défense de base - visez 200K+ minimum");
        } else if (defense < 400000) {
            recommendations.push("⚡ Améliorez vos boosts multiplicatifs pour dépasser 400K DEF");
        } else {
            recommendations.push("✅ Excellente défense ! Optimisez maintenant vos réductions de dégâts");
        }
        
        // Analyse de la réduction
        if (damageReduction < 30) {
            recommendations.push("🛡️ Ajoutez des réductions de dégâts (objets, passives, liens)");
        }
        
        recommendations.forEach(rec => {
            const item = document.createElement('li');
            item.textContent = rec;
            recommendationList.appendChild(item);
        });
    } catch (error) {
        console.error('❌ Erreur dans generateRecommendations:', error);
    }
}

// **FONCTION : CALCUL DES DÉGÂTS**
function calculateDamage() {
    try {
        const attackValue = parseInt(document.getElementById('attackValue').value) || 0;
        
        // S'assurer que la défense est à jour
        const defenseElement = document.getElementById('defenseValue');
        if (!defenseElement || defenseElement.textContent === '0') {
            log('🔄 Défense non calculée, recalcul en cours...');
            calculateDefense();
        }
        
        const defense = parseInt(defenseElement.textContent.replace(/,/g, '')) || 0;
        const damageReduction = parseInt(document.getElementById('damageReduction')?.value) || 0;
        const guardSelection = parseInt(document.getElementById('guardSelection')?.value) || 2;
        const guardActive = document.getElementById('guardActive')?.checked || false;
        const typeDefense = parseInt(document.getElementById('typeDefense')?.value) || 5;

        log(`💥 Calcul dégâts: ATT=${attackValue.toLocaleString()}, DEF=${defense.toLocaleString()}`);

        const damage = calculateBattleDamage(attackValue, defense, damageReduction, guardSelection, guardActive, typeDefense);

        const damageResultEl = document.getElementById('damageResult');
        if (damageResultEl) {
            damageResultEl.value = damage.toLocaleString();
        }
        
        return damage;
    } catch (error) {
        console.error('❌ Erreur dans calculateDamage:', error);
        return 0;
    }
}

// **FONCTION : MISE À JOUR DU GRAPHIQUE**
function updateChart() {
    // Éviter les mises à jour simultanées
    if (isUpdating) return;
    
    // Annuler la mise à jour précédente si elle existe
    if (updateTimeout) {
        clearTimeout(updateTimeout);
    }
    
    // Programmer la mise à jour avec un délai pour éviter les mises à jour trop fréquentes
    updateTimeout = setTimeout(() => {
        performChartUpdate();
    }, 200);
}

function performChartUpdate() {
    // Cette fonction génère réellement le graphique
    isUpdating = true;
    
    try {
        log('📈 Mise à jour du graphique...');
        
        // Récupérer les valeurs actuelles
        const defense = parseInt(document.getElementById('defenseValue')?.textContent.replace(/,/g, '')) || 0;
        
        // Vérifier que la défense est valide
        if (defense > 0) {
            // calculateThresholds génère déjà le graphique en interne, pas besoin de le faire ici
            // Il suffit de le laisser faire son travail
            log('✅ Graphique mis à jour via calculateThresholds');
        } else {
            log('⚠️ Défense = 0, pas de mise à jour du graphique');
        }
    } catch (error) {
        console.error('❌ Erreur dans performChartUpdate:', error);
    } finally {
        isUpdating = false;
    }
}

// **FONCTION : MISE À JOUR DE L'AFFICHAGE DU PERSONNAGE**
function updateCharacterDisplay() {
    try {
        const defense = parseInt(document.getElementById('defenseValue').textContent.replace(/,/g, '')) || 0;
        const damageReduction = parseInt(document.getElementById('damageReduction')?.value) || 0;
        
        // Synchroniser l'affichage de la défense dans l'interface de jeu
        const defenseGameEl = document.getElementById('defenseValueGameInterface');
        const damageReductionDisplayEl = document.getElementById('damageReductionDisplay');
        
        if (defenseGameEl) {
            defenseGameEl.textContent = defense.toLocaleString();
        }
        if (damageReductionDisplayEl) {
            damageReductionDisplayEl.textContent = damageReduction + '%';
        }
        
        log(`🔧 Interface mise à jour: DEF=${defense.toLocaleString()}, Réduction=${damageReduction}%`);
        
        // Si un boss est sélectionné, recalculer
        if (selectedBoss) {
            showBattleResult();
        }
    } catch (error) {
        console.error('❌ Erreur dans updateCharacterDisplay:', error);
    }
}

// **FONCTION : GESTION DES IMAGES AMÉLIORÉE**
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageElement = document.getElementById('characterImage');
            if (imageElement) {
                // Optimiser l'image avant de la sauvegarder
                optimizeImageForDisplay(e.target.result).then(optimizedDataUrl => {
                    imageElement.src = optimizedDataUrl;
                    localStorage.setItem('characterImage', optimizedDataUrl);
                    
                    // Proposer de sauvegarder l'image de façon permanente
                    createImageSaveOption(file.name, optimizedDataUrl);
                });
            }
        };
        reader.readAsDataURL(file);
    }
}

// **FONCTION : OPTIMISATION D'IMAGE POUR L'AFFICHAGE**
function optimizeImageForDisplay(dataUrl, maxWidth = 300, maxHeight = 300) {
    return new Promise((resolve) => {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = function() {
                // Calculer les nouvelles dimensions en gardant le ratio
                let { width, height } = img;
                
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width *= ratio;
                    height *= ratio;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Dessiner l'image redimensionnée avec une bonne qualité
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convertir en JPEG avec qualité optimisée
                const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
                log(`🖼️ Image optimisée pour affichage: ${img.width}x${img.height} → ${width}x${height}`);
                resolve(optimizedDataUrl);
            };
            
            img.onerror = () => {
                console.error('❌ Erreur lors de l\'optimisation d\'image');
                resolve(dataUrl); // Fallback vers l'image originale
            };
            
            img.src = dataUrl;
        } catch (error) {
            console.error('❌ Erreur dans optimizeImageForDisplay:', error);
            resolve(dataUrl); // Fallback vers l'image originale
        }
    });
}

// **FONCTION : OPTION DE SAUVEGARDE D'IMAGE PERMANENTE**
function createImageSaveOption(fileName, dataUrl) {
    // Créer un nom unique basé sur le nom du personnage et timestamp
    const characterName = document.getElementById('characterName').value || 'personnage';
    const cleanName = characterName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const timestamp = Date.now();
    const uniqueName = `${cleanName}_${timestamp}`;
    
    // Stocker l'association nom → image
    const imageRegistry = JSON.parse(localStorage.getItem('characterImages') || '{}');
    imageRegistry[uniqueName] = {
        name: characterName,
        dataUrl: dataUrl,
        timestamp: timestamp,
        originalFileName: fileName
    };
    localStorage.setItem('characterImages', JSON.stringify(imageRegistry));
    localStorage.setItem('currentImageKey', uniqueName);
    
    log(`💾 Image sauvegardée avec la clé: ${uniqueName}`);
}

// **FONCTION : RÉCUPÉRATION D'IMAGE PAR CLÉ**
function loadImageByKey(imageKey) {
    const imageRegistry = JSON.parse(localStorage.getItem('characterImages') || '{}');
    if (imageRegistry[imageKey]) {
        const imageData = imageRegistry[imageKey];
        const imageElement = document.getElementById('characterImage');
        if (imageElement) {
            imageElement.src = imageData.dataUrl;
            localStorage.setItem('characterImage', imageData.dataUrl);
        }
        
        // Mettre à jour le nom du personnage si nécessaire
        const nameElement = document.getElementById('characterName');
        if (nameElement && !nameElement.value.trim()) {
            nameElement.value = imageData.name;
        }
        
        log(`🖼️ Image chargée: ${imageData.name} (${imageKey})`);
        return true;
    }
    return false;
}

// **FONCTION : AFFICHER LA GALERIE D'IMAGES**
function showImageGallery() {
    const imageRegistry = JSON.parse(localStorage.getItem('characterImages') || '{}');
    const imageKeys = Object.keys(imageRegistry);
    
    if (imageKeys.length === 0) {
        createNotification('ℹ️ Galerie vide', 'Aucune image sauvegardée. Uploadez une image pour commencer votre galerie.', 'info');
        return;
    }
    
    // Créer le modal de galerie
    const modal = document.createElement('div');
    modal.className = 'image-gallery-modal';
    modal.innerHTML = `
        <div class="gallery-content">
            <div class="gallery-header">
                <h3>🖼️ Galerie d'Images</h3>
                <button class="close-gallery" onclick="closeImageGallery()">×</button>
            </div>
            <div class="gallery-grid">
                ${imageKeys.map(key => {
                    const image = imageRegistry[key];
                    return `
                        <div class="gallery-item" onclick="selectGalleryImage('${key}')">
                            <img src="${image.dataUrl}" alt="${image.name}" class="gallery-thumbnail">
                            <div class="gallery-info">
                                <div class="gallery-name">${image.name}</div>
                                <div class="gallery-date">${new Date(image.timestamp).toLocaleDateString()}</div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
            <div class="gallery-footer">
                <button onclick="clearImageGallery()" class="btn-danger">🗑️ Vider la galerie</button>
            </div>
        </div>
    `;
    
    // Ajouter les styles si nécessaire
    if (!document.querySelector('#gallery-styles')) {
        const styles = document.createElement('style');
        styles.id = 'gallery-styles';
        styles.textContent = `
            .image-gallery-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: fadeIn 0.3s ease-out;
            }
            .gallery-content {
                background: linear-gradient(135deg, #1a2035 0%, #2d3748 100%);
                border-radius: 15px;
                padding: 20px;
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
                border: 2px solid #ffd700;
            }
            .gallery-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                color: #ffd700;
            }
            .close-gallery {
                background: #ff6b35;
                color: white;
                border: none;
                border-radius: 50%;
                width: 30px;
                height: 30px;
                cursor: pointer;
                font-size: 20px;
                font-weight: bold;
            }
            .gallery-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                gap: 15px;
                margin-bottom: 20px;
            }
            .gallery-item {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 10px;
                padding: 10px;
                cursor: pointer;
                transition: all 0.3s ease;
                border: 2px solid transparent;
            }
            .gallery-item:hover {
                border-color: #ffd700;
                transform: scale(1.05);
            }
            .gallery-thumbnail {
                width: 100%;
                height: 120px;
                object-fit: cover;
                border-radius: 8px;
                margin-bottom: 8px;
            }
            .gallery-info {
                text-align: center;
                color: white;
            }
            .gallery-name {
                font-weight: bold;
                font-size: 12px;
                margin-bottom: 4px;
            }
            .gallery-date {
                font-size: 10px;
                color: #ccc;
            }
            .gallery-footer {
                text-align: center;
                padding-top: 15px;
                border-top: 1px solid rgba(255, 255, 255, 0.2);
            }
            .btn-danger {
                background: linear-gradient(45deg, #dc3545, #c82333);
                color: white;
                border: none;
                padding: 8px 15px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 12px;
            }
            .upload-btn.secondary {
                background: linear-gradient(45deg, #6c757d, #5a6268);
                margin-left: 10px;
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(modal);
}

// **FONCTION : SÉLECTIONNER UNE IMAGE DE LA GALERIE**
function selectGalleryImage(imageKey) {
    if (loadImageByKey(imageKey)) {
        localStorage.setItem('currentImageKey', imageKey);
        closeImageGallery();
        createNotification('✅ Image sélectionnée!', 'L\'image a été chargée avec succès.', 'success');
    }
}

// **FONCTION : FERMER LA GALERIE**
function closeImageGallery() {
    const modal = document.querySelector('.image-gallery-modal');
    if (modal) {
        modal.style.animation = 'fadeIn 0.3s ease-out reverse';
        setTimeout(() => modal.remove(), 300);
    }
}

// **FONCTION : VIDER LA GALERIE**
function clearImageGallery() {
    if (confirm('🗑️ Êtes-vous sûr de vouloir supprimer toutes les images sauvegardées ?')) {
        localStorage.removeItem('characterImages');
        localStorage.removeItem('currentImageKey');
        closeImageGallery();
        createNotification('✅ Galerie vidée!', 'Toutes les images ont été supprimées.', 'success');
    }
}

// **AMÉLIORATION DE L'EXPORT POUR INCLURE LES IMAGES**
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// **FONCTIONS DE SAUVEGARDE ET CHARGEMENT**
function saveConfiguration() {
    try {
        const config = {
            baseDef: document.getElementById('baseDef').value,
            equips: document.getElementById('equips').value,
            typeSelection: document.getElementById('typeSelection').value,
            treeCompletion: document.getElementById('treeCompletion').value,
            rankS: document.getElementById('rankS').checked,
            f2p: document.getElementById('f2p').checked,
            leader: document.getElementById('leader').value,
            base: document.getElementById('base').value,
            support: document.getElementById('support').value,
            links: document.getElementById('links').value,
            mb1: document.getElementById('mb1').value,
            mb1Active: document.getElementById('mb1Active').checked,
            mb2: document.getElementById('mb2').value,
            mb2Active: document.getElementById('mb2Active').checked,
            activeSkill: document.getElementById('activeSkill').value,
            asActive: document.getElementById('asActive').checked,
            terrain: document.getElementById('terrain').value,
            terrainActive: document.getElementById('terrainActive').checked,
            item: document.getElementById('item').value,
            itemActive: document.getElementById('itemActive').checked,
            stackValue1: document.getElementById('stackValue1').value,
            stack1: document.getElementById('stack1').value,
            stackValue2: document.getElementById('stackValue2').value,
            stack2: document.getElementById('stack2').value,
            damageReduction: document.getElementById('damageReduction')?.value || 0,
            guardSelection: document.getElementById('guardSelection')?.value || 2,
            guardActive: document.getElementById('guardActive')?.checked || false,
            typeDefense: document.getElementById('typeDefense')?.value || 0,
            teamHP: document.getElementById('teamHP')?.value || 850000,
            characterName: document.getElementById('characterName').value,
            characterImage: localStorage.getItem('characterImage') // Inclure l'image
        };

        localStorage.setItem('dokkanDefenseConfig', JSON.stringify(config));
        
        // Animation de confirmation avec notification
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = '✅ SAUVEGARDÉ!';
        btn.style.background = 'linear-gradient(45deg, #28a745, #20c997)';
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
        }, 2000);
        
        createNotification('✅ Configuration sauvegardée!', `La configuration "${config.characterName}" a été sauvegardée localement.`, 'success');
    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde:', error);
    }
}

function loadConfiguration() {
    try {
        const config = localStorage.getItem('dokkanDefenseConfig');
        if (config) {
            const data = JSON.parse(config);
            
            // Charger toutes les valeurs SANS déclencher les événements
            Object.keys(data).forEach(key => {
                const element = document.getElementById(key);
                if (element && key !== 'characterImage') {
                    if (element.type === 'checkbox') {
                        element.checked = data[key];
                    } else {
                        element.value = data[key];
                    }
                    log(`📥 Champ chargé: ${key} = ${data[key]}`);
                }
            });
            
            // Charger l'image si elle existe
            if (data.characterImage) {
                localStorage.setItem('characterImage', data.characterImage);
                const imageElement = document.getElementById('characterImage');
                if (imageElement) {
                    imageElement.src = data.characterImage;
                    log('🖼️ Image du personnage restaurée depuis la sauvegarde locale');
                }
            }
            
            // FORCER le recalcul après chargement
            setTimeout(() => {
                log('🔄 FORÇAGE du recalcul après chargement...');
                const defense = calculateDefense();
                log(`🛡️ Défense recalculée: ${defense.toLocaleString()}`);
                updateThresholdAnalysis(defense);
                updateCharacterDisplay();
                updateChart();
                log('✅ Configuration chargée et FORCÉE');
            }, 200);
            
            // Animation de confirmation avec notification
            const btn = event.target;
            const originalText = btn.textContent;
            btn.textContent = '✅ CHARGÉ!';
            btn.style.background = 'linear-gradient(45deg, #17a2b8, #6c757d)';
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = '';
            }, 2000);
            
            createNotification('✅ Configuration chargée!', 'La configuration sauvegardée a été restaurée avec succès.', 'success');
        } else {
            createNotification('❌ Aucune sauvegarde', 'Aucune configuration sauvegardée trouvée.', 'error');
        }
    } catch (error) {
        console.error('❌ Erreur lors du chargement:', error);
    }
}

function resetAll() {
    if (confirm('🔄 Êtes-vous sûr de vouloir tout remettre à zéro ?')) {
        // Réinitialiser tous les champs aux valeurs par défaut
        document.getElementById('baseDef').value = 9338;
        document.getElementById('equips').value = 0;
        document.getElementById('typeSelection').value = 'TEC';
        document.getElementById('treeCompletion').value = 0;
        document.getElementById('rankS').checked = false;
        document.getElementById('f2p').checked = false;
        document.getElementById('leader').value = 220;
        document.getElementById('base').value = 0;
        document.getElementById('support').value = 0;
        document.getElementById('links').value = 0;
        document.getElementById('mb1').value = 0;
        document.getElementById('mb1Active').checked = false;
        document.getElementById('mb2').value = 0;
        document.getElementById('mb2Active').checked = false;
        document.getElementById('activeSkill').value = 0;
        document.getElementById('asActive').checked = false;
        document.getElementById('terrain').value = 0;
        document.getElementById('terrainActive').checked = false;
        document.getElementById('item').value = 0;
        document.getElementById('itemActive').checked = false;
        document.getElementById('stackValue1').value = 0;
        document.getElementById('stack1').value = 0;
        document.getElementById('stackValue2').value = 0;
        document.getElementById('stack2').value = 0;
        
        if (document.getElementById('damageReduction')) {
            document.getElementById('damageReduction').value = 0;
        }
        if (document.getElementById('guardSelection')) {
            document.getElementById('guardSelection').value = 2;
        }
        if (document.getElementById('guardActive')) {
            document.getElementById('guardActive').checked = false;
        }
        if (document.getElementById('typeDefense')) {
            document.getElementById('typeDefense').value = 0;
        }
        
        document.getElementById('characterName').value = 'Personnage Mystère';
        document.getElementById('attackValue').value = 0;
        
        // Recalculer
        calculateDefense();
    }
}

// **FONCTIONS D'EXPORT ET IMPORT DE FICHIERS**
function exportConfiguration() {
    try {
        log('🚀 Début de l\'export de configuration...');
        
        // Collecter toutes les données de configuration avec vérifications
        const config = {
            characterName: document.getElementById('characterName')?.value || 'Personnage',
            characterImageKey: localStorage.getItem('currentImageKey'), // Utiliser la clé au lieu de l'image complète
            defenseValue: document.getElementById('defenseValue')?.textContent || '0',
            timestamp: new Date().toISOString(),
            version: "1.1", // Nouvelle version avec clés d'images
            
            // Paramètres de base
            baseDef: document.getElementById('baseDef')?.value || 0,
            equips: document.getElementById('equips')?.value || 0,
            typeSelection: document.getElementById('typeSelection')?.value || 1,
            treeCompletion: document.getElementById('treeCompletion')?.value || 0,
            rankS: document.getElementById('rankS')?.checked || false,
            f2p: document.getElementById('f2p')?.checked || false,
            
            // Buffs
            leader: document.getElementById('leader')?.value || 0,
            base: document.getElementById('base')?.value || 0,
            support: document.getElementById('support')?.value || 0,
            links: document.getElementById('links')?.value || 0,
            mb1: document.getElementById('mb1')?.value || 0,
            mb1Active: document.getElementById('mb1Active')?.checked || false,
            mb2: document.getElementById('mb2')?.value || 0,
            mb2Active: document.getElementById('mb2Active')?.checked || false,
            activeSkill: document.getElementById('activeSkill')?.value || 0,
            asActive: document.getElementById('asActive')?.checked || false,
            terrain: document.getElementById('terrain')?.value || 0,
            terrainActive: document.getElementById('terrainActive')?.checked || false,
            item: document.getElementById('item')?.value || 0,
            itemActive: document.getElementById('itemActive')?.checked || false,
            
            // Stacks
            stackValue1: document.getElementById('stackValue1')?.value || 0,
            stack1: document.getElementById('stack1')?.value || 0,
            stackValue2: document.getElementById('stackValue2')?.value || 0,
            stack2: document.getElementById('stack2')?.value || 0,
            
            // Paramètres de bataille
            damageReduction: document.getElementById('damageReduction')?.value || 0,
            guardSelection: document.getElementById('guardSelection')?.value || 2,
            guardActive: document.getElementById('guardActive')?.checked || false,
            typeDefense: document.getElementById('typeDefense')?.value || 0,
            teamHP: document.getElementById('teamHP')?.value || 850000,
            attackValue: document.getElementById('attackValue')?.value || 0
        };

        // Amélioration : inclure l'image actuelle dans l'export si elle existe
        const currentImageKey = localStorage.getItem('currentImageKey');
        const savedImage = localStorage.getItem('characterImage');
        
        if (currentImageKey) {
            config.characterImageKey = currentImageKey;
            log('🔑 Clé d\'image incluse dans l\'export:', currentImageKey);
        } else if (savedImage && !savedImage.includes('unit.png') && !savedImage.includes('data:image/svg+xml')) {
            // Si pas de clé mais image personnalisée, l'inclure directement
            config.characterImageData = savedImage;
            log('🖼️ Image incluse directement dans l\'export');
        }

        log('📊 Configuration collectée:', config);

        // Créer le nom du fichier
        const characterName = config.characterName.replace(/[^a-zA-Z0-9]/g, '_');
        const date = new Date().toISOString().split('T')[0];
        const fileName = `Dokkan_${characterName}_${date}.json`;

        // Créer le fichier et le télécharger
        const dataStr = JSON.stringify(config, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = fileName;
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();

        // Animation de confirmation sur le bouton d'export avec notification
        const exportBtn = document.querySelector('button[onclick="exportConfiguration()"]');
        if (exportBtn) {
            const originalText = exportBtn.textContent;
            exportBtn.textContent = '✅ EXPORTÉ!';
            exportBtn.style.background = 'linear-gradient(45deg, #28a745, #20c997)';
            setTimeout(() => {
                exportBtn.textContent = originalText;
                exportBtn.style.background = '';
            }, 2000);
        }

        createNotification('✅ Fiche exportée!', `Le fichier "${fileName}" a été téléchargé avec succès.`, 'success');

        log(`📄 Configuration exportée: ${fileName}`);
    } catch (error) {
        console.error('❌ Erreur lors de l\'export:', error);
        createNotification('❌ Erreur d\'export', 'Impossible d\'exporter le fichier de configuration.', 'error');
    }
}

function importConfiguration() {
    try {
        // Créer un input file invisible
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.style.display = 'none';
        
        input.onchange = function(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const config = JSON.parse(e.target.result);
                    
                    // Valider que c'est bien un fichier de configuration Dokkan
                    if (!config.version || !config.characterName) {
                        createNotification('❌ Fichier invalide', 'Ce fichier n\'est pas une configuration Dokkan Battle valide.', 'error');
                        return;
                    }

                    // Gestion améliorée des images lors de l'import
                    let imageRestored = false;
                    
                    // 1. Essayer de charger par clé d'image
                    if (config.characterImageKey) {
                        log('🔑 Tentative de chargement par clé d\'image:', config.characterImageKey);
                        imageRestored = loadImageByKey(config.characterImageKey);
                    }
                    
                    // 2. Si pas de clé, essayer l'image incluse directement
                    if (!imageRestored && config.characterImageData) {
                        log('🖼️ Chargement de l\'image incluse...');
                        localStorage.setItem('characterImage', config.characterImageData);
                        const imageElement = document.getElementById('characterImage');
                        if (imageElement) {
                            imageElement.src = config.characterImageData;
                            imageRestored = true;
                        }
                    }
                    
                    // 3. Fallback vers l'ancien système (characterImage)
                    if (!imageRestored && config.characterImage) {
                        log('🖼️ Chargement via ancien système...');
                        localStorage.setItem('characterImage', config.characterImage);
                        const imageElement = document.getElementById('characterImage');
                        if (imageElement) {
                            imageElement.src = config.characterImage;
                            imageRestored = true;
                        }
                    }

                    // Charger toutes les valeurs dans les champs SANS déclencher les événements
                    // (pour éviter l'interférence avec le debounce)
                    Object.keys(config).forEach(key => {
                        const element = document.getElementById(key);
                        if (element && key !== 'characterImage' && key !== 'characterImageKey' && key !== 'characterImageData' && key !== 'defenseValue' && key !== 'timestamp' && key !== 'version') {
                            if (element.type === 'checkbox') {
                                element.checked = config[key];
                            } else {
                                element.value = config[key];
                            }
                            log(`📥 Champ restauré: ${key} = ${config[key]}`);
                        }
                    });
                    
                    // IMPORTANT: S'assurer que teamHP est défini (pour les anciennes fiches qui n'ont pas ce champ)
                    const teamHPElement = document.getElementById('teamHP');
                    if (teamHPElement && !config.teamHP) {
                        teamHPElement.value = 850000; // Valeur par défaut
                        log(`⚠️ teamHP manquant, valeur par défaut appliquée: 850000`);
                    }

                    // Sauvegarder le nom
                    if (config.characterName) {
                        localStorage.setItem('characterName', config.characterName);
                        const characterNameEl = document.getElementById('characterName');
                        if (characterNameEl) {
                            characterNameEl.value = config.characterName;
                        }
                        log(`📝 Nom du personnage restauré: ${config.characterName}`);
                    }

                    // Recalculer TOUT après import - FORCER le recalcul immédiat sans debounce
                    setTimeout(() => {
                        log('🔄 FORÇAGE du recalcul complet après importation...');
                        log('📊 Valeurs chargées:');
                        log('   - baseDef:', document.getElementById('baseDef')?.value);
                        log('   - leader:', document.getElementById('leader')?.value);
                        log('   - base:', document.getElementById('base')?.value);
                        log('   - support:', document.getElementById('support')?.value);
                        
                        // Mettre à jour le dropdown de complétion d'arbre selon le type
                        updateTreeCompletionOptions();
                        
                        // FORCER le calcul direct sans attendre le debounce
                        const defense = calculateDefense();
                        log(`🛡️ Défense recalculée: ${defense.toLocaleString()}`);
                        
                        // FORCER la mise à jour de tous les éléments
                        updateThresholdAnalysis(defense);
                        updateCharacterDisplay();
                        updateChart();
                        
                        log('✅ Mise à jour FORCÉE terminée');
                    }, 200);

                    // Animation de confirmation avec notification
                    const btn = document.querySelector('[onclick="importConfiguration()"]');
                    if (btn) {
                        const originalText = btn.textContent;
                        btn.textContent = '✅ IMPORTÉ!';
                        btn.style.background = 'linear-gradient(45deg, #17a2b8, #6c757d)';
                        setTimeout(() => {
                            btn.textContent = originalText;
                            btn.style.background = '';
                        }, 2000);
                    }

                    log(`📄 Configuration importée: ${config.characterName} (${config.timestamp})`);
                    
                    const message = imageRestored 
                        ? `La configuration "${config.characterName}" a été chargée avec son image.`
                        : `La configuration "${config.characterName}" a été chargée (image non disponible).`;
                        
                    const notificationType = imageRestored ? 'success' : 'info';
                    createNotification('✅ Configuration importée!', message, notificationType);
                } catch (parseError) {
                    console.error('❌ Erreur lors du parsing JSON:', parseError);
                    createNotification('❌ Fichier corrompu', 'Le fichier sélectionné est corrompu ou son format est invalide.', 'error');
                }
            };
            
            reader.readAsText(file);
        };
        
        // Déclencher la sélection de fichier
        document.body.appendChild(input);
        input.click();
        document.body.removeChild(input);
    } catch (error) {
        console.error('❌ Erreur lors de l\'import:', error);
        createNotification('❌ Erreur d\'import', 'Impossible d\'importer le fichier de configuration.', 'error');
    }
}

// **FONCTION D'OPTIMISATION D'IMAGE POUR LE PARTAGE**
function optimizeImageForSharing(dataUrl, maxSize = 50000) {
    return new Promise((resolve, reject) => {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = function() {
                // Calculer les nouvelles dimensions (max 150x150 pour partage)
                let { width, height } = img;
                const maxDimension = 150;
                
                if (width > maxDimension || height > maxDimension) {
                    if (width > height) {
                        height = (height * maxDimension) / width;
                        width = maxDimension;
                    } else {
                        width = (width * maxDimension) / height;
                        height = maxDimension;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Dessiner l'image redimensionnée
                ctx.drawImage(img, 0, 0, width, height);
                
                // Essayer différents niveaux de qualité
                let quality = 0.7;
                let optimizedDataUrl;
                
                do {
                    optimizedDataUrl = canvas.toDataURL('image/jpeg', quality);
                    quality -= 0.1;
                } while (optimizedDataUrl.length > maxSize && quality > 0.1);
                
                if (optimizedDataUrl.length <= maxSize) {
                    log(`🖼️ Image optimisée: ${img.width}x${img.height} → ${width}x${height}, ${dataUrl.length} → ${optimizedDataUrl.length} bytes`);
                    resolve(optimizedDataUrl);
                } else {
                    console.warn('⚠️ Impossible d\'optimiser suffisamment l\'image');
                    resolve(null);
                }
            };
            
            img.onerror = () => {
                console.error('❌ Erreur de chargement de l\'image pour optimisation');
                resolve(null);
            };
            
            img.src = dataUrl;
        } catch (error) {
            console.error('❌ Erreur dans optimizeImageForSharing:', error);
            resolve(null);
        }
    });
}

// **FONCTION DE PARTAGE AMÉLIORÉE**
async function shareConfiguration(buttonElement = null) {
    try {
        log('🔗 Début du processus de partage...');
        
        // Collecter la configuration actuelle
        const config = {
            characterName: document.getElementById('characterName').value,
            defenseValue: document.getElementById('defenseValue').textContent,
            
            baseDef: document.getElementById('baseDef').value,
            equips: document.getElementById('equips').value,
            typeSelection: document.getElementById('typeSelection').value,
            treeCompletion: document.getElementById('treeCompletion').value,
            rankS: document.getElementById('rankS').checked,
            f2p: document.getElementById('f2p').checked,
            leader: document.getElementById('leader').value,
            base: document.getElementById('base').value,
            support: document.getElementById('support').value,
            links: document.getElementById('links').value,
            mb1: document.getElementById('mb1').value,
            mb1Active: document.getElementById('mb1Active').checked,
            mb2: document.getElementById('mb2').value,
            mb2Active: document.getElementById('mb2Active').checked,
            activeSkill: document.getElementById('activeSkill').value,
            asActive: document.getElementById('asActive').checked,
            terrain: document.getElementById('terrain').value,
            terrainActive: document.getElementById('terrainActive').checked,
            item: document.getElementById('item').value,
            itemActive: document.getElementById('itemActive').checked,
            stackValue1: document.getElementById('stackValue1').value,
            stack1: document.getElementById('stack1').value,
            stackValue2: document.getElementById('stackValue2').value,
            stack2: document.getElementById('stack2').value,
            damageReduction: document.getElementById('damageReduction')?.value || 0,
            guardSelection: document.getElementById('guardSelection')?.value || 2,
            guardActive: document.getElementById('guardActive')?.checked || false,
            typeDefense: document.getElementById('typeDefense')?.value || 0,
            teamHP: document.getElementById('teamHP')?.value || 850000
        };

        // Vérifier si on a une image personnalisée (pas l'image par défaut)
        const savedImage = localStorage.getItem('characterImage');
        log('🔍 Image sauvegardée détectée:', savedImage ? `${savedImage.substring(0, 50)}...` : 'Aucune');
        
        const isDefaultImage = !savedImage || 
                               savedImage.includes('unit.png') || 
                               savedImage.includes('data:image/svg+xml') ||
                               savedImage.includes('imageBoss/unit.png');
        
        log('🎯 Est-ce l\'image par défaut?', isDefaultImage);
        
        if (!isDefaultImage) {
            // Inclure l'image personnalisée
            config.characterImage = savedImage;
            log('🖼️ Image personnalisée incluse dans la configuration');
        } else {
            log('📷 Image par défaut détectée, partage des paramètres uniquement');
        }

        log('📊 Configuration à partager:', config);

        // Créer un lien partageable (encoder en base64 avec gestion des caractères spéciaux)
        const configString = JSON.stringify(config);
        let encodedConfig;
        try {
            // Encoder en UTF-8 puis en base64 pour gérer les émojis
            encodedConfig = btoa(unescape(encodeURIComponent(configString)));
        } catch (e) {
            console.error('Erreur d\'encodage:', e);
            // Fallback : remplacer les émojis par des codes
            const cleanConfigString = configString.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');
            encodedConfig = btoa(cleanConfigString);
        }
        
        let shareUrl = `${window.location.origin}${window.location.pathname}?config=${encodedConfig}`;
        let imageIncluded = config.characterImage ? true : false; // Basé sur si l'image est dans la config
        
        // Vérifier la taille de l'URL et optimiser l'image si nécessaire
        if (shareUrl.length > 2000) {
            console.warn('⚠️ URL trop longue, tentative d\'optimisation...');
            
            // Tentative 1: Optimiser l'image si elle existe
            if (config.characterImage && config.characterImage.startsWith('data:image/')) {
                try {
                    // Compresser l'image en réduisant la qualité/taille
                    const optimizedImage = await optimizeImageForSharing(config.characterImage);
                    if (optimizedImage) {
                        config.characterImage = optimizedImage;
                        
                        // Recréer l'URL avec l'image optimisée
                        const optimizedConfigString = JSON.stringify(config);
                        let optimizedEncodedConfig;
                        try {
                            optimizedEncodedConfig = btoa(unescape(encodeURIComponent(optimizedConfigString)));
                        } catch (e) {
                            const cleanConfigString = optimizedConfigString.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');
                            optimizedEncodedConfig = btoa(cleanConfigString);
                        }
                        
                        const optimizedShareUrl = `${window.location.origin}${window.location.pathname}?config=${optimizedEncodedConfig}`;
                        
                        if (optimizedShareUrl.length <= 2000) {
                            log('✅ URL créée avec image optimisée');
                            shareUrl = optimizedShareUrl;
                            imageIncluded = true;
                        } else {
                            // Si même l'image optimisée est trop grande, continuer vers la version sans image
                            throw new Error('Image trop volumineuse même optimisée');
                        }
                    } else {
                        throw new Error('Optimisation impossible');
                    }
                } catch (optimizeError) {
                    console.warn('⚠️ Optimisation d\'image échouée, suppression de l\'image...');
                    
                    // Créer une version sans image
                    const configWithoutImage = { ...config };
                    delete configWithoutImage.characterImage;
                    
                    const configStringWithoutImage = JSON.stringify(configWithoutImage);
                    let encodedConfigWithoutImage;
                    try {
                        encodedConfigWithoutImage = btoa(unescape(encodeURIComponent(configStringWithoutImage)));
                    } catch (e) {
                        const cleanConfigString = configStringWithoutImage.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');
                        encodedConfigWithoutImage = btoa(cleanConfigString);
                    }
                    
                    const shareUrlWithoutImage = `${window.location.origin}${window.location.pathname}?config=${encodedConfigWithoutImage}`;
                    
                    if (shareUrlWithoutImage.length <= 2000) {
                        log('✅ URL raccourcie créée sans image');
                        shareUrl = shareUrlWithoutImage;
                        imageIncluded = false;
                    } else {
                        throw new Error('Configuration trop volumineuse même sans image');
                    }
                }
            } else {
                // Pas d'image à optimiser, supprimer directement
                const configWithoutImage = { ...config };
                delete configWithoutImage.characterImage;
                
                const configStringWithoutImage = JSON.stringify(configWithoutImage);
                let encodedConfigWithoutImage;
                try {
                    encodedConfigWithoutImage = btoa(unescape(encodeURIComponent(configStringWithoutImage)));
                } catch (e) {
                    const cleanConfigString = configStringWithoutImage.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');
                    encodedConfigWithoutImage = btoa(cleanConfigString);
                }
                
                const shareUrlWithoutImage = `${window.location.origin}${window.location.pathname}?config=${encodedConfigWithoutImage}`;
                
                if (shareUrlWithoutImage.length <= 2000) {
                    log('✅ URL raccourcie créée sans image');
                    shareUrl = shareUrlWithoutImage;
                    imageIncluded = false;
                } else {
                    throw new Error('Configuration trop volumineuse même sans image');
                }
            }
        }

        log(`🔗 URL générée (${shareUrl.length} caractères)`);
        log(`🖼️ Image incluse: ${imageIncluded ? 'Oui' : 'Non'}`);

        // Fonction pour afficher le succès
        function showSuccess(btn) {
            if (btn) {
                const originalText = btn.textContent;
                const originalStyle = btn.style.background;
                btn.textContent = '✅ LIEN COPIÉ!';
                btn.style.background = 'linear-gradient(45deg, #28a745, #20c997)';
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.background = originalStyle;
                }, 3000);
            }
        }

        // Récupérer le bouton de partage - utiliser le paramètre ou chercher dans le DOM
        const shareBtn = buttonElement || document.querySelector('button[onclick*="shareConfiguration"]');
        log('🎯 Bouton trouvé:', shareBtn ? 'Oui' : 'Non');

        // Méthode de fallback
        function fallbackCopy() {
            try {
                log('� Utilisation de la méthode fallback...');
                
                // Créer un élément textarea temporaire
                const textArea = document.createElement('textarea');
                textArea.value = shareUrl;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                textArea.style.opacity = '0';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                textArea.setSelectionRange(0, 99999); // Pour mobile
                
                // Essayer la méthode execCommand
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                
                if (successful) {
                    log('✅ Lien copié avec succès via execCommand');
                    showSuccess(shareBtn);
                    
                    const message = imageIncluded 
                        ? 'Vous pouvez maintenant le partager avec d\'autres joueurs.'
                        : 'Image non incluse (trop volumineuse), mais tous les paramètres sont sauvegardés.';
                        
                    createNotification('✅ Lien de partage copié!', message, 'success');
                    return true;
                } else {
                    throw new Error('execCommand failed');
                }
            } catch (err) {
                console.error('❌ Échec du fallback:', err);
                // Dernier recours : afficher le lien dans une popup
                const userInput = prompt('🔗 Copiez ce lien pour partager votre configuration:', shareUrl);
                if (userInput !== null) {
                    showSuccess(shareBtn);
                    createNotification('🔗 Lien généré!', 'Lien de partage affiché pour copie manuelle.', 'info');
                    return true;
                }
                return false;
            }
        }

        // Essayer d'abord l'API Clipboard moderne si disponible
        if (navigator.clipboard && navigator.clipboard.writeText) {
            log('🔗 Tentative avec l\'API Clipboard moderne...');
            navigator.clipboard.writeText(shareUrl).then(() => {
                log('✅ Lien copié avec succès via l\'API Clipboard');
                showSuccess(shareBtn);
                
                const message = imageIncluded 
                    ? 'Vous pouvez maintenant le partager avec d\'autres joueurs.'
                    : 'Image non incluse (trop volumineuse), mais tous les paramètres sont sauvegardés.';
                    
                createNotification('✅ Lien de partage copié!', message, 'success');
            }).catch(err => {
                console.warn('⚠️ Échec de l\'API Clipboard (probablement contexte non sécurisé):', err);
                fallbackCopy();
            });
        } else {
            log('🔗 API Clipboard non disponible, utilisation du fallback...');
            fallbackCopy();
        }

        log(`🔗 Configuration partagée: ${shareUrl}`);
    } catch (error) {
        console.error('❌ Erreur lors du partage:', error);
        createNotification('❌ Erreur de partage', `Impossible de créer le lien de partage: ${error.message}`, 'error');
    }
}

// **FONCTION POUR CRÉER DES NOTIFICATIONS PERSONNALISÉES**
function createNotification(title, message, type = 'info') {
    // Supprimer les notifications existantes
    const existingNotifications = document.querySelectorAll('.custom-notification');
    existingNotifications.forEach(notif => notif.remove());

    // Créer la notification
    const notification = document.createElement('div');
    notification.className = `custom-notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;

    // Ajouter les styles si ce n'est pas déjà fait
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .custom-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #1a2035 0%, #2d3748 100%);
                border: 2px solid;
                border-radius: 15px;
                padding: 20px;
                max-width: 400px;
                z-index: 10000;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                animation: slideInNotification 0.5s ease-out;
            }
            .custom-notification.success { border-color: #28a745; }
            .custom-notification.error { border-color: #dc3545; }
            .custom-notification.info { border-color: #17a2b8; }
            .notification-content {
                color: white;
                position: relative;
            }
            .notification-title {
                font-weight: bold;
                font-size: 1.1em;
                margin-bottom: 8px;
                color: #ffd700;
            }
            .notification-message {
                font-size: 0.9em;
                line-height: 1.4;
                color: #e0e0e0;
            }
            .notification-close {
                position: absolute;
                top: -10px;
                right: -10px;
                background: #ff6b35;
                color: white;
                border: none;
                border-radius: 50%;
                width: 25px;
                height: 25px;
                cursor: pointer;
                font-size: 14px;
                font-weight: bold;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .notification-close:hover {
                background: #f7931e;
            }
            @keyframes slideInNotification {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @media (max-width: 768px) {
                .custom-notification {
                    left: 10px;
                    right: 10px;
                    top: 10px;
                    max-width: none;
                }
            }
        `;
        document.head.appendChild(styles);
    }

    // Ajouter au DOM
    document.body.appendChild(notification);

    // Auto-suppression après 5 secondes
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideInNotification 0.5s ease-out reverse';
            setTimeout(() => notification.remove(), 500);
        }
    }, 5000);
}

// **INITIALISATION AU CHARGEMENT DE LA PAGE**
document.addEventListener('DOMContentLoaded', function() {
    log('🚀 Initialisation du calculateur Dokkan Battle...');
    
    // Détection mobile pour optimisations spécifiques
    const isMobile = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    log(`📱 Détection appareil: ${isMobile ? 'Mobile' : 'Desktop'}`);
    
    // Ajouter une classe CSS pour les mobiles
    if (isMobile) {
        document.body.classList.add('mobile-device');
        
        // Optimisations spécifiques mobiles
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
            .mobile-device #damageChart {
                height: 300px !important;
                min-height: 300px !important;
            }
            .mobile-device .chart-container {
                padding: 10px !important;
            }
            .mobile-device .plotly-notifier {
                display: none !important;
            }
            .mobile-device .modebar {
                display: none !important;
            }
        `;
        document.head.appendChild(styleSheet);
    }
    
    // Gestionnaire de redimensionnement global
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const chartElement = document.getElementById('damageChart');
            if (chartElement && window.Plotly) {
                log('🔄 Redimensionnement du graphique...');
                Plotly.Plots.resize('damageChart');
            }
        }, 300);
    });
    
    // Vérifier s'il y a une configuration partagée dans l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const sharedConfig = urlParams.get('config');
    
    if (sharedConfig) {
        try {
            // Décoder la configuration partagée avec gestion des caractères spéciaux
            let configString;
            try {
                configString = decodeURIComponent(escape(atob(sharedConfig)));
            } catch (e) {
                // Fallback pour l'ancien format
                configString = atob(sharedConfig);
            }
            const config = JSON.parse(configString);
            
            // Charger la configuration partagée
            Object.keys(config).forEach(key => {
                const element = document.getElementById(key);
                if (element && key !== 'defenseValue' && key !== 'characterImage' && key !== 'characterImageKey' && key !== 'characterImageData') {
                    if (element.type === 'checkbox') {
                        element.checked = config[key];
                    } else {
                        element.value = config[key];
                    }
                }
            });
            
            // Gestion améliorée des images dans les configurations partagées
            let imageRestored = false;
            
            // 1. Essayer de charger par clé d'image (nouveau système)
            if (config.characterImageKey) {
                log('🔑 Tentative de chargement par clé d\'image:', config.characterImageKey);
                imageRestored = loadImageByKey(config.characterImageKey);
                if (imageRestored) {
                    log('✅ Image restaurée via clé d\'image');
                }
            }
            
            // 2. Si pas de clé, essayer l'image optimisée incluse dans le lien
            if (!imageRestored && config.characterImageData) {
                log('🖼️ Chargement de l\'image optimisée depuis le lien...');
                const imageElement = document.getElementById('characterImage');
                if (imageElement) {
                    imageElement.src = config.characterImageData;
                    localStorage.setItem('characterImage', config.characterImageData);
                    imageRestored = true;
                    log('✅ Image optimisée restaurée depuis le lien partagé');
                }
            }
            
            // 3. Si pas d'image optimisée, essayer l'image complète (ancien système)
            if (!imageRestored && config.characterImage) {
                log('🖼️ Chargement de l\'image complète depuis le lien...');
                const imageElement = document.getElementById('characterImage');
                if (imageElement) {
                    imageElement.src = config.characterImage;
                    localStorage.setItem('characterImage', config.characterImage);
                    imageRestored = true;
                    log('✅ Image complète restaurée depuis le lien partagé');
                }
            }
            
            // 4. Afficher un message approprié selon la situation
            let message, notificationType;
            if (imageRestored) {
                message = `Configuration "${config.characterName}" chargée avec image.`;
                notificationType = 'success';
            } else {
                message = `Configuration "${config.characterName}" chargée (image non disponible dans ce lien).`;
                notificationType = 'info';
                log('ℹ️ Aucune image disponible dans la configuration partagée');
            }
            
            // Recalculer après chargement
            setTimeout(() => {
                calculateDefense();
                createNotification('✅ Configuration partagée chargée!', message, notificationType);
            }, 100);
            
            log(`🔗 Configuration partagée chargée: ${config.characterName} (version ${config.version || '1.0'})`);
        } catch (error) {
            console.error('❌ Erreur lors du chargement de la configuration partagée:', error);
            createNotification('❌ Lien invalide', 'Le lien de partage est corrompu ou invalide.', 'error');
        }
    } else {
        // Charger l'image et le nom sauvegardés normalement
        const savedImage = localStorage.getItem('characterImage');
        const savedName = localStorage.getItem('characterName');
        if (savedImage) {
            const imageElement = document.getElementById('characterImage');
            if (imageElement) {
                imageElement.src = savedImage;
            }
        }
        if (savedName) {
            const nameElement = document.getElementById('characterName');
            if (nameElement) {
                nameElement.value = savedName;
            }
        }
    }
    
    // Versions temporisées, pour ne recalculer qu'une fois la saisie terminée.
    // Le rendu du graphique étant descendu à environ 140 ms, un délai court
    // suffit : la réponse paraît immédiate sans recalculer à chaque frappe.
    const debouncedCalculateDefense = debounce(() => {
        calculateDefense();
    }, isMobile ? 300 : 150); // Délai un peu plus long sur mobile, moins puissant

    const debouncedCalculateDamage = debounce(() => {
        calculateDamage();
    }, isMobile ? 300 : 150);
    
    // Ajouter des événements pour recalculer automatiquement
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        // Événements pour tous les inputs qui affectent la défense
        if (input.id !== 'attackValue' && input.id !== 'damageResult') {
            input.addEventListener('input', function() {
                log(`🔄 Input changé: ${input.id} = ${input.value || input.checked}`);
                debouncedCalculateDefense();
            });
            
            input.addEventListener('change', function() {
                log(`🔄 Change déclenché: ${input.id} = ${input.value || input.checked}`);
                debouncedCalculateDefense();
            });
        }
        
        // Événement spécial pour l'attaque adverse
        if (input.id === 'attackValue') {
            input.addEventListener('input', debouncedCalculateDamage);
            input.addEventListener('change', debouncedCalculateDamage);
        }
    });
    
    // Événement pour le nom du personnage
    const characterNameEl = document.getElementById('characterName');
    if (characterNameEl) {
        characterNameEl.addEventListener('input', function() {
            localStorage.setItem('characterName', this.value);
        });
    }

    // Événements spéciaux pour les éléments critiques qui affectent les seuils
    const guardSelectionEl = document.getElementById('guardSelection');
    const guardActiveEl = document.getElementById('guardActive');
    
    if (guardSelectionEl) {
        guardSelectionEl.addEventListener('change', function() {
            log(`🔄 Situation classe & type changée: ${this.value}`);
            debouncedCalculateDefense();
        });
    }
    
    if (guardActiveEl) {
        guardActiveEl.addEventListener('change', function() {
            log(`🔄 Garde passive changée: ${this.checked}`);
            debouncedCalculateDefense();
        });
    }

    // Les champs « PV de la team », « Réduction de dégâts » et « Défense de
    // type » avaient auparavant leurs propres écouteurs, qui relançaient un
    // rendu complet du graphique à chaque frappe, sans temporisation. Comme
    // l'écouteur générique ci-dessus les couvre déjà (et que calculateDefense
    // met à jour les seuils et le graphique), ils faisaient double travail :
    // chaque caractère saisi provoquait deux rendus au lieu d'un seul différé.

    // Calcul initial avec un délai pour s'assurer que tout est chargé
    setTimeout(() => {
        log('⚡ Lancement du calcul initial...');
        calculateDefense();
        log('✅ Initialisation terminée');
    }, isMobile ? 500 : 200); // Plus de délai sur mobile
});

// **SYSTÈME DE FICHES DE CALCUL SAUVEGARDÉES**

// **FONCTION : SAUVEGARDER LA FICHE ACTUELLE**
function saveCurrentCalculation(buttonElement = null) {
    try {
        log('💾 Sauvegarde de la fiche actuelle...');
        
        // Récupérer toutes les données actuelles
        const calculation = {
            id: Date.now(), // ID unique basé sur timestamp
            name: document.getElementById('characterName').value || 'Fiche sans nom',
            timestamp: new Date().toISOString(),
            
            // Image du personnage
            characterImage: localStorage.getItem('characterImage'),
            characterImageKey: localStorage.getItem('currentImageKey'),
            
            // Valeur de défense calculée
            defenseValue: document.getElementById('defenseValue')?.textContent || '0',
            
            // Tous les paramètres
            baseDef: document.getElementById('baseDef').value,
            equips: document.getElementById('equips').value,
            typeSelection: document.getElementById('typeSelection').value,
            treeCompletion: document.getElementById('treeCompletion').value,
            rankS: document.getElementById('rankS').checked,
            f2p: document.getElementById('f2p').checked,
            leader: document.getElementById('leader').value,
            base: document.getElementById('base').value,
            support: document.getElementById('support').value,
            links: document.getElementById('links').value,
            mb1: document.getElementById('mb1').value,
            mb1Active: document.getElementById('mb1Active').checked,
            mb2: document.getElementById('mb2').value,
            mb2Active: document.getElementById('mb2Active').checked,
            activeSkill: document.getElementById('activeSkill').value,
            asActive: document.getElementById('asActive').checked,
            terrain: document.getElementById('terrain').value,
            terrainActive: document.getElementById('terrainActive').checked,
            item: document.getElementById('item').value,
            itemActive: document.getElementById('itemActive').checked,
            stackValue1: document.getElementById('stackValue1').value,
            stack1: document.getElementById('stack1').value,
            stackValue2: document.getElementById('stackValue2').value,
            stack2: document.getElementById('stack2').value,
            damageReduction: document.getElementById('damageReduction')?.value || 0,
            guardSelection: document.getElementById('guardSelection')?.value || 0,
            guardActive: document.getElementById('guardActive')?.checked || false,
            typeDefense: document.getElementById('typeDefense')?.value || 0,
            teamHP: document.getElementById('teamHP')?.value || 850000,
            attackValue: document.getElementById('attackValue')?.value || 0
        };

        // Récupérer les fiches existantes
        const savedCalculations = JSON.parse(localStorage.getItem('savedCalculations') || '[]');
        
        // Vérifier si une fiche avec le même nom existe déjà
        const existingIndex = savedCalculations.findIndex(calc => calc.name === calculation.name);
        
        if (existingIndex !== -1) {
            // Demander confirmation pour écraser
            if (confirm(`📝 Une fiche nommée "${calculation.name}" existe déjà. Voulez-vous l'écraser ?`)) {
                savedCalculations[existingIndex] = calculation;
                createNotification('✅ Fiche mise à jour!', `La fiche "${calculation.name}" a été mise à jour.`, 'success');
            } else {
                // Proposer de sauvegarder avec un nouveau nom
                const newName = prompt('📝 Entrez un nouveau nom pour cette fiche:', calculation.name + ' (copie)');
                if (newName && newName.trim()) {
                    calculation.name = newName.trim();
                    calculation.id = Date.now(); // Nouveau ID
                    savedCalculations.push(calculation);
                    createNotification('✅ Fiche sauvegardée!', `La fiche "${calculation.name}" a été sauvegardée.`, 'success');
                } else {
                    createNotification('❌ Sauvegarde annulée', 'Aucun nom valide fourni.', 'error');
                    return;
                }
            }
        } else {
            // Ajouter la nouvelle fiche
            savedCalculations.push(calculation);
            createNotification('✅ Fiche sauvegardée!', `La fiche "${calculation.name}" a été sauvegardée.`, 'success');
        }

        // Sauvegarder dans localStorage
        localStorage.setItem('savedCalculations', JSON.stringify(savedCalculations));
        
        // Animation sur le bouton - avec gestion sécurisée
        const btn = buttonElement || event?.target || document.querySelector('button[onclick*="saveCurrentCalculation"]');
        if (btn) {
            const originalText = btn.textContent;
            const originalStyle = btn.style.background;
            btn.textContent = '✅ SAUVÉ!';
            btn.style.background = 'linear-gradient(45deg, #28a745, #20c997)';
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = originalStyle;
            }, 2000);
        }
        
        log(`💾 Fiche sauvegardée: ${calculation.name} (ID: ${calculation.id})`);
    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde de fiche:', error);
        createNotification('❌ Erreur de sauvegarde', 'Impossible de sauvegarder la fiche.', 'error');
    }
}

// **FONCTION UTILITAIRE : FORMATER LA VALEUR DE DÉFENSE**
function formatDefenseValue(defenseValue) {
    try {
        // Nettoyer la valeur (enlever les virgules, espaces, etc.)
        let cleanValue = String(defenseValue).replace(/[^0-9]/g, '');
        let numValue = parseInt(cleanValue) || 0;
        return numValue.toLocaleString();
    } catch (error) {
        console.error('Erreur formatage défense:', error);
        return '0';
    }
}

// **FONCTION : AFFICHER LES FICHES SAUVEGARDÉES**
function showSavedCalculations() {
    const savedCalculations = JSON.parse(localStorage.getItem('savedCalculations') || '[]');
    
    if (savedCalculations.length === 0) {
        createNotification('ℹ️ Aucune fiche', 'Aucune fiche sauvegardée. Utilisez "SAUVER FICHE" pour commencer.', 'info');
        return;
    }
    
    // Trier les fiches par date (plus récentes en premier)
    savedCalculations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Créer le modal des fiches
    const modal = document.createElement('div');
    modal.className = 'calculations-modal';
    modal.innerHTML = `
        <div class="calculations-content">
            <div class="calculations-header">
                <h3>💾 Fiches de Calcul Sauvegardées</h3>
                <button class="close-calculations" onclick="closeCalculationsModal()">×</button>
            </div>
            <div class="calculations-grid">
                ${savedCalculations.map(calc => {
                    const date = new Date(calc.timestamp).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    
                    // Déterminer l'image à afficher
                    let imageSrc = 'imageBoss/unit.png'; // Image par défaut
                    if (calc.characterImage && !calc.characterImage.includes('unit.png') && !calc.characterImage.includes('data:image/svg+xml')) {
                        imageSrc = calc.characterImage;
                    }
                    
                    return `
                        <div class="calculation-item" onclick="loadCalculation(${calc.id})">
                            <div class="calculation-image">
                                <img src="${escapeHtml(safeImageSrc(imageSrc))}" alt="${escapeHtml(calc.name)}" onerror="this.src='assets/images/imageBoss/unit.png'">
                            </div>
                            <div class="calculation-info">
                                <div class="calculation-name">${escapeHtml(calc.name)}</div>
                                <div class="calculation-stats">
                                    🛡️ ${formatDefenseValue(calc.defenseValue)} DEF
                                </div>
                                <div class="calculation-details">
                                    📊 Base: ${parseInt(calc.baseDef).toLocaleString()} | 👑 Leader: ${calc.leader}%
                                </div>
                                <div class="calculation-date">${date}</div>
                            </div>
                            <div class="calculation-actions">
                                <button class="btn-delete" onclick="event.stopPropagation(); deleteCalculation(${calc.id})" title="Supprimer">🗑️</button>
                                <button class="btn-duplicate" onclick="event.stopPropagation(); duplicateCalculation(${calc.id})" title="Dupliquer">📋</button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
            <div class="calculations-footer">
                <div class="footer-buttons">
                    <button onclick="importAllCalculations()" class="btn-import">📥 IMPORTER FICHES (Multiple)</button>
                    <button onclick="clearAllCalculations()" class="btn-danger">🗑️ Supprimer toutes les fiches</button>
                </div>
                <div class="calculations-count">${savedCalculations.length} fiche(s) sauvegardée(s)</div>
            </div>
        </div>
    `;
    
    // Ajouter les styles si nécessaire
    if (!document.querySelector('#calculations-styles')) {
        const styles = document.createElement('style');
        styles.id = 'calculations-styles';
        styles.textContent = `
            .calculations-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: fadeIn 0.3s ease-out;
            }
            .calculations-content {
                background: linear-gradient(135deg, #1a2035 0%, #2d3748 100%);
                border-radius: 15px;
                padding: 20px;
                max-width: 800px;
                max-height: 80vh;
                overflow-y: auto;
                border: 2px solid #ffd700;
                width: 90%;
            }
            .calculations-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                color: #ffd700;
            }
            .close-calculations {
                background: #ff6b35;
                color: white;
                border: none;
                border-radius: 50%;
                width: 30px;
                height: 30px;
                cursor: pointer;
                font-size: 20px;
                font-weight: bold;
            }
            .calculations-grid {
                display: grid;
                grid-template-columns: 1fr;
                gap: 15px;
                margin-bottom: 20px;
            }
            .calculation-item {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 10px;
                padding: 15px;
                cursor: pointer;
                transition: all 0.3s ease;
                border: 2px solid transparent;
                display: grid;
                grid-template-columns: 80px 1fr 80px; /* Plus d'espace pour les infos */
                gap: 15px;
                align-items: center;
                min-height: 100px; /* Hauteur minimum pour éviter la compression */
            }
            .calculation-item:hover {
                border-color: #ffd700;
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(255, 215, 0, 0.3);
            }
            .calculation-image img {
                width: 80px;
                height: 80px;
                object-fit: cover;
                border-radius: 8px;
                border: 2px solid #ffd700;
            }
            .calculation-info {
                color: white;
                min-width: 0; /* Permet au texte de se réduire */
                overflow: hidden; /* Cache le débordement */
            }
            .calculation-name {
                font-weight: bold;
                font-size: 1.1em;
                margin-bottom: 5px;
                color: #ffd700;
                word-wrap: break-word; /* Permet la coupure des mots longs */
                overflow-wrap: break-word;
            }
            .calculation-stats {
                font-size: 1em;
                color: #00ff88;
                margin-bottom: 3px;
                font-weight: bold;
                white-space: nowrap; /* Empêche la coupure de ligne pour les chiffres */
                overflow: hidden;
                text-overflow: ellipsis; /* Affiche ... si trop long */
            }
            .calculation-details {
                font-size: 0.9em;
                color: #ccc;
                margin-bottom: 5px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .calculation-date {
                font-size: 0.8em;
                color: #888;
            }
            .calculation-actions {
                display: flex;
                flex-direction: column;
                gap: 5px;
            }
            .btn-delete, .btn-duplicate {
                background: rgba(255, 255, 255, 0.1);
                color: white;
                border: none;
                padding: 5px 8px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.3s ease;
            }
            .btn-delete:hover {
                background: #dc3545;
            }
            .btn-duplicate:hover {
                background: #17a2b8;
            }
            .calculations-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-top: 15px;
                border-top: 1px solid rgba(255, 255, 255, 0.2);
            }
            .footer-buttons {
                display: flex;
                gap: 10px;
            }
            .btn-danger {
                background: linear-gradient(45deg, #dc3545, #c82333);
                color: white;
                border: none;
                padding: 8px 15px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 12px;
            }
            .btn-import {
                background: linear-gradient(45deg, #17a2b8, #138496);
                color: white;
                border: none;
                padding: 8px 15px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 12px;
                transition: all 0.3s ease;
            }
            .btn-import:hover {
                background: linear-gradient(45deg, #138496, #0e6674);
                transform: translateY(-1px);
            }
            .calculations-count {
                color: #ccc;
                font-size: 0.9em;
            }
            @media (max-width: 768px) {
                .calculations-content {
                    width: 95%;
                    padding: 15px;
                }
                .calculation-item {
                    grid-template-columns: 60px 1fr auto;
                    gap: 10px;
                }
                .calculation-image img {
                    width: 60px;
                    height: 60px;
                }
                .calculation-name {
                    font-size: 1em;
                }
                .calculations-footer {
                    flex-direction: column;
                    gap: 10px;
                }
                .footer-buttons {
                    flex-direction: column;
                    width: 100%;
                }
                .btn-import, .btn-danger {
                    width: 100%;
                    text-align: center;
                }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(modal);
}

// **FONCTION : CHARGER UNE FICHE**
function loadCalculation(calculationId) {
    try {
        const savedCalculations = JSON.parse(localStorage.getItem('savedCalculations') || '[]');
        const calculation = savedCalculations.find(calc => calc.id === calculationId);
        
        if (!calculation) {
            createNotification('❌ Fiche introuvable', 'La fiche sélectionnée n\'existe plus.', 'error');
            return;
        }
        
        // Charger tous les paramètres SANS déclencher les événements
        Object.keys(calculation).forEach(key => {
            if (key !== 'id' && key !== 'timestamp' && key !== 'defenseValue' && key !== 'characterImage' && key !== 'characterImageKey') {
                const element = document.getElementById(key);
                if (element) {
                    if (element.type === 'checkbox') {
                        element.checked = calculation[key];
                    } else {
                        element.value = calculation[key];
                    }
                    log(`📥 Champ restauré: ${key} = ${calculation[key]}`);
                }
            }
        });
        
        // Charger spécifiquement le nom du personnage
        const characterNameElement = document.getElementById('characterName');
        if (characterNameElement && calculation.name) {
            characterNameElement.value = calculation.name;
            // Mettre à jour le localStorage aussi
            localStorage.setItem('characterName', calculation.name);
            log(`📝 Nom restauré: ${calculation.name}`);
        }
        
        // Charger l'image si disponible
        if (calculation.characterImageKey) {
            loadImageByKey(calculation.characterImageKey);
        } else if (calculation.characterImage && !calculation.characterImage.includes('unit.png')) {
            localStorage.setItem('characterImage', calculation.characterImage);
            const imageElement = document.getElementById('characterImage');
            if (imageElement) {
                imageElement.src = calculation.characterImage;
            }
        }
        
        // FORCER le recalcul de la défense
        setTimeout(() => {
            log('🔄 FORÇAGE du recalcul après chargement de la fiche...');
            
            // Mettre à jour le dropdown de complétion d'arbre selon le type
            updateTreeCompletionOptions();
            
            const defense = calculateDefense();
            log(`🛡️ Défense recalculée: ${defense.toLocaleString()}`);
            updateThresholdAnalysis(defense);
            updateCharacterDisplay();
            updateChart();
            log('✅ Fiche chargée et FORCÉE');
        }, 200);
        
        // Fermer le modal
        closeCalculationsModal();
        
        createNotification('✅ Fiche chargée!', `La fiche "${calculation.name}" a été chargée avec succès.`, 'success');
        
        log(`📁 Fiche chargée: ${calculation.name} (ID: ${calculation.id})`);
    } catch (error) {
        console.error('❌ Erreur lors du chargement de fiche:', error);
        createNotification('❌ Erreur de chargement', 'Impossible de charger la fiche.', 'error');
    }
}

// **FONCTION : SUPPRIMER UNE FICHE**
function deleteCalculation(calculationId) {
    try {
        const savedCalculations = JSON.parse(localStorage.getItem('savedCalculations') || '[]');
        const calculationIndex = savedCalculations.findIndex(calc => calc.id === calculationId);
        
        if (calculationIndex === -1) {
            createNotification('❌ Fiche introuvable', 'La fiche à supprimer n\'existe plus.', 'error');
            return;
        }
        
        const calculationName = savedCalculations[calculationIndex].name;
        
        if (confirm(`🗑️ Êtes-vous sûr de vouloir supprimer la fiche "${calculationName}" ?`)) {
            savedCalculations.splice(calculationIndex, 1);
            localStorage.setItem('savedCalculations', JSON.stringify(savedCalculations));
            
            // Rafraîchir l'affichage
            closeCalculationsModal();
            showSavedCalculations();
            
            createNotification('✅ Fiche supprimée!', `La fiche "${calculationName}" a été supprimée.`, 'success');
            
            log(`🗑️ Fiche supprimée: ${calculationName} (ID: ${calculationId})`);
        }
    } catch (error) {
        console.error('❌ Erreur lors de la suppression de fiche:', error);
        createNotification('❌ Erreur de suppression', 'Impossible de supprimer la fiche.', 'error');
    }
}

// **FONCTION : DUPLIQUER UNE FICHE**
function duplicateCalculation(calculationId) {
    try {
        const savedCalculations = JSON.parse(localStorage.getItem('savedCalculations') || '[]');
        const calculation = savedCalculations.find(calc => calc.id === calculationId);
        
        if (!calculation) {
            createNotification('❌ Fiche introuvable', 'La fiche à dupliquer n\'existe plus.', 'error');
            return;
        }
        
        // Créer une copie avec un nouveau nom et ID
        const duplicatedCalculation = {
            ...calculation,
            id: Date.now(),
            name: `${calculation.name} (Copie)`,
            timestamp: new Date().toISOString()
        };
        
        savedCalculations.push(duplicatedCalculation);
        localStorage.setItem('savedCalculations', JSON.stringify(savedCalculations));
        
        // Rafraîchir l'affichage
        closeCalculationsModal();
        showSavedCalculations();
        
        createNotification('✅ Fiche dupliquée!', `La fiche "${duplicatedCalculation.name}" a été créée.`, 'success');
        
        log(`📋 Fiche dupliquée: ${calculation.name} → ${duplicatedCalculation.name}`);
    } catch (error) {
        console.error('❌ Erreur lors de la duplication de fiche:', error);
        createNotification('❌ Erreur de duplication', 'Impossible de dupliquer la fiche.', 'error');
    }
}

// **FONCTION : SUPPRIMER TOUTES LES FICHES**
function clearAllCalculations() {
    if (confirm('🗑️ Êtes-vous sûr de vouloir supprimer TOUTES les fiches sauvegardées ?')) {
        localStorage.removeItem('savedCalculations');
        closeCalculationsModal();
        createNotification('✅ Fiches supprimées!', 'Toutes les fiches ont été supprimées.', 'success');
        log('🗑️ Toutes les fiches ont été supprimées');
    }
}

// **FONCTION : FERMER LE MODAL DES FICHES**
function closeCalculationsModal() {
    const modal = document.querySelector('.calculations-modal');
    if (modal) {
        modal.style.animation = 'fadeIn 0.3s ease-out reverse';
        setTimeout(() => modal.remove(), 300);
    }
}

// **FONCTION DE COMPATIBILITÉ : GARDER L'ANCIENNE GALERIE D'IMAGES**
// Cette fonction maintient l'ancienne fonction pour la compatibilité
function showImageGallery() {
    // Rediriger vers le nouveau système de fiches
    showSavedCalculations();
}

// **FONCTION D'EXPORT AMÉLIORÉE POUR LES FICHES**
function exportAllCalculations() {
    try {
        const savedCalculations = JSON.parse(localStorage.getItem('savedCalculations') || '[]');
        
        if (savedCalculations.length === 0) {
            createNotification('❌ Aucune fiche', 'Aucune fiche à exporter.', 'error');
            return;
        }
        
        const exportData = {
            version: "2.0",
            exportDate: new Date().toISOString(),
            calculationsCount: savedCalculations.length,
            calculations: savedCalculations
        };
        
        const fileName = `Dokkan_Fiches_${new Date().toISOString().split('T')[0]}.json`;
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', fileName);
        linkElement.click();
        
        createNotification('✅ Fiches exportées!', `${savedCalculations.length} fiche(s) exportée(s) dans "${fileName}".`, 'success');
    } catch (error) {
        console.error('❌ Erreur lors de l\'export des fiches:', error);
        createNotification('❌ Erreur d\'export', 'Impossible d\'exporter les fiches.', 'error');
    }
}

// **FONCTION D'IMPORT POUR LES FICHES**
function importAllCalculations() {
    try {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.multiple = true; // Permettre la sélection multiple
        input.style.display = 'none';
        
        input.onchange = function(event) {
            const files = Array.from(event.target.files);
            if (files.length === 0) return;

            let totalImported = 0;
            let totalSkipped = 0;
            let filesProcessed = 0;
            const totalFiles = files.length;
            
            const existingCalculations = JSON.parse(localStorage.getItem('savedCalculations') || '[]');

            // Fonction pour traiter un fichier
            const processFile = (file, index) => {
                const reader = new FileReader();
                reader.onload = function(e) {
                    try {
                        const data = JSON.parse(e.target.result);
                        
                        // Vérifier si c'est un export de fiches multiples ou une fiche individuelle
                        let calculationsToImport = [];
                        
                        if (data.calculations && Array.isArray(data.calculations)) {
                            // Format d'export de masse
                            calculationsToImport = data.calculations;
                        } else if (data.characterName && data.defenseValue) {
                            // Format de fiche individuelle
                            calculationsToImport = [data];
                        } else {
                            console.warn(`Fichier ${file.name} ignoré: format invalide`);
                            filesProcessed++;
                            checkIfAllFilesProcessed();
                            return;
                        }
                        
                        let fileImported = 0;
                        let fileSkipped = 0;
                        
                        calculationsToImport.forEach(calc => {
                            // Vérifier si une fiche avec le même nom existe déjà
                            const exists = existingCalculations.some(existing => existing.name === calc.name || existing.name === calc.characterName);
                            
                            if (!exists) {
                                // Normaliser la fiche (format individuel vers format de collection)
                                const normalizedCalc = {
                                    id: Date.now() + Math.random() + index * 1000, // ID unique avec index
                                    name: calc.name || calc.characterName || `Fiche importée ${index + 1}`,
                                    timestamp: new Date().toISOString(),
                                    characterImage: calc.characterImage,
                                    characterImageKey: calc.characterImageKey,
                                    defenseValue: calc.defenseValue || '0',
                                    baseDef: calc.baseDef || 0,
                                    equips: calc.equips || 0,
                                    typeSelection: calc.typeSelection || 'TEC',
                                    treeCompletion: calc.treeCompletion || 0,
                                    rankS: calc.rankS || false,
                                    f2p: calc.f2p || false,
                                    leader: calc.leader || 0,
                                    base: calc.base || 0,
                                    support: calc.support || 0,
                                    links: calc.links || 0,
                                    mb1: calc.mb1 || 0,
                                    mb1Active: calc.mb1Active || false,
                                    mb2: calc.mb2 || 0,
                                    mb2Active: calc.mb2Active || false,
                                    activeSkill: calc.activeSkill || 0,
                                    asActive: calc.asActive || false,
                                    terrain: calc.terrain || 0,
                                    terrainActive: calc.terrainActive || false,
                                    item: calc.item || 0,
                                    itemActive: calc.itemActive || false,
                                    stackValue1: calc.stackValue1 || 0,
                                    stack1: calc.stack1 || 0,
                                    stackValue2: calc.stackValue2 || 0,
                                    stack2: calc.stack2 || 0,
                                    damageReduction: calc.damageReduction || 0,
                                    guardSelection: calc.guardSelection || 2,
                                    guardActive: calc.guardActive || false,
                                    typeDefense: calc.typeDefense || 0,
                                    teamHP: calc.teamHP || 850000,
                                    attackValue: calc.attackValue || 0
                                };
                                
                                existingCalculations.push(normalizedCalc);
                                fileImported++;
                            } else {
                                fileSkipped++;
                            }
                        });
                        
                        totalImported += fileImported;
                        totalSkipped += fileSkipped;
                        log(`Fichier ${file.name}: ${fileImported} importées, ${fileSkipped} ignorées`);
                        
                    } catch (parseError) {
                        console.error(`Erreur dans ${file.name}:`, parseError);
                    }
                    
                    filesProcessed++;
                    checkIfAllFilesProcessed();
                };
                
                reader.readAsText(file);
            };
            
            // Fonction pour vérifier si tous les fichiers ont été traités
            const checkIfAllFilesProcessed = () => {
                if (filesProcessed === totalFiles) {
                    // Sauvegarder toutes les fiches
                    localStorage.setItem('savedCalculations', JSON.stringify(existingCalculations));
                    
                    // Afficher le résultat final
                    const message = `📁 ${totalFiles} fichier(s) traité(s):\n${totalImported} fiche(s) importée(s).${totalSkipped > 0 ? `\n${totalSkipped} fiche(s) ignorée(s) (noms déjà existants).` : ''}`;
                    createNotification('✅ Import multiple terminé!', message, 'success');
                    
                    // Rafraîchir le modal des fiches si il est ouvert
                    if (document.querySelector('.calculations-modal')) {
                        closeCalculationsModal();
                        setTimeout(() => showSavedCalculations(), 300);
                    }
                }
            };
            
            // Traiter tous les fichiers
            files.forEach((file, index) => {
                processFile(file, index);
            });
        };
        
        document.body.appendChild(input);
        input.click();
        document.body.removeChild(input);
    } catch (error) {
        console.error('❌ Erreur lors de l\'import des fiches:', error);
        createNotification('❌ Erreur d\'import', 'Impossible d\'importer les fiches.', 'error');
    }
}

// ============================
// GESTIONNAIRE DE BOSS PERSONNALISÉS
// ============================

// Gestion de l'upload d'image de boss
function handleBossImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const bossImage = document.getElementById('bossImage');
        const bossPlaceholder = document.querySelector('.boss-placeholder');
        
        bossImage.src = e.target.result;
        bossImage.style.display = 'block';
        if (bossPlaceholder) {
            bossPlaceholder.style.display = 'none';
        }
    };
    reader.readAsDataURL(file);
}

// Ajouter un boss personnalisé
function addCustomBoss() {
    const bossName = document.getElementById('bossName').value.trim();
    const bossAttack = parseInt(document.getElementById('bossAttack').value);
    const bossImage = document.getElementById('bossImage');
    
    // Validation des données
    if (!bossName) {
        createNotification('❌ Erreur', 'Veuillez entrer le nom du boss.', 'error');
        return;
    }
    
    if (!bossAttack || bossAttack <= 0) {
        createNotification('❌ Erreur', 'Veuillez entrer une valeur d\'attaque valide.', 'error');
        return;
    }
    
    if (!bossImage.src || bossImage.style.display === 'none') {
        createNotification('❌ Erreur', 'Veuillez sélectionner une image pour le boss.', 'error');
        return;
    }
    
    // Récupérer les boss existants
    let customBosses = JSON.parse(localStorage.getItem('customBosses') || '[]');
    
    // Vérifier si le boss existe déjà
    if (customBosses.some(boss => boss.name.toLowerCase() === bossName.toLowerCase())) {
        createNotification('❌ Boss existant', 'Un boss avec ce nom existe déjà.', 'error');
        return;
    }
    
    // Créer le nouveau boss
    const newBoss = {
        id: Date.now(),
        name: bossName,
        attack: bossAttack,
        image: bossImage.src,
        dateAdded: new Date().toLocaleDateString('fr-FR')
    };
    
    // Ajouter le nouveau boss
    customBosses.push(newBoss);
    
    // Sauvegarder
    localStorage.setItem('customBosses', JSON.stringify(customBosses));
    
    // Notification de succès
    createNotification('✅ Boss ajouté !', `${bossName} a été ajouté avec succès.`, 'success');
    
    // Mettre à jour la liste globale des boss
    bosses = getAllBosses();
    
    // Effacer le formulaire
    clearBossForm();
    
    // Rafraîchir la liste
    displayCustomBosses();
    
    // Mettre à jour le graphique pour inclure le nouveau boss
    updateGraph();
}

// Effacer le formulaire de boss
function clearBossForm() {
    document.getElementById('bossName').value = '';
    document.getElementById('bossAttack').value = '';
    document.getElementById('bossImageUpload').value = '';
    
    const bossImage = document.getElementById('bossImage');
    const bossPlaceholder = document.querySelector('.boss-placeholder');
    
    bossImage.src = '';
    bossImage.style.display = 'none';
    if (bossPlaceholder) {
        bossPlaceholder.style.display = 'block';
    }
}

// Afficher la liste des boss personnalisés
function displayCustomBosses() {
    const container = document.getElementById('bossListContainer');
    // Ce conteneur n'existe que sur la page de gestion des boss : sur le
    // calculateur, il n'y a simplement rien à afficher.
    if (!container) return;

    const customBosses = JSON.parse(localStorage.getItem('customBosses') || '[]');

    if (customBosses.length === 0) {
        container.innerHTML = '<p class="no-boss-message">Aucun boss personnalisé ajouté</p>';
        return;
    }
    
    container.innerHTML = customBosses.map(boss => {
        // Les boss personnalisés viennent du localStorage : tout doit être échappé.
        // JSON.stringify + escapeHtml sécurise le passage d'arguments dans onclick.
        const safeImage = safeImageSrc(boss.image, 'imageBoss/unit.png');
        const nameArg = escapeHtml(JSON.stringify(String(boss.name ?? '')));
        const imageArg = escapeHtml(JSON.stringify(safeImage));
        const attack = Number(boss.attack) || 0;

        return `
        <div class="boss-item" data-boss-id="${escapeHtml(boss.id)}">
            <img src="assets/images/${escapeHtml(safeImage)}" alt="${escapeHtml(boss.name)}" onerror="this.src='assets/images/imageBoss/unit.png'">
            <div class="boss-item-info">
                <div class="boss-item-name">👹 ${escapeHtml(boss.name)}</div>
                <div class="boss-item-attack">⚔️ ATK: ${attack.toLocaleString()}</div>
            </div>
            <div class="boss-item-actions">
                <button class="boss-select-btn" onclick="selectCustomBoss(${nameArg}, ${attack}, ${imageArg})">
                    🎯 Sélectionner
                </button>
                <button class="boss-delete-btn" onclick="deleteCustomBoss(${Number(boss.id) || 0})">
                    🗑️ Supprimer
                </button>
            </div>
        </div>
    `;
    }).join('');
}

// Sélectionner un boss personnalisé
function selectCustomBoss(name, attack, image) {
    // Mettre à jour les valeurs PV de la team
    document.getElementById('teamHP').value = attack;
    
    // Mettre à jour le graphique pour refléter la nouvelle valeur
    updateGraph();
    
    // Notification
    createNotification('🎯 Boss sélectionné', `${name} sélectionné avec ATK: ${attack.toLocaleString()}`, 'success');
}

// Supprimer un boss personnalisé
function deleteCustomBoss(bossId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce boss ?')) {
        return;
    }
    
    let customBosses = JSON.parse(localStorage.getItem('customBosses') || '[]');
    const bossToDelete = customBosses.find(boss => boss.id === bossId);
    
    customBosses = customBosses.filter(boss => boss.id !== bossId);
    localStorage.setItem('customBosses', JSON.stringify(customBosses));
    
    // Mettre à jour la liste globale des boss
    bosses = getAllBosses();
    
    createNotification('🗑️ Boss supprimé', `${bossToDelete?.name || 'Boss'} a été supprimé.`, 'success');
    
    displayCustomBosses();
    
    // Mettre à jour le graphique
    updateGraph();
}

// Initialiser l'affichage des boss au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    // Mettre à jour la liste des boss au chargement
    bosses = getAllBosses();
    displayCustomBosses();
    
    // Debug: afficher le nombre total de boss
    log(`📊 Boss chargés: ${bosses.length} (${defaultBosses.length} par défaut + ${bosses.length - defaultBosses.length} personnalisés)`);
});

// ============================
// SYSTÈME D'AIDE
// ============================

// Contenu des aides pour chaque section
const helpContent = {
    'base-stats': {
        title: '📊 Statistiques de Base',
        content: `
            <p>Les statistiques de base sont les fondements de votre calcul de défense :</p>
            
            <div class="help-example">
                <strong>🛡️ DÉF de base :</strong> La statistique de défense de votre carte (visible dans les détails du personnage).
            </div>
            
            <div class="help-example">
                <strong>⚒️ Équipements :</strong> Les bonus de défense apportés par vos équipements (additionnés).
            </div>
            
            <div class="help-example">
                <strong>🎯 Type :</strong> Le type de votre personnage (TEC, AGI, PUI, END, INT) qui affecte les bonus d'arbre.
            </div>
            
            <p><strong>⭐ Rang S :</strong> un arbre de compétence plus puissant que sur certains personnages</p>
            <p><strong>💎 F2P :</strong> Malus de -40% sur l'arbre de compétence que pour les cartes F2P (gratuites)</p>
            
            <p>💡 <em>Astuce : Plus votre DÉF de base est élevée, plus tous les boosts multiplicatifs seront efficaces !</em></p>
        `
    },
    
    'leader-boosts': {
        title: '👑 Leader & Boosts',
        content: `
            <p>Cette section regroupe tous les boosts <strong>additionnels</strong> qui s'appliquent à votre défense :</p>
            
            <div class="help-example">
                <strong>👑 Leader :</strong> Le pourcentage de boost du leader de votre équipe (ex: +170% DÉF de base *2.7 voir 5.4 en double leader 170%)
            </div>
            
            <div class="help-example">
                <strong>🌳 Arbre :</strong> Les bonus de l'arbre de compétences selon le nombre de doublons que vous avez.
            </div>
            
            <div class="help-example">
                <strong>📈 Base :</strong> la base c'est le pourcentage de départ de votre personnage (ex 200% de base qui s'ajoute a la stats de def de votre personnage)
            </div>

            <div class="help-example">
                <strong>🤝 Support :</strong> Les boosts apportés par d'autre carte dans la rotation qu'il j'ajoute a votre base 
            </div>
            
            <div class="help-example">
                <strong>🔗 Liens :</strong> Les liens sont des bonus qui s'activent lorsque vous avez des cartes côte à côte dans la rotation, une carte généralement possède 7 liens différents et s'active en fonction des liens des autres personnages.
            </div>
            
            <p>💡 <em>Tous ces boosts s'additionnent entre eux avant d'être appliqués à votre DÉF de base.</em></p>
        `
    },
    
    'multiplicative-boosts': {
        title: '⚡ Boosts Multiplicatifs',
        content: `
            <p>Les boosts multiplicatifs sont des <strong>multiplicateurs</strong> qui s'appliquent après tous les boosts additifs(la base du personnage):</p>
            
            <div class="help-example">
                <strong>⚡ Active Skill :</strong> Le boost de l'active skill de votre personnage (si applicable)
            </div>
            
            <div class="help-example">
                <strong>⚡ Item :</strong> l'items mémoire qui ajoute un boost multiplicatif dés le début du combat
            </div>
            
            <div class="help-example">
                <strong>⚡ Boosts Mult. 1 & 2 :</strong> Autres multiplicateurs (passif du personnage, conditions, avant attaque,lors de l'attaque, etc.)
            </div>
            
            <p><strong>🔥 Particularité :</strong> Ces boosts se <em>multiplient</em> entre eux et avec votre défense totale !</p>
            
            <p><strong>Exemple :</strong> 100k DÉF × 1.5 (Active skill) × 1.5 (Item mémoire) = 225k DÉF finale</p>
        `
    },
    
    'stacks-defense': {
        title: '📈 Stacks & Défense',
        content: `
            <p>Les <strong>stacks</strong> représentent les effets cumulatifs qui peuvent s'accumuler au fil des tours apres que le personnage a attaqué:</p>
            
            <div class="help-example">
                <strong>📊 Stack 1 & 2 valeur :</strong> Le pourcentage de boost par stack (ex: +30% par stack)
            </div>
            
            <div class="help-example">
                <strong>🔢 Stack 1 & 2 nombre :</strong> Combien de stacks vous avez accumulé
            </div>
            
            <div class="help-example">
                <strong>🛡️ Réduction dégâts :</strong> Pourcentage de réduction pure des dégâts (passive, etc.)
            </div>
            
            <div class="help-example">
                <strong>🛡️ Défense type :</strong> Le niveau de défense selon votre type face à l'ennemi
            </div>
            
            <p><strong>📈 Calcul des stacks :</strong> Stack total = (Valeur × Nombre) pour chaque type</p>
            
            <p><strong>Exemple :</strong> 5 stacks à +30% = +150% de défense totale</p>
            
            <p>💡 <em>Les stacks sont très puissants dans les événements longs comme le festival de combats(mdr) !</em></p>
        `
    },
    
    'thresholds': {
        title: '📊 Analyse des Seuils Défensifs',
        content: `
            <p>Cette section affiche les <strong>seuils critiques</strong> qui déterminent votre survie en combat :</p>
            
            <div class="help-example">
                <strong>🛡️ Seuil d'Annulation :</strong> La valeur d'attaque adverse maximale où vous ne prenez <strong>aucun dégât</strong> (dégâts ≤ 150).
            </div>
            
            <div class="help-example">
                <strong>💀 Seuil de Mort :</strong> La valeur d'attaque adverse où vous mourrez en <strong>1 coup</strong> (dégâts = PV de l'équipe).
            </div>
            
            <div class="help-example">
                <strong>🎲 Variance (1.015) :</strong> Facteur aléatoire moyen appliqué aux dégâts. La valeur affichée "avec variance" correspond à l'attaque réelle multipliée par 1.015.
            </div>
            
            <p><strong>📊 Formule des dégâts :</strong></p>
            <code>Dégâts = (Attaque × 1.015 × TypeMulti × Réduction) - Défense</code>
            
            <p><strong>🔹 Avec Garde Active :</strong></p>
            <code>Dégâts = ((Attaque × 1.015 × 0.8 × Réduction × 0.8) - Défense) / 2</code>
            
            <p><strong>Exemple :</strong> Si seuil de mort = 897 759 ATT :</p>
            <ul>
                <li>Avec variance : 897 759 × 1.015 = 911 225 ATT</li>
                <li>Dégâts réels : 911 225 - 61 225 (DÉF) = 850 000 HP ☠️</li>
            </ul>
            
            <p>💡 <em>Astuce : La variance explique pourquoi le seuil ne correspond pas exactement à PV + DÉF !</em></p>
        `
    },
    
    'class-type': {
        title: '🔢 Classe & Type',
        content: `
            <p>il existe deux classes dans le jeux ,la classe Extrème et la classe super et les types on aussi des avantages et des faiblesses envers d'autres types.</p>
            <p>La relation classe/type détermine les <strong>dégâts subis</strong> selon la situation de combat :</p>
            
            <div class="help-example">
                <strong>Même classe & avantage type (-25%) :</strong> Votre type est fort contre l'ennemi
            </div>
            
            <div class="help-example">
                <strong>Classe opposée & désavantage type (+43.75%) :</strong> classe opposée et votre type est faible contre l'ennemi (full désavantage)
            </div>
            
            <div class="help-example">
                <strong>Même classe & neutre (0%) :</strong> Situation équilibrée, pas de bonus/malus
            </div>
            
            <div class="help-example">
                <strong>Même classe & désavantage (+25%) :</strong> L'ennemi a l'avantage type contre vous
            </div>
            
            <div class="help-example">
                <strong>Classe opposée :</strong> Ajoute +15% de dégâts supplémentaires subis car l'ennemi est d'une classe différente
            </div>
            
            <p><strong>🛡️ Garde passive :</strong> la garde passive et une mécanique défensive qui n'est pas impacter par les contisions de type classe/type et reduit les dégâts subis(passif, active, etc...).</p>
            
            <p><strong>🎯 Impact :</strong> Cette différence peut transformer une situation de survie en immunité complète et inversement !</p>
            
            <p>💡 <em>Vérifiez toujours le type/la classe de l'ennemi avant de choisir quelle personnage va venir défendre !</em></p>
        `
    },
    
    'team-hp': {
        title: '❤️ PV de la Team',
        content: `
            <p>Les PV de votre équipe déterminent <strong>le cumul des PV de tous les personnages qui augmentent grâce aux leader/ami leader</strong> :</p>

            <div class="help-example">
                <strong>💚 Points de vie :</strong> Les PV totaux de votre équipe (leader + ami leader)
            </div>
            
            <p><strong>🎯 Utilité :</strong> Cette valeur détermine :</p>
            <ul style="color: #e0e0e0; margin-left: 20px;">
                <li>Le <strong>seuil de mort</strong> : dégâts qui vous tuent en un coup</li>
                <li>Les zones de <strong>couleur</strong> sur le graphique</li>
                <li>La <strong>stratégie optimale</strong> contre chaque boss</li>
            </ul>
            
            <p><strong>🔍 Zones du graphique :</strong></p>
            <ul style="color: #e0e0e0; margin-left: 20px;">
                <li><span style="color: #28a745;">🟢 Vert</span> : Immunité (0-150 dégâts)</li>
                <li><span style="color: #ffc107;">🟡 Jaune</span> : Survie (151 dégâts - PV)</li>
                <li><span style="color: #dc3545;">🔴 Rouge</span> : Danger (PV+ dégâts)</li>
            </ul>
            
            <p>💡 <em>Augmentez vos PV avec des leaders appropriés !</em></p>
        `
    },
    
    'custom-boss': {
        title: '👹 Boss à Ajouter',
        content: `
            <p>Créez vos propres boss personnalisés pour tester votre défense :</p>
            
            <div class="help-example">
                <strong>📸 Image du Boss :</strong> Uploadez une image pour identifier visuellement votre boss
            </div>
            
            <div class="help-example">
                <strong>👹 Nom du Boss :</strong> Donnez un nom reconnaissable (ex: "Cell Max RedZone")
            </div>
            
            <div class="help-example">
                <strong>⚔️ ATK Boss :</strong> La valeur d'attaque du boss (trouvée sur Wiki ou en jeu)
            </div>
            
            <p><strong>🎯 Fonctionnalités :</strong></p>
            <ul style="color: #e0e0e0; margin-left: 20px;">
                <li><strong>Tri automatique</strong> : Le boss apparaît au bon endroit selon sa valeur d'ATK</li>
                <li><strong>Graphique intégré</strong> : Visible immédiatement dans la courbe des dégâts subis</li>
                <li><strong>Sauvegarde</strong> : Conservé entre les sessions</li>
                <li><strong>Sélection rapide</strong> : Utilisable pour les calculs de seuil</li>
            </ul>
            
            <div class="help-example">
                <strong>Exemple :</strong> Boss "Omega Shenron" avec 12M ATK apparaîtra juste avant Black Goku Rosé qui a 19.7M ATK
            </div>
            
            <p>💡 <em>Parfait pour mieux représenter la puissance d'un personnage !</em></p>
        `
    }
};

// Fonction pour afficher l'aide
function showHelp(section) {
    const modal = document.getElementById('helpModal');
    const helpText = document.getElementById('helpText');
    
    if (helpContent[section]) {
        const content = helpContent[section];
        helpText.innerHTML = `
            <h3>${content.title}</h3>
            ${content.content}
        `;
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Empêcher le scroll du body
    }
}

// Fonction pour fermer l'aide
function closeHelp() {
    const modal = document.getElementById('helpModal');
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Restaurer le scroll
}

// Fonction pour afficher l'Update Log
function showUpdateLog() {
    const modal = document.getElementById('updateLogModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Empêcher le scroll du body
}

// Fonction pour fermer l'Update Log
function closeUpdateLog() {
    const modal = document.getElementById('updateLogModal');
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Restaurer le scroll
}

// Mettre à jour les options de complétion d'arbre quand le type change
function updateTreeCompletionOptions() {
    const typeSelection = document.getElementById('typeSelection')?.value || 'TEC';
    const treeCompletionSelect = document.getElementById('treeCompletion');
    
    if (!treeCompletionSelect) return;
    
    // Sauvegarder l'index sélectionné
    const currentIndex = treeCompletionSelect.selectedIndex;
    
    // Vider les options actuelles
    treeCompletionSelect.innerHTML = '';
    
    // Récupérer les valeurs de l'arbre du type sélectionné
    const treeValues = trees[typeSelection] || trees['TEC'];
    
    // Ajouter les nouvelles options
    treeValues.forEach((value, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = value;
        treeCompletionSelect.appendChild(option);
    });
    
    // Restaurer l'index sélectionné si possible
    if (currentIndex >= 0 && currentIndex < treeValues.length) {
        treeCompletionSelect.selectedIndex = currentIndex;
    } else {
        treeCompletionSelect.selectedIndex = 0;
    }
    
    // Recalculer la défense après le changement
    calculateDefense();
}

// **FONCTION : MODE PLEIN ÉCRAN POUR LE GRAPHIQUE**
function toggleFullscreen() {
    const chartContainer = document.querySelector('.chart-container');
    const fullscreenBtn = document.querySelector('.fullscreen-btn');
    const fullscreenIcon = document.querySelector('.fullscreen-icon');
    
    if (!chartContainer) {
        console.error('❌ Conteneur du graphique non trouvé');
        return;
    }
    
    // Toggle la classe fullscreen
    chartContainer.classList.toggle('fullscreen');
    
    // Vérifier si on est en mode plein écran
    const isFullscreen = chartContainer.classList.contains('fullscreen');
    
    if (isFullscreen) {
        log('📺 Passage en mode plein écran');
        // Changer l'icône et le texte
        fullscreenIcon.textContent = '⤬';
        
        // Empêcher le scroll du body
        document.body.style.overflow = 'hidden';
        
        // Redimensionner le graphique après un court délai pour s'assurer que le conteneur est bien redimensionné
        setTimeout(() => {
            if (window.Plotly && document.getElementById('damageChart')) {
                Plotly.Plots.resize('damageChart');
            }
        }, 100);
    } else {
        log('🖥️ Sortie du mode plein écran');
        // Restaurer l'icône et le texte
        fullscreenIcon.textContent = '⛶';
        
        // Restaurer le scroll du body
        document.body.style.overflow = '';
        
        // Redimensionner le graphique
        setTimeout(() => {
            if (window.Plotly && document.getElementById('damageChart')) {
                Plotly.Plots.resize('damageChart');
            }
        }, 100);
    }
}

// Gestion de la touche Échap pour quitter le plein écran
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' || event.key === 'Esc') {
        const chartContainer = document.querySelector('.chart-container');
        if (chartContainer && chartContainer.classList.contains('fullscreen')) {
            toggleFullscreen();
        }
    }
});

// Fermer l'aide en cliquant sur le fond
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('helpModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeHelp();
            }
        });
    }
    
    // Fermer l'aide avec la touche Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeHelp();
        }
    });
    
    // Ajouter l'event listener sur le changement de type
    const typeSelectionElement = document.getElementById('typeSelection');
    if (typeSelectionElement) {
        typeSelectionElement.addEventListener('change', updateTreeCompletionOptions);
    }
    
    // Initialiser les options de complétion d'arbre au chargement
    updateTreeCompletionOptions();
});

// **FONCTION : AFFICHER/MASQUER L'AIDE DU GRAPHIQUE**
function toggleGraphHelp() {
    const content = document.getElementById('graphHelpContent');
    const toggle = document.getElementById('graphHelpToggle');
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        toggle.textContent = '(Cliquez pour masquer)';
    } else {
        content.style.display = 'none';
        toggle.textContent = '(Cliquez pour afficher)';
    }
}
