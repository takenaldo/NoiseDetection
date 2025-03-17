import sqlite3
from http.server import BaseHTTPRequestHandler, HTTPServer
import json

global connection
global cursor

def start_db_connection():
    global connection
    connection = sqlite3.connect("noise.db")

    global cursor
    cursor = connection.cursor()

    create_table_query = """
    CREATE TABLE IF NOT EXISTS volumes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        volume INTEGER
    );
    """
    cursor.execute(create_table_query)
    connection.commit()

def insert_volume_to_DB(volume):
    if connection is None:
        start_db_connection()
        
    insert_query = """
    INSERT INTO volumes (volume) VALUES (?);
    """
    cursor.execute(insert_query, (volume,))
    connection.commit()

def close_connection():
    connection.close()

class RequestHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data)
        volume = data.get('volume')
        
        if volume is not None:
            insert_volume_to_DB(volume)
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            response = {'message': 'Volume inserted successfully'}
            self.wfile.write(json.dumps(response).encode())
        else:
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            response = {'error': 'Invalid input'}
            self.wfile.write(json.dumps(response).encode())

def run(server_class=HTTPServer, handler_class=RequestHandler, port=8080):
    start_db_connection()
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f'Starting httpd server on port {port}')
    httpd.serve_forever()

if __name__ == '__main__':
    run()