from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import io

app = Flask(__name__)
CORS(app)

@app.route('/recommendations/<int:customer_id>', methods=['GET'])
def get_recommendations(customer_id):
    # Mock recommendation algorithm based on user genre preference history[cite: 1]
    recommended_movies = [
        {"movie_id": 1, "title": "Inception", "genre": "Sci-Fi", "score": 0.95},
        {"movie_id": 3, "title": "Interstellar", "genre": "Sci-Fi", "score": 0.88}
    ]
    return jsonify({"customer_id": customer_id, "recommendations": recommended_movies})

@app.route('/generate-ticket-pdf', methods=['POST'])
def generate_ticket_pdf():
    data = request.json
    
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    
    p.drawString(100, 750, f"Ticket Confirmation - Booking #{data.get('booking_id')}")
    p.drawString(100, 730, f"Customer ID: {data.get('customer_id')}")
    p.drawString(100, 710, f"Movie: {data.get('movie_name')}")
    p.drawString(100, 690, f"Theatre: {data.get('theatre_name')}")
    p.drawString(100, 670, f"Seat Number: {data.get('seat_number')}")
    p.drawString(100, 650, f"Price: ${data.get('price')}")
    
    p.showPage()
    p.save()
    
    buffer.seek(0)
    return send_file(buffer, as_attachment=True, download_name=f"ticket_{data.get('booking_id')}.pdf", mimetype='application/pdf')

if __name__ == '__main__':
    app.run(port=5001, debug=True)