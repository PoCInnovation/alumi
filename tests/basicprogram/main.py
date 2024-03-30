from fastapi import FastAPI

app = FastAPI()


@app.get("/")
async def root():
    return {
        "message": "Hello World (alumi test)",
        "repo": "https://github.com/PoCInnovation/alumi",
        "from": "PoCInnovation"
    }
