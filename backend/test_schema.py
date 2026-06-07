from fastapi import FastAPI, Form, File, UploadFile
from typing import List, Annotated
import json

app = FastAPI()

@app.post("/test1")
def test1(name: str = Form(...), photos: list[UploadFile] = File(...)):
    pass

schema = app.openapi()
print(json.dumps(schema["paths"]["/test1"], indent=2))
print("COMPONENTS:")
print(json.dumps(schema.get("components", {}), indent=2))
