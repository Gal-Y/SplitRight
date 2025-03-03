from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import json
from datetime import datetime
import uuid
import time
import math
import random

# Import modules
from api.routes import register_routes

app = Flask(__name__)
CORS(app)

# Configuration
app.config['DATA_FOLDER'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')

# Ensure data directory exists
os.makedirs(app.config['DATA_FOLDER'], exist_ok=True)

# Initialize data files if they don't exist
groups_file = os.path.join(app.config['DATA_FOLDER'], 'groups.json')
expenses_file = os.path.join(app.config['DATA_FOLDER'], 'expenses.json')

if not os.path.exists(groups_file):
    with open(groups_file, 'w') as f:
        json.dump([], f)

if not os.path.exists(expenses_file):
    with open(expenses_file, 'w') as f:
        json.dump([], f)

# Register API routes from the api module
register_routes(app)

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "timestamp": datetime.now().isoformat()})

# Reset data endpoint
@app.route('/api/reset', methods=['POST'])
def reset_data():
    # Reset groups
    with open(groups_file, 'w') as f:
        json.dump([], f)
    # Reset expenses
    with open(expenses_file, 'w') as f:
        json.dump([], f)
    return jsonify({'success': True})

# Load test endpoint for Kubernetes autoscaling demo
@app.route('/api/load-test', methods=['POST'])
def load_test():
    data = request.json
    intensity = min(max(int(data.get('intensity', 1)), 1), 10)  # 1-10 scale
    duration = min(max(int(data.get('duration', 10)), 1), 300)  # 1-300 seconds
    
    start_time = time.time()
    end_time = start_time + duration
    
    # Calculate prime numbers to generate CPU load
    def is_prime(n):
        if n <= 1:
            return False
        if n <= 3:
            return True
        if n % 2 == 0 or n % 3 == 0:
            return False
        i = 5
        while i * i <= n:
            if n % i == 0 or n % (i + 2) == 0:
                return False
            i += 6
        return True
    
    # Generate memory load
    memory_load = []
    
    # Main load generation loop
    count = 0
    while time.time() < end_time:
        # CPU load - find prime numbers
        for _ in range(intensity * 1000):
            num = random.randint(10000, 100000)
            is_prime(num)
            count += 1
        
        # Memory load - create and store random data
        if intensity > 5:
            for _ in range(intensity * 100):
                memory_load.append('x' * 1000)
        
        # Small pause to prevent complete CPU hogging
        time.sleep(0.01)
    
    actual_duration = time.time() - start_time
    
    return jsonify({
        'success': True,
        'message': f'Generated load with intensity {intensity} for {actual_duration:.2f} seconds. Processed {count} operations.',
        'intensity': intensity,
        'duration': actual_duration,
        'operations': count
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True) 