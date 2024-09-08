from flask import Flask, jsonify
from pymongo import MongoClient
from transformers import pipeline, BertTokenizer
from bson import ObjectId

app = Flask(__name__)

# MongoDB connection setup
client = MongoClient("mongodb://localhost:27017/")
db = client["almayadeen"]
collection = db["articles"]

# Load pre-trained models and tokenizer (note: models are not fully fine-tuned)
try:
    sentiment_model = pipeline('sentiment-analysis', model="asafaya/bert-base-arabic", tokenizer="asafaya/bert-base-arabic")
    ner_model = pipeline('ner', model="asafaya/bert-base-arabic", tokenizer="asafaya/bert-base-arabic")
    tokenizer = BertTokenizer.from_pretrained("asafaya/bert-base-arabic")
    print("Models and tokenizer loaded successfully.")
except Exception as e:
    print(f"Error loading models: {str(e)}")

@app.route('/analyze', methods=['GET'])
def analyze_texts():
    results = []
    
    # Fetch all documents from MongoDB
    documents = collection.find({})

    for document in documents:
        try:
            text = document.get("full_text", "")
            text = text.encode('utf-8', 'ignore').decode('utf-8')  # Handle encoding

            # Ensure full_text exists and is non-empty
            if not text:
                print(f"Document {document.get('_id')} skipped due to missing or empty full_text.")
                continue

            doc_id = document.get("_id")
            print(f"Processing document with ID: {doc_id}")  # Debug statement

            # Truncate text if necessary (BERT models typically handle up to 512 tokens)
            max_length = 512
            if len(text) > max_length:
                text = text[:max_length]

            # Perform Sentiment Analysis
            try:
                sentiment = sentiment_model(text)
                if sentiment:
                    sentiment = sentiment[0]  # Get the first result if there's more than one
                else:
                    sentiment = {}
            except Exception as e:
                print(f"Error in sentiment analysis for document {doc_id}: {str(e)}")
                sentiment = {}

            print(f"Sentiment analysis result: {sentiment}")  # Debug statement

            # Perform Named Entity Recognition (NER)
            try:
                ner_results = ner_model(text)
                if not ner_results:
                    ner_results = []
            except Exception as e:
                print(f"Error in NER analysis for document {doc_id}: {str(e)}")
                ner_results = []

            print(f"NER results: {ner_results}")  # Debug statement

            # Extract entities
            entities = []
            for entity in ner_results:
                entities.append({
                    "word": entity.get('word', ''),
                    "entity": entity.get('entity', ''),
                    "start": entity.get('start', 0),
                    "end": entity.get('end', 0)
                })

            # Prepare data to update the document in MongoDB
            update_data = {
                "sentiment": sentiment,
                "entities": entities
            }

            # Update the document in MongoDB
            try:
                update_result = collection.update_one(
                    {"_id": doc_id},  # doc_id is already an ObjectId
                    {"$set": update_data}  # Update only sentiment and entities fields
                )

                if update_result.modified_count > 0:
                    print(f"Update result: {update_result.modified_count} document(s) updated.")  # Debug statement

                    # Append to results for response (optional)
                    results.append({
                        "post_id": document.get("post_id"),
                        "sentiment": sentiment,
                        "entities": entities
                    })
                else:
                    print(f"No updates made for document {doc_id}.")

            except Exception as e:
                print(f"Error updating document {doc_id}: {str(e)}")

        except Exception as e:
            print(f"Error processing document {document.get('_id', 'unknown')}: {str(e)}")

    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True)