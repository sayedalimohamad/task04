from pymongo import MongoClient
import logging
import stanza
import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from ftfy import fix_text 
nltk.download('vader_lexicon')
def ensure_model_downloaded(lang_code):
    try:
        stanza.Pipeline(lang=lang_code, processors='tokenize')
        print(f"Model for language '{lang_code}' is already downloaded.")
    except Exception as e:
        print(f"Model for language '{lang_code}' not found. Downloading...")
        stanza.download(lang_code)
ensure_model_downloaded('ar')
nlp = stanza.Pipeline(lang='ar', processors='tokenize,ner')
sia = SentimentIntensityAnalyzer()
# uncomment the following line to log errors to a file
# logging.basicConfig(level=logging.ERROR, filename="encoding_errors.log")
try:
    client = MongoClient("mongodb://localhost:27017/")
    db = client["almayadeen"]
    collection = db["articles"]
except Exception as e:
    logging.error(f"MongoDB connection error: {str(e)}")
    raise
def safe_decode(text):
    try:
        return fix_text(text)
    except Exception as e:
        logging.error(f"Error decoding text: {str(e)}. Text: {text[:100]}")  
        return text  
def analyze_texts():
    results = []
    try:
        documents = collection.find({})
    except Exception as e:
        logging.error(f"Error fetching documents from MongoDB: {str(e)}")
        return {"error": "Failed to fetch documents"}
    for idx, document in enumerate(documents, start=1):
        try:
            text = document.get("full_text", "")
            text = safe_decode(str(text))  
            if not text:
                print(f"Document {document.get('_id')} skipped due to missing or empty full_text.")
                continue
            if "sentiment" in document and "entities" in document:
                print(f"Document {document.get('_id')} already has sentiment and entities. Skipping update.")
                continue
            doc_id = document.get("_id")
            print(f"Processing document {idx} with ID: {doc_id}")
            sentiment_scores = sia.polarity_scores(text)
            sentiment = {
                'label': 'POSITIVE' if sentiment_scores['compound'] > 0 else 'NEGATIVE' if sentiment_scores['compound'] < 0 else 'NEUTRAL',
                'score': sentiment_scores['compound']
            }
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
    return results
if __name__ == '__main__':
    results = analyze_texts()
    print(results)