from flask import Flask, render_template, request, jsonify
from werkzeug.utils import secure_filename
import os
import json
import random
from datetime import datetime

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size

# Create uploads folder if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)


class SentimentAnalyzer:
    def __init__(self):
        self.positive_words = [
            'excited', 'happy', 'great', 'wonderful', 'amazing', 'love',
            'excellent', 'good', 'positive', 'hopeful', 'brilliant', 'fantastic'
        ]
        self.negative_words = [
            'sad', 'frustrated', 'angry', 'terrible', 'hate', 'worried',
            'challenging', 'difficult', 'bad', 'negative', 'awful', 'horrible'
        ]

    def normalize_expressions(self, expressions):
        """Normalize facial expression scores to sum to 1"""
        total = sum(expressions.values())
        if total == 0:
            return {k: 0 for k in expressions}
        return {k: v / total for k, v in expressions.items()}

    def analyze_facial_expression(self):
        """Simulate facial expression analysis"""
        raw_expressions = {
            'happy': random.random() * 0.4 + 0.3,
            'sad': random.random() * 0.3,
            'angry': random.random() * 0.2,
            'neutral': random.random() * 0.3,
            'surprised': random.random() * 0.2,
            'fearful': random.random() * 0.15
        }

        expressions = self.normalize_expressions(raw_expressions)
        dominant = max(expressions.items(), key=lambda x: x[1])

        return {
            'expressions': expressions,
            'dominantExpression': dominant[0],
            'confidence': round(dominant[1], 3),
            'sentiment': self.get_sentiment_from_expression(dominant[0])
        }

    def speech_to_text(self):
        """Simulate speech to text conversion"""
        sample_texts = [
            "I'm really excited about this new opportunity and can't wait to get started!",
            "Things have been quite challenging lately, but I'm trying to stay positive.",
            "I'm frustrated with how things are going, nothing seems to work out.",
            "Everything is going well, I feel content with where I am right now.",
            "I'm a bit worried about the future, but hopeful things will improve."
        ]
        return random.choice(sample_texts)

    def analyze_vocal_tone(self):
        """Simulate vocal tone analysis"""
        pitch = random.random() * 100 + 150  # Hz
        energy = random.random()
        tempo = random.random() * 100 + 100  # WPM

        tone_sentiment = 'neutral'
        tone_score = 0

        if pitch > 200 and energy > 0.6:
            tone_sentiment = 'excited/positive'
            tone_score = 0.5 + random.random() * 0.25
        elif pitch < 180 and energy < 0.4:
            tone_sentiment = 'sad/low'
            tone_score = -(0.3 + random.random() * 0.2)
        elif energy > 0.7 and tempo > 150:
            tone_sentiment = 'angry/stressed'
            tone_score = -(0.2 + random.random() * 0.2)
        else:
            tone_sentiment = 'calm/neutral'
            tone_score = (random.random() - 0.5) * 0.2

        # Clamp score to [-1, 1]
        tone_score = max(-1, min(1, tone_score))

        return {
            'pitch': round(pitch, 2),
            'energy': round(energy, 2),
            'tempo': round(tempo, 2),
            'toneSentiment': tone_sentiment,
            'sentimentScore': round(tone_score, 3)
        }

    def analyze_text_sentiment(self, text):
        """Analyze sentiment from text"""
        words = text.lower().split()
        words = [w for w in words if len(w) > 0]

        positive_count = sum(1 for word in words if any(pw in word for pw in self.positive_words))
        negative_count = sum(1 for word in words if any(nw in word for nw in self.negative_words))

        score = (positive_count - negative_count) / len(words) if words else 0
        sentiment = 'neutral'

        if score > 0.05:
            sentiment = 'positive'
        elif score < -0.05:
            sentiment = 'negative'

        return {
            'text': text,
            'sentiment': sentiment,
            'score': round(score, 3),
            'positiveWords': positive_count,
            'negativeWords': negative_count,
            'confidence': 0.8 if abs(score) > 0.1 else 0.5
        }

    def compute_final_sentiment(self, facial_result, vocal_result, text_result):
        """Compute weighted final sentiment"""
        weights = {
            'facial': 0.3,
            'vocal': 0.3,
            'text': 0.4
        }

        facial_score = 1 if facial_result['sentiment'] == 'positive' else (-1 if facial_result['sentiment'] == 'negative' else 0)
        vocal_score = vocal_result['sentimentScore']
        text_score = max(-1, min(1, text_result['score'] * 2))

        final_score = (
            facial_score * weights['facial'] +
            vocal_score * weights['vocal'] +
            text_score * weights['text']
        )

        final_sentiment = 'neutral'
        confidence = 0

        if final_score > 0.2:
            final_sentiment = 'positive'
            confidence = min(0.95, 0.6 + abs(final_score) * 0.5)
        elif final_score < -0.2:
            final_sentiment = 'negative'
            confidence = min(0.95, 0.6 + abs(final_score) * 0.5)
        else:
            final_sentiment = 'neutral'
            confidence = max(0.5, 0.7 - abs(final_score))

        return {
            'sentiment': final_sentiment,
            'score': round(final_score, 3),
            'confidence': round(confidence, 3),
            'breakdown': {
                'facial': {'score': facial_score, 'weight': weights['facial']},
                'vocal': {'score': round(vocal_score, 3), 'weight': weights['vocal']},
                'text': {'score': round(text_score, 3), 'weight': weights['text']}
            }
        }

    def get_sentiment_from_expression(self, expression):
        """Map expression to sentiment"""
        positive = ['happy', 'surprised']
        negative = ['sad', 'angry', 'fearful']

        if expression in positive:
            return 'positive'
        elif expression in negative:
            return 'negative'
        return 'neutral'

    def process_video(self):
        """Process video and return sentiment analysis"""
        facial_result = self.analyze_facial_expression()
        transcribed_text = self.speech_to_text()
        vocal_result = self.analyze_vocal_tone()
        text_result = self.analyze_text_sentiment(transcribed_text)
        final_result = self.compute_final_sentiment(facial_result, vocal_result, text_result)

        return {
            'facial': facial_result,
            'vocal': vocal_result,
            'text': text_result,
            'final': final_result,
            'timestamp': datetime.now().isoformat()
        }


analyzer = SentimentAnalyzer()


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/analyze', methods=['POST'])
def analyze_sentiment():
    """Process uploaded video and return sentiment analysis"""
    try:
        if 'video' not in request.files:
            return jsonify({'error': 'No video file provided'}), 400

        file = request.files['video']
        if file.filename == '':
            return jsonify({'error': 'No video file selected'}), 400

        if not file.filename.lower().endswith(('.mp4', '.webm', '.avi', '.mov')):
            return jsonify({'error': 'Invalid video format'}), 400

        # Save file
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        # Try to use processor.py (real multimodal). If it fails, fall back to simulator.
        try:
            from processor import process_file
            OPENAI_KEY = os.environ.get("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")  # read key from env if set
            results = process_file(filepath, tmp_dir=None, openai_api_key=OPENAI_KEY, whisper_model='base')
        except Exception:
            results = analyzer.process_video()

        return jsonify(results), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'}), 200


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)