from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_babel import Babel, gettext
import os
import logging
from werkzeug.utils import secure_filename
import csv

app = Flask(__name__)
babel = Babel(app)

# Set up logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'csv'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/')
def index():
    return render_template('index.html')

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upload', methods=['POST'])
def upload_file():
    logging.debug("Upload file request received")
    if 'file' not in request.files:
        logging.error("No file part in the request")
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        logging.error("No selected file")
        return jsonify({'error': 'No selected file'}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        logging.info(f"File saved: {file_path}")
        
        try:
            fields = parse_csv(file_path)
            logging.info(f"CSV parsed successfully: {fields}")
            return jsonify({'fields': fields}), 200
        except Exception as e:
            logging.error(f"Error parsing CSV: {str(e)}")
            return jsonify({'error': 'Failed to parse CSV file'}), 500
    logging.error("Invalid file type")
    return jsonify({'error': 'Invalid file type'}), 400

def parse_csv(file_path):
    logging.info(f"Starting to parse CSV file: {file_path}")
    fields = []
    current_field = None
    with open(file_path, 'r') as csvfile:
        reader = csv.reader(csvfile)
        for row_index, row in enumerate(reader, start=1):
            logging.debug(f"Processing row {row_index}: {row}")
            if row and row[0].startswith('**') and row[0].endswith('**'):
                field_name = row[0].strip('**').strip()
                logging.info(f"Found new field: {field_name}")
                if current_field:
                    logging.debug(f"Appending previous field: {current_field}")
                    fields.append(current_field)
                current_field = {'name': field_name, 'values': []}
            elif current_field:
                values = [value.strip() for value in row if value.strip()]
                logging.debug(f"Adding values to current field: {values}")
                current_field['values'].extend(values)
            else:
                logging.warning(f"Skipping row {row_index}: No current field defined")
    
    if current_field:
        logging.debug(f"Appending last field: {current_field}")
        fields.append(current_field)
    
    logging.info(f"Finished parsing CSV. Total fields found: {len(fields)}")
    logging.info(f"Final parsed fields: {fields}")
    return fields

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
