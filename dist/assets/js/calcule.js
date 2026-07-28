        let displayValue = '0';
        let firstOperand = null;
        let operator = null;
        let waitingForSecondOperand = false;
        let history = [];

        function formatNumber(num) {
            // Formate le nombre avec des espaces comme séparateurs de milliers
            const parts = num.toString().split('.');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
            return parts.join('.');
        }

        function updateDisplay() {
            const display = document.getElementById('display');
            const operationDisplay = document.getElementById('operationDisplay');
            
            // Afficher le nombre avec des espaces
            display.textContent = formatNumber(displayValue);
            
            // Afficher l'opération en cours
            if (firstOperand !== null && operator) {
                const operatorSymbol = operator === '*' ? '×' : operator === '/' ? '÷' : operator;
                operationDisplay.textContent = formatNumber(firstOperand) + ' ' + operatorSymbol;
            } else {
                operationDisplay.textContent = '';
            }
        }

        function addToHistory(calculation, result) {
            history.unshift({ calculation, result });
            if (history.length > 10) {
                history.pop();
            }
            updateHistory();
        }

        function updateHistory() {
            const historyElement = document.getElementById('history');
            historyElement.innerHTML = '';
            
            history.forEach(item => {
                const historyItem = document.createElement('div');
                historyItem.className = 'history-item';
                historyItem.textContent = item.calculation + ' = ' + formatNumber(item.result);
                historyElement.appendChild(historyItem);
            });
        }

        function appendNumber(number) {
            if (waitingForSecondOperand) {
                displayValue = number;
                waitingForSecondOperand = false;
            } else {
                displayValue = displayValue === '0' ? number : displayValue + number;
            }
            updateDisplay();
            createParticles();
        }

        function appendOperator(nextOperator) {
            const inputValue = parseFloat(displayValue.replace(/\s/g, ''));

            if (firstOperand === null) {
                firstOperand = inputValue;
            } else if (operator) {
                const result = performCalculation();
                displayValue = String(result);
                firstOperand = result;
            }

            waitingForSecondOperand = true;
            operator = nextOperator;
            updateDisplay();
            createParticles();
        }

        function performCalculation() {
            const inputValue = parseFloat(displayValue.replace(/\s/g, ''));

            if (operator === '+') {
                return firstOperand + inputValue;
            } else if (operator === '-') {
                return firstOperand - inputValue;
            } else if (operator === '*') {
                return firstOperand * inputValue;
            } else if (operator === '/') {
                return firstOperand / inputValue;
            }

            return inputValue;
        }

        function calculate() {
            if (operator && !waitingForSecondOperand) {
                const secondOperand = parseFloat(displayValue.replace(/\s/g, ''));
                const operatorSymbol = operator === '*' ? '×' : operator === '/' ? '÷' : operator;
                const calculation = formatNumber(firstOperand) + ' ' + operatorSymbol + ' ' + formatNumber(secondOperand);
                
                const result = performCalculation();
                displayValue = String(result);
                
                // Ajouter à l'historique
                addToHistory(calculation, result);
                
                firstOperand = null;
                operator = null;
                waitingForSecondOperand = false;
                updateDisplay();
                createBurstParticles();
            }
        }

        function clearDisplay() {
            displayValue = '0';
            firstOperand = null;
            operator = null;
            waitingForSecondOperand = false;
            updateDisplay();
            createParticles();
        }

        function deleteLastChar() {
            displayValue = displayValue.replace(/\s/g, '');
            if (displayValue.length > 1) {
                displayValue = displayValue.slice(0, -1);
            } else {
                displayValue = '0';
            }
            updateDisplay();
        }

        // Effet de particules
        function createParticles() {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * window.innerWidth + 'px';
            particle.style.top = Math.random() * window.innerHeight + 'px';
            document.body.appendChild(particle);

            setTimeout(() => {
                particle.remove();
            }, 2000);
        }

        function createBurstParticles() {
            for (let i = 0; i < 15; i++) {
                setTimeout(() => createParticles(), i * 50);
            }
        }

        // Support du clavier
        document.addEventListener('keydown', (event) => {
            const key = event.key;

            if (key >= '0' && key <= '9' || key === '.') {
                appendNumber(key);
            } else if (key === '+' || key === '-' || key === '*' || key === '/') {
                appendOperator(key);
            } else if (key === 'Enter' || key === '=') {
                event.preventDefault();
                calculate();
            } else if (key === 'Escape' || key === 'c' || key === 'C') {
                clearDisplay();
            } else if (key === 'Backspace') {
                event.preventDefault();
                deleteLastChar();
            }
        });

        // Animation initiale
        window.addEventListener('load', () => {
            createBurstParticles();
        });