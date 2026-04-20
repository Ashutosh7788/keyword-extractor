import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from PyPDF2 import PdfReader
from sklearn.feature_extraction.text import TfidfVectorizer
from rake_nltk import Rake
from collections import Counter
import re
import nltk

nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)

app = Flask(__name__)
CORS(app)

def extract_text_from_pdf(pdf_file):
    reader = PdfReader(pdf_file)
    text = ""
    for page in reader.pages:
        if page.extract_text():
            text += page.extract_text() + " "
    return text

def get_tfidf_keywords(text, num=10):
    vectorizer = TfidfVectorizer(stop_words='english', max_features=num)
    try:
        tfidf_matrix = vectorizer.fit_transform([text])
        feature_names = vectorizer.get_feature_names_out()
        scores = tfidf_matrix.toarray()[0]
        keywords = [{"word": word, "score": float(score)} for word, score in zip(feature_names, scores)]
        return sorted(keywords, key=lambda x: x["score"], reverse=True)
    except ValueError:
        return []

def get_rake_keywords(text, num=10):
    r = Rake()
    r.extract_keywords_from_text(text)
    ranked = r.get_ranked_phrases_with_scores()
    keywords = [{"word": phrase, "score": float(score)} for score, phrase in ranked[:num]]
    return keywords

def get_freq_keywords(text, num=10):
    words = re.findall(r'\b[a-z]{3,}\b', text.lower())
    stopwords = set(nltk.corpus.stopwords.words('english'))
    filtered = [w for w in words if w not in stopwords]
    counts = Counter(filtered)
    total = sum(counts.values()) or 1
    keywords = [{"word": word, "score": count / total} for word, count in counts.most_common(num)]
    return keywords

@app.route('/extract', methods=['POST'])
def extract_keywords():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
        
    file = request.files['file']
    if file.filename == '' or not file.filename.endswith('.pdf'):
        return jsonify({"error": "Invalid file. Please upload a PDF."}), 400
        
    method = request.form.get('method', 'tfidf')
    count = int(request.form.get('count', 10))
    
    try:
        text = extract_text_from_pdf(file)
        if not text.strip():
            return jsonify({"error": "No text could be extracted from this PDF. It might be a scanned document."}), 400
            
        if method == 'tfidf':
            keywords = get_tfidf_keywords(text, count)
        elif method == 'rake':
            keywords = get_rake_keywords(text, count)
        elif method == 'freq':
            keywords = get_freq_keywords(text, count)
        else:
            return jsonify({"error": "Unknown extraction method."}), 400
            
        return jsonify({"keywords": keywords})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
