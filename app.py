from flask import Flask, jsonify, request, Response, render_template
from pymongo import MongoClient
import datetime, json
from bson import ObjectId


app = Flask(__name__)


client = MongoClient("mongodb://localhost:27017/")
db = client["almayadeen"]
collection = db["articles"]

@app.errorhandler(404)
def error_404(error):
    return render_template("404.html"), 404

@app.route("/", methods=["GET"])
def home():
    routes = [str(rule) for rule in app.url_map.iter_rules()]
    return render_template("index.html", routes=routes), 200


@app.route("/gui.html", methods=["GET"])
def gui_page():
    return render_template("gui.html"), 200

@app.route("/advanced.html", methods=["GET"])
def advanced_page():
    return render_template("advanced.html"), 200

@app.route("/top_keywords", methods=["GET"])
def top_keywords():
    pipeline = [
        {"$unwind": "$keywords"},
        {"$group": {"_id": "$keywords", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    result = list(collection.aggregate(pipeline))
    json_result = json.dumps(result, ensure_ascii=False, indent=4)
    return Response(json_result, content_type="application/json; charset=utf-8"), 200



@app.route("/top_authors", methods=["GET"])
def top_authors():
    pipeline = [
        {"$group": {"_id": "$author", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 20},
    ]
    result = list(collection.aggregate(pipeline))
    json_result = json.dumps(result, ensure_ascii=False, indent=4)
    return Response(json_result, content_type="application/json; charset=utf-8"), 200



@app.route("/all_authors", methods=["GET"])
def all_authors():
    pipeline = [
        {"$group": {"_id": "$author", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    result = list(collection.aggregate(pipeline))
    json_result = json.dumps(result, ensure_ascii=False, indent=4)
    return Response(json_result, content_type="application/json; charset=utf-8"), 200



@app.route("/articles_by_date", methods=["GET"])
def articles_by_date():
    pipeline = [
        {
            "$group": {
                "_id": {
                    "$dateToString": {
                        "format": "%Y-%m-%d",
                        "date": {"$toDate": "$published_time"},
                    }
                },
                "count": {"$sum": 1},
            }
        },
        {"$sort": {"_id": -1}},
    ]
    result = list(collection.aggregate(pipeline))
    json_result = json.dumps(result, ensure_ascii=False, indent=4)
    return Response(json_result, content_type="application/json; charset=utf-8"), 200



@app.route("/articles_by_word_count", methods=["GET"])
def articles_by_word_count():
    pipeline = [
        {"$group": {"_id": "$word_count", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 100},
    ]
    result = list(collection.aggregate(pipeline))
    json_result = json.dumps(result, ensure_ascii=False, indent=4)
    return Response(json_result, content_type="application/json; charset=utf-8"), 200



@app.route("/articles_by_language", methods=["GET"])
def articles_by_language():
    pipeline = [
        {"$group": {"_id": "$lang", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    result = list(collection.aggregate(pipeline))
    json_result = json.dumps(result, ensure_ascii=False, indent=4)
    return Response(json_result, content_type="application/json; charset=utf-8"), 200



@app.route("/articles_by_classes", methods=["GET"])
def articles_by_classes():
    pipeline = [
        {"$group": {"_id": "$classes", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    result = list(collection.aggregate(pipeline))
    json_result = json.dumps(result, ensure_ascii=False, indent=4)
    return Response(json_result, content_type="application/json; charset=utf-8"), 200



@app.route("/recent_articles", methods=["GET"])
def recent_articles():
    pipeline = [
        {"$project": {"_id": 0, "title": 1, "last_updated": 1, "url": 1,"description": 1,"thumbnail": 1, "author": 1}},
        {"$sort": {"last_updated": -1}},
        {"$limit": 20},
    ]
    result = list(collection.aggregate(pipeline))

    for doc in result:
        if "_id" in doc and isinstance(doc["_id"], ObjectId):
            doc["_id"] = str(doc["_id"])

    json_result = json.dumps(result, ensure_ascii=False, indent=4)
    return Response(json_result, content_type="application/json; charset=utf-8"), 200



@app.route("/articles_by_keyword/<keyword>", methods=["GET"])
def articles_by_keyword(keyword):
    
    pipeline_keyword_count = [
        {
            "$match": {
                "$or": [
                    {"title": {"$regex": keyword, "$options": "i"}},
                    {"description": {"$regex": keyword, "$options": "i"}},
                ]
            }
        },
        {"$count": "keywordCount"},
    ]

    
    pipeline_total_count = [{"$count": "totalSize"}]

    
    keyword_count_result = list(collection.aggregate(pipeline_keyword_count))
    total_count_result = list(collection.aggregate(pipeline_total_count))

    
    result = {
        "keywordCount": (
            keyword_count_result[0]["keywordCount"] if keyword_count_result else 0
        ),
        "totalSize": total_count_result[0]["totalSize"] if total_count_result else 0,
    }

    json_result = json.dumps(result, ensure_ascii=False, indent=4)
    return Response(json_result, content_type="application/json; charset=utf-8"), 200



@app.route("/articles_by_author/<author_name>", methods=["GET"])
def articles_by_author(author_name):
    pipeline = [
        {"$match": {"author": author_name}},
        {
            "$project": {
                "_id": 0,
                "title": 1,
                "published_time": 1,
                "last_updated": 1,
                "url": 1,
            }
        },
    ]
    result = list(collection.aggregate(pipeline))
    json_result = json.dumps(result, ensure_ascii=False, indent=4)
    return Response(json_result, content_type="application/json; charset=utf-8"), 200



@app.route("/top_classes", methods=["GET"])
def top_classes():
    pipeline = [
        {"$unwind": "$classes"},
        {"$group": {"_id": "$classes", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    result = list(collection.aggregate(pipeline))
    json_result = json.dumps(result, ensure_ascii=False, indent=4)
    return Response(json_result, content_type="application/json; charset=utf-8"), 200



@app.route("/article_details/<postid>", methods=["GET"])
def article_details(postid):
    pipeline = [
        {"$match": {"post_id": postid}},
        {
            "$project": {
                "_id": 0,
                "post_id": 1,
                "url": 1,
                "title": 1,
                "keywords": 1,
                "author": 1,
                "published_time": 1,
                "last_updated": 1,
                "word_count": 1,
                "video_duration": 1,
                "thumbnail": 1,
                "description": 1,
                "lang": 1,
                "classes": 1,
            }
        },
    ]
    result = list(collection.aggregate(pipeline))
    json_result = json.dumps(result, ensure_ascii=False, indent=4)
    return Response(json_result, content_type="application/json; charset=utf-8"), 200



@app.route("/articles_with_video", methods=["GET"])
def articles_with_video():
    pipeline = [
        {"$match": {"video_duration": {"$ne": None}}},
        {"$project": {"_id": 0, "title": 1}},
    ]
    result = list(collection.aggregate(pipeline))
    json_result = json.dumps(result, ensure_ascii=False, indent=4)
    return Response(json_result, content_type="application/json; charset=utf-8"), 200



@app.route("/articles_by_year/<year>", methods=["GET"])
def articles_by_year(year):
    pipeline = [
        {"$match": {"published_time": {"$regex": "^" + year}}},
        {"$group": {"_id": None, "count": {"$sum": 1}}},
        {"$project": {"_id": 0, "year": year, "count": 1}},
    ]
    result = list(collection.aggregate(pipeline))
    json_result = json.dumps(result, ensure_ascii=False, indent=4)
    return Response(json_result, content_type="application/json; charset=utf-8"), 200



@app.route("/longest_articles", methods=["GET"])
def longest_articles():
    pipeline = [
        {
            "$project": {
                "_id": 0,
                "title": 1,
                "author": 1,
                "thumbnail": 1,
                "post_id": 1,
                "word_count": {"$toInt": {"$ifNull": ["$word_count", 0]}},
            }
        },
        {
            "$group": {
                "_id": {
                    "title": "$title",
                    "author": "$author",
                    "thumbnail": "$thumbnail",
                    "word_count": "$word_count",
                    "post_id": "$post_id",
                },
                "count": {"$sum": 1},
            }
        },
        {
            "$project": {
                "title": "$_id.title",
                "author": "$_id.author",
                "thumbnail": "$_id.thumbnail",
                "word_count": "$_id.word_count",
                "post_id": "$_id.post_id",
                "_id": 0,
            }
        },
        {"$sort": {"word_count": -1}},
        {"$limit": 50},
    ]

    result = list(collection.aggregate(pipeline))
    json_result = json.dumps(result, ensure_ascii=False, indent=4)
    return Response(json_result, content_type="application/json; charset=utf-8"), 200



@app.route("/shortest_articles", methods=["GET"])
def shortest_articles():
    pipeline = [
        {
            "$project": {
                "_id": 0,
                "title": 1,
                "author": 1,
                "thumbnail": 1,
                "post_id": 1,
                "word_count": {"$toInt": {"$ifNull": ["$word_count", 0]}},
            }
        },
        {
            "$group": {
                "_id": {
                    "title": "$title",
                    "author": "$author",
                    "thumbnail": "$thumbnail",
                    "word_count": "$word_count",
                    "post_id": "$post_id",
                },
                "count": {"$sum": 1},
            }
        },
        {
            "$project": {
                "title": "$_id.title",
                "author": "$_id.author",
                "thumbnail": "$_id.thumbnail",
                "word_count": "$_id.word_count",
                "post_id": "$_id.post_id",
                "_id": 0,
            }
        },
        {"$match": {"word_count": {"$gt": 0}}},  
        {"$sort": {"word_count": 1}},
        {"$limit": 50},
    ]

    result = list(collection.aggregate(pipeline))
    json_result = json.dumps(result, ensure_ascii=False, indent=4)
    return Response(json_result, content_type="application/json; charset=utf-8"), 200



@app.route("/articles_by_keyword_count", methods=["GET"])
def articles_by_keyword_count():
    pipeline = [
        {"$project": {"_id": 0, "title": 1, "keyword_count": {"$size": "$keywords"}}},
        {"$group": {"_id": "$keyword_count", "count": {"$sum": 1}}},
        {"$addFields": {"keywords": "$_id"}},
        {"$project": {"_id": 0, "keywords": 1, "count": 1}},
        {"$sort": {"count": -1}},
    ]
    result = list(collection.aggregate(pipeline))
    json_result = json.dumps(result, ensure_ascii=False, indent=4)
    return Response(json_result, content_type="application/json; charset=utf-8"), 200



@app.route("/articles_with_thumbnail", methods=["GET"])
def articles_with_thumbnail():
    pipeline = [
        {"$match": {"thumbnail": {"$ne": None}}},
        {"$project": {"_id": 0, "title": 1}},
    ]
    result = list(collection.aggregate(pipeline))
    json_result = json.dumps(result, ensure_ascii=False, indent=4)
    return Response(json_result, content_type="application/json; charset=utf-8"), 200



@app.route("/articles_updated_after_publication", methods=["GET"])
def articles_updated_after_publication():
    pipeline = [
        {"$match": {"last_updated": {"$gt": "$published_time"}}},
        {"$project": {"_id": 0, "title": 1}},
    ]
    result = list(collection.aggregate(pipeline))
    json_result = json.dumps(result, ensure_ascii=False, indent=4)
    return Response(json_result, content_type="application/json; charset=utf-8"), 200


@app.route("/articles_by_coverage/<coverage>", methods=["GET"])
def articles_by_coverage(coverage):
    pipeline = [
        {
            "$match": {
                "classes": {
                    "$elemMatch": {
                        "key": "class5",  
                        "value": coverage,
                    }
                }
            }
        },
        {"$project": {"_id": 0, "title": 1}},
    ]
    result = list(collection.aggregate(pipeline))
    json_result = json.dumps(result, ensure_ascii=False, indent=4)
    return Response(json_result, content_type="application/json; charset=utf-8"), 200



@app.route("/popular_keywords_last_<int:x>_days", methods=["GET"])
def popular_keywords_last_X_days(x):
    
    try:
        days = int(x)
    except ValueError:
        return Response(
            json.dumps(
                {"error": "Invalid number of days"}, ensure_ascii=False, indent=4
            ),
            content_type="application/json; charset=utf-8",
            status=400,
        )

    pipeline = [
        {
            "$match": {
                "published_time": {
                    "$gte": datetime.datetime.now() - datetime.timedelta(days=days)
                }
            }
        },
        {"$unwind": "$keywords"},
        {"$group": {"_id": "$keywords", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10},
    ]

    result = list(collection.aggregate(pipeline))
    json_result = json.dumps(result, ensure_ascii=False, indent=4)
    return Response(json_result, content_type="application/json; charset=utf-8"), 200



@app.route("/articles_by_month/<year>/<month>", methods=["GET"])
def articles_by_month(year, month):
    if len(month) == 1:
        month = "0" + month
    pipeline = [
        {"$match": {"published_time": {"$regex": "^" + year + "-" + month}}},
        {"$group": {"_id": None, "count": {"$sum": 1}}},
        {"$project": {"_id": 0, "month": month, "year": year, "count": 1}},
    ]
    result = list(collection.aggregate(pipeline))
    json_result = json.dumps(result, ensure_ascii=False, indent=4)
    return Response(json_result, content_type="application/json; charset=utf-8"), 200



@app.route("/articles_by_word_count_range/<int:min>/<int:max>", methods=["GET"])
def articles_by_word_count_range(min, max):
    pipeline = [
        {"$addFields": {"word_count_int": {"$toInt": "$word_count"}}},
        {"$match": {"word_count_int": {"$gte": min, "$lte": max}}},
        {
            "$project": {
                "_id": 0,  
                "title": 1,
                "author": 1,
                "word_count": 1,
                "post_id": 1,  
            }
        },
        {
            "$sort": {"word_count": 1}
        },  
    ]

    result = list(collection.aggregate(pipeline))
    json_result = json.dumps(result, ensure_ascii=False, indent=4)

    return Response(json_result, content_type="application/json; charset=utf-8"), 200



@app.route("/articles_with_specific_keyword_count/<int:count>", methods=["GET"])
def articles_with_specific_keyword_count(count):
    pipeline = [
        {"$project": {"_id": 0, "title": 1, "keyword_count": {"$size": "$keywords"}}},
        {"$match": {"keyword_count": count}},
    ]
    result = list(collection.aggregate(pipeline))
    json_result = json.dumps(result, ensure_ascii=False, indent=4)
    return Response(json_result, content_type="application/json; charset=utf-8"), 200



@app.route("/articles_by_specific_date/<date>", methods=["GET"])
def articles_by_specific_date(date):
    pipeline = [
        {"$match": {"published_time": {"$regex": "^" + date}}},
        {"$project": {"_id": 0, "title": 1}},
    ]
    result = list(collection.aggregate(pipeline))
    json_result = json.dumps(result, ensure_ascii=False, indent=4)
    return Response(json_result, content_type="application/json; charset=utf-8"), 200



@app.route("/articles_containing_text/<text>", methods=["GET"])
def articles_containing_text(text):
    pipeline = [
        {"$match": {"description": {"$regex": text, "$options": "i"}}},
        {"$project": {"_id": 0, "post_id": 1, "title": 1, "url": 1}},
    ]
    result = list(collection.aggregate(pipeline))
    json_result = json.dumps(result, ensure_ascii=False, indent=4)
    return Response(json_result, content_type="application/json; charset=utf-8"), 200



@app.route("/articles_with_more_than/<int:word_count>", methods=["GET"])
def articles_with_more_than(word_count):
    pipeline = [
        {"$match": {"word_count": {"$gt": word_count}}},
        {"$project": {"_id": 0, "title": 1, "word_count": 1}},
        {"$sort": {"word_count": -1}},
    ]
    result = list(collection.aggregate(pipeline))
    json_result = json.dumps(result, ensure_ascii=False, indent=4)
    return Response(json_result, content_type="application/json; charset=utf-8"), 200



@app.route("/articles_grouped_by_coverage", methods=["GET"])
def articles_grouped_by_coverage():
    pipeline = [
        {"$unwind": "$classes"},
        {"$group": {"_id": "$classes", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    result = list(collection.aggregate(pipeline))
    json_result = json.dumps(result, ensure_ascii=False, indent=4)
    return Response(json_result, content_type="application/json; charset=utf-8"), 200



@app.route("/articles_last_<int:x>_hours", methods=["GET"])
def articles_last_x_hours(x):
    pipeline = [
        {
            "$match": {
                "published_time": {
                    "$gte": datetime.datetime.now() - datetime.timedelta(hours=x)
                }
            }
        },
        {"$project": {"_id": 0, "title": 1, "published_time": 1, "post_id": 1}},
    ]
    result = list(collection.aggregate(pipeline))
    json_result = json.dumps(result, ensure_ascii=False, indent=4)
    return Response(json_result, content_type="application/json; charset=utf-8"), 200



@app.route("/articles_by_title_length", methods=["GET"])
def articles_by_title_length():
    pipeline = [
        {
            "$project": {
                "_id": 0,
                "title": 1,
                "title_length": {"$size": {"$split": ["$title", " "]}},
            }
        },
        {"$group": {"_id": "$title_length", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    result = list(collection.aggregate(pipeline))
    json_result = json.dumps(result, ensure_ascii=False, indent=4)
    return Response(json_result, content_type="application/json; charset=utf-8"), 200



@app.route("/most_updated_articles", methods=["GET"])
def most_updated_articles():
    pipeline = [
        {
            "$addFields": {
                "update_count": {
                    "$cond": {
                        "if": {"$ne": ["$published_time", "$last_updated"]},
                        "then": 1,
                        "else": 0,
                    }
                }
            }
        },
        {"$sort": {"update_count": -1, "last_updated": -1}},
        {
            "$project": {
                "_id": 0,
                "title": 1,
                "published_time": 1,
                "last_updated": 1,
                "update_count": 1,
            }
        },
    ]
    result = list(collection.aggregate(pipeline))
    json_result = json.dumps(result, ensure_ascii=False, indent=4)
    return Response(json_result, content_type="application/json; charset=utf-8"), 200

# new route section for advanced analysis

@app.route("/sentiment_by_count", methods=["GET"])
def sentiment_count():
    pipeline = [
        {"$group": {"_id": "$sentiment", "count": {"$sum": 1}}},
        {"$sort": {"count": -1, "sentiment.score": -1}},
    ]
    result = list(collection.aggregate(pipeline))
    json_result = json.dumps(result, ensure_ascii=False, indent=4)
    return Response(json_result, content_type="application/json; charset=utf-8"), 200

@app.route("/average_sentiment_by_date", methods=["GET"])
def average_sentiment_by_date():
    pipeline = [
    {
        '$project': {
            'sentiment_score': '$sentiment.score', 
            'published_day': {
                '$substr': [
                    '$published_time', 0, 10
                ]
            }
        }
    }, {
        '$group': {
            '_id': '$published_day', 
            'average_sentiment_score': {
                '$avg': '$sentiment_score'
            },
            'count': {
                '$sum': 1
            }
        }
    }, {
        '$sort': {
            '_id': 1
        }
    }
]

    result = list(collection.aggregate(pipeline))
    json_result = json.dumps(result, ensure_ascii=False, indent=4)
    return Response(json_result, content_type="application/json; charset=utf-8"), 200

@app.route("/entities_by_type", methods=["GET"])
def entities_by_type():
    pipeline = [
        {
        '$unwind': '$entities'
    }, {
        '$group': {
            '_id': '$entities.entity', 
            'count': {
                '$sum': 1
            }
        }
    }
    ]
    result = list(collection.aggregate(pipeline))
    json_result = json.dumps(result, ensure_ascii=False, indent=4)
    return Response(json_result, content_type="application/json; charset=utf-8"), 200

@app.route("/entities_by_trending", methods=["GET"])
def entities_by_trending():
    pipeline = [
       {
        '$unwind': '$entities'
    }, {
        '$group': {
            '_id': {
                'word': '$entities.word', 
                'entity': '$entities.entity'
            }, 
            'count': {
                '$sum': 1
            }
        }
    }, {
        '$sort': {
            'count': -1
        }
    }, {
        '$limit': 10
    }, {
        '$project': {
            '_id': 0, 
            'word': '$_id.word', 
            'type': '$_id.entity', 
            'count': 1
        }
    }
    ]
    result = list(collection.aggregate(pipeline))
    json_result = json.dumps(result, ensure_ascii=False, indent=4)
    return Response(json_result, content_type="application/json; charset=utf-8"), 200

# Function to convert ObjectId to string
def convert_objectid_to_str(obj):
    if isinstance(obj, ObjectId):
        return str(obj)
    elif isinstance(obj, dict):
        return {k: convert_objectid_to_str(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_objectid_to_str(item) for item in obj]
    else:
        return obj

@app.route("/most_positive_sentiment", methods=["GET"])
def most_positive_sentiment():
    pipeline = [
        {
            '$match': {
                'sentiment.score': {
                    '$gt': 0, 
                    '$lte': 1
                }
            }
        },
        {
            '$sort': {
                'sentiment.score': -1
            }
        },
        {
            '$limit': 50
        },
        {
            '$project': {
                'title': 1, 
                'author': 1, 
                'sentiment.label': 1, 
                'sentiment.score': 1,
                "post_id": 1
            }
        }
    ]
    
    try:
        result = list(collection.aggregate(pipeline))
        # Convert ObjectId fields to strings
        result = [convert_objectid_to_str(doc) for doc in result]
        json_result = json.dumps(result, ensure_ascii=False, indent=4)
        return Response(json_result, content_type="application/json; charset=utf-8"), 200
    except Exception as e:
        return Response(str(e), content_type="text/plain; charset=utf-8"), 500

@app.route("/most_negative_sentiment", methods=["GET"])
def most_negative_sentiment():
    pipeline = [
        {
            '$match': {
                'sentiment.score': {
                    '$lt': 0, 
                    '$gte': -1
                }
            }
        },
        {
            '$sort': {
                'sentiment.score': 1
            }
        },
        {
            '$limit': 50
        },
        {
            '$project': {
                'title': 1, 
                'author': 1, 
                'sentiment.label': 1, 
                'sentiment.score': 1,
                "post_id": 1
            }
        }
    ]
    
    try:
        result = list(collection.aggregate(pipeline))
        # Convert ObjectId fields to strings
        result = [convert_objectid_to_str(doc) for doc in result]
        json_result = json.dumps(result, ensure_ascii=False, indent=4)
        return Response(json_result, content_type="application/json; charset=utf-8"), 200
    except Exception as e:
        return Response(str(e), content_type="text/plain; charset=utf-8"), 500

if __name__ == "__main__":
    app.run(debug=True)
