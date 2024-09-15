## This folder contains the backup data from MongoDB
- The database is saved as a JSON file.
- The backup JSON file is too large to upload without Git LFS.
- To address this, I have divided it into chunk files of 1000 each.
- To re-join the files, use the script `mergeJSONfile.py` to create a single file before creating a new connection database.
- Make sure to follow professional practices when handling the backup data.
- To create a MongoDB connection and serve the JSON data to the database, run the code in `data_storage.py`.

Please ensure that you follow the necessary steps and best practices to handle the backup data professionally.