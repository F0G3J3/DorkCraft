document.addEventListener('DOMContentLoaded', () => {
    const searchEngineRadios = document.querySelectorAll('input[name="searchEngine"]');
    const keywordsInput = document.getElementById('keywords');
    const operatorCheckboxes = document.querySelectorAll('.operator-checkboxes input[type="checkbox"]');
    const operatorInputsContainer = document.getElementById('operatorInputs');
    const dorkOutput = document.getElementById('dorkOutput');
    const copyDorkBtn = document.getElementById('copyDorkBtn');
    const searchDorkBtn = document.getElementById('searchDorkBtn');

    const operatorInputMap = {}; // To store references to dynamically created input fields

    // Base URLs for search engines
    const searchEngineUrls = {
        google: 'https://www.google.com/search?q=',
        bing: 'https://www.bing.com/search?q=',
        duckduckgo: 'https://duckduckgo.com/?q=',
        yandex: 'https://yandex.com/search/?text='
    };

    let selectedSearchEngine = 'google';

    // --- Functions ---

    function generateDork() {
        let dork = '';
        let currentKeywords = keywordsInput.value.trim();

        // Add main keywords
        if (currentKeywords) {
            dork += currentKeywords;
        }

        // Add operator terms
        operatorCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const operator = checkbox.dataset.operator;
                const inputElement = operatorInputMap[operator];
                if (inputElement && inputElement.value.trim()) {
                    // Handle filetype: special case (can have OR logic)
                    if (operator === 'filetype') {
                        const filetypes = inputElement.value.trim().split(/\s*\|\s*/).map(ft => ft.trim()).filter(ft => ft !== '');
                        if (filetypes.length > 0) {
                            dork += ` ${operator}:${filetypes.join(' | filetype:')}`;
                        }
                    } else if (operator === 'site' || operator === 'inurl' || operator === 'intitle' || operator === 'intext') {
                        // Handle operators that can have OR logic
                        const terms = inputElement.value.trim().split(/\s*\|\s*/).map(term => term.trim()).filter(term => term !== '');
                        if (terms.length > 0) {
                            dork += ` ${operator}:${terms.join(` | ${operator}:`)}`;
                        }
                    }
                    else {
                        dork += ` ${operator}:${inputElement.value.trim()}`;
                    }
                }
            }
        });

        dorkOutput.value = dork.trim();
        updateSearchLink(dork.trim());
    }

    function updateSearchLink(dork) {
        const encodedDork = encodeURIComponent(dork);
        searchDorkBtn.href = `${searchEngineUrls[selectedSearchEngine]}${encodedDork}`;
        if (!dork) {
            searchDorkBtn.style.display = 'none'; // Hide if no dork is generated
        } else {
            searchDorkBtn.style.display = 'inline-flex';
        }
    }

    function createOperatorInputField(operatorName, placeholder) {
        const row = document.createElement('div');
        row.className = 'operator-input-row';
        row.dataset.operator = operatorName; // To easily identify the row

        const label = document.createElement('label');
        label.textContent = `${operatorName}:`;
        row.appendChild(label);

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = placeholder || `Enter value for ${operatorName}`;
        input.id = `input-${operatorName}`;
        input.addEventListener('input', generateDork); // Update dork on input change
        row.appendChild(input);

        // Add to map for easy access
        operatorInputMap[operatorName] = input;

        operatorInputsContainer.appendChild(row);
    }

    function removeOperatorInputField(operatorName) {
        const rowToRemove = operatorInputsContainer.querySelector(`.operator-input-row[data-operator="${operatorName}"]`);
        if (rowToRemove) {
            rowToRemove.remove();
            delete operatorInputMap[operatorName]; // Remove from map
        }
    }

    // --- Event Listeners ---

    // Listen for search engine changes
    searchEngineRadios.forEach(radio => {
        radio.addEventListener('change', (event) => {
            selectedSearchEngine = event.target.value;
            generateDork(); // Regenerate dork with new search engine URL
        });
    });

    // Listen for keyword input changes
    keywordsInput.addEventListener('input', generateDork);

    // Listen for operator checkbox changes
    operatorCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (event) => {
            const operator = event.target.dataset.operator;
            const placeholder = event.target.dataset.placeholder;
            if (event.target.checked) {
                createOperatorInputField(operator, placeholder);
            } else {
                removeOperatorInputField(operator);
            }
            generateDork(); // Regenerate dork after adding/removing operator input
        });
    });

    // Copy Dork to clipboard
    copyDorkBtn.addEventListener('click', () => {
        dorkOutput.select();
        document.execCommand('copy');
        // Provide feedback to the user
        const originalText = copyDorkBtn.innerHTML;
        copyDorkBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
            copyDorkBtn.innerHTML = originalText;
        }, 2000);
    });

    // Initial generation on page load
    generateDork();
});
