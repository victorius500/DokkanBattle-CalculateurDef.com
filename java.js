// Dokkan Battle Defense Calculator - JavaScript Functions
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
const bosses = [
    { name: "� Vegeta Blue", attack: 4440000, image: "imageBoss/vegeta_blue.png" },
    { name: "� Goku Blue", attack: 4560000, image: "imageBoss/goku_blue.png" },
    { name: "👹 Piccolo Daimaô", attack: 4800000, image: "imageBoss/daimao.png" },
    { name: "� Jiren", attack: 5740000, image: "imageBoss/jiren.png" },
    { name: "🦋 Cell Max", attack: 6562500, image: "imageBoss/cell_max.png" },
    { name: "⚔️ Trunks SoH", attack: 7700000, image: "imageBoss/trunks.png" },
    { name: "🔥 Gogeta SSJ4", attack: 9360000, image: "imageBoss/gogeta_ssj4.png" },
    { name: "👾 Black goku Rosé", attack: 19687500, image: "imageBoss/black_goku_rose.png" }
];

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

// **FONCTION PRINCIPALE : CALCUL DE LA DÉFENSE**
function calculateDefense() {
    try {
        console.log('🔧 Calcul de la défense en cours...');
        
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
        const item = parseInt(document.getElementById('item').value) || 0;
        const itemActive = document.getElementById('itemActive').checked;
        const stackValue1 = parseInt(document.getElementById('stackValue1').value) || 0;
        const stack1 = parseInt(document.getElementById('stack1').value) || 0;
        const stackValue2 = parseInt(document.getElementById('stackValue2').value) || 0;
        const stack2 = parseInt(document.getElementById('stack2').value) || 0;

        console.log(`📊 Valeurs de base: DEF=${baseDef}, Équips=${equips}, Type=${typeSelection}`);

        // Calcul de la complétion de l'arbre
        let treeCompletion = trees[typeSelection][treeCompletionIndex];
        if (rankS) treeCompletion = Math.floor(treeCompletion * 1.4);
        if (f2p) treeCompletion = Math.floor(treeCompletion * 0.6);

        console.log(`🌳 Arbre: ${treeCompletion} (base: ${trees[typeSelection][treeCompletionIndex]}, RankS: ${rankS}, F2P: ${f2p})`);

        // Calcul de la défense selon la formule
        const defense = Math.floor(
            (baseDef + equips + treeCompletion) *
            (1 + leader * 2 / 100) *
            (1 + base / 100 + support / 100) *
            (1 + item / 100 * (itemActive ? 1 : 0)) *
            (1 + activeSkill / 100 * (asActive ? 1 : 0)) *
            (1 + links / 100) *
            (1 + mb1 / 100 * (mb1Active ? 1 : 0) + mb2 / 100 * (mb2Active ? 1 : 0)) *
            (1 + stackValue1 / 100 * stack1 + stackValue2 / 100 * stack2)
        );

        console.log(`🛡️ DÉFENSE CALCULÉE: ${defense.toLocaleString()}`);

        // **MISE À JOUR DE L'AFFICHAGE**
        const defenseElement = document.getElementById('defenseValue');
        if (defenseElement) {
            defenseElement.textContent = defense.toLocaleString();
            console.log('✅ Affichage de la défense mis à jour');
        } else {
            console.error('❌ Élément defenseValue introuvable');
        }
        
        // **FORCER LA MISE À JOUR IMMÉDIATE DE TOUS LES ÉLÉMENTS**
        // Utiliser requestAnimationFrame pour s'assurer que le DOM est mis à jour
        requestAnimationFrame(() => {
            console.log('🔄 Mise à jour forcée de tous les éléments...');
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
        console.log('📊 Mise à jour de l\'analyse de seuils...');
        updateCharacterSummary(defenseValue);
        calculateThresholds(defenseValue);
        generateRecommendations();
        console.log('✅ Analyse de seuils mise à jour');
    } catch (error) {
        console.error('❌ Erreur dans updateThresholdAnalysis:', error);
    }
}

function updateCharacterSummary(defenseValue = null) {
    const defense = defenseValue || parseInt(document.getElementById('defenseValue').textContent.replace(/,/g, '')) || 0;
    const damageReduction = parseInt(document.getElementById('damageReduction')?.value) || 0;
    const typeSituation = getTypeSituation();
    
    console.log(`📊 Mise à jour résumé: DEF=${defense.toLocaleString()}, Réduction=${damageReduction}%`);
    
    const summaryDefenseEl = document.getElementById('summaryDefense');
    const summaryReductionEl = document.getElementById('summaryReduction');
    const summarySituationEl = document.getElementById('summarySituation');
    
    if (summaryDefenseEl) {
        summaryDefenseEl.textContent = defense.toLocaleString();
        console.log(`✅ Défense mise à jour dans résumé: ${defense.toLocaleString()}`);
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
        
        console.log(`🔍 Calcul seuils: DEF=${defense.toLocaleString()}, Réduction=${damageReduction}%, Guard Selection=${guardSelection}, Garde Active=${guardActive}`);
        
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
        
        // Si garde passive activée, on reste sur du neutre (multiplicateur = 1.0)
        if (guardActive) {
            classTypeMultiplier = 1.0;
            console.log(`🛡️ Garde passive activée: multiplicateur forcé à neutre (1.0) pour les seuils`);
        } else {
            // Sinon appliquer le multiplicateur selon la situation sélectionnée
            if (guardSelection >= 0 && guardSelection < classTypeMultipliers.length) {
                classTypeMultiplier = classTypeMultipliers[guardSelection].multiplier;
                console.log(`⚔️ Situation "${classTypeMultipliers[guardSelection].description}": multiplicateur ${classTypeMultiplier} pour les seuils`);
            }
        }
        
        const reductionMultiplier = (1 - damageReduction / 100); // 70% réduction = 0.3
        
        // **CALCUL DES SEUILS SELON LA FORMULE CORRECTE avec multiplicateurs classe & type**
        // Récupérer les PV de la team
        const teamHP = parseInt(document.getElementById('teamHP')?.value) || 850000;
        console.log(`❤️ PV de la team: ${teamHP.toLocaleString()}`);
        
        let immunityThreshold, deathThreshold;
        
        if (guardActive) {
            // Avec garde activée: ((attaque * classe_type * réduction * 0.8) - défense) / 2 ≤ 150
            // Résolution: attaque = ((150 * 2) + défense) / (classe_type * réduction * 0.8)
            immunityThreshold = ((150 * 2) + defense) / (classTypeMultiplier * reductionMultiplier * 0.8);
            
            // Pour le seuil de mort: ((attaque * classe_type * réduction * 0.8) - défense) / 2 = teamHP
            // Résolution: attaque = ((teamHP * 2) + défense) / (classe_type * réduction * 0.8)
            deathThreshold = ((teamHP * 2) + defense) / (classTypeMultiplier * reductionMultiplier * 0.8);
        } else {
            // Sans garde: (attaque * classe_type * réduction) - défense ≤ 150
            // Résolution: attaque = (150 + défense) / (classe_type * réduction)
            immunityThreshold = (150 + defense) / (classTypeMultiplier * reductionMultiplier);
            
            // Pour le seuil de mort: (attaque * classe_type * réduction) - défense = teamHP
            // Résolution: attaque = (teamHP + défense) / (classe_type * réduction)
            deathThreshold = (teamHP + defense) / (classTypeMultiplier * reductionMultiplier);
        }
        
        console.log(`📊 Calcul seuils détaillé:`);
        console.log(`   Multiplicateur Classe/Type: ${classTypeMultiplier}`);
        console.log(`   Multiplicateur Réduction: ${reductionMultiplier}`);
        console.log(`   Garde activée: ${guardActive}`);
        console.log(`   Situation sélectionnée: ${guardSelection} (${classTypeMultipliers[guardSelection]?.description || 'inconnue'})`);
        console.log(`   Formule immunité: ${guardActive ? '((150 * 2) + défense) / (classe_type * réduction * 0.8)' : '(150 + défense) / (classe_type * réduction)'}`);
        console.log(`   Formule mort: ${guardActive ? '((teamHP * 2) + défense) / (classe_type * réduction * 0.8)' : '(teamHP + défense) / (classe_type * réduction)'}`);
        console.log(`   Calcul immunité: ${guardActive ? `((150 * 2) + ${defense}) / (${classTypeMultiplier} * ${reductionMultiplier} * 0.8) = ${immunityThreshold}` : `(150 + ${defense}) / (${classTypeMultiplier} * ${reductionMultiplier}) = ${immunityThreshold}`}`);
        console.log(`   Calcul mort: ${guardActive ? `((${teamHP} * 2) + ${defense}) / (${classTypeMultiplier} * ${reductionMultiplier} * 0.8) = ${deathThreshold}` : `(${teamHP} + ${defense}) / (${classTypeMultiplier} * ${reductionMultiplier}) = ${deathThreshold}`}`);
        // Affichage des seuils
        const immunityEl = document.getElementById('immunityThreshold');
        const deathEl = document.getElementById('deathThreshold');
        
        if (immunityEl) {
            immunityEl.textContent = Math.round(immunityThreshold).toLocaleString() + ' ATT';
        }
        if (deathEl) {
            deathEl.textContent = Math.round(deathThreshold).toLocaleString() + ' ATT';
        }
        
        console.log(`📊 Seuils: Immunité=${Math.round(immunityThreshold).toLocaleString()}, Mort=${Math.round(deathThreshold).toLocaleString()}`);
        
        // **VÉRIFICATION DES CALCULS**
        console.log(`🔍 Vérification immunité à ${Math.round(immunityThreshold).toLocaleString()}:`);
        const verifyImmunity = calculateBattleDamage(immunityThreshold, defense, damageReduction, guardSelection, guardActive, typeDefense);
        console.log(`   Dégâts calculés: ${verifyImmunity}`);
        
        console.log(`🔍 Vérification mort à ${Math.round(deathThreshold).toLocaleString()}:`);
        const verifyDeath = calculateBattleDamage(deathThreshold, defense, damageReduction, guardSelection, guardActive, typeDefense);
        console.log(`   Dégâts calculés: ${verifyDeath}`);
        
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
        console.log('📈 Génération du graphique de courbe de dégâts...');
        
        // Calculer la plage de valeurs d'attaque à analyser
        // Inclure tous les boss dans la plage
        const allBossAttacks = bosses.map(boss => boss.attack);
        const minBossAttack = Math.min(...allBossAttacks);
        const maxBossAttack = Math.max(...allBossAttacks);
        
        const minAttack = Math.max(0, Math.min(immunityThreshold - (immunityThreshold * 0.1), minBossAttack - 500000));
        const maxAttack = Math.max(deathThreshold + (deathThreshold * 0.1), maxBossAttack + 500000);
        const step = (maxAttack - minAttack) / 100; // 100 points de données
        
        // Générer les données de la courbe
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
        
        // Créer le graphique avec Plotly
        const trace = {
            x: attackValues,
            y: damageValues,
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Dégâts encaissés',
            line: {
                color: '#007bff',
                width: 3
            },
            marker: {
                color: colors,
                size: 6,
                line: {
                    color: '#ffffff',
                    width: 1
                }
            },
            hovertemplate: '<b>Attaque:</b> %{x:,.0f}<br><b>Dégâts:</b> %{y:,.0f}<extra></extra>'
        };
        
        // Ajouter les lignes de seuils
        const immunityLine = {
            x: [minAttack, maxAttack],
            y: [150, 150],
            type: 'scatter',
            mode: 'lines',
            name: 'Seuil d\'immunité',
            line: {
                color: '#28a745',
                width: 2,
                dash: 'dash'
            },
            hovertemplate: '<b>Seuil d\'immunité:</b> 150 dégâts<extra></extra>'
        };
        
        const deathLine = {
            x: [minAttack, maxAttack],
            y: [teamHP, teamHP],
            type: 'scatter',
            mode: 'lines',
            name: `Seuil de mort (${teamHP.toLocaleString()} HP)`,
            line: {
                color: '#dc3545',
                width: 2,
                dash: 'dash'
            },
            hovertemplate: `<b>Seuil de mort:</b> ${teamHP.toLocaleString()} dégâts<extra></extra>`
        };
        
        // Ajouter des marqueurs verticaux pour les seuils
        const immunityMarker = {
            x: [immunityThreshold, immunityThreshold],
            y: [0, Math.max(...damageValues)],
            type: 'scatter',
            mode: 'lines',
            name: `Immunité (${Math.round(immunityThreshold).toLocaleString()} ATT)`,
            line: {
                color: '#28a745',
                width: 3,
                dash: 'dot'
            },
            hovertemplate: `<b>Seuil immunité:</b> ${Math.round(immunityThreshold).toLocaleString()} ATT<extra></extra>`
        };
        
        const deathMarker = {
            x: [deathThreshold, deathThreshold],
            y: [0, Math.max(...damageValues)],
            type: 'scatter',
            mode: 'lines',
            name: `Mort (${Math.round(deathThreshold).toLocaleString()} ATT)`,
            line: {
                color: '#dc3545',
                width: 3,
                dash: 'dot'
            },
            hovertemplate: `<b>Seuil mort:</b> ${Math.round(deathThreshold).toLocaleString()} ATT<extra></extra>`
        };
        
        // Créer les traces pour les boss avec des marqueurs spéciaux
        const bossAttacks = [];
        const bossDamages = [];
        const bossNames = [];
        const bossColors = [];
        const bossAnnotations = [];
        
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
                let statusText = 'Immunité';
                
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
                    <img src="${boss.image}" alt="${cleanName}" onerror="this.src='imageBoss/unit.png'">
                    <div class="boss-name">${cleanName}</div>
                    <div class="boss-stats">
                        ${(boss.attack / 1000000).toFixed(1)}M ATT<br>
                        ${Math.round(damage).toLocaleString()} DMG<br>
                        <small style="color: #666;">${situationText}${guardText}</small><br>
                        <strong style="color: ${color};">${statusText}</strong>
                    </div>
                    <div class="boss-arrow ${statusClass}"></div>
                `;
                
                bossImagesContainer.appendChild(bossImageItem);
                
                // Créer une annotation textuelle avec flèche sur le graphique
                bossAnnotations.push({
                    x: boss.attack,
                    y: damage,
                    text: `<b>${cleanName}</b><br>${Math.round(damage).toLocaleString()} DMG`,
                    showarrow: true,
                    arrowhead: 2,
                    arrowsize: 1.2,
                    arrowwidth: 2,
                    arrowcolor: color,
                    ax: 0,
                    ay: -50,
                    bgcolor: 'rgba(255,255,255,0.9)',
                    bordercolor: color,
                    borderwidth: 1,
                    font: {
                        size: 10,
                        color: '#333',
                        family: 'Arial, sans-serif'
                    },
                    xanchor: 'center',
                    yanchor: 'bottom'
                });
            });
        }
        
        // Créer une trace séparée pour les boss sur le graphique
        const bossTrace = {
            x: bossAttacks,
            y: bossDamages,
            type: 'scatter',
            mode: 'markers',
            name: 'Boss',
            marker: {
                color: bossColors,
                size: 15,
                line: {
                    color: '#ffffff',
                    width: 3
                },
                symbol: 'diamond'
            },
            hovertemplate: '<b>%{text}</b><br><b>Attaque:</b> %{x:,.0f}<br><b>Dégâts:</b> %{y:,.0f}<extra></extra>',
            text: bossNames
        };
        
        const layout = {
            title: {
                text: 'Courbe de Progression des Dégâts Subis',
                font: { size: 18, color: '#333' }
            },
            xaxis: {
                title: 'Valeur d\'Attaque Adverse',
                tickformat: ',.0f',
                gridcolor: '#eee'
            },
            yaxis: {
                title: 'Dégâts Encaissés',
                tickformat: ',.0f',
                gridcolor: '#eee'
            },
            plot_bgcolor: '#fafafa',
            paper_bgcolor: '#ffffff',
            hovermode: 'closest',
            showlegend: true,
            legend: {
                x: 0.02,
                y: 0.98,
                bgcolor: 'rgba(255,255,255,0.8)',
                bordercolor: '#ccc',
                borderwidth: 1
            },
            annotations: bossAnnotations
        };
        
        const config = {
            responsive: true,
            displayModeBar: true,
            modeBarButtonsToRemove: ['lasso2d', 'select2d', 'autoScale2d'],
            displaylogo: false,
            scrollZoom: true,
            doubleClick: 'reset+autosize'
        };
        
        // Afficher le graphique
        Plotly.newPlot('damageChart', [trace, immunityLine, deathLine, immunityMarker, deathMarker, bossTrace], layout, config);
        
        console.log('✅ Graphique de courbe de dégâts généré avec succès');
    } catch (error) {
        console.error('❌ Erreur dans generateDamageCurveChart:', error);
    }
}

function calculateBattleDamage(attack, defense, damageReduction, guardSelection, guardActive, typeDefense) {
    try {
        console.log(`🔍 Calcul dégâts: ATT=${attack.toLocaleString()}, DEF=${defense.toLocaleString()}, Réduction=${damageReduction}%, Garde=${guardActive}, Situation=${guardSelection}`);
        
        // **APPLIQUER LES MULTIPLICATEURS CLASSE & TYPE selon le README**
        // Récupérer le multiplicateur selon la situation
        let classTypeMultiplier = 1.0;
        
        // Si garde passive activée, on reste sur du neutre (multiplicateur = 1.0)
        if (guardActive) {
            classTypeMultiplier = 1.0;
            console.log(`🛡️ Garde passive activée: multiplicateur neutre (1.0)`);
        } else {
            // Sinon appliquer le multiplicateur selon la situation sélectionnée
            if (guardSelection >= 0 && guardSelection < classTypeMultipliers.length) {
                classTypeMultiplier = classTypeMultipliers[guardSelection].multiplier;
                console.log(`⚔️ Situation "${classTypeMultipliers[guardSelection].description}": multiplicateur ${classTypeMultiplier}`);
            }
        }
        
        // Seulement la réduction de dégâts de base
        const reductionMultiplier = (1 - damageReduction / 100); // 70% réduction = 0.3
        
        console.log(`📊 Multiplicateurs: Classe/Type=${classTypeMultiplier}, Réduction=${reductionMultiplier}`);
        
        let damage;
        
        if (guardActive) {
            // **CALCUL AVEC GARDE ACTIVÉE (selon calcul.txt)**
            // Formule: ((attaque * classe_type * réduction * 0.8) - défense) / 2
            let step1 = attack * classTypeMultiplier * reductionMultiplier * 0.8;
            console.log(`🛡️ Étape 1 garde: ${attack.toLocaleString()} * ${classTypeMultiplier} * ${reductionMultiplier} * 0.8 = ${step1.toLocaleString()}`);
            
            // Étape 2: Soustraire la défense
            let step2 = step1 - defense;
            console.log(`🛡️ Étape 2: ${step1.toLocaleString()} - ${defense.toLocaleString()} = ${step2.toLocaleString()}`);
            
            // Étape 3: Diviser par 2 (deuxième étape garde)
            damage = step2 / 2;
            console.log(`🛡️ Étape 3: ${step2.toLocaleString()} / 2 = ${damage.toLocaleString()}`);
        } else {
            // **CALCUL SANS GARDE ACTIVÉE**
            // Formule: (attaque * classe_type * réduction) - défense
            damage = (attack * classTypeMultiplier * reductionMultiplier) - defense;
            console.log(`⚔️ Sans garde: (${attack.toLocaleString()} * ${classTypeMultiplier} * ${reductionMultiplier}) - ${defense.toLocaleString()} = ${damage.toLocaleString()}`);
        }
        
        // Dégâts minimum (<=150 devient 0)
        if (damage <= 150) {
            console.log(`🛡️ Dégâts ≤ 150, immunité totale!`);
            return 0;
        }

        const finalDamage = Math.max(0, Math.floor(damage));
        console.log(`🎯 RÉSULTAT FINAL: ${finalDamage.toLocaleString()}`);
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
            console.log('🔄 Défense non calculée, recalcul en cours...');
            calculateDefense();
        }
        
        const defense = parseInt(defenseElement.textContent.replace(/,/g, '')) || 0;
        const damageReduction = parseInt(document.getElementById('damageReduction')?.value) || 0;
        const guardSelection = parseInt(document.getElementById('guardSelection')?.value) || 2;
        const guardActive = document.getElementById('guardActive')?.checked || false;
        const typeDefense = parseInt(document.getElementById('typeDefense')?.value) || 5;

        console.log(`💥 Calcul dégâts: ATT=${attackValue.toLocaleString()}, DEF=${defense.toLocaleString()}`);

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
    // Cette fonction sera implémentée selon vos besoins de graphique
    isUpdating = true;
    
    try {
        // Logique de mise à jour du graphique ici
        console.log('📈 Mise à jour du graphique...');
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
        
        console.log(`🔧 Interface mise à jour: DEF=${defense.toLocaleString()}, Réduction=${damageReduction}%`);
        
        // Si un boss est sélectionné, recalculer
        if (selectedBoss) {
            showBattleResult();
        }
    } catch (error) {
        console.error('❌ Erreur dans updateCharacterDisplay:', error);
    }
}

// **FONCTION : GESTION DES IMAGES**
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageElement = document.getElementById('characterImage');
            if (imageElement) {
                imageElement.src = e.target.result;
                localStorage.setItem('characterImage', e.target.result);
            }
        };
        reader.readAsDataURL(file);
    }
}

// **FONCTION : DEBOUNCE POUR ÉVITER LES CALCULS TROP FRÉQUENTS**
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
            characterName: document.getElementById('characterName').value
        };

        localStorage.setItem('dokkanDefenseConfig', JSON.stringify(config));
        
        // Animation de confirmation
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = '✅ SAUVEGARDÉ!';
        btn.style.background = 'linear-gradient(45deg, #28a745, #20c997)';
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
        }, 2000);
    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde:', error);
    }
}

function loadConfiguration() {
    try {
        const config = localStorage.getItem('dokkanDefenseConfig');
        if (config) {
            const data = JSON.parse(config);
            
            // Charger toutes les valeurs
            Object.keys(data).forEach(key => {
                const element = document.getElementById(key);
                if (element) {
                    if (element.type === 'checkbox') {
                        element.checked = data[key];
                    } else {
                        element.value = data[key];
                    }
                }
            });
            
            // Recalculer après chargement
            calculateDefense();
            
            // Animation de confirmation
            const btn = event.target;
            const originalText = btn.textContent;
            btn.textContent = '✅ CHARGÉ!';
            btn.style.background = 'linear-gradient(45deg, #17a2b8, #6c757d)';
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = '';
            }, 2000);
        } else {
            alert('❌ Aucune configuration sauvegardée trouvée.');
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
        console.log('🚀 Début de l\'export de configuration...');
        
        // Collecter toutes les données de configuration avec vérifications
        const config = {
            characterName: document.getElementById('characterName')?.value || 'Personnage',
            characterImage: localStorage.getItem('characterImage'), // Inclure l'image si elle existe
            defenseValue: document.getElementById('defenseValue')?.textContent || '0',
            timestamp: new Date().toISOString(),
            version: "1.0",
            
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

        console.log('📊 Configuration collectée:', config);

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

        // Animation de confirmation sur le bouton d'export
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

        console.log(`📄 Configuration exportée: ${fileName}`);
    } catch (error) {
        console.error('❌ Erreur lors de l\'export:', error);
        alert('❌ Erreur lors de l\'export du fichier!');
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
                        alert('❌ Fichier invalide! Ce n\'est pas une configuration Dokkan Battle valide.');
                        return;
                    }

                    // Charger l'image si elle existe
                    if (config.characterImage) {
                        localStorage.setItem('characterImage', config.characterImage);
                        const imageElement = document.getElementById('characterImage');
                        if (imageElement) {
                            imageElement.src = config.characterImage;
                        }
                    }

                    // Charger toutes les valeurs dans les champs
                    Object.keys(config).forEach(key => {
                        const element = document.getElementById(key);
                        if (element && key !== 'characterImage' && key !== 'defenseValue' && key !== 'timestamp' && key !== 'version') {
                            if (element.type === 'checkbox') {
                                element.checked = config[key];
                            } else {
                                element.value = config[key];
                            }
                        }
                    });

                    // Sauvegarder l'image et le nom
                    if (config.characterName) {
                        localStorage.setItem('characterName', config.characterName);
                    }

                    // Recalculer la défense après import
                    calculateDefense();

                    // Animation de confirmation
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

                    console.log(`📄 Configuration importée: ${config.characterName} (${config.timestamp})`);
                    alert(`✅ Configuration "${config.characterName}" importée avec succès!`);
                } catch (parseError) {
                    console.error('❌ Erreur lors du parsing JSON:', parseError);
                    alert('❌ Fichier corrompu ou format invalide!');
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
        alert('❌ Erreur lors de l\'import du fichier!');
    }
}

// **FONCTION DE PARTAGE**
function shareConfiguration() {
    try {
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

        // Créer un lien partageable (encoder en base64)
        const configString = JSON.stringify(config);
        const encodedConfig = btoa(configString);
        const shareUrl = `${window.location.origin}${window.location.pathname}?config=${encodedConfig}`;

        // Copier dans le presse-papier
        navigator.clipboard.writeText(shareUrl).then(() => {
            // Animation de confirmation
            const btn = event.target;
            const originalText = btn.textContent;
            btn.textContent = '✅ LIEN COPIÉ!';
            btn.style.background = 'linear-gradient(45deg, #007bff, #0056b3)';
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = '';
            }, 2000);

            alert('🔗 Lien de partage copié dans le presse-papier!\nVous pouvez maintenant le partager avec d\'autres joueurs.');
        }).catch(err => {
            // Fallback si clipboard API n'est pas disponible
            prompt('🔗 Copiez ce lien pour partager votre configuration:', shareUrl);
        });

        console.log(`🔗 Configuration partagée: ${shareUrl}`);
    } catch (error) {
        console.error('❌ Erreur lors du partage:', error);
        alert('❌ Erreur lors de la création du lien de partage!');
    }
}

// **INITIALISATION AU CHARGEMENT DE LA PAGE**
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initialisation du calculateur Dokkan Battle...');
    
    // Vérifier s'il y a une configuration partagée dans l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const sharedConfig = urlParams.get('config');
    
    if (sharedConfig) {
        try {
            // Décoder la configuration partagée
            const configString = atob(sharedConfig);
            const config = JSON.parse(configString);
            
            // Charger la configuration partagée
            Object.keys(config).forEach(key => {
                const element = document.getElementById(key);
                if (element && key !== 'defenseValue') {
                    if (element.type === 'checkbox') {
                        element.checked = config[key];
                    } else {
                        element.value = config[key];
                    }
                }
            });
            
            // Recalculer après chargement
            setTimeout(() => {
                calculateDefense();
                alert(`✅ Configuration "${config.characterName}" chargée depuis le lien partagé!`);
            }, 100);
            
            console.log(`🔗 Configuration partagée chargée: ${config.characterName}`);
        } catch (error) {
            console.error('❌ Erreur lors du chargement de la configuration partagée:', error);
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
    
    // Créer des versions debounced pour éviter les calculs trop fréquents
    const debouncedCalculateDefense = debounce(() => {
        calculateDefense();
    }, 300);
    
    const debouncedCalculateDamage = debounce(() => {
        calculateDamage();
    }, 300);
    
    // Ajouter des événements pour recalculer automatiquement
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        // Événements pour tous les inputs qui affectent la défense
        if (input.id !== 'attackValue' && input.id !== 'damageResult') {
            input.addEventListener('input', function() {
                console.log(`🔄 Input changé: ${input.id} = ${input.value || input.checked}`);
                debouncedCalculateDefense();
            });
            
            input.addEventListener('change', function() {
                console.log(`🔄 Change déclenché: ${input.id} = ${input.value || input.checked}`);
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
            console.log(`🔄 Situation classe & type changée: ${this.value}`);
            debouncedCalculateDefense();
        });
    }
    
    if (guardActiveEl) {
        guardActiveEl.addEventListener('change', function() {
            console.log(`🔄 Garde passive changée: ${this.checked}`);
            debouncedCalculateDefense();
        });
    }

    // Événement pour les PV de la team
    const teamHPEl = document.getElementById('teamHP');
    if (teamHPEl) {
        teamHPEl.addEventListener('input', function() {
            console.log(`❤️ PV modifiés: ${this.value}`);
            calculateDefense(); // Recalcule tout y compris les seuils
        });
        teamHPEl.addEventListener('change', function() {
            calculateDefense();
        });
    }

    // Calcul initial avec un délai pour s'assurer que tout est chargé
    setTimeout(() => {
        console.log('⚡ Lancement du calcul initial...');
        calculateDefense();
        console.log('✅ Initialisation terminée');
    }, 200);
})