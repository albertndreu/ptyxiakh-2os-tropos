import time  # Use this instead of from datetime import time
from datetime import datetime  # If you need datetime functionality
from hashlib import sha256

from flask import Flask, jsonify, request, session, send_file
from DocumentBlockchain import DocumentBlockchain
from flask_cors import CORS
import hashlib
import os
import mimetypes
import logging
import secrets  # For generating session tokens
from functools import wraps  # Import wraps for the authenticate decorator

app = Flask(__name__)
app.secret_key = secrets.token_hex(16)  # Secret key for session management
CORS(app)

# Initialize the blockchain and upload folder
blockchain = DocumentBlockchain()
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# User data
users = {
    "org1": {"username": "org1", "code": "pass123", "role": "organization"},
    "org2": {"username": "org2", "code": "pass456", "role": "organization"},
    "student1": {"username": "student1", "code": "pass789", "role": "student"}
}

# Store active sessions
sessions = {}

# Define the authenticate decorator with @wraps to keep the original function name
def authenticate(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"message": "No token provided"}), 403

        # Remove 'Bearer ' prefix if it exists
        if token.startswith('Bearer '):
            token = token.replace('Bearer ', '')

        if token in sessions:
            return func(*args, **kwargs)
        return jsonify({"message": "Invalid or expired token"}), 403

    return wrapper

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get("username")
    code = data.get("code")

    user = users.get(username)
    if user and user["code"] == code:
        token = secrets.token_hex(16)
        sessions[token] = {"username": username, "role": user["role"]}
        return jsonify({
            "success": True,
            "message": "Login successful",
            "token": token,
            "role": user["role"]
        }), 200
    else:
        return jsonify({
            "success": False,
            "message": "Invalid credentials"
        }), 401

@app.route('/logout', methods=['POST'])
@authenticate
def logout():
    token = request.headers.get("Authorization")
    sessions.pop(token, None)
    return jsonify({"message": "Logged out successfully"}), 200

@app.route('/add_transaction', methods=['POST'])
def add_transaction():
    try:
        file = request.files['file']
        if not file:
            return jsonify({'message': 'No file uploaded'}), 400

        file_hash = hashlib.sha256(file.read()).hexdigest()
        file.seek(0)

        # Save file
        file_extension = os.path.splitext(file.filename)[1]
        file_path = os.path.join(UPLOAD_FOLDER, f"{file_hash}{file_extension}")
        file.save(file_path)

        # Add transaction to blockchain
        block_index = blockchain.add_transaction(
            sender=request.form['sender'],
            receiver=request.form['receiver'],
            document_hash=file_hash,
            title=request.form['title'],
            description=request.form.get('description', '')
        )

        return jsonify({
            'message': f'Transaction will be added to Block {block_index}',
            'file_hash': file_hash,
            'block_index': block_index
        }), 201
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/mine', methods=['GET'])
def mine_block():
    previous_block = blockchain.get_previous_block()
    previous_proof = previous_block['proof']
    proof = blockchain.proof_of_work(previous_proof)
    previous_hash = blockchain.hash(previous_block)
    block = blockchain.create_block(proof, previous_hash)

    response = {
        'message': 'New block mined',
        'index': block['index'],
        'transactions': block['transactions'],
        'proof': block['proof'],
        'previous_hash': block['previous_hash']
    }
    return jsonify(response), 200

@app.route('/request_document', methods=['POST'])
@authenticate
def request_document():
    try:
        data = request.get_json()
        requester = data.get('requester')
        request_type = data.get('requestType')
        description = data.get('description')
        target_organization = data.get('targetOrganization')

        if not all([requester, request_type, target_organization]):
            return jsonify({'error': 'Missing required fields'}), 400

        # Add to blockchain as a special transaction with target organization
        next_block = blockchain.add_request_transaction(
            sender=requester,
            request_type=request_type,
            description=description,
            target_organization=target_organization
        )

        # Mine the block immediately after adding the request
        previous_block = blockchain.get_previous_block()
        proof = blockchain.proof_of_work(previous_block['proof'])
        previous_hash = blockchain.hash(previous_block)
        blockchain.create_block(proof, previous_hash)

        return jsonify({
            'message': 'Request submitted successfully',
            'block_index': next_block
        }), 201
    except Exception as e:
        print(f"Error processing request: {str(e)}")
        return jsonify({'error': str(e)}), 500
    
