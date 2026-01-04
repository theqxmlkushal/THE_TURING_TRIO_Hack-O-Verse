"""
processor.py
Multimodal processing pipeline:
- extract audio (moviepy)
- sample frames (opencv)
- facial emotion (DeepFace) - optional if installed
- speech->text (whisper) - optional if installed
- audio emotion (transformers pipeline) - optional if installed
- final fusion via OpenAI LLM if OPENAI_API_KEY provided, otherwise a local fusion
"""
import os
import tempfile
import json
import math
from datetime import datetime

# lazy imports: heavy libs are imported only when available
try:
    import cv2
except Exception:
    cv2 = None

try:
    from moviepy.editor import VideoFileClip
except Exception:
    VideoFileClip = None

try:
    from deepface import DeepFace
except Exception:
    DeepFace = None

try:
    import whisper
except Exception:
    whisper = None

try:
    from transformers import pipeline
except Exception:
    pipeline = None

try:
    import openai
except Exception:
    openai = None

import random

# ---------- utility helpers ----------
def safe_round(x, n=3):
    try:
        return round(float(x), n)
    except Exception:
        return x

def sample_frames(video_path, fps=1):
    """
    Yield frames (BGR numpy arrays) sampled at approx. fps (frames per second).
    If cv2 not available, yield empty list.
    """
    if cv2 is None or VideoFileClip is None:
        return []
    frames = []
    clip = VideoFileClip(video_path)
    duration = clip.duration or 0
    # sample times every 1/fps seconds
    step = 1.0 / max(1, fps)
    t = 0.0
    cap = cv2.VideoCapture(video_path)
    while t < duration:
        cap.set(cv2.CAP_PROP_POS_MSEC, int(t * 1000))
        ok, img = cap.read()
        if not ok:
            break
        frames.append(img)
        t += step
    cap.release()
    return frames

# ---------- facial analyzer ----------
def analyze_facial_expressions(video_path, sample_fps=0.5):
    """
    Returns dict: {expressions: {emotion:score}, dominantExpression, confidence}
    Uses DeepFace if available; otherwise returns simulated data.
    """
    # fallback simulation
    if DeepFace is None or cv2 is None:
        # simulated distribution
        expr = {
            'happy': random.random() * 0.4 + 0.1,
            'sad': random.random() * 0.3,
            'angry': random.random() * 0.2,
            'neutral': random.random() * 0.3,
            'surprised': random.random() * 0.2,
            'fearful': random.random() * 0.15
        }
        total = sum(expr.values()) or 1
        expressions = {k: v / total for k, v in expr.items()}
        dominant = max(expressions.items(), key=lambda x: x[1])
        return {
            'expressions': {k: safe_round(v, 3) for k, v in expressions.items()},
            'dominantExpression': dominant[0],
            'confidence': safe_round(dominant[1], 3),
            'sentiment': get_sentiment_from_expression(dominant[0]),
            'note': 'simulated (DeepFace not installed)'
        }

    # real path using DeepFace
    frames = sample_frames(video_path, fps=sample_fps)
    if not frames:
        return {
            'expressions': {},
            'dominantExpression': 'unknown',
            'confidence': 0,
            'sentiment': 'neutral',
            'note': 'no-frames'
        }
    counts = {}
    for img in frames:
        try:
            analysis = DeepFace.analyze(img, actions=['emotion'], enforce_detection=False)
            # DeepFace.analyze returns dict with 'emotion' scores and 'dominant_emotion'
            if isinstance(analysis, list):
                analysis = analysis[0]
            dominant = analysis.get('dominant_emotion')
            # aggregate emotion probabilities if available
            emotions = analysis.get('emotion') or {}
            for k, v in emotions.items():
                counts[k.lower()] = counts.get(k.lower(), 0) + (v or 0)
        except Exception:
            continue
    if counts:
        total = sum(counts.values()) or 1
        normalized = {k: v / total for k, v in counts.items()}
        dominant = max(normalized.items(), key=lambda x: x[1])
        # map back missing keys to our canonical keys
        expressions = {
            'happy': normalized.get('happy', 0),
            'sad': normalized.get('sad', 0),
            'angry': normalized.get('angry', 0),
            'neutral': normalized.get('neutral', 0),
            'surprised': normalized.get('surprised', 0),
            'fearful': normalized.get('fearful', 0)
        }
        return {
            'expressions': {k: safe_round(v, 3) for k, v in expressions.items()},
            'dominantExpression': dominant[0],
            'confidence': safe_round(dominant[1], 3),
            'sentiment': get_sentiment_from_expression(dominant[0]),
            'note': 'deepface'
        }
    else:
        return {
            'expressions': {},
            'dominantExpression': 'unknown',
            'confidence': 0,
            'sentiment': 'neutral',
            'note': 'no-detections'
        }

# ---------- audio extraction & STT ----------
def extract_audio(video_path, out_wav_path):
    """
    Extract audio using moviepy. Returns True on success.
    """
    if VideoFileClip is None:
        return False, 'moviepy not installed'
    try:
        clip = VideoFileClip(video_path)
        if clip.audio is None:
            return False, 'no-audio-stream'
        clip.audio.write_audiofile(out_wav_path, verbose=False, logger=None)
        return True, None
    except Exception as e:
        return False, str(e)

