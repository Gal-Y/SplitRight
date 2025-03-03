from flask import jsonify, request, current_app
import os
import json
import uuid
from datetime import datetime

# Data file paths
def get_groups_file():
    return os.path.join(current_app.config['DATA_FOLDER'], 'groups.json')

def get_expenses_file():
    return os.path.join(current_app.config['DATA_FOLDER'], 'expenses.json')

# Helper functions
def load_data(file_path):
    if os.path.exists(file_path):
        with open(file_path, 'r') as f:
            return json.load(f)
    return []

def save_data(file_path, data):
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=2)

def calculate_settlements(group_id):
    # Load expenses for the group
    expenses = load_data(get_expenses_file())
    group_expenses = [e for e in expenses if e['group_id'] == group_id]
    
    # Initialize balances
    balances = {}
    
    # Calculate how much each person paid and owes
    for expense in group_expenses:
        payer = expense['payer']
        amount = expense['amount']
        split_between = expense['split_between']
        
        # Initialize balances if not already
        if payer not in balances:
            balances[payer] = 0
        
        for person in split_between:
            if person not in balances:
                balances[person] = 0
        
        # Add the full amount to the payer
        balances[payer] += amount
        
        # Subtract each person's share
        split_amount = amount / len(split_between)
        for person in split_between:
            balances[person] -= split_amount
    
    # Calculate who pays whom
    transactions = []
    debtors = []
    creditors = []
    
    # Separate into debtors and creditors
    for person, balance in balances.items():
        if balance < 0:
            debtors.append({"name": person, "amount": abs(balance)})
        elif balance > 0:
            creditors.append({"name": person, "amount": balance})
    
    # Sort by amount (largest first)
    debtors.sort(key=lambda x: x["amount"], reverse=True)
    creditors.sort(key=lambda x: x["amount"], reverse=True)
    
    # Create transactions
    i, j = 0, 0
    while i < len(debtors) and j < len(creditors):
        debtor = debtors[i]
        creditor = creditors[j]
        
        amount = min(debtor["amount"], creditor["amount"])
        
        if amount > 0.01:  # Ignore very small amounts due to floating point
            transactions.append({
                "from": debtor["name"],
                "to": creditor["name"],
                "amount": round(amount, 2)
            })
        
        debtor["amount"] -= amount
        creditor["amount"] -= amount
        
        if debtor["amount"] < 0.01:
            i += 1
        if creditor["amount"] < 0.01:
            j += 1
    
    return transactions

def register_routes(app):
    # Groups endpoints
    @app.route('/api/groups', methods=['GET'])
    def get_groups():
        groups = load_data(get_groups_file())
        return jsonify(groups)
    
    @app.route('/api/groups', methods=['POST'])
    def create_group():
        data = request.json
        groups = load_data(get_groups_file())
        
        new_group = {
            'id': str(uuid.uuid4()),
            'name': data['name'],
            'created_at': datetime.now().isoformat(),
            'members': data['members']
        }
        
        groups.append(new_group)
        save_data(get_groups_file(), groups)
        
        return jsonify(new_group), 201
    
    @app.route('/api/groups/<group_id>', methods=['GET'])
    def get_group(group_id):
        groups = load_data(get_groups_file())
        group = next((g for g in groups if g['id'] == group_id), None)
        
        if not group:
            return jsonify({'error': 'Group not found'}), 404
        
        return jsonify(group)
    
    @app.route('/api/groups/<group_id>/members', methods=['POST'])
    def add_member(group_id):
        data = request.json
        groups = load_data(get_groups_file())
        
        group = next((g for g in groups if g['id'] == group_id), None)
        if not group:
            return jsonify({'error': 'Group not found'}), 404
        
        if data['name'] not in group['members']:
            group['members'].append(data['name'])
            save_data(get_groups_file(), groups)
        
        return jsonify(group)
    
    @app.route('/api/groups/<group_id>/members/<member_name>', methods=['DELETE'])
    def remove_member(group_id, member_name):
        groups = load_data(get_groups_file())
        
        group = next((g for g in groups if g['id'] == group_id), None)
        if not group:
            return jsonify({'error': 'Group not found'}), 404
        
        if member_name in group['members']:
            group['members'].remove(member_name)
            save_data(get_groups_file(), groups)
        
        return jsonify(group)
    
    # Expenses endpoints
    @app.route('/api/groups/<group_id>/expenses', methods=['GET'])
    def get_expenses(group_id):
        expenses = load_data(get_expenses_file())
        group_expenses = [e for e in expenses if e['group_id'] == group_id]
        
        return jsonify(group_expenses)
    
    @app.route('/api/groups/<group_id>/expenses', methods=['POST'])
    def create_expense(group_id):
        data = request.json
        expenses = load_data(get_expenses_file())
        
        new_expense = {
            'id': str(uuid.uuid4()),
            'group_id': group_id,
            'description': data['description'],
            'amount': data['amount'],
            'payer': data['payer'],
            'split_between': data['split_between'],
            'date': data.get('date', datetime.now().isoformat())
        }
        
        expenses.append(new_expense)
        save_data(get_expenses_file(), expenses)
        
        return jsonify(new_expense), 201
    
    @app.route('/api/groups/<group_id>/expenses/<expense_id>', methods=['DELETE'])
    def delete_expense(group_id, expense_id):
        expenses = load_data(get_expenses_file())
        
        expense_index = next((i for i, e in enumerate(expenses) if e['id'] == expense_id and e['group_id'] == group_id), None)
        if expense_index is None:
            return jsonify({'error': 'Expense not found'}), 404
        
        deleted_expense = expenses.pop(expense_index)
        save_data(get_expenses_file(), expenses)
        
        return jsonify(deleted_expense)
    
    # Settlements endpoint
    @app.route('/api/groups/<group_id>/settlements', methods=['GET'])
    def get_settlements(group_id):
        transactions = calculate_settlements(group_id)
        return jsonify(transactions) 