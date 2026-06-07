import numpy as np
import json
from deepface import DeepFace
from PIL import Image
import io
import cv2

# DeepFace model to use — ArcFace is the most accurate
# Other options: "Facenet512", "VGG-Face", "SFace"
MODEL_NAME = "ArcFace"

# Similarity threshold — above this = same person
# ArcFace uses cosine similarity: 1.0 = identical, 0.0 = completely different
SIMILARITY_THRESHOLD = 0.68


def image_bytes_to_numpy(image_bytes: bytes) -> np.ndarray:
    """Convert raw image bytes to numpy array (BGR format for OpenCV)."""
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image_np = np.array(image)
    # DeepFace works with BGR (OpenCV format)
    return cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)


def encode_face_from_bytes(image_bytes: bytes) -> list | None:
    """
    Takes raw image bytes.
    Returns a face embedding (list of 512 floats for ArcFace).
    Returns None if no face detected.
    """
    image_np = image_bytes_to_numpy(image_bytes)

    try:
        # DeepFace.represent() detects the face AND extracts the embedding
        # enforce_detection=True raises an error if no face found
        result = DeepFace.represent(
            img_path=image_np,
            model_name=MODEL_NAME,
            enforce_detection=True,
            detector_backend="opencv"  # fast detector, good for webcam
        )
        # result is a list — take the first face found
        embedding = result[0]["embedding"]  # list of 512 floats
        return embedding

    except ValueError:
        # DeepFace raises ValueError when no face is detected
        return None


def average_encodings(encodings_list: list[list]) -> list:
    """
    Average 4 face embeddings into one.
    Gives a more robust representation than any single photo.
    """
    np_encodings = np.array(encodings_list)
    return np.mean(np_encodings, axis=0).tolist()


def encoding_to_db(encoding: list) -> str:
    """Convert embedding list → JSON string to store in SQLite TEXT column."""
    return json.dumps(encoding)


def db_to_encoding(encoding_str: str) -> np.ndarray:
    """Convert JSON string from DB → numpy array for comparison."""
    return np.array(json.loads(encoding_str))


def cosine_similarity(vec_a: np.ndarray, vec_b: np.ndarray) -> float:
    """
    Cosine similarity between two vectors.
    Returns value from 0.0 (no match) to 1.0 (perfect match).
    """
    dot = np.dot(vec_a, vec_b)
    norm = np.linalg.norm(vec_a) * np.linalg.norm(vec_b)
    if norm == 0:
        return 0.0
    return dot / norm


def find_match(live_encoding: list, all_students: list):
    """
    Compare live face embedding against all stored student embeddings.

    Returns tuple: (matched_student, similarity_score) or (None, 0)
    """
    live_np = np.array(live_encoding)

    best_match = None
    best_similarity = SIMILARITY_THRESHOLD  # only accept above threshold

    for student in all_students:
        if not student.face_encoding:
            continue

        stored_np = db_to_encoding(student.face_encoding)
        similarity = cosine_similarity(live_np, stored_np)

        if similarity > best_similarity:
            best_similarity = similarity
            best_match = student

    return best_match, round(best_similarity, 4)