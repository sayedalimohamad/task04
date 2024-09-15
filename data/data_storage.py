import pymongo
import json
import sys

# Function to clean the data and remove errors
def remove_error_data():
    try:
        # Read the JSON data from the file
        with open("articles.json", "r", encoding="utf-8") as file:
            data = json.load(file)

        # Find the indices of the errors
        error_indices = [
            i for i, article in enumerate(data) if not isinstance(article, dict)
        ]

        # Remove the data at the error indices, starting from the end to avoid index shifting issues
        for index in sorted(error_indices, reverse=True):
            del data[index]

        # Write the updated data back to a new JSON file if errors were found
        if error_indices:
            new_file_path = f"articles_{len(data)}.json"
            with open(new_file_path, "w", encoding="utf-8") as file:
                json.dump(data, file, ensure_ascii=False, indent=4)
            return len(data), new_file_path

        # Return the original data length and file path if no errors were found
        return len(data), "articles.json"

    except FileNotFoundError:
        print("The file articles.json does not exist.")
        return 0, None
    except json.JSONDecodeError:
        print("Error decoding JSON from the file.")
        return 0, None

# Clean the data and get the correct JSON file path
data_length, json_file_path = remove_error_data()

# If cleaning was successful and a valid file path was returned
if json_file_path:
    try:
        connect = pymongo.MongoClient("mongodb://localhost:27017/")
        db = connect["almayadeen"]
        collection = db["articles"]
    except pymongo.errors.ConnectionFailure:
        print("Failed to connect to MongoDB server")
        sys.exit(1)

    try:
        with open(json_file_path, encoding="utf-8") as json_file:
            data = json.load(json_file)
            collection.insert_many(data)
        print(f"{data_length} records were inserted into the database.")
        print("Data inserted successfully.")
    except FileNotFoundError:
        print(f"File not found: {json_file_path}")
        sys.exit(1)
    except UnicodeDecodeError as e:
        print(f"Unicode decode error: {e}")
        sys.exit(1)
else:
    print("Data cleaning failed or no valid data file found.")
    sys.exit(1)
