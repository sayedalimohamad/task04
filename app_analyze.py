from flask import Flask, jsonify
from pymongo import MongoClient
import logging
import stanza
import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer

# Download necessary NLTK resources for sentiment analysis
nltk.download('vader_lexicon')

# Function to check if the model is already installed
def ensure_model_downloaded(lang_code):
    try:
        # Attempt to create a pipeline to check if the model is downloaded
        stanza.Pipeline(lang=lang_code, processors='tokenize')
        print(f"Model for language '{lang_code}' is already downloaded.")
    except Exception as e:
        # If the model is not found, download it
        print(f"Model for language '{lang_code}' not found. Downloading...")
        stanza.download(lang_code)

# Ensure the Arabic model is downloaded
ensure_model_downloaded('ar')

# Initialize the Arabic NLP pipeline for named entity recognition
nlp = stanza.Pipeline(lang='ar', processors='tokenize,ner')

# Initialize the sentiment analyzer
sia = SentimentIntensityAnalyzer()

# Setup logging
# uncomment the following line to log errors to a file
# logging.basicConfig(level=logging.ERROR, filename="encoding_errors.log")

app = Flask(__name__)

# MongoDB connection setup with error handling
try:
    client = MongoClient("mongodb://localhost:27017/")
    db = client["almayadeen"]
    collection = db["articles"]
except Exception as e:
    logging.error(f"MongoDB connection error: {str(e)}")
    raise

def safe_decode(text):
    """Attempt to fix and decode text into UTF-8 safely."""
    try:
        # Fix text encoding issues
        return fix_text(text)
    except Exception as e:
        # Log the error with document ID for further inspection
        logging.error(f"Error decoding text: {str(e)}. Text: {text[:100]}")  # Log only first 100 chars
        return text  # Return the text as is to avoid complete failure

@app.route('/analyze', methods=['GET'])
def analyze_texts():
    results = []

    # Fetch all documents from MongoDB
    try:
        documents = collection.find({})
    except Exception as e:
        logging.error(f"Error fetching documents from MongoDB: {str(e)}")
        return jsonify({"error": "Failed to fetch documents"}), 500

    for document in documents:
        try:
            text = document.get("full_text", "")
            text = safe_decode(str(text))  # Safely decode text with error logging
    
            if not text:
                print(f"Document {document.get('_id')} skipped due to missing or empty full_text.")
                continue
    
            doc_id = document.get("_id")
            print(f"Processing document with ID: {doc_id}")
    
            # Perform sentiment analysis using VADER
            sentiment_scores = sia.polarity_scores(text)
            sentiment = {
                'label': 'POSITIVE' if sentiment_scores['compound'] > 0 else 'NEGATIVE' if sentiment_scores['compound'] < 0 else 'NEUTRAL',
                'score': sentiment_scores['compound']
            }

            # NER using Stanza
            doc = nlp(text)
            entities = []
            for sentence in doc.sentences:
                for entity in sentence.ents:
                    entities.append({
                        "word": entity.text,
                        "entity": entity.type,
                        "start": entity.start_char,
                        "end": entity.end_char
                    })
    
            update_data = {
                "sentiment": sentiment,
                "entities": entities
            }
    
            try:
                update_result = collection.update_one(
                    {"_id": doc_id},
                    {"$set": update_data}
                )
    
                if update_result.modified_count > 0:
                    print(f"Update result: {update_result.modified_count} document(s) updated.")
                    results.append({
                        "post_id": document.get("post_id"),
                        "sentiment": sentiment,
                        "entities": entities
                    })
                else:
                    print(f"No updates made for document {doc_id}.")
            except Exception as e:
                logging.error(f"Error updating document {doc_id}: {str(e)}")
    
        except Exception as e:
            logging.error(f"Error processing document {document.get('_id', 'unknown')}: {str(e)}")

    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True)