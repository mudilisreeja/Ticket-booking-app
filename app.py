from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import datetime

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///ticketbooking.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = 'False',
app.config['JWT_SECRET_KEY'] = 'your-secret-key' 
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(days=1)

# Initialize extensions
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    bookings = db.relationship('Booking', backref='user', lazy=True)

class Booking(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)  # Changed to nullable=True
    starts_from = db.Column(db.String(100), nullable=False)
    destination = db.Column(db.String(100), nullable=False) 
    booking_date = db.Column(db.DateTime, nullable=False, default=datetime.datetime.utcnow)
    travel_date = db.Column(db.DateTime, nullable=False)
    adults = db.Column(db.Integer, nullable=False)
    children = db.Column(db.Integer, nullable=False)
    passengers = db.relationship('Passenger', backref='booking', lazy=True)
    total_price = db.Column(db.Float, nullable=False)

class Passenger(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey('booking.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    is_adult = db.Column(db.Boolean, nullable=False)
    id_number = db.Column(db.String(20), nullable=True)  
    
def validate_passenger(passenger_type, age, id_number):
    if passenger_type.lower() == "adult":
        if not id_number:
            raise ValueError("Adults must provide an ID number.")
    elif passenger_type.lower() == "kid":
        if age >= 5 and not id_number:
            raise ValueError("Kids 5 years and older must provide an ID number.")

# Routes
@app.route('/')
def home():
    return "Welcome to Ticket Booking APP!"

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Check if user already exists
    existing_user = User.query.filter_by(email=data['email']).first()
    if existing_user:
        return jsonify({"message": "Email already registered"}), 400
    
    # Hash password
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    
    # Create new user
    new_user = User(
        username=data['username'],
        email=data['email'],
        password=hashed_password
    )
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({"message": "Registration successful"}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not bcrypt.check_password_hash(user.password, data['password']):
        return jsonify({"message": "Invalid credentials"}), 401
    
    access_token = create_access_token(identity=user.id)
    return jsonify({"token": access_token, "user_id": user.id, "username": user.username}), 200

@app.route('/api/bookings', methods=['POST'])
def create_booking():
    data = request.get_json()
    
    # Create booking without user association
    new_booking = Booking(
        user_id=None,  # No user association
        destination=data['destination'],
        starts_from=data['startsFrom'],  # New field
        travel_date=datetime.datetime.strptime(data['travelDate'], '%Y-%m-%d'),
        adults=data['adults'],
        children=data['children'],
        total_price=data['totalPrice']
    )
    
    db.session.add(new_booking)
    db.session.commit()
    
    # Add passengers
    for passenger in data['passengers']:
        new_passenger = Passenger(
            booking_id=new_booking.id,
            name=passenger['name'],
            age=passenger['age'],
            is_adult=passenger['isAdult'],
            id_number=passenger.get('idNumber')  
        )
        db.session.add(new_passenger)
    
    db.session.commit()
    
    return jsonify({"message": "Booking created successfully", "booking_id": new_booking.id}), 201

@app.route('/api/bookings', methods=['GET'])
def get_bookings():
    bookings = Booking.query.all()
    
    result = []
    for booking in bookings:
        passengers = []
        for passenger in booking.passengers:
            passenger_data = {
                "name": passenger.name,
                "age": passenger.age,
                "isAdult": passenger.is_adult
            }
            if passenger.is_adult:
                passenger_data["idNumber"] = passenger.id_number
            passengers.append(passenger_data)
            
        result.append({
            "id": booking.id,
            "startsFrom": booking.starts_from,
            "destination": booking.destination,
            "bookingDate": booking.booking_date.strftime('%Y-%m-%d'),
            "travelDate": booking.travel_date.strftime('%Y-%m-%d'),
            "adults": booking.adults,
            "children": booking.children,
            "passengers": passengers,
            "totalPrice": booking.total_price
        })
    
    return jsonify(result), 200

if __name__ == '__main__':
    with app.app_context():
        db.drop_all() 
        db.create_all()
    app.run(debug=True)