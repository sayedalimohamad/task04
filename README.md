
## app_analyze.py

`app_analyze.py` is a Python script designed to analyze text documents stored in a MongoDB collection. It performs sentiment analysis and named entity recognition (NER) on the text data and updates the documents with the analysis results.

### Features

- Connects to a MongoDB database and retrieves documents.
- Uses Stanza for tokenization and named entity recognition (NER) in Arabic.
- Uses NLTK's VADER for sentiment analysis.
- Processes documents concurrently using ThreadPoolExecutor.
- Updates MongoDB documents with sentiment and entity data.

### Requirements

- Python 3.6+
- MongoDB
- Required Python packages (listed in `requirements.txt`)

### Installation

1. Clone the repository:

```
git clone https://github.com/sayedalimohamad/task04.git
```

2. Install the required Python packages:

```
pip install -r requirements.txt
```

3. Ensure MongoDB is running and accessible at `mongodb://localhost:27017/`.

### Usage

1. Ensure the required NLTK data is downloaded:

```
python -m nltk.downloader vader_lexicon
```

2. Run the script:

```
python app_analyze.py
```

### Configuration

MongoDB connection details are hardcoded in the script. Modify the connection string if your MongoDB instance is running on a different host or port.

### Functions

- `ensure_model_downloaded(lang_code)`: Ensures that the Stanza model for the specified language is downloaded.
- `safe_decode(text)`: Safely decodes text using ftfy to fix any encoding issues.
- `process_document(document, idx)`: Processes a single document:
    - Decodes the text.
    - Performs sentiment analysis.
    - Performs named entity recognition (NER).
    - Updates the document in MongoDB with the analysis results.
- `analyze_texts()`: Fetches documents from MongoDB and processes them concurrently.

### Logging

Errors and important events are logged using Python's logging module.

### Example Output

The script prints the results of the analysis to the console.

