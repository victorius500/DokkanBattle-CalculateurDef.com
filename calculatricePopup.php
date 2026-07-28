<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Calculatrice Dokkan - Mode Flottant</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            min-height: 100vh;
            position: relative;
            overflow-y: auto;
            padding: 10px;
            margin: 0;
        }

        /* Animation des orbes d'énergie en arrière-plan */
        body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: 
                radial-gradient(circle at 20% 50%, rgba(255, 165, 0, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 215, 0, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 40% 80%, rgba(255, 140, 0, 0.08) 0%, transparent 50%);
            animation: energyFlow 20s ease-in-out infinite;
            pointer-events: none;
            z-index: -1;
        }

        @keyframes energyFlow {
            0%, 100% { 
                transform: scale(1) rotate(0deg); 
                opacity: 0.3; 
            }
            50% { 
                transform: scale(1.1) rotate(180deg); 
                opacity: 0.6; 
            }
        }

        .calculator-container {
            background: linear-gradient(145deg, rgba(30, 30, 60, 0.95), rgba(20, 20, 40, 0.95));
            border-radius: 25px;
            padding: 20px;
            box-shadow: 
                0 0 40px rgba(255, 165, 0, 0.3),
                0 0 80px rgba(255, 140, 0, 0.2),
                inset 0 0 60px rgba(255, 215, 0, 0.05);
            border: 3px solid rgba(255, 165, 0, 0.5);
            animation: glowPulse 3s ease-in-out infinite;
            width: 100%;
            max-width: 480px;
            margin: 0 auto;
            min-height: calc(100vh - 20px);
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
        }

        @keyframes glowPulse {
            0%, 100% {
                box-shadow: 
                    0 0 40px rgba(255, 165, 0, 0.3),
                    0 0 80px rgba(255, 140, 0, 0.2),
                    inset 0 0 60px rgba(255, 215, 0, 0.05);
            }
            50% {
                box-shadow: 
                    0 0 60px rgba(255, 165, 0, 0.5),
                    0 0 100px rgba(255, 140, 0, 0.3),
                    inset 0 0 80px rgba(255, 215, 0, 0.1);
            }
        }

        .calculator-header {
            text-align: center;
            margin-bottom: 15px;
        }

        .calculator-title {
            font-size: 28px;
            font-weight: bold;
            background: linear-gradient(90deg, #FFD700, #FFA500, #FF8C00);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 5px;
            letter-spacing: 2px;
            animation: titleShine 2s ease-in-out infinite;
        }

        @keyframes titleShine {
            0%, 100% { filter: brightness(1); }
            50% { filter: brightness(1.3); }
        }

        .subtitle {
            color: #FFD700;
            font-size: 12px;
            letter-spacing: 2px;
        }

        .history-container {
            background: linear-gradient(135deg, #0a0a20 0%, #1a1a35 100%);
            border: 2px solid rgba(255, 165, 0, 0.5);
            border-radius: 15px;
            padding: 10px;
            margin-bottom: 15px;
            height: 150px;
            overflow-y: auto;
            box-shadow: 
                inset 0 4px 15px rgba(0, 0, 0, 0.5),
                0 0 15px rgba(255, 165, 0, 0.2);
            flex-shrink: 0;
        }

        .history-title {
            color: #FFD700;
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 8px;
            text-align: center;
            letter-spacing: 2px;
        }

        .history-item {
            color: #FFA500;
            font-size: 12px;
            padding: 6px;
            margin: 4px 0;
            background: rgba(255, 165, 0, 0.1);
            border-radius: 8px;
            border-left: 3px solid #FFD700;
            animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateX(20px); }
            to { opacity: 1; transform: translateX(0); }
        }

        .history-container::-webkit-scrollbar {
            width: 6px;
        }

        .history-container::-webkit-scrollbar-track {
            background: rgba(255, 165, 0, 0.1);
            border-radius: 10px;
        }

        .history-container::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #FFD700, #FFA500);
            border-radius: 10px;
        }

        .display {
            background: linear-gradient(135deg, #0a0a20 0%, #1a1a35 100%);
            border: 3px solid #FFD700;
            border-radius: 15px;
            padding: 15px;
            margin-bottom: 15px;
            box-shadow: 
                inset 0 4px 20px rgba(0, 0, 0, 0.5),
                0 0 20px rgba(255, 215, 0, 0.3);
            position: relative;
            overflow: hidden;
            flex-shrink: 0;
        }

        .operation-display {
            font-size: 16px;
            color: #FFA500;
            text-align: right;
            min-height: 20px;
            margin-bottom: 8px;
            opacity: 0.8;
        }

        .display-text {
            font-size: 36px;
            color: #FFD700;
            text-align: right;
            font-weight: bold;
            text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
            min-height: 45px;
            word-break: break-all;
            letter-spacing: 2px;
        }

        .buttons-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            flex-grow: 1;
        }

        .btn {
            padding: 15px;
            font-size: 20px;
            font-weight: bold;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
        }

        .btn-number {
            background: linear-gradient(145deg, #2a4d69, #1f3a52);
            color: #fff;
            border: 2px solid #4a7c9e;
        }

        .btn-number:hover {
            background: linear-gradient(145deg, #3a5d79, #2f4a62);
            box-shadow: 0 0 20px rgba(74, 124, 158, 0.5);
            transform: translateY(-2px);
        }

        .btn-operator {
            background: linear-gradient(145deg, #FF8C00, #FF6500);
            color: #fff;
            border: 2px solid #FFD700;
        }

        .btn-operator:hover {
            background: linear-gradient(145deg, #FFA500, #FF7500);
            box-shadow: 0 0 20px rgba(255, 165, 0, 0.6);
            transform: translateY(-2px);
        }

        .btn-clear {
            background: linear-gradient(145deg, #dc2626, #b91c1c);
            color: #fff;
            grid-column: span 2;
            border: 2px solid #ff4444;
        }

        .btn-clear:hover {
            background: linear-gradient(145deg, #ef4444, #dc2626);
            box-shadow: 0 0 20px rgba(239, 68, 68, 0.6);
            transform: translateY(-2px);
        }

        .btn-equals {
            background: linear-gradient(145deg, #FFD700, #FFA500);
            color: #1a1a2e;
            grid-column: span 2;
            border: 2px solid #FFED4E;
            font-weight: 900;
        }

        .btn-equals:hover {
            background: linear-gradient(145deg, #FFED4E, #FFD700);
            box-shadow: 0 0 30px rgba(255, 215, 0, 0.8);
            transform: translateY(-2px);
        }

        .particle {
            position: fixed;
            width: 4px;
            height: 4px;
            background: #FFD700;
            border-radius: 50%;
            pointer-events: none;
            animation: particleFloat 2s ease-out forwards;
            box-shadow: 0 0 10px #FFD700;
        }

        @keyframes particleFloat {
            0% {
                transform: translateY(0) translateX(0);
                opacity: 0;
            }
            10% {
                opacity: 1;
            }
            90% {
                opacity: 1;
            }
            100% {
                transform: translateY(-100px) translateX(50px);
                opacity: 0;
            }
        }

        /* Responsive Design */
        @media (max-width: 500px) {
            body {
                padding: 5px;
            }
            
            .calculator-container {
                padding: 15px;
                min-height: calc(100vh - 10px);
            }
            
            .calculator-title {
                font-size: 24px;
            }
            
            .subtitle {
                font-size: 10px;
            }
            
            .display-text {
                font-size: 28px;
            }
            
            .operation-display {
                font-size: 14px;
            }
            
            .btn {
                padding: 12px;
                font-size: 18px;
            }
            
            .history-container {
                height: 120px;
            }
        }
        
        @media (max-height: 600px) {
            .calculator-container {
                min-height: auto;
                padding: 10px;
            }
            
            .history-container {
                height: 100px;
            }
            
            .calculator-header {
                margin-bottom: 10px;
            }
            
            .display {
                padding: 10px;
                margin-bottom: 10px;
            }
            
            .display-text {
                font-size: 28px;
            }
            
            .btn {
                padding: 10px;
                font-size: 16px;
            }
        }
    </style>
</head>
<body>
    <div class="calculator-container">
        <div class="calculator-header">
            <h1 class="calculator-title">CALCULATRICE</h1>
            <p class="subtitle">MODE FLOTTANT</p>
        </div>

        <div class="history-container" id="historyContainer">
            <div class="history-title">⚡ HISTORIQUE ⚡</div>
            <div id="history"></div>
        </div>

        <div class="display">
            <div class="operation-display" id="operationDisplay"></div>
            <div class="display-text" id="display">0</div>
        </div>

        <div class="buttons-grid">
            <button class="btn btn-clear" onclick="clearDisplay()">C</button>
            <button class="btn btn-operator" onclick="deleteLastChar()">⌫</button>
            <button class="btn btn-operator" onclick="appendOperator('/')">÷</button>

            <button class="btn btn-number" onclick="appendNumber('7')">7</button>
            <button class="btn btn-number" onclick="appendNumber('8')">8</button>
            <button class="btn btn-number" onclick="appendNumber('9')">9</button>
            <button class="btn btn-operator" onclick="appendOperator('*')">×</button>

            <button class="btn btn-number" onclick="appendNumber('4')">4</button>
            <button class="btn btn-number" onclick="appendNumber('5')">5</button>
            <button class="btn btn-number" onclick="appendNumber('6')">6</button>
            <button class="btn btn-operator" onclick="appendOperator('-')">-</button>

            <button class="btn btn-number" onclick="appendNumber('1')">1</button>
            <button class="btn btn-number" onclick="appendNumber('2')">2</button>
            <button class="btn btn-number" onclick="appendNumber('3')">3</button>
            <button class="btn btn-operator" onclick="appendOperator('+')">+</button>

            <button class="btn btn-number" onclick="appendNumber('0')">0</button>
            <button class="btn btn-number" onclick="appendNumber('.')">.</button>
            <button class="btn btn-equals" onclick="calculate()">=</button>
        </div>
    </div>

    <script src="assets/js/calcule.js"></script>
</body>
</html>