def transcribe_whisper(wav_path, model_name='base'):
    """
    Use openai/whisper (whisper package) if installed. Otherwise simulated text.
    """
    if whisper is None:
        # simulation
        sample_texts = [
            "I'm really excited about this new opportunity and can't wait to get started!",
            "Things have been quite challenging lately, but I'm trying to stay positive.",
            "I'm frustrated with how things are going, nothing seems to work out.",
            "Everything is going well, I feel content with where I am right now.",
            "I'm a bit worried about the future, but hopeful things will improve."
        ]
        return random.choice(sample_texts), 'simulated (whisper missing)'

    try:
        model = whisper.load_model(model_name)
        res = model.transcribe(wav_path)
        text = res.get('text', '')
        return text, 'whisper'
    except Exception as e:
        return '', f'error: {e}'

# ---------- audio emotion ----------
def analyze_audio_emotion(wav_path):
    """
    Use Hugging Face transformers audio-classification pipeline if available.
    If not available, returns a simulated result.
    """
    if pipeline is None:
        # simulation
        candidates = [
            ('happy', 0.6),
            ('neutral', 0.2),
            ('sad', 0.1),
            ('angry', 0.1)
        ]
        label, score = random.choice(candidates)
        return {'label': label, 'score': safe_round(score, 3), 'note': 'simulated (transformers missing)'}
    try:
        # try common SER model; pipeline will download model if needed
        audio_classifier = pipeline("audio-classification", model="superb/wav2vec2-base-superb-er")
        out = audio_classifier(wav_path)
        if isinstance(out, list) and out:
            best = out[0]
            return {'label': best.get('label'), 'score': safe_round(best.get('score', 0), 3), 'note': 'hf-pipeline'}
        return {'label': 'neutral', 'score': 0.0, 'note': 'no-output'}
    except Exception as e:
        return {'label': 'neutral', 'score': 0.0, 'note': f'error: {e}'}

# ---------- fusion (local fallback) ----------
def get_sentiment_from_expression(expression):
    expression = (expression or '').lower()
    positive = ['happy', 'surprised']
    negative = ['sad', 'angry', 'fearful']
    if expression in positive:
        return 'positive'
    if expression in negative:
        return 'negative'
    return 'neutral'

def local_fusion(facial, vocal, text):
    """
    Simple rule-based fusion:
    - convert facial -> -1/0/1, vocal score is in [-1,1] or 0..1 label, text.score in [-1,1]
    - weighted average
    """
    weights = {'facial': 0.3, 'vocal': 0.3, 'text': 0.4}

    f = facial.get('sentiment', 'neutral')
    facial_score = 1 if f == 'positive' else (-1 if f == 'negative' else 0)

    # vocal could be label-based or numeric
    vocal_label = vocal.get('label', '')
    vocal_numeric = vocal.get('score', 0.0)
    # map some labels
    if isinstance(vocal_numeric, (int, float)) and vocal_numeric != 0:
        vocal_score = vocal_numeric if vocal_numeric <= 1 else (vocal_numeric / 10.0)
        # some models use higher positive for happy, negative not used -> remap if label shows negative
        if vocal_label and any(x in vocal_label.lower() for x in ['sad','angry','fear']):
            vocal_score = -abs(vocal_score)
    else:
        # label only
        if vocal_label and 'happy' in vocal_label.lower():
            vocal_score = 0.6
        elif vocal_label and ('sad' in vocal_label.lower() or 'angry' in vocal_label.lower()):
            vocal_score = -0.5
        else:
            vocal_score = 0.0

    # text.score might be numeric or string numeric
    text_score = text.get('score', 0)
    try:
        ts = float(text_score)
    except Exception:
        ts = 0.0
    ts = max(-1.0, min(1.0, ts))

    final_score = facial_score*weights['facial'] + vocal_score*weights['vocal'] + ts*weights['text']

    if final_score > 0.2:
        sentiment = 'positive'
        confidence = min(0.95, 0.6 + abs(final_score)*0.5)
    elif final_score < -0.2:
        sentiment = 'negative'
        confidence = min(0.95, 0.6 + abs(final_score)*0.5)
    else:
        sentiment = 'neutral'
        confidence = max(0.5, 0.7 - abs(final_score))

    return {
        'sentiment': sentiment,
        'score': safe_round(final_score, 3),
        'confidence': safe_round(confidence, 3),
        'breakdown': {
            'facial': {'score': facial_score, 'weight': weights['facial']},
            'vocal': {'score': safe_round(vocal_score, 3), 'weight': weights['vocal']},
            'text': {'score': safe_round(ts, 3), 'weight': weights['text']}
        }
    }