def add_request_transaction(self, sender, request_type, description, organization):
    request = {
        'type': 'document_request',
        'sender': sender,
        'request_type': request_type,
        'description': description,
        'organization': organization,  # Store the target organization
        'status': 'pending',
        'timestamp': time.time()
    }
    self.pending_transactions.append(request)
    return self.get_previous_block()['index'] + 1


@app.route('/get_document_requests', methods=['GET'])
@authenticate
def get_document_requests():
    token = request.headers.get("Authorization")
    if token.startswith('Bearer '):
        token = token.replace('Bearer ', '')

    current_user = sessions[token]['username']
    requests = []

    # Filter requests based on organization
    for block in blockchain.chain:
        for transaction in block.get('transactions', []):
            if (transaction.get('type') == 'document_request' and
                    transaction.get('target_organization') == current_user):
                requests.append({
                    'timestamp': transaction.get('timestamp'),
                    'requester': transaction.get('sender'),
                    'requestType': transaction.get('request_type'),
                    'description': transaction.get('description'),
                    'status': transaction.get('status', 'pending')
                })

    return jsonify({'requests': requests}), 200


@app.route('/update_request_status', methods=['POST'])

def update_request_status():
    data = request.get_json()
    request_id = data.get('requestId')
    new_status = data.get('status')

    # Update the status in the blockchain
    for block in blockchain.chain:
        for transaction in block.get('transactions', []):
            if (transaction.get('type') == 'document_request' and
                    transaction.get('timestamp') == request_id):
                transaction['status'] = new_status
                return jsonify({'message': f'Request status updated to {new_status}'}), 200

    return jsonify({'error': 'Request not found'}), 404

@app.route('/get_chain', methods=['GET'])
def get_chain():
    response = {
        'chain': blockchain.chain,
        'length': len(blockchain.chain)
    }
    return jsonify(response), 200

@app.route('/is_chain_valid', methods=['GET'])
def is_chain_valid():
    is_valid = blockchain.is_chain_valid(blockchain.chain)
    response = {'is_valid': is_valid}
    return jsonify(response), 200

@app.route('/add_peer', methods=['POST'])
def add_peer():
    json_data = request.get_json()
    node = json_data.get('node')
    if not node:
        return "Node address is missing", 400
    blockchain.add_peer(node)
    response = {'message': f'Node {node} added to network'}
    return jsonify(response), 201

@app.route('/replace_chain', methods=['GET'])
def replace_chain():
    replaced = blockchain.replace_chain()
    if replaced:
        response = {'message': 'Chain replaced by the longest valid chain'}
    else:
        response = {'message': 'Current chain is the longest one'}
    return jsonify(response), 200

@app.route('/get_document/<document_hash>', methods=['GET'])
def get_document(document_hash):
    logging.info(f"Requested document hash: {document_hash}")

    # Check for the file in the upload folder
    for filename in os.listdir(UPLOAD_FOLDER):
        if filename.startswith(document_hash):
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            logging.info(f"Document found: {file_path}")

            mime_type, _ = mimetypes.guess_type(file_path)
            return send_file(file_path, as_attachment=False, mimetype=mime_type)

    logging.warning(f"Document with hash {document_hash} not found in {UPLOAD_FOLDER}")
    return jsonify({'message': 'Document not found.'}), 404

