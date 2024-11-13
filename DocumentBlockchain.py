import hashlib
import time
import json
import requests


class DocumentBlockchain:
    def __init__(self):
        self.chain = []  # The blockchain
        self.pending_transactions = []  # Transactions waiting to be added
        self.nodes = set()  # Keep track of peer nodes
        self.create_block(proof=1, previous_hash='0')  # Genesis block

    def create_block(self, proof, previous_hash):
        # Create a new block and add it to the chain
        block = {
            'index': len(self.chain) + 1,
            'timestamp': time.time(),
            'transactions': self.pending_transactions,
            'proof': proof,
            'previous_hash': previous_hash
        }
        self.pending_transactions = []  # Reset the pending transactions after creating a block
        self.chain.append(block)
        return block

    def get_previous_block(self):
        return self.chain[-1]

    def proof_of_work(self, previous_proof):
        new_proof = 1
        check_proof = False
        while not check_proof:
            # Simple proof of work algorithm
            hash_operation = hashlib.sha256(str(new_proof**2 - previous_proof**2).encode()).hexdigest()
            if hash_operation[:4] == '0000':  # Difficulty level set to four leading zeroes
                check_proof = True
            else:
                new_proof += 1
        return new_proof

    def hash(self, block):
        # Hashes a block's data to ensure integrity
        encoded_block = json.dumps(block, sort_keys=True).encode()
        return hashlib.sha256(encoded_block).hexdigest()

    def add_transaction(self, sender, receiver, document_hash, title, description):
        # Adds a new transaction to pending transactions
        transaction = {
            'sender': sender,
            'receiver': receiver,
            'document_hash': document_hash,  # Hash of the uploaded document
            'title': title,
            'description': description,
            'timestamp': time.time()
        }
        self.pending_transactions.append(transaction)
        return self.get_previous_block()['index'] + 1  # Return the next block index

    def add_request_transaction(self, sender, request_type, description, target_organization):
        request = {
            'type': 'document_request',
            'sender': sender,
            'request_type': request_type,
            'description': description,
            'target_organization': target_organization,  # Changed from organization to target_organization
            'status': 'pending',
            'timestamp': time.time()
        }
        self.pending_transactions.append(request)
        return self.get_previous_block()['index'] + 1
    def is_chain_valid(self, chain):
        # Verifies the blockchain's integrity
        previous_block = chain[0]
        block_index = 1
        while block_index < len(chain):
            block = chain[block_index]
            if block['previous_hash'] != self.hash(previous_block):
                return False
            previous_proof = previous_block['proof']
            proof = block['proof']
            hash_operation = hashlib.sha256(str(proof**2 - previous_proof**2).encode()).hexdigest()
            if hash_operation[:4] != '0000':
                return False
            previous_block = block
            block_index += 1
        return True

    # New method to add a peer node
    def add_peer(self, address):
        self.nodes.add(address)

    # Method to replace the chain with the longest valid chain from other nodes
    def replace_chain(self):
        longest_chain = None
        max_length = len(self.chain)

        for node in self.nodes:
            response = requests.get(f'http://{node}/get_chain')
            if response.status_code == 200:
                length = response.json()['length']
                chain = response.json()['chain']

                if length > max_length and self.is_chain_valid(chain):
                    max_length = length
                    longest_chain = chain

        if longest_chain:
            self.chain = longest_chain
            return True
        return False

    def add_update_transaction(self, sender, receiver, document_hash, title, description, original_hash):
        # Adds a new transaction with an update flag and links to the original document
        transaction = {
            'sender': sender,
            'receiver': receiver,
            'document_hash': document_hash,
            'original_hash': original_hash,  # Link to the original document's hash
            'title': title,
            'description': description,
            'timestamp': time.time(),
            'update': True  # Flag indicating this is an update transaction
        }
        self.pending_transactions.append(transaction)
        return self.get_previous_block()['index'] + 1