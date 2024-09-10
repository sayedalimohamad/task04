from flask import Flask, jsonify
from pymongo import MongoClient
from ftfy import fix_text
from camel_tools.tokenizers.word import simple_word_tokenize
from camel_tools.ner import NERecognizer
import logging

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

# Initialize CAMeL NER model
try:
    ner_model = NERecognizer.pretrained()
    print("CAMeL NER model loaded successfully.")
except Exception as e:
    logging.error(f"Error loading CAMeL NER model: {str(e)}")
    ner_model = None  # Fallback in case the NER model fails to load

# Arabic lexicon for basic sentiment analysis
positive_words = [
    'جيد', 'رائع', 'ممتاز', 'جميل', 'سعيد', 'مميز', 'متفائل', 'مبتهج', 'مبهر', 'مذهل',
    'عظيم', 'مشرق', 'مبدع', 'فريد', 'مستمتع', 'لطيف', 'حيوي', 'مبتكر', 'مبادر', 'موهوب',
    'سعيد', 'إيجابي', 'دافئ', 'صادق', 'نقي', 'ملهم', 'قوي', 'مرحب', 'مرح', 'طموح',
    'مرن', 'جذاب', 'تفاعلي', 'محترف', 'طموح', 'بديع', 'مفعم', 'شريف', 'تقدمي', 'أصيل',
    'مثقف', 'ناجح', 'مستقل', 'حيوي', 'أنيق', 'ملهم', 'منفتح', 'مبتسم', 'مفعم بالحيوية', 
    'مستعد', 'مستقر', 'إبداعي', 'إيجابي', 'مبتهج', 'مشرق', 'رائع', 'مبادر', 'مستمتع',
    'قوي', 'شجاع', 'مميز', 'مؤثر', 'متجدد', 'إيجابي', 'مبادر', 'مستقل', 'ملهم', 'مؤثر',
    'محفز', 'مبادر', 'مفعم', 'مشرق', 'شجاع', 'ناجح', 'إيجابي', 'مفكر', 'متميز', 'أصيل',
    'طموح', 'مبهر', 'داعم', 'مبدع', 'شريف', 'مستعد', 'مبتهج', 'مستقر', 'مرن', 'مؤثر',
    'أنيق', 'مستمتع', 'مبتسم', 'متجدد', 'ملهم', 'مبادر', 'مميز', 'متفائل', 'مثير', 'سعيد',
    'رائع', 'مبدع', 'قوي', 'مفعم', 'ناجح', 'مستقل', 'محترف', 'مبهر', 'مستقر', 'إيجابي',
    'ملهم', 'شجاع', 'مبادر', 'مستعد', 'طموح', 'مبتهج', 'مشرق', 'مبدع', 'مميز', 'سعيد',
    'ملهم', 'شريف', 'مستمتع', 'مبهر', 'قوي', 'مبادر', 'مستقل', 'متميز', 'إبداعي', 'مستقر',
    'مرن', 'شجاع', 'ملهم', 'مبتهج', 'مستعد', 'مبادر', 'ناجح', 'طموح', 'رائع', 'مميز',
    'قوي', 'مبهر', 'مستقل', 'مبدع', 'شريف', 'مستمتع', 'ملهم', 'مبتهج', 'مشرق', 'مثير',
    'مستقر', 'سعيد', 'مبادر', 'مبهر', 'مبدع', 'طموح', 'مستعد', 'متميز', 'مبتهج', 'شجاع',
    'مستقل', 'مبدع', 'مبهر', 'ملهم', 'مستعد', 'مستمتع', 'مبادر', 'سعيد', 'شريف', 'قوي',
    'مميز', 'إبداعي', 'مبتهج', 'مستقل', 'مبادر', 'طموح', 'رائع', 'مستعد', 'مثير', 'ناجح',
    'متميز', 'مبهر', 'مستقل', 'ملهم', 'مبتهج', 'شجاع', 'مستمتع', 'مبادر', 'مشرق', 'إيجابي'
]

negative_words = [
    'سيء', 'كريه', 'حزين', 'بشع', 'سيئة', 'مزعج', 'مؤلم', 'ممل', 'سئم', 'غير ملائم',
    'سلبي', 'كئيب', 'مؤسف', 'مقرف', 'مخيب', 'محبط', 'مربك', 'مخيف', 'محزن', 'مزعج',
    'مقرف', 'غير مرغوب', 'سلبي', 'مؤلم', 'قبيح', 'مخيب', 'مزعج', 'سلبي', 'غير ملائم',
    'محبط', 'كئيب', 'مؤسف', 'غير مرغوب', 'مزعج', 'حزين', 'محزن', 'مخيب', 'مؤلم', 'مقرف',
    'سلبي', 'سيء', 'مزعج', 'كئيب', 'غير ملائم', 'مؤسف', 'مزعج', 'مؤلم', 'مخيب', 'محبط',
    'مؤسف', 'محزن', 'قبيح', 'سلبي', 'مزعج', 'كئيب', 'غير مرغوب', 'مؤلم', 'مقرف', 'سيء',
    'محبط', 'مؤسف', 'مزعج', 'غير ملائم', 'مقرف', 'حزين', 'مؤلم', 'سلبي', 'مخيب', 'مزعج',
    'كئيب', 'مؤسف', 'مخيف', 'غير مرغوب', 'مقرف', 'مزعج', 'محبط', 'سيء', 'سلبي', 'كئيب',
    'محزن', 'مزعج', 'مؤلم', 'محبط', 'قبيح', 'مؤسف', 'مخيب', 'غير مرغوب', 'سيء', 'مزعج',
    'مؤلم', 'مخيف', 'مزعج', 'محزن', 'سلبي', 'محبط', 'مقرف', 'سيء', 'كئيب', 'غير ملائم',
    'محزن', 'مزعج', 'مؤلم', 'مقرف', 'سيء', 'مخيب', 'كئيب', 'مؤسف', 'سلبي', 'مزعج'
]

def basic_sentiment_analysis(text):
    """Simple lexicon-based sentiment analysis."""
    tokens = simple_word_tokenize(text)
    score = 0
    for word in tokens:
        if word in positive_words:
            score += 1
        elif word in negative_words:
            score -= 1
    if score > 0:
        return {'label': 'POSITIVE', 'score': score}
    elif score < 0:
        return {'label': 'NEGATIVE', 'score': score}
    else:
        return {'label': 'NEUTRAL', 'score': score}

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
    
            # Simple lexicon-based sentiment analysis
            sentiment = basic_sentiment_analysis(text)

            # NER using CAMeL model
            if ner_model:
                tokenized_text = simple_word_tokenize(text)
                ner_results = ner_model.predict_sentence(tokenized_text)
            else:
                ner_results = []  # Fallback if NER model failed to load

            entities = []
            for entity in ner_results:
                entities.append({
                    "word": entity.get('word', ''),
                    "entity": entity.get('entity', ''),
                    "start": entity.get('start', 0),
                    "end": entity.get('end', 0)
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

