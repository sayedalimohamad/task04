# Flask Web Application with MongoDB AND `Authentication`

This code is a Flask web application that interacts with a MongoDB database to provide various endpoints for querying and analyzing articles. Here's a breakdown of the key components and routes:

#### `*📌 Remarque*`: At the end of this file, you will find several image snippets showcasing the project.

## Background Information: Refreshing Reminder

1. `Task01` : Week 01 - Web Scraping with Python 
    1. README File 
    ```sh
     https://github.com/sayedalimohamad/task01/blob/main/README.md
     ```
    2. Repository 
    ```sh 
    https://github.com/sayedalimohamad/task01.git
    ```

2. `Task02` : Week 02 - Data Storage in MongoDB and Flask API Development
    1. README File 
    ```sh
     https://github.com/sayedalimohamad/task02/blob/main/README.md
     ```
    2. Repository 
    ```sh 
    https://github.com/sayedalimohamad/task02.git
    ```

3. `Task03` : Week 03 - Data Visualization using amCharts
    1. README File 
    ```sh
     https://github.com/sayedalimohamad/task03/blob/main/README.md
     ```
    2. Repository 
    ```sh 
    https://github.com/sayedalimohamad/task03.git
    ```

## Imports and Initialization

- `Flask`, `jsonify`, `request`, `Response`, `render_template`, `redirect`, `url_for`, and `flash` are imported from `flask`.
- `MongoClient` is imported from `pymongo` to interact with MongoDB.
- `datetime` and `json` are standard Python libraries.
- `ObjectId` is imported from `bson` to handle MongoDB ObjectIds.
- `LoginManager`, `UserMixin`, `login_user`, `login_required`, and `logout_user` are imported from `flask_login` for user authentication.
- The Flask app is initialized, and a MongoDB client is created to connect to a local MongoDB instance.

## Error Handling

- A custom 404 error handler is defined to render a `404.html` template.

## Routes

### Authentication

- `/login`: Handles user login.
- `/logout`: Logs out the user.

#### 📌 Note: Admin Credentials
- For now, the admin credentials are hardcoded:
    - `ADMIN_USERNAME` = 'admin'
    - `ADMIN_PASSWORD` = 'password'

### Home and Static Pages

- `/`: Renders the home page with a list of available routes.
- `/gui.html`, `/advanced.html`: Render static HTML pages.

### Data Retrieval and Aggregation

- `/top_keywords`: Returns the top keywords used in articles.
- `/top_authors`: Returns the top 20 authors by article count.
- `/all_authors`: Returns all authors sorted by article count.
- `/articles_by_date`: Groups articles by publication date.
- `/articles_by_word_count`: Groups articles by word count.
- `/articles_by_language`: Groups articles by language.
- `/articles_by_classes`: Groups articles by classes.
- `/recent_articles`: Returns the 20 most recently updated articles.
- `/articles_by_keyword/<keyword>`: Returns the count of articles containing a specific keyword.
- `/articles_by_author/<author_name>`: Returns articles by a specific author.
- `/top_classes`: Returns the top classes used in articles.
- `/article_details/<postid>`: Returns details of an article by post ID.
- `/articles_with_video`: Returns articles that contain videos.
- `/articles_by_year/<year>`: Returns the count of articles published in a specific year.
- `/longest_articles`: Returns the 50 longest articles by word count.
- `/shortest_articles`: Returns the 50 shortest articles by word count.
- `/articles_by_keyword_count`: Groups articles by the number of keywords.
- `/articles_with_thumbnail`: Returns articles that have thumbnails.
- `/articles_updated_after_publication`: Returns articles updated after their publication.
- `/articles_by_coverage/<coverage>`: Returns articles by a specific coverage class.
- `/popular_keywords_last_<int:x>_days`: Returns the top 10 keywords used in the last `x` days.
- `/articles_by_month/<year>/<month>`: Returns the count of articles published in a specific month.
- `/articles_by_word_count_range/<int:min>/<int:max>`: Returns articles with word counts within a specified range.
- `/articles_with_specific_keyword_count/<int:count>`: Returns articles with a specific number of keywords.
- `/articles_by_specific_date/<date>`: Returns articles published on a specific date.
- `/articles_containing_text/<text>`: Returns articles containing specific text in their description.
- `/articles_with_more_than/<int:word_count>`: Returns articles with more than a specified number of words.
- `/articles_grouped_by_coverage`: Groups articles by coverage classes.
- `/articles_last_<int:x>_hours`: Returns articles published in the last `x` hours.
- `/articles_by_title_length`: Groups articles by the length of their titles.
- `/most_updated_articles`: Returns the most updated articles.

### Advanced Analysis

- `/sentiment_by_count`: Groups articles by sentiment.
- `/average_sentiment_by_date`: Calculates the average sentiment score by date.
- `/entities_by_type`: Groups entities by type.
- `/entities_by_trending`: Returns the top 10 trending entities.
- `/entities_tag_cloud`: Returns the top 200 trending entities as tag cloud design.
- `/most_positive_sentiment`: Returns the 50 articles with the most positive sentiment.
- `/most_negative_sentiment`: Returns the 50 articles with the most negative sentiment.

## Utility Functions

- `convert_objectid_to_str`: Converts MongoDB ObjectId fields to strings for JSON serialization.

## Main Execution

- The Flask app runs in debug mode if the script is executed directly.

This application provides a comprehensive set of endpoints for querying and analyzing articles stored in a MongoDB database, with a focus on various attributes such as keywords, authors, dates, word counts, languages, and sentiment analysis.

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
    - `Flask==3.0.3`
    - `pymongo==4.8.0`
    - `stanza==1.8.2`
    - `nltk==3.9.1`
    - `ftfy==6.2.3`
    - `flask_login==0.6.2`

### Installation

1. Clone the repository:

    ```sh
    git clone https://github.com/sayedalimohamad/task04.git
    ```

2. Install the required Python packages:

    ```sh
    pip install -r requirements.txt
    ```

3. Ensure MongoDB is running and accessible at `mongodb://localhost:27017/`.

### Usage

1. Ensure the required NLTK data is downloaded:

    ```sh
    python -m nltk.downloader vader_lexicon
    ```

2. Run the script:

    ```sh
    python advanced_data_analysis.py
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

## A `000_Notice.md` is in the directory of data, and should be reads.

``` The JSON database backup is divided into 28 chunk files of 1000 each. Use 'mergeJSONfile.py' to rejoin them and `data_storage.py` to connect to MongoDB. Be sure to review the restrictions in the `000_Notice.md` file located in the data directory. ```

---
# The Image
## Login Page
![Admin should enter username and password to access the page.](../127.0.0.1_5000_login(HD%20Screen%20-%20MSA).png)