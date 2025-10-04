import fastapi
import uvicorn
import os
from pydantic import BaseModel
from google import genai

app = fastapi.FastAPI()

# Get API key from environment variable
api_key = os.getenv("GEMINI_API_KEY", "your_gemini_api_key_here")
if api_key == "your_gemini_api_key_here":
    raise ValueError("Please set GEMINI_API_KEY environment variable with your actual API key")

client = genai.Client(api_key=api_key)

class UserInput(BaseModel):
    content: str

@app.get("/")
def read_root():
    return {"message": "Online"}

@app.post("/")
def generate_content(user_input: UserInput):
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash", contents=user_input.content
        )
        return {"message": response.text}
    except Exception as e:
        return {"error": f"Failed to generate content: {str(e)}"}


def main():
    uvicorn.run(app, host="0.0.0.0", port=8000)


if __name__ == "__main__":
    main()