# ---------- parent LLM fusion ----------
def llm_fusion_prompt(transcript, facial, vocal, text_summary):
    prompt = f"""
You are a careful analyst. Please read the following multimodal observations and produce a concise, human-readable final sentiment summary (one paragraph + short label).

Transcript:
{transcript}

Facial (dominant):
- expression: {facial.get('dominantExpression')}
- confidence: {facial.get('confidence')}
- values: {json.dumps(facial.get('expressions', {}), ensure_ascii=False)}

Vocal:
- label: {vocal.get('label')}
- score: {vocal.get('score')}

Text analysis:
- sentiment: {text_summary.get('sentiment')}
- score: {text_summary.get('score')}
- positiveWords: {text_summary.get('positiveWords')}
- negativeWords: {text_summary.get('negativeWords')}

Task: Combine these signals and answer:
1) Overall sentiment (positive / negative / neutral)
2) Short one-sentence summary of likely emotional state (2-3 sentences)
3) Any note if the modalities disagree strongly.

Answer in JSON: {{ "sentiment": "...", "summary": "...", "confidence": 0.85 }}
"""
    return prompt

def llm_fusion(transcript, facial, vocal, text_summary, openai_api_key=None, model="gpt-4"):
    """
    Use OpenAI API if api key provided. Returns dict or falls back to local_fusion.
    """
    if openai is None or not openai_api_key:
        return None, 'openai-not-configured'
    try:
        openai.api_key = openai_api_key
        prompt = llm_fusion_prompt(transcript, facial, vocal, text_summary)
        # Use ChatCompletion / Chat API (this small code uses text-davinci-003 style for simplicity)
        # If your account supports gpt-4 or chat completions, change accordingly.
        resp = openai.ChatCompletion.create(
            model=model,
            messages=[{"role":"system","content":"You are a helpful data-fusion assistant."},
                      {"role":"user","content":prompt}],
            temperature=0.3,
            max_tokens=400
        )
        content = resp['choices'][0]['message']['content']
        # try to parse JSON from content
        import re
        m = re.search(r'\{.*\}', content, flags=re.S)
        if m:
            j = json.loads(m.group(0))
            return j, 'openai'
        # fallback: return the content in a wrapper
        return {'sentiment': 'neutral', 'summary': content, 'confidence': 0.6}, 'openai-raw'
    except Exception as e:
        return None, f'openai-error:{e}'

# ---------- main pipeline entry ----------
def process_file(video_path, tmp_dir=None, openai_api_key=None, whisper_model='base'):
    """
    Top-level: given a video path, run all stages and return a JSON-serializable result.
    """
    tmp_dir = tmp_dir or tempfile.gettempdir()
    base = os.path.basename(video_path)
    name = os.path.splitext(base)[0]
    wav_path = os.path.join(tmp_dir, f"{name}_audio.wav")

    # 1. extract audio
    audio_ok, audio_note = extract_audio(video_path, wav_path)
    audio_info = {'extracted': audio_ok, 'note': audio_note}

    # 2. facial analysis
    facial = analyze_facial_expressions(video_path, sample_fps=0.5)

    # 3. speech->text
    if audio_ok:
        transcript, stt_note = transcribe_whisper(wav_path, model_name=whisper_model)
    else:
        transcript, stt_note = '', 'no-audio'
    text_summary = analyze_text_sentiment_local(transcript)

    # 4. vocal emotion
    if audio_ok:
        vocal = analyze_audio_emotion(wav_path)
    else:
        vocal = {'label': 'neutral', 'score': 0.0, 'note': 'no-audio'}

    # 5. fusion: try LLM if key provided, else local rule-based
    llm_result, llm_note = (None, None)
    if openai_api_key:
        try:
            llm_result, llm_note = llm_fusion(transcript, facial, vocal, text_summary, openai_api_key=openai_api_key)
        except Exception:
            llm_result, llm_note = None, 'llm-failed'
    if llm_result is None:
        fused = local_fusion(facial, vocal, text_summary)
        fusion_note = 'local-fusion'
    else:
        fused = llm_result
        fusion_note = llm_note

    return {
        'facial': facial,
        'vocal': vocal,
        'text': text_summary,
        'final': fused,
        'audio': audio_info,
        'stt_note': stt_note,
        'fusion': fusion_note,
        'timestamp': datetime.now().isoformat()
    }

# ---------- small text sentiment helper (local) ----------
def analyze_text_sentiment_local(text):
    # simple keyword-based analysis (same logic as your earlier version)
    if not text:
        return {'text': text, 'sentiment': 'neutral', 'score': 0.0, 'positiveWords': 0, 'negativeWords': 0, 'confidence': 0.5}
    pos = ['excited','happy','great','wonderful','amazing','love','excellent','good','positive','hopeful']
    neg = ['sad','frustrated','angry','terrible','hate','worried','challenging','difficult','bad','negative']
    words = [w.strip('.,!?:;"()').lower() for w in text.split() if w.strip()]
    pc = sum(1 for w in words if any(p in w for p in pos))
    nc = sum(1 for w in words if any(n in w for n in neg))
    score = (pc - nc) / len(words) if words else 0.0
    sentiment = 'neutral'
    if score > 0.05: sentiment = 'positive'
    elif score < -0.05: sentiment = 'negative'
    return {'text': text, 'sentiment': sentiment, 'score': safe_round(score, 3), 'positiveWords': pc, 'negativeWords': nc, 'confidence': 0.8 if abs(score) > 0.1 else 0.5}