@app.route('/get_documents', methods=['GET'])
@authenticate
def get_documents():
    try:
        documents = []
        # Get transactions from mined blocks
        for block in blockchain.chain[1:]:  # Skip genesis block
            for transaction in block['transactions']:
                if transaction.get('type') != 'document_request':  # Only get document transactions
                    doc = {
                        'title': transaction.get('title', ''),
                        'description': transaction.get('description', ''),
                        'sender': transaction.get('sender', ''),
                        'receiver': transaction.get('receiver', ''),
                        'timestamp': transaction.get('timestamp', 0),
                        'document_hash': transaction.get('document_hash', '')
                    }
                    if all(doc.values()):  # Only add if all required fields are present
                        documents.append(doc)

        # Add pending transactions
        for transaction in blockchain.pending_transactions:
            if transaction.get('document_hash'):  # Only get document transactions
                documents.append({
                    'title': transaction.get('title', ''),
                    'description': transaction.get('description', ''),
                    'sender': transaction.get('sender', ''),
                    'receiver': transaction.get('receiver', ''),
                    'timestamp': transaction.get('timestamp', 0),
                    'document_hash': transaction.get('document_hash', '')
                })

        return jsonify({'documents': documents}), 200
    except Exception as e:
        print(f"Error in get_documents: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/get_organization_documents', methods=['GET'])
@authenticate
def get_organization_documents():
    try:
        organization = request.args.get('organization')
        if not organization:
            return jsonify({'error': 'Organization parameter is required'}), 400

        documents = []
        for block in blockchain.chain[1:]:  # Skip genesis block
            for transaction in block['transactions']:
                if (transaction.get('type') != 'document_request' and
                        transaction.get('sender') == organization):
                    doc = {
                        'title': transaction.get('title', ''),
                        'description': transaction.get('description', ''),
                        'sender': transaction.get('sender', ''),
                        'receiver': transaction.get('receiver', ''),
                        'timestamp': transaction.get('timestamp', 0),
                        'document_hash': transaction.get('document_hash', ''),
                        'block_number': blockchain.chain.index(block)
                    }
                    if all(doc.values()):
                        documents.append(doc)

        return jsonify({'documents': documents}), 200
    except Exception as e:
        print(f"Error in get_organization_documents: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/update_transaction', methods=['POST'])
def update_transaction():
    data = request.form
    required_fields = ['sender', 'receiver', 'title', 'description', 'original_hash']

    if not all(field in data for field in required_fields):
        return 'Missing data', 400

    file = request.files['file']
    if not file:
        return 'No file uploaded', 400

    file_hash = hashlib.sha256(file.read()).hexdigest()
    file.seek(0)

    file_extension = os.path.splitext(file.filename)[1]
    file_path = os.path.join(UPLOAD_FOLDER, f"{file_hash}{file_extension}")
    file.save(file_path)

    index = blockchain.add_update_transaction(
        sender=data['sender'],
        receiver=data['receiver'],
        document_hash=file_hash,
        title=data['title'],
        description=data['description'],
        original_hash=data['original_hash']
    )
    return jsonify({'message': f'Update transaction will be added to Block {index}'}), 201


notifications = {}


@app.route('/create_notification', methods=['POST'])
def create_notification():
    data = request.get_json()
    receiver = data['receiver']

    # Create transaction ID by hashing sender + timestamp
    transaction_id = sha256(f"{data['sender']}{data['timestamp']}".encode()).hexdigest()[:8]

    if receiver not in notifications:
        notifications[receiver] = []

    notifications[receiver].append({
        'sender': data['sender'],
        'transactionId': transaction_id,
        'documentHash': data['documentHash'],
        'timestamp': data['timestamp']
    })

    return jsonify({'message': 'Notification created'}), 201


@app.route('/get_notifications/<username>', methods=['GET'])
def get_notifications(username):
    user_notifications = notifications.get(username, [])
    return jsonify({'notifications': user_notifications}), 200



if __name__ == '__main__':
    app.run(port=5000)
