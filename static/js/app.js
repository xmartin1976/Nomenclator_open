document.addEventListener('DOMContentLoaded', function() {
    const addFieldBtn = document.getElementById('add-field');
    const generateBtn = document.getElementById('generate');
    const fieldsContainer = document.getElementById('fields-container');
    const nomenclaturesContainer = document.getElementById('nomenclatures');
    const languageSelector = document.getElementById('language');
    const loadFieldsBtn = document.getElementById('load-fields');

    if (addFieldBtn) {
        addFieldBtn.addEventListener('click', addField);
    }
    generateBtn.addEventListener('click', generateNomenclature);
    languageSelector.addEventListener('change', changeLanguage);
    loadFieldsBtn.addEventListener('click', loadFields);

    function addField() {
        const fieldDiv = document.createElement('div');
        fieldDiv.className = 'field-container mb-3';
        fieldDiv.innerHTML = `
            <label for="field-name" class="form-label">${gettext('Field Name')}</label>
            <input type="text" class="form-control field-name" required>
            <label for="field-values" class="form-label">${gettext('Field Values')}</label>
            <select class="form-select field-values" required>
                <option value="" selected disabled>${gettext('Select a value')}</option>
            </select>
            <button class="btn btn-secondary add-value mt-2">${gettext('Add Value')}</button>
            <button class="btn btn-danger remove-field mt-2">${gettext('Remove Field')}</button>
        `;
        fieldsContainer.appendChild(fieldDiv);

        const removeButton = fieldDiv.querySelector('.remove-field');
        if (removeButton) {
            removeButton.addEventListener('click', function() {
                fieldsContainer.removeChild(fieldDiv);
            });
        }

        const addValueButton = fieldDiv.querySelector('.add-value');
        if (addValueButton) {
            console.log('Adding event listener to Add Value button');
            addValueButton.addEventListener('click', function() {
                addValueToField(fieldDiv);
            });
        }
    }

    function addValueToField(fieldDiv) {
        console.log('addValueToField called');
        console.log('fieldDiv:', fieldDiv);

        const select = fieldDiv.querySelector('.field-values');
        console.log('Select element before:', select.innerHTML);

        const newValue = prompt(gettext('Enter a new value:'));
        console.log('Prompt result:', newValue);

        if (newValue && newValue.trim() !== '') {
            const option = document.createElement('option');
            option.value = newValue.trim();
            option.textContent = newValue.trim();
            select.appendChild(option);
            select.value = newValue.trim();
            console.log('New option added:', option);
            console.log('Select element after:', select.innerHTML);
        } else {
            console.log('No value entered or empty value');
        }
    }

    function generateNomenclature() {
        const fields = document.querySelectorAll('.field-container');
        const separator = document.getElementById('separator').value;
        let nomenclatures = [''];

        fields.forEach(field => {
            const fieldName = field.querySelector('.field-name').value;
            const selectedValue = field.querySelector('.field-values').value;

            if (fieldName && selectedValue) {
                nomenclatures = nomenclatures.map(n => `${n}${n ? separator : ''}${selectedValue}`);
            }
        });

        nomenclaturesContainer.innerHTML = '';
        nomenclatures.forEach(n => {
            const div = document.createElement('div');
            div.className = 'nomenclature-item';
            div.textContent = n;
            const copyButton = document.createElement('button');
            copyButton.textContent = gettext('Copy');
            copyButton.className = 'btn btn-sm btn-outline-secondary copy-btn';
            copyButton.addEventListener('click', () => {
                navigator.clipboard.writeText(n).then(() => {
                    copyButton.textContent = 'Copied!';
                    setTimeout(() => {
                        copyButton.textContent = gettext('Copy');
                    }, 2000);
                });
            });
            div.appendChild(copyButton);
            nomenclaturesContainer.appendChild(div);
        });
    }

    function changeLanguage() {
        const lang = languageSelector.value;
        document.documentElement.lang = lang;
        // Here you would typically reload the page or update the UI with new translations
    }

    function loadFields() {
        const fileInput = document.getElementById('file-upload');
        const file = fileInput.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('file', file);

            fetch('/upload', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.fields) {
                    populateFields(data.fields);
                } else {
                    console.error('Error loading fields:', data.error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        } else {
            console.error('No file selected');
        }
    }

    function populateFields(fields) {
        fieldsContainer.innerHTML = '';
        fields.forEach(field => {
            const fieldDiv = document.createElement('div');
            fieldDiv.className = 'field-container mb-3';
            fieldDiv.innerHTML = `
                <label for="field-name" class="form-label">${gettext('Field Name')}</label>
                <input type="text" class="form-control field-name" value="${field.name}" required>
                <label for="field-values" class="form-label">${gettext('Field Values')}</label>
                <select class="form-select field-values" required>
                    <option value="" selected disabled>${gettext('Select a value')}</option>
                    ${field.values.map(value => `<option value="${value}">${value}</option>`).join('')}
                </select>
                <button class="btn btn-secondary add-value mt-2">${gettext('Add Value')}</button>
                <button class="btn btn-danger remove-field mt-2">${gettext('Remove Field')}</button>
            `;
            fieldsContainer.appendChild(fieldDiv);

            const removeButton = fieldDiv.querySelector('.remove-field');
            if (removeButton) {
                removeButton.addEventListener('click', function() {
                    fieldsContainer.removeChild(fieldDiv);
                });
            }

            const addValueButton = fieldDiv.querySelector('.add-value');
            if (addValueButton) {
                console.log('Adding event listener to Add Value button in populated field');
                addValueButton.addEventListener('click', function() {
                    addValueToField(fieldDiv);
                });
            }
        });
    }
});

function gettext(text) {
    // This is a placeholder for the actual gettext function
    // In a real application, this would be provided by a translation library
    return text;
}